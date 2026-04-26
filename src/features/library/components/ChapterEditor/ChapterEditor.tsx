'use client';

import type { BookChapter } from '@/domain/library/types';
import { ChapterMetaForm } from './components/ChapterMetaForm';
import { ChapterViewPanel } from './components/ChapterViewPanel';
import { ChapterEditPanel } from './components/ChapterEditPanel';
import { DiscardModal } from './components/DiscardModal';
import { useChapterEditor } from './hooks/useChapterEditor';

interface ChapterEditorProps {
  bookId: string;
  chapter: BookChapter | null;
  defaultOrder: number;
  saving: boolean;
  onSave: (chapter: { book_id: string; order: number; title: string; subtitle?: string; blocks: BookChapter['blocks'] }) => Promise<void>;
  onCancel: () => void;
}

export function ChapterEditor({ bookId, chapter, defaultOrder, saving, onSave, onCancel }: ChapterEditorProps) {
  const {
    title, setTitle,
    subtitle, setSubtitle,
    order, setOrder,
    markdown, setMarkdown,
    mode, setMode,
    isDirty,
    error,
    confirmDiscard, setConfirmDiscard,
    previewBlocks,
    handleSave,
    handleBack,
    handleSaveAndClose,
  } = useChapterEditor({ bookId, chapter, defaultOrder, saving, onSave, onCancel });

  return (
    <div className="space-y-4">
      <ChapterMetaForm
        title={title}
        subtitle={subtitle}
        order={order}
        isDirty={isDirty}
        chapterLabel={chapter ? `Capítulo ${chapter.order}` : 'Novo capítulo'}
        orderLocked={!!chapter}
        onTitleChange={setTitle}
        onSubtitleChange={setSubtitle}
        onOrderChange={setOrder}
        onBack={handleBack}
      />

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {mode === 'view' ? (
        <ChapterViewPanel previewBlocks={previewBlocks} onEdit={() => setMode('edit')} />
      ) : (
        <ChapterEditPanel
          order={order}
          markdown={markdown}
          saving={saving}
          titleEmpty={title.trim().length === 0}
          onChange={setMarkdown}
          onPreview={() => setMode('view')}
          onSave={handleSave}
        />
      )}

      {confirmDiscard && (
        <DiscardModal
          saving={saving}
          titleEmpty={title.trim().length === 0}
          onContinue={() => setConfirmDiscard(false)}
          onDiscard={() => { setConfirmDiscard(false); onCancel(); }}
          onSaveAndExit={handleSaveAndClose}
        />
      )}
    </div>
  );
}
