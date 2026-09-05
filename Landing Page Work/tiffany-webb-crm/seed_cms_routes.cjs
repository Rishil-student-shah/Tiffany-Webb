const mysql = require('mysql2/promise');

async function seed() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '@rishil8124shah',
    database: 'tiffany_crm',
    waitForConnections: true,
    connectionLimit: 10
  });

  console.log('--- Seeding missing CMS routes into website_pages ---');

  const pagesToEnsure = [
    { slug: 'speaking', name: 'Keynotes & Workshops', meta_title: 'Keynotes & Workshops | Tiffany Webb', meta_description: 'Transforming clinical insight into high-impact keynotes and interactive workshops on problem gambling and youth digital safety.' },
    { slug: 'consulting', name: 'Advisory & Corporate Practice', meta_title: 'Advisory & Corporate Practice | Tiffany Webb', meta_description: 'Executive advisory and strategic consulting for healthcare networks, state agencies, and community coalitions using the GEAR Method™.' },
    { slug: 'thought-leadership', name: 'Thought Leadership & Media', meta_title: 'Thought Leadership & Media Kit | Tiffany Webb', meta_description: 'Frontline essays, approved biographies, press assets, and authoritative commentary on behavioral health and gambling prevention.' },
    { slug: 'contact', name: 'VIP Inbound & Booking', meta_title: 'VIP Inbound & Booking | Tiffany Webb', meta_description: 'Bring Tiffany Webb to your stage, conference, clinic, or team. Submit an inquiry for keynotes, workshops, and strategic consulting.' }
  ];

  for (const p of pagesToEnsure) {
    const [existing] = await pool.query('SELECT id FROM website_pages WHERE slug = ?', [p.slug]);
    if (existing.length === 0) {
      const [res] = await pool.query(
        'INSERT INTO website_pages (slug, name, meta_title, meta_description, is_active) VALUES (?, ?, ?, ?, 1)',
        [p.slug, p.name, p.meta_title, p.meta_description]
      );
      console.log(`+ Added website_page: ${p.slug} (ID: ${res.insertId})`);
    } else {
      console.log(`= website_page already exists: ${p.slug} (ID: ${existing[0].id})`);
    }
  }

  console.log('Seeding completed successfully.');
  await pool.end();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
