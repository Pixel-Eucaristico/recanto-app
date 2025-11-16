import { ModComponents } from "@/components/mods";
import { getHomePage } from "@/lib/cms-helpers";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const cmsPage = await getHomePage();

    return {
      title: cmsPage.title,
      description: cmsPage.description || 'Recanto do Amor Misericordioso',
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Recanto do Amor Misericordioso',
      description: 'Comunidade Católica de Aliança e Vida',
    };
  }
}

export default async function Home() {
  try {
    // Obtém home page do banco ou versão padrão
    const cmsPage = await getHomePage();

    // Se existe mas não está publicada, mostra mensagem
    if (!cmsPage.is_published) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
          <div className="card bg-base-100 shadow-xl max-w-md">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-2xl mb-4">Página em Rascunho</h2>
              <p className="text-base-content/60 mb-6">
                A página inicial está em modo rascunho. Publique-a no editor para visualizar.
              </p>
              <Link href={`/app/dashboard/cms/${cmsPage.id}/edit`} className="btn btn-primary">
                Editar e Publicar
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Renderiza a página CMS publicada
    return (
      <>
        {cmsPage.blocks
          .sort((a, b) => a.order - b.order)
          .map((block) => {
            const ModComponent = ModComponents[block.modId as keyof typeof ModComponents];

            if (!ModComponent) {
              console.warn(`Mod "${block.modId}" not found`);
              return null;
            }

            return <ModComponent key={block.id} {...block.props} />;
          })}
      </>
    );
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-2xl mb-4">Erro ao Carregar Página</h2>
            <p className="text-base-content/60 mb-6">
              Ocorreu um erro ao carregar a página inicial. Por favor, tente novamente ou entre em contato com o suporte.
            </p>
            <Link href="/app/dashboard/cms" className="btn btn-primary">
              Ir para Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
