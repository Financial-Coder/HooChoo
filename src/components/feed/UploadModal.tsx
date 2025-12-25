'use client';

import { useState, useRef } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [caption, setCaption] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (selectedFile: File) => {
        // 파일 타입 검증
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const validVideoTypes = ['video/mp4', 'video/quicktime'];

        if (![...validImageTypes, ...validVideoTypes].includes(selectedFile.type)) {
            setError('지원되지 않는 파일 형식입니다. (JPG, PNG, GIF, WEBP, MP4, MOV만 가능)');
            return;
        }

        // 파일 크기 검증 (이미지: 10MB, 동영상: 100MB)
        const isVideo = validVideoTypes.includes(selectedFile.type);
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            setError(isVideo ? '동영상 크기는 100MB를 초과할 수 없습니다.' : '이미지 크기는 10MB를 초과할 수 없습니다.');
            return;
        }

        setError('');
        setFile(selectedFile);

        // 미리보기 생성
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('caption', caption);
            formData.append('type', file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO');

            await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // 성공
            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.message || '업로드 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreview('');
        setCaption('');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-foreground">새 포스트 업로드</h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                            disabled={isUploading}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* 파일 선택 영역 */}
                    {!file ? (
                        <div
                            className={`
                border-2 border-dashed rounded-2xl p-12 text-center transition-colors
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
                            onDrop={handleDrop}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                    <Upload className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-foreground mb-2">
                                        파일을 드래그하거나 클릭하여 선택
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        JPG, PNG, GIF, WEBP (최대 10MB) / MP4, MOV (최대 100MB)
                                    </p>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={() => fileInputRef.current?.click()}
                                    type="button"
                                >
                                    <ImageIcon className="w-5 h-5 mr-2" />
                                    파일 선택
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
                                    onChange={(e) => {
                                        const selectedFile = e.target.files?.[0];
                                        if (selectedFile) handleFileSelect(selectedFile);
                                    }}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* 미리보기 */}
                            <div className="relative rounded-2xl overflow-hidden bg-muted">
                                {preview && file && file.type.startsWith('image/') && (
                                    <img src={preview} alt="Preview" className="w-full h-auto max-h-96 object-contain" />
                                )}
                                {preview && file && file.type.startsWith('video/') && (
                                    <video src={preview} controls className="w-full h-auto max-h-96" />
                                )}
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setPreview('');
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                                    disabled={isUploading}
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* 캡션 */}
                            <Input
                                label="캡션"
                                placeholder="후추의 소중한 순간을 설명해주세요..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                disabled={isUploading}
                                helperText={`${caption.length}/500`}
                                maxLength={500}
                            />

                            {/* 에러 */}
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* 버튼 */}
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={handleClose}
                                    disabled={isUploading}
                                    className="flex-1"
                                >
                                    취소
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleUpload}
                                    isLoading={isUploading}
                                    disabled={!file}
                                    className="flex-1"
                                >
                                    업로드
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
