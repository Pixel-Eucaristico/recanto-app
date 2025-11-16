import { notFound } from 'next/navigation';
import { contentPageService } from '@/services/firebase/ContentPageService';
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
    return await contentPageService.getBySlug(slug);
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

  // Ordenar blocos por order
  const sortedBlocks = [...page.blocks].sort((a, b) => a.order - b.order);

  return (
    <>
      {sortedBlocks.map((block: CMSBlock) => {
        const Component = ModComponents[block.modId as keyof typeof ModComponents];

        if (!Component) {
          console.warn(`Mod "${block.modId}" não encontrado`);
          return null;
        }

        // Renderiza o Mod com suas props
        return (
          <Component
            key={block.id}
            {...block.props}
          />
        );
      })}
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
