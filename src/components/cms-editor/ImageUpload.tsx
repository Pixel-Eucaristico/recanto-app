'use client';

import React, { useState, useEffect } from 'react';
import { Upload, X, ImageIcon, Loader2, Calendar, CloudOff, Trash2, Link as LinkIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  mode?: 'standard' | 'dated';
  customFileName?: string;
}

export default function ImageUpload({ 
  value = '', 
  onChange, 
  folder = 'cms', 
  label = 'Imagem',
  mode = 'standard',
  customFileName
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  const envPublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
  const publicUrlBase = envPublicUrl.endsWith('/') ? envPublicUrl.slice(0, -1) : envPublicUrl;
  const isR2Image = value.startsWith(publicUrlBase) && publicUrlBase !== '';

  useEffect(() => {
    async function checkApi() {
      try {
        const response = await fetch('/api/upload/r2');
        const data = await response.json();
        if (response.ok && data.status === 'ok') {
          setApiStatus('ok');
        } else {
          setApiStatus('error');
        }
      } catch (err) {
        setApiStatus('error');
      }
    }
    checkApi();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      
      const targetFolder = mode === 'dated' 
        ? `${folder}/${new Date().getFullYear()}/${new Date().getMonth() + 1}`
        : folder;
        
      formData.append('folder', targetFolder);
      if (customFileName) formData.append('fileName', customFileName);

      const response = await fetch('/api/upload/r2', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha no upload');
      }

      const { url } = await response.json();
      onChange(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente se necessário
      e.target.value = '';
    }
  };

  const handleDeleteR2Image = async () => {
    if (!confirm('Deseja excluir definitivamente esta imagem da nuvem?')) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/upload/r2?url=${encodeURIComponent(value)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Falha ao excluir imagem do servidor');

      onChange('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleExternalUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="form-control w-full space-y-2 p-4 bg-base-200/50 rounded-2xl border border-base-300">
      <div className="flex items-center justify-between mb-1">
        <label className="label-text font-bold flex items-center gap-2">
          {mode === 'dated' ? <Calendar className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          {label}
        </label>
        {isR2Image && (
          <span className="badge badge-primary badge-sm gap-1 animate-pulse">
            <Upload className="w-3 h-3" /> Cloud
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* URL Input */}
        <div className="join w-full">
          <div className="join-item bg-base-100 flex items-center px-4 border border-base-300">
            <LinkIcon className="w-4 h-4 opacity-40" />
          </div>
          <input 
            type="text"
            className="input input-bordered join-item flex-1 focus:outline-none text-sm"
            placeholder="URL da imagem..."
            value={value}
            onChange={handleExternalUrlChange}
          />
          {value && (
            <button 
              onClick={() => onChange('')}
              className="btn btn-ghost join-item border-base-300 px-3"
            >
              <X className="w-4 h-4 text-error" />
            </button>
          )}
        </div>

        {/* DaisyUI File Input - THE COMPONENT YOU REQUESTED */}
        <div className="flex flex-col gap-2">
          <input 
            type="file" 
            className={`file-input file-input-bordered file-input-primary w-full ${uploading ? 'file-input-error' : ''}`}
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          
          {uploading && (
            <div className="flex items-center justify-center gap-2 py-1.5 bg-primary/5 rounded-lg text-primary text-xs font-semibold">
              <span className="loading loading-spinner loading-xs"></span>
              Enviando...
            </div>
          )}
        </div>

        {/* Warning if R2 is not configured */}
        {apiStatus === 'error' && !uploading && (
          <div className="alert alert-warning py-1 text-[10px]">
            <AlertTriangle className="w-3 h-3" />
            <span>Servidor instável.</span>
          </div>
        )}

        {/* Image Preview - More Compact */}
        {value && (
          <div className="relative mt-1 rounded-lg border border-base-300 bg-black/10 overflow-hidden flex items-center justify-center h-32 md:h-40">
            <img 
              src={value} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain"
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Erro+no+link')}
            />
            {isR2Image && (
              <button 
                onClick={handleDeleteR2Image}
                disabled={deleting}
                className="absolute top-2 right-2 btn btn-circle btn-error btn-sm shadow-lg"
                title="Excluir da Nuvem"
              >
                {deleting ? <span className="loading loading-spinner loading-xs"></span> : <Trash2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="alert alert-error py-2 text-xs">
             <AlertTriangle className="w-4 h-4 shrink-0" /> 
             <span className="font-bold break-all">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertTriangle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
