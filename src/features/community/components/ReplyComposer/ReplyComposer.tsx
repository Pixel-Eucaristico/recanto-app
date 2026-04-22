'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { communityService } from '@/application/community/CommunityService';
import { CommunityReply } from '@/domain/community/types';
import { MarkdownField } from '@/shared/components/MarkdownField';

interface ReplyComposerProps {
  postId: string;
  userId: string;
  userName: string;
  parentReplyId?: string;
  disabled?: boolean;
  onReplied?: (reply: CommunityReply) => void;
  onCancel?: () => void;
}

export function ReplyComposer({ postId, userId, userName, parentReplyId, disabled, onReplied, onCancel }: ReplyComposerProps) {
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      const reply = await communityService.reply(postId, body, userId, userName, parentReplyId);
      setBody('');
      onReplied?.(reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <MarkdownField value={body} onChange={setBody} height={140} preview="edit" disabled={disabled || saving} />
      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
        )}
        <button
          className="btn btn-primary btn-sm gap-1"
          onClick={submit}
          disabled={disabled || saving || body.trim().length === 0}
        >
          <Send className="w-4 h-4" />
          {saving ? 'Enviando...' : 'Responder'}
        </button>
      </div>
    </div>
  );
}
