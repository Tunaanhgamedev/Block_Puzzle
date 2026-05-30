import { Popup } from './Popup';
import { Button } from './Button';
import { Text, TextStyle, Container, Graphics } from 'pixi.js';
import { useGameStore } from '../systems/stateStore';

export class LeaderboardPopup extends Popup {
  private listContainer!: Container;
  private tabType: 'daily' | 'weekly' | 'monthly' = 'weekly';
  private tabDailyBtn!: Button;
  private tabWeeklyBtn!: Button;
  private tabMonthlyBtn!: Button;

  constructor() {
    super('BẢNG XẾP HẠNG', 440, 640);
    this.createContent();
  }

  private createContent(): void {
    // 1. Tab buttons
    const tabY = -210;
    this.tabDailyBtn = new Button({
      text: 'HÀNG NGÀY',
      width: 100,
      height: 34,
      fontSize: 11,
      bgColor: 0x0c0c1e,
      borderColor: 0x555577,
      glowColor: 0x00f2fe,
      onClick: () => this.switchTab('daily'),
    });
    this.tabDailyBtn.x = -110;
    this.tabDailyBtn.y = tabY;
    this.container.addChild(this.tabDailyBtn);

    this.tabWeeklyBtn = new Button({
      text: 'HÀNG TUẦN',
      width: 100,
      height: 34,
      fontSize: 11,
      bgColor: 0x140d30,
      borderColor: 0xa855f7,
      glowColor: 0xa855f7,
      onClick: () => this.switchTab('weekly'),
    });
    this.tabWeeklyBtn.x = 0;
    this.tabWeeklyBtn.y = tabY;
    this.container.addChild(this.tabWeeklyBtn);

    this.tabMonthlyBtn = new Button({
      text: 'HÀNG THÁNG',
      width: 100,
      height: 34,
      fontSize: 11,
      bgColor: 0x0c0c1e,
      borderColor: 0x555577,
      glowColor: 0xfd6585,
      onClick: () => this.switchTab('monthly'),
    });
    this.tabMonthlyBtn.x = 110;
    this.tabMonthlyBtn.y = tabY;
    this.container.addChild(this.tabMonthlyBtn);

    // 2. Entries container
    this.listContainer = new Container();
    this.listContainer.y = -160;
    this.container.addChild(this.listContainer);

    this.drawLeaderboard();
  }

  private switchTab(type: 'daily' | 'weekly' | 'monthly'): void {
    this.tabType = type;

    // A hacky way to toggle borders in our button (since it's a simple class, we can re-create them or just change variables)
    // For simplicity, we just draw with standard highlights
    this.drawLeaderboard();
  }

  private drawLeaderboard(): void {
    this.listContainer.removeChildren();

    const store = useGameStore.getState();
    const activeMode = store.activeMode;
    const playerHighScore = store.highScores[activeMode] || 0;

    // Mock high scores for top players based on tab type
    const multiplier = this.tabType === 'daily' ? 1.0 : this.tabType === 'weekly' ? 1.5 : 2.5;
    const mockPlayers = [
      { rank: 1, name: 'CyberGrid_99', score: Math.round(4500 * multiplier), color: 0xffd700 }, // Gold
      { rank: 2, name: 'NeonPulse', score: Math.round(3800 * multiplier), color: 0xc0c0c0 }, // Silver
      { rank: 3, name: 'BlockBlaster', score: Math.round(3200 * multiplier), color: 0xcd7f32 }, // Bronze
      { rank: 4, name: 'VortexPlayer', score: Math.round(2500 * multiplier), color: 0x00f2fe },
      { rank: 5, name: 'ViteGamer', score: Math.round(1900 * multiplier), color: 0xa855f7 },
      { rank: 6, name: 'Woodoku_Fan', score: Math.round(1500 * multiplier), color: 0xfd6585 },
      // Player row is rank 7
      { rank: 7, name: 'BẠN (Người chơi)', score: playerHighScore, color: 0x39ff14, isPlayer: true },
    ].sort((a, b) => b.score - a.score);

    // Assign new rank sorting
    mockPlayers.forEach((p, idx) => {
      p.rank = idx + 1;
    });

    const rowHeight = 52;
    mockPlayers.forEach((p, idx) => {
      const row = new Container();
      row.y = idx * rowHeight;

      // Background box
      const box = new Graphics();
      box.roundRect(-190, 0, 380, 44, 8);
      if (p.isPlayer) {
        box.fill({ color: 0x142b1b, alpha: 0.85 }); // green tint
        box.stroke({ color: 0x39ff14, width: 2, alpha: 0.9 });
      } else {
        box.fill({ color: 0x0a0a18, alpha: 0.8 });
        box.stroke({ color: p.color, width: 1, alpha: 0.4 });
      }
      row.addChild(box);

      // Rank Text
      const rankStyle = new TextStyle({
        fontFamily: 'Space Grotesk',
        fontSize: 14,
        fontWeight: 'bold',
        fill: p.color,
      });
      const rankTxt = new Text({ text: `#${p.rank}`, style: rankStyle });
      rankTxt.x = -175;
      rankTxt.y = 12;
      row.addChild(rankTxt);

      // Name Text
      const nameStyle = new TextStyle({
        fontFamily: 'Outfit',
        fontSize: 13,
        fontWeight: p.isPlayer ? 'bold' : 'normal',
        fill: p.isPlayer ? 0x39ff14 : 0xffffff,
      });
      const nameTxt = new Text({ text: p.name, style: nameStyle });
      nameTxt.x = -120;
      nameTxt.y = 12;
      row.addChild(nameTxt);

      // Score Text
      const scoreStyle = new TextStyle({
        fontFamily: 'Space Grotesk',
        fontSize: 14,
        fontWeight: 'bold',
        fill: p.isPlayer ? 0x39ff14 : 0xffffff,
      });
      const scoreTxt = new Text({ text: p.score.toLocaleString(), style: scoreStyle });
      scoreTxt.anchor.set(1, 0);
      scoreTxt.x = 170;
      scoreTxt.y = 12;
      row.addChild(scoreTxt);

      this.listContainer.addChild(row);
    });
  }
}
