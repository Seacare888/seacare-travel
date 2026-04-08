import { pgTable, uuid, varchar, text, integer, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const staffUser = pgTable('staff_user', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('staff').notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const destination = pgTable('destination', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  region: varchar('region', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('active'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tour = pgTable('tour', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  destination: varchar('destination', { length: 255 }).notNull(),
  region: varchar('region', { length: 100 }).notNull(),
  duration: integer('duration').default(1).notNull(),
  price: integer('price').default(0).notNull(),
  departure: varchar('departure', { length: 255 }).default('กรุงเทพฯ'),
  coverImage: text('cover_image'),
  tags: text('tags').array().default([]),
  status: varchar('status', { length: 50 }).default('active'),
  featured: boolean('featured').default(false),
  programUrl: text('program_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tourItinerary = pgTable('tour_itinerary', {
  id: uuid('id').defaultRandom().primaryKey(),
  tourId: uuid('tour_id').notNull().references(() => tour.id, { onDelete: 'cascade' }),
  day: integer('day').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  activities: text('activities').array().default([]),
  meals: text('meals').array().default([]),
  accommodation: varchar('accommodation', { length: 255 }),
});
