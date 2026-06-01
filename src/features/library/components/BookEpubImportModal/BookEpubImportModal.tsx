'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, FileUp, Loader2, Upload, X } from 'lucide-react';
import { bookEpubImporter, type ImportedBookDraft } from '@/application/library/BookEpubImporter';
import { libraryService } from '@/application/library/LibraryService';
import { mediaService } from '@/application/media/MediaService';

interface BookEpubImportModalProps {
  userId: string;
  onClose: () => void;
  onImported: () => Promise<void> | void;
}

export function BookEpubImportModal({ userId, onClose, onImported }: BookEpubImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<ImportedBookDraft | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importProgress, setImportProgress] = useState<{ saved: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const numberedBlocks = useMemo(() => {
    if (!draft) return 0;
    return draft.chapters.reduce((acc, chapter) => (
      acc + chapter.blocks.filter(block => block.kind === 'paragraph' || block.kind === 'quote').length
    ), 0);
  }, [draft]);

  async function parseSelectedFile(nextFile: File | null) {
    setFile(nextFile);
    setDraft(null);
    setError(null);
    setImportProgress(null);
    if (!nextFile) return;
    setParsing(true);
    try {
      setDraft(await bookEpubImporter.parse(nextFile));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setParsing(false);
    }
  }

  async function importDraft() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setImportProgress({ saved: 0, total: draft.chapters.length });
    try {
      const [coverUpload, backCoverUpload] = await Promise.all([
        draft.coverImage
          ? mediaService.upload({ file: draft.coverImage.file, userId, folder: 'library/covers' })
          : Promise.resolve(null),
        draft.backCoverImage
          ? mediaService.upload({ file: draft.backCoverImage.file, userId, folder: 'library/covers' })
          : Promise.resolve(null),
      ]);
      await libraryService.importBook({
        title: draft.title,
        subtitle: draft.subtitle,
        author: draft.author,
        language: draft.language,
        description: draft.description,
        cover_url: coverUpload?.asset.url,
        back_cover_url: backCoverUpload?.asset.url,
        isbn: draft.isbn,
        year: draft.year,
        category_ids: [],
        tags: ['epub-import'],
        is_published: false,
        spoiler_mode: 'open',
        required_roles: [],
        age_rating: 'L',
        created_by: userId,
        chapters: draft.chapters,
        chapterConcurrency: 4,
        onProgress: ({ saved, total }) => setImportProgress({ saved, total }),
      });
      await onImported();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <FileUp className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg flex-1">Importar EPUB</h3>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose} aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Arquivo .epub</span>
            <input
              type="file"
              className="file-input file-input-bordered file-input-sm w-full"
              accept=".epub,application/epub+zip"
              disabled={parsing || saving}
              onChange={event => parseSelectedFile(event.target.files?.[0] ?? null)}
            />
          </label>

          {parsing && (
            <div className="alert alert-info text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Lendo metadados, spine e capítulos...</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {saving && importProgress && (
            <div className="space-y-2">
              <progress
                className="progress progress-primary w-full"
                value={importProgress.saved}
                max={importProgress.total}
              />
              <p className="text-xs text-base-content/60">
                Salvando capítulos {importProgress.saved}/{importProgress.total} em lotes pequenos...
              </p>
            </div>
          )}

          {draft && (
            <div className="border border-base-300 rounded-lg p-3 space-y-3">
              <div>
                <h4 className="font-semibold text-base">{draft.title}</h4>
                <p className="text-xs text-base-content/60">
                  {[draft.author, draft.language?.toUpperCase(), draft.year].filter(Boolean).join(' · ')}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-base-200 rounded-lg p-2">
                  <div className="text-lg font-bold">{draft.chapters.length}</div>
                  <div className="text-[11px] text-base-content/60">capítulos</div>
                </div>
                <div className="bg-base-200 rounded-lg p-2">
                  <div className="text-lg font-bold">{numberedBlocks}</div>
                  <div className="text-[11px] text-base-content/60">parágrafos</div>
                </div>
                <div className="bg-base-200 rounded-lg p-2">
                <div className="text-lg font-bold">{draft.warnings.length}</div>
                  <div className="text-[11px] text-base-content/60">avisos</div>
                </div>
              </div>

              {(draft.coverImage || draft.backCoverImage) && (
                <div className="flex gap-2 flex-wrap">
                  {draft.coverImage && (
                    <span className="badge badge-success badge-sm">
                      capa detectada
                    </span>
                  )}
                  {draft.backCoverImage && (
                    <span className="badge badge-success badge-sm">
                      contracapa detectada
                    </span>
                  )}
                </div>
              )}

              <div className="max-h-48 overflow-y-auto border border-base-300 rounded-lg">
                <table className="table table-xs">
                  <tbody>
                    {draft.chapters.map(chapter => (
                      <tr key={`${chapter.order}-${chapter.title}`}>
                        <td className="w-12 text-base-content/50">{chapter.order}</td>
                        <td className="font-medium">{chapter.title}</td>
                        <td className="text-right text-base-content/50">{chapter.blocks.length} blocos</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {draft.warnings.length > 0 && (
                <div className="alert alert-warning text-xs items-start">
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  <ul className="list-disc list-inside">
                    {draft.warnings.slice(0, 4).map(warning => <li key={warning}>{warning}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="modal-action">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={saving}>Cancelar</button>
            <button
              type="button"
              className="btn btn-primary btn-sm gap-1"
              onClick={importDraft}
              disabled={!draft || saving || parsing}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {saving ? 'Importando...' : 'Importar como rascunho'}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={saving ? undefined : onClose} />
    </div>
  );
}
