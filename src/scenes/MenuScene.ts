import { Container, Text, TextStyle } from 'pixi.js';
import { Scene, SceneManager } from '../core/SceneManager';
import { GameScene } from './GameScene';
import { Button } from '../ui/Button';
import { ShopPopup } from '../ui/ShopPopup';
import { QuestsPopup } from '../ui/QuestsPopup';
import { LeaderboardPopup } from '../ui/LeaderboardPopup';
import { useGameStore, GameMode } from '../systems/stateStore';
import { SoundManager } from '../systems/SoundManager';
import { TweenManager } from '../effects/TweenManager';
import { gsap } from 'gsap';

export class MenuScene extends Scene {
  private titleText!: Text;
  private highscoreText!: Text;
  private modeContainer!: Container;
  private selectedMode: GameMode = 'classic';
  private modeButtons: Record<GameMode, Button> = {} as Record<GameMode, Button>;
  private playBtn!: Button;

  // Footer Buttons
  private shopBtn!: Button;
  private questsBtn!: Button;
  private leaderBtn!: Button;
  private soundBtn!: Button;

  public init(): void {
    // 1. Neon Game Title
    const titleStyle = new TextStyle({
      fontFamily: 'Space Grotesk',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0x00f2fe,
      dropShadow: {
        alpha: 0.8,
        angle: Math.PI / 6,
        blur: 15,
        color: 0x00f2fe,
        distance: 0,
      },
    });

    this.titleText = new Text({ text: 'NEON GRID', style: titleStyle });
    this.titleText.anchor.set(0.5);
    this.addChild(this.titleText);

    // High Score text
    const hsStyle = new TextStyle({
      fontFamily: 'Outfit',
      fontSize: 16,
      fill: 0xffd700,
      fontWeight: '600',
    });
    this.highscoreText = new Text({ text: 'ĐIỂM CAO: 0', style: hsStyle });
    this.highscoreText.anchor.set(0.5);
    this.addChild(this.highscoreText);

    // 2. Mode Selector Container
    this.modeContainer = new Container();
    this.addChild(this.modeContainer);

    this.createModeSelector();

    // 3. Play Button
    this.playBtn = new Button({
      text: 'BẮT ĐẦU',
      width: 260,
      height: 60,
      fontSize: 22,
      bgColor: 0x05f2fe,
      color: 0x03030b,
      borderColor: 0x00f2fe,
      glowColor: 0x00f2fe,
      onClick: () => this.startGame(),
    });
    this.addChild(this.playBtn);

    // 4. Footer Buttons
    this.shopBtn = new Button({
      text: '🛒 CỬA HÀNG',
      width: 110,
      height: 40,
      fontSize: 12,
      bgColor: 0x0e0e22,
      borderColor: 0xffd700,
      glowColor: 0xffd700,
      onClick: () => new ShopPopup().show(this),
    });
    this.addChild(this.shopBtn);

    this.questsBtn = new Button({
      text: '🏆 NHIỆM VỤ',
      width: 110,
      height: 40,
      fontSize: 12,
      bgColor: 0x0e0e22,
      borderColor: 0x39ff14,
      glowColor: 0x39ff14,
      onClick: () => new QuestsPopup().show(this),
    });
    this.addChild(this.questsBtn);

    this.leaderBtn = new Button({
      text: '📊 BẢNG XH',
      width: 110,
      height: 40,
      fontSize: 12,
      bgColor: 0x0e0e22,
      borderColor: 0xa855f7,
      glowColor: 0xa855f7,
      onClick: () => new LeaderboardPopup().show(this),
    });
    this.addChild(this.leaderBtn);

    // Sound toggle
    this.soundBtn = new Button({
      text: '🔊 ÂM THANH: BẬT',
      width: 130,
      height: 36,
      fontSize: 10,
      bgColor: 0x0e0e22,
      borderColor: 0x555577,
      glowColor: 0xffffff,
      onClick: () => this.toggleSound(),
    });
    this.addChild(this.soundBtn);

    // Update sound button label based on initial state
    this.updateSoundButton();

    // Trigger animations
    TweenManager.menuPop(this.titleText, 0.1);
    TweenManager.menuPop(this.modeContainer, 0.25);
    TweenManager.menuPop(this.playBtn, 0.4);
    
    // Select default mode score
    this.selectMode('classic');
  }

  private createModeSelector(): void {
    const modes: Array<{ id: GameMode; name: string; desc: string; color: number }> = [
      { id: 'classic', name: 'CỔ ĐIỂN', desc: 'Chế độ xếp gạch vô tận', color: 0x00f2fe },
      { id: 'timeAttack', name: 'ĐẤU THỜI GIAN', desc: 'Chạy đua trong 3 phút', color: 0xfd6585 },
      { id: 'challenge', name: 'THỬ THÁCH', desc: 'Ăn 20 dòng trong 15 lượt đi', color: 0x39ff14 },
      { id: 'hardcore', name: 'CỰC HẠN', desc: 'Bàn cờ 10x10, gạch khổng lồ', color: 0xa855f7 },
    ];

    const itemHeight = 65;

    modes.forEach((mode, index) => {
      const modeBtn = new Button({
        text: mode.name,
        width: 240,
        height: 45,
        fontSize: 14,
        bgColor: 0x0a0a20,
        borderColor: 0x555577,
        glowColor: mode.color,
        onClick: () => this.selectMode(mode.id),
      });

      modeBtn.y = index * itemHeight;
      this.modeContainer.addChild(modeBtn);
      this.modeButtons[mode.id] = modeBtn;
    });
  }

  private selectMode(mode: GameMode): void {
    this.selectedMode = mode;
    const store = useGameStore.getState();
    const hs = store.highScores[mode] || 0;
    this.highscoreText.text = `ĐIỂM CAO: ${hs.toLocaleString()}`;

    // Highlight selected mode button
    const modesData: Record<GameMode, { name: string; color: number }> = {
      classic: { name: '✦ CỔ ĐIỂN ✦', color: 0x00f2fe },
      timeAttack: { name: '✦ ĐẤU THỜI GIAN ✦', color: 0xfd6585 },
      challenge: { name: '✦ THỬ THÁCH ✦', color: 0x39ff14 },
      hardcore: { name: '✦ CỰC HẠN ✦', color: 0xa855f7 },
    };

    const modeNames: Record<GameMode, string> = {
      classic: 'CỔ ĐIỂN',
      timeAttack: 'ĐẤU THỜI GIAN',
      challenge: 'THỬ THÁCH',
      hardcore: 'CỰC HẠN',
    };

    // Reset all buttons borders and text
    const list = Object.keys(this.modeButtons) as GameMode[];
    list.forEach((m) => {
      const btn = this.modeButtons[m];
      if (m === mode) {
        btn.setText(modesData[m].name);
        gsap.to(btn.scale, { x: 1.08, y: 1.08, duration: 0.2 });
      } else {
        btn.setText(modeNames[m]);
        gsap.to(btn.scale, { x: 1, y: 1, duration: 0.2 });
      }
    });

    // We update the store active mode immediately so other components read it
    useGameStore.setState({ activeMode: mode });
  }

  private toggleSound(): void {
    const isEnabled = SoundManager.isSoundEnabled();
    SoundManager.setSoundEnabled(!isEnabled);
    this.updateSoundButton();
    SoundManager.playClick();
  }

  private updateSoundButton(): void {
    const isEnabled = SoundManager.isSoundEnabled();
    this.soundBtn.setText(`🔊 ÂM THANH: ${isEnabled ? 'BẬT' : 'TẮT'}`);
  }

  private startGame(): void {
    SoundManager.playClick();
    
    // Initialize game store for the selected mode
    useGameStore.getState().initGame(this.selectedMode);

    // Transition to GameScene
    SceneManager.changeScene(new GameScene());
  }

  public update(): void {
    // update logic if any
  }

  public resize(width: number, height: number): void {
    this.titleText.x = width / 2;
    this.titleText.y = 120;

    this.highscoreText.x = width / 2;
    this.highscoreText.y = 180;

    this.modeContainer.x = width / 2;
    // Align selector under title
    this.modeContainer.y = 230;

    this.playBtn.x = width / 2;
    this.playBtn.y = height - 190;

    // Footer buttons layout
    this.questsBtn.x = width / 2;
    this.questsBtn.y = height - 100;

    this.shopBtn.x = width / 2 - 130;
    this.shopBtn.y = height - 100;

    this.leaderBtn.x = width / 2 + 130;
    this.leaderBtn.y = height - 100;

    this.soundBtn.x = width / 2;
    this.soundBtn.y = height - 40;
  }

  public destroyScene(): void {
    // cleanup
  }
}
