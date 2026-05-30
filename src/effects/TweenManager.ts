import { gsap } from 'gsap';
import { Container } from 'pixi.js';

export class TweenManager {
  /**
   * Performs a premium screen shake effect.
   */
  public static shake(target: Container, intensity: number = 5, duration: number = 0.5): void {
    const originalX = target.x;
    const originalY = target.y;
    const tl = gsap.timeline();

    const steps = 10;
    const stepDuration = duration / steps;

    for (let i = 0; i < steps; i++) {
      const dx = (Math.random() - 0.5) * intensity;
      const dy = (Math.random() - 0.5) * intensity;
      tl.to(target, {
        x: originalX + dx,
        y: originalY + dy,
        duration: stepDuration,
        ease: 'power1.out',
      });
    }

    // Reset to original position
    tl.to(target, {
      x: originalX,
      y: originalY,
      duration: stepDuration,
      ease: 'power1.inOut',
    });
  }

  /**
   * Animates a block placement with a scale bounce.
   */
  public static animatePlacement(target: Container, duration: number = 0.25): void {
    gsap.fromTo(
      target.scale,
      { x: 1.15, y: 1.15 },
      { x: 1, y: 1, duration: duration, ease: 'back.out(2)' }
    );
  }

  /**
   * Slowly zooms the camera (the whole board/scene) to 105% and back for combo satisfaction.
   */
  public static cameraZoom(target: Container, duration: number = 0.6): void {
    const originalScale = target.scale.x;
    gsap.timeline()
      .to(target.scale, {
        x: originalScale * 1.05,
        y: originalScale * 1.05,
        duration: duration * 0.4,
        ease: 'power2.out'
      })
      .to(target.scale, {
        x: originalScale,
        y: originalScale,
        duration: duration * 0.6,
        ease: 'power2.inOut'
      });
  }

  /**
   * Animates floating neon combo / score texts.
   */
  public static floatText(
    textNode: Container,
    duration: number = 1.2,
    yOffset: number = -60
  ): void {
    gsap.timeline()
      .fromTo(
        textNode,
        { alpha: 0, y: textNode.y },
        { alpha: 1, duration: 0.2, ease: 'power1.out' }
      )
      .to(textNode, {
        y: textNode.y + yOffset,
        duration: duration - 0.2,
        ease: 'power1.inOut'
      }, '-=0.1')
      .to(textNode, {
        alpha: 0,
        duration: 0.3,
        ease: 'power1.in'
      }, `-=${0.3}`)
      .call(() => {
        if (textNode.parent) {
          textNode.parent.removeChild(textNode);
          textNode.destroy({ children: true });
        }
      });
  }

  /**
   * Glow pulse animation on elements.
   */
  public static pulseGlow(target: Container, duration: number = 1.5): void {
    gsap.fromTo(
      target,
      { alpha: 0.7 },
      { alpha: 1, duration: duration, repeat: -1, yoyo: true, ease: 'sine.inOut' }
    );
  }

  /**
   * Perfect clear overlay flash.
   */
  public static perfectClearFlash(overlay: Container, duration: number = 1): void {
    gsap.timeline()
      .fromTo(overlay, { alpha: 0 }, { alpha: 0.8, duration: 0.15, ease: 'power2.out' })
      .to(overlay, { alpha: 0, duration: duration - 0.15, ease: 'power2.inOut' });
  }

  /**
   * Menu entry animations
   */
  public static menuPop(target: Container, delay: number = 0): void {
    gsap.fromTo(
      target.scale,
      { x: 0, y: 0 },
      { x: 1, y: 1, duration: 0.5, delay: delay, ease: 'back.out(1.5)' }
    );
    gsap.fromTo(
      target,
      { alpha: 0 },
      { alpha: 1, duration: 0.4, delay: delay }
    );
  }
}
