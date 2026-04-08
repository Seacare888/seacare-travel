import api from './index';

export interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  line_id: string;
  facebook_url: string;
  business_hours: string;
  company_name: string;
  company_slogan: string;
  about_intro: string;
  about_vision: string;
  about_mission: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  [key: string]: string;
}

export async function getSettings(): Promise<SiteSettings> {
  const r = await api.get('/api/settings');
  return r.data.data;
}

export async function updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const r = await api.put('/api/settings', data);
  return r.data.data;
}
