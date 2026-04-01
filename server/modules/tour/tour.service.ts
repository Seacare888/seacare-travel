import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, asc } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../app.module';
import { tour, tourItinerary, destination } from '../../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class TourService {
  constructor(@Inject(DRIZZLE_DB) private db: PostgresJsDatabase) {}

  async findAll(params: { region?: string; destination?: string; status?: string; featured?: boolean }) {
    const conds = [];
    if (params.region && params.region !== 'all') conds.push(eq(tour.region, params.region));
    if (params.destination) conds.push(eq(tour.destination, params.destination));
    if (params.status) conds.push(eq(tour.status, params.status));
    if (params.featured !== undefined) conds.push(eq(tour.featured, params.featured));
    const q = conds.length ? this.db.select().from(tour).where(and(...conds)) : this.db.select().from(tour);
    return q.orderBy(desc(tour.createdAt));
  }

  async findOne(id: string) {
    const r = await this.db.select().from(tour).where(eq(tour.id, id)).limit(1);
    return r[0] || null;
  }

  async findWithItinerary(id: string) {
    const t = await this.findOne(id);
    if (!t) return null;
    const itin = await this.db.select().from(tourItinerary)
      .where(eq(tourItinerary.tourId, id)).orderBy(asc(tourItinerary.day));
    return { ...t, itinerary: itin };
  }

  async create(data: any) {
    const r = await this.db.insert(tour).values({
      title: data.title, description: data.description,
      destination: data.destination, region: data.region,
      duration: Number(data.duration), price: Number(data.price),
      departure: data.departure || 'กรุงเทพฯ',
      coverImage: data.coverImage, tags: data.tags || [],
      status: data.status || 'active', featured: data.featured || false,
    }).returning();
    return r[0];
  }

  async update(id: string, data: any) {
    const updates: any = { updatedAt: new Date() };
    const fields = ['title','description','destination','region','duration','price','departure','coverImage','tags','status','featured'];
    for (const f of fields) if (data[f] !== undefined) updates[f] = data[f];
    if (updates.duration) updates.duration = Number(updates.duration);
    if (updates.price) updates.price = Number(updates.price);
    const r = await this.db.update(tour).set(updates).where(eq(tour.id, id)).returning();
    return r[0] || null;
  }

  async delete(id: string) {
    const r = await this.db.delete(tour).where(eq(tour.id, id)).returning();
    return r[0] || null;
  }

  async findAllDestinations(params: { region?: string; status?: string }) {
    const conds = [];
    if (params.region) conds.push(eq(destination.region, params.region));
    if (params.status) conds.push(eq(destination.status, params.status));
    const q = conds.length
      ? this.db.select().from(destination).where(and(...conds))
      : this.db.select().from(destination);
    return q.orderBy(asc(destination.sortOrder));
  }

  async createDestination(data: any) {
    const r = await this.db.insert(destination).values({
      name: data.name, nameEn: data.nameEn, region: data.region,
      status: data.status || 'active', sortOrder: data.sortOrder || 0,
    }).returning();
    return r[0];
  }

  async deleteDestination(id: string) {
    const r = await this.db.delete(destination).where(eq(destination.id, id)).returning();
    return r[0] || null;
  }
}
