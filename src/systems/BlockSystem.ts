import { BlockData, GameMode } from './stateStore';

export class BlockSystem {
  // Shape configurations (1 = filled, 0 = empty)
  private static STANDARD_SHAPES = [
    // 1x1
    [[1]],
    // 1x2 & 2x1
    [[1, 1]],
    [[1], [1]],
    // 1x3 & 3x1
    [[1, 1, 1]],
    [[1], [1], [1]],
    // 1x4 & 4x1
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
    // 2x2 Square
    [
      [1, 1],
      [1, 1],
    ],
    // Small L (3 cells)
    [
      [1, 0],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 0],
    ],
    [
      [1, 1],
      [0, 1],
    ],
    [
      [0, 1],
      [1, 1],
    ],
    // L-shape (4 cells)
    [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 0],
    ],
    // T-shape
    [
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    // Z-shape
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
    // S-shape
    [
      [0, 1, 1],
      [1, 1, 0],
    ],
  ];

  private static HARDCORE_SHAPES = [
    ...BlockSystem.STANDARD_SHAPES,
    // 3x3 Square
    [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    // Plus shape
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    // U shape (3x3 outer edge)
    [
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    // Large L
    [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    // 1x5 Bar
    [[1, 1, 1, 1, 1]],
    [[1], [1], [1], [1], [1]],
    // Corner 3x3
    [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
  ];

  // Neon colors list (HEX numbers for PixiJS)
  public static NEON_COLORS = [
    0x00f2fe, // Cyan
    0xfd6585, // Hot Pink
    0xa855f7, // Violet Purple
    0x39ff14, // Neon Lime Green
    0xffd700, // Gold Yellow
    0xff6700, // Neon Orange
    0x0047ff, // Electric Blue
  ];

  /**
   * Generates a single block with a unique ID, random shape, and neon color.
   */
  public static generateBlock(mode: GameMode): BlockData {
    const shapes = mode === 'hardcore' ? this.HARDCORE_SHAPES : this.STANDARD_SHAPES;
    const shapeIndex = Math.floor(Math.random() * shapes.length);
    const colorIndex = Math.floor(Math.random() * this.NEON_COLORS.length);
    const shape = shapes[shapeIndex];

    return {
      id: Math.random().toString(36).substring(2, 9),
      shape: shape.map(row => [...row]),
      color: colorIndex,
      placed: false,
    };
  }

  /**
   * Generates 3 blocks at the bottom of the screen.
   */
  public static generateTripleBlocks(mode: GameMode): BlockData[] {
    return [
      this.generateBlock(mode),
      this.generateBlock(mode),
      this.generateBlock(mode),
    ];
  }

  /**
   * Check if a block shape can fit anywhere on the current grid
   */
  public static canFitOnGrid(grid: number[][], shape: number[][]): boolean {
    const gridSize = grid.length;
    const blockRows = shape.length;
    const blockCols = shape[0].length;

    for (let r = 0; r <= gridSize - blockRows; r++) {
      for (let c = 0; c <= gridSize - blockCols; c++) {
        let fits = true;
        
        for (let br = 0; br < blockRows; br++) {
          for (let bc = 0; bc < blockCols; bc++) {
            if (shape[br][bc] === 1) {
              if (grid[r + br][c + bc] !== 0) {
                fits = false;
                break;
              }
            }
          }
          if (!fits) break;
        }

        if (fits) {
          return true; // Found at least one position where it fits!
        }
      }
    }
    return false;
  }

  /**
   * Checks if a block can be placed at a specific grid position (row, col)
   */
  public static canPlaceAt(grid: number[][], shape: number[][], row: number, col: number): boolean {
    const gridSize = grid.length;
    const blockRows = shape.length;
    const blockCols = shape[0].length;

    if (row < 0 || col < 0 || row + blockRows > gridSize || col + blockCols > gridSize) {
      return false;
    }

    for (let br = 0; br < blockRows; br++) {
      for (let bc = 0; bc < blockCols; bc++) {
        if (shape[br][bc] === 1) {
          if (grid[row + br][col + bc] !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  }
}
