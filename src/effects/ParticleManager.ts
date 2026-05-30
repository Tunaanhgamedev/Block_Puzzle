import { Container, Sprite, Texture, Graphics, Renderer } from 'pixi.js';

interface Particle {
  sprite: Sprite;
  vx: number;
  vy: number;
  alphaSpeed: number;
  scaleSpeed: number;
  life: number;
  active: boolean;
  gravity?: number;
}

export class ParticleManager {
  private static instance: ParticleManager;
  private particlePool: Particle[] = [];
  private activeParticles: Particle[] = [];
  private particleTexture: Texture | null = null;
  private container: Container | null = null;

  private constructor() {}

  public static getInstance(): ParticleManager {
    if (!ParticleManager.instance) {
      ParticleManager.instance = new ParticleManager();
    }
    return ParticleManager.instance;
  }

  /**
   * Initializes the particle manager with a container and a renderer to generate texture dynamically.
   */
  public init(container: Container, renderer: Renderer): void {
    this.container = container;

    // Create a circular particle texture programmatically
    const g = new Graphics();
    g.circle(0, 0, 8);
    g.fill({ color: 0xffffff });
    
    this.particleTexture = renderer.generateTexture(g);
    g.destroy();

    // Pre-populate pool with 150 particles
    for (let i = 0; i < 150; i++) {
      const sprite = new Sprite(this.particleTexture);
      sprite.anchor.set(0.5);
      sprite.visible = false;
      this.particlePool.push({
        sprite,
        vx: 0,
        vy: 0,
        alphaSpeed: 0,
        scaleSpeed: 0,
        life: 0,
        active: false,
      });
    }
  }

  /**
   * Spawn explosion particles of a specific color at (x, y)
   */
  public spawnExplosion(x: number, y: number, color: number, count: number = 15): void {
    if (!this.container) return;

    for (let i = 0; i < count; i++) {
      const p = this.getFreeParticle();
      if (!p) break;

      // Random direction and velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.gravity = 0.15; // fall down slightly

      p.sprite.tint = color;
      p.sprite.x = x;
      p.sprite.y = y;
      
      const scale = 0.4 + Math.random() * 0.8;
      p.sprite.scale.set(scale);
      p.sprite.alpha = 1;
      p.sprite.visible = true;

      p.life = 1.0; // full lifetime
      p.alphaSpeed = 0.02 + Math.random() * 0.02;
      p.scaleSpeed = 0.015 + Math.random() * 0.015;

      this.container.addChild(p.sprite);
      p.active = true;
      this.activeParticles.push(p);
    }
  }

  /**
   * Spawn sparkling trails
   */
  public spawnTrail(x: number, y: number, color: number): void {
    if (!this.container) return;

    const p = this.getFreeParticle();
    if (!p) return;

    // Small velocity float up
    p.vx = (Math.random() - 0.5) * 2;
    p.vy = -0.5 - Math.random() * 1.5;
    p.gravity = -0.05; // float up

    p.sprite.tint = color;
    p.sprite.x = x;
    p.sprite.y = y;
    
    const scale = 0.2 + Math.random() * 0.4;
    p.sprite.scale.set(scale);
    p.sprite.alpha = 0.8;
    p.sprite.visible = true;

    p.life = 0.8;
    p.alphaSpeed = 0.04;
    p.scaleSpeed = 0.02;

    this.container.addChild(p.sprite);
    p.active = true;
    this.activeParticles.push(p);
  }

  /**
   * Spawn fireworks-like celebration particles (for perfect clear or high score)
   */
  public spawnCelebration(width: number, height: number): void {
    const colors = [0x00f2fe, 0xfd6585, 0xa855f7, 0x39ff14, 0xffd700];
    for (let j = 0; j < 5; j++) {
      setTimeout(() => {
        const randX = Math.random() * width;
        const randY = Math.random() * (height * 0.6); // upper part of screen
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.spawnExplosion(randX, randY, color, 30);
      }, j * 200);
    }
  }

  /**
   * Updates all active particles. Call this in the main game loop (Pixi ticker).
   */
  public update(tickerDelta: number): void {
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      if (!p.active) continue;

      // Apply velocities
      p.sprite.x += p.vx * tickerDelta;
      p.sprite.y += p.vy * tickerDelta;

      if (p.gravity !== undefined) {
        p.vy += p.gravity * tickerDelta;
      }

      // Apply decay
      p.life -= 0.016 * tickerDelta;
      p.sprite.alpha -= p.alphaSpeed * tickerDelta;
      
      const newScale = Math.max(0, p.sprite.scale.x - p.scaleSpeed * tickerDelta);
      p.sprite.scale.set(newScale);

      // Return to pool if dead
      if (p.life <= 0 || p.sprite.alpha <= 0 || newScale <= 0) {
        p.sprite.visible = false;
        p.active = false;
        if (p.sprite.parent) {
          p.sprite.parent.removeChild(p.sprite);
        }
        this.activeParticles.splice(i, 1);
      }
    }
  }

  /**
   * Get an unused particle from the pool.
   */
  private getFreeParticle(): Particle | null {
    // Look for existing inactive particle
    for (let i = 0; i < this.particlePool.length; i++) {
      if (!this.particlePool[i].active) {
        return this.particlePool[i];
      }
    }

    // If none found, create a new one dynamically and add to pool
    if (this.particleTexture) {
      const sprite = new Sprite(this.particleTexture);
      sprite.anchor.set(0.5);
      sprite.visible = false;
      const newParticle = {
        sprite,
        vx: 0,
        vy: 0,
        alphaSpeed: 0,
        scaleSpeed: 0,
        life: 0,
        active: false,
      };
      this.particlePool.push(newParticle);
      return newParticle;
    }

    return null;
  }
}
