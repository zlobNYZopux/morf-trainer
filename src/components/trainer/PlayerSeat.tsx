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
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-gray-400 shadow-md z-10" />
      )}

      {/* Seat container */}
      <div
        className={`
          flex flex-col items-center gap-1 px-3 py-2 rounded-lg shadow-lg
          ${
            isHero
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground border border-border"
          }
          ${isActive ? "ring-2 ring-success" : ""}
        `}
      >
        <div className="text-xs font-bold">{position}</div>
        <div className="text-xs font-mono">{stack}bb</div>
        {action && (
          <div className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
