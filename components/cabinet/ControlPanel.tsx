import { cn } from '@/lib/cn';

export interface ControlPanelProps {
  color: 'pink' | 'cyan' | 'yellow' | 'green';
  className?: string;
}

const buttonColor = {
  pink: 'bg-pink',
  cyan: 'bg-cyan',
  yellow: 'bg-yellow',
  green: 'bg-green',
};

/** Joystick + 2 buttons + coin slot, drawn in pure CSS. */
export function ControlPanel({ color, className }: ControlPanelProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-around border-2 border-border bg-bg-2 px-4 py-3',
        className,
      )}
    >
      {/* Joystick */}
      <div className="flex flex-col items-center gap-1">
        <div
          className={cn('h-6 w-2 rounded-sm', buttonColor[color])}
          aria-hidden
        />
        <div
          className="h-3 w-7 rounded-full bg-border"
          aria-hidden
        />
      </div>
      {/* Buttons */}
      <div className="flex items-center gap-2">
        <div
          className={cn('h-5 w-5 rounded-full', buttonColor[color])}
          style={{ boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.4)' }}
          aria-hidden
        />
        <div
          className="h-5 w-5 rounded-full bg-yellow"
          style={{ boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.4)' }}
          aria-hidden
        />
      </div>
      {/* Coin slot */}
      <div
        className="flex h-6 w-3 flex-col items-center justify-center rounded-sm bg-border"
        aria-hidden
      >
        <div className="h-[2px] w-2 bg-bg" />
      </div>
    </div>
  );
}
