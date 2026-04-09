import { Injectable, Inject } from '@nestjs/common';
import { eq, asc, gte, lte, and, ne, sql } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/database.module';
import { tourDeparture, tour } from '../../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class DepartureService {
  constructor(@Inject(DRIZZLE_DB) private db: PostgresJsDatabase) {}

  async findAll() {
    return this.db
      .select({
        id: tourDeparture.id,
        tourId: tourDeparture.tourId,
        departureDate: tourDeparture.departureDate,
        returnDate: tourDeparture.returnDate,
        originalPrice: tourDeparture.originalPrice,
        promoPrice: tourDeparture.promoPrice,
        seatsLeft: tourDeparture.seatsLeft,
        status: tourDeparture.status,
        note: tourDeparture.note,
        createdAt: tourDeparture.createdAt,
        tourTitle: tour.title,
        tourDestination: tour.destination,
        tourCoverImage: tour.coverImage,
      })
      .from(tourDeparture)
      .leftJoin(tour, eq(tourDeparture.tourId, tour.id))
      .orderBy(asc(tourDeparture.departureDate));
  }

  async findUpcoming() {
    const today = new Date().toISOString().split('T')[0];
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.db
      .select({
        id: tourDeparture.id,
        tourId: tourDeparture.tourId,
        departureDate: tourDeparture.departureDate,
        returnDate: tourDeparture.returnDate,
        originalPrice: tourDeparture.originalPrice,
        promoPrice: tourDeparture.promoPrice,
        seatsLeft: tourDeparture.seatsLeft,
        status: tourDeparture.status,
        note: tourDeparture.note,
        createdAt: tourDeparture.createdAt,
        tourTitle: tour.title,
        tourDestination: tour.destination,
        tourCoverImage: tour.coverImage,
      })
      .from(tourDeparture)
      .leftJoin(tour, eq(tourDeparture.tourId, tour.id))
      .where(
        and(
          gte(tourDeparture.departureDate, today),
          lte(tourDeparture.departureDate, future),
          ne(tourDeparture.status, 'full'),
        ),
      )
      .orderBy(asc(tourDeparture.departureDate));
  }

  async create(data: any) {
    const r = await this.db.insert(tourDeparture).values({
      tourId: data.tourId,
      departureDate: data.departureDate,
      returnDate: data.returnDate || null,
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      promoPrice: Number(data.promoPrice),
      seatsLeft: Number(data.seatsLeft) || 0,
      status: data.status || 'available',
      note: data.note || null,
    }).returning();
    return r[0];
  }

  async update(id: string, data: any) {
    const updates: any = {};
    const fields = ['tourId', 'departureDate', 'returnDate', 'originalPrice', 'promoPrice', 'seatsLeft', 'status', 'note'];
    for (const f of fields) if (data[f] !== undefined) updates[f] = data[f];
    if (updates.originalPrice !== undefined) updates.originalPrice = updates.originalPrice ? Number(updates.originalPrice) : null;
    if (updates.promoPrice !== undefined) updates.promoPrice = Number(updates.promoPrice);
    if (updates.seatsLeft !== undefined) updates.seatsLeft = Number(updates.seatsLeft);
    const r = await this.db.update(tourDeparture).set(updates).where(eq(tourDeparture.id, id)).returning();
    return r[0] || null;
  }

  async delete(id: string) {
    const r = await this.db.delete(tourDeparture).where(eq(tourDeparture.id, id)).returning();
    return r[0] || null;
  }
}
