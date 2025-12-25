# 후추 패밀리 앱 – 데이터베이스 상세 스키마

## 1. 요구사항 요약
- **인증/권한**: 가족 초대 기반 가입, 이메일+비밀번호, 관리자 1명, 일반 사용자 다수.
- **콘텐츠**: 이미지/영상 포스트, 캡션, 업로드 상태, 썸네일/원본 경로, 용량 제한.
- **피드 상호작용**: 좋아요, 댓글(이모지 포함), 수정/삭제, 실시간 반영.
- **추억 필터**: 연도별, 미디어 타입별 필터, 랜덤 콘텐츠("오늘의 후추").
- **안전성**: 비공개 앱, 외부 공유 차단, HTTPS, JWT, S3+CloudFront 스토리지.

## 2. 엔터티 정의
### 2.1 User
| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | UUID | PK |
| name | varchar(80) | 실명 또는 닉네임 |
| email | citext | unique, 로그인 ID |
| role | enum(`ADMIN`,`MEMBER`) | 권한 |
| passwordHash | varchar(255) | Argon2 등으로 해싱 |
| avatarUrl | text? | 선택, S3 경로 |
| createdAt | timestamptz | 기본 now |
| updatedAt | timestamptz | 수정 추적 |
| lastLoginAt | timestamptz | 보안 모니터링 |

### 2.2 Invitation
| 필드 | 타입 | 설명 |
| id | UUID | PK |
| code | varchar(32) | unique, 초대 코드 |
| email | citext | 초대 대상(선택) |
| role | enum | 기본 MEMBER |
| expiresAt | timestamptz | 만료일 |
| createdBy | UUID | FK -> User(id) |
| acceptedUserId | UUID | FK -> User(id), null 허용 |
| createdAt | timestamptz | |

### 2.3 Post
| 필드 | 타입 | 설명 |
| id | UUID | PK |
| type | enum(`IMAGE`,`VIDEO`) | 미디어 구분 |
| caption | text | 500자 제한 |
| authorId | UUID | FK -> User |
| mediaId | UUID | FK -> MediaAsset |
| likeCount | int | 캐싱용 |
| commentCount | int | 캐싱용 |
| isPublished | boolean | 승인/숨김 |
| createdAt | timestamptz | |
| updatedAt | timestamptz | |

### 2.4 MediaAsset
| 필드 | 타입 | 설명 |
| id | UUID | PK |
| originalUrl | text | S3 경로 |
| thumbnailUrl | text | 이미지/영상 공통 썸네일 |
| durationMs | int | 영상 전용, null 허용 |
| byteSize | bigint | 업로드 용량 제한 체크 |
| width | int | |
| height | int | |
| storageProvider | enum(`AWS_S3`) | 확장 대비 |
| status | enum(`PROCESSING`,`READY`,`FAILED`) | 썸네일/트랜스코딩 상태 |
| createdAt | timestamptz | |

### 2.5 Comment
| 필드 | 타입 | 설명 |
| id | UUID | PK |
| postId | UUID | FK -> Post |
| authorId | UUID | FK -> User |
| content | text | 이모지 포함, 1,000자 이하 |
| editedAt | timestamptz | 수정 시각 |
| createdAt | timestamptz | |
| deletedAt | timestamptz | soft delete, null 기본 |

### 2.6 Like
| 필드 | 타입 | 설명 |
| id | UUID | PK |
| postId | UUID | FK -> Post |
| userId | UUID | FK -> User |
| createdAt | timestamptz | |
- `(postId, userId)` unique index로 중복 방지.

### 2.7 ActivityLog (선택)
| 필드 | 타입 | 설명 |
| id | UUID | PK |
| type | enum(`LOGIN`,`UPLOAD`,`COMMENT`,`LIKE`,`INVITE`) | 감사 추적 |
| actorId | UUID | FK -> User |
| targetId | UUID | 관련 엔터티 id 저장 |
| metadata | jsonb | 세부 정보 |
| createdAt | timestamptz | |

## 3. 관계 및 제약
- User (1) — (N) Post/Comment/Like: FK on delete cascade? => `ON DELETE CASCADE`는 실제 사용자 삭제 시 데이터 소실 우려, 대신 soft delete 권장. FK는 `ON DELETE RESTRICT` + 서비스 레벨에서 비활성화 처리.
- Post — MediaAsset: 1:1, Post 생성 시 MediaAsset 먼저 생성 후 참조. MediaAsset 삭제 시 Post 유지 불가하므로 `ON DELETE RESTRICT`.
- Post — Comment: `ON DELETE CASCADE` (post 삭제 시 댓글 함께 제거).
- Post — Like: `ON DELETE CASCADE`.
- Invitation — User: `acceptedUserId`는 null 허용, 초대 수락 시 채움.
- 모든 타임스탬프는 `timestamptz` 사용해 타임존 안전성 확보.

## 4. 인덱스 / 성능 고려
- `Post(createdAt DESC)` + `WHERE isPublished = true` 파셜 인덱스로 최신순/무한 스크롤 최적화.
- 추억 필터용 복합 인덱스: `(EXTRACT(YEAR FROM createdAt), type)` 또는 `createdAt` + `type`. PostgreSQL에서 generated column(`year int GENERATED ALWAYS AS`) 고려.
- Comment 실시간 정렬: `postId, createdAt` 인덱스.
- Like 토글: unique index on `(postId, userId)`.
- Invitation code 조회: unique index on `code`.
- MediaAsset status 모니터링: `status` 파셜 인덱스(`status = 'PROCESSING'`)로 워커가 빠르게 조회.

스토리지/네트워크 메모:
- S3 버킷 정책으로 signed URL만 허용, CloudFront 배포로 CDN 캐싱.
- 영상은 업로드 후 트랜스코딩 Lambda(or MediaConvert) 처리 → `status` 필드 업데이트.

## 5. Prisma 모델 스케치
```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  role         Role     @default(MEMBER)
  passwordHash String
  avatarUrl    String?
  posts        Post[]
  comments     Comment[]
  likes        Like[]
  invitations  Invitation[] @relation("CreatorInvites")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Role {
  ADMIN
  MEMBER
}

model Post {
  id            String      @id @default(uuid())
  type          MediaType
  caption       String?
  author        User        @relation(fields: [authorId], references: [id])
  authorId      String
  media         MediaAsset  @relation(fields: [mediaId], references: [id])
  mediaId       String
  comments      Comment[]
  likes         Like[]
  likeCount     Int         @default(0)
  commentCount  Int         @default(0)
  isPublished   Boolean     @default(true)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum MediaType {
  IMAGE
  VIDEO
}
```
(이하 Comment, Like, MediaAsset, Invitation 등 동일 패턴으로 정의 가능)

## 6. 검토 사항
- 소프트 삭제가 필요한 엔터티(Post/Comment)에는 `deletedAt` 추가 고려.
- 동시 좋아요/댓글 수 반영을 위해 DB level `CHECK`(음수 불가) 및 API에서 Optimistic Lock 대비.
- 향후 "후추 일기" 등 추가 엔터티가 필요하므로 `ActivityLog` or `DiaryEntry` 확장이 용이한 구조 유지.
