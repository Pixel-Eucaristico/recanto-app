import { contentPageServerService } from '@/services/firebase/ContentPageService.server';
import type { CMSPage } from '@/types/cms-types';

/**
 * Retorna a estrutura padrão da home page
 * Não salva no banco - apenas retorna o objeto em memória
 */
export function getDefaultHomePage(): CMSPage {
  return {
    id: 'default-home',
    title: 'Recanto do Amor Misericordioso',
    slug: '/',
    description: 'Comunidade Católica de Aliança e Vida dedicada à formação espiritual e evangelização',
    blocks: [
      {
        id: 'hero-mission-1',
        modId: 'HeroMission',
        order: 0,
        props: {
          title: 'Recanto do Amor Misericordioso',
          description: 'Somos uma comunidade católica em Sumaré dedicada a "vivenciar o Amor Misericordioso de Jesus Cristo", realizando retiros e encontros que avivam os corações e transformam histórias de vida. Nosso apostolado é voltado para crianças, jovens e famílias, promovendo educação integral e aperfeiçoamento das virtudes.',
          buttonText: 'Participe de um Retiro',
          buttonLink: '/sobre',
          backgroundImage: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200'
        }
      },
      {
        id: 'events-section-2',
        modId: 'EventsSection',
        order: 1,
        props: {
          title: 'Próximos Eventos',
          subtitle: 'Venha participar dos nossos encontros comunitários de oração, formação e celebração',
          maxEvents: 6,
          ctaText: 'Entre em contato para participar',
          ctaLink: '/contatos'
        }
      },
      {
        id: 'testimonials-3',
        modId: 'Testimonials',
        order: 2,
        props: {
          title: 'O que nossa comunidade fala',
          testimonials: JSON.stringify([
            {
              id: 1,
              name: 'Maria Silva',
              role: 'Membro da Comunidade',
              avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
              comment: 'Participar da comunidade mudou minha vida. Os retiros são transformadores!',
              date: 'Mar 2024'
            },
            {
              id: 2,
              name: 'João Santos',
              role: 'Participante dos Retiros',
              avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
              comment: 'A formação espiritual que recebo aqui fortalece minha fé e minha família.',
              date: 'Fev 2024'
            },
            {
              id: 3,
              name: 'Ana Costa',
              role: 'Voluntária',
              avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
              comment: 'Servir nesta comunidade é uma bênção. Vejo Cristo nos irmãos a cada dia.',
              date: 'Jan 2024'
            }
          ], null, 2)
        }
      }
    ],
    is_published: true,
    created_at: new Date().toISOString()
  };
}

/**
 * Obtém a home page do banco ou retorna a versão padrão
 * Se existir no banco: usa a versão editada
 * Se não existir: usa a versão padrão (hardcoded)
 */
export async function getHomePage(): Promise<CMSPage> {
  try {
    const homePage = await contentPageServerService.getBySlug('/');

    if (homePage) {
      console.log('✅ Home page carregada do banco de dados');
      return homePage;
    }

    console.log('📄 Home page não existe no banco. Usando versão padrão.');
    return getDefaultHomePage();
  } catch (error) {
    console.error('❌ Erro ao buscar home page:', error);
    console.log('📄 Usando versão padrão da home page');
    return getDefaultHomePage();
  }
}
