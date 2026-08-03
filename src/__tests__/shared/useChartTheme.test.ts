import { resolveChartTheme } from '@/shared/components/charts/EChart/useChartTheme';

/**
 * A armadilha que estes testes protegem: o tema DaisyUI real vive num `<div
 * data-theme>`, não no `<html>`. Ler de `document.documentElement` devolve o tema
 * genérico `light`/`dark` do next-themes — cores completamente diferentes.
 *
 * Também cobre a escolha claro/escuro por `color-scheme`, que é o que permite
 * funcionar com qualquer um dos temas carregados (`themes: all`).
 */

const PALETA_CLARA = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
const PALETA_ESCURA = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];

/** Monta um elemento com os tokens aplicados inline, como o tema faria. */
function elementoComTema(scheme: 'light' | 'dark', extras: Record<string, string> = {}) {
  const el = document.createElement('div');
  const paleta = scheme === 'light' ? PALETA_CLARA : PALETA_ESCURA;

  // O provider marca o container com data-theme; o fallback depende disso.
  el.setAttribute('data-theme', `recanto-${scheme}`);
  el.style.setProperty('color-scheme', scheme);
  paleta.forEach((hex, i) => el.style.setProperty(`--chart-${scheme}-${i + 1}`, hex));
  for (const [k, v] of Object.entries(extras)) el.style.setProperty(k, v);

  document.body.appendChild(el);
  return el;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('resolveChartTheme', () => {
  it('cai no fallback sem elemento — não quebra no SSR', () => {
    const theme = resolveChartTheme(null);
    expect(theme.palette).toHaveLength(8);
    expect(theme.scheme).toBe('light');
  });

  it('lê a paleta clara quando color-scheme é light', () => {
    const theme = resolveChartTheme(elementoComTema('light'));
    expect(theme.scheme).toBe('light');
    expect(theme.palette).toEqual(PALETA_CLARA);
  });

  it('lê a paleta escura quando color-scheme é dark', () => {
    const theme = resolveChartTheme(elementoComTema('dark'));
    expect(theme.scheme).toBe('dark');
    expect(theme.palette).toEqual(PALETA_ESCURA);
  });

  it('detecta dark mesmo quando color-scheme traz os dois valores', () => {
    const el = elementoComTema('dark');
    el.style.setProperty('color-scheme', 'light dark');
    // `light dark` significa que o autor aceita ambos; o navegador resolve. Aqui o
    // importante é não classificar como claro por engano ao encontrar "dark".
    expect(resolveChartTheme(el).scheme).toBe('dark');
  });

  it('usa os tokens do tema para tinta, grade e superfície', () => {
    const theme = resolveChartTheme(elementoComTema('light', {
      '--color-base-100': 'oklch(0.98 0.005 95)',
      '--color-base-300': 'oklch(0.89 0.025 95)',
      '--color-base-content': 'oklch(0.18 0.02 40)',
    }));

    expect(theme.surface).toBe('oklch(0.98 0.005 95)');
    expect(theme.grid).toBe('oklch(0.89 0.025 95)');
    expect(theme.ink).toBe('oklch(0.18 0.02 40)');
  });

  it('deriva a tinta secundária da principal, nunca da cor da série', () => {
    const theme = resolveChartTheme(elementoComTema('light', {
      '--color-base-content': 'oklch(0.18 0.02 40)',
    }));
    // color-mix preserva oklch — converter para rgb à mão perderia o espaço de cor.
    expect(theme.inkMuted).toContain('color-mix');
    expect(theme.inkMuted).toContain('oklch(0.18 0.02 40)');
    expect(theme.palette).not.toContain(theme.inkMuted);
  });

  it('mantém as cores de status separadas da paleta de séries', () => {
    const theme = resolveChartTheme(elementoComTema('light', {
      '--color-success': 'oklch(0.65 0.2 140)',
      '--color-warning': 'oklch(0.85 0.25 85)',
      '--color-error': 'oklch(0.6 0.25 25)',
    }));

    expect(theme.success).toBe('oklch(0.65 0.2 140)');
    expect(theme.warning).toBe('oklch(0.85 0.25 85)');
    expect(theme.error).toBe('oklch(0.6 0.25 25)');
    // Status nunca deve virar cor de série.
    for (const status of [theme.success, theme.warning, theme.error]) {
      expect(theme.palette).not.toContain(status);
    }
  });

  it('usa a paleta de fallback se o tema definir slots incompletos', () => {
    const el = document.createElement('div');
    el.style.setProperty('color-scheme', 'light');
    el.style.setProperty('--chart-light-1', '#2a78d6');
    el.style.setProperty('--chart-light-2', '#eb6834');
    document.body.appendChild(el);

    // Paleta parcial cicla hue e quebra a garantia de distinção — melhor a completa.
    expect(resolveChartTheme(el).palette).toHaveLength(8);
    expect(resolveChartTheme(el).palette).toEqual(PALETA_CLARA);
  });

  it('sobe até o container do tema quando o próprio elemento não resolve', () => {
    // Caso real: o tema está num div acima do gráfico. Em navegador as custom
    // properties herdam; se por algum motivo não herdarem, o fallback por
    // `[data-theme]` garante que o gráfico não fique com o tema errado calado.
    const wrapper = elementoComTema('dark');
    const filho = document.createElement('div');
    wrapper.appendChild(filho);

    expect(resolveChartTheme(filho).scheme).toBe('dark');
    expect(resolveChartTheme(filho).palette).toEqual(PALETA_ESCURA);
  });

  it('a ordem da paleta é estável — é o mecanismo de segurança para daltonismo', () => {
    const a = resolveChartTheme(elementoComTema('light')).palette;
    document.body.innerHTML = '';
    const b = resolveChartTheme(elementoComTema('light')).palette;
    expect(a).toEqual(b);
    expect(a[0]).toBe('#2a78d6');
  });
});
