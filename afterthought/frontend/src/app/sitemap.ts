import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://afterthought.com'

  // Try to fetch essays to include in sitemap
  let essays = []
  try {
    const res = await fetch('http://localhost:8000/api/essays/', { next: { revalidate: 3600 } })
    if (res.ok) {
      essays = await res.json()
    }
  } catch (e) {
    console.error("Failed to fetch essays for sitemap", e)
  }

  const essayUrls = essays.map((essay: { slug: string; publication_date: string | null }) => ({
    url: `${baseUrl}/essays/${essay.slug}`,
    lastModified: new Date(essay.publication_date || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/essays`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/themes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/series`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...essayUrls,
  ]
}
