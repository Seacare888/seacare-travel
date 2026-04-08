import { Injectable, Inject } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/database.module';
import { teamMember } from '../../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class TeamService {
  constructor(@Inject(DRIZZLE_DB) private db: PostgresJsDatabase) {}

  async findAll(status?: string) {
    const q = status
      ? this.db.select().from(teamMember).where(eq(teamMember.status, status))
      : this.db.select().from(teamMember);
    return q.orderBy(asc(teamMember.sortOrder));
  }

  async create(data: any) {
    const r = await this.db.insert(teamMember).values({
      name: data.name,
      role: data.role,
      description: data.description || null,
      avatarUrl: data.avatarUrl || null,
      sortOrder: Number(data.sortOrder) || 0,
      status: data.status || 'active',
    }).returning();
    return r[0];
  }

  async update(id: string, data: any) {
    const updates: any = {};
    const fields = ['name', 'role', 'description', 'avatarUrl', 'sortOrder', 'status'];
    for (const f of fields) if (data[f] !== undefined) updates[f] = data[f];
    if (updates.sortOrder !== undefined) updates.sortOrder = Number(updates.sortOrder);
    const r = await this.db.update(teamMember).set(updates).where(eq(teamMember.id, id)).returning();
    return r[0] || null;
  }

  async delete(id: string) {
    const r = await this.db.delete(teamMember).where(eq(teamMember.id, id)).returning();
    return r[0] || null;
  }
}
