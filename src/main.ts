import { Game } from './core/Game';

window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize and start the game application
    await Game.init();
    console.log('Block Puzzle Neon Grid: Initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize game application:', error);
  }
});
