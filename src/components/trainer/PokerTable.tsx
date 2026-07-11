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
  situation?: string;
  pot?: number;
  random?: number;
}

// 6-max positions around oval (like PokerStars)
const SEAT_6MAX: Record<string, { x: number; y: number }> = {
  UTG: { x: 28, y: 78 },
  MP: { x: 10, y: 50 },
  CO: { x: 28, y: 22 },
  BTN: { x: 72, y: 22 },
  SB: { x: 90, y: 50 },
  BB: { x: 72, y: 78 },
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
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer container - fixed size like poker client */}
      <div className="relative" style={{ width: "420px", height: "320px" }}>
        {/* Dark background / rail */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.8), inset 0 2px 8px rgba(255,255,255,0.05)",
          }}
        />

        {/* Green felt */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "20px",
            background: "radial-gradient(ellipse at 40% 40%, #1d7a3a 0%, #15642d 40%, #0d4d20 80%, #083315 100%)",
            boxShadow: "inset 0 4px 20px rgba(0,0,0,0.4)",
          }}
        />

        {/* Inner felt edge */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: "22px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />

        {/* Situation text */}
        {situation && (
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
            <div className="text-[11px] text-[rgba(255,255,255,0.5)] font-mono whitespace-nowrap">
              {situation}
            </div>
          </div>
        )}

        {/* Pot */}
        {pot !== undefined && pot > 0 && (
          <div className="absolute top-[52%] left-1/2 -translate-x-1/2 z-10 text-center">
            <div className="text-sm font-bold text-[#e8834A]">{pot} bb</div>
          </div>
        )}

        {/* Card backs in center */}
        <div className="absolute top-[58%] left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: "22px",
                height: "32px",
                background: "linear-gradient(135deg, #8b7355 0%, #6b5a3e 50%, #4a3f2a 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>

        {/* Blinds */}
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 z-10 text-[10px] text-[rgba(255,255,255,0.3)] font-mono">
          {blinds.small}/{blinds.big}
        </div>

        {/* RNG */}
        {random !== undefined && (
          <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 z-10 text-[10px] text-[rgba(255,255,255,0.3)] font-mono">
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
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center rounded-full"
                  style={{
                    width: "18px",
                    height: "18px",
                    background: "linear-gradient(135deg, #fff 0%, #ddd 100%)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  <span className="text-[8px] font-bold text-[#333]">D</span>
                </div>
              )}

              {/* Card backs */}
              <div className="flex gap-0.5 mb-1 justify-center">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-sm"
                    style={{
                      width: "18px",
                      height: "24px",
                      background: seat.folded
                        ? "linear-gradient(135deg, #4a4a4a 0%, #333 100%)"
                        : "linear-gradient(135deg, #8b7355 0%, #6b5a3e 50%, #4a3f2a 100%)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      opacity: seat.folded ? 0.4 : 1,
                    }}
                  />
                ))}
              </div>

              {/* Seat label */}
              <div
                className={`
                  flex flex-col items-center rounded-md px-2.5 py-1 min-w-[56px]
                  ${
                    seat.isHero
                      ? "bg-[#1a1d27] border border-[#22c55e]"
                      : seat.isActive
                      ? "bg-[#1a1d27] border border-[#e8834A]"
                      : "bg-[#1a1d27] border border-[#333]"
                  }
                `}
              >
                <span className="text-[11px] font-bold text-white leading-tight">
                  {seat.position}
                </span>
                <span className="text-[10px] font-mono text-[#94a3b8] leading-tight">
                  {seat.stack}
                </span>
              </div>

              {/* Action badge */}
              {seat.action && !seat.folded && seat.action !== "fold" && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span
                    className={`
                      text-[9px] px-1.5 py-0.5 rounded font-semibold
                      ${
                        seat.action.includes("3bet") || seat.action.includes("4bet")
                          ? "bg-[#e8834A] text-white"
                          : seat.action.includes("raise") || seat.action.includes("open")
                          ? "bg-[#f59e0b] text-white"
                          : seat.action.includes("call")
                          ? "bg-[#22c55e] text-white"
                          : "bg-[#333] text-[#94a3b8]"
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
    </div>
  );
}
