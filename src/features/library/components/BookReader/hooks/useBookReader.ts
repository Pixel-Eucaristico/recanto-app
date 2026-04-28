'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BookChapter } from '@/domain/library/types';
import { useReadingProgress } from '@/features/library/hooks/useReadingProgress';
import { useBookAnnotations } from '@/features/library/hooks/useBookAnnotations';
import { useBookTags } from '@/features/library/hooks/useBookTags';
import { sliderToPx } from '../utils/constants';

interface UseBookReaderOptions {
  userId: string | undefined;
  bookId: string;
  chapters: BookChapter[];
  initialRef?: string | null;
}

export function useBookReader({ userId, bookId, chapters, initialRef }: UseBookReaderOptions) {
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState<number | null>(chapters[0]?.order ?? null);
  const [fontLevel, setFontLevel] = useState<number>(() => {
    if (typeof window === 'undefined') return 2;
    const saved = localStorage.getItem('book-reader-font-level');
    const n = saved !== null ? Number(saved) : 2;
    return Number.isNaN(n) ? 2 : Math.min(35, Math.max(0, n));
  });
  const [showContinueBanner, setShowContinueBanner] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const continueModalShown = useRef(false);
  const [showExitGuard, setShowExitGuard] = useState(false);
  const [commentTarget, setCommentTarget] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const chapterRefs = useRef<Map<number, HTMLElement>>(new Map());
  const activeRefForChapter = useRef<Map<number, string>>(new Map());

  const { progress, bookmarkError, updatePosition, saveBookmark, completeReading } =
    useReadingProgress(userId, bookId);

  const {
    highlights, comments, highlightsForRef, commentsForRef,
    addHighlight, removeHighlight, addComment, updateComment, removeComment,
    error: annotationError,
  } = useBookAnnotations(userId, bookId);

  const { tags, tagsForRef, tagsForChapter, addTag, removeTag } = useBookTags(userId, bookId);

  const readPercent = progress?.percent ?? 0;
  const fontPx = sliderToPx(fontLevel);

  function changeFontLevel(v: number) {
    const clamped = Math.min(35, Math.max(0, v));
    setFontLevel(clamped);
    if (typeof window !== 'undefined') localStorage.setItem('book-reader-font-level', String(clamped));
  }

  async function handleComplete() {
    setCompleting(true);
    await completeReading(chapters[chapters.length - 1]?.order ?? 1);
    setCompleting(false);
  }

  useEffect(() => {
    if (!progress) return;
    const hasPosition = progress.last_ref || progress.last_chapter_order > 0;
    if (!hasPosition) return;
    setShowContinueBanner(true);
    if (!continueModalShown.current && !initialRef) {
      continueModalShown.current = true;
      setShowContinueModal(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.id]);

  useEffect(() => {
    if (!initialRef) return;
    const id = `ref-${initialRef.replace(':', '-')}`;
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-base-100');
        setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-base-100'), 2400);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [initialRef, chapters.length]);

  useEffect(() => {
    const refs = chapterRefs.current;
    if (refs.size === 0) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const order = Number(visible[0].target.getAttribute('data-chapter-order'));
          if (!Number.isNaN(order)) {
            setActiveChapter(order);
            const lastRef = activeRefForChapter.current.get(order) ?? null;
            updatePosition(order, lastRef, chapters.length);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    refs.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [chapters.length, updatePosition]);

  const jumpToChapter = useCallback((order: number) => {
    setDrawerOpen(false);
    const el = chapterRefs.current.get(order);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const continueSaved = useCallback(() => {
    setShowContinueBanner(false);
    if (!progress) return;
    if (progress.last_ref) {
      const id = `ref-${progress.last_ref.replace(':', '-')}`;
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    }
    jumpToChapter(progress.last_chapter_order);
  }, [progress, jumpToChapter]);

  function handleBack() {
    const inProgress = readPercent > 5 && readPercent < 100;
    const hasManualBookmark = !!progress?.last_ref;
    if (inProgress && !hasManualBookmark) {
      setShowExitGuard(true);
      return;
    }
    router.push('/app/dashboard/library');
  }

  function handleExit() {
    router.push('/app/dashboard/library');
  }

  async function handleSaveAndExit() {
    if (activeChapter !== null) {
      const lastRef = activeRefForChapter.current.get(activeChapter) ?? null;
      await saveBookmark(lastRef, activeChapter, chapters.length);
    }
    router.push('/app/dashboard/library');
  }

  function registerChapterRef(order: number, el: HTMLElement | null) {
    if (el) chapterRefs.current.set(order, el);
    else chapterRefs.current.delete(order);
  }

  function setActiveRef(chapterOrder: number, ref: string) {
    activeRefForChapter.current.set(chapterOrder, ref);
  }

  return {
    drawerOpen, setDrawerOpen,
    activeChapter,
    fontLevel, fontPx, changeFontLevel,
    showContinueBanner, setShowContinueBanner,
    showContinueModal, setShowContinueModal,
    showExitGuard, setShowExitGuard,
    commentTarget, setCommentTarget,
    completing,
    readPercent,
    progress, bookmarkError, saveBookmark, completeReading,
    highlights, comments, commentsForRef, highlightsForRef, tagsForRef,
    addHighlight, removeHighlight, addComment, updateComment, removeComment,
    tags, tagsForChapter, addTag, removeTag,
    annotationError,
    jumpToChapter,
    continueSaved,
    handleBack,
    handleComplete,
    handleExit,
    handleSaveAndExit,
    registerChapterRef,
    setActiveRef,
  };
}
