# WordPress to Next.js Migration Checklist

Use this checklist to ensure a smooth migration from WordPress to Next.js without losing SEO value.

## Pre-Migration (WordPress)

### 1. Data Export
- [ ] Export complete WordPress sitemap from `/sitemap.xml`
- [ ] Save all calculator URLs in a spreadsheet
- [ ] Export all page content (titles, descriptions, body text)
- [ ] Export all images and save locally
- [ ] Note all category structures
- [ ] Document all custom fields/metadata

### 2. SEO Audit
- [ ] Document current Google rankings for top keywords
- [ ] Save Google Analytics baseline data
- [ ] Export backlinks report (from Search Console or Ahrefs)
- [ ] Take screenshots of current SERP appearances
- [ ] Note current Domain Authority/Page Authority scores

### 3. Backup
- [ ] Full WordPress backup (database + files)
- [ ] Export WordPress XML
- [ ] Save copy of robots.txt
- [ ] Save copy of .htaccess redirects

## Next.js Setup

### 4. Initial Configuration
- [ ] Clone this starter template
- [ ] Update `lib/config.ts` with your site info
- [ ] Update `lib/config.ts` with your company info
- [ ] Update author credentials in `lib/config.ts`
- [ ] Set SITE_URL in `.env` file
- [ ] Add Google verification code

### 5. Content Migration
- [ ] Add all categories to `lib/calculators.ts` → `categoryMetadata`
- [ ] Create calculator metadata for EACH calculator in `lib/calculators.ts`
- [ ] Copy calculator logic from WordPress to React components
- [ ] Create page files for each calculator in `app/[category]/[slug]/page.tsx`
- [ ] Copy all educational content to calculator pages
- [ ] Add FAQ sections to each calculator
- [ ] Add author information to each calculator

### 6. URL Mapping & Redirects
- [ ] Map EVERY WordPress URL to its Next.js equivalent
- [ ] Add 301 redirects in `next.config.js` for ALL old URLs
- [ ] Test redirects locally with curl or browser
- [ ] Document URL changes in spreadsheet

Example redirect structure:
```javascript
{
  source: '/calcolatori/roi', // Old WordPress URL
  destination: '/finanza/roi-calculator', // New Next.js URL
  permanent: true,
}
```

### 7. SEO Elements
- [ ] Verify unique title tag for every page
- [ ] Verify unique meta description for every page
- [ ] Add keywords array for each calculator
- [ ] Ensure canonical URLs are correct
- [ ] Add structured data (JSON-LD) to all pages
- [ ] Add breadcrumb navigation to all pages
- [ ] Include author badges with credentials

### 8. Images & Assets
- [ ] Optimize all images (convert to WebP)
- [ ] Add proper alt text to all images
- [ ] Add width/height attributes
- [ ] Create Open Graph images for main pages
- [ ] Add favicon and app icons

## Testing

### 9. Local Testing
- [ ] Run `npm run dev` and test all pages load
- [ ] Test all calculator functionality works
- [ ] Test all redirects work correctly
- [ ] Verify mobile responsiveness
- [ ] Test all internal links work
- [ ] Check for console errors/warnings

### 10. Build Testing
- [ ] Run `npm run build` successfully
- [ ] Check for build errors
- [ ] Verify sitemap.xml generates correctly
- [ ] Verify robots.txt generates correctly
- [ ] Test production build locally with `npm start`

### 11. SEO Testing
- [ ] View page source (not inspect element) - verify full HTML present
- [ ] Use Google's Rich Results Test on key pages
- [ ] Use PageSpeed Insights - aim for 90+ score
- [ ] Use Mobile-Friendly Test
- [ ] Test Core Web Vitals
- [ ] Verify structured data with Schema Markup Validator

## Deployment

### 12. Pre-Launch
- [ ] Deploy to staging environment first
- [ ] Test all pages on staging
- [ ] Test all redirects on staging
- [ ] Run full site crawl with Screaming Frog
- [ ] Fix any issues found in crawl

### 13. Launch Day
- [ ] Deploy to production
- [ ] Immediately submit new sitemap to Google Search Console
- [ ] Submit new sitemap to Bing Webmaster Tools
- [ ] Test sample of old URLs redirect correctly
- [ ] Monitor server logs for 404 errors
- [ ] Check Google Analytics is tracking

### 14. Search Console Setup
- [ ] Add property in Google Search Console
- [ ] Verify ownership
- [ ] Submit XML sitemap
- [ ] Request indexing for homepage
- [ ] Request indexing for top 10 pages
- [ ] Set up email alerts for issues

## Post-Launch Monitoring

### 15. Week 1
- [ ] Check Google Search Console daily for coverage issues
- [ ] Monitor for 404 errors in server logs
- [ ] Check for crawl errors in Search Console
- [ ] Verify pages are being indexed (use site: search)
- [ ] Monitor rankings for top keywords

### 16. Week 2-4
- [ ] Compare traffic to pre-migration baseline
- [ ] Check for ranking changes in Search Console
- [ ] Monitor Core Web Vitals
- [ ] Fix any indexing issues that appear
- [ ] Add missing redirects if 404s are found

### 17. Month 2-3
- [ ] Compare rankings to pre-migration data
- [ ] Analyze traffic patterns in Analytics
- [ ] Check for improvements in Core Web Vitals
- [ ] Review click-through rates in Search Console
- [ ] Optimize low-performing pages

## Common Issues & Solutions

### If Traffic Drops:
1. Check if pages are indexed (site:yourdomain.com)
2. Verify all redirects are working
3. Check robots.txt isn't blocking crawlers
4. Ensure canonical URLs are correct
5. Request re-indexing in Search Console

### If Pages Not Indexing:
1. Submit sitemap again in Search Console
2. Use URL Inspection Tool to see what Google sees
3. Check for noindex tags
4. Verify server-side rendering is working
5. Ensure content is substantial (not thin)

### If Rankings Drop:
1. Check if old URLs are redirecting properly
2. Verify content quality matches or exceeds WordPress
3. Ensure E-E-A-T signals are present
4. Check for technical SEO issues
5. Monitor Core Web Vitals

## Success Metrics

Your migration is successful when:
- [ ] All pages are indexed (check Search Console coverage)
- [ ] 95%+ of old URLs redirect correctly (check server logs)
- [ ] Traffic recovers to 90%+ of pre-migration levels
- [ ] Core Web Vitals are in "Good" range
- [ ] Rankings are stable or improving
- [ ] No manual actions in Search Console

## Timeline Expectations

- **Days 1-7**: Some fluctuation is normal
- **Weeks 2-4**: Should see stabilization
- **Months 2-3**: Should be back to baseline or better
- **Months 3-6**: Should see improvements from better technical SEO

Remember: A temporary dip is normal during migration. The key is proper redirects, quality content, and strong technical SEO to recover quickly.
