import type { CMSPage, MenuConfig, ModConfig } from '@/types/cms-types';
import type { AppGlobalConfigType } from '@/services/firebase/AppConfigService';
import type { Repository } from '@/domain/shared/Repository';

export interface CmsPageRepository extends Repository<CMSPage> {
  getBySlug(slug: string): Promise<CMSPage | null>;
  getPublished(): Promise<CMSPage[]>;
  getMenuPages(): Promise<CMSPage[]>;
}

export interface CmsModRepository extends Repository<ModConfig> {
  getActive(): Promise<ModConfig[]>;
}

export interface CmsMenuRepository extends Repository<MenuConfig> {
  getMainMenu(): Promise<MenuConfig | null>;
  saveMainMenu(config: Omit<MenuConfig, 'id'>): Promise<MenuConfig>;
}

export interface AppConfigRepository {
  getGlobalConfig(): Promise<AppGlobalConfigType | null>;
  updateGlobalConfig(data: Partial<AppGlobalConfigType>): Promise<AppGlobalConfigType | null>;
}
