import { useState, useEffect } from "react";
import { api } from "../lib/api";

interface Props { onClose: () => void; }

export function LeaderboardModal({ onClose }: Props) {
  const [sortBy, setSortBy] = useState<"xp"|"wins">("xp");
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<any[]>(`/api/leaderboard?sortBy=${sortBy}&limit=50`),
      api.get<any>("/api/leaderboard/stats"),
    ]).then(([e, s]) => { setEntries(e); setStats(s); }).catch(() => {}).finally(() => setLoading(false));
  }, [sortBy]);

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"28px 24px",maxWidth:460,width:"100%",position:"relative",maxHeight:"90vh",overflowY:"auto" }}>
        <button onClick={onClose} style={{ position:"absolute",top:12,right:14,background:"none",border:"none",color:"var(--text-dim)",fontSize:"1.1rem",cursor:"pointer" }}>✕</button>
        <h2 style={{ fontFamily:"'Cinzel',serif",fontSize:"1.3rem",fontWeight:700,color:"var(--gold)",marginBottom:14,textAlign:"center" }}>Leaderboard</h2>
        {stats && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16 }}>
            {[[stats.totalPlayers,"Pirates"],[stats.totalGames,"Voyages"],[stats.averageXp,"Avg XP"]].map(([val,label]) => (
              <div key={String(label)} style={{ textAlign:"center",background:"var(--bg3)",borderRadius:8,padding:"8px 4px" }}>
                <div style={{ fontFamily:"'Cinzel',serif",color:"var(--gold)",fontWeight:700,fontSize:"1.2rem" }}>{val}</div>
                <div style={{ fontSize:"0.7rem",color:"var(--text-dim)" }}>{label}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display:"flex",gap:6,marginBottom:12 }}>
          {(["xp","wins"] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{ flex:1,padding:"7px 0",border:`1px solid ${sortBy===s?"var(--gold)":"var(--border)"}`,background:sortBy===s?"var(--gold)":"var(--bg3)",color:sortBy===s?"var(--bg)":"var(--text-dim)",borderRadius:6,fontFamily:"'Cinzel',serif",fontSize:"0.82rem",fontWeight:700,cursor:"pointer",textTransform:"uppercase" }}>
              {s === "xp" ? "XP" : "Wins"}
            </button>
          ))}
        </div>
        {loading ? (
          <div style={{ textAlign:"center",color:"var(--text-dim)",padding:20 }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign:"center",color:"var(--text-dim)",padding:20 }}>No pirates yet — be the first!</div>
        ) : (
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"32px 1fr 60px 50px 50px",gap:8,padding:"6px 8px",fontSize:"0.7rem",color:"var(--text-dim)",textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid var(--border)",marginBottom:4 }}>
              <span>#</span><span>Pirate</span><span style={{textAlign:"right"}}>XP</span><span style={{textAlign:"right"}}>Wins</span><span style={{textAlign:"right"}}>Games</span>
            </div>
            {entries.map((entry:any, idx:number) => (
              <div key={entry.username} style={{ display:"grid",gridTemplateColumns:"32px 1fr 60px 50px 50px",gap:8,padding:"8px 8px",borderBottom:"1px solid var(--border)",background:idx===0?"rgba(245,166,35,0.08)":"transparent",alignItems:"center" }}>
                <span style={{ fontFamily:"'Cinzel',serif",fontWeight:700,color:idx===0?"var(--gold)":idx===1?"#c0c0c0":idx===2?"#cd7f32":"var(--text-dim)",fontSize:"0.88rem" }}>{entry.rank}</span>
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                    <span>{entry.rankIcon}</span>
                    <span style={{ fontWeight:600,fontSize:"0.9rem",color:"var(--text)" }}>{entry.username}</span>
                  </div>
                  <div style={{ fontSize:"0.7rem",color:"var(--text-dim)" }}>{entry.rankTitle}</div>
                </div>
                <span style={{ textAlign:"right",fontFamily:"'Cinzel',serif",color:"var(--gold)",fontWeight:700,fontSize:"0.88rem" }}>{entry.xp}</span>
                <span style={{ textAlign:"right",color:"var(--text-dim)",fontSize:"0.85rem" }}>{entry.wins}</span>
                <span style={{ textAlign:"right",color:"var(--text-dim)",fontSize:"0.85rem" }}>{entry.gamesPlayed}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
