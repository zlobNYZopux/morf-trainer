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

const SEAT_6MAX: Record<string, { x: number; y: number }> = {
  UTG: { x: 28, y: 78 },
  MP: { x: 8, y: 50 },
  CO: { x: 28, y: 22 },
  BTN: { x: 72, y: 22 },
  SB: { x: 92, y: 50 },
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
    const isFolded = !isHero && ((villain?.folded ?? false) || villain?.action === "fold");
    return {
      position: pos,
      stack: isHero ? heroStack : (villain?.stack ?? 100),
      isHero,
      isActive: isHero || (villain?.action !== undefined && !isFolded),
      action: isHero ? heroAction : villain?.action,
      folded: isFolded,
      coords: SEAT_6MAX[pos],
    };
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Fixed size container - 2x larger */}
      <div className="relative" style={{ width: "700px", height: "480px" }}>
        {/* Dark rail */}
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
            inset: "30px",
            background: "radial-gradient(ellipse at 40% 40%, #1d7a3a 0%, #15642d 40%, #0d4d20 80%, #083315 100%)",
            boxShadow: "inset 0 4px 20px rgba(0,0,0,0.4)",
          }}
        />

        {/* Inner edge */}
        <div className="absolute rounded-full pointer-events-none" style={{ inset: "32px", border: "1px solid rgba(255,255,255,0.06)" }} />

        {/* RNG - top left, large */}
        {random !== undefined && (
          <div className="absolute top-6 left-8 z-30">
            <div className="text-5xl font-black text-[#e8834A] font-mono drop-shadow-lg">
              🎲 {random}
            </div>
          </div>
        )}

        {/* Situation */}
        {situation && (
          <div className="absolute top-[42%] left-1/2 -translate-x-1/2 z-10 text-center">
            <div className="text-sm text-[rgba(255,255,255,0.5)] font-mono whitespace-nowrap">{situation}</div>
          </div>
        )}

        {/* Pot */}
        {pot !== undefined && pot > 0 && (
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 z-10">
            <div className="text-xl font-bold text-[#e8834A]">{pot} bb</div>
          </div>
        )}

        {/* Card backs center */}
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded" style={{
              width: "36px", height: "50px",
              background: "linear-gradient(135deg, #8b7355 0%, #6b5a3e 50%, #4a3f2a 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }} />
          ))}
        </div>

        {/* Blinds */}
        <div className="absolute top-[36%] left-1/2 -translate-x-1/2 z-10 text-xs text-[rgba(255,255,255,0.3)] font-mono">
          {blinds.small}/{blinds.big}
        </div>

        {/* Seats */}
        {seats.map((seat) => {
          const isButton = seat.position === buttonPosition;
          return (
            <div key={seat.position} className="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: `${seat.coords.x}%`, top: `${seat.coords.y}%` }}>
              {/* Button */}
              {isButton && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 rounded-full flex items-center justify-center" style={{
                  width: "24px", height: "24px",
                  background: "linear-gradient(135deg, #fff 0%, #ddd 100%)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}>
                  <span className="text-[10px] font-bold text-[#333]">D</span>
                </div>
              )}

              {/* Card backs */}
              <div className="flex gap-1 mb-1.5 justify-center">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-sm" style={{
                    width: "28px", height: "38px",
                    background: seat.folded
                      ? "linear-gradient(135deg, #3a3a3a 0%, #222 100%)"
                      : "linear-gradient(135deg, #8b7355 0%, #6b5a3e 50%, #4a3f2a 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    opacity: seat.folded ? 0.3 : 1,
                  }} />
                ))}
              </div>

              {/* Seat label */}
              <div className={`
                flex flex-col items-center rounded-lg px-3 py-1.5 min-w-[72px]
                ${seat.isHero ? "bg-[#1a1d27] border-2 border-[#22c55e]" : seat.isActive ? "bg-[#1a1d27] border-2 border-[#e8834A]" : "bg-[#1a1d27] border border-[#333]"}
              `}>
                <span className="text-sm font-bold text-white leading-tight">
                  {seat.folded ? "Fold" : seat.position}
                </span>
                <span className="text-xs font-mono text-[#94a3b8] leading-tight">{seat.stack}</span>
              </div>

              {/* Action badge */}
              {seat.action && !seat.folded && seat.action !== "fold" && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`
                    text-xs px-2 py-1 rounded font-bold
                    ${seat.action.includes("3bet") || seat.action.includes("4bet") ? "bg-[#e8834A] text-white" : seat.action.includes("raise") || seat.action.includes("open") ? "bg-[#f59e0b] text-white" : seat.action.includes("call") ? "bg-[#22c55e] text-white" : "bg-[#333] text-[#94a3b8]"}
                  `}>
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
