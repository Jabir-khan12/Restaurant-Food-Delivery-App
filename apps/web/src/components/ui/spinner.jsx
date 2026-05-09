import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';


export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return <Loader2 className={cn('animate-spin text-muted-foreground', sizes[size], className)} />;
}

export function PageSpinner() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
