import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { VALID_WORDS, getDailyWord, getTodayDateStr, getLocalWordIndex } from "../lib/words";
import { GameBoard, type TileState } from "../components/GameBoard";
import { Keyboard } from "../components/Keyboard";
import { HowToPlayModal } from "../components/HowToPlayModal";
import { StatsModal } from "../components/StatsModal";
import { LeaderboardModal } from "../components/LeaderboardModal";
import { AuthModal } from "../components/AuthModal";
import { useAuth } from "../components/AuthProvider";

const MAX_ROWS = 6;
type LetterStatus = "green" | "yellow" | "gray" | "";

interface LocalStats {
  played: number; won: number; currentStreak: number; bestStreak: number; distribution: number[];
}
interface SavedState {
  date: string; guesses: string[]; currentGuess: string;
  gameOver: boolean; won: boolean; guessLine: number; scoreSubmitted: boolean;
}

function loadLocalStats(): LocalStats {
  try { const r = localStorage.getItem("opd_stats"); if (r) return JSON.parse(r); } catch {}
  return { played:0, won:0, currentStreak:0, bestStreak:0, distribution:[0,0,0,0,0,0] };
}
function saveLocalStats(s: LocalStats) { localStorage.setItem("opd_stats", JSON.stringify(s)); }
function loadSavedState(date: string): SavedState | null {
  try { const r = localStorage.getItem(`opd_state_${date}`); if (r) return JSON.parse(r); } catch {}
  return null;
}
function saveSavedState(date: string, s: SavedState) { localStorage.setItem(`opd_state_${date}`, JSON.stringify(s)); }

function scoreGuess(guess: string, target: string): ("green"|"yellow"|"gray")[] {
  const result: ("green"|"yellow"|"gray")[] = Array(guess.length).fill("gray");
  const used = Array(target.length).fill(false);
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) { result[i] = "green"; used[i] = true; }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "green") continue;
    for (let j = 0; j < target.length; j++) {
      if (!used[j] && guess[i] === target[j]) { result[i] = "yellow"; used[j] = true; break; }
    }
  }
  return result;
}

function LogoutOrLoginButton({ user, onLogin }: { user: any; onLogin: () => void }) {
  const { logout } = useAuth();
  return (
    <button onClick={() => user ? logout() : onLogin()} style={{
      background: user ? "var(--bg3)" : "var(--gold)", border:"1px solid var(--border)",
      color: user ? "var(--text)" : "var(--bg)", width:36, height:36,
      borderRadius:"50%", fontSize:"1rem", cursor:"pointer"
    }}>
      {user ? "✓" : "⚔️"}
    </button>
  );
}

export function GamePage() {
  const { user, token, refreshUser } = useAuth();
  const todayDate = getTodayDateStr();

  const [wordIndex, setWordIndex] = useState<number>(getLocalWordIndex());
  useEffect(() => {
    api.get<{ wordIndex: number; date: string }>("/api/game/today")
      .then(d => setWordIndex(d.wordIndex)).catch(() => {});
  }, []);

  const target = getDailyWord(wordIndex);
  const wordLength = target.length;

  const [showHow, setShowHow] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const msgTimer = useRef<ReturnType<typeof setTimeout>>();

  function showMsg(msg: string, isError = false, duration = 2000) {
    setMessage(msg); setMessageError(isError);
    if (msgTimer.current) clearTimeout(msgTimer.current);
    if (duration > 0) msgTimer.current = setTimeout(() => setMessage(""), duration);
  }

  const saved = loadSavedState(todayDate);
  const [guesses, setGuesses] = useState<string[]>(saved?.guesses ?? []);
  const [currentGuess, setCurrentGuess] = useState(saved?.currentGuess ?? "");
  const [gameOver, setGameOver] = useState(saved?.gameOver ?? false);
  const [won, setWon] = useState(saved?.won ?? false);
  const [guessLine, setGuessLine] = useState(saved?.guessLine ?? 0);
  const [scoreSubmitted, setScoreSubmitted] = useState(saved?.scoreSubmitted ?? false);
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [revealStatuses, setRevealStatuses] = useState<("green"|"yellow"|"gray")[]>([]);
  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState(false);

  function persist(s: Partial<SavedState>) {
    saveSavedState(todayDate, { date:todayDate, guesses, currentGuess, gameOver, won, guessLine, scoreSubmitted, ...s });
  }

  async function doSubmitScore(line: number, didWin: boolean) {
    if (scoreSubmitted || !token) return;
    try {
      const res = await api.post<any>("/api/game/submit-score", { guessLine: line, won: didWin, wordLength });
      setScoreSubmitted(true);
      await refreshUser();
      if (res.xpEarned > 0) showMsg(`+${res.xpEarned} XP — ${res.message}`, false, 4000);
      else showMsg(res.message, false, 3000);
    } catch { /* silently fail */ }
  }

  function handleKey(key: string) {
    if (gameOver || revealingRow !== null) return;
    if (key === "⌫" || key === "BACKSPACE") { setCurrentGuess(g => g.slice(0,-1)); return; }
    if (key === "ENTER") {
      if (currentGuess.length !== wordLength) {
        setShakingRow(guesses.length); setTimeout(() => setShakingRow(null), 400);
        showMsg("Not enough letters", true, 1500); return;
      }
      const newGuesses = [...guesses, currentGuess];
      const isWin = currentGuess === target;
      const isLost = !isWin && newGuesses.length === MAX_ROWS;
      const line = newGuesses.length;
      setRevealingRow(guesses.length);
      setRevealStatuses(scoreGuess(currentGuess, target));
      setTimeout(() => {
        setRevealingRow(null); setRevealStatuses([]);
        setGuesses(newGuesses); setCurrentGuess("");
        if (isWin) {
          setWon(true); setGameOver(true); setGuessLine(line);
          setBouncing(true); setTimeout(() => setBouncing(false), 600);
          const msgs = ["Pirate King!","Incredible!","Great!","Well done!","Close call!","Phew!"];
          showMsg(msgs[line-1] || "Nice!", false, 0);
          const stats = loadLocalStats();
          const dist = [...stats.distribution];
          dist[line-1] = (dist[line-1] || 0) + 1;
          saveLocalStats({ played:stats.played+1, won:stats.won+1, currentStreak:stats.currentStreak+1,
            bestStreak:Math.max(stats.bestStreak,stats.currentStreak+1), distribution:dist });
          persist({ guesses:newGuesses, currentGuess:"", gameOver:true, won:true, guessLine:line });
          doSubmitScore(line, true);
          setTimeout(() => setShowStats(true), 2000);
        } else if (isLost) {
          setGameOver(true); setGuessLine(0);
          showMsg(`The word was ${target}`, true, 0);
          const stats = loadLocalStats();
          saveLocalStats({ ...stats, played:stats.played+1, currentStreak:0 });
          persist({ guesses:newGuesses, currentGuess:"", gameOver:true, won:false, guessLine:0 });
          doSubmitScore(0, false);
          setTimeout(() => setShowStats(true), 2000);
        } else {
          persist({ guesses:newGuesses, currentGuess:"" });
        }
      }, wordLength * 300 + 100);
      return;
    }
    if (/^[A-Z]$/i.test(key) && currentGuess.length < wordLength) {
      setCurrentGuess(g => g + key.toUpperCase());
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "Backspace") handleKey("⌫");
      else if (e.key === "Enter") handleKey("ENTER");
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentGuess, guesses, gameOver, revealingRow, target]);

  function buildGrid(): TileState[][] {
    return Array.from({ length: MAX_ROWS }, (_, r) => {
      if (r < guesses.length) {
        const g = guesses[r]!;
        const statuses = scoreGuess(g, target);
        return Array.from({ length: wordLength }, (_, c) => ({
          letter: g[c] ?? "", status: revealingRow === r ? (revealStatuses[c] ?? "gray") : statuses[c]!,
          revealing: revealingRow === r, shaking: false, bouncing: bouncing && r === guesses.length-1 && won,
        }));
      } else if (r === guesses.length && !gameOver) {
        return Array.from({ length: wordLength }, (_, c) => ({
          letter: currentGuess[c] ?? "", status: (currentGuess[c] ? "filled" : "empty") as any,
          revealing: false, shaking: shakingRow === r, bouncing: false,
        }));
      } else {
        return Array.from({ length: wordLength }, () => ({ letter:"", status:"empty" as const, revealing:false, shaking:false, bouncing:false }));
      }
    });
  }

  function buildLetterStates(): Record<string, LetterStatus> {
    const states: Record<string, LetterStatus> = {};
    for (const g of guesses) {
      const sc = scoreGuess(g, target);
      for (let i = 0; i < g.length; i++) {
        const ch = g[i]!; const cur = states[ch] || "";
        if (sc[i] === "green") states[ch] = "green";
        else if (sc[i] === "yellow" && cur !== "green") states[ch] = "yellow";
        else if (sc[i] === "gray" && !cur) states[ch] = "gray";
      }
    }
    return states;
  }

  function handleShare() {
    const rows = guesses.map(g => scoreGuess(g, target).map(s => s==="green"?"🟩":s==="yellow"?"🟨":"⬛").join(""));
    const text = `OnePieceDaily ${todayDate} ${won ? guessLine : "X"}/${MAX_ROWS}\n\n${rows.join("\n")}`;
    navigator.clipboard?.writeText(text);
    showMsg("Copied to clipboard!", false, 2000);
  }

  const todayFmt = new Date().toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" });

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"var(--bg)" }}>
      <header style={{ background:"var(--bg2)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ maxWidth:520, margin:"0 auto", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:"1.6rem", lineHeight:1 }}>☠️</span>
            <div style={{ lineHeight:1.1 }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1rem", fontWeight:900, color:"var(--gold)", letterSpacing:"0.08em" }}>ONE PIECE</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.7rem", fontWeight:600, color:"var(--text-dim)", letterSpacing:"0.12em" }}>DAILY</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {user && (
              <div style={{ fontSize:"0.75rem", color:"var(--text-dim)", textAlign:"right", cursor:"pointer", lineHeight:1.3 }} onClick={() => setShowStats(true)}>
                <div style={{ color:"var(--gold)", fontWeight:600 }}>{user.username}</div>
                <div>{user.rankIcon} {user.xp} XP</div>
              </div>
            )}
            {[["?", () => setShowHow(true)], ["⚓", () => setShowLeaderboard(true)], ["📊", () => setShowStats(true)]].map(([icon, fn]) => (
              <button key={String(icon)} onClick={fn as ()=>void} style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", width:36, height:36, borderRadius:"50%", fontSize:"1rem", cursor:"pointer" }}>
                {icon as string}
              </button>
            ))}
            <LogoutOrLoginButton user={user} onLogin={() => setShowAuth(true)} />
          </div>
        </div>
      </header>
      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"14px 12px 8px", gap:12, maxWidth:520, margin:"0 auto", width:"100%" }}>
        {message && (
          <div style={{ background:messageError?"#c0392b":"var(--gold)", color:messageError?"#fff":"var(--bg)", fontFamily:"'Cinzel',serif", fontWeight:600, fontSize:"0.9rem", padding:"8px 20px", borderRadius:6, textAlign:"center", width:"100%" }}>
            {message}
          </div>
        )}
        <GameBoard grid={buildGrid()} wordLength={wordLength} />
        <Keyboard letterStates={buildLetterStates()} onKey={handleKey} disabled={gameOver || revealingRow !== null} />
      </main>
      <footer style={{ textAlign:"center", padding:10, fontSize:"0.75rem", color:"var(--text-dim)", borderTop:"1px solid var(--border)" }}>
        A new One Piece word every day at midnight UTC · {todayFmt}
      </footer>
      {showHow && <HowToPlayModal onClose={() => setShowHow(false)} />}
      {showStats && <StatsModal onClose={() => setShowStats(false)} localStats={loadLocalStats()} lastGuessLine={guessLine} gameWon={won} gameOver={gameOver} onShare={handleShare} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
