// Hand-coded 16x16 sprites. Each entry is an array of 16 strings (rows),
// each string is 16 chars where each char maps to a color key (or '.' for transparent).
// Renderer: components/icons/Sprite.tsx

export interface SpriteDef {
  id: string;
  width: number;
  height: number;
  palette: Record<string, string>;
  rows: string[];
}

// Helper to keep palette entries terse: K=black, W=white, etc.
const yellow = '#ffe600';
const cyan = '#00f0ff';
const pink = '#ff2c9f';
const green = '#39ff14';
const white = '#f5e8ff';
const dark = '#14001f';

export const PYTHON_SNAKE: SpriteDef = {
  id: 'python',
  width: 16,
  height: 16,
  palette: { '.': 'transparent', Y: yellow, C: cyan, K: dark },
  rows: [
    '................',
    '....CCCCCC......',
    '...CKKKKKKC.....',
    '...CKCKKKKC.....',
    '...CKKKKKKC.....',
    '...CCCCKKKC.....',
    '......CKKKCCCC..',
    '......CKKKKKYYC.',
    '......CKKKKYYYC.',
    '......CKKKKYYYC.',
    '......CYYYYKKYC.',
    '..CCCCCYYYKKKKC.',
    '.CYYYYYCKKKKKC..',
    '.CYYYYYCCCCC....',
    '.CYYYYYC........',
    '..CCCCC.........',
  ],
};

export const GRADIENT_DESCENT: SpriteDef = {
  id: 'gradient',
  width: 16,
  height: 16,
  palette: { '.': 'transparent', C: cyan, P: pink, Y: yellow, W: white },
  rows: [
    '................',
    '...CCC..........',
    '..CCCCC.........',
    '.CCCCCCC........',
    '.CCCPCCC........',
    '.CCPPPCC........',
    '..CPPPC.........',
    '...CPC..........',
    '....C...........',
    '...........YY...',
    '..........YYYY..',
    '.........YYWWYY.',
    '........YYWPPWYY',
    '.......YYWPPPWY.',
    '........YYWWYY..',
    '.........YYYY...',
  ],
};

export const GIT_BRANCH: SpriteDef = {
  id: 'git',
  width: 16,
  height: 16,
  palette: { '.': 'transparent', G: green, W: white },
  rows: [
    '....GG..........',
    '...GWWG.........',
    '...GWWG.........',
    '....GG..........',
    '.....G..........',
    '.....G..........',
    '.....G..........',
    '.....G..GG......',
    '.....G.GWWG.....',
    '.....G.GWWG.....',
    '.....G..GG......',
    '.....G..........',
    '.....G..........',
    '....GG..........',
    '...GWWG.........',
    '...GWWG.........',
  ],
};

export const CIRCUIT: SpriteDef = {
  id: 'circuit',
  width: 16,
  height: 16,
  palette: { '.': 'transparent', C: cyan, Y: yellow, K: dark },
  rows: [
    '.CCCCCCCCCCCCCC.',
    '.CKKKKKKKKKKKKC.',
    '.CK.CC.CC.CC.KC.',
    '.CK.CY.YC.CY.KC.',
    '.CK.CC.CC.CC.KC.',
    '.CK..........KC.',
    '.CK.YYY..YYY.KC.',
    '.CK.Y.Y..Y.Y.KC.',
    '.CK.YYY..YYY.KC.',
    '.CK..........KC.',
    '.CK.CC.CC.CC.KC.',
    '.CK.CY.YC.CY.KC.',
    '.CK.CC.CC.CC.KC.',
    '.CKKKKKKKKKKKKC.',
    '.CCCCCCCCCCCCCC.',
    '................',
  ],
};

export const MATRIX_GRID: SpriteDef = {
  id: 'matrix',
  width: 16,
  height: 16,
  palette: { '.': 'transparent', G: green, K: dark },
  rows: [
    'GGGGGGGGGGGGGGGG',
    'G.G.G.G.G.G.G..G',
    'GGGGGGGGGGGGGGGG',
    'G.G.G.G.G.G.G..G',
    'GGGGGGGGGGGGGGGG',
    'G.G.G.G.G.G.G..G',
    'GGGGGGGGGGGGGGGG',
    'G.G.G.G.G.G.G..G',
    'GGGGGGGGGGGGGGGG',
    'G.G.G.G.G.G.G..G',
    'GGGGGGGGGGGGGGGG',
    'G.G.G.G.G.G.G..G',
    'GGGGGGGGGGGGGGGG',
    'G.G.G.G.G.G.G..G',
    'GGGGGGGGGGGGGGGG',
    '................',
  ],
};

export const BOOK: SpriteDef = {
  id: 'book',
  width: 16,
  height: 16,
  palette: { '.': 'transparent', P: pink, W: white, K: dark },
  rows: [
    '................',
    '..PPPPPPPPPPPP..',
    '.PWWWWWWWWWWWWP.',
    '.PWKKKKKKKKKKWP.',
    '.PWKKKKKKKKKKWP.',
    '.PWKWWWWWWWWKWP.',
    '.PWKWWWWWWWWKWP.',
    '.PWKKKKKKKKKKWP.',
    '.PWKKKKKKKKKKWP.',
    '.PWKWWWWWWWWKWP.',
    '.PWKWWWWWWWWKWP.',
    '.PWKKKKKKKKKKWP.',
    '.PWWWWWWWWWWWWP.',
    '..PPPPPPPPPPPP..',
    '................',
    '................',
  ],
};

export const ROCKET: SpriteDef = {
  id: 'rocket',
  width: 16,
  height: 16,
  palette: { '.': 'transparent', W: white, C: cyan, P: pink, Y: yellow },
  rows: [
    '........W.......',
    '.......WWW......',
    '.......WCW......',
    '......WWCWW.....',
    '......WCCCW.....',
    '......WCCCW.....',
    '.....WWCCCWW....',
    '.....WCCPCCW....',
    '.....WCCPCCW....',
    '....WWCCPCCWW...',
    '....WCWCCCWCW...',
    '...WW.WWWWW.WW..',
    '..W.....Y.....W.',
    '........Y.......',
    '.......YPY......',
    '........Y.......',
  ],
};

export const COIN: SpriteDef = {
  id: 'coin',
  width: 16,
  height: 16,
  palette: { '.': 'transparent', Y: yellow, K: dark, W: white },
  rows: [
    '....YYYYYYYY....',
    '..YYKKKKKKKKYY..',
    '.YKKKKWWWWKKKKY.',
    '.YKKKWKKKKWKKKY.',
    'YKKKWKYYYYKWKKKY',
    'YKKKWKYKKYKWKKKY',
    'YKKKWKYKKYKWKKKY',
    'YKKKWKYKKYKWKKKY',
    'YKKKWKYKKYKWKKKY',
    'YKKKWKYKKYKWKKKY',
    'YKKKWKYYYYKWKKKY',
    '.YKKKWKKKKWKKKY.',
    '.YKKKKWWWWKKKKY.',
    '..YYKKKKKKKKYY..',
    '....YYYYYYYY....',
    '................',
  ],
};

export const ALL_SPRITES: Record<string, SpriteDef> = {
  PYTHON_SNAKE,
  GRADIENT_DESCENT,
  GIT_BRANCH,
  CIRCUIT,
  MATRIX_GRID,
  BOOK,
  ROCKET,
  COIN,
};

// Used by /inventory to map a skill name → a sprite.
export function spriteForSkill(skillName: string): SpriteDef {
  const k = skillName.toLowerCase();
  if (k.includes('python')) return PYTHON_SNAKE;
  if (k.includes('pytorch') || k.includes('ml') || k.includes('cuda'))
    return GRADIENT_DESCENT;
  if (k.includes('matlab') || k.includes('typescript') || k.includes('c++'))
    return MATRIX_GRID;
  if (k.includes('vlsi') || k.includes('circuit')) return CIRCUIT;
  if (k.includes('finance')) return BOOK;
  return ROCKET;
}
