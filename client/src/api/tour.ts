import api from './index';
import type { ITour, IDestination } from '../types';

export async function getTours(p?: { region?: string; destination?: string; status?: string; featured?: boolean }): Promise<ITour[]> {
  const params = new URLSearchParams();
  if (p?.region) params.set('region', p.region);
  if (p?.destination) params.set('destination', p.destination);
  if (p?.status) params.set('status', p.status);
  if (p?.featured !== undefined) params.set('featured', String(p.featured));
  const r = await api.get('/api/tours?' + params);
  return r.data.data.map((t: any) => ({ ...t, coverImage: t.cover_image || t.coverImage }));
}

export async function getTourDetail(id: string): Promise<ITour> {
  const r = await api.get('/api/tours/' + id + '/detail');
  const d = r.data.data;
  return { ...d, coverImage: d.cover_image || d.coverImage };
}

export async function createTour(data: Partial<ITour>): Promise<ITour> {
  const r = await api.post('/api/tours', { ...data, cover_image: data.coverImage });
  return r.data.data;
}

export async function updateTour(id: string, data: Partial<ITour>): Promise<ITour> {
  const r = await api.put('/api/tours/' + id, { ...data, cover_image: data.coverImage });
  return r.data.data;
}

export async function deleteTour(id: string): Promise<void> {
  await api.delete('/api/tours/' + id);
}

export async function getDestinations(p?: { region?: string; status?: string }): Promise<IDestination[]> {
  const params = new URLSearchParams();
  if (p?.status) params.set('status', p.status);
  const r = await api.get('/api/tours/destinations/all?' + params);
  return r.data.data;
}

export async function createDestination(data: Partial<IDestination>): Promise<IDestination> {
  const r = await api.post('/api/tours/destinations', data);
  return r.data.data;
}

export async function deleteDestination(id: string): Promise<void> {
  await api.delete('/api/tours/destinations/' + id);
}
