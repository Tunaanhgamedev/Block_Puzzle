import { Container, Graphics, Text, TextStyle, Rectangle } from 'pixi.js';
import { Scene, SceneManager } from '../core/SceneManager';
import { Game } from '../core/Game';
import { HUD } from '../ui/HUD';
import { useGameStore, BlockData, GameMode } from '../systems/stateStore';
import { BlockSystem } from '../systems/BlockSystem';
import { GridSystem } from '../systems/GridSystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { ComboSystem } from '../systems/ComboSystem';
import { SoundManager } from '../systems/SoundManager';
import { ParticleManager } from '../effects/ParticleManager';
import { TweenManager } from '../effects/TweenManager';
import { ResultScene } from './ResultScene';
import { MenuScene } from './MenuScene';
import { Popup } from '../ui/Popup';
import { Button } from '../ui/Button';
import { gsap } from 'gsap';

interface CellSprite {
  bg: Graphics;
  block: Graphics;
}

export class GameScene extends Scene {
  private hud!: HUD;
  private gameLayer!: Container; // holds board and previews for camera shake/zoom
  private boardContainer!: Container;
  private previewContainer!: Container;

  // Grid properties
  private cells: CellSprite[][] = [];
  private cellSize = 50;
  private cellGap = 4;
  private boardSizePx = 400;

  // Drag and drop tracking
  private activeDragBlock: Container | null = null;
  private activeDragData: BlockData | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragFrameCounter = 0;
  private cachedGrid: number[][] = [];

  // Highlights on grid during drag
  private highlightOverlay!: Graphics;

  // Time tracking
  private lastTimeTick = 0;

  // Game store unsubscribe function
  private unsubscribeStore!: () => void;
  private gameEnded = false;

  public init(): void {
    const store = useGameStore.getState();

    // Game layer (for shakes/zooms)
    this.gameLayer = new Container();
    this.gameLayer.eventMode = 'static';
    this.gameLayer.hitArea = new Rectangle(0, 0, 540, 960);
    this.addChild(this.gameLayer);

    // 1. HUD Layer
    this.hud = new HUD(() => this.pauseGame());
    this.addChild(this.hud);

    // 2. Board Layer
    this.boardContainer = new Container();
    this.gameLayer.addChild(this.boardContainer);

    // 3. Block Previews Layer
    this.previewContainer = new Container();
    this.gameLayer.addChild(this.previewContainer);

    // 4. Drag Highlights
    this.highlightOverlay = new Graphics();
    this.boardContainer.addChild(this.highlightOverlay);

    // Build the grid cell graphics
    this.setupGrid();

    // Spawn initial blocks
    if (store.currentBlocks.length === 0 || store.currentBlocks.every(b => b.placed)) {
      const initBlocks = BlockSystem.generateTripleBlocks(store.activeMode);
      useGameStore.setState({ currentBlocks: initBlocks });
    }
    this.renderPreviews();

    // Subscribe to Zustand store updates
    this.unsubscribeStore = useGameStore.subscribe((state) => {
      if (this.gameEnded) return;

      this.hud.refresh();
      this.drawBoard(state.grid);
      
      // If blocks count changes (e.g. from Shuffle or Undo), redraw previews
      this.renderPreviews();

      // Check Game Over
      if (state.isGameOver) {
        this.gameEnded = true;
        this.endGame();
      }
    });

    // Initial draw
    this.drawBoard(store.grid);
    this.hud.refresh();
  }

  private setupGrid(): void {
    const store = useGameStore.getState();
    const size = store.gridSize;

    // Calculate cell sizes
    this.boardSizePx = 430;
    this.cellSize = (this.boardSizePx - (this.cellGap * (size - 1))) / size;

    // Grid board background panel (glassmorphism slot)
    const boardBg = new Graphics();
    boardBg.roundRect(-this.boardSizePx / 2 - 12, -this.boardSizePx / 2 - 12, this.boardSizePx + 24, this.boardSizePx + 24, 20);
    boardBg.fill({ color: 0x080816, alpha: 0.8 });
    // Neon glow boundary outline
    const neonColor = store.activeMode === 'hardcore' ? 0xa855f7 : 0x00f2fe;
    boardBg.stroke({ color: neonColor, width: 3, alpha: 0.6 });
    this.boardContainer.addChild(boardBg);

    // Create cells
    this.cells = [];
    const offset = this.boardSizePx / 2;

    for (let r = 0; r < size; r++) {
      this.cells[r] = [];
      for (let c = 0; c < size; c++) {
        const cx = c * (this.cellSize + this.cellGap) - offset + this.cellSize / 2;
        const cy = r * (this.cellSize + this.cellGap) - offset + this.cellSize / 2;

        // Background slot graphic
        const bg = new Graphics();
        bg.roundRect(-this.cellSize / 2, -this.cellSize / 2, this.cellSize, this.cellSize, 8);
        bg.fill({ color: 0x12122b });
        bg.stroke({ color: 0x1f1f4d, width: 1, alpha: 0.5 });
        bg.x = cx;
        bg.y = cy;
        bg.eventMode = 'static';
        bg.cursor = 'pointer';
        
        // Register tap for skills (Hammer)
        const row = r;
        const col = c;
        bg.on('pointerdown', () => this.handleCellClick(row, col));

        this.boardContainer.addChild(bg);

        // Placed Block graphic
        const block = new Graphics();
        block.x = cx;
        block.y = cy;
        block.visible = false;
        this.boardContainer.addChild(block);

        this.cells[r][c] = { bg, block };
      }
    }
  }

  /**
   * Draws/updates the color of cells on the board according to the grid state array.
   */
  private drawBoard(grid: number[][]): void {
    const size = grid.length;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cellVal = grid[r][c];
        const cell = this.cells[r][c];

        if (cellVal > 0) {
          // Cell is occupied. Draw a filled colored block
          const colorHex = BlockSystem.NEON_COLORS[cellVal - 1];
          cell.block.clear();
          cell.block.roundRect(-this.cellSize / 2, -this.cellSize / 2, this.cellSize, this.cellSize, 8);
          cell.block.fill({ color: colorHex });
          // Glowing bevel borders
          cell.block.stroke({ color: 0xffffff, width: 1.5, alpha: 0.6 });
          cell.block.visible = true;
        } else {
          cell.block.visible = false;
        }
      }
    }
  }

  /**
   * Renders the 3 block slots below the grid.
   */
  private renderPreviews(): void {
    this.previewContainer.removeChildren();
    const store = useGameStore.getState();

    const scale = 0.55; // preview blocks are drawn smaller
    const spacing = 150;
    const startX = -(spacing);

    store.currentBlocks.forEach((blockData, index) => {
      if (blockData.placed) return; // don't draw if already placed

      const blockHolder = new Container();
      blockHolder.x = startX + index * spacing;
      blockHolder.y = 0;
      blockHolder.eventMode = 'static';
      blockHolder.cursor = 'pointer';

      // Draw the block shape
      const shape = blockData.shape;
      const rows = shape.length;
      const cols = shape[0].length;
      const colorHex = BlockSystem.NEON_COLORS[blockData.color];

      const blockGraphic = new Container();
      const blockSize = this.cellSize;
      
      const widthPx = cols * blockSize;
      const heightPx = rows * blockSize;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (shape[r][c] === 1) {
            const square = new Graphics();
            square.roundRect(c * blockSize, r * blockSize, blockSize, blockSize, 8);
            square.fill({ color: colorHex });
            square.stroke({ color: 0xffffff, width: 1.5, alpha: 0.5 });
            blockGraphic.addChild(square);
          }
        }
      }

      // Center the block in its holder
      blockGraphic.pivot.set(widthPx / 2, heightPx / 2);
      blockGraphic.scale.set(scale);
      blockHolder.addChild(blockGraphic);

      // Save original slot info
      blockHolder.on('pointerdown', (e) => this.onDragStart(e, blockData, index, blockHolder));

      this.previewContainer.addChild(blockHolder);
    });
  }

  /**
   * Drag and drop start logic
   */
  private onDragStart(event: any, blockData: BlockData, previewIndex: number, originalHolder: Container): void {
    const store = useGameStore.getState();

    // 1. Check if Rotate skill is active
    if (store.activeSkill === 'rotate') {
      const success = store.useRotate(previewIndex);
      if (success) {
        SoundManager.playSkill();
        this.renderPreviews();
      }
      return;
    }

    // 2. Regular Drag & Drop
    SoundManager.playHover();
    
    this.activeDragData = blockData;
    this.dragStartX = originalHolder.x;
    this.dragStartY = originalHolder.y;
    this.dragFrameCounter = 0;

    // Cache grid state for the entire drag session (avoid re-reading store every move)
    this.cachedGrid = store.grid;

    // Temporarily hide original holder
    originalHolder.visible = false;

    // Create a drag container at stage level
    this.activeDragBlock = new Container();
    
    // Draw the full sized shape in drag container
    const shape = blockData.shape;
    const rows = shape.length;
    const cols = shape[0].length;
    const colorHex = BlockSystem.NEON_COLORS[blockData.color];
    const cellSpacing = this.cellSize + this.cellGap;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (shape[r][c] === 1) {
          const square = new Graphics();
          square.roundRect(c * cellSpacing, r * cellSpacing, this.cellSize, this.cellSize, 8);
          square.fill({ color: colorHex });
          square.stroke({ color: 0xffffff, width: 2, alpha: 0.7 });
          this.activeDragBlock.addChild(square);
        }
      }
    }

    // Pivot center using cellSpacing for consistent grid alignment
    this.activeDragBlock.pivot.set(cols * cellSpacing / 2, rows * cellSpacing / 2);

    // Apply offset so block floats slightly ABOVE finger/cursor
    const localPos = this.gameLayer.toLocal(event.global);
    this.activeDragBlock.x = localPos.x;
    this.activeDragBlock.y = localPos.y - 70; // 70px offset

    // Animate scale bounce
    this.activeDragBlock.scale.set(0.7);
    gsap.to(this.activeDragBlock.scale, { x: 1, y: 1, duration: 0.15, ease: 'back.out(1.2)' });

    this.gameLayer.addChild(this.activeDragBlock);

    // Listen to move/up on the scene (covers entire screen)
    this.eventMode = 'static';
    this.hitArea = new Rectangle(0, 0, 540, 960);
    this.on('pointermove', this.onDragMove, this);
    this.on('pointerup', this.onDragEnd, this);
    this.on('pointerupoutside', this.onDragEnd, this);
  }

  /**
   * Drag and drop move logic
   */
  private onDragMove(event: any): void {
    if (!this.activeDragBlock || !this.activeDragData) return;

    const localPos = this.gameLayer.toLocal(event.global);
    this.activeDragBlock.x = localPos.x;
    this.activeDragBlock.y = localPos.y - 70; // offset

    // Throttle particle trail: only spawn every 3rd frame to reduce lag
    this.dragFrameCounter++;
    if (this.dragFrameCounter % 3 === 0) {
      ParticleManager.getInstance().spawnTrail(this.activeDragBlock.x, this.activeDragBlock.y, BlockSystem.NEON_COLORS[this.activeDragData.color]);
    }

    // Check overlay on grid board
    this.updateDragHighlight();
  }

  /**
   * Updates preview highlights on grid cells when dragging block over them.
   */
  private updateDragHighlight(): void {
    if (!this.activeDragBlock || !this.activeDragData) return;

    this.highlightOverlay.clear();

    const grid = this.cachedGrid;
    if (!grid || grid.length === 0) return;

    const shape = this.activeDragData.shape;

    // Get position of the active block relative to board container
    const boardPos = this.boardContainer.toLocal(this.activeDragBlock.position, this.gameLayer);

    // Convert coordinates to grid indices
    const cellSpacing = this.cellSize + this.cellGap;
    const offset = this.boardSizePx / 2;

    // Compute grid indices based on top-left of shape using cellSpacing
    const blockRows = shape.length;
    const blockCols = shape[0].length;
    const shapeWidth = blockCols * cellSpacing;
    const shapeHeight = blockRows * cellSpacing;

    const topLeftX = boardPos.x - shapeWidth / 2;
    const topLeftY = boardPos.y - shapeHeight / 2;

    const colIdx = Math.round((topLeftX + offset) / cellSpacing);
    const rowIdx = Math.round((topLeftY + offset) / cellSpacing);

    // Verify placement validity
    const isValid = BlockSystem.canPlaceAt(grid, shape, rowIdx, colIdx);

    if (isValid) {
      // Highlight the target grid slots in neon color
      const colorHex = BlockSystem.NEON_COLORS[this.activeDragData.color];
      
      for (let r = 0; r < blockRows; r++) {
        for (let c = 0; c < blockCols; c++) {
          if (shape[r][c] === 1) {
            const targetX = (colIdx + c) * cellSpacing - offset + this.cellSize / 2;
            const targetY = (rowIdx + r) * cellSpacing - offset + this.cellSize / 2;

            this.highlightOverlay.roundRect(targetX - this.cellSize / 2, targetY - this.cellSize / 2, this.cellSize, this.cellSize, 8);
            this.highlightOverlay.fill({ color: colorHex, alpha: 0.4 });
            this.highlightOverlay.stroke({ color: colorHex, width: 2, alpha: 0.8 });
          }
        }
      }
    }
  }

  /**
   * Drag end logic (Drop block)
   */
  private onDragEnd(_event: any): void {
    if (!this.activeDragBlock || !this.activeDragData) return;

    // Remove event listeners
    this.off('pointermove', this.onDragMove, this);
    this.off('pointerup', this.onDragEnd, this);
    this.off('pointerupoutside', this.onDragEnd, this);

    this.highlightOverlay.clear();

    const store = useGameStore.getState();
    const grid = store.grid;
    const shape = this.activeDragData.shape;

    // Calculate grid coords
    const boardPos = this.boardContainer.toLocal(this.activeDragBlock.position, this.gameLayer);
    const cellSpacing = this.cellSize + this.cellGap;
    const offset = this.boardSizePx / 2;
    const blockRows = shape.length;
    const blockCols = shape[0].length;
    const shapeWidth = blockCols * cellSpacing;
    const shapeHeight = blockRows * cellSpacing;

    const topLeftX = boardPos.x - shapeWidth / 2;
    const topLeftY = boardPos.y - shapeHeight / 2;

    const colIdx = Math.round((topLeftX + offset) / cellSpacing);
    const rowIdx = Math.round((topLeftY + offset) / cellSpacing);

    const isValid = BlockSystem.canPlaceAt(grid, shape, rowIdx, colIdx);

    if (isValid) {
      // 1. Save state to Undo history before placing
      store.saveStateToHistory();

      // 2. Place on grid
      const newGrid = GridSystem.placeBlock(grid, shape, rowIdx, colIdx, this.activeDragData.color + 1);
      store.setGrid(newGrid);
      store.setBlockPlaced(this.activeDragData.id);

      // 3. Play placement sound and pop animation
      SoundManager.playPlace();
      TweenManager.animatePlacement(this.boardContainer);

      // 4. Calculate score
      const numTiles = shape.flat().filter(v => v === 1).length;
      store.addScore(ScoreSystem.getPlacementScore(numTiles));

      // 5. Line clearing check
      this.checkLineClears(newGrid);

      // 6. Re-fetch fresh state AFTER all mutations above
      const freshState = useGameStore.getState();

      // 7. Spawn more blocks if all 3 placed
      const remaining = freshState.currentBlocks.filter(b => !b.placed);
      if (remaining.length === 0) {
        const nextBlocks = BlockSystem.generateTripleBlocks(freshState.activeMode);
        useGameStore.setState({ currentBlocks: nextBlocks });
      }

      // 8. Decrement move counts
      if (freshState.activeMode === 'challenge') {
        freshState.decrementMoves();
      }

      // 9. Check Game Over (must use latest state after block spawn)
      this.checkGameOver(freshState.activeMode);

      // Cleanup drag sprite
      this.activeDragBlock.destroy({ children: true });
      this.activeDragBlock = null;
      this.activeDragData = null;
    } else {
      // Invalid placement -> Slide back to slot
      const dragBlockRef = this.activeDragBlock;
      this.activeDragBlock = null;
      this.activeDragData = null;

      // Translate local starting coordinates back
      const globalStart = this.previewContainer.toGlobal({ x: this.dragStartX, y: this.dragStartY });
      const localStart = this.gameLayer.toLocal(globalStart);

      gsap.to(dragBlockRef, {
        x: localStart.x,
        y: localStart.y,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          dragBlockRef.destroy({ children: true });
          this.renderPreviews(); // reveals the hidden original block
        },
      });
    }
  }

  /**
   * Helper to check and animate line clears.
   */
  private checkLineClears(grid: number[][]): void {
    const store = useGameStore.getState();
    const { rows, cols } = GridSystem.checkFilledLines(grid);
    const lineCount = rows.length + cols.length;

    if (lineCount > 0) {
      // 1. Play combo sounds
      store.incrementCombo();
      const combo = store.combo;
      SoundManager.playCombo(combo);

      // 2. Calculate line score
      const clearScore = ScoreSystem.getClearScore(lineCount, combo);
      store.addScore(clearScore);
      store.incrementLinesCleared(lineCount);

      // 3. Spawning explosion particles and animations for clears
      const cellSpacing = this.cellSize + this.cellGap;
      const offset = this.boardSizePx / 2;

      // Clear grid states
      const clearedGrid = GridSystem.clearLines(grid, rows, cols);
      store.setGrid(clearedGrid);

      // Explosion effects on rows
      rows.forEach((r) => {
        const yPos = r * cellSpacing - offset + this.cellSize / 2;
        // Explode cells across column width
        for (let c = 0; c < store.gridSize; c++) {
          const xPos = c * cellSpacing - offset + this.cellSize / 2;
          const global = this.boardContainer.toGlobal({ x: xPos, y: yPos });
          const local = this.gameLayer.toLocal(global);
          
          setTimeout(() => {
            ParticleManager.getInstance().spawnExplosion(local.x, local.y, 0x00f2fe, 8);
          }, c * 30);
        }
      });

      // Explosion effects on cols
      cols.forEach((c) => {
        const xPos = c * cellSpacing - offset + this.cellSize / 2;
        for (let r = 0; r < store.gridSize; r++) {
          const yPos = r * cellSpacing - offset + this.cellSize / 2;
          const global = this.boardContainer.toGlobal({ x: xPos, y: yPos });
          const local = this.gameLayer.toLocal(global);

          setTimeout(() => {
            ParticleManager.getInstance().spawnExplosion(local.x, local.y, 0xfd6585, 8);
          }, r * 30);
        }
      });

      // 4. Slow Motion satisfying visual (combo >= 4)
      if (combo >= 4) {
        // Mock a 300ms slow motion pause
        Game.getApp().ticker.speed = 0.25; // slow down ticker
        setTimeout(() => {
          Game.getApp().ticker.speed = 1.0; // speed up
        }, 300);
      }

      // 5. Dynamic Combo Camera zoom-in and screen shake (combo >= 5)
      if (combo >= 5) {
        TweenManager.shake(this.gameLayer, 10, 0.6);
        TweenManager.cameraZoom(this.gameLayer, 0.6);
      } else {
        // Normal combo screen shake
        TweenManager.shake(this.gameLayer, 3 + combo * 1.2, 0.35);
      }

      // 6. Float Combo / Score Texts
      const textVal = combo > 1 ? `${ComboSystem.getComboText(combo)}\n+${clearScore}` : `+${clearScore}`;
      const comboColor = ComboSystem.getComboColor(combo);
      
      const floatStyle = new TextStyle({
        fontFamily: 'Space Grotesk',
        fontSize: combo > 3 ? 32 : 24,
        fontWeight: 'bold',
        fill: comboColor,
        align: 'center',
        dropShadow: { alpha: 0.5, blur: 5, color: comboColor, distance: 0 }
      });
      const floatNode = new Text({ text: textVal, style: floatStyle });
      floatNode.anchor.set(0.5);
      floatNode.x = SceneManager.getWidth() / 2;
      floatNode.y = SceneManager.getHeight() / 2 - 100;
      this.addChild(floatNode);
      TweenManager.floatText(floatNode, 1.2, -80);

      // 7. Perfect Clear check
      if (GridSystem.isGridEmpty(clearedGrid)) {
        SoundManager.playPerfectClear();
        store.addScore(ScoreSystem.PERFECT_CLEAR_BONUS);
        
        // Show celebration particles
        ParticleManager.getInstance().spawnCelebration(SceneManager.getWidth(), SceneManager.getHeight());

        // Perfect Clear popup float
        const pcStyle = new TextStyle({
          fontFamily: 'Space Grotesk',
          fontSize: 42,
          fontWeight: 'bold',
          fill: 0xffd700, // Gold
          align: 'center',
          dropShadow: { alpha: 0.8, blur: 15, color: 0xffd700, distance: 0 }
        });
        const pcNode = new Text({ text: '🏆 QUÉT SẠCH 🏆\n+500', style: pcStyle });
        pcNode.anchor.set(0.5);
        pcNode.x = SceneManager.getWidth() / 2;
        pcNode.y = SceneManager.getHeight() / 2 - 50;
        this.addChild(pcNode);
        TweenManager.floatText(pcNode, 2.0, -120);
      }
    } else {
      // Placed block but did NOT clear lines -> Reset combo multiplier
      store.resetCombo();
    }
  }

  /**
   * Triggered when cells are clicked. Used for active skills (Hammer).
   */
  private handleCellClick(row: number, col: number): void {
    const store = useGameStore.getState();

    // Check if Hammer skill is active and cell has a block
    if (store.activeSkill === 'hammer' && store.grid[row][col] > 0) {
      const cell = this.cells[row][col];
      const global = this.boardContainer.toGlobal(cell.bg.position);
      const local = this.gameLayer.toLocal(global);

      const success = store.useHammer(row, col);
      if (success) {
        SoundManager.playSkill();
        // Particle explosion on cell
        ParticleManager.getInstance().spawnExplosion(local.x, local.y, 0xfd6585, 20);
        
        // Re-fetch fresh state AFTER useHammer mutation
        const freshState = useGameStore.getState();

        // Direct update board
        this.drawBoard(freshState.grid);
        this.hud.refresh();

        // Check if removing block triggers any line clears (usually not, but we verify)
        this.checkLineClears(freshState.grid);
      }
    }
  }

  /**
   * Verifies if the remaining preview blocks can fit anywhere.
   * If not, marks isGameOver as true in store.
   */
  private checkGameOver(_mode: GameMode): void {
    const store = useGameStore.getState();
    const remaining = store.currentBlocks.filter(b => !b.placed);
    if (remaining.length === 0) return;

    let anyFits = false;
    for (const block of remaining) {
      if (BlockSystem.canFitOnGrid(store.grid, block.shape)) {
        anyFits = true;
        break;
      }
    }

    if (!anyFits) {
      // Game Over! No block can fit
      store.setGameOver(true);
    }
  }

  private pauseGame(): void {
    SoundManager.playClick();
    useGameStore.setState({ isPaused: true });

    // Show custom pause overlay/popup
    const pausePopup = new Popup('TẠM DỪNG', 320, 300);
    
    // Resume Button
    const resumeBtn = new Button({
      text: 'TIẾP TỤC',
      width: 180,
      height: 40,
      fontSize: 14,
      bgColor: 0x0c301b,
      borderColor: 0x39ff14,
      onClick: () => {
        useGameStore.setState({ isPaused: false });
        pausePopup.close();
      },
    });
    resumeBtn.y = -40;
    pausePopup.container.addChild(resumeBtn);

    // Restart Button
    const restartBtn = new Button({
      text: 'CHƠI LẠI',
      width: 180,
      height: 40,
      fontSize: 14,
      bgColor: 0x1f1f3a,
      borderColor: 0x00f2fe,
      onClick: () => {
        useGameStore.getState().initGame(useGameStore.getState().activeMode);
        pausePopup.close();
      },
    });
    restartBtn.y = 15;
    pausePopup.container.addChild(restartBtn);

    // Quit Button
    const quitBtn = new Button({
      text: 'THOÁT',
      width: 180,
      height: 40,
      fontSize: 14,
      bgColor: 0x300c14,
      borderColor: 0xfd6585,
      onClick: () => {
        pausePopup.close();
        SceneManager.changeScene(new MenuScene());
      },
    });
    quitBtn.y = 70;
    pausePopup.container.addChild(quitBtn);

    // Show
    pausePopup.show(this);
  }

  private endGame(): void {
    SoundManager.playGameOver();
    SceneManager.changeScene(new ResultScene());
  }

  public update(delta: number): void {
    const store = useGameStore.getState();
    if (store.isPaused || store.isGameOver) return;

    // Time countdown handler for Time Attack mode
    if (store.activeMode === 'timeAttack') {
      this.lastTimeTick += 0.016 * delta;
      if (this.lastTimeTick >= 1.0) {
        store.decrementTime(1);
        this.lastTimeTick = 0;
      }
    }
  }

  public resize(width: number, height: number): void {
    this.hud.resize(width, height);

    // Align Board in center of layout
    this.boardContainer.x = width / 2;
    this.boardContainer.y = height / 2 - 20;

    // Align preview blocks below the board
    this.previewContainer.x = width / 2;
    this.previewContainer.y = height / 2 + this.boardSizePx / 2 + 80;
  }

  public destroyScene(): void {
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
    }
  }
}
