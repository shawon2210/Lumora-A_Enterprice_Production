import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UploadState {
  progress: number;
  isUploading: boolean;
  error: string | null;
}

export function useMediaUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: 0,
    isUploading: false,
    error: null,
  });
  const queryClient = useQueryClient();

  const upload = useCallback(
    async (file: File) => {
      setUploadState({ progress: 0, isUploading: true, error: null });

      const formData = new FormData();
      formData.append('file', file);

      try {
        const token = localStorage.getItem('lumora_access_token');
        const xhr = new XMLHttpRequest();

        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setUploadState((prev) => ({
                ...prev,
                progress: Math.round((e.loaded / e.total) * 100),
              }));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error('Upload failed'));
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Upload failed')));
          xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

          xhr.open('POST', `${import.meta.env.VITE_API_URL || '/api/v1'}/media/upload`);
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(formData);
        });

        queryClient.invalidateQueries({ queryKey: ['media'] });
        setUploadState({ progress: 100, isUploading: false, error: null });
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setUploadState({ progress: 0, isUploading: false, error: message });
        return false;
      }
    },
    [queryClient],
  );

  const reset = useCallback(() => {
    setUploadState({ progress: 0, isUploading: false, error: null });
  }, []);

  return { ...uploadState, upload, reset };
}
