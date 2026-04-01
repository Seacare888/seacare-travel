import * as postgres from 'postgres';
import * as bcrypt from 'bcryptjs';

async function migrate() {
  const url = process.env.SUDA_DATABASE_URL;
  if (!url) {
    console.error('SUDA_DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(url, { ssl: 'require' });

  console.log('Creating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS staff_user (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'staff',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS destination (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      name_en VARCHAR(255),
      region VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tour (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      destination VARCHAR(255) NOT NULL,
      region VARCHAR(100) NOT NULL,
      duration INTEGER NOT NULL DEFAULT 1,
      price INTEGER NOT NULL DEFAULT 0,
      departure VARCHAR(255) DEFAULT 'กรุงเทพฯ',
      cover_image TEXT,
      tags TEXT[] DEFAULT '{}',
      status VARCHAR(50) DEFAULT 'active',
      featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tour_itinerary (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tour_id UUID NOT NULL REFERENCES tour(id) ON DELETE CASCADE,
      day INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      activities TEXT[] DEFAULT '{}',
      meals TEXT[] DEFAULT '{}',
      accommodation VARCHAR(255)
    )
  `;

  console.log('Tables created.');

  // Seed default admin if not exists
  const existing = await sql`SELECT id FROM staff_user WHERE username = 'admin' LIMIT 1`;
  if (existing.length === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await sql`
      INSERT INTO staff_user (username, password_hash, name, role)
      VALUES ('admin', ${hash}, 'Administrator', 'admin')
    `;
    console.log('Default admin account created (admin / admin123).');
  } else {
    console.log('Admin account already exists, skipping seed.');
  }

  await sql.end();
  console.log('Migration complete.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
