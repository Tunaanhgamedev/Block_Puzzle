import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { Scene, SceneManager } from '../core/SceneManager';
import { GameScene } from './GameScene';
import { MenuScene } from './MenuScene';
import { Button } from '../ui/Button';
import { useGameStore } from '../systems/stateStore';
import { SoundManager } from '../systems/SoundManager';
import { TweenManager } from '../effects/TweenManager';
import { ParticleManager } from '../effects/ParticleManager';

export class ResultScene extends Scene {
  private titleText!: Text;
  private resultBox!: Container;
  private scoreText!: Text;
  private highscoreText!: Text;
  private statsText!: Text;
  private replayBtn!: Button;
  private menuBtn!: Button;

  public init(): void {
    const store = useGameStore.getState();
    const isVictory = store.activeMode === 'challenge' && store.linesCleared >= store.linesClearedTarget;

    // 1. Title Banner
    const titleStyle = new TextStyle({
      fontFamily: 'Space Grotesk',
      fontSize: 44,
      fontWeight: 'bold',
      fill: isVictory ? 0x39ff14 : 0xfd6585,
      dropShadow: {
        alpha: 0.8,
        blur: 15,
        color: isVictory ? 0x39ff14 : 0xfd6585,
        distance: 0,
      },
    });

    const titleStr = isVictory ? 'CHIẾN THẮNG!' : 'GAME OVER';
    this.titleText = new Text({ text: titleStr, style: titleStyle });
    this.titleText.anchor.set(0.5);
    this.addChild(this.titleText);

    // 2. Results Container Box (Glassmorphic)
    this.resultBox = new Container();
    this.addChild(this.resultBox);

    const boxBg = new Graphics();
    boxBg.roundRect(-180, -120, 360, 240, 16);
    boxBg.fill({ color: 0x0a0a20, alpha: 0.95 });
    boxBg.stroke({ color: isVictory ? 0x39ff14 : 0x00f2fe, width: 2, alpha: 0.5 });
    this.resultBox.addChild(boxBg);

    // Final Score
    const scoreStyle = new TextStyle({
      fontFamily: 'Space Grotesk',
      fontSize: 32,
      fontWeight: 'bold',
      fill: 0xffffff,
    });
    this.scoreText = new Text({ text: `ĐIỂM SỐ: ${store.score.toLocaleString()}`, style: scoreStyle });
    this.scoreText.anchor.set(0.5);
    this.scoreText.y = -60;
    this.resultBox.addChild(this.scoreText);

    // Best Score
    const highscoreVal = store.highScores[store.activeMode] || 0;
    const hsStyle = new TextStyle({
      fontFamily: 'Outfit',
      fontSize: 16,
      fill: 0xffd700,
      fontWeight: '600',
    });
    this.highscoreText = new Text({ text: `ĐIỂM CAO: ${highscoreVal.toLocaleString()}`, style: hsStyle });
    this.highscoreText.anchor.set(0.5);
    this.highscoreText.y = -20;
    this.resultBox.addChild(this.highscoreText);

    // Show highscore highlight banner if matched
    if (store.score >= highscoreVal && store.score > 0) {
      const bannerStyle = new TextStyle({
        fontFamily: 'Space Grotesk',
        fontSize: 12,
        fontWeight: 'bold',
        fill: 0x03030b,
      });
      const bannerBg = new Graphics();
      bannerBg.roundRect(-80, 5, 160, 22, 6);
      bannerBg.fill({ color: 0xffd700 });
      this.resultBox.addChild(bannerBg);

      const banner = new Text({ text: 'KỶ LỤC CÁ NHÂN MỚI!', style: bannerStyle });
      banner.anchor.set(0.5);
      banner.y = 16;
      this.resultBox.addChild(banner);
    }

    // Stats details
    const statsStyle = new TextStyle({
      fontFamily: 'Outfit',
      fontSize: 14,
      fill: 0xb0b0cf,
      align: 'center',
    });
    
    // Gems earned
    // Give player gems based on score / 10
    const gemsGained = Math.floor(store.score / 15) + (isVictory ? 150 : 0);
    if (gemsGained > 0) {
      store.addGems(gemsGained);
    }

    const statsStr = `Dòng đã xóa: ${store.linesCleared}\nCombo tối đa: x${store.maxCombo}\nNgọc nhận được: 💎 ${gemsGained}`;
    this.statsText = new Text({ text: statsStr, style: statsStyle });
    this.statsText.anchor.set(0.5);
    this.statsText.y = 65;
    this.resultBox.addChild(this.statsText);

    // 3. Replay Button
    this.replayBtn = new Button({
      text: 'CHƠI LẠI',
      width: 220,
      height: 52,
      fontSize: 18,
      bgColor: 0x0c301b,
      borderColor: 0x39ff14,
      glowColor: 0x39ff14,
      onClick: () => this.replay(),
    });
    this.addChild(this.replayBtn);

    // 4. Main Menu Button
    this.menuBtn = new Button({
      text: 'TRANG CHỦ',
      width: 220,
      height: 52,
      fontSize: 18,
      bgColor: 0x1f1f3a,
      borderColor: 0x00f2fe,
      glowColor: 0x00f2fe,
      onClick: () => this.goToMenu(),
    });
    this.addChild(this.menuBtn);

    // Dynamic animation entrance
    TweenManager.menuPop(this.titleText, 0.1);
    TweenManager.menuPop(this.resultBox, 0.25);
    TweenManager.menuPop(this.replayBtn, 0.4);
    TweenManager.menuPop(this.menuBtn, 0.55);

    // Spawn sparks if victory
    if (isVictory) {
      setTimeout(() => {
        ParticleManager.getInstance().spawnCelebration(SceneManager.getWidth(), SceneManager.getHeight());
      }, 300);
    }
  }

  private replay(): void {
    SoundManager.playClick();
    const mode = useGameStore.getState().activeMode;
    useGameStore.getState().initGame(mode);
    SceneManager.changeScene(new GameScene());
  }

  private goToMenu(): void {
    SoundManager.playClick();
    SceneManager.changeScene(new MenuScene());
  }

  public update(): void {
    // update logic if any
  }

  public resize(width: number, height: number): void {
    this.titleText.x = width / 2;
    this.titleText.y = height / 2 - 220;

    this.resultBox.x = width / 2;
    this.resultBox.y = height / 2 - 20;

    this.replayBtn.x = width / 2;
    this.replayBtn.y = height / 2 + 150;

    this.menuBtn.x = width / 2;
    this.menuBtn.y = height / 2 + 220;
  }

  public destroyScene(): void {
    // cleanup
  }
}
