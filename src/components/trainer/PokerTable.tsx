"use client";

interface PlayerSeat {
  position: string;
  stack: number;
  action?: string;
  folded?: boolean;
}

interface PokerTableProps {
  heroPosition: string;
  villainPositions: PlayerSeat[];
  buttonPosition: string;
  blinds: { small: number; big: number };
  heroStack: number;
  heroAction?: string;
  pot?: number;
  random?: number;
}

// 6-max positions around oval (angles in degrees, 0=right, 90=bottom)
const SEAT_POSITIONS: Record<string, { angle: number; label: string }> = {
  UTG: { angle: 210, label: "UTG" },
  MP: { angle: 150, label: "MP" },
  CO: { angle: 90, label: "CO" },
  BTN: { angle: 30, label: "BTN" },
  SB: { angle: 330, label: "SB" },
  BB: { angle: 270, label: "BB" },
};

export function PokerTable({
  heroPosition,
  villainPositions,
  buttonPosition,
  blinds,
  heroStack,
  heroAction,
  pot,
  random,
}: PokerTableProps) {
  const getSeatCoords = (position: string) => {
    const seat = SEAT_POSITIONS[position];
    if (!seat) return { x: 50, y: 50 };
    const rad = (seat.angle * Math.PI) / 180;
    const rx = 44;
    const ry = 38;
    return {
      x: 50 + rx * Math.cos(rad),
      y: 50 + ry * Math.sin(rad),
    };
  };

  // Build all 6 seats
  const allSeats: Array<{
    position: string;
    stack: number;
    isHero: boolean;
    action?: string;
    folded?: boolean;
  }> = [
    {
      position: heroPosition,
      stack: heroStack,
      isHero: true,
      action: heroAction,
    },
    ...villainPositions.map((v) => ({
      ...v,
      isHero: false,
    })),
  ];

  return (
    <div className="relative w-full h-full min-h-[380px]">
      {/* Table felt */}
      <div
        className="absolute rounded-[50%]"
        style={{
          inset: "24px",
          background:
            "radial-gradient(ellipse at center, #1a6b30 0%, #0d4420 50%, #092e16 100%)",
        }}
      />

      {/* Wood rail */}
      <div
        className="absolute rounded-[50%] pointer-events-none"
        style={{
          inset: "12px",
          border: "12px solid #3d2b1a",
          boxShadow:
            "inset 0 4px 16px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)",
        }}
      />

      {/* Inner felt border */}
      <div
        className="absolute rounded-[50%] pointer-events-none"
        style={{
          inset: "36px",
          border: "2px solid rgba(255,255,255,0.08)",
        }}
      />

      {/* Blinds */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-[#1a1d27] px-3 py-1 rounded-full border border-[#242836] text-xs font-mono text-[#94a3b8]">
        {blinds.small}/{blinds.big}
      </div>

      {/* Pot */}
      {pot !== undefined && pot > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-[#1a1d27]/90 px-3 py-1 rounded-full border border-[#e8834A]/30 text-xs font-mono text-[#e8834A]">
          Pot: {pot}
        </div>
      )}

      {/* RNG */}
      {random !== undefined && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-[#1a1d27] px-3 py-1 rounded-full border border-[#242836] text-xs font-mono text-[#94a3b8]">
          🎲 {random}
        </div>
      )}

      {/* Seats */}
      {allSeats.map((seat) => {
        const coords = getSeatCoords(seat.position);
        const isButton = seat.position === buttonPosition;

        return (
          <div
            key={seat.position}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: `${coords.x}%`,
              top: `${coords.y}%`,
            }}
          >
            {/* Button dot */}
            {isButton && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-gray-400 shadow-md z-30" />
            )}

            {/* Seat card */}
            <div
              className={`
                flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg min-w-[72px]
                shadow-lg transition-all
                ${
                  seat.isHero
                    ? "bg-[#22c55e]/90 text-white border-2 border-[#22c55e]"
                    : seat.folded
                    ? "bg-[#1a1d27]/50 text-[#475569] border border-[#242836]/50"
                    : "bg-[#1a1d27] text-[#e2e8f0] border border-[#242836]"
                }
              `}
            >
              <div className="text-[11px] font-bold tracking-wide">
                {seat.position}
              </div>
              <div className="text-[10px] font-mono opacity-70">
                {seat.stack}bb
              </div>
              {seat.action && !seat.folded && (
                <div
                  className={`
                    text-[9px] px-1.5 py-0.5 rounded font-semibold
                    ${
                      seat.action.includes("3bet") || seat.action.includes("4bet")
                        ? "bg-[#e8834A]/20 text-[#e8834A]"
                        : seat.action.includes("raise") || seat.action.includes("open")
                        ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                        : seat.action.includes("call")
                        ? "bg-[#22c55e]/20 text-[#22c55e]"
                        : "bg-[#242836] text-[#94a3b8]"
                    }
                  `}
                >
                  {seat.action}
                </div>
              )}
              {seat.folded && (
                <div className="text-[9px] text-[#475569] italic">fold</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
