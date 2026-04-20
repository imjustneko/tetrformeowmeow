import type { PieceType, CellValue } from '@/lib/game/types';

export interface LessonStep {
  stepNumber: number;
  tip: string;
  subTip?: string;
  subTipColor?: 'cyan' | 'yellow' | 'red';
  neededPiece: PieceType;
  targetPosition: { x: number; y: number; rotation: 0 | 1 | 2 | 3 };
  allowedPieces?: PieceType[];
  successCondition: {
    type: 'place' | 'clear' | 'tspin' | 'tspin_double' | 'tspin_triple' | 'perfect_clear';
    minLines?: number;
  };
  feedbackSuccess: string;
  feedbackFail: string;
}

export interface Lesson {
  id: string;
  category: 'spins' | 'openers' | 'combos' | 'defense';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  orderIndex: number;
  steps: LessonStep[];
  initialBoard: CellValue[][];
  initialQueue: PieceType[];
  initialHold: PieceType | null;
}

const E = (): CellValue[] => Array(10).fill(0) as CellValue[];
const G = (hole: number): CellValue[] => {
  const row = Array(10).fill(8) as CellValue[];
  row[hole] = 0;
  return row;
};
const R = (...cells: number[]): CellValue[] => cells as CellValue[];

export const LESSONS: Lesson[] = [
  {
    id: 'tspin-single',
    category: 'spins',
    title: 'T-Spin Single',
    description:
      'Learn to rotate a T piece into a tight slot to score a T-Spin Single. The key is that your last move before lock must be a rotation.',
    difficulty: 'beginner',
    orderIndex: 0,
    initialBoard: [
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      R(1, 1, 1, 0, 0, 0, 0, 1, 1, 1),
      R(1, 1, 1, 0, 0, 0, 0, 1, 1, 1),
      R(1, 1, 1, 1, 0, 1, 1, 1, 1, 1),
      R(1, 1, 1, 1, 0, 1, 1, 1, 1, 1),
      R(1, 1, 1, 1, 0, 1, 1, 1, 1, 1),
      R(1, 1, 1, 1, 0, 1, 1, 1, 1, 1),
    ],
    initialQueue: ['T', 'I', 'O', 'S', 'Z', 'J', 'L'],
    initialHold: null,
    steps: [
      {
        stepNumber: 1,
        tip: 'Step 1: Move the T piece above the slot',
        subTip: 'Position the T piece directly above the gap at column 4',
        subTipColor: 'cyan',
        neededPiece: 'T',
        targetPosition: { x: 3, y: 14, rotation: 2 },
        successCondition: { type: 'place' },
        feedbackSuccess: 'Good! Now rotate it in.',
        feedbackFail: 'Move the T piece above the gap first.',
      },
      {
        stepNumber: 2,
        tip: 'Step 2: Rotate the T piece into the slot',
        subTip: 'Final rotation must be into the slot. This is what makes it a T-Spin.',
        subTipColor: 'yellow',
        neededPiece: 'T',
        targetPosition: { x: 3, y: 17, rotation: 0 },
        successCondition: { type: 'tspin', minLines: 1 },
        feedbackSuccess: 'T-Spin Single! Perfect rotation.',
        feedbackFail: 'No T-spin detected. Make your last move a rotation into the slot.',
      },
    ],
  },
  {
    id: 'tspin-double',
    category: 'spins',
    title: 'T-Spin Double',
    description: 'Set up a T-slot overhang, slide in, and rotate to clear 2 lines.',
    difficulty: 'beginner',
    orderIndex: 1,
    initialBoard: [
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      R(0, 0, 0, 0, 0, 0, 0, 1, 1, 1),
      R(1, 0, 0, 0, 0, 0, 0, 1, 1, 1),
      R(1, 1, 0, 0, 0, 0, 0, 1, 1, 1),
      R(1, 1, 1, 0, 0, 0, 1, 1, 1, 1),
      R(1, 1, 1, 0, 0, 0, 1, 1, 1, 1),
      R(1, 1, 1, 1, 0, 1, 1, 1, 1, 1),
    ],
    initialQueue: ['T', 'I', 'O', 'S', 'Z', 'J', 'L'],
    initialHold: null,
    steps: [
      {
        stepNumber: 1,
        tip: 'Step 1: Slide the T piece into the overhang from the left',
        subTip: 'Move T all the way left, then slide right under the overhang',
        subTipColor: 'cyan',
        neededPiece: 'T',
        targetPosition: { x: 2, y: 16, rotation: 1 },
        successCondition: { type: 'place' },
        feedbackSuccess: 'Perfect position. Now rotate clockwise.',
        feedbackFail: 'Get the T piece under the overhang first.',
      },
      {
        stepNumber: 2,
        tip: 'Step 2: Rotate clockwise to lock into the T-slot',
        subTip: 'This clears 2 lines as a T-Spin Double.',
        subTipColor: 'yellow',
        neededPiece: 'T',
        targetPosition: { x: 2, y: 17, rotation: 0 },
        successCondition: { type: 'tspin_double' },
        feedbackSuccess: 'T-Spin Double! Great execution.',
        feedbackFail: 'No T-Spin Double detected. Rotate into the slot as the final move.',
      },
    ],
  },
  {
    id: 'tspin-triple',
    category: 'spins',
    title: 'T-Spin Triple',
    description: 'Rare high-value T-spin pattern that clears three lines.',
    difficulty: 'intermediate',
    orderIndex: 2,
    initialBoard: [
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      R(0, 0, 1, 1, 1, 1, 1, 1, 1, 1),
      R(0, 0, 0, 1, 1, 1, 1, 1, 1, 1),
      R(1, 0, 0, 0, 1, 1, 1, 1, 1, 1),
      R(1, 1, 0, 0, 0, 1, 1, 1, 1, 1),
      R(1, 1, 1, 0, 0, 0, 1, 1, 1, 1),
      R(1, 1, 1, 0, 0, 1, 1, 1, 1, 1),
      R(1, 1, 1, 1, 0, 1, 1, 1, 1, 1),
    ],
    initialQueue: ['T', 'I', 'O', 'S', 'Z', 'J', 'L'],
    initialHold: null,
    steps: [
      {
        stepNumber: 1,
        tip: 'Step 1: Drop the T piece into the well and rotate to finish',
        subTip: 'Final action must clear 3 lines as a T-Spin Triple.',
        subTipColor: 'yellow',
        neededPiece: 'T',
        targetPosition: { x: 3, y: 16, rotation: 1 },
        successCondition: { type: 'tspin_triple' },
        feedbackSuccess: 'T-Spin Triple! Master-level execution.',
        feedbackFail: 'You need a true T-Spin Triple. Drop into the well and rotate into place.',
      },
    ],
  },
  {
    id: 'mini-tspin',
    category: 'spins',
    title: 'Mini T-Spin',
    description: 'Mini T-Spins are useful in pressure and combo routes.',
    difficulty: 'beginner',
    orderIndex: 3,
    initialBoard: [
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      R(1, 1, 1, 1, 1, 1, 1, 0, 1, 1),
      R(1, 1, 1, 1, 1, 1, 0, 0, 1, 1),
      R(1, 1, 1, 1, 1, 1, 1, 0, 1, 1),
      R(1, 1, 1, 1, 1, 1, 1, 0, 1, 1),
    ],
    initialQueue: ['T', 'I', 'O', 'S', 'Z', 'J', 'L'],
    initialHold: null,
    steps: [
      {
        stepNumber: 1,
        tip: 'Step 1: Drop T into the right notch and rotate for mini',
        subTip: 'Rotate CW so T points right before lock.',
        subTipColor: 'cyan',
        neededPiece: 'T',
        targetPosition: { x: 6, y: 16, rotation: 3 },
        successCondition: { type: 'tspin', minLines: 1 },
        feedbackSuccess: 'Mini T-Spin complete.',
        feedbackFail: 'Rotate T into the notch. A slide-only clear will not count.',
      },
    ],
  },
  {
    id: 'perfect-clear',
    category: 'combos',
    title: 'Perfect Clear Basics',
    description: 'Fill the remaining gap and clear the board completely.',
    difficulty: 'intermediate',
    orderIndex: 4,
    initialBoard: [
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      R(1, 1, 0, 0, 0, 0, 0, 0, 1, 1),
      R(1, 1, 1, 0, 0, 0, 0, 1, 1, 1),
      R(1, 1, 1, 1, 0, 0, 1, 1, 1, 1),
    ],
    initialQueue: ['I', 'T', 'O', 'S', 'Z', 'J', 'L'],
    initialHold: null,
    steps: [
      {
        stepNumber: 1,
        tip: 'Step 1: Fill the central gap with I',
        subTip: 'Drop the I piece vertically into the center.',
        subTipColor: 'cyan',
        neededPiece: 'I',
        targetPosition: { x: 4, y: 16, rotation: 1 },
        successCondition: { type: 'perfect_clear' },
        feedbackSuccess: 'Perfect Clear! Huge value.',
        feedbackFail: 'You cleared lines but board is not empty yet.',
      },
    ],
  },
  {
    id: 'downstack-basics',
    category: 'defense',
    title: 'Downstacking Basics',
    description: 'Dig through garbage efficiently using clean line access.',
    difficulty: 'beginner',
    orderIndex: 5,
    initialBoard: [
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      G(4),
      G(2),
      G(7),
      G(1),
      G(5),
      G(3),
      G(6),
      G(0),
      G(8),
      G(4),
    ],
    initialQueue: ['I', 'I', 'I', 'I', 'I', 'I', 'I'],
    initialHold: null,
    steps: [
      {
        stepNumber: 1,
        tip: 'Step 1: Use I pieces to dig through garbage',
        subTip: 'Clear at least 5 lines to complete the drill.',
        subTipColor: 'yellow',
        neededPiece: 'I',
        targetPosition: { x: 4, y: 16, rotation: 1 },
        successCondition: { type: 'clear', minLines: 5 },
        feedbackSuccess: 'Great downstacking. You dug out efficiently.',
        feedbackFail: 'Keep digging. You need at least 5 lines.',
      },
    ],
  },
  {
    id: '4-wide-combo',
    category: 'combos',
    title: '4-Wide Combo',
    description: 'Keep a 4-wide lane open and chain clears for combo pressure.',
    difficulty: 'intermediate',
    orderIndex: 6,
    initialBoard: [
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      E(),
      R(0, 0, 0, 0, 1, 1, 1, 1, 1, 1),
      R(0, 0, 0, 0, 1, 1, 1, 1, 1, 1),
      R(0, 0, 0, 0, 1, 1, 1, 1, 1, 1),
      R(0, 0, 0, 0, 1, 1, 1, 1, 1, 1),
      R(0, 0, 0, 0, 1, 1, 1, 1, 1, 1),
      R(0, 0, 0, 0, 1, 1, 1, 1, 1, 1),
      R(0, 0, 0, 0, 1, 1, 1, 1, 1, 1),
    ],
    initialQueue: ['I', 'I', 'I', 'I', 'I', 'I', 'I'],
    initialHold: null,
    steps: [
      {
        stepNumber: 1,
        tip: 'Step 1: Drop I vertically into the 4-wide channel',
        subTip: 'Each clear maintains combo momentum.',
        subTipColor: 'cyan',
        neededPiece: 'I',
        targetPosition: { x: 0, y: 16, rotation: 1 },
        successCondition: { type: 'clear', minLines: 1 },
        feedbackSuccess: 'Combo continues. Keep chaining.',
        feedbackFail: 'Drop I in the left channel to clear and continue combo.',
      },
    ],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getLessonsByCategory(category: string): Lesson[] {
  return LESSONS.filter((l) => l.category === category).sort((a, b) => a.orderIndex - b.orderIndex);
}

export const CATEGORIES = [
  {
    id: 'spins',
    label: 'Spins',
    icon: '🌀',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
  },
  {
    id: 'openers',
    label: 'Openers',
    icon: '🚀',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
  },
  {
    id: 'combos',
    label: 'Combos',
    icon: '🔥',
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
  },
  {
    id: 'defense',
    label: 'Defense',
    icon: '🛡️',
    color: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'bg-green-500/5',
  },
] as const;
