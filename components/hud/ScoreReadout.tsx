import { cn } from '@/lib/cn';

export interface ScoreReadoutProps {
  label: string;
  value: number | string;
  /** When true, the value text pulses (e.g., new high score) */
  flash?: boolean;
  color?: 'pink' | 'cyan' | 'yellow' | 'green';
  className?: string;
}

const colorClasses: Record<NonNullable<ScoreReadoutProps['color']>, string> = {
  pink: 'text-pink phosphor-pink',
  cyan: 'text-cyan phosphor-cyan',
  yellow: 'text-yellow phosphor-yellow',
  green: 'text-green phosphor-green',
};

export function ScoreReadout({
  label,
  value,
  flash = false,
  color = 'yellow',
  className,
}: ScoreReadoutProps) {
  const display = typeof value === 'number' ? padScore(value) : value;
  return (
    <div className={cn('font-pixel leading-tight', className)}>
      <div className="text-[10px] tracking-widest text-text-muted">
        {label.toUpperCase()} //
      </div>
      <div
        className={cn(
          'mt-1 text-2xl',
          colorClasses[color],
          flash && 'animate-pulse',
        )}
      >
        {display}
      </div>
    </div>
  );
}

function padScore(n: number, digits = 7): string {
  return Math.max(0, Math.floor(n))
    .toString()
    .padStart(digits, '0');
}
