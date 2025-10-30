# SEO Best Practices for Calculator Pages

This guide ensures every calculator you add has world-class SEO.

## Title Tag Best Practices

### Formula
```
[Action Verb] + [Primary Keyword] + [Benefit/Result] | Brand
```

### Examples
✅ **GOOD:**
- "Calcolatore ROI (Return on Investment) | Calcolo.online"
- "Calcola l'EBITDA Online - Margine Operativo Lordo | Calcolo.online"
- "Calcolatore Varianza e Deviazione Standard | Calcolo.online"

❌ **BAD:**
- "ROI" (too short, no benefit)
- "Calculator for ROI and Investment Returns with Examples" (too long, keyword stuffing)
- "Calcolo.online - ROI" (brand first is less effective)

### Rules
- Keep 50-60 characters (including brand)
- Include primary keyword
- Front-load important words
- Make it compelling (users must want to click)

## Meta Description Best Practices

### Formula
```
[What it does] + [How it helps] + [Unique value] + [Call to action]
```

### Examples
✅ **GOOD:**
```
Calcolatore ROI gratuito per misurare il ritorno sugli investimenti. Calcola 
la redditività dei progetti aziendali con formule certificate e analisi 
dettagliate. Risultati immediati.
```

❌ **BAD:**
```
ROI calculator. Calculate ROI. Free ROI tool.
(Too short, keyword stuffing, no value proposition)
```

### Rules
- Keep 150-160 characters
- Include primary keyword naturally
- Highlight unique value (free, certified, professional)
- Include call to action or benefit
- Make it compelling - this is your ad in search results

## Keyword Strategy

### Primary Keyword
Choose ONE primary keyword per calculator that:
- Has decent search volume
- Matches user intent
- You can realistically rank for

Example: "calcolatore ROI" or "calcolo ROI online"

### Secondary Keywords
Add 5-10 related keywords:
- Variations of primary keyword
- Related terms users search for
- Long-tail variations

Example for ROI calculator:
```typescript
keywords: [
  'calcolatore ROI',           // Primary
  'return on investment',      // English variant
  'calcolo ROI online',        // Natural variation
  'ritorno investimento',      // Synonym
  'ROI calculator gratis',     // Long-tail
  'come calcolare ROI',        // Question keyword
  'formula ROI',               // Related term
]
```

## Content Structure

Every calculator page MUST have:

### 1. Above the Fold
- H1 with primary keyword
- Clear description (what it does)
- Calculator interface (immediate value)

### 2. Educational Content
Minimum 800-1200 words covering:
- **What** - What is [concept]?
- **Why** - Why is it important?
- **How** - How to calculate/use it?
- **When** - When to use it?
- **Examples** - Real-world examples
- **Interpretation** - How to read results

### 3. FAQ Section
Minimum 4-6 questions covering:
- Basic definition
- How to calculate
- What's a good value
- Common mistakes
- When to use
- Alternatives

### 4. Related Content
- Link to 2-3 related calculators
- Link to category page
- Internal linking strategy

## Structured Data Priority

Every calculator MUST include:

### 1. SoftwareApplication Schema (Required)
```javascript
{
  "@type": "SoftwareApplication",
  name: "Calculator Name",
  description: "What it does",
  applicationCategory: "BusinessApplication",
  offers: {
    price: "0",
    priceCurrency: "EUR"
  }
}
```

### 2. Article Schema (Required for E-E-A-T)
```javascript
{
  "@type": "TechArticle",
  author: {
    "@type": "Person",
    name: "Expert Name",
    jobTitle: "Professional Title",
    description: "Credentials and bio"
  },
  datePublished: "YYYY-MM-DD",
  dateModified: "YYYY-MM-DD"
}
```

### 3. FAQ Schema (Highly Recommended)
Helps get featured snippets:
```javascript
{
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is...?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "..."
      }
    }
  ]
}
```

### 4. HowTo Schema (Optional but Powerful)
For step-by-step guides:
```javascript
{
  "@type": "HowTo",
  name: "How to Calculate X",
  step: [...]
}
```

### 5. Breadcrumb Schema (Required)
For navigation context:
```javascript
{
  "@type": "BreadcrumbList",
  itemListElement: [...]
}
```

## E-E-A-T Signals

Every calculator page MUST show:

### Experience
- "Developed by [Professional Title]"
- Years of experience
- Number of users/calculations performed

### Expertise
- Professional credentials (Ing., Dott., etc.)
- Relevant qualifications
- Technical certifications

### Authoritativeness
- Link to author LinkedIn
- Author bio with relevant background
- Professional affiliations
- Citations to normative sources

### Trustworthiness
- Disclaimer about limitations
- Sources cited (NTC 2018, CEI 64-8, etc.)
- Last updated date
- Contact information
- Privacy policy link

### Author Badge Template
```tsx
<div className="author-badge">
  <div className="author-image">[Photo]</div>
  <div>
    <h3>[Name with credentials]</h3>
    <p>[Professional title]</p>
    <p>[Specific credentials]</p>
    <p>[Brief relevant bio]</p>
    <a href="[LinkedIn]">LinkedIn Profile</a>
  </div>
</div>
```

## Internal Linking Strategy

### From Calculator Pages
Link to:
- Parent category page
- 2-3 related calculators (at bottom of page)
- Homepage
- About page (for E-E-A-T)

### To Calculator Pages
Get links from:
- Category pages (automatic)
- Homepage (if featured)
- Related calculators
- Blog posts (if you add blog)

### Anchor Text Strategy
- Use descriptive anchor text
- Include keywords naturally
- Vary anchor text
- Avoid generic "click here"

Example:
❌ BAD: "Usa anche questo [calcolatore](link)"
✅ GOOD: "Scopri il nostro [calcolatore EBITDA per l'analisi finanziaria](link)"

## Image Optimization

If you add images:
- Use WebP format
- Add descriptive alt text with keywords
- Include width/height attributes
- Optimize file size (<100KB)
- Use descriptive filenames (roi-calculator-example.webp)

## Performance Checklist

Every calculator page should:
- [ ] Load in <2 seconds
- [ ] Have Largest Contentful Paint (LCP) <2.5s
- [ ] Have First Input Delay (FID) <100ms
- [ ] Have Cumulative Layout Shift (CLS) <0.1
- [ ] Score 90+ on PageSpeed Insights (mobile)
- [ ] Be fully functional without JavaScript (for crawlers)

## Content Quality Checklist

Before publishing, verify:
- [ ] Unique title tag (not duplicated anywhere)
- [ ] Unique meta description
- [ ] Primary keyword in H1
- [ ] Secondary keywords in H2/H3
- [ ] 800+ words of original content
- [ ] 4+ FAQ questions
- [ ] Author credentials displayed
- [ ] Publication/update dates shown
- [ ] Internal links to related calculators
- [ ] Structured data validates in testing tool
- [ ] No spelling/grammar errors
- [ ] Mobile responsive
- [ ] All form fields have labels
- [ ] Results are clearly formatted
- [ ] Disclaimer/trust signals present

## Common SEO Mistakes to Avoid

### ❌ Thin Content
Don't create calculator pages with only a form. Add substantial educational content.

### ❌ Duplicate Content
Each calculator must have unique content. Don't copy-paste descriptions.

### ❌ Missing Metadata
Every page needs unique title, description, and structured data.

### ❌ Poor Internal Linking
Don't create orphan pages. Link from related pages.

### ❌ No Author Information
E-E-A-T requires visible expertise. Always show author credentials.

### ❌ Outdated Dates
Keep dateModified current when you update calculators.

### ❌ Keyword Stuffing
Use keywords naturally. Don't force them everywhere.

### ❌ Ignoring Mobile
Test on mobile devices. Most traffic is mobile.

### ❌ Slow Loading
Optimize everything. Speed is a ranking factor.

### ❌ Missing Structured Data
Schema markup helps Google understand your content.

## Keyword Research Process

For each new calculator:

1. **Brainstorm**: List all possible search terms
2. **Research**: Use Google Autocomplete, "People also ask", Related searches
3. **Analyze**: Check search volume (Google Keyword Planner, Ubersuggest)
4. **Assess Competition**: Search your keywords, see who ranks
5. **Select**: Choose 1 primary + 5-10 secondary keywords
6. **Map**: Assign keywords to specific sections of content

## Content Outline Template

Use this structure for every calculator:

```markdown
# [Primary Keyword] | Brand

[Meta description with keyword and benefit]

## Above Fold
- H1 with primary keyword
- 2-sentence description
- Calculator interface

## What is [Concept]? (H2)
- Definition
- Importance
- Use cases

## How to Calculate [Concept] (H2)
- Formula explanation
- Variables explained
- Example calculation

## [Calculator Interface]

## Interpreting Results (H2)
- What results mean
- Good vs bad values
- Action items based on results

## Practical Applications (H2)
- Industry-specific uses
- Real-world examples
- Best practices

## Frequently Asked Questions (H2)
- [Question 1]
- [Question 2]
- [Question 3]
- [Question 4]

## Related Calculators (H2)
- Link to related calculator 1
- Link to related calculator 2
- Link to related calculator 3

## Disclaimer (H2)
- Limitations
- Professional advice recommendation
```

## Launch Checklist

Before making a calculator live:

- [ ] SEO
  - [ ] Unique title & meta description
  - [ ] Keywords mapped to content
  - [ ] Structured data added & validated
  - [ ] Canonical URL set
  - [ ] Author information complete

- [ ] Content
  - [ ] 800+ words written
  - [ ] FAQ section with 4+ questions
  - [ ] Examples provided
  - [ ] All sections complete

- [ ] Technical
  - [ ] Calculator functionality tested
  - [ ] Mobile responsive
  - [ ] No console errors
  - [ ] Forms have proper labels
  - [ ] Results format correctly

- [ ] E-E-A-T
  - [ ] Author credentials displayed
  - [ ] Publication date shown
  - [ ] Sources cited where relevant
  - [ ] Disclaimer included

- [ ] Links
  - [ ] Internal links to related pages
  - [ ] Link from category page (automatic)
  - [ ] Breadcrumbs working
  - [ ] No broken links

- [ ] Testing
  - [ ] PageSpeed score 90+
  - [ ] Rich Results Test passed
  - [ ] Mobile-Friendly Test passed
  - [ ] Functionality works correctly

---

Follow these guidelines for every calculator to ensure maximum SEO value and user satisfaction.
