import { notFound } from 'next/navigation';
import { contentPageServerService } from '@/services/firebase/ContentPageService.server';
import { ModComponents } from '@/components/mods';
import { CMSPage, CMSBlock } from '@/types/cms-types';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

/**
 * Busca dados da página CMS por slug
 */
async function getPageData(slug: string): Promise<CMSPage | null> {
  try {
    return await contentPageServerService.getBySlug(slug);
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

/**
 * Renderizador Dinâmico de Páginas CMS
 *
 * Este componente captura todas as rotas e renderiza páginas CMS dinamicamente.
 * Cada página é composta por blocos (Mods) configurados no Firestore.
 */
export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug ? `/${resolvedParams.slug.join('/')}` : '/';
  const page = await getPageData(slug);

  // Página não encontrada ou não publicada
  if (!page || !page.is_published) {
    notFound();
  }

  // Carregar fonte do Google Fonts se especificada
  const fontFamily = page.font_family || 'Inter';
  const bgColor = page.bg_color || 'base-100';
  const fontLink = fontFamily !== 'system-ui'
    ? `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`
    : null;

  // Debug: Verificar se page.blocks existe
  console.log('🔍 [DEBUG] Página completa:', {
    slug: page.slug,
    title: page.title,
    hasBlocksField: 'blocks' in page,
    blocksType: typeof page.blocks,
    blocksIsArray: Array.isArray(page.blocks),
    blocksValue: page.blocks,
  });

  // Garantir que blocks existe e é array
  const blocks = Array.isArray(page.blocks) ? page.blocks : [];

  // Ordenar blocos por order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // Debug: Log da página
  console.log(`📄 [CMS] Renderizando página: ${page.slug}`, {
    title: page.title,
    totalBlocks: sortedBlocks.length,
    blocks: sortedBlocks.map(b => ({ modId: b.modId, order: b.order })),
  });

  // Se não há blocos, mostrar mensagem
  if (sortedBlocks.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="card bg-base-200 shadow-xl max-w-md">
          <div className="card-body text-center">
            <h2 className="card-title">Página sem conteúdo</h2>
            <p className="text-base-content/60">
              Esta página está publicada mas não possui blocos de conteúdo.
              Adicione blocos no editor CMS.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Carregar Google Font */}
      {fontLink && (
        <link rel="stylesheet" href={fontLink} />
      )}

      {/* Aplicar fonte e cor de fundo */}
      <div
        className={`bg-${bgColor} min-h-screen`}
        style={{
          fontFamily: fontFamily === 'system-ui' ? 'system-ui' : `'${fontFamily}', sans-serif`,
        }}
      >
        {sortedBlocks.map((block: CMSBlock) => {
          const Component = ModComponents[block.modId as keyof typeof ModComponents];

          if (!Component) {
            console.warn(`❌ [CMS] Mod "${block.modId}" não encontrado em ModComponents`);
            return (
              <div key={block.id} className="alert alert-error">
                <span>Erro: Mod "{block.modId}" não encontrado</span>
              </div>
            );
          }

          console.log(`✅ [CMS] Renderizando Mod: ${block.modId}`, {
            blockId: block.id,
            hasProps: !!block.props,
            propsKeys: block.props ? Object.keys(block.props) : [],
          });
          console.log('📦 Props completas:', JSON.stringify(block.props, null, 2));

          // Corrigir aninhamento incorreto de props (props.props -> props)
          // Se props.props existe e tem dados, usar ele ao invés de props
          const actualProps = (block.props?.props && Object.keys(block.props.props).length > 0)
            ? block.props.props
            : block.props;

          console.log('✅ Props finais usadas:', JSON.stringify(actualProps, null, 2));

          // Limpar props vazias/undefined (deixar o componente usar defaults)
          const cleanProps = Object.entries(actualProps || {}).reduce((acc, [key, value]) => {
            // Só adiciona se o valor não for vazio, undefined ou null
            if (value !== '' && value !== undefined && value !== null) {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, any>);

          console.log('🧹 Props limpas:', JSON.stringify(cleanProps, null, 2));

          // Renderiza o Mod com suas props corretas
          return (
            <Component
              key={block.id}
              {...cleanProps}
            />
          );
        })}
      </div>
    </>
  );
}

/**
 * Gerar metadata dinâmica para SEO
 */
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug ? `/${resolvedParams.slug.join('/')}` : '/';
  const page = await getPageData(slug);

  if (!page) {
    return {
      title: 'Página não encontrada',
      description: 'A página solicitada não foi encontrada.'
    };
  }

  return {
    title: page.seo?.meta_title || page.title,
    description: page.seo?.meta_description || page.description,
    openGraph: {
      title: page.seo?.meta_title || page.title,
      description: page.seo?.meta_description || page.description,
      images: page.seo?.og_image ? [page.seo.og_image] : [],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seo?.meta_title || page.title,
      description: page.seo?.meta_description || page.description,
      images: page.seo?.og_image ? [page.seo.og_image] : []
    }
  };
}
