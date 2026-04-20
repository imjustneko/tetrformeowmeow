import { GameEngine } from '@/lib/game/engine';
import type { GameState, ClearResult, ActivePiece, CellValue, PieceType } from '@/lib/game/types';
import { HIDDEN_ROWS } from '@/lib/game/constants';
import type { Lesson, LessonStep } from './lessons';

export type StepResult = 'success' | 'fail' | 'pending';

export interface TrainingState {
  gameState: GameState;
  currentStep: number;
  totalSteps: number;
  stepResult: StepResult;
  feedbackMessage: string;
  lessonComplete: boolean;
  showHologram: boolean;
}

export class TrainingEngine {
  private readonly lesson: Lesson;
  private currentStepIndex = 0;
  private innerEngine: GameEngine;
  private accumulatedClears = 0;
  private lastTrainingState: TrainingState | null = null;

  onStateChange: (state: TrainingState) => void = () => {};
  onStepComplete: (stepIndex: number, result: StepResult) => void = () => {};

  constructor(lesson: Lesson) {
    this.lesson = lesson;
    this.innerEngine = this.buildEngine();
  }

  private toInternalBoard(visibleBoard: CellValue[][]): CellValue[][] {
    const hidden = Array.from({ length: HIDDEN_ROWS }, () => Array(10).fill(0) as CellValue[]);
    const visible = visibleBoard.map((row) => [...row]);
    return [...hidden, ...visible];
  }

  private buildEngine(): GameEngine {
    const engine = new GameEngine({ type: 'practice' });
    engine.setPracticeSetup({
      board: this.toInternalBoard(this.lesson.initialBoard),
      nextQueue: this.lesson.initialQueue,
      heldPiece: this.lesson.initialHold,
      canHold: true,
    });

    engine.setPracticeSequence(this.getStepPieceSequence(), true);

    engine.onStateChange = (gs) => {
      const prev = this.lastTrainingState;
      const feedback = prev?.feedbackMessage ?? '';
      const result = prev?.stepResult ?? 'pending';
      const complete = prev?.lessonComplete ?? false;
      const nextState = this.buildTrainingState(gs, result, feedback, complete);
      this.lastTrainingState = nextState;
      this.onStateChange(nextState);
    };

    engine.onPieceLock = (lockedPiece, clear) => {
      this.handleLock(lockedPiece, clear);
    };

    engine.onGameOver = (gs) => {
      const nextState = this.buildTrainingState(gs, 'fail', 'Board topped out. Retry the lesson.');
      this.lastTrainingState = nextState;
      this.onStateChange(nextState);
    };

    return engine;
  }

  private getStepPieceSequence(): PieceType[] {
    const remaining = this.lesson.steps.slice(this.currentStepIndex).map((s) => s.neededPiece);
    return remaining.length ? remaining : [this.lesson.steps[this.lesson.steps.length - 1].neededPiece];
  }

  private isTargetMatch(lockedPiece: ActivePiece, step: LessonStep): boolean {
    return (
      lockedPiece.type === step.neededPiece &&
      lockedPiece.position.x === step.targetPosition.x &&
      lockedPiece.position.y === step.targetPosition.y &&
      lockedPiece.rotation === step.targetPosition.rotation
    );
  }

  private evaluateStep(step: LessonStep, lockedPiece: ActivePiece, clear: ClearResult | null): StepResult {
    const cond = step.successCondition;
    if (step.allowedPieces?.length && !step.allowedPieces.includes(lockedPiece.type)) return 'fail';

    switch (cond.type) {
      case 'place':
        return this.isTargetMatch(lockedPiece, step) ? 'success' : 'fail';
      case 'tspin':
        return clear && clear.isTSpin && clear.linesCleared >= (cond.minLines ?? 1) ? 'success' : 'fail';
      case 'tspin_double':
        return clear && clear.isTSpin && !clear.isMiniTSpin && clear.linesCleared === 2 ? 'success' : 'fail';
      case 'tspin_triple':
        return clear && clear.isTSpin && clear.linesCleared === 3 ? 'success' : 'fail';
      case 'perfect_clear':
        return clear && clear.isPerfectClear ? 'success' : 'fail';
      case 'clear':
        this.accumulatedClears += clear?.linesCleared ?? 0;
        return this.accumulatedClears >= (cond.minLines ?? 1) ? 'success' : 'pending';
      default:
        return 'fail';
    }
  }

  private handleLock(lockedPiece: ActivePiece, clear: ClearResult | null): void {
    const step = this.getCurrentStep();
    if (!step) return;

    const result = this.evaluateStep(step, lockedPiece, clear);
    if (result === 'pending') {
      const pendingState = this.buildTrainingState(this.innerEngine.getState(), 'pending', step.subTip ?? '');
      this.lastTrainingState = pendingState;
      this.onStateChange(pendingState);
      return;
    }

    this.onStepComplete(this.currentStepIndex, result);
    if (result === 'success') {
      this.currentStepIndex++;
      this.accumulatedClears = 0;
      if (this.currentStepIndex >= this.lesson.steps.length) {
        this.innerEngine.pause();
        const doneState = this.buildTrainingState(
          this.innerEngine.getState(),
          'success',
          'Lesson Complete! Well done.',
          true
        );
        this.lastTrainingState = doneState;
        this.onStateChange(doneState);
        return;
      }
      this.innerEngine.setPracticeSequence(this.getStepPieceSequence(), true);
      const okState = this.buildTrainingState(this.innerEngine.getState(), 'success', step.feedbackSuccess);
      this.lastTrainingState = okState;
      this.onStateChange(okState);
      return;
    }

    const failState = this.buildTrainingState(this.innerEngine.getState(), 'fail', step.feedbackFail);
    this.lastTrainingState = failState;
    this.onStateChange(failState);
  }

  private getCurrentStep(): LessonStep | null {
    return this.lesson.steps[this.currentStepIndex] ?? null;
  }

  private buildTrainingState(
    gs: GameState,
    result: StepResult,
    message: string,
    lessonComplete = false
  ): TrainingState {
    return {
      gameState: gs,
      currentStep: this.currentStepIndex,
      totalSteps: this.lesson.steps.length,
      stepResult: result,
      feedbackMessage: message,
      lessonComplete,
      showHologram: true,
    };
  }

  start(): void {
    this.innerEngine.start();
  }

  restart(): void {
    this.innerEngine.stop();
    this.currentStepIndex = 0;
    this.accumulatedClears = 0;
    this.lastTrainingState = null;
    this.innerEngine = this.buildEngine();
    this.innerEngine.start();
  }

  moveLeft(): void {
    this.innerEngine.moveLeft();
  }
  moveRight(): void {
    this.innerEngine.moveRight();
  }
  softDrop(): void {
    this.innerEngine.softDrop();
  }
  sonicSoftDrop(): void {
    this.innerEngine.sonicSoftDrop();
  }
  hardDrop(): void {
    this.innerEngine.hardDrop();
  }
  rotateClockwise(): void {
    this.innerEngine.rotateClockwise();
  }
  rotateCounter(): void {
    this.innerEngine.rotateCounter();
  }
  rotate180(): void {
    this.innerEngine.rotate180();
  }
  hold(): void {
    this.innerEngine.hold();
  }
  stop(): void {
    this.innerEngine.stop();
  }

  getHologramTarget(): { x: number; y: number; rotation: 0 | 1 | 2 | 3; piece: PieceType } | null {
    const step = this.getCurrentStep();
    if (!step) return null;
    return { ...step.targetPosition, piece: step.neededPiece };
  }

  getCurrentStepData(): LessonStep | null {
    return this.getCurrentStep();
  }
}
