const ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

interface KeyboardProps {
  letterStates: Record<string, "green" | "yellow" | "gray" | "">;
  onKey: (key: string) => void;
  disabled?: boolean;
}

export function Keyboard({ letterStates, onKey, disabled }: KeyboardProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", maxWidth: 500 }}>
      {ROWS.map((row, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
          {row.map((key) => {
            const st = letterStates[key] || "";
            const isWide = key === "ENTER" || key === "⌫";
            return (
              <button key={key}
                className={`key${isWide ? " wide" : ""}${st ? " " + st : ""}`}
                style={{ flex: isWide ? "1.6 1 0" : "1 1 0", maxWidth: isWide ? 66 : 44 }}
                onClick={() => !disabled && onKey(key)} disabled={disabled}>
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
