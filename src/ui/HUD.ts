import { Container, Text, TextStyle } from 'pixi.js';
import { Button } from './Button';
import { useGameStore } from '../systems/stateStore';
import { SoundManager } from '../systems/SoundManager';
import { ShopPopup } from './ShopPopup';

export class HUD extends Container {
  private scoreText!: Text;
  private gemsText!: Text;
  private targetText!: Text;
  private timerText!: Text;

  // Powerup buttons
  public hammerBtn!: Button;
  public rotateBtn!: Button;
  public shuffleBtn!: Button;
  public undoBtn!: Button;
  private pauseBtn!: Button;

  private onPauseCallback: () => void;

  constructor(onPause: () => void) {
    super();
    this.onPauseCallback = onPause;
    this.createHUD();
  }

  private createHUD(): void {
    const textStyle = new TextStyle({
      fontFamily: 'Space Grotesk',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 0xffffff,
    });

    // 1. Score Display
    this.scoreText = new Text({ text: 'DIỂM: 0', style: textStyle });
    this.scoreText.x = 25;
    this.scoreText.y = 25;
    this.addChild(this.scoreText);

    // 2. Gems Display
    const gemsStyle = new TextStyle({
      fontFamily: 'Space Grotesk',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0xffd700,
    });
    this.gemsText = new Text({ text: '💎 500', style: gemsStyle });
    this.gemsText.x = 25;
    this.gemsText.y = 55;
    this.gemsText.interactive = true;
    this.gemsText.cursor = 'pointer';
    this.gemsText.on('pointerdown', () => {
      // Clicking gems HUD opens the Shop popup
      SoundManager.playClick();
      const shop = new ShopPopup();
      // Look for the stage or parent to overlay
      if (this.parent) {
        shop.show(this.parent);
      }
    });
    this.addChild(this.gemsText);

    // 3. Objectives (Challenge/Time Attack info)
    const objStyle = new TextStyle({
      fontFamily: 'Space Grotesk',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0x39ff14,
    });
    this.targetText = new Text({ text: '', style: objStyle });
    this.targetText.anchor.set(0.5, 0);
    this.targetText.x = 270; // middle
    this.targetText.y = 25;
    this.addChild(this.targetText);

    // 4. Timer / Move Count Display
    this.timerText = new Text({ text: '', style: objStyle });
    this.timerText.anchor.set(0.5, 0);
    this.timerText.x = 270;
    this.timerText.y = 55;
    this.addChild(this.timerText);

    // 5. Pause Button
    this.pauseBtn = new Button({
      text: '⏸',
      width: 44,
      height: 44,
      fontSize: 16,
      bgColor: 0x1f1f3a,
      borderColor: 0x00f2fe,
      glowColor: 0x00f2fe,
      onClick: () => this.onPauseCallback(),
    });
    this.pauseBtn.x = 540 - 45;
    this.pauseBtn.y = 47;
    this.addChild(this.pauseBtn);

    // 6. Powerups Panel (Bottom UI)
    this.createPowerupsPanel();
  }

  private createPowerupsPanel(): void {
    const store = useGameStore.getState();
    const btnWidth = 110;
    const btnHeight = 44;
    const spacing = 120;
    const startX = 270 - (spacing * 1.5);
    const panelY = 820; // Will be scaled relative to screen size in resize()

    // Hammer
    this.hammerBtn = new Button({
      text: `🔨 BÚA (${store.hammers})`,
      width: btnWidth,
      height: btnHeight,
      fontSize: 10,
      bgColor: 0x111124,
      borderColor: 0x00f2fe,
      glowColor: 0x00f2fe,
      onClick: () => this.onPowerupClick('hammer'),
    });
    this.hammerBtn.x = startX;
    this.hammerBtn.y = panelY;
    this.addChild(this.hammerBtn);

    // Rotate
    this.rotateBtn = new Button({
      text: `🔄 XOAY (${store.rotates})`,
      width: btnWidth,
      height: btnHeight,
      fontSize: 10,
      bgColor: 0x111124,
      borderColor: 0x39ff14,
      glowColor: 0x39ff14,
      onClick: () => this.onPowerupClick('rotate'),
    });
    this.rotateBtn.x = startX + spacing;
    this.rotateBtn.y = panelY;
    this.addChild(this.rotateBtn);

    // Shuffle
    this.shuffleBtn = new Button({
      text: `🔀 ĐỔI LẠI (${store.shuffles})`,
      width: btnWidth,
      height: btnHeight,
      fontSize: 10,
      bgColor: 0x111124,
      borderColor: 0xff6700,
      glowColor: 0xff6700,
      onClick: () => this.onPowerupClick('shuffle'),
    });
    this.shuffleBtn.x = startX + spacing * 2;
    this.shuffleBtn.y = panelY;
    this.addChild(this.shuffleBtn);

    // Undo
    this.undoBtn = new Button({
      text: `⏪ HOÀN TÁC (${store.undos})`,
      width: btnWidth,
      height: btnHeight,
      fontSize: 10,
      bgColor: 0x111124,
      borderColor: 0xfd6585,
      glowColor: 0xfd6585,
      onClick: () => this.onPowerupClick('undo'),
    });
    this.undoBtn.x = startX + spacing * 3;
    this.undoBtn.y = panelY;
    this.addChild(this.undoBtn);
  }

  private onPowerupClick(type: 'hammer' | 'rotate' | 'shuffle' | 'undo'): void {
    const store = useGameStore.getState();
    
    // Check if player has the items
    if (type === 'hammer') {
      if (store.hammers > 0) {
        SoundManager.playClick();
        const active = store.activeSkill === 'hammer' ? null : 'hammer';
        store.setActiveSkill(active);
      } else {
        // Open Shop on zero powerups
        SoundManager.playGameOver();
        if (this.parent) new ShopPopup().show(this.parent);
      }
    } else if (type === 'rotate') {
      if (store.rotates > 0) {
        SoundManager.playClick();
        const active = store.activeSkill === 'rotate' ? null : 'rotate';
        store.setActiveSkill(active);
      } else {
        SoundManager.playGameOver();
        if (this.parent) new ShopPopup().show(this.parent);
      }
    } else if (type === 'shuffle') {
      if (store.shuffles > 0) {
        // Handled in GameScene directly (since it needs to generate new blocks and redraw them)
        // We will register a custom event or let GameScene check store state
        SoundManager.playSkill();
        store.useShuffle();
      } else {
        SoundManager.playGameOver();
        if (this.parent) new ShopPopup().show(this.parent);
      }
    } else if (type === 'undo') {
      if (store.undos > 0) {
        if (store.undoHistory.length > 0) {
          SoundManager.playSkill();
          store.useUndo();
        } else {
          // No history to undo
          SoundManager.playGameOver();
        }
      } else {
        SoundManager.playGameOver();
        if (this.parent) new ShopPopup().show(this.parent);
      }
    }
    
    this.refresh();
  }

  public refresh(): void {
    const store = useGameStore.getState();
    this.scoreText.text = `DIỂM: ${store.score.toLocaleString()}`;
    this.gemsText.text = `💎 ${store.gems}`;

    // Update powerup buttons labels
    this.hammerBtn.setText(`🔨 BÚA (${store.hammers})`);
    this.rotateBtn.setText(`🔄 XOAY (${store.rotates})`);
    this.shuffleBtn.setText(`🔀 ĐỔI LẠI (${store.shuffles})`);
    this.undoBtn.setText(`⏪ HOÀN TÁC (${store.undos})`);

    // Skill status colors
    this.hammerBtn.scale.set(store.activeSkill === 'hammer' ? 1.08 : 1);
    this.rotateBtn.scale.set(store.activeSkill === 'rotate' ? 1.08 : 1);

    // Context headers
    if (store.activeMode === 'challenge') {
      this.targetText.text = `MỤC TIÊU: XÓA ${store.linesClearedTarget} DÒNG`;
      this.timerText.text = `LƯỢT ĐI CÒN LẠI: ${store.movesLeft}`;
      this.timerText.style.fill = store.movesLeft <= 3 ? '#fd6585' : '#39ff14';
    } else if (store.activeMode === 'timeAttack') {
      this.targetText.text = `CHẾ ĐỘ: ĐẤU THỜI GIAN`;
      const minutes = Math.floor(store.timeLeft / 60);
      const seconds = store.timeLeft % 60;
      this.timerText.text = `THỜI GIAN CÒN LẠI: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      this.timerText.style.fill = store.timeLeft <= 30 ? '#fd6585' : '#39ff14';
    } else if (store.activeMode === 'hardcore') {
      this.targetText.text = `CHẾ ĐỘ: CỰC HẠN`;
      this.timerText.text = `BÀN CỜ 10 x 10`;
      this.timerText.style.fill = '#a855f7';
    } else {
      this.targetText.text = `CHẾ ĐỘ: CỔ ĐIỂN`;
      this.timerText.text = `VÔ TẬN`;
      this.timerText.style.fill = '#00f2fe';
    }
  }

  public resize(width: number, height: number): void {
    // Top headers positioning
    this.pauseBtn.x = width - 45;

    // Reposition powerup panel at the bottom
    const spacing = 120;
    const startX = width / 2 - (spacing * 1.5);
    const panelY = height - 100;

    this.hammerBtn.x = startX;
    this.hammerBtn.y = panelY;

    this.rotateBtn.x = startX + spacing;
    this.rotateBtn.y = panelY;

    this.shuffleBtn.x = startX + spacing * 2;
    this.shuffleBtn.y = panelY;

    this.undoBtn.x = startX + spacing * 3;
    this.undoBtn.y = panelY;
  }
}
