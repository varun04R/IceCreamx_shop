import { Loader2 } from 'lucide-react';

export function Loader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Loading…</span>
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader />
    </div>
  );
}
