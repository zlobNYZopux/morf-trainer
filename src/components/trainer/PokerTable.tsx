"use client";

interface PlayerSeat {
  position: string;
  stack: number;
  action?: string;
  bet?: number;
  folded?: boolean;
}

interface PokerTableProps {
  heroPosition: string;
  villainPositions: PlayerSeat[];
  buttonPosition: string;
  blinds: { small: number; big: number };
  heroStack: number;
  heroAction?: string;
  heroBet?: number;
  situation?: string;
  pot?: number;
  random?: number;
  showHeroAsQuestion?: boolean;
}

// Seats on the outer rail edge
const SEAT_6MAX: Record<string, { x: number; y: number }> = {
  UTG: { x: 20, y: 92 },
  MP: { x: 0, y: 50 },
  CO: { x: 20, y: 8 },
  BTN: { x: 80, y: 8 },
  SB: { x: 100, y: 50 },
  BB: { x: 80, y: 92 },
};

export function PokerTable({
  heroPosition,
  villainPositions,
  buttonPosition,
  blinds,
  heroStack,
  heroAction,
  heroBet,
  situation,
  pot,
  random,
  showHeroAsQuestion = true,
}: PokerTableProps) {
  const allPositions = ["UTG", "MP", "CO", "BTN", "SB", "BB"];
  const villainMap = new Map(villainPositions.map((v) => [v.position, v]));

  const seats = allPositions.map((pos) => {
    const isHero = pos === heroPosition;
    const villain = villainMap.get(pos);
    const isFolded = !isHero && ((villain?.folded ?? false) || villain?.action === "fold");
    const hasActed = isHero ? false : (villain?.action !== undefined);
    const bet = isHero ? heroBet : villain?.bet;

    return {
      position: pos,
      stack: isHero ? heroStack : (villain?.stack ?? 100),
      isHero,
      isActive: isHero || (!isFolded && hasActed),
      action: isHero ? heroAction : villain?.action,
      folded: isFolded,
      bet,
      coords: SEAT_6MAX[pos],
    };
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center">
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

        {/* Center: pot + card backs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2">
          {/* Pot */}
          {pot !== undefined && pot > 0 && (
            <div className="text-xl font-bold text-[#e8834A]">{pot} bb</div>
          )}

          {/* Card backs */}
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
            <div key={i} className="rounded" style={{
              width: "36px", height: "50px",
              background: "linear-gradient(135deg, #8b7355 0%, #6b5a3e 50%, #4a3f2a 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }} />
          ))}
          </div>
        </div>

        {/* Seats */}
        {seats.map((seat) => {
          const isButton = seat.position === buttonPosition;

          return (
            <div key={seat.position} className="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: `${seat.coords.x}%`, top: `${seat.coords.y}%` }}>
              {/* Button indicator - next to seat label, not overlapping */}
              {isButton && (
                <div className="absolute z-30 rounded-full flex items-center justify-center" style={{
                  width: "20px", height: "20px",
                  background: "linear-gradient(135deg, #fff 0%, #ddd 100%)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  top: "50%",
                  right: "-10px",
                  transform: "translateY(-50%)",
                }}>
                  <span className="text-[8px] font-bold text-[#333]">D</span>
                </div>
              )}

              {/* Cards ALWAYS above seat label */}
              <div className="flex gap-1 justify-center mb-1">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-sm" style={{
                    width: "26px", height: "36px",
                    background: seat.folded ? "linear-gradient(135deg, #3a3a3a 0%, #222 100%)" : "linear-gradient(135deg, #8b7355 0%, #6b5a3e 50%, #4a3f2a 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    opacity: seat.folded ? 0.3 : 1,
                  }} />
                ))}
              </div>

              {/* Seat label (always below cards) */}
              <div className={`
                flex flex-col items-center rounded-lg px-3 py-1.5 min-w-[72px]
                ${seat.isHero ? "bg-[#1a1d27] border-2 border-[#22c55e]" : seat.isActive ? "bg-[#1a1d27] border-2 border-[#e8834A]" : "bg-[#1a1d27] border border-[#333]"}
              `}>
                <span className="text-sm font-bold text-white leading-tight">{seat.folded ? "Fold" : seat.position}</span>
                <span className="text-xs font-mono text-[#94a3b8] leading-tight">{seat.stack}</span>
              </div>

              {/* Hero ??? indicator - toward center */}
              {seat.isHero && showHeroAsQuestion && !seat.folded && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap z-20"
                  style={seat.coords.y < 50 ? { top: "100%", marginTop: "4px" } : { bottom: "100%", marginBottom: "4px" }}
                >
                  <span className="px-3 py-1.5 rounded-lg bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 font-bold text-sm">???</span>
                </div>
              )}

              {/* Bet chip display */}
              {seat.bet !== undefined && seat.bet > 0 && !seat.folded && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#e8834A] border border-[#c46a2e] shadow-sm" />
                  <span className="text-[10px] font-bold text-[#e8834A]">{seat.bet}</span>
                </div>
              )}

              {/* Action badge */}
              {seat.action && !seat.folded && seat.action !== "fold" && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`
                    text-xs px-2 py-1 rounded font-bold
                    ${seat.action.includes("3bet") || seat.action.includes("4bet") || seat.action.includes("raise") || seat.action.includes("open") ? "bg-[#e8834A] text-white" : seat.action.includes("call") ? "bg-[#22c55e] text-white" : "bg-[#333] text-[#94a3b8]"}
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
