import api from './index';

export interface ITestimonial {
  id: string;
  customerName: string;
  customer_name?: string;
  avatarUrl: string | null;
  avatar_url?: string | null;
  content: string;
  rating: number;
  tourName: string | null;
  tour_name?: string | null;
  status: string;
  sortOrder: number;
  sort_order?: number;
}

function normalize(t: any): ITestimonial {
  return { ...t, customerName: t.customer_name || t.customerName, avatarUrl: t.avatar_url || t.avatarUrl, tourName: t.tour_name || t.tourName, sortOrder: t.sort_order ?? t.sortOrder };
}

export async function getTestimonials(status?: string): Promise<ITestimonial[]> {
  const params = status ? `?status=${status}` : '';
  const r = await api.get('/api/testimonials' + params);
  return r.data.data.map(normalize);
}

export async function createTestimonial(data: Partial<ITestimonial>): Promise<ITestimonial> {
  const r = await api.post('/api/testimonials', data);
  return normalize(r.data.data);
}

export async function updateTestimonial(id: string, data: Partial<ITestimonial>): Promise<ITestimonial> {
  const r = await api.put('/api/testimonials/' + id, data);
  return normalize(r.data.data);
}

export async function deleteTestimonial(id: string): Promise<void> {
  await api.delete('/api/testimonials/' + id);
}
