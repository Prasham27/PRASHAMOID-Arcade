'use client';

import { useAchievementBus } from '@/components/konami/achievementBus';
import { AchievementToast } from './AchievementToast';

/** Mounted once in root layout. Reads from achievementBus zustand store
 *  and renders top-right stack of toasts.
 */
export function AchievementToaster() {
  const queue = useAchievementBus((s) => s.queue);
  const shift = useAchievementBus((s) => s.shift);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[9990] flex flex-col gap-3">
      {queue.map((a) => (
        <AchievementToast key={a.id} achievement={a} onDismiss={shift} />
      ))}
    </div>
  );
}
