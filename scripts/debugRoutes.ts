/**
 * Simple helper script to inspect calculator/category resolution logic.
 * Run with: npx tsx scripts/debugRoutes.ts
 */

import {
  getCategories,
  getCalculatorsByCategory,
  categoryMetadata,
  getCalculatorBySlug,
} from '../lib/calculators';

const categories = getCategories();
console.log('Categories:', categories);

for (const category of categories) {
  const meta = categoryMetadata[category];
  const calculators = getCalculatorsByCategory(category);
  console.log(`\nCategory: ${category}`);
  console.log('  Metadata title:', meta?.title);
  console.log('  Calculators:', calculators.map((calc) => calc.slug));
}

const slugsToCheck = ['calcolo-roi-return-on-investment', 'ROI'];
for (const slug of slugsToCheck) {
  const calculator = getCalculatorBySlug(slug);
  console.log(`\nSlug lookup "${slug}":`, calculator?.slug ?? 'not found');
}
