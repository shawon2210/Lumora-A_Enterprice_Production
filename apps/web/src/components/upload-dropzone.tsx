import { useState, useCallback, useRef, type DragEvent } from 'react';
import { Upload } from 'lucide-react';

interface UploadDropzoneProps {
  onUpload: (file: File) => void;
  isUploading?: boolean;
  progress?: number;
  accept?: string;
}

export function UploadDropzone({
  onUpload,
  isUploading,
  progress = 0,
  accept = 'image/*,video/*',
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload],
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
        isDragging
          ? 'border-primary-500 bg-primary-500/5'
          : 'border-border-secondary hover:border-primary-500/30 hover:bg-surface-secondary'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
      />

      {isUploading ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="border-primary-500 h-12 w-12 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
          <p className="text-text-primary text-sm font-medium">Uploading...</p>
          <div className="bg-surface-secondary mx-auto h-2 w-full max-w-xs rounded-full">
            <div
              className="bg-primary-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-text-tertiary text-xs">{progress}%</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary-500/10 rounded-xl p-3">
              <Upload className="text-primary-400 h-6 w-6" />
            </div>
          </div>
          <div>
            <p className="text-text-primary text-sm font-medium">
              {isDragging ? 'Drop your file here' : 'Drag & drop files here'}
            </p>
            <p className="text-text-tertiary mt-1 text-xs">
              or click to browse — supports images, videos, and documents
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
