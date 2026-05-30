import { Application } from 'pixi.js';
import { SceneManager } from './SceneManager';
import { LoadingScene } from '../scenes/LoadingScene';
import { ParticleManager } from '../effects/ParticleManager';

export class Game {
  private static app: Application;

  public static async init(): Promise<void> {
    // Create PixiJS Application
    Game.app = new Application();

    // Async init for PixiJS 8
    await Game.app.init({
      width: 540,
      height: 960,
      antialias: true,
      backgroundAlpha: 0, // Make transparent so web page background floats through
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Append canvas to DOM
    const parent = document.getElementById('game-canvas-parent');
    if (parent) {
      parent.appendChild(Game.app.canvas);
    }

    // Initialize SceneManager
    SceneManager.init(Game.app, 540, 960);

    // Initialize ParticleManager
    ParticleManager.getInstance().init(Game.app.stage, Game.app.renderer);

    // Start loading scene
    await SceneManager.changeScene(new LoadingScene());

    // Game loop (Ticker)
    Game.app.ticker.add((ticker) => {
      // Update ParticleManager
      ParticleManager.getInstance().update(ticker.deltaTime);
      
      // Update SceneManager (active scene)
      SceneManager.update(ticker.deltaTime);
    });
  }

  public static getApp(): Application {
    return Game.app;
  }
}
