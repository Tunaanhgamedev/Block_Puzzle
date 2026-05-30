import { Container, Application } from 'pixi.js';
import { gsap } from 'gsap';

export abstract class Scene extends Container {
  public abstract init(): void;
  public abstract update(delta: number): void;
  public abstract resize(width: number, height: number): void;
  public abstract destroyScene(): void;
}

export class SceneManager {
  private static app: Application | null = null;
  private static currentScene: Scene | null = null;
  private static width = 800;
  private static height = 600;

  public static init(app: Application, defaultWidth = 800, defaultHeight = 600): void {
    SceneManager.app = app;
    SceneManager.width = defaultWidth;
    SceneManager.height = defaultHeight;

    // Window resize event listener
    window.addEventListener('resize', () => SceneManager.resize());
    SceneManager.resize();
  }

  public static async changeScene(newScene: Scene): Promise<void> {
    if (!SceneManager.app) return;

    const oldScene = SceneManager.currentScene;
    SceneManager.currentScene = newScene;

    // Call init on new scene
    newScene.init();
    newScene.resize(SceneManager.width, SceneManager.height);
    newScene.alpha = 0;
    SceneManager.app.stage.addChild(newScene);

    // Fade transition using GSAP
    if (oldScene) {
      await gsap.to(oldScene, { alpha: 0, duration: 0.3 }).then();
      SceneManager.app.stage.removeChild(oldScene);
      oldScene.destroyScene();
      oldScene.destroy({ children: true });
    }

    await gsap.to(newScene, { alpha: 1, duration: 0.3 }).then();
  }

  public static update(delta: number): void {
    if (SceneManager.currentScene) {
      SceneManager.currentScene.update(delta);
    }
  }

  public static resize(): void {
    if (!SceneManager.app) return;

    // Calculate window scale to fit standard resolution (e.g. 540x960 aspect ratio or similar)
    // We want a mobile-friendly 9:16 layout, centered
    const targetWidth = 540;
    const targetHeight = 960;
    
    const parentWidth = window.innerWidth;
    const parentHeight = window.innerHeight;

    // Fit canvas aspect ratio to window
    const scale = Math.min(parentWidth / targetWidth, parentHeight / targetHeight);
    const canvasWidth = Math.round(targetWidth * scale);
    const canvasHeight = Math.round(targetHeight * scale);

    SceneManager.app.renderer.resize(canvasWidth, canvasHeight);

    // Scale stage content to target layout
    SceneManager.app.stage.scale.set(scale);

    // Keep dimensions
    SceneManager.width = targetWidth;
    SceneManager.height = targetHeight;

    if (SceneManager.currentScene) {
      SceneManager.currentScene.resize(targetWidth, targetHeight);
    }
  }

  public static getWidth(): number {
    return SceneManager.width;
  }

  public static getHeight(): number {
    return SceneManager.height;
  }
}
