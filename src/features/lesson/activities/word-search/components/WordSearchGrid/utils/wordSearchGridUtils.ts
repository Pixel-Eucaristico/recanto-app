export interface Cell {
  row: number;
  col: number;
}

export function lineCells(start: Cell, end: Cell): Cell[] | null {
  const dr = end.row - start.row;
  const dc = end.col - start.col;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [start];
  const signR = Math.sign(dr);
  const signC = Math.sign(dc);
  if (Math.abs(dr) !== 0 && Math.abs(dc) !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  const cells: Cell[] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({ row: start.row + signR * i, col: start.col + signC * i });
  }
  return cells;
}
