import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WritingCard } from '@/features/formator-writings/components/WritingCard/WritingCard';
import type { StudentWriting } from '@/domain/formation/writings';

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

function build(overrides: Partial<StudentWriting> = {}): StudentWriting {
  return {
    key: 'reflection:r1',
    doc_id: 'r1',
    kind: 'reflection',
    student_id: 'aluno1',
    student_name: 'Aluno Um',
    track_id: 't-a',
    track_title: 'Trilha A',
    lesson_id: 'l1',
    lesson_title: 'Aula 1',
    module_title: 'Módulo 1',
    content: 'Reflexão curta.',
    status: 'submitted',
    created_at: '2026-01-10T10:00:00.000Z',
    version_count: 0,
    href: '/app/dashboard/formation/t-a/l1',
    ...overrides,
  };
}

function renderCard(writing: StudentWriting, props: Partial<Parameters<typeof WritingCard>[0]> = {}) {
  const onOpenHistory = jest.fn();
  const onReview = jest.fn();
  render(
    <WritingCard writing={writing} onOpenHistory={onOpenHistory} onReview={onReview} {...props} />,
  );
  return { onOpenHistory, onReview };
}

describe('WritingCard', () => {
  it('mostra aluno, contexto e conteúdo', () => {
    renderCard(build());
    expect(screen.getByText('Aluno Um')).toBeInTheDocument();
    expect(screen.getByText(/Trilha A/)).toBeInTheDocument();
    expect(screen.getByText(/Aula 1/)).toBeInTheDocument();
    expect(screen.getByText('Reflexão curta.')).toBeInTheDocument();
  });

  it('esconde o nome quando a lista já é de um aluno só', () => {
    renderCard(build(), { hideStudent: true });
    expect(screen.queryByText('Aluno Um')).not.toBeInTheDocument();
  });

  it('oferece Revisar só para reflexão aguardando revisão', () => {
    const { onReview } = renderCard(build({ status: 'submitted' }));
    expect(screen.getByRole('button', { name: /Revisar/i })).toBeInTheDocument();
    expect(onReview).not.toHaveBeenCalled();
  });

  it('não oferece Revisar para reflexão já revisada', () => {
    renderCard(build({ status: 'reviewed', review_notes: 'Muito bom.' }));
    expect(screen.queryByRole('button', { name: /Revisar/i })).not.toBeInTheDocument();
  });

  it('não oferece Revisar para post de fórum', () => {
    renderCard(build({ kind: 'forum_post', status: undefined }));
    expect(screen.queryByRole('button', { name: /Revisar/i })).not.toBeInTheDocument();
  });

  it('esconde Histórico quando o escrito nunca foi editado', () => {
    renderCard(build({ version_count: 0 }));
    expect(screen.queryByRole('button', { name: /Histórico/i })).not.toBeInTheDocument();
  });

  it('mostra Histórico com a contagem de edições', async () => {
    const { onOpenHistory } = renderCard(build({ version_count: 3 }));
    const botao = screen.getByRole('button', { name: /Histórico \(3\)/i });
    await userEvent.click(botao);
    expect(onOpenHistory).toHaveBeenCalledTimes(1);
  });

  it('exibe o comentário do formador quando existe', () => {
    renderCard(build({ status: 'reviewed', review_notes: 'Continue assim.' }));
    expect(screen.getByText('Comentário do formador')).toBeInTheDocument();
    expect(screen.getByText('Continue assim.')).toBeInTheDocument();
  });

  it('mostra badge de status legível em pt-BR', () => {
    renderCard(build({ status: 'submitted' }));
    expect(screen.getByText('Aguardando revisão')).toBeInTheDocument();
  });

  it('colapsa texto longo e expande no clique', async () => {
    const longo = 'palavra '.repeat(120); // ~960 chars
    renderCard(build({ content: longo }));

    const expandir = screen.getByRole('button', { name: /Ler tudo/i });
    expect(screen.getByText(/…$/)).toBeInTheDocument();

    await userEvent.click(expandir);
    expect(screen.getByRole('button', { name: /Mostrar menos/i })).toBeInTheDocument();
  });

  it('não colapsa texto curto', () => {
    renderCard(build({ content: 'curto' }));
    expect(screen.queryByRole('button', { name: /Ler tudo/i })).not.toBeInTheDocument();
  });

  it('linka pra aula quando há href', () => {
    renderCard(build());
    expect(screen.getByRole('link', { name: /Abrir aula/i }))
      .toHaveAttribute('href', '/app/dashboard/formation/t-a/l1');
  });

  it('omite o link quando não há aula associada', () => {
    renderCard(build({ href: undefined, lesson_id: null }));
    expect(screen.queryByRole('link', { name: /Abrir aula/i })).not.toBeInTheDocument();
  });

  it('nunca oferece Restaurar — formador não reverte texto de aluno', () => {
    renderCard(build({ version_count: 5 }));
    expect(screen.queryByRole('button', { name: /Restaurar/i })).not.toBeInTheDocument();
  });
});
