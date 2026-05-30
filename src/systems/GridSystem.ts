export class GridSystem {
  /**
   * Places a block shape onto the grid at the specified row and column.
   * Returns a new grid array.
   */
  public static placeBlock(
    grid: number[][],
    shape: number[][],
    row: number,
    col: number,
    colorValue: number
  ): number[][] {
    const newGrid = grid.map(r => [...r]);
    const blockRows = shape.length;
    const blockCols = shape[0].length;

    for (let r = 0; r < blockRows; r++) {
      for (let c = 0; c < blockCols; c++) {
        if (shape[r][c] === 1) {
          newGrid[row + r][col + c] = colorValue;
        }
      }
    }
    return newGrid;
  }

  /**
   * Checks the grid and returns the indices of any rows and columns that are fully filled.
   */
  public static checkFilledLines(grid: number[][]): { rows: number[]; cols: number[] } {
    const size = grid.length;
    const filledRows: number[] = [];
    const filledCols: number[] = [];

    // Check rows
    for (let r = 0; r < size; r++) {
      let isFilled = true;
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) {
          isFilled = false;
          break;
        }
      }
      if (isFilled) {
        filledRows.push(r);
      }
    }

    // Check columns
    for (let c = 0; c < size; c++) {
      let isFilled = true;
      for (let r = 0; r < size; r++) {
        if (grid[r][c] === 0) {
          isFilled = false;
          break;
        }
      }
      if (isFilled) {
        filledCols.push(c);
      }
    }

    return { rows: filledRows, cols: filledCols };
  }

  /**
   * Clears the specified rows and columns from the grid.
   * Returns the new grid.
   */
  public static clearLines(grid: number[][], rows: number[], cols: number[]): number[][] {
    const newGrid = grid.map(r => [...r]);
    const size = grid.length;

    // Clear rows
    for (const r of rows) {
      for (let c = 0; c < size; c++) {
        newGrid[r][c] = 0;
      }
    }

    // Clear columns
    for (const c of cols) {
      for (let r = 0; r < size; r++) {
        newGrid[r][c] = 0;
      }
    }

    return newGrid;
  }

  /**
   * Check if the board is completely empty (for Perfect Clear check)
   */
  public static isGridEmpty(grid: number[][]): boolean {
    return grid.every(row => row.every(val => val === 0));
  }
}
