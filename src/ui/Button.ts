import { Container, Text, Graphics, TextStyle } from 'pixi.js';
import { SoundManager } from '../systems/SoundManager';
import { gsap } from 'gsap';

interface ButtonOptions {
  text: string;
  width?: number;
  height?: number;
  fontSize?: number;
  color?: number;
  bgColor?: number;
  borderColor?: number;
  glowColor?: number;
  onClick: () => void;
}

export class Button extends Container {
  private bg!: Graphics;
  private btnText!: Text;
  private onClickCallback: () => void;

  constructor(options: ButtonOptions) {
    super();

    const w = options.width || 220;
    const h = options.height || 50;
    const fontSize = options.fontSize || 18;
    const bgColor = options.bgColor !== undefined ? options.bgColor : 0x141430;
    const borderColor = options.borderColor !== undefined ? options.borderColor : 0x00f2fe;
    this.onClickCallback = options.onClick;

    // Background Graphic (Glassmorphism look)
    this.bg = new Graphics();
    this.bg.roundRect(-w / 2, -h / 2, w, h, 12);
    this.bg.fill({ color: bgColor, alpha: 0.85 });
    this.bg.stroke({ color: borderColor, width: 2, alpha: 0.8 });
    this.addChild(this.bg);

    // Text
    const textStyle = new TextStyle({
      fontFamily: 'Space Grotesk',
      fontSize: fontSize,
      fontWeight: 'bold',
      fill: options.color || 0xffffff,
    });

    this.btnText = new Text({ text: options.text, style: textStyle });
    this.btnText.anchor.set(0.5);
    this.addChild(this.btnText);

    // Interactions
    this.interactive = true;
    this.cursor = 'pointer';

    // Hover Animation
    this.on('pointerover', () => {
      SoundManager.playHover();
      gsap.to(this.scale, { x: 1.05, y: 1.05, duration: 0.2, ease: 'power1.out' });
      gsap.to(this.bg, { alpha: 1, duration: 0.2 });
      this.bg.clear();
      this.bg.roundRect(-w / 2, -h / 2, w, h, 12);
      this.bg.fill({ color: bgColor, alpha: 0.95 });
      this.bg.stroke({ color: borderColor, width: 3, alpha: 1 });
    });

    this.on('pointerout', () => {
      gsap.to(this.scale, { x: 1, y: 1, duration: 0.2, ease: 'power1.in' });
      this.bg.clear();
      this.bg.roundRect(-w / 2, -h / 2, w, h, 12);
      this.bg.fill({ color: bgColor, alpha: 0.85 });
      this.bg.stroke({ color: borderColor, width: 2, alpha: 0.8 });
    });

    this.on('pointerdown', () => {
      SoundManager.playClick();
      gsap.to(this.scale, { x: 0.95, y: 0.95, duration: 0.08 });
    });

    this.on('pointerup', () => {
      gsap.to(this.scale, { x: 1.05, y: 1.05, duration: 0.1 });
      this.onClickCallback();
    });

    this.on('pointerupoutside', () => {
      gsap.to(this.scale, { x: 1, y: 1, duration: 0.1 });
    });
  }

  public setText(text: string): void {
    this.btnText.text = text;
  }
}
