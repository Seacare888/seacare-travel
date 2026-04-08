import { Injectable, Inject } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/database.module';
import { testimonial } from '../../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class TestimonialService {
  constructor(@Inject(DRIZZLE_DB) private db: PostgresJsDatabase) {}

  async findAll(status?: string) {
    const q = status
      ? this.db.select().from(testimonial).where(eq(testimonial.status, status))
      : this.db.select().from(testimonial);
    return q.orderBy(asc(testimonial.sortOrder));
  }

  async create(data: any) {
    const r = await this.db.insert(testimonial).values({
      customerName: data.customerName,
      avatarUrl: data.avatarUrl || null,
      content: data.content,
      rating: Number(data.rating) || 5,
      tourName: data.tourName || null,
      status: data.status || 'active',
      sortOrder: Number(data.sortOrder) || 0,
    }).returning();
    return r[0];
  }

  async update(id: string, data: any) {
    const updates: any = {};
    const fields = ['customerName', 'avatarUrl', 'content', 'rating', 'tourName', 'status', 'sortOrder'];
    for (const f of fields) if (data[f] !== undefined) updates[f] = data[f];
    if (updates.rating !== undefined) updates.rating = Number(updates.rating);
    if (updates.sortOrder !== undefined) updates.sortOrder = Number(updates.sortOrder);
    const r = await this.db.update(testimonial).set(updates).where(eq(testimonial.id, id)).returning();
    return r[0] || null;
  }

  async delete(id: string) {
    const r = await this.db.delete(testimonial).where(eq(testimonial.id, id)).returning();
    return r[0] || null;
  }
}
