export interface AppGlobalConfigType {
  id: string; // 'global'
  dashboard_theme_light: string;
  dashboard_theme_dark: string;
  updated_at: string;
}

class AppConfigService {
  async getGlobalConfig(): Promise<AppGlobalConfigType> {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
         return await response.json();
      }
      
      // Default config se não existir ou houver erro
      const defaultConfig: AppGlobalConfigType = {
        id: 'global',
        dashboard_theme_light: 'recanto-light',
        dashboard_theme_dark: 'recanto-dark',
        updated_at: new Date().toISOString()
      };
      
      return defaultConfig;
    } catch (error) {
      console.error('Error fetching global config:', error);
      throw error;
    }
  }

  async updateGlobalConfig(config: Partial<AppGlobalConfigType>): Promise<void> {
    try {
      const response = await fetch('/api/admin/settings', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(config)
      });
      
      if (!response.ok) {
         throw new Error(`Failed to update config: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating global config:', error);
      throw error;
    }
  }
}

export const appConfigService = new AppConfigService();
export default appConfigService;
