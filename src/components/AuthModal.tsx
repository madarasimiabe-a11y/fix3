import { useState } from "react";
import { useAuth } from "./AuthProvider";

interface Props { onClose: () => void; }

export function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (mode === "login") await login({ username, password });
      else await register({ username, email, password });
      onClose();
    } catch (err: any) {
      setError(err?.data?.error || err?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = { width:"100%",padding:"10px 12px",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:6,color:"var(--text)",fontSize:"0.9rem",outline:"none",marginBottom:10 };
  const labelStyle: React.CSSProperties = { display:"block",fontSize:"0.78rem",color:"var(--text-dim)",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em" };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:"28px 24px",maxWidth:360,width:"100%",position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute",top:12,right:14,background:"none",border:"none",color:"var(--text-dim)",fontSize:"1.1rem",cursor:"pointer" }}>✕</button>
        <h2 style={{ fontFamily:"'Cinzel',serif",fontSize:"1.3rem",fontWeight:700,color:"var(--gold)",marginBottom:6,textAlign:"center" }}>
          {mode === "login" ? "Set Sail" : "Join the Crew"}
        </h2>
        <p style={{ textAlign:"center",fontSize:"0.82rem",color:"var(--text-dim)",marginBottom:20 }}>
          {mode === "login" ? "Log in to track your XP and rank" : "Create an account to earn XP and climb the ranks"}
        </p>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Username</label>
          <input style={inputStyle} type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Your pirate name" required minLength={3} maxLength={20} autoComplete="username"/>
          {mode === "register" && (<><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required autoComplete="email"/></>)}
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required minLength={6} autoComplete={mode==="login"?"current-password":"new-password"}/>
          {error && <div style={{ color:"#e74c3c",fontSize:"0.82rem",marginBottom:12,padding:"8px 12px",background:"rgba(231,76,60,0.1)",borderRadius:6 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ display:"block",width:"100%",padding:12,marginTop:4,background:"var(--gold)",border:"none",borderRadius:8,color:"var(--bg)",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:"0.95rem",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1 }}>
            {loading ? "..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>
        <div style={{ textAlign:"center",marginTop:16 }}>
          <button onClick={()=>{setMode(m=>m==="login"?"register":"login");setError("");}} style={{ background:"none",border:"none",color:"var(--gold)",cursor:"pointer",fontSize:"0.84rem",textDecoration:"underline" }}>
            {mode === "login" ? "New pirate? Register here" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
