"use client";

interface PlayerSeat {
  position: string;
  stack: number;
  action?: string;
}

interface PokerTableProps {
  heroPosition: string;
  villainPositions: PlayerSeat[];
  buttonPosition: string;
  blinds: { small: number; big: number };
  heroStack: number;
  pot?: number;
  random?: number;
}

const POSITION_ANGLES: Record<string, number> = {
  UTG: 270,
  MP: 315,
  CO: 0,
  BTN: 45,
  SB: 90,
  BB: 180,
};

export function PokerTable({
  heroPosition,
  villainPositions,
  buttonPosition,
  blinds,
  heroStack,
  pot,
  random,
}: PokerTableProps) {
  const allSeats = [
    { position: heroPosition, stack: heroStack, isHero: true },
    ...villainPositions.map((v) => ({ ...v, isHero: false })),
  ];

  const getSeatPosition = (position: string) => {
    const angle = POSITION_ANGLES[position] ?? 0;
    const radiusX = 42;
    const radiusY = 36;
    const centerX = 50;
    const centerY = 50;

    const rad = (angle * Math.PI) / 180;
    const x = centerX + radiusX * Math.cos(rad);
    const y = centerY + radiusY * Math.sin(rad);

    return { x, y };
  };

  return (
    <div className="relative w-full max-w-xl mx-auto aspect-[4/3]">
      {/* Table felt - oval with radial gradient */}
      <div
        className="absolute inset-4 rounded-[50%] poker-table-felt"
        style={{
          background:
            "radial-gradient(ellipse at center, #1a6b30 0%, #0d4420 60%, #092e16 100%)",
        }}
      />

      {/* Dark wood rail border */}
      <div
        className="absolute inset-0 rounded-[50%] pointer-events-none"
        style={{
          border: "10px solid #3d2b1a",
          boxShadow:
            "inset 0 2px 8px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
        }}
      />

      {/* Blinds display */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-card px-4 py-1.5 rounded-full border border-border text-sm font-mono text-foreground shadow-lg z-10">
        {blinds.small}/{blinds.big}
      </div>

      {/* Pot display */}
      {pot !== undefined && pot > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/90 px-4 py-1.5 rounded-full border border-border text-sm font-mono text-foreground shadow-lg z-10">
          Pot: {pot}
        </div>
      )}

      {/* Random number display */}
      {random !== undefined && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 bg-card px-4 py-1.5 rounded-full border border-border text-sm font-mono text-foreground shadow-lg z-10">
          <span className="mr-1">🎲</span>
          {random}
        </div>
      )}

      {/* Seats */}
      {allSeats.map((seat) => {
        const pos = getSeatPosition(seat.position);
        const isButton = seat.position === buttonPosition;

        return (
          <div
            key={seat.position}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
            }}
          >
            {/* Button indicator */}
            {isButton && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-gray-400 shadow-md z-30" />
            )}

            {/* Seat container */}
            <div
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                ${
                  seat.isHero
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground border border-border"
                }
                shadow-lg
              `}
            >
              <div className="text-xs font-bold">{seat.position}</div>
              <div className="text-xs font-mono">{seat.stack}bb</div>
              {seat.action && (
                <div className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {seat.action}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
