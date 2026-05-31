import { create } from 'zustand';
import { SaveSystem } from './SaveSystem';
import { BlockSystem } from './BlockSystem';

export type GameMode = 'classic' | 'timeAttack' | 'challenge' | 'hardcore';

export interface Quest {
  id: string;
  desc: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  type: 'daily' | 'weekly';
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  target: number;
  current: number;
  completed: boolean;
  reward: number;
}

export interface BlockData {
  id: string;
  shape: number[][]; // e.g. [[1, 1], [1, 1]] for 2x2
  color: number; // Index or color code
  placed: boolean;
  scale?: number;
}

export interface GameState {
  score: number;
  highScores: Record<GameMode, number>;
  gems: number;
  combo: number;
  maxCombo: number;
  activeMode: GameMode;
  gridSize: number;
  grid: number[][]; // 0 = empty, 1-7 = color index
  currentBlocks: BlockData[];
  movesLeft: number; // for challenge mode
  linesCleared: number; // for challenge/quest
  linesClearedTarget: number; // for challenge mode
  timeLeft: number; // for time attack (seconds)
  isGameOver: boolean;
  isPaused: boolean;
  quests: Quest[];
  achievements: Achievement[];
  
  // Powerups count
  hammers: number;
  rotates: number;
  shuffles: number;
  undos: number;
  
  // Active tool
  activeSkill: 'hammer' | 'rotate' | null;

  // History for Undo
  undoHistory: Array<{
    grid: number[][];
    score: number;
    gems: number;
    currentBlocks: BlockData[];
  }>;

  // Actions
  initGame: (mode: GameMode) => void;
  setScore: (score: number) => void;
  addScore: (pts: number) => void;
  addGems: (count: number) => void;
  setCombo: (combo: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  setGrid: (grid: number[][]) => void;
  setBlockPlaced: (id: string) => void;
  setCurrentBlocks: (blocks: BlockData[]) => void;
  decrementMoves: () => void;
  incrementLinesCleared: (count: number) => void;
  decrementTime: (amount: number) => void;
  setGameOver: (over: boolean) => void;
  setPaused: (paused: boolean) => void;
  
  // Powerups actions
  buyPowerup: (type: 'hammer' | 'rotate' | 'shuffle' | 'undo', cost: number) => boolean;
  useHammer: (r: number, c: number) => boolean;
  useRotate: (index: number) => boolean;
  useShuffle: () => boolean;
  useUndo: () => boolean;
  setActiveSkill: (skill: 'hammer' | 'rotate' | null) => void;
  saveStateToHistory: () => void;
  
  // Quest/Achievement check
  checkQuestsAndAchievements: () => void;
  claimQuestReward: (questId: string) => void;
}

const DEFAULT_QUESTS: Quest[] = [
  { id: 'q_daily_lines', desc: 'Xóa 30 hàng hôm nay', target: 30, current: 0, reward: 100, completed: false, type: 'daily' },
  { id: 'q_daily_combo', desc: 'Đạt combo x4', target: 4, current: 0, reward: 80, completed: false, type: 'daily' },
  { id: 'q_weekly_lines', desc: 'Xóa 150 hàng tuần này', target: 150, current: 0, reward: 300, completed: false, type: 'weekly' },
  { id: 'q_weekly_score', desc: 'Đạt 3.000 điểm trong một trận', target: 3000, current: 0, reward: 250, completed: false, type: 'weekly' },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_first_1k', title: '1000 điểm đầu tiên', desc: 'Đạt 1.000 điểm ở chế độ bất kỳ', target: 1000, current: 0, completed: false, reward: 200 },
  { id: 'ach_combo_master', title: 'Bậc thầy Combo', desc: 'Đạt combo x6 trở lên', target: 6, current: 0, completed: false, reward: 300 },
  { id: 'ach_perfect_cleaner', title: 'Quét sạch bàn cờ', desc: 'Xóa sạch toàn bộ ô trên bàn cờ', target: 1, current: 0, completed: false, reward: 500 },
];

export const useGameStore = create<GameState>((set, get) => {
  // Load saved data on startup
  const savedHighScores = SaveSystem.loadHighScores();
  const savedGems = SaveSystem.loadGems();
  const savedPowerups = SaveSystem.loadPowerups();
  const rawSavedQuests = SaveSystem.loadQuests();
  const quests = DEFAULT_QUESTS.map(defQ => {
    const saved = rawSavedQuests?.find(sq => sq.id === defQ.id);
    return saved ? { ...defQ, current: saved.current, completed: saved.completed } : defQ;
  });

  const rawSavedAchievements = SaveSystem.loadAchievements();
  const achievements = DEFAULT_ACHIEVEMENTS.map(defA => {
    const saved = rawSavedAchievements?.find(sa => sa.id === defA.id);
    return saved ? { ...defA, current: saved.current, completed: saved.completed } : defA;
  });

  return {
    score: 0,
    highScores: savedHighScores,
    gems: savedGems,
    combo: 0,
    maxCombo: 0,
    activeMode: 'classic',
    gridSize: 8,
    grid: [],
    currentBlocks: [],
    movesLeft: 0,
    linesCleared: 0,
    linesClearedTarget: 0,
    timeLeft: 180, // 3 mins default
    isGameOver: false,
    isPaused: false,
    quests,
    achievements,
    
    hammers: savedPowerups.hammers,
    rotates: savedPowerups.rotates,
    shuffles: savedPowerups.shuffles,
    undos: savedPowerups.undos,
    
    activeSkill: null,
    undoHistory: [],

    initGame: (mode: GameMode) => {
      const size = mode === 'hardcore' ? 10 : 8;
      const initialGrid = Array.from({ length: size }, () => Array(size).fill(0));
      
      set({
        score: 0,
        combo: 0,
        activeMode: mode,
        gridSize: size,
        grid: initialGrid,
        currentBlocks: [],
        movesLeft: mode === 'challenge' ? 15 : 0,
        linesCleared: 0,
        linesClearedTarget: mode === 'challenge' ? 20 : 0,
        timeLeft: mode === 'timeAttack' ? 180 : 0,
        isGameOver: false,
        isPaused: false,
        activeSkill: null,
        undoHistory: [],
      });
    },

    setScore: (score) => {
      const mode = get().activeMode;
      const hs = get().highScores[mode];
      const newHighScores = { ...get().highScores };
      if (score > hs) {
        newHighScores[mode] = score;
        SaveSystem.saveHighScores(newHighScores);
      }
      set({ score, highScores: newHighScores });
      get().checkQuestsAndAchievements();
    },

    addScore: (pts) => {
      const currentScore = get().score;
      const newScore = currentScore + pts;
      get().setScore(newScore);
    },

    addGems: (count) => {
      const newGems = get().gems + count;
      set({ gems: newGems });
      SaveSystem.saveGems(newGems);
    },

    setCombo: (combo) => {
      const maxC = Math.max(get().maxCombo, combo);
      set({ combo, maxCombo: maxC });
      get().checkQuestsAndAchievements();
    },

    incrementCombo: () => {
      const nextCombo = get().combo + 1;
      get().setCombo(nextCombo);
    },

    resetCombo: () => {
      set({ combo: 0 });
    },

    setGrid: (grid) => {
      set({ grid });
    },

    setBlockPlaced: (id) => {
      const updated = get().currentBlocks.map((b) =>
        b.id === id ? { ...b, placed: true } : b
      );
      set({ currentBlocks: updated });
    },

    setCurrentBlocks: (blocks) => {
      set({ currentBlocks: blocks });
    },

    decrementMoves: () => {
      const nextMoves = get().movesLeft - 1;
      set({ movesLeft: nextMoves });
      if (nextMoves <= 0 && get().activeMode === 'challenge' && get().linesCleared < get().linesClearedTarget) {
        set({ isGameOver: true });
      }
    },

    incrementLinesCleared: (count) => {
      const nextLines = get().linesCleared + count;
      set({ linesCleared: nextLines });
      
      // Update Quests and Achievements
      const updatedQuests = get().quests.map((q) => {
        if (q.id === 'q_daily_lines' || q.id === 'q_weekly_lines') {
          const nextVal = Math.min(q.target, q.current + count);
          return { ...q, current: nextVal, completed: nextVal >= q.target };
        }
        return q;
      });
      set({ quests: updatedQuests });
      SaveSystem.saveQuests(updatedQuests);

      if (get().activeMode === 'challenge' && nextLines >= get().linesClearedTarget) {
        // Challenge complete! Add gems as reward and set gameOver (victory)
        get().addGems(150);
        set({ isGameOver: true });
      }
      get().checkQuestsAndAchievements();
    },

    decrementTime: (amount) => {
      const nextTime = Math.max(0, get().timeLeft - amount);
      set({ timeLeft: nextTime });
      if (nextTime <= 0 && get().activeMode === 'timeAttack') {
        set({ isGameOver: true });
      }
    },

    setGameOver: (over) => {
      set({ isGameOver: over });
    },

    setPaused: (paused) => {
      set({ isPaused: paused });
    },

    buyPowerup: (type, cost) => {
      const currentGems = get().gems;
      if (currentGems < cost) return false;

      const updatedGems = currentGems - cost;
      let powerups = {
        hammers: get().hammers,
        rotates: get().rotates,
        shuffles: get().shuffles,
        undos: get().undos,
      };

      if (type === 'hammer') powerups.hammers++;
      if (type === 'rotate') powerups.rotates++;
      if (type === 'shuffle') powerups.shuffles++;
      if (type === 'undo') powerups.undos++;

      set({
        gems: updatedGems,
        ...powerups,
      });

      SaveSystem.saveGems(updatedGems);
      SaveSystem.savePowerups(powerups);
      return true;
    },

    setActiveSkill: (skill) => {
      set({ activeSkill: skill });
    },

    saveStateToHistory: () => {
      const historyState = {
        grid: get().grid.map(row => [...row]),
        score: get().score,
        gems: get().gems,
        currentBlocks: get().currentBlocks.map(b => ({ ...b })),
      };
      set({
        undoHistory: [...get().undoHistory, historyState].slice(-5) // limit history size to 5
      });
    },

    useHammer: (r, c) => {
      if (get().hammers <= 0) return false;
      const newGrid = get().grid.map(row => [...row]);
      
      // Hammer destroys the clicked cell block
      if (newGrid[r][c] === 0) return false; // nothing to destroy
      
      newGrid[r][c] = 0;
      const nextHammers = get().hammers - 1;
      
      set({
        grid: newGrid,
        hammers: nextHammers,
        activeSkill: null
      });

      SaveSystem.savePowerups({
        hammers: nextHammers,
        rotates: get().rotates,
        shuffles: get().shuffles,
        undos: get().undos
      });
      return true;
    },

    useRotate: (index) => {
      if (get().rotates <= 0) return false;
      
      const blocks = [...get().currentBlocks];
      if (index < 0 || index >= blocks.length || blocks[index].placed) return false;
      
      // Rotate shape 90 degrees clockwise
      const shape = blocks[index].shape;
      const rows = shape.length;
      const cols = shape[0].length;
      const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          rotated[c][rows - 1 - r] = shape[r][c];
        }
      }
      
      blocks[index] = { ...blocks[index], shape: rotated };
      const nextRotates = get().rotates - 1;
      
      set({
        currentBlocks: blocks,
        rotates: nextRotates,
        activeSkill: null
      });

      SaveSystem.savePowerups({
        hammers: get().hammers,
        rotates: nextRotates,
        shuffles: get().shuffles,
        undos: get().undos
      });
      return true;
    },

    useShuffle: () => {
      if (get().shuffles <= 0) return false;
      const nextShuffles = get().shuffles - 1;
      const newBlocks = BlockSystem.generateTripleBlocks(get().activeMode);
      set({
        shuffles: nextShuffles,
        currentBlocks: newBlocks
      });
      
      SaveSystem.savePowerups({
        hammers: get().hammers,
        rotates: get().rotates,
        shuffles: nextShuffles,
        undos: get().undos
      });
      return true;
    },

    useUndo: () => {
      if (get().undos <= 0) return false;
      const history = get().undoHistory;
      if (history.length === 0) return false;

      const previousState = history[history.length - 1];
      const nextHistory = history.slice(0, -1);
      const nextUndos = get().undos - 1;

      set({
        grid: previousState.grid,
        score: previousState.score,
        gems: previousState.gems,
        currentBlocks: previousState.currentBlocks,
        undoHistory: nextHistory,
        undos: nextUndos
      });

      SaveSystem.saveGems(previousState.gems);
      SaveSystem.savePowerups({
        hammers: get().hammers,
        rotates: get().rotates,
        shuffles: get().shuffles,
        undos: nextUndos
      });
      return true;
    },

    checkQuestsAndAchievements: () => {
      const { score, combo, quests, achievements } = get();
      
      // Update score quests
      const updatedQuests = quests.map((q) => {
        if (q.id === 'q_weekly_score') {
          const nextVal = Math.min(q.target, Math.max(q.current, score));
          return { ...q, current: nextVal, completed: nextVal >= q.target };
        }
        if (q.id === 'q_daily_combo') {
          const nextVal = Math.min(q.target, Math.max(q.current, combo));
          return { ...q, current: nextVal, completed: nextVal >= q.target };
        }
        return q;
      });

      // Update achievements
      const updatedAchievements = achievements.map((a) => {
        let nextVal = a.current;
        if (a.id === 'ach_first_1k') {
          nextVal = Math.max(a.current, score);
        } else if (a.id === 'ach_combo_master') {
          nextVal = Math.max(a.current, combo);
        }
        return { ...a, current: nextVal, completed: nextVal >= a.target };
      });

      // Save
      set({ quests: updatedQuests, achievements: updatedAchievements });
      SaveSystem.saveQuests(updatedQuests);
      SaveSystem.saveAchievements(updatedAchievements);
    },

    claimQuestReward: (questId) => {
      const q = get().quests.find(x => x.id === questId);
      if (q && q.completed) {
        get().addGems(q.reward);
        // Reset/remove reward from active completed state, or flag it as claimed
        const updatedQuests = get().quests.map((x) =>
          x.id === questId ? { ...x, current: 0, completed: false } : x
        );
        set({ quests: updatedQuests });
        SaveSystem.saveQuests(updatedQuests);
      }
    }
  };
});
