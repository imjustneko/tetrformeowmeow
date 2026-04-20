'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { LESSONS, CATEGORIES } from '@/lib/training/lessons';
import api from '@/lib/api';

interface Progress {
  lessonId: string;
  completed: boolean;
  attempts: number;
}

export default function TrainPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [activeCategory, setActiveCategory] = useState('spins');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    api
      .get<Progress[]>('/api/training/progress')
      .then((r) => setProgress(r.data))
      .catch(() => undefined);
  }, []);

  const getProgress = (lessonId: string) => progress.find((p) => p.lessonId === lessonId);

  const categoryLessons = LESSONS.filter((l) => l.category === activeCategory).sort((a, b) => a.orderIndex - b.orderIndex);
  const completedInCategory = categoryLessons.filter((l) => getProgress(l.id)?.completed).length;

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8 pt-20">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-black">
            <span className="text-cyan-400">Training</span> Academy
          </h1>
          <p className="text-gray-400">
            Master every technique. Hologram guides show exactly where to place each piece.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => {
            const catLessons = LESSONS.filter((l) => l.category === cat.id);
            const catDone = catLessons.filter((l) => getProgress(l.id)?.completed).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-all ${
                  activeCategory === cat.id
                    ? `${cat.bg} ${cat.border} ${cat.color}`
                    : 'border-[#2a2a3a] bg-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-xs ${activeCategory === cat.id ? 'bg-white/10' : 'bg-[#2a2a3a]'}`}>
                  {catDone}/{catLessons.length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-400">Category progress</span>
            <span className="font-bold text-cyan-400">
              {completedInCategory}/{categoryLessons.length} completed
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#1a1a28]">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${categoryLessons.length ? (completedInCategory / categoryLessons.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categoryLessons.map((lesson, i) => {
            const prog = getProgress(lesson.id);
            const isCompleted = prog?.completed ?? false;
            const isLocked = i > 0 && !getProgress(categoryLessons[i - 1]?.id)?.completed;
            return (
              <div
                key={lesson.id}
                className={`relative rounded-2xl border bg-[#12121a] p-6 transition-all ${
                  isLocked
                    ? 'cursor-not-allowed border-[#1a1a28] opacity-50'
                    : isCompleted
                      ? 'border-green-500/30 hover:border-green-500/50'
                      : 'cursor-pointer border-[#2a2a3a] hover:border-cyan-500/30'
                }`}
              >
                {isCompleted ? <div className="absolute right-4 top-4 text-xl text-green-400">✓</div> : null}
                {isLocked ? <div className="absolute right-4 top-4 text-xl text-gray-600">🔒</div> : null}

                <div className="flex items-start gap-4">
                  <div className={`shrink-0 text-3xl ${isLocked ? 'grayscale' : ''}`}>
                    {lesson.category === 'spins'
                      ? '🌀'
                      : lesson.category === 'openers'
                        ? '🚀'
                        : lesson.category === 'combos'
                          ? '🔥'
                          : '🛡️'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">{lesson.title}</h3>
                    </div>
                    <span
                      className={`mb-2 inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${
                        lesson.difficulty === 'beginner'
                          ? 'border-green-500/30 bg-green-500/10 text-green-400'
                          : lesson.difficulty === 'intermediate'
                            ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                      }`}
                    >
                      {lesson.difficulty}
                    </span>
                    <p className="mb-4 text-sm leading-relaxed text-gray-500">{lesson.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {lesson.steps.length} step{lesson.steps.length !== 1 ? 's' : ''} ·{' '}
                        {prog ? `${prog.attempts} attempt${prog.attempts !== 1 ? 's' : ''}` : 'Not started'}
                      </span>
                      {!isLocked ? (
                        <Link href={`/train/${lesson.id}`}>
                          <button
                            className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-colors ${
                              isCompleted
                                ? 'border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                : 'bg-cyan-500 text-black hover:bg-cyan-400'
                            }`}
                          >
                            {isCompleted ? 'Practice Again' : 'Start'}
                          </button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
