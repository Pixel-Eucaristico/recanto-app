import { render, screen } from '@testing-library/react';
import { TextDiff } from '@/features/formator-writings/components/TextDiff/TextDiff';

/**
 * O diff existe pra substituir o dump de JSON no histórico — quem lê é formador,
 * não desenvolvedor. Adição vira <mark>, remoção vira <del>.
 */

function marks(container: HTMLElement) {
  return Array.from(container.querySelectorAll('mark')).map(e => e.textContent);
}

function dels(container: HTMLElement) {
  return Array.from(container.querySelectorAll('del')).map(e => e.textContent);
}

describe('TextDiff', () => {
  it('avisa quando nada mudou, em vez de renderizar diff vazio', () => {
    render(<TextDiff before="Texto igual." after="Texto igual." />);
    expect(screen.getByText(/Nenhuma mudança de texto/i)).toBeInTheDocument();
  });

  it('marca palavra adicionada', () => {
    const { container } = render(
      <TextDiff before="Deus é bom" after="Deus é muito bom" />,
    );
    expect(marks(container).join('')).toContain('muito');
    expect(dels(container)).toHaveLength(0);
  });

  it('marca palavra removida', () => {
    const { container } = render(
      <TextDiff before="Deus é muito bom" after="Deus é bom" />,
    );
    expect(dels(container).join('')).toContain('muito');
    expect(marks(container)).toHaveLength(0);
  });

  it('mostra remoção e adição numa substituição', () => {
    const { container } = render(
      <TextDiff before="Senhor tenha piedade" after="Senhor tenha misericórdia" />,
    );
    expect(dels(container).join('')).toContain('piedade');
    expect(marks(container).join('')).toContain('misericórdia');
  });

  it('preserva o texto inalterado ao redor da mudança', () => {
    const { container } = render(
      <TextDiff before="a b c" after="a X c" />,
    );
    expect(container.textContent).toContain('a');
    expect(container.textContent).toContain('c');
    expect(marks(container).join('')).toContain('X');
    expect(dels(container).join('')).toContain('b');
  });

  it('lida com texto anterior vazio (primeira versão)', () => {
    const { container } = render(<TextDiff before="" after="Primeiro texto" />);
    expect(marks(container).join('')).toContain('Primeiro texto');
  });

  it('lida com texto posterior vazio (tudo apagado)', () => {
    const { container } = render(<TextDiff before="Tinha algo" after="" />);
    expect(dels(container).join('')).toContain('Tinha algo');
  });

  it('agrupa palavras vizinhas da mesma operação num só elemento', () => {
    const { container } = render(
      <TextDiff before="início fim" after="início meio do caminho fim" />,
    );
    // 'meio do caminho' entra junto — não um <mark> por palavra.
    expect(container.querySelectorAll('mark')).toHaveLength(1);
    expect(marks(container)[0]).toContain('meio');
    expect(marks(container)[0]).toContain('caminho');
  });

  it('não perde quebra de linha do texto original', () => {
    const { container } = render(
      <TextDiff before={'linha um\nlinha dois'} after={'linha um\nlinha DOIS'} />,
    );
    expect(container.textContent).toContain('\n');
  });
});
