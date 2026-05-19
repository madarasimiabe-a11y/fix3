interface TileState {
  letter: string;
  status: "empty" | "filled" | "green" | "yellow" | "gray";
  revealing: boolean;
  shaking: boolean;
  bouncing: boolean;
}

interface GameBoardProps {
  grid: TileState[][];
  wordLength: number;
}

export function GameBoard({ grid, wordLength }: GameBoardProps) {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <div style={{
        display: "grid", gap: "var(--gap)",
        gridTemplateRows: `repeat(6, var(--tile-size))`,
        gridTemplateColumns: `repeat(${wordLength}, var(--tile-size))`,
      }}>
        {grid.map((row, r) =>
          row.map((tile, c) => {
            let cls = "tile";
            if (tile.revealing) cls += ` flip ${tile.status}`;
            else if (tile.status !== "empty" && tile.status !== "filled") cls += ` ${tile.status}`;
            else if (tile.status === "filled") cls += " filled";
            if (tile.shaking) cls += " shake";
            if (tile.bouncing) cls += " bounce";
            return <div key={`${r}-${c}`} className={cls}>{tile.letter}</div>;
          })
        )}
      </div>
    </div>
  );
}

export type { TileState };
