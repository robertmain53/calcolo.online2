"use strict";
/**
 * Simple helper script to inspect calculator/category resolution logic.
 * Run with: npx tsx scripts/debugRoutes.ts
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const calculators_1 = require("../lib/calculators");
const categories = (0, calculators_1.getCategories)();
console.log('Categories:', categories);
for (const category of categories) {
    const meta = calculators_1.categoryMetadata[category];
    const calculators = (0, calculators_1.getCalculatorsByCategory)(category);
    console.log(`\nCategory: ${category}`);
    console.log('  Metadata title:', meta === null || meta === void 0 ? void 0 : meta.title);
    console.log('  Calculators:', calculators.map((calc) => calc.slug));
}
const slugsToCheck = ['roi-calculator', 'ROI-CALCULATOR'];
for (const slug of slugsToCheck) {
    const calculator = (0, calculators_1.getCalculatorBySlug)(slug);
    console.log(`\nSlug lookup "${slug}":`, (_a = calculator === null || calculator === void 0 ? void 0 : calculator.slug) !== null && _a !== void 0 ? _a : 'not found');
}
