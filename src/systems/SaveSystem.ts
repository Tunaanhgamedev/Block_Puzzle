import { GameMode, Quest, Achievement } from './stateStore';

export class SaveSystem {
  private static PREFIX = 'bp_neon_';

  public static saveHighScores(scores: Record<GameMode, number>): void {
    localStorage.setItem(this.PREFIX + 'high_scores', JSON.stringify(scores));
  }

  public static loadHighScores(): Record<GameMode, number> {
    const raw = localStorage.getItem(this.PREFIX + 'high_scores');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // ignore
      }
    }
    return {
      classic: 0,
      timeAttack: 0,
      challenge: 0,
      hardcore: 0,
    };
  }

  public static saveGems(gems: number): void {
    localStorage.setItem(this.PREFIX + 'gems', gems.toString());
  }

  public static loadGems(): number {
    const raw = localStorage.getItem(this.PREFIX + 'gems');
    return raw ? parseInt(raw, 10) : 500; // Give 500 starting gems
  }

  public static savePowerups(powerups: { hammers: number; rotates: number; shuffles: number; undos: number }): void {
    localStorage.setItem(this.PREFIX + 'powerups', JSON.stringify(powerups));
  }

  public static loadPowerups(): { hammers: number; rotates: number; shuffles: number; undos: number } {
    const raw = localStorage.getItem(this.PREFIX + 'powerups');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // ignore
      }
    }
    return {
      hammers: 3,
      rotates: 5,
      shuffles: 3,
      undos: 2,
    };
  }

  public static saveQuests(quests: Quest[]): void {
    localStorage.setItem(this.PREFIX + 'quests', JSON.stringify(quests));
  }

  public static loadQuests(): Quest[] | null {
    const raw = localStorage.getItem(this.PREFIX + 'quests');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  public static saveAchievements(achievements: Achievement[]): void {
    localStorage.setItem(this.PREFIX + 'achievements', JSON.stringify(achievements));
  }

  public static loadAchievements(): Achievement[] | null {
    const raw = localStorage.getItem(this.PREFIX + 'achievements');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
