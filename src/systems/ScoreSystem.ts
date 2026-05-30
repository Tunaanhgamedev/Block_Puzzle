export class ScoreSystem {
  /**
   * Calculate score for placing a block
   * @param numTiles number of tiles in the placed block
   */
  public static getPlacementScore(numTiles: number): number {
    return numTiles; // 1 point per square
  }

  /**
   * Calculate score for clearing lines, incorporating combos
   * @param lineCount number of lines (rows + cols) cleared
   * @param comboMultiplier current combo level (e.g. 1 for no combo, 2 for x2, etc.)
   */
  public static getClearScore(lineCount: number, comboMultiplier: number): number {
    if (lineCount <= 0) return 0;
    
    // Base scores for clearing multiple lines at once
    let baseScore = 0;
    switch (lineCount) {
      case 1:
        baseScore = 100;
        break;
      case 2:
        baseScore = 300;
        break;
      case 3:
        baseScore = 600;
        break;
      case 4:
        baseScore = 1000;
        break;
      default:
        baseScore = 1000 + (lineCount - 4) * 400;
        break;
    }

    // Apply combo multiplier
    return baseScore * Math.max(1, comboMultiplier);
  }

  /**
   * Score reward for a Perfect Clear (completely empty grid)
   */
  public static PERFECT_CLEAR_BONUS = 500;
}
