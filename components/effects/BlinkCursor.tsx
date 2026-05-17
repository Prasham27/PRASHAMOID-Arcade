import { cn } from '@/lib/cn';

export interface BlinkCursorProps {
  className?: string;
  char?: string;
}

export function BlinkCursor({ className, char = '▮' }: BlinkCursorProps) {
  return (
    <span aria-hidden className={cn('animate-blink font-pixel', className)}>
      {char}
    </span>
  );
}
