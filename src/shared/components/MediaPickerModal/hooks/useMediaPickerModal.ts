'use client';

import { useEffect, useState } from 'react';
import type { MediaAsset } from '@/domain/media/types';
import { mediaService } from '@/application/media/MediaService';

type Tab = 'gallery' | 'upload' | 'url';

export function useMediaPickerModal(initialUrl: string, initialAlt: string, accept: 'image' | 'video' | 'audio' | 'all') {
  const [tab, setTab] = useState<Tab>('gallery');
  const [url, setUrl] = useState(initialUrl);
  const [alt, setAlt] = useState(initialAlt);
  const [gallery, setGallery] = useState<MediaAsset[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (tab !== 'gallery') return;
    setGalleryLoading(true);
    mediaService.listRecent(60)
      .then(list => setGallery(list.filter(a => accept === 'all' || a.kind === accept)))
      .catch(() => {})
      .finally(() => setGalleryLoading(false));
  }, [tab, accept]);

  async function runSearch(q: string) {
    setSearch(q);
    setGalleryLoading(true);
    try {
      const list = q.trim() ? await mediaService.search(q) : await mediaService.listRecent(60);
      setGallery(list.filter(a => accept === 'all' || a.kind === accept));
    } finally {
      setGalleryLoading(false);
    }
  }

  function pick(asset: MediaAsset) {
    setUrl(asset.url);
    if (asset.name && !alt) setAlt(asset.name.replace(/\.[^.]+$/, ''));
  }

  function refreshGallery() {
    mediaService.listRecent(60)
      .then(list => setGallery(list.filter(a => accept === 'all' || a.kind === accept)))
      .catch(() => {});
  }

  return {
    tab, setTab,
    url, setUrl,
    alt, setAlt,
    gallery, galleryLoading, search,
    runSearch, pick, refreshGallery,
  };
}
