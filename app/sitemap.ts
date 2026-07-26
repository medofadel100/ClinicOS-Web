import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://clinicoseg.vercel.app'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/en`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/ar`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/en/download`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/ar/download`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/en/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/ar/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/en/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/ar/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]
}
