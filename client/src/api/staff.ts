import api from './index';
import type { IStaff } from '../types';

export async function getAllStaff(): Promise<IStaff[]> {
  const r = await api.get('/api/staff');
  return r.data.data;
}

export async function loginStaff(username: string, password: string) {
  const r = await api.post('/api/staff/login', { username, password });
  return r.data.data;
}

export async function createStaff(data: { username: string; password: string; name: string; role?: string }) {
  const r = await api.post('/api/staff', data);
  return r.data.data;
}

export async function updateStaff(id: string, data: any) {
  const r = await api.put('/api/staff/' + id, data);
  return r.data.data;
}

export async function deleteStaff(id: string) {
  await api.delete('/api/staff/' + id);
}
