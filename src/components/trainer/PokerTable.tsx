"use client";

interface PlayerSeat {
  position: string;
  stack: number;
  action?: string;
  folded?: boolean;
  isHero?: boolean;
  isActive?: boolean;
}

interface PokerTableProps {
  heroPosition: string;
  villainPositions: PlayerSeat[];
  buttonPosition: string;
  blinds: { small: number; big: number };
  heroStack: number;
  heroAction?: string;
  situation?: string; // e.g. "BB vs. UTG, SRP, 100bb"
  pot?: number;
  random?: number;
}

// 6-max positions (clockwise from top-left)
const SEAT_6MAX: Record<string, { x: number; y: number }> = {
  UTG: { x: 30, y: 75 },
  MP: { x: 12, y: 50 },
  CO: { x: 30, y: 25 },
  BTN: { x: 70, y: 25 },
  SB: { x: 88, y: 50 },
  BB: { x: 70, y: 75 },
};

export function PokerTable({
  heroPosition,
  villainPositions,
  buttonPosition,
  blinds,
  heroStack,
  heroAction,
  situation,
  pot,
  random,
}: PokerTableProps) {
  // Build all 6 seats
  const allPositions = ["UTG", "MP", "CO", "BTN", "SB", "BB"];
  const villainMap = new Map(villainPositions.map((v) => [v.position, v]));

  const seats = allPositions.map((pos) => {
    const isHero = pos === heroPosition;
    const villain = villainMap.get(pos);
    return {
      position: pos,
      stack: isHero ? heroStack : (villain?.stack ?? 100),
      isHero,
      isActive: isHero || (villain?.action !== undefined && villain?.action !== "fold"),
      action: isHero ? heroAction : villain?.action,
      folded: !isHero && (villain?.folded ?? false),
      coords: SEAT_6MAX[pos],
    };
  });

  return (
    <div className="relative w-full h-full min-h-[380px] select-none">
      {/* Oval table outline */}
      <div
        className="absolute"
        style={{
          left: "10%",
          right: "10%",
          top: "10%",
          bottom: "10%",
          border: "2px solid #333",
          borderRadius: "50%",
        }}
      />

      {/* Center info */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
        {situation && (
          <div className="text-xs text-[#64748b] mb-2 font-mono">{situation}</div>
        )}
        {pot !== undefined && pot > 0 && (
          <div className="text-sm text-[#e8834A] font-semibold">{pot} bb</div>
        )}
        {/* Card backs placeholder */}
        <div className="flex justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-6 h-8 rounded-sm bg-[#1a1d27] border border-[#333] flex items-center justify-center"
            >
              <span className="text-[8px] text-[#475569] font-bold">W</span>
            </div>
          ))}
        </div>
      </div>

      {/* Blinds */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-[10px] text-[#475569] font-mono">
        {blinds.small}/{blinds.big}
      </div>

      {/* RNG */}
      {random !== undefined && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-[10px] text-[#475569] font-mono">
          🎲 {random}
        </div>
      )}

      {/* Seats */}
      {seats.map((seat) => {
        const isButton = seat.position === buttonPosition;

        return (
          <div
            key={seat.position}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: `${seat.coords.x}%`,
              top: `${seat.coords.y}%`,
            }}
          >
            {/* Button indicator */}
            {isButton && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white text-[8px] font-bold text-black flex items-center justify-center z-30 shadow-md">
                D
              </div>
            )}

            {/* Seat circle */}
            <div
              className={`
                relative flex flex-col items-center justify-center
                w-14 h-14 rounded-full
                transition-all duration-200
                ${
                  seat.isHero
                    ? "bg-[#1a1d27] border-2 border-[#22c55e] text-white"
                    : seat.isActive
                    ? "bg-[#1a1d27] border-2 border-[#e8834A] text-white"
                    : "bg-[#1a1d27] border border-[#333] text-[#64748b]"
                }
              `}
            >
              <span className="text-[11px] font-bold tracking-wide">
                {seat.position}
              </span>
              <span className="text-[9px] font-mono opacity-60">
                {seat.stack}
              </span>
            </div>

            {/* Action badge */}
            {seat.action && !seat.folded && seat.action !== "fold" && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span
                  className={`
                    text-[8px] px-1.5 py-0.5 rounded-full font-semibold
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
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
