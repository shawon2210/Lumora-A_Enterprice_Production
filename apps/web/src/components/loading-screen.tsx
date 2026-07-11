export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div
      className="bg-surface-primary flex min-h-screen items-center justify-center"
      role="status"
      aria-label={message}
    >
      <div className="text-center">
        <div className="flex justify-center">
          <div className="border-primary-500 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
        <p className="text-text-secondary mt-4 text-sm">{message}</p>
      </div>
    </div>
  );
}
