"use client";

interface PlayerSeatProps {
  position: string;
  stack: number;
  isHero: boolean;
  isActive: boolean;
  action?: string;
  isButton: boolean;
}

export function PlayerSeat({
  position,
  stack,
  isHero,
  isActive,
  action,
  isButton,
}: PlayerSeatProps) {
  return (
    <div className="relative flex flex-col items-center gap-1">
      {/* Button indicator */}
      {isButton && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border border-gray-300" />
      )}
      
      {/* Seat container */}
      <div
        className={`
          flex flex-col items-center gap-1 px-3 py-2 rounded-lg
          ${isHero 
            ? "bg-[var(--accent-primary)] text-white" 
            : "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
          }
          ${isActive ? "ring-2 ring-[var(--accent-secondary)]" : ""}
        `}
      >
        <div className="text-xs font-bold">{position}</div>
        <div className="text-xs font-mono">{stack}bb</div>
        {action && (
          <div className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-secondary)]">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}