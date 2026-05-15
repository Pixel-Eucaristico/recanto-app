'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Search, Upload, Link2, X, Plug, Check, Lock, Globe, Eye, Loader2, RefreshCw,
} from 'lucide-react';

interface YouTubeVideoSummary {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  durationSeconds: number;
  privacyStatus: string;
  url: string;
  embedUrl: string;
}

type Tab = 'pick' | 'upload';

interface VideoPickerModalProps {
  onClose: () => void;
  onPick: (video: { url: string; durationSeconds: number; title: string }) => void;
}

export function VideoPickerModal({ onClose, onPick }: VideoPickerModalProps) {
  const [tab, setTab] = useState<Tab>('pick');
  const [connected, setConnected] = useState<boolean | null>(null);
  const [videos, setVideos] = useState<YouTubeVideoSummary[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/youtube/status')
      .then(r => r.ok ? r.json() : { connected: false })
      .then(d => {
        setConnected(!!d.connected);
        if (d.connected) loadVideos();
      })
      .catch(() => setConnected(false));
  }, []);

  async function loadVideos() {
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch('/api/youtube/videos?max=50');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Falha ao listar vídeos');
      setVideos(data.videos ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingList(false);
    }
  }

  function connect() {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/api/youtube/auth?return_to=${returnTo}`;
  }

  async function disconnect() {
    await fetch('/api/youtube/disconnect', { method: 'POST' });
    setConnected(false);
    setVideos([]);
  }

  const filtered = videos.filter(v => {
    if (!search.trim()) return true;
    return v.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base">Escolher vídeo do YouTube</h3>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Connection state */}
        {connected === false && (
          <div className="alert alert-info text-sm gap-2 mb-3">
            <Plug className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">YouTube não conectado.</p>
              <p className="text-xs mt-1">Conecte sua conta para listar/enviar vídeos.</p>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={connect}>
              Conectar
            </button>
          </div>
        )}
        {connected && (
          <div className="text-xs text-base-content/60 mb-2 flex items-center gap-2">
            <Check className="w-3 h-3 text-success" /> Conectado
            <button type="button" className="link link-hover" onClick={disconnect}>Desconectar</button>
          </div>
        )}

        {/* Tabs */}
        {connected && (
          <div role="tablist" className="tabs tabs-boxed bg-base-200 w-fit mb-3">
            <button
              type="button"
              role="tab"
              className={`tab gap-1 ${tab === 'pick' ? 'tab-active' : ''}`}
              onClick={() => setTab('pick')}
            >
              <Link2 className="w-4 h-4" /> Meus vídeos
            </button>
            <button
              type="button"
              role="tab"
              className={`tab gap-1 ${tab === 'upload' ? 'tab-active' : ''}`}
              onClick={() => setTab('upload')}
            >
              <Upload className="w-4 h-4" /> Enviar novo
            </button>
          </div>
        )}

        {error && <div className="alert alert-error text-sm mb-2"><span>{error}</span></div>}

        <div className="flex-1 overflow-y-auto min-h-0">
          {connected && tab === 'pick' && (
            <PickTab
              videos={filtered}
              loading={loadingList}
              search={search}
              onSearch={setSearch}
              onReload={loadVideos}
              onPick={v => {
                onPick({ url: v.url, durationSeconds: v.durationSeconds, title: v.title });
                onClose();
              }}
            />
          )}
          {connected && tab === 'upload' && (
            <UploadTab
              onUploaded={v => {
                onPick({ url: v.url, durationSeconds: v.durationSeconds, title: v.title });
                onClose();
              }}
            />
          )}
        </div>

        <div className="modal-action mt-3">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

// ─── Pick Tab ──────────────────────────────────────────────────────────────

function PickTab({ videos, loading, search, onSearch, onReload, onPick }: {
  videos: YouTubeVideoSummary[];
  loading: boolean;
  search: string;
  onSearch: (s: string) => void;
  onReload: () => void;
  onPick: (v: YouTubeVideoSummary) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            className="input input-bordered input-sm w-full pl-9"
            placeholder="Buscar por título..."
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onReload} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="text-center py-8 text-sm text-base-content/60">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Carregando vídeos...
        </div>
      )}

      {!loading && videos.length === 0 && (
        <div className="text-center py-8 text-sm text-base-content/60">
          Nenhum vídeo público ou não listado encontrado.
          <p className="text-xs mt-2">Vídeos privados não aparecem — não podem ser embedados nas aulas.</p>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {videos.map(v => (
            <li key={v.id}>
              <button
                type="button"
                className="card bg-base-100 border border-base-300 hover:border-primary text-left w-full overflow-hidden"
                onClick={() => onPick(v)}
              >
                <div className="flex gap-2 p-2">
                  {v.thumbnail && (
                    <div className="relative w-32 h-20 shrink-0 rounded overflow-hidden bg-base-200">
                      <Image src={v.thumbnail} alt={v.title} fill className="object-cover" sizes="128px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-2">{v.title}</p>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <PrivacyBadge status={v.privacyStatus} />
                      {v.durationSeconds > 0 && (
                        <span className="badge badge-outline badge-xs">
                          {formatDuration(v.durationSeconds)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PrivacyBadge({ status }: { status: string }) {
  if (status === 'public') return <span className="badge badge-success badge-xs gap-0.5"><Globe className="w-2.5 h-2.5" />público</span>;
  if (status === 'unlisted') return <span className="badge badge-info badge-xs gap-0.5"><Eye className="w-2.5 h-2.5" />não listado</span>;
  return <span className="badge badge-warning badge-xs gap-0.5"><Lock className="w-2.5 h-2.5" />privado</span>;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Upload helpers ────────────────────────────────────────────────────────

/**
 * PUT direto pro YouTube com progress via XHR.
 * NOTA: YouTube resumable session URL pode não retornar CORS headers no response,
 * causando `onerror` mesmo após bytes chegarem com sucesso.
 * Solução: se progress chegou a 100%, retorna sucesso "vazio" (sem id) e caller
 * faz polling pra recuperar o vídeo via API.
 */
function uploadFileWithProgress(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<{ id: string; snippet?: { title?: string }; contentDetails?: { duration?: string } }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let bytesUploaded = 0;
    let uploadComplete = false;

    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        bytesUploaded = e.loaded;
        if (e.loaded >= e.total) uploadComplete = true;
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.upload.onload = () => {
      // Bytes terminaram de subir mesmo se response der erro
      uploadComplete = true;
    };

    xhr.onloadend = () => {
      console.log('[XHR] readyState:', xhr.readyState, 'status:', xhr.status, 'responseText length:', xhr.responseText?.length ?? 0);

      // Status 0 = CORS bloqueou response, mas bytes podem ter chegado
      if (xhr.status === 0) {
        if (uploadComplete) {
          console.warn('[XHR] CORS bloqueou response, mas upload completou. Caller faz polling.');
          resolve({ id: '' });
          return;
        }
        reject(new Error('Falha de rede antes do upload completar.'));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        const text = xhr.responseText?.trim() ?? '';
        if (!text) {
          resolve({ id: '' });
          return;
        }
        try {
          resolve(JSON.parse(text));
        } catch {
          resolve({ id: '' });
        }
      } else {
        reject(new Error(`Upload falhou ${xhr.status}: ${xhr.responseText || '(sem body)'}`));
      }
    };

    xhr.onerror = () => {
      console.warn('[XHR] onerror disparou. uploadComplete:', uploadComplete, 'bytesUploaded:', bytesUploaded);
      // CORS típico: onerror dispara mas bytes chegaram. Trata como possível sucesso.
      if (uploadComplete) {
        resolve({ id: '' });
        return;
      }
      reject(new Error('Erro de rede antes do upload completar.'));
    };

    xhr.send(file);
  });
}

function parseDurationFromYouTubeMeta(data: { contentDetails?: { duration?: string } }): number {
  const iso = data.contentDetails?.duration;
  if (!iso) return 0;
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

// ─── Upload Tab ────────────────────────────────────────────────────────────

function UploadTab({ onUploaded }: {
  onUploaded: (v: { url: string; durationSeconds: number; title: string }) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ url: string; durationSeconds: number; title: string } | null>(null);

  async function handleUpload() {
    if (!file) { setError('Selecione um arquivo de vídeo.'); return; }
    if (!title.trim()) { setError('Título obrigatório.'); return; }
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      console.log('[Upload] iniciando, file:', file.name, file.size, file.type);

      // 1. Pega URL de sessão resumível no nosso server
      const sessionRes = await fetch('/api/youtube/upload-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          fileSize: file.size,
          mimeType: file.type,
        }),
      });
      const sessionData = await sessionRes.json();
      console.log('[Upload] session response:', sessionData);
      if (!sessionRes.ok) throw new Error(sessionData.error ?? 'Falha ao iniciar upload');

      const uploadUrl = sessionData.uploadUrl as string;
      console.log('[Upload] PUT to:', uploadUrl);

      // 2. Upload direto pro YouTube via XHR (com progress)
      const videoData = await uploadFileWithProgress(uploadUrl, file, setProgress);
      console.log('[Upload] videoData received:', videoData);

      // 3. Se YouTube respondeu com id, usa direto
      if (videoData.id) {
        const result = {
          url: `https://www.youtube.com/watch?v=${videoData.id}`,
          durationSeconds: parseDurationFromYouTubeMeta(videoData),
          title: videoData.snippet?.title ?? title,
        };
        console.log('[Upload] sucesso (resposta direta):', result);
        setSuccess(result);
        return;
      }

      // 4. Fallback: poll a lista do YouTube — vídeo recém-enviado pode demorar até ~15s pra aparecer
      console.warn('[Upload] sem id na resposta, polling /api/youtube/videos...');
      setPolling(true);
      const expectedTitle = title.trim();
      let recovered: { id: string; title: string; url: string; durationSeconds: number } | null = null;

      for (let attempt = 0; attempt < 8; attempt++) {
        await new Promise(r => setTimeout(r, 2000)); // 2s entre tentativas
        try {
          const listRes = await fetch('/api/youtube/videos?max=10');
          const listData = await listRes.json();
          const match = (listData.videos ?? []).find((v: { title: string; id: string }) => v.title === expectedTitle)
            ?? listData.videos?.[0];
          if (match?.id) {
            recovered = match;
            console.log(`[Upload] recovered after ${attempt + 1} attempts:`, match);
            break;
          }
        } catch (err) {
          console.warn('[Upload] poll attempt failed:', err);
        }
      }
      setPolling(false);

      if (recovered) {
        setSuccess({
          url: recovered.url,
          durationSeconds: recovered.durationSeconds,
          title: recovered.title,
        });
        return;
      }

      throw new Error('Upload completou mas YouTube ainda não disponibilizou o vídeo. Aguarde 1 min e use "Meus vídeos" pra escolher.');
    } catch (e) {
      console.error('[Upload] erro:', e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-3">
        <div className="alert alert-success text-sm">
          <Check className="w-4 h-4" />
          <div className="flex-1">
            <p className="font-semibold">Upload concluído!</p>
            <p className="text-xs mt-1">{success.title}</p>
            <p className="text-[10px] text-base-content/60 mt-0.5 break-all">{success.url}</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm w-full"
          onClick={() => onUploaded(success)}
        >
          Usar este vídeo na aula
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      <div className="flex flex-col gap-1.5">
        <span className="label-text text-xs font-medium">Arquivo de vídeo *</span>
        <input
          type="file"
          accept="video/*"
          className="file-input file-input-bordered file-input-sm w-full"
          onChange={e => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ''));
          }}
          disabled={uploading}
        />
        {file && (
          <p className="text-[10px] text-base-content/60">
            {file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="label-text text-xs font-medium">Título *</span>
        <input
          className="input input-bordered input-sm w-full"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título do vídeo no YouTube"
          disabled={uploading}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="label-text text-xs font-medium">Descrição</span>
        <textarea
          className="textarea textarea-bordered textarea-sm"
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={uploading}
        />
      </div>

      <p className="text-xs text-base-content/60 flex items-center gap-1">
        <Eye className="w-3 h-3" /> Privacidade: <strong>Não listado</strong> — só quem tem o link assiste.
      </p>

      <button
        type="button"
        className="btn btn-primary btn-sm gap-1 w-full"
        onClick={handleUpload}
        disabled={uploading || !file || !title.trim()}
      >
        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando {progress}%</> : <><Upload className="w-4 h-4" />Enviar para YouTube</>}
      </button>

      {uploading && !polling && (
        <>
          <progress className="progress progress-primary w-full" value={progress} max={100} />
          <p className="text-xs text-base-content/60 text-center">
            Upload direto pro YouTube ({progress}%). Não feche a janela.
          </p>
        </>
      )}

      {polling && (
        <div className="alert alert-info text-sm gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Aguardando YouTube processar... isso pode levar até ~20s.</span>
        </div>
      )}
    </div>
  );
}
