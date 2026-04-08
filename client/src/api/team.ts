import api from './index';

export interface ITeamMember {
  id: string;
  name: string;
  role: string;
  description: string | null;
  avatarUrl: string | null;
  avatar_url?: string | null;
  sortOrder: number;
  sort_order?: number;
  status: string;
}

function normalize(m: any): ITeamMember {
  return { ...m, avatarUrl: m.avatar_url || m.avatarUrl, sortOrder: m.sort_order ?? m.sortOrder };
}

export async function getTeamMembers(status?: string): Promise<ITeamMember[]> {
  const params = status ? `?status=${status}` : '';
  const r = await api.get('/api/team' + params);
  return r.data.data.map(normalize);
}

export async function createTeamMember(data: Partial<ITeamMember>): Promise<ITeamMember> {
  const r = await api.post('/api/team', data);
  return normalize(r.data.data);
}

export async function updateTeamMember(id: string, data: Partial<ITeamMember>): Promise<ITeamMember> {
  const r = await api.put('/api/team/' + id, data);
  return normalize(r.data.data);
}

export async function deleteTeamMember(id: string): Promise<void> {
  await api.delete('/api/team/' + id);
}
