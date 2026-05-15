'use client';

import { useEffect, useState } from 'react';
import { Shield, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface HealthResponse {
  valid: boolean;
  error?: string;
  server?: Record<string, string>;
  client?: Record<string, string>;
}

export default function EnvStatusPage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/env/health');
      const body = await res.json();
      setData(body);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-base-content">Status das variáveis de ambiente</h1>
            <p className="text-base-content/60 text-sm">
              Valida via zod ({'@t3-oss/env-nextjs'}) — server-only nunca vaza pro client.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm gap-1" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </header>

      {fetchError && (
        <div className="alert alert-error">
          <XCircle className="w-5 h-5" />
          <span>Falha ao consultar /api/env/health: {fetchError}</span>
        </div>
      )}

      {data && !data.valid && (
        <div className="alert alert-error items-start">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Env inválido — app pode não subir em produção.</p>
            <pre className="text-xs whitespace-pre-wrap mt-2">{data.error}</pre>
          </div>
        </div>
      )}

      {data?.valid && (
        <div className="alert alert-success">
          <CheckCircle2 className="w-5 h-5" />
          <span>Todas as variáveis passaram na validação zod.</span>
        </div>
      )}

      {data?.server && (
        <section className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-base-content">Server</h2>
            <p className="text-xs text-base-content/60 mb-2">
              Valores sensíveis mascarados. Essas variáveis nunca vão pro bundle do client.
            </p>
            <EnvTable rows={data.server} />
          </div>
        </section>
      )}

      {data?.client && (
        <section className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-base-content">Client (NEXT_PUBLIC_*)</h2>
            <p className="text-xs text-base-content/60 mb-2">
              Essas variáveis são inlineadas no bundle do browser — nunca coloque segredos aqui.
            </p>
            <EnvTable rows={data.client} />
          </div>
        </section>
      )}
    </div>
  );
}

function EnvTable({ rows }: { rows: Record<string, string> }) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full table-fixed">
        <thead>
          <tr>
            <th className="text-left">Variável</th>
            <th className="text-right w-32">Status</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(rows).map(([key, value]) => {
            const notSet = value === '(não definido)' || value === '(vazio)';
            return (
              <tr key={key}>
                <td className="font-mono text-xs">{key}</td>
                <td className="text-right">
                  {notSet ? (
                    <span className="badge badge-warning badge-sm gap-1">
                      <XCircle className="w-3 h-3" /> vazio
                    </span>
                  ) : (
                    <span className="badge badge-success badge-sm gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ok
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
