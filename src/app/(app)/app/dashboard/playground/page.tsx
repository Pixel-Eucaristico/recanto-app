'use client';

import Link from 'next/link';
import { FlaskConical, PlayCircle, FileEdit, Award, Layers, GitBranch, Network, Search, Grid3x3, MessagesSquare, ListChecks } from 'lucide-react';

export default function PlaygroundIndexPage() {
  const demos = [
    {
      href: '/app/dashboard/playground/video-player',
      icon: PlayCircle,
      title: 'Video Player',
      description: 'LockedVideoPlayer com anti-skip e countdown (Feature 3).',
    },
    {
      href: '/app/dashboard/playground/reflection-editor',
      icon: FileEdit,
      title: 'Reflection Editor',
      description: 'ReflectionEditor do caderno espiritual (Feature 2).',
    },
    {
      href: '/app/dashboard/playground/quiz',
      icon: Award,
      title: 'Quiz',
      description: 'QuizBuilder + QuizPlayer + QuizResult com 6 tipos de pergunta (Feature 4+5).',
    },
    {
      href: '/app/dashboard/playground/case-studies',
      icon: GitBranch,
      title: 'Case Studies',
      description: 'Estudos de caso com decisões múltiplas (Feature 7).',
    },
    {
      href: '/app/dashboard/playground/word-search',
      icon: Search,
      title: 'Word Search',
      description: 'Caça-palavras com grid gerado automático (Feature 9).',
    },
    {
      href: '/app/dashboard/playground/crossword',
      icon: Grid3x3,
      title: 'Palavras Cruzadas',
      description: 'Admin digita pergunta+resposta; grid auto-montado cruzando letras.',
    },
    {
      href: '/app/dashboard/playground/mind-maps',
      icon: Network,
      title: 'Mind Maps',
      description: 'Mapa mental editável pelo aluno a partir de template (Feature 8).',
    },
    {
      href: '/app/dashboard/playground/flashcards',
      icon: Layers,
      title: 'Flashcards',
      description: 'Deck com flip 3D + acertei/errei (Feature 6).',
    },
    {
      href: '/app/dashboard/playground/community',
      icon: MessagesSquare,
      title: 'Comunidade',
      description: 'Fórum por aula — criar tópico, responder (Feature 10).',
    },
    {
      href: '/app/dashboard/playground/progress-checklist',
      icon: ListChecks,
      title: 'Checklist de progresso',
      description: 'Widget de aula + trilha com % (Feature 11).',
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <FlaskConical className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Playground</h1>
            <p className="text-base-content/60 text-sm">
              Demos isoladas dos componentes antes da integração na página da aula (Feature 6).
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demos.map(d => (
          <Link
            key={d.href}
            href={d.href}
            className="card bg-base-100 border border-base-300 hover:shadow-md transition-shadow"
          >
            <div className="card-body gap-2">
              <d.icon className="w-6 h-6 text-primary" />
              <h2 className="card-title text-base-content">{d.title}</h2>
              <p className="text-sm text-base-content/60">{d.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
