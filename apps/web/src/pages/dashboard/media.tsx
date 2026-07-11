import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Grid3X3,
  List,
  Image,
  FileType,
  Video,
  FileAudio,
  Download,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useMedia, useDeleteMedia, useMediaUpload, useDebounce } from '@/hooks';
import { Card, Badge, Button, Skeleton, toast } from '@lumora/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@lumora/ui';
import { ErrorBoundary } from '@/components/error-boundary';
import { UploadDropzone } from '@/components/upload-dropzone';
import type { MediaFile } from '@lumora/shared';

function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size < 10 ? size.toFixed(1) : Math.round(size)} ${units[unitIndex]}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const typeConfig: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline';
    icon: typeof Image;
    gradient: string;
  }
> = {
  IMAGE: {
    label: 'Image',
    variant: 'default',
    icon: Image,
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  VIDEO: {
    label: 'Video',
    variant: 'secondary',
    icon: Video,
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  DOCUMENT: {
    label: 'Document',
    variant: 'outline',
    icon: FileType,
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  AUDIO: {
    label: 'Audio',
    variant: 'secondary',
    icon: FileAudio,
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function MediaContent() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useMedia({
    page,
    search: debouncedSearch || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });
  const { progress, isUploading, upload } = useMediaUpload();
  const deleteMutation = useDeleteMedia();

  const mediaItems = data?.media ?? [];

  const handleUpload = useCallback(
    async (file: File) => {
      const ok = await upload(file);
      if (ok) {
        toast({ title: 'File uploaded', variant: 'success' });
        setPage(1);
      } else {
        toast({ title: 'Upload failed', variant: 'destructive' });
      }
    },
    [upload],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id });
      setDeleteTarget(null);
      toast({ title: 'File deleted', variant: 'success' });
    } catch {
      toast({ title: 'Failed to delete file', variant: 'destructive' });
    }
  }, [deleteTarget, deleteMutation]);

  if (isLoading) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="glass-card overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-error mx-auto h-12 w-12" />
          <h2 className="text-text-primary mt-4 text-lg font-semibold">Failed to load media</h2>
          <p className="text-text-secondary mt-2 text-sm">There was an error fetching your media files.</p>
          <Button onClick={() => refetch()} className="mt-6 gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text-primary text-2xl font-semibold">Media</h1>
          <p className="text-text-secondary mt-1 text-sm">Upload and manage your media files.</p>
        </div>
      </div>

      <UploadDropzone onUpload={handleUpload} isUploading={isUploading} progress={progress} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="text-text-tertiary pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="border-border-secondary bg-surface-secondary text-text-primary placeholder-text-tertiary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-1"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border-border-secondary bg-surface-secondary text-text-primary rounded-xl border px-3 py-2 text-sm outline-none"
          >
            <option value="all">All Types</option>
            <option value="IMAGE">Images</option>
            <option value="VIDEO">Videos</option>
            <option value="DOCUMENT">Documents</option>
            <option value="AUDIO">Audio</option>
          </select>
        </div>

        <div className="bg-surface-secondary flex gap-1 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-lg p-2 transition-all ${
              viewMode === 'grid'
                ? 'bg-surface-primary text-text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg p-2 transition-all ${
              viewMode === 'list'
                ? 'bg-surface-primary text-text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="text-text-tertiary text-xs">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {viewMode === 'grid' ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {mediaItems.map((media) => {
            const config = typeConfig[media.type] || typeConfig.DOCUMENT;
            const Icon = config.icon;
            return (
              <motion.div key={media.id} variants={item}>
                <Card className="glass-card group overflow-hidden">
                  <div className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${config.gradient}`}>
                    <Icon className="h-10 w-10 text-white/40" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-text-primary truncate text-sm font-medium">{media.name}</p>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <div className="text-text-tertiary mt-2 flex items-center justify-between text-xs">
                      <span>{formatSize(media.size)}</span>
                      <span>{formatDate(media.createdAt)}</span>
                    </div>
                    <div className="border-border-secondary mt-3 flex items-center gap-2 border-t pt-3 opacity-0 transition-all group-hover:opacity-100">
                      <button
                        onClick={() => window.open(media.url, '_blank')}
                        className="text-text-tertiary hover:text-text-primary hover:bg-surface-secondary rounded-lg p-1.5 transition-all"
                        aria-label={`Download ${media.name}`}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(media)}
                        className="text-text-tertiary hover:text-error hover:bg-error/10 rounded-lg p-1.5 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <Card className="glass-card overflow-hidden">
          <div className="divide-border-secondary divide-y">
            {mediaItems.map((media) => {
              const config = typeConfig[media.type] || typeConfig.DOCUMENT;
              const Icon = config.icon;
              return (
                <div
                  key={media.id}
                  className="hover:bg-surface-secondary/50 flex items-center gap-4 px-5 py-3.5 transition-colors"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient}`}
                  >
                    <Icon className="h-5 w-5 text-white/50" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary truncate text-sm font-medium">{media.name}</p>
                    <p className="text-text-tertiary text-xs">
                      {formatSize(media.size)} &middot; {formatDate(media.createdAt)}
                    </p>
                  </div>
                  <Badge variant={config.variant}>{config.label}</Badge>
                  <button
                    onClick={() => window.open(media.url, '_blank')}
                    className="text-text-tertiary hover:text-text-primary hover:bg-surface-secondary rounded-lg p-1.5 transition-all"
                    aria-label={`Download ${media.name}`}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(media)}
                    className="text-text-tertiary hover:text-error hover:bg-error/10 rounded-lg p-1.5 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {mediaItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Image className="text-text-tertiary/50 mb-3 h-12 w-12" />
          <p className="text-text-tertiary text-sm">No media files found</p>
          <p className="text-text-tertiary/60 mt-1 text-xs">Upload a file to get started.</p>
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending} className="gap-2">
              {deleteMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default function MediaPage() {
  return (
    <ErrorBoundary>
      <MediaContent />
    </ErrorBoundary>
  );
}
