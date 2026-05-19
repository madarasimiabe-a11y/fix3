import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { api } from "../lib/api";

interface LocalStats {
  played: number; won: number; currentStreak: number; bestStreak: number; distribution: number[];
}
interface Props {
  onClose: () => void; localStats: LocalStats; lastGuessLine: number;
  gameWon: boolean; onShare: () => void; gameOver: boolean;
}

export function StatsModal({ onClose, localStats, lastGuessLine, gameWon, onShare, gameOver }: Props) {
  const { user, token } = useAuth();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (token) api.get<any[]>("/api/user/history").then(setHistory).catch(() => {});
  }, [token]);

  const winPct = localStats.played > 0 ? Math.round((localStats.won / localStats.played) * 100) : 0;
  const maxDist = Math.max(...localStats.distribution, 1);

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"28px 24px",maxWidth:420,width:"100%",position:"relative",maxHeight:"90vh",overflowY:"auto" }}>
        <button onClick={onClose} style={{ position:"absolute",top:12,right:14,background:"none",border:"none",color:"var(--text-dim)",fontSize:"1.1rem",cursor:"pointer" }}>✕</button>
        <h2 style={{ fontFamily:"'Cinzel',serif",fontSize:"1.3rem",fontWeight:700,color:"var(--gold)",marginBottom:14,textAlign:"center" }}>Statistics</h2>
        {user && (
          <div style={{ textAlign:"center",marginBottom:16,padding:"10px",background:"var(--bg3)",borderRadius:8,border:"1px solid var(--border)" }}>
            <div style={{ fontSize:"1.5rem" }}>{user.rankIcon}</div>
            <div style={{ fontFamily:"'Cinzel',serif",color:"var(--gold)",fontSize:"0.9rem",fontWeight:700 }}>{user.rank}</div>
            <div style={{ color:"var(--text-dim)",fontSize:"0.78rem",marginTop:2 }}>{user.xp} XP total</div>
          </div>
        )}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:18 }}>
          {[[user?.gamesPlayed ?? localStats.played,"Played"],[winPct,"Win %"],[user?.currentStreak ?? localStats.currentStreak,"Streak"],[user?.bestStreak ?? localStats.bestStreak,"Best"]].map(([val,label]) => (
            <div key={String(label)} style={{ display:"flex",flexDirection:"column",alignItems:"center",background:"var(--bg3)",borderRadius:8,padding:"10px 4px" }}>
              <span style={{ fontFamily:"'Cinzel',serif",fontSize:"1.6rem",fontWeight:700,color:"var(--gold)" }}>{val}</span>
              <label style={{ fontSize:"0.7rem",color:"var(--text-dim)",marginTop:2 }}>{label}</label>
            </div>
          ))}
        </div>
        <h3 style={{ fontFamily:"'Cinzel',serif",fontSize:"1rem",color:"var(--gold)",margin:"16px 0 10px",textAlign:"center" }}>Guess Distribution</h3>
        {localStats.distribution.map((count, i) => {
          const isActive = gameWon && lastGuessLine === i + 1;
          const pct = Math.max((count / maxDist) * 100, count > 0 ? 14 : 8);
          return (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
              <span style={{ width:14,textAlign:"right",color:"var(--text-dim)",fontWeight:600,fontSize:"0.82rem" }}>{i+1}</span>
              <div style={{ flex:1,background:"var(--bg3)",borderRadius:4,height:22 }}>
                <div className={`dist-bar${isActive?" active":""}`} style={{ width:`${pct}%` }}>{count}</div>
              </div>
            </div>
          );
        })}
        {history.length > 0 && (
          <>
            <h3 style={{ fontFamily:"'Cinzel',serif",fontSize:"1rem",color:"var(--gold)",margin:"16px 0 8px",textAlign:"center" }}>Recent Games</h3>
            <div style={{ maxHeight:120,overflowY:"auto" }}>
              {history.slice(0,10).map((s:any) => (
                <div key={s.id} style={{ display:"flex",justifyContent:"space-between",fontSize:"0.78rem",color:"var(--text-dim)",padding:"3px 0",borderBottom:"1px solid var(--border)" }}>
                  <span style={{ color:s.won?"var(--green)":"#c0392b" }}>{s.won?`Solved line ${s.guessLine}`:"Lost"}</span>
                  <span style={{ color:"var(--gold)" }}>+{s.xpEarned} XP</span>
                </div>
              ))}
            </div>
          </>
        )}
        {gameOver && (
          <button onClick={onShare} style={{ display:"block",width:"100%",marginTop:16,background:"var(--gold)",border:"none",borderRadius:8,color:"var(--bg)",fontFamily:"'Cinzel',serif",fontSize:"0.95rem",fontWeight:700,padding:12,cursor:"pointer" }}>
            Share Result
          </button>
        )}
      </div>
    </div>
  );
}
