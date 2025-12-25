import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class BootstrapAdminDto {
    @IsNotEmpty({ message: '이름은 필수입니다.' })
    name: string;

    @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
    email: string;

    @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
    password: string;
}
