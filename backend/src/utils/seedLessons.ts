import { prisma } from '../lib/prisma';

const LESSON_SEEDS = [
  { id: 'tspin-single', category: 'spins', title: 'T-Spin Single', difficulty: 'beginner', orderIndex: 0 },
  { id: 'tspin-double', category: 'spins', title: 'T-Spin Double', difficulty: 'beginner', orderIndex: 1 },
  { id: 'tspin-triple', category: 'spins', title: 'T-Spin Triple', difficulty: 'intermediate', orderIndex: 2 },
  { id: 'mini-tspin', category: 'spins', title: 'Mini T-Spin', difficulty: 'beginner', orderIndex: 3 },
  { id: 'perfect-clear', category: 'combos', title: 'Perfect Clear Basics', difficulty: 'intermediate', orderIndex: 4 },
  { id: 'downstack-basics', category: 'defense', title: 'Downstacking Basics', difficulty: 'beginner', orderIndex: 5 },
  { id: '4-wide-combo', category: 'combos', title: '4-Wide Combo', difficulty: 'intermediate', orderIndex: 6 },
];

async function seed() {
  console.log('Seeding lessons...');
  for (const lesson of LESSON_SEEDS) {
    await prisma.lesson.upsert({
      where: { id: lesson.id },
      create: {
        ...lesson,
        description: '',
        boardSetup: {},
        successCriteria: {},
      },
      update: {
        ...lesson,
        description: '',
        boardSetup: {},
        successCriteria: {},
      },
    });
    console.log(`  - ${lesson.title}`);
  }
  console.log('Done');
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
