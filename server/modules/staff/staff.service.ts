import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { DRIZZLE_DB } from '../../database/database.module';
import { staffUser } from '../../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class StaffService {
  constructor(@Inject(DRIZZLE_DB) private db: PostgresJsDatabase) {}

  async findAll() {
    return this.db.select({
      id: staffUser.id, username: staffUser.username,
      name: staffUser.name, role: staffUser.role,
      status: staffUser.status, createdAt: staffUser.createdAt,
    }).from(staffUser);
  }

  async findById(id: string) {
    const r = await this.db.select().from(staffUser).where(eq(staffUser.id, id)).limit(1);
    return r[0] || null;
  }

  async findByUsername(username: string) {
    const r = await this.db.select().from(staffUser).where(eq(staffUser.username, username)).limit(1);
    return r[0] || null;
  }

  async create(data: { username: string; password: string; name: string; role?: string }) {
    const hash = await bcrypt.hash(data.password, 10);
    const r = await this.db.insert(staffUser).values({
      username: data.username, passwordHash: hash,
      name: data.name, role: data.role || 'staff',
    }).returning();
    return r[0];
  }

  async update(id: string, data: { name?: string; role?: string; status?: string; password?: string }) {
    const updates: any = {};
    if (data.name) updates.name = data.name;
    if (data.role) updates.role = data.role;
    if (data.status) updates.status = data.status;
    if (data.password) updates.passwordHash = await bcrypt.hash(data.password, 10);
    const r = await this.db.update(staffUser).set(updates).where(eq(staffUser.id, id)).returning();
    return r[0] || null;
  }

  async delete(id: string) {
    const r = await this.db.delete(staffUser).where(eq(staffUser.id, id)).returning();
    return r[0] || null;
  }

  async validateLogin(username: string, password: string) {
    const user = await this.findByUsername(username);
    if (!user || user.status !== 'active') return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return { id: user.id, username: user.username, name: user.name, role: user.role };
  }
}
