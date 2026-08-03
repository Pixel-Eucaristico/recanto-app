import { DirectusRepository } from '../DirectusRepository';
import type {
  AppConfigRepository,
  CmsMenuRepository,
  CmsModRepository,
  CmsPageRepository,
} from '@/domain/cms/CmsRepositories';
import type { AppGlobalConfigType } from '@/services/firebase/AppConfigService';
import type { CMSPage, MenuConfig, MenuItem, ModConfig } from '@/types/cms-types';

const MAIN_MENU_ID = 'main_menu';
const GLOBAL_CONFIG_ID = 'global';

export class DirectusCmsPageRepository
  extends DirectusRepository<CMSPage>
  implements CmsPageRepository
{
  constructor() {
    super('content_pages');
  }

  getAll(): Promise<CMSPage[]> {
    return this.list('created_at', 'desc');
  }

  getBySlug(slug: string): Promise<CMSPage | null> {
    return this.findOneBy({ slug });
  }

  getPublished(): Promise<CMSPage[]> {
    return this.findManyBy({ is_published: true }, 'menu_order');
  }

  listPublished(): Promise<CMSPage[]> {
    return this.getPublished();
  }

  async listPublic(): Promise<CMSPage[]> {
    const pages = await this.getPublished();
    return pages.filter(page => !page.target_audience || page.target_audience.includes(null));
  }

  async getMenuPages(): Promise<CMSPage[]> {
    const pages = await this.getPublished();
    return pages
      .filter(page => page.show_in_menu)
      .sort((a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0));
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const page = await this.getBySlug(slug);
    return Boolean(page && page.id !== excludeId);
  }
}

export class DirectusCmsModRepository
  extends DirectusRepository<ModConfig>
  implements CmsModRepository
{
  constructor() {
    super('mods_configs');
  }

  getActive(): Promise<ModConfig[]> {
    return this.list();
  }

  listByCategory(category: string): Promise<ModConfig[]> {
    return this.findManyBy({ category });
  }

  getByModId(modId: string): Promise<ModConfig | null> {
    return this.get(modId);
  }
}

function normalizeMenuItems(items: MenuItem[]): MenuItem[] {
  return items.map(item => ({
    id: item.id,
    title: item.title,
    url: item.url,
    description: item.description,
    icon: item.icon,
    order: item.order,
    items: item.items ? normalizeMenuItems(item.items) : undefined,
  }));
}

function generateMenuItemId(): string {
  return `menu_item_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export class DirectusCmsMenuRepository
  extends DirectusRepository<MenuConfig>
  implements CmsMenuRepository
{
  constructor() {
    super('menu_config');
  }

  getMainMenu(): Promise<MenuConfig | null> {
    return super.get(MAIN_MENU_ID);
  }

  get(id = MAIN_MENU_ID): Promise<MenuConfig | null> {
    return super.get(id);
  }

  async saveMainMenu(config: Omit<MenuConfig, 'id'>): Promise<MenuConfig> {
    const now = new Date().toISOString();
    const existing = await this.getMainMenu();
    const data: MenuConfig = {
      id: MAIN_MENU_ID,
      items: normalizeMenuItems(config.items),
      is_published: config.is_published,
      created_at: existing?.created_at ?? config.created_at ?? now,
      updated_at: now,
    };

    if (existing) {
      return (await this.update(MAIN_MENU_ID, data)) ?? data;
    }

    return this.create(data);
  }

  save(config: Omit<MenuConfig, 'id'>): Promise<MenuConfig> {
    return this.saveMainMenu(config);
  }

  async publish(): Promise<void> {
    const config = await this.getMainMenu();
    if (!config) throw new Error('Menu config not found');
    await this.saveMainMenu({ ...config, is_published: true });
  }

  async unpublish(): Promise<void> {
    const config = await this.getMainMenu();
    if (!config) throw new Error('Menu config not found');
    await this.saveMainMenu({ ...config, is_published: false });
  }

  async initializeFromDefault(defaultMenu: Array<Partial<MenuItem> & { items?: MenuItem[] }>): Promise<MenuConfig> {
    const convert = (items: Array<Partial<MenuItem> & { items?: MenuItem[] }>, parentOrder = 0): MenuItem[] =>
      items.map((item, index) => ({
        id: item.id ?? generateMenuItemId(),
        title: item.title ?? '',
        url: item.url ?? '#',
        description: item.description,
        icon: item.icon,
        order: parentOrder * 1000 + index,
        items: item.items ? convert(item.items, index) : undefined,
      }));

    return this.saveMainMenu({
      items: convert(defaultMenu),
      is_published: false,
      created_at: new Date().toISOString(),
    });
  }
}

export class DirectusAppConfigRepository
  extends DirectusRepository<AppGlobalConfigType>
  implements AppConfigRepository
{
  constructor() {
    super('app_config');
  }

  async getGlobalConfig(): Promise<AppGlobalConfigType | null> {
    const config = await this.get(GLOBAL_CONFIG_ID);
    return config ?? {
      id: GLOBAL_CONFIG_ID,
      dashboard_theme_light: 'recanto-light',
      dashboard_theme_dark: 'recanto-dark',
      updated_at: new Date().toISOString(),
    };
  }

  async updateGlobalConfig(data: Partial<AppGlobalConfigType>): Promise<AppGlobalConfigType | null> {
    const current = await this.getGlobalConfig();
    const next: AppGlobalConfigType = {
      id: GLOBAL_CONFIG_ID,
      dashboard_theme_light: data.dashboard_theme_light ?? current?.dashboard_theme_light ?? 'recanto-light',
      dashboard_theme_dark: data.dashboard_theme_dark ?? current?.dashboard_theme_dark ?? 'recanto-dark',
      updated_at: new Date().toISOString(),
    };

    const existing = await this.get(GLOBAL_CONFIG_ID);
    if (existing) return this.update(GLOBAL_CONFIG_ID, next);
    return this.create(next);
  }
}

export const directusCmsPageRepository = new DirectusCmsPageRepository();
export const directusCmsModRepository = new DirectusCmsModRepository();
export const directusCmsMenuRepository = new DirectusCmsMenuRepository();
export const directusAppConfigRepository = new DirectusAppConfigRepository();
