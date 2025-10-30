# Calcolo.online Next.js Starter - SEO Optimized

A world-class Next.js starter template for calculator websites with perfect SEO, E-E-A-T signals, structured data, and automatic sitemap generation.

## 🚀 Features

- ✅ **Perfect SEO**: Automatic metadata, Open Graph, Twitter Cards
- ✅ **Structured Data**: JSON-LD for rich snippets (Organization, Article, FAQ, HowTo, Breadcrumbs)
- ✅ **E-E-A-T Signals**: Author credentials, expertise display, publication dates
- ✅ **Auto-Generated Categories**: Categories populate automatically from calculator data
- ✅ **Auto-Generated Sitemap**: XML sitemap updates automatically on build
- ✅ **TypeScript**: Full type safety
- ✅ **Server-Side Rendering**: Instant SEO visibility
- ✅ **Performance**: Optimized Core Web Vitals
- ✅ **Mobile-First**: Responsive design
- ✅ **Accessibility**: WCAG compliant structure

## 📁 Project Structure

```
calcolo-starter/
├── app/
│   ├── [category]/          # Dynamic category pages (auto-generated)
│   │   └── page.tsx
│   ├── finanza/
│   │   └── roi-calculator/  # Example calculator page
│   │       └── page.tsx
│   ├── layout.tsx           # Root layout with global SEO
│   ├── page.tsx             # Homepage
│   └── globals.css
├── components/
│   └── ROICalculator.tsx    # Example calculator component
├── lib/
│   ├── calculators.ts       # Central calculator database
│   ├── config.ts            # Site configuration
│   └── structured-data.ts   # SEO utilities
├── types/
│   └── calculator.ts        # TypeScript types
├── next.config.js           # Next.js configuration
├── next-sitemap.config.js   # Sitemap configuration
└── package.json
```

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 How to Add a New Calculator

### Step 1: Add Calculator Metadata

Edit `lib/calculators.ts` and add your calculator to the array:

```typescript
{
  slug: 'your-calculator-slug',
  title: 'Your Calculator Title',
  description: 'Detailed description for the page',
  metaDescription: 'SEO-optimized meta description (150-160 chars)',
  category: 'finanza', // or 'ingegneria', 'matematica', etc.
  keywords: [
    'keyword 1',
    'keyword 2',
    'keyword 3',
  ],
  author: defaultAuthors.accountant, // or create custom author
  datePublished: '2025-01-15',
  dateModified: '2025-10-30',
  featured: true, // optional
  schema: 'WebApplication',
}
```

### Step 2: Create Calculator Component

Create `components/YourCalculator.tsx`:

```typescript
'use client';

import { useState } from 'react';

export default function YourCalculator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    // Your calculation logic
    setResult(/* calculated result */);
  };

  return (
    <div className="section-card">
      <h2>Calculator Inputs</h2>
      {/* Your form here */}
      
      {result && (
        <div className="calculator-result">
          {/* Display results */}
        </div>
      )}
    </div>
  );
}
```

### Step 3: Create Calculator Page

Create `app/[category]/[slug]/page.tsx`:

```typescript
import { Metadata } from 'next';
import YourCalculator from '@/components/YourCalculator';
import { getCalculatorBySlug } from '@/lib/calculators';
// ... import schemas

export async function generateMetadata(): Promise<Metadata> {
  const calculator = getCalculatorBySlug('your-calculator-slug');
  // Copy metadata generation from ROI example
}

export default function YourCalculatorPage() {
  const calculator = getCalculatorBySlug('your-calculator-slug');
  
  return (
    <>
      {/* Add structured data scripts */}
      <article>
        {/* Add breadcrumbs, header, author badge */}
        <YourCalculator />
        {/* Add educational content, FAQ, etc. */}
      </article>
    </>
  );
}
```

### Step 4: Build & Deploy

```bash
npm run build
```

The sitemap will automatically include your new calculator!

## 🎯 SEO Best Practices Implemented

### 1. Metadata
- Unique title and description for every page
- Open Graph tags for social sharing
- Twitter Cards
- Canonical URLs
- Keywords array

### 2. Structured Data (JSON-LD)
- **Organization**: Site-wide company info
- **WebSite**: Site links in search
- **SoftwareApplication**: Calculator as tool
- **Article**: E-E-A-T signals
- **Breadcrumb**: Navigation context
- **FAQ**: Featured snippets
- **HowTo**: Step-by-step guides

### 3. E-E-A-T Signals
- Author credentials prominently displayed
- Expert qualifications (degrees, certifications)
- Publication and update dates
- Author bios with experience
- LinkedIn profile links

### 4. Content Strategy
- Educational content on every calculator page
- FAQ sections for featured snippets
- Step-by-step guides
- Interpretation of results
- Related calculators for internal linking
- Trust signals and disclaimers

### 5. Technical SEO
- Server-side rendering (SSR)
- Automatic sitemap generation
- Robots.txt configuration
- Proper heading hierarchy (H1 → H2 → H3)
- Semantic HTML
- Mobile-responsive
- Fast Core Web Vitals

## 🔧 Configuration

### Update Site Info

Edit `lib/config.ts`:

```typescript
export const siteConfig: SiteConfig = {
  name: 'Your Site Name',
  url: 'https://your-domain.com',
  description: 'Your site description',
  organization: {
    name: 'Your Company Name',
    legalName: 'Legal Company Name Srl',
    // ... update all fields
  },
};
```

### Update Authors

Edit `lib/config.ts`:

```typescript
export const defaultAuthors = {
  yourAuthor: {
    name: 'Dr. Your Name',
    role: 'Your Professional Title',
    credentials: 'Your Credentials',
    bio: 'Your professional bio',
    image: '/authors/your-name.jpg',
    linkedIn: 'https://linkedin.com/in/yourprofile',
  },
};
```

### Add Categories

Edit `lib/calculators.ts`:

```typescript
export const categoryMetadata: Record<string, {...}> = {
  yourcategory: {
    title: 'Category Title',
    description: 'Category description',
    icon: '🎯',
  },
};
```

## 🚦 WordPress to Next.js Migration

### Get Your Old URLs

1. Export WordPress sitemap: `/sitemap.xml`
2. Get all calculator URLs from WordPress

### Create Redirects

Edit `next.config.js`:

```javascript
async redirects() {
  return [
    {
      source: '/old-wordpress-path',
      destination: '/category/new-nextjs-path',
      permanent: true, // 301 redirect
    },
    // Add all your old URLs here
  ];
}
```

### Migration Checklist

- [ ] Export all calculator titles, descriptions, content
- [ ] Note all WordPress URLs
- [ ] Create calculator metadata in `lib/calculators.ts`
- [ ] Build calculator components
- [ ] Create calculator pages
- [ ] Add redirects for all old URLs
- [ ] Submit new sitemap to Google Search Console
- [ ] Monitor Search Console for indexing

## 📊 Performance Tips

1. **Images**: Use WebP format, add width/height attributes
2. **Fonts**: System fonts are pre-configured
3. **CSS**: Use Tailwind utilities instead of custom CSS
4. **JavaScript**: Keep calculator logic simple
5. **Build**: Run `npm run build` to check bundle size

## 🔍 SEO Monitoring

After deployment:

1. **Google Search Console**: Submit sitemap, monitor indexing
2. **Check Structured Data**: Use Google's Rich Results Test
3. **Monitor Core Web Vitals**: Use PageSpeed Insights
4. **Track Rankings**: Monitor keyword positions
5. **Check Mobile Usability**: Use Mobile-Friendly Test

## 🆘 Troubleshooting

### Sitemap not generating?
- Run `npm run build` - sitemap generates during build
- Check `next-sitemap.config.js` configuration

### Pages not indexing?
- Check `robots.txt` allows crawling
- Verify canonical URLs are correct
- Submit sitemap to Search Console
- Check for noindex tags

### Poor Core Web Vitals?
- Optimize images (use WebP, proper sizing)
- Minimize JavaScript in calculator components
- Use React.lazy() for large components

## 📄 License

MIT License - feel free to use for your projects

## 🤝 Support

For issues or questions, check:
- Next.js Documentation: https://nextjs.org/docs
- Google Search Central: https://developers.google.com/search
- Schema.org: https://schema.org

---

Built with ❤️ for professional calculators
# calcolo.online2
