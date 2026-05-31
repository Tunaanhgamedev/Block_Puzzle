import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Button } from './Button';
import { SoundManager } from '../systems/SoundManager';
import { SceneManager } from '../core/SceneManager';
import { gsap } from 'gsap';

export class Popup extends Container {
  protected bg!: Graphics;
  public container!: Container;
  protected titleText!: Text;
  protected closeBtn!: Button;

  constructor(title: string, width = 440, height = 600) {
    super();

    this.eventMode = 'static';

    // Full screen blocking backdrop (darkened overlay)
    this.bg = new Graphics();
    this.bg.rect(0, 0, 1000, 1500); // large size to cover
    this.bg.fill({ color: 0x020208, alpha: 0.75 });
    this.bg.eventMode = 'static';
    this.addChild(this.bg);

    // Popup container (centered)
    this.container = new Container();
    this.addChild(this.container);

    // Glass panel background
    const panel = new Graphics();
    panel.roundRect(-width / 2, -height / 2, width, height, 24);
    panel.fill({ color: 0x0a0a20, alpha: 0.9 });
    // Bright neon purple border glow
    panel.stroke({ color: 0xa855f7, width: 3, alpha: 0.8 });
    this.container.addChild(panel);

    // Header Title
    const titleStyle = new TextStyle({
      fontFamily: 'Space Grotesk',
      fontSize: 28,
      fontWeight: 'bold',
      fill: 0xa855f7,
    });
    this.titleText = new Text({ text: title, style: titleStyle });
    this.titleText.anchor.set(0.5, 0);
    this.titleText.y = -height / 2 + 25;
    this.container.addChild(this.titleText);

    // Close Button at bottom
    this.closeBtn = new Button({
      text: 'ĐÓNG',
      width: 140,
      height: 40,
      fontSize: 14,
      bgColor: 0x1a0f30,
      borderColor: 0xfd6585,
      glowColor: 0xfd6585,
      onClick: () => this.close(),
    });
    this.closeBtn.y = height / 2 - 40;
    this.container.addChild(this.closeBtn);
  }

  public show(parent: Container): void {
    parent.addChild(this);
    this.resize(SceneManager.getWidth(), SceneManager.getHeight());

    // Pop-in animation
    this.container.scale.set(0);
    this.bg.alpha = 0;

    gsap.to(this.bg, { alpha: 1, duration: 0.25 });
    gsap.to(this.container.scale, { x: 1, y: 1, duration: 0.4, ease: 'back.out(1.2)' });
  }

  public close(): void {
    SoundManager.playClick();
    gsap.to(this.bg, { alpha: 0, duration: 0.2 });
    gsap.to(this.container.scale, {
      x: 0,
      y: 0,
      duration: 0.25,
      ease: 'back.in(1.2)',
      onComplete: () => {
        if (this.parent) {
          this.parent.removeChild(this);
        }
        this.destroy({ children: true });
      },
    });
  }

  public resize(width: number, height: number): void {
    this.bg.clear();
    this.bg.rect(0, 0, width, height);
    this.bg.fill({ color: 0x020208, alpha: 0.75 });

    this.container.x = width / 2;
    this.container.y = height / 2;
  }
}
