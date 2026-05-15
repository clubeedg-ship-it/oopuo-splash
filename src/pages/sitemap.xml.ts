import { getCollection } from 'astro:content';

const SITE_URL = 'https://oopuo.com';

const staticPages = [
  { url: '/', lastmod: '2025-06-01', priority: '1.0', changefreq: 'weekly' },
  { url: '/enterprise', lastmod: '2025-06-01', priority: '0.9', changefreq: 'monthly' },
  { url: '/about', lastmod: '2025-06-01', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact', lastmod: '2025-06-01', priority: '0.8', changefreq: 'monthly' },
  { url: '/blog', lastmod: '2025-06-01', priority: '0.9', changefreq: 'weekly' },
];

export async function GET() {
  const posts = await getCollection('blog');

  const blogEntries = posts.map((post) => ({
    url: `/blog/${post.data.slug}`,
    lastmod: new Date(post.data.date).toISOString().split('T')[0],
    priority: '0.7',
    changefreq: 'monthly',
  }));

  const allPages = [...staticPages, ...blogEntries];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
