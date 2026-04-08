import * as postgres from 'postgres';
import * as bcrypt from 'bcryptjs';

export async function runMigration() {
  const url = process.env.SUDA_DATABASE_URL;
  if (!url) {
    console.error('SUDA_DATABASE_URL is not set, skipping migration');
    return;
  }

  const sql = postgres(url, { ssl: 'require' });

  console.log('Running database migration...');

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

  const existing = await sql`SELECT id FROM staff_user WHERE username = 'admin' LIMIT 1`;
  if (existing.length === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await sql`
      INSERT INTO staff_user (username, password_hash, name, role)
      VALUES ('admin', ${hash}, 'Administrator', 'admin')
    `;
    console.log('Default admin account created (admin / admin123).');
  }

  await sql`ALTER TABLE tour ADD COLUMN IF NOT EXISTS program_url TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key VARCHAR(100) NOT NULL UNIQUE,
      value TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    INSERT INTO site_settings (key, value) VALUES
    ('phone', '02-888-9999'),
    ('email', 'contact@seacare-travel.co.th'),
    ('address', 'อาคารสีลมคอมเพล็กซ์ ชั้น 18 กรุงเทพฯ'),
    ('line_id', '@golfseacare'),
    ('facebook_url', 'https://www.facebook.com/share/14afZa69pXB/'),
    ('business_hours', 'จันทร์-อาทิตย์ 9:00-21:00 น.'),
    ('company_name', 'Seacare Travel'),
    ('company_slogan', 'ผู้ให้บริการท่องเที่ยวระดับโลก สร้างประสบการณ์การเดินทางที่น่าจดจำ'),
    ('about_intro', 'Seacare Travel ก่อตั้งขึ้นด้วยความมุ่งมั่นที่จะให้บริการท่องเที่ยวคุณภาพสูง เราดูแลลูกค้าทุกคนเสมือนครอบครัว ด้วยประสบการณ์กว่า 10 ปี'),
    ('about_vision', 'มุ่งมั่นเป็นบริษัทท่องเที่ยวชั้นนำที่ลูกค้าไว้วางใจมากที่สุดในประเทศไทย'),
    ('about_mission', 'สร้างประสบการณ์การเดินทางที่น่าจดจำ ด้วยบริการที่เป็นเลิศและราคาที่คุ้มค่า'),
    ('hero_title', 'ท่องเที่ยวรอบโลก ไปกับ Seacare'),
    ('hero_subtitle', 'ผู้ให้บริการท่องเที่ยวระดับโลก สร้างประสบการณ์การเดินทางที่น่าจดจำสู่กว่า 50 ประเทศทั่วโลก'),
    ('hero_image', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1920&q=80')
    ON CONFLICT (key) DO NOTHING
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS team_member (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      description TEXT,
      avatar_url TEXT,
      sort_order INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  const teamExists = await sql`SELECT id FROM team_member LIMIT 1`;
  if (teamExists.length === 0) {
    await sql`
      INSERT INTO team_member (name, role, description, avatar_url, sort_order) VALUES
      ('คุณวิภา', 'ผู้ก่อตั้งและ CEO', 'ประสบการณ์ด้านการท่องเที่ยวกว่า 15 ปี', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', 1),
      ('คุณสมศักดิ์', 'ผู้อำนวยการฝ่ายปฏิบัติการ', 'เชี่ยวชาญการออกแบบผลิตภัณฑ์ท่องเที่ยว', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', 2),
      ('คุณประภาพร', 'ผู้อำนวยการฝ่ายผลิตภัณฑ์', 'นักวางแผนการเดินทางระดับสูง', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', 3),
      ('คุณมานะ', 'ผู้อำนวยการฝ่ายบริการลูกค้า', 'ประสบการณ์ด้านบริการกว่า 20 ปี', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', 4)
    `;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS testimonial (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_name VARCHAR(255) NOT NULL,
      avatar_url TEXT,
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      tour_name VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  const testimonialsExist = await sql`SELECT id FROM testimonial LIMIT 1`;
  if (testimonialsExist.length === 0) {
    await sql`
      INSERT INTO testimonial (customer_name, avatar_url, content, rating, tour_name, sort_order) VALUES
      ('คุณวรรณ', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', 'ทริปญี่ปุ่นสุดยอดมากค่ะ! ไกด์มืออาชีพมาก จะใช้บริการอีกแน่นอน', 5, 'ทัวร์ญี่ปุ่น โตเกียว ฟูจิ', 1),
      ('คุณสมชาย', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80', 'พาครอบครัวไปยุโรป ลูกๆ สนุกมาก บริการดีเยี่ยมครับ!', 5, 'ทัวร์ฝรั่งเศส อิตาลี', 2),
      ('คุณนภา', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', 'มัลดีฟส์สวยงามมาก ขอบคุณ Seacare Travel สำหรับทริปฮันนีมูน', 5, 'ทัวร์มัลดีฟส์ 5 ดาว', 3)
    `;
  }

  await sql.end();
  console.log('Migration complete.');
}
