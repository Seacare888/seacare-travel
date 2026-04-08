import api from './index';

export interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  line_id: string;
  facebook_url: string;
  business_hours: string;
}

export async function getSettings(): Promise<SiteSettings> {
  const r = await api.get('/api/settings');
  return r.data.data;
}

export async function updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const r = await api.put('/api/settings', data);
  return r.data.data;
}
