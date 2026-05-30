import { Text, TextStyle, Graphics } from 'pixi.js';
import { Scene, SceneManager } from '../core/SceneManager';
import { MenuScene } from './MenuScene';
import { gsap } from 'gsap';

export class LoadingScene extends Scene {
  private titleText!: Text;
  private loadingBarBg!: Graphics;
  private loadingBarFill!: Graphics;
  private progress = 0;

  public init(): void {
    // 1. Neon Game Logo
    const titleStyle = new TextStyle({
      fontFamily: 'Space Grotesk',
      fontSize: 48,
      fontWeight: 'bold',
      fill: '#00f2fe',
      dropShadow: {
        alpha: 0.8,
        angle: Math.PI / 6,
        blur: 15,
        color: '#00f2fe',
        distance: 0,
      },
    });

    this.titleText = new Text({ text: 'NEON GRID\nVÔ TẬN', style: titleStyle });
    this.titleText.anchor.set(0.5);
    this.addChild(this.titleText);

    // 2. Loading Bar Background
    this.loadingBarBg = new Graphics();
    this.loadingBarBg.roundRect(-150, -10, 300, 20, 10);
    this.loadingBarBg.fill({ color: 0x1f1f3a, alpha: 0.8 });
    this.loadingBarBg.stroke({ color: 0x00f2fe, width: 2, alpha: 0.3 });
    this.addChild(this.loadingBarBg);

    // 3. Loading Bar Fill
    this.loadingBarFill = new Graphics();
    this.addChild(this.loadingBarFill);

    // 4. Animate loading progress
    const loadingObj = { value: 0 };
    gsap.to(loadingObj, {
      value: 100,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        this.progress = loadingObj.value;
        this.drawProgress();
      },
      onComplete: () => {
        // Proceed to Menu Scene
        SceneManager.changeScene(new MenuScene());
      },
    });

    // Subtly pulse title glow
    gsap.to(this.titleText.scale, {
      x: 1.05,
      y: 1.05,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  private drawProgress(): void {
    this.loadingBarFill.clear();
    if (this.progress <= 0) return;

    const fillWidth = (300 * this.progress) / 100;
    this.loadingBarFill.roundRect(-150, -10, fillWidth, 20, 10);
    this.loadingBarFill.fill({ color: 0x00f2fe });
    // Add inner glow representation
    this.loadingBarFill.stroke({ color: 0xfd6585, width: 1, alpha: 0.7 });
  }

  public update(): void {
    // update logic if any
  }

  public resize(width: number, height: number): void {
    this.titleText.x = width / 2;
    this.titleText.y = height / 2 - 80;

    this.loadingBarBg.x = width / 2;
    this.loadingBarBg.y = height / 2 + 50;

    this.loadingBarFill.x = width / 2;
    this.loadingBarFill.y = height / 2 + 50;
    this.drawProgress();
  }

  public destroyScene(): void {
    gsap.killTweensOf(this.titleText.scale);
  }
}
