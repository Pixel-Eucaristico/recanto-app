'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, X, Loader2, MessageCircle, ShieldCheck, GraduationCap, MessageSquare } from 'lucide-react';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { notificationService } from '@/application/notifications/NotificationService';
import type { Notification, NotificationKind } from '@/domain/notifications/types';

const KIND_ICON: Record<NotificationKind, React.ComponentType<{ className?: string }>> = {
  enrollment_request: ShieldCheck,
  enrollment_decision: ShieldCheck,
  lesson_completed: GraduationCap,
  forum_reply: MessageSquare,
  generic: MessageCircle,
};

export function NotificationBell() {
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter(n => !n.read).length;

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const list = await notificationService.list(user.id, 20);
      setItems(list);
    } catch {/* ignora */} finally {
      setLoading(false);
    }
  }

  // Carrega ao abrir + polling leve a cada 60s pra unread badge
  useEffect(() => {
    if (!user) return;
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [user?.id]);

  // Click fora fecha
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  async function handleClickItem(n: Notification) {
    if (!n.read) {
      await notificationService.markRead(n.id);
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    }
    setOpen(false);
  }

  async function handleMarkAllRead() {
    if (!user) return;
    await notificationService.markAllRead(user.id);
    setItems(prev => prev.map(x => ({ ...x, read: true })));
  }

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-circle relative"
        onClick={() => setOpen(o => !o)}
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="badge badge-primary badge-xs absolute -top-1 -right-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-y-auto card bg-base-100 border border-base-300 shadow-xl z-50">
          <div className="card-body p-2 gap-1">
            <div className="flex items-center justify-between p-1">
              <h3 className="font-semibold text-sm">Notificações</h3>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs gap-1"
                    onClick={handleMarkAllRead}
                  >
                    <Check className="w-3 h-3" /> Marcar todas
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {loading && items.length === 0 && (
              <div className="flex items-center gap-2 p-3 text-sm text-base-content/60">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
              </div>
            )}

            {!loading && items.length === 0 && (
              <p className="text-sm text-base-content/60 text-center p-4">
                Sem notificações.
              </p>
            )}

            <ul className="space-y-1">
              {items.map(n => {
                const Icon = KIND_ICON[n.kind] ?? MessageCircle;
                const inner = (
                  <div className={`card border ${n.read ? 'border-base-300 bg-base-100' : 'border-primary/40 bg-primary/5'}`}>
                    <div className="card-body p-2 flex-row items-start gap-2">
                      <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${!n.read ? 'text-primary' : ''}`}>{n.title}</p>
                        {n.body && <p className="text-[11px] text-base-content/70 line-clamp-2 mt-0.5">{n.body}</p>}
                        <p className="text-[10px] text-base-content/40 mt-0.5">{formatRelative(n.created_at)}</p>
                      </div>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link href={n.link} onClick={() => handleClickItem(n)} className="block">
                        {inner}
                      </Link>
                    ) : (
                      <button type="button" onClick={() => handleClickItem(n)} className="block w-full text-left">
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) {
    const hours = Math.floor(ms / 3600000);
    if (hours === 0) {
      const mins = Math.floor(ms / 60000);
      return mins <= 1 ? 'agora' : `${mins} min atrás`;
    }
    return `${hours}h atrás`;
  }
  if (days === 1) return 'ontem';
  if (days < 7) return `${days}d atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
