interface Props { onClose: () => void; }

export function HowToPlayModal({ onClose }: Props) {
  return (
    <div className="modal" style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"28px 24px",maxWidth:400,width:"100%",position:"relative",maxHeight:"90vh",overflowY:"auto" }}>
        <button onClick={onClose} style={{ position:"absolute",top:12,right:14,background:"none",border:"none",color:"var(--text-dim)",fontSize:"1.1rem",cursor:"pointer" }}>✕</button>
        <h2 style={{ fontFamily:"'Cinzel',serif",fontSize:"1.3rem",fontWeight:700,color:"var(--gold)",marginBottom:14,textAlign:"center" }}>How To Play</h2>
        <p style={{ fontSize:"0.9rem",color:"var(--text-dim)",lineHeight:1.6,marginBottom:10 }}>
          Guess the hidden <strong style={{color:"var(--text)"}}>One Piece</strong> term in <strong style={{color:"var(--text)"}}>6 tries</strong>. The word changes every day.
        </p>
        <ul style={{ paddingLeft:18,marginBottom:14 }}>
          <li style={{ fontSize:"0.88rem",color:"var(--text-dim)",lineHeight:1.7 }}>Type any letters — the board adapts to the word's length</li>
          <li style={{ fontSize:"0.88rem",color:"var(--text-dim)",lineHeight:1.7 }}>Tile colors change after each guess</li>
        </ul>
        <div style={{ display:"flex",gap:5,margin:"10px 0 4px" }}>
          {["L","U","F","F","Y"].map((l,i) => (
            <div key={i} className={`tile${i===0?" green":""}`} style={{ width:42,height:42,fontSize:"1.1rem" }}>{l}</div>
          ))}
        </div>
        <p style={{ fontSize:"0.85rem",color:"var(--text-dim)",marginBottom:12 }}><strong style={{color:"var(--text)"}}>L</strong> is in the correct spot.</p>
        <div style={{ display:"flex",gap:5,margin:"10px 0 4px" }}>
          {["S","A","N","J","I"].map((l,i) => (
            <div key={i} className={`tile${i===1?" yellow":""}`} style={{ width:42,height:42,fontSize:"1.1rem" }}>{l}</div>
          ))}
        </div>
        <p style={{ fontSize:"0.85rem",color:"var(--text-dim)",marginBottom:12 }}><strong style={{color:"var(--text)"}}>A</strong> is in the word but wrong spot.</p>
        <div style={{ display:"flex",gap:5,margin:"10px 0 4px" }}>
          {["B","R","O","O","K"].map((l,i) => (
            <div key={i} className={`tile${i===2?" gray":""}`} style={{ width:42,height:42,fontSize:"1.1rem" }}>{l}</div>
          ))}
        </div>
        <p style={{ fontSize:"0.85rem",color:"var(--text-dim)",marginBottom:12 }}><strong style={{color:"var(--text)"}}>O</strong> is not in the word at all.</p>
        <div style={{ marginTop:16,padding:"12px 16px",background:"var(--bg3)",borderRadius:8,border:"1px solid var(--border)" }}>
          <p style={{ fontSize:"0.82rem",color:"var(--gold)",fontFamily:"'Cinzel',serif",marginBottom:4 }}>XP Rewards</p>
          {[["1st try","100 XP"],["2nd try","80 XP"],["3rd try","65 XP"],["4th try","50 XP"],["5th try","35 XP"],["6th try","20 XP"]].map(([line, xp]) => (
            <div key={line} style={{ display:"flex",justifyContent:"space-between",fontSize:"0.8rem",color:"var(--text-dim)",padding:"2px 0" }}>
              <span>{line}</span><span style={{color:"var(--gold)"}}>{xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
