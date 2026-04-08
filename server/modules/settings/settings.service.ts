import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/database.module';
import { siteSettings } from '../../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class SettingsService {
  constructor(@Inject(DRIZZLE_DB) private db: PostgresJsDatabase) {}

  async findAll(): Promise<Record<string, string>> {
    const rows = await this.db.select().from(siteSettings);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value || '';
    return map;
  }

  async updateAll(data: Record<string, string>) {
    for (const [key, value] of Object.entries(data)) {
      await this.db
        .update(siteSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettings.key, key));
    }
    return this.findAll();
  }
}
