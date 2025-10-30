/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://calcolo.online',
  generateRobotsTxt: true,
  generateIndexSitemap: false, // For smaller sites, single sitemap is fine
  exclude: ['/api/*', '/admin/*'], // Exclude paths you don't want indexed
  
  // Robots.txt options
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/api/', '/admin/'],
      },
    ],
    additionalSitemaps: [
      // Add additional sitemaps here if needed
    ],
  },
  
  // Change frequency and priority defaults
  changefreq: 'weekly',
  priority: 0.7,
  
  // Transform function to customize each sitemap entry
  transform: async (config, path) => {
    // Homepage gets highest priority
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }
    const calculatorSegments = [
      'ingegneria-strutturale',
      'sicurezza-cantiere',
      'acustica-termotecnica',
      'elettrotecnica',
      'ingegneria-idraulica',
      'ingegneria-geotecnica',
      'finanza-business',
      'topografia-matematica',
      'convertitori-tecnici',
      'strumenti-quotidiani',
      'guide',
    ];
    
    // Calculator pages get high priority
    if (calculatorSegments.some((segment) => path.includes(`/${segment}/`))) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }
    
    // Category pages get medium-high priority
    if (path.match(/^\/[^\/]+$/)) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }
    
    // Default
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
