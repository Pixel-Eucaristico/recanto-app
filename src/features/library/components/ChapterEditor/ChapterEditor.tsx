'use client';

import { useState } from 'react';
import { Loader2, Check, RotateCcw, X } from 'lucide-react';
import type { BookChapter, BookReference, CitationStyle } from '@/domain/library/types';
import { ChapterMetaForm } from './components/ChapterMetaForm';
import { ChapterViewPanel } from './components/ChapterViewPanel';
import { ChapterEditPanel } from './components/ChapterEditPanel';
import { DiscardModal } from './components/DiscardModal';
import { useChapterEditor, type SaveChapterPayload } from './hooks/useChapterEditor';
import { BibliographyEditor } from '@/features/library/components/BibliographyEditor';
import { GlossaryEditor } from '@/features/library/components/GlossaryEditor';
import { CreditsEditor } from '@/features/library/components/CreditsEditor';
import { FootnotePanel } from '@/features/library/components/FootnotePanel';
import { CitationPickerModal } from '@/features/library/components/CitationPickerModal';

interface ChapterEditorProps {
  bookId: string;
  chapter: BookChapter | null;
  defaultOrder: number;
  saving: boolean;
  onSave: (payload: SaveChapterPayload) => Promise<void>;
  onCancel: () => void;
  /** Bibliography references available across the book (for citation picker) */
  bookReferences?: BookReference[];
  bookCitationStyle?: CitationStyle;
  /** Save updated reference list back to the book's bibliography chapter */
  onUpdateBookReferences?: (refs: BookReference[]) => Promise<void>;
  /** Outros capítulos do livro — pra auto-carregar singleton existente ao trocar kind. */
  existingChapters?: BookChapter[];
}

export function ChapterEditor({
  bookId, chapter, defaultOrder, saving, onSave, onCancel,
  bookReferences, bookCitationStyle, onUpdateBookReferences, existingChapters,
}: ChapterEditorProps) {
  const ed = useChapterEditor({ bookId, chapter, defaultOrder, saving, onSave, onCancel, existingChapters });
  const [citationPicker, setCitationPicker] = useState<{ insertAtCursor: (text: string) => void } | null>(null);

  // Sections that use a markdown editor (with optional footnotes)
  const isMarkdownSection = ed.kind !== 'bibliography' && ed.kind !== 'glossary' && ed.kind !== 'credits';

  function handleRequestCitation(insertAtCursor: (text: string) => void) {
    setCitationPicker({ insertAtCursor });
  }

  function handlePickCitation(citationText: string) {
    citationPicker?.insertAtCursor(citationText);
    setCitationPicker(null);
  }

  return (
    <div className="space-y-4">
      <DraftStatusBadge status={ed.draftStatus} />
      {ed.draftRestored && (
        <DraftRestoredBanner
          ts={ed.draftRestored.ts}
          onDiscard={ed.discardRestoredDraft}
          onDismiss={ed.dismissDraftRestored}
        />
      )}
      <ChapterMetaForm
        title={ed.title}
        subtitle={ed.subtitle}
        order={ed.order}
        kind={ed.kind}
        isDirty={ed.isDirty}
        chapterLabel={chapter ? `Seção ${chapter.order}` : 'Nova seção'}
        orderLocked={!!chapter}
        onTitleChange={ed.setTitle}
        onSubtitleChange={ed.setSubtitle}
        onOrderChange={ed.setOrder}
        onKindChange={ed.setKind}
        onBack={ed.handleBack}
      />

      {ed.error && <div className="alert alert-error text-sm"><span>{ed.error}</span></div>}

      {/* Special editor by section kind */}
      {ed.kind === 'bibliography' && (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <BibliographyEditor
              references={ed.references}
              citationStyle={ed.citationStyle}
              onChange={(refs, style) => { ed.setReferences(refs); ed.setCitationStyle(style); }}
            />
            <div className="flex justify-end mt-4">
              <button type="button" className="btn btn-primary btn-sm" onClick={ed.handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar bibliografia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {ed.kind === 'glossary' && (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <GlossaryEditor
              terms={ed.glossaryTerms}
              onChange={ed.setGlossaryTerms}
            />
            <div className="flex justify-end mt-4">
              <button type="button" className="btn btn-primary btn-sm" onClick={ed.handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar glossário'}
              </button>
            </div>
          </div>
        </div>
      )}

      {ed.kind === 'credits' && (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <CreditsEditor credits={ed.credits} onChange={ed.setCredits} />
            <div className="flex justify-end mt-4">
              <button type="button" className="btn btn-primary btn-sm" onClick={ed.handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar créditos'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Markdown editor for chapter/preface/intro/appendix/notes/about */}
      {isMarkdownSection && (
        <>
          {ed.mode === 'view' ? (
            <ChapterViewPanel previewBlocks={ed.previewBlocks} onEdit={() => ed.setMode('edit')} />
          ) : (
            <ChapterEditPanel
              order={ed.order}
              markdown={ed.markdown}
              saving={saving}
              titleEmpty={ed.title.trim().length === 0}
              onChange={ed.setMarkdown}
              onPreview={() => ed.setMode('view')}
              onSave={ed.handleSave}
              onRequestFootnote={ed.reserveFootnoteNumber}
              onRequestCitation={bookReferences ? handleRequestCitation : undefined}
            />
          )}

          {/* Footnote panel — available in any markdown section */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
              <FootnotePanel
                footnotes={ed.footnotes}
                chapterMarkdown={ed.markdown}
                onChange={ed.setFootnotes}
                onInsertMarker={ed.insertFootnoteMarker}
              />
            </div>
          </div>
        </>
      )}

      {citationPicker && bookReferences && (
        <CitationPickerModal
          references={bookReferences}
          citationStyle={bookCitationStyle ?? 'abnt'}
          onClose={() => setCitationPicker(null)}
          onPick={handlePickCitation}
          onAddReference={onUpdateBookReferences}
        />
      )}

      {ed.confirmDiscard && (
        <DiscardModal
          saving={saving}
          titleEmpty={ed.title.trim().length === 0}
          onContinue={() => ed.setConfirmDiscard(false)}
          onDiscard={() => { ed.clearDraft(); ed.setConfirmDiscard(false); onCancel(); }}
          onSaveAndExit={ed.handleSaveAndClose}
        />
      )}
    </div>
  );
}

function DraftRestoredBanner({ ts, onDiscard, onDismiss }: { ts: number; onDiscard: () => void; onDismiss: () => void }) {
  const when = new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  return (
    <div className="alert alert-info text-sm flex items-center gap-3 py-2.5">
      <RotateCcw className="w-4 h-4 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold">Rascunho não salvo restaurado</p>
        <p className="text-xs opacity-80">Editado em {when} — você pode continuar de onde parou.</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button type="button" className="btn btn-ghost btn-xs" onClick={onDiscard} title="Descartar rascunho">
          Descartar
        </button>
        <button type="button" className="btn btn-ghost btn-xs btn-circle" onClick={onDismiss} title="Fechar aviso">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function DraftStatusBadge({ status }: { status: 'idle' | 'pending' | 'saved' }) {
  if (status === 'idle') return null;
  return (
    <div className="fixed bottom-4 right-4 z-40">
      {status === 'pending' && (
        <div className="badge badge-ghost gap-2 py-3 px-3 shadow-md">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-xs">Salvando rascunho...</span>
        </div>
      )}
      {status === 'saved' && (
        <div className="badge badge-success gap-2 py-3 px-3 shadow-md">
          <Check className="w-3.5 h-3.5" />
          <span className="text-xs">Rascunho salvo</span>
        </div>
      )}
    </div>
  );
}
