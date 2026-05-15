'use client';

import { Flame, GraduationCap, Library } from 'lucide-react';

interface JourneyHeroProps {
  userName: string;
  streakDays: number;
  lessonsCompleted: number;
  booksRead: number;
}

export function JourneyHero({ userName, streakDays, lessonsCompleted, booksRead }: JourneyHeroProps) {
  const greeting = getGreeting();
  const firstName = userName.split(' ')[0];

  return (
    <div className="bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 border border-base-300 rounded-2xl p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-base-content">
        {greeting}, {firstName}
      </h1>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <Stat icon={<Flame className="w-4 h-4" />} value={streakDays} label="dias seguidos" highlight={streakDays > 0} />
        <Stat icon={<GraduationCap className="w-4 h-4" />} value={lessonsCompleted} label="aulas" />
        <Stat icon={<Library className="w-4 h-4" />} value={booksRead} label="livros" />
      </div>
    </div>
  );
}

function Stat({ icon, value, label, highlight }: {
  icon: React.ReactNode;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-2 sm:p-3 text-center ${highlight ? 'bg-warning/10 border border-warning/30' : 'bg-base-200/60'}`}>
      <div className={`flex items-center justify-center gap-1 ${highlight ? 'text-warning' : 'text-base-content/60'}`}>
        {icon}
        <span className="text-lg sm:text-xl font-bold">{value}</span>
      </div>
      <p className="text-[10px] sm:text-xs text-base-content/60 mt-0.5">{label}</p>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
