export class ComboSystem {
  /**
   * Returns a custom text label for a given combo count to display in UI.
   */
  public static getComboText(combo: number): string {
    if (combo < 2) return '';
    if (combo === 2) return 'COMBO X2!';
    if (combo === 3) return 'COMBO X3!';
    if (combo === 4) return 'SIÊU COMBO!';
    if (combo === 5) return 'ĐẠI COMBO!';
    if (combo === 6) return 'CỰC HẠN COMBO!';
    return 'KHÔNG THỂ CẢN PHÁ!';
  }

  /**
   * Returns a neon color corresponding to the combo intensity.
   */
  public static getComboColor(combo: number): number {
    if (combo <= 2) return 0x00f2fe; // Cyan
    if (combo === 3) return 0x39ff14; // Green
    if (combo === 4) return 0xffd700; // Gold
    if (combo === 5) return 0xff6700; // Orange
    return 0xfd6585; // Hot Pink
  }
}
