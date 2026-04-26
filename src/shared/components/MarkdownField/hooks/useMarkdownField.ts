'use client';

import { useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/domain/media/types';
import { mediaService } from '@/application/media/MediaService';
import { type MediaKind, detectColorMode } from '../utils/markdownFieldUtils';

export function useMarkdownField(value: string, onChange: (v: string) => void, uploadFolder: string) {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [mediaKind, setMediaKind] = useState<MediaKind>('image');
  const [gallery, setGallery] = useState<MediaAsset[]>([]);
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryLoading, setGalleryLoading] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const update = () => {
      const mode = detectColorMode();
      setColorMode(mode);
      document.documentElement.setAttribute('data-color-mode', mode);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!uploadOpen) return;
    setGalleryLoading(true);
    mediaService.listRecent(24).then(setGallery).catch(() => {}).finally(() => setGalleryLoading(false));
  }, [uploadOpen]);

  async function runSearch(query: string) {
    setGallerySearch(query);
    setGalleryLoading(true);
    try {
      const list = query.trim() ? await mediaService.search(query) : await mediaService.listRecent(24);
      setGallery(list);
    } finally {
      setGalleryLoading(false);
    }
  }

  function handleGallerySelect(asset: MediaAsset) {
    setPendingUrl(asset.url);
    if (asset.name && !altText) setAltText(asset.name.replace(/\.[^.]+$/, ''));
    if (asset.kind === 'video') setMediaKind('video');
    else if (asset.kind === 'audio') setMediaKind('audio');
  }

  function handleUploaded(asset: MediaAsset) {
    setPendingUrl(asset.url);
    if (asset.name && !altText) setAltText(asset.name.replace(/\.[^.]+$/, ''));
  }

  function closeModal() {
    setUploadOpen(false);
    setPendingUrl('');
    setAltText('');
    setGallerySearch('');
  }

  return {
    colorMode,
    uploadOpen, setUploadOpen,
    pendingUrl, setPendingUrl,
    altText, setAltText,
    mediaKind, setMediaKind,
    gallery,
    gallerySearch,
    galleryLoading,
    valueRef,
    runSearch,
    handleGallerySelect,
    handleUploaded,
    closeModal,
  };
}
