'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BookChapter } from '@/domain/library/types';
import { useReadingProgress } from '@/features/library/hooks/useReadingProgress';
import { useBookAnnotations } from '@/features/library/hooks/useBookAnnotations';
import { useBookTags } from '@/features/library/hooks/useBookTags';
import { CanonicalRefEntity } from '@/domain/library/entities/CanonicalRef';
import { sliderToPx } from '../utils/constants';
import { getHeadingAnchorId } from '../utils/readerAnchors';

interface UseBookReaderOptions {
  userId: string | undefined;
  bookId: string;
  chapters: BookChapter[];
  initialRef?: string | null;
}

type PendingScrollTarget =
  | { kind: 'chapter'; chapterOrder: number }
  | { kind: 'ref'; chapterOrder: number; ref: string }
  | { kind: 'heading'; chapterOrder: number; blockId: string };

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
  const [requestedChapterMounts, setRequestedChapterMounts] = useState<Set<number>>(() => new Set());

  const chapterRefs = useRef<Map<number, HTMLElement>>(new Map());
  const activeRefForChapter = useRef<Map<number, string>>(new Map());
  const pendingScrollTarget = useRef<PendingScrollTarget | null>(null);
  // Track maior ponto alcançado (não o que está visível agora) — pra modal/bookmark refletir progresso real
  const maxChapterReached = useRef<number>(0);
  const maxRefReached = useRef<string | null>(null);

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

  const requestChapterMount = useCallback((order: number) => {
    setRequestedChapterMounts(prev => {
      if (prev.has(order)) return prev;
      const next = new Set(prev);
      next.add(order);
      return next;
    });
  }, []);

  const isChapterMountRequested = useCallback((order: number) => {
    return requestedChapterMounts.has(order);
  }, [requestedChapterMounts]);

  const runPendingScroll = useCallback((attempts = 18) => {
    const target = pendingScrollTarget.current;
    if (!target) return;

    const elementId = getTargetElementId(target);
    if (elementId) {
      const targetEl = document.getElementById(elementId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        pendingScrollTarget.current = null;
        return;
      }
    }

    const chapterEl = chapterRefs.current.get(target.chapterOrder);
    if (target.kind === 'chapter' && chapterEl) {
      chapterEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      pendingScrollTarget.current = null;
      return;
    }

    if (attempts <= 0) {
      if (chapterEl) chapterEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      pendingScrollTarget.current = null;
      return;
    }

    setTimeout(() => runPendingScroll(attempts - 1), 150);
  }, []);

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
    const parsed = CanonicalRefEntity.tryParse(initialRef);
    if (!parsed) return;
    requestChapterMount(parsed.chapter);
    pendingScrollTarget.current = { kind: 'ref', chapterOrder: parsed.chapter, ref: initialRef };
    runPendingScroll();
  }, [initialRef, chapters.length, requestChapterMount, runPendingScroll]);

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
            // Atualiza maxChapterReached só pra cima (nunca desce)
            if (order > maxChapterReached.current) maxChapterReached.current = order;
            const lastRef = activeRefForChapter.current.get(order) ?? null;
            updatePosition(maxChapterReached.current, lastRef, chapters.length);
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
    requestChapterMount(order);
    pendingScrollTarget.current = { kind: 'chapter', chapterOrder: order };
    runPendingScroll();
  }, [requestChapterMount, runPendingScroll]);

  const jumpToHeading = useCallback((chapterOrder: number, blockId: string) => {
    setDrawerOpen(false);
    requestChapterMount(chapterOrder);
    pendingScrollTarget.current = { kind: 'heading', chapterOrder, blockId };
    runPendingScroll();
  }, [requestChapterMount, runPendingScroll]);

  const continueSaved = useCallback(() => {
    setShowContinueBanner(false);
    if (!progress) return;
    if (progress.last_ref) {
      const parsed = CanonicalRefEntity.tryParse(progress.last_ref);
      if (!parsed) {
        jumpToChapter(progress.last_chapter_order);
        return;
      }
      requestChapterMount(parsed.chapter);
      pendingScrollTarget.current = { kind: 'ref', chapterOrder: parsed.chapter, ref: progress.last_ref };
      runPendingScroll();
      return;
    }
    jumpToChapter(progress.last_chapter_order);
  }, [progress, requestChapterMount, runPendingScroll, jumpToChapter]);

  // Bookmark é stale se passou > 7 dias desde última marcação manual
  const STALE_BOOKMARK_DAYS = 7;
  function isBookmarkStale(): boolean {
    if (!progress?.last_bookmark_at) return false;
    const last = new Date(progress.last_bookmark_at).getTime();
    const elapsedDays = (Date.now() - last) / (1000 * 60 * 60 * 24);
    return elapsedDays > STALE_BOOKMARK_DAYS;
  }

  function handleBack() {
    const inProgress = readPercent > 5 && readPercent < 100;
    const hasManualBookmark = !!progress?.last_bookmark_at;
    // Mostra modal se: (1) sem marcação manual nunca OU (2) marcação muito antiga
    if (inProgress && (!hasManualBookmark || isBookmarkStale())) {
      setShowExitGuard(true);
      return;
    }
    router.push('/app/dashboard/library');
  }

  function handleExit() {
    router.push('/app/dashboard/library');
  }

  async function handleSaveAndExit() {
    // Salva ponto MAIS PROFUNDO alcançado (não posição atual de scroll)
    const targetChapter = maxChapterReached.current || activeChapter || 1;
    const targetRef = maxRefReached.current ?? activeRefForChapter.current.get(targetChapter) ?? null;
    await saveBookmark(targetRef, targetChapter, chapters.length);
    router.push('/app/dashboard/library');
  }

  function registerChapterRef(order: number, el: HTMLElement | null) {
    if (el) chapterRefs.current.set(order, el);
    else chapterRefs.current.delete(order);
    if (el && pendingScrollTarget.current?.chapterOrder === order) {
      setTimeout(() => runPendingScroll(), 0);
    }
  }

  function setActiveRef(chapterOrder: number, ref: string) {
    // Atualiza apenas se ref é maior que último registrado (memoriza ponto mais avançado)
    const prev = activeRefForChapter.current.get(chapterOrder);
    if (prev) {
      const prevParsed = CanonicalRefEntity.tryParse(prev);
      const newParsed = CanonicalRefEntity.tryParse(ref);
      if (prevParsed && newParsed && CanonicalRefEntity.compare(newParsed, prevParsed) <= 0) return;
    }
    activeRefForChapter.current.set(chapterOrder, ref);

    // Track max global (capítulo + ref) pra modal exibir ponto mais profundo
    if (chapterOrder > maxChapterReached.current) {
      maxChapterReached.current = chapterOrder;
      maxRefReached.current = ref;
    } else if (chapterOrder === maxChapterReached.current) {
      const max = CanonicalRefEntity.tryParse(maxRefReached.current ?? '');
      const cur = CanonicalRefEntity.tryParse(ref);
      if (!max || (cur && CanonicalRefEntity.compare(cur, max) > 0)) {
        maxRefReached.current = ref;
      }
    }
  }

  // Ponto MAIS PROFUNDO alcançado na leitura (não o atualmente visível) — usado pelo modal
  const currentRef = maxRefReached.current;
  const maxChapterOrder = maxChapterReached.current || activeChapter || 0;
  const currentChapter = chapters.find(c => c.order === maxChapterOrder) ?? null;

  return {
    drawerOpen, setDrawerOpen,
    activeChapter,
    currentRef,
    currentChapter,
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
    jumpToHeading,
    continueSaved,
    isChapterMountRequested,
    handleBack,
    handleComplete,
    handleExit,
    handleSaveAndExit,
    registerChapterRef,
    setActiveRef,
  };
}

function getTargetElementId(target: PendingScrollTarget): string | null {
  if (target.kind === 'ref') return `ref-${target.ref.replace(':', '-')}`;
  if (target.kind === 'heading') return getHeadingAnchorId(target.chapterOrder, target.blockId);
  return null;
}
