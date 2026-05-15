'use client';

import { useState } from 'react';
import { CalendarHeart } from 'lucide-react';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { userService } from '@/services/firebase/UserService';

const REMIND_LATER_KEY = 'birthdate_prompt_dismissed_until';
const REMIND_LATER_MS = 1000 * 60 * 60 * 24; // 24h

function isDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = sessionStorage.getItem(REMIND_LATER_KEY);
  if (!raw) return false;
  const until = parseInt(raw, 10);
  return Number.isFinite(until) && Date.now() < until;
}

export function BirthdatePrompt() {
  const { user } = useAuth();
  const [birthdate, setBirthdate] = useState('');
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(isDismissed());
  const [error, setError] = useState<string | null>(null);

  if (!user || user.birthdate || dismissed) return null;

  const handleSave = async () => {
    setError(null);
    if (!birthdate) {
      setError('Informe a data de nascimento.');
      return;
    }
    const parsed = Date.parse(birthdate);
    if (isNaN(parsed) || new Date(parsed) > new Date()) {
      setError('Data de nascimento inválida.');
      return;
    }
    setSaving(true);
    try {
      await userService.update(user.id, { birthdate });
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError('Não foi possível salvar. Tente novamente.');
      setSaving(false);
    }
  };

  const handleRemindLater = () => {
    sessionStorage.setItem(REMIND_LATER_KEY, String(Date.now() + REMIND_LATER_MS));
    setDismissed(true);
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box max-w-md">
        <div className="flex flex-col items-center gap-3 text-center">
          <CalendarHeart className="w-12 h-12 text-primary" />
          <h3 className="font-bold text-lg">Complete seu perfil</h3>
          <p className="text-base-content/80 text-sm">
            Pra liberar conteúdos com classificação indicativa, informe sua data de nascimento.
            Você pode alterar a qualquer momento no perfil.
          </p>
        </div>

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Data de nascimento</span>
          </label>
          <input
            type="date"
            className="input input-bordered"
            value={birthdate}
            onChange={e => setBirthdate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {error && <div className="alert alert-error mt-3 text-sm"><span>{error}</span></div>}

        <div className="modal-action justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleRemindLater} disabled={saving}>
            Lembrar depois
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
