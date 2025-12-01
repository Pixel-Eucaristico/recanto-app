'use client';

import { useState } from 'react';
import { Plus, X, MoveUp, MoveDown } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  image: string;
  category: string;
  link?: string;
}

interface ProjectsShowcaseEditorProps {
  value: any;
  onChange: (value: any) => void;
}

export function ProjectsShowcaseEditor({ value, onChange }: ProjectsShowcaseEditorProps) {
  // Parse projects from JSON string
  let initialProjects: Project[] = [];
  if (value.projects && typeof value.projects === 'string') {
    try {
      initialProjects = JSON.parse(value.projects);
    } catch (error) {
      console.error('Failed to parse projects:', error);
    }
  }

  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const handleProjectsChange = (newProjects: Project[]) => {
    setProjects(newProjects);
    // Converte para JSON string ao salvar
    onChange({ ...value, projects: JSON.stringify(newProjects) });
  };

  const addProject = () => {
    const newProjects = [
      ...projects,
      { title: '', description: '', image: '', category: 'formacao', link: '' },
    ];
    handleProjectsChange(newProjects);
  };

  const removeProject = (index: number) => {
    const newProjects = projects.filter((_, i) => i !== index);
    handleProjectsChange(newProjects);
  };

  const updateProject = (index: number, field: keyof Project, newValue: string) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], [field]: newValue };
    handleProjectsChange(newProjects);
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === projects.length - 1)
    ) {
      return;
    }

    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newProjects[index], newProjects[targetIndex]] = [
      newProjects[targetIndex],
      newProjects[index],
    ];
    handleProjectsChange(newProjects);
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <label className="label">
          <span className="label-text font-semibold">Título da Seção</span>
        </label>
        <input
          type="text"
          value={value.title || ''}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          className="input input-bordered w-full"
          placeholder="Ex: Nossos Projetos"
        />
      </div>

      {/* Subtítulo */}
      <div>
        <label className="label">
          <span className="label-text font-semibold">Subtítulo</span>
        </label>
        <textarea
          value={value.subtitle || ''}
          onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
          className="textarea textarea-bordered w-full"
          rows={2}
          placeholder="Ex: Conheça as iniciativas que transformam vidas e fortalecem nossa comunidade"
        />
      </div>

      {/* Editor de Projetos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="label">
            <span className="label-text font-semibold">Projetos</span>
          </label>
          <button
            type="button"
            onClick={addProject}
            className="btn btn-sm btn-primary gap-2"
          >
            <Plus size={16} />
            Adicionar Projeto
          </button>
        </div>

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="alert alert-info">
              <span>Nenhum projeto adicionado. Clique em "Adicionar Projeto" para começar.</span>
            </div>
          ) : (
            projects.map((project, index) => (
              <div key={index} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Projeto {index + 1}</h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveProject(index, 'up')}
                        disabled={index === 0}
                        className="btn btn-xs btn-ghost"
                        title="Mover para cima"
                      >
                        <MoveUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveProject(index, 'down')}
                        disabled={index === projects.length - 1}
                        className="btn btn-xs btn-ghost"
                        title="Mover para baixo"
                      >
                        <MoveDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="btn btn-xs btn-error"
                        title="Remover projeto"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Título do Projeto */}
                    <div>
                      <label className="label">
                        <span className="label-text">Título</span>
                      </label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => updateProject(index, 'title', e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Ex: Retiros Espirituais"
                      />
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="label">
                        <span className="label-text">Descrição</span>
                      </label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                        className="textarea textarea-bordered w-full"
                        rows={3}
                        placeholder="Ex: Retiros de fim de semana para crianças, jovens e famílias..."
                      />
                    </div>

                    {/* Categoria */}
                    <div>
                      <label className="label">
                        <span className="label-text">Categoria</span>
                      </label>
                      <select
                        value={project.category}
                        onChange={(e) => updateProject(index, 'category', e.target.value)}
                        className="select select-bordered w-full"
                      >
                        <option value="formacao">Formação</option>
                        <option value="evangelizacao">Evangelização</option>
                        <option value="retiro">Retiro</option>
                        <option value="social">Social</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>

                    {/* URL da Imagem */}
                    <div>
                      <label className="label">
                        <span className="label-text">URL da Imagem</span>
                      </label>
                      <input
                        type="url"
                        value={project.image}
                        onChange={(e) => updateProject(index, 'image', e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="https://images.unsplash.com/..."
                      />
                      {project.image && (
                        <div className="mt-2">
                          <img
                            src={project.image}
                            alt="Preview"
                            className="w-full max-w-xs rounded-lg shadow-md"
                          />
                        </div>
                      )}
                    </div>

                    {/* Link (opcional) */}
                    <div>
                      <label className="label">
                        <span className="label-text">Link "Saiba Mais" (opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={project.link || ''}
                        onChange={(e) => updateProject(index, 'link', e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="/sobre ou https://..."
                      />
                      <label className="label">
                        <span className="label-text-alt text-base-content/60">
                          Se deixar vazio, o botão "Saiba Mais" não aparecerá
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
