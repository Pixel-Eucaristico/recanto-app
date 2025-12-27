'use client';

import { Hover3DCard, Hover3DImageCard } from '@/components/ui';
import { Heart, BookOpen, Calendar, Users } from 'lucide-react';

export default function ExamplesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-base-content">
          Exemplos de Componentes 3D
        </h1>
        <p className="text-base-content/60 mt-2">
          Demonstração dos cards com efeito hover 3D
        </p>
      </header>

      {/* Cards com links */}
      <section>
        <h2 className="text-2xl font-semibold text-base-content mb-4">
          Cards Clicáveis
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Hover3DCard as="a" href="/app/dashboard/formation">
            <div className="card bg-primary text-primary-content shadow-xl">
              <div className="card-body items-center text-center">
                <BookOpen className="w-12 h-12" />
                <h3 className="card-title">Formação</h3>
                <p>Materiais e recursos</p>
              </div>
            </div>
          </Hover3DCard>

          <Hover3DCard as="a" href="/app/dashboard/schedule">
            <div className="card bg-secondary text-secondary-content shadow-xl">
              <div className="card-body items-center text-center">
                <Calendar className="w-12 h-12" />
                <h3 className="card-title">Agenda</h3>
                <p>Eventos e encontros</p>
              </div>
            </div>
          </Hover3DCard>

          <Hover3DCard as="a" href="/app/dashboard/forum">
            <div className="card bg-accent text-accent-content shadow-xl">
              <div className="card-body items-center text-center">
                <Users className="w-12 h-12" />
                <h3 className="card-title">Fórum</h3>
                <p>Comunidade e discussões</p>
              </div>
            </div>
          </Hover3DCard>

          <Hover3DCard as="a" href="/app/dashboard/donate">
            <div className="card bg-info text-info-content shadow-xl">
              <div className="card-body items-center text-center">
                <Heart className="w-12 h-12" />
                <h3 className="card-title">Doações</h3>
                <p>Contribua com amor</p>
              </div>
            </div>
          </Hover3DCard>
        </div>
      </section>

      {/* Cards informativos */}
      <section>
        <h2 className="text-2xl font-semibold text-base-content mb-4">
          Cards Informativos
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Hover3DCard>
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-base-content">Estatísticas</h3>
                <div className="stats stats-vertical shadow">
                  <div className="stat">
                    <div className="stat-title">Membros</div>
                    <div className="stat-value text-primary">250+</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Eventos</div>
                    <div className="stat-value text-secondary">48</div>
                  </div>
                </div>
              </div>
            </div>
          </Hover3DCard>

          <Hover3DCard>
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-base-content">Reflexão do Dia</h3>
                <p className="text-base-content/60 italic">
                  "Tende compaixão uns dos outros, assim como eu tive compaixão de vós."
                </p>
                <p className="text-base-content/40 text-sm">— Mateus 18:33</p>
              </div>
            </div>
          </Hover3DCard>

          <Hover3DCard>
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-base-content">Próximo Evento</h3>
                <div className="space-y-2">
                  <div className="badge badge-primary">Formação</div>
                  <p className="text-base-content/80 font-medium">
                    Encontro de Missionários
                  </p>
                  <p className="text-base-content/60 text-sm">
                    Sábado, 15:00h
                  </p>
                </div>
              </div>
            </div>
          </Hover3DCard>
        </div>
      </section>

      {/* Galeria de imagens com efeito 3D */}
      <section>
        <h2 className="text-2xl font-semibold text-base-content mb-4">
          Galeria com Efeito 3D
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Hover3DImageCard
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&h=300&fit=crop"
            alt="Exemplo 1"
            className="aspect-square"
          />
          <Hover3DImageCard
            src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop"
            alt="Exemplo 2"
            className="aspect-square"
          />
          <Hover3DImageCard
            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop"
            alt="Exemplo 3"
            className="aspect-square"
          />
          <Hover3DImageCard
            src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop"
            alt="Exemplo 4"
            className="aspect-square"
          />
        </div>
      </section>

      {/* Nota sobre responsividade */}
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">Dica sobre o efeito 3D</h3>
          <div className="text-sm">
            Passe o mouse sobre os cards para ver o efeito de inclinação 3D.
            O efeito detecta a posição do cursor e cria uma perspectiva interativa.
          </div>
        </div>
      </div>
    </div>
  );
}
