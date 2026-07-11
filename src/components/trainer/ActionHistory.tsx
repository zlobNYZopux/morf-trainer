"use client";

interface Action {
  player: string;
  action: string;
  amount?: number;
}

interface ActionHistoryProps {
  actions: Action[];
}

export function ActionHistory({ actions }: ActionHistoryProps) {
  if (actions.length === 0) {
    return (
      <div className="text-sm text-[var(--text-secondary)] italic">
        No actions yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-bold text-[var(--text-primary)] mb-1">
        Action History
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-secondary)] text-sm"
          >
            <span className="font-bold text-[var(--text-primary)]">
              {action.player}
            </span>
            <span className="text-[var(--text-secondary)]">:</span>
            <span className="text-[var(--accent-primary)]">{action.action}</span>
            {action.amount !== undefined && (
              <span className="font-mono text-[var(--text-secondary)]">
                {action.amount}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}