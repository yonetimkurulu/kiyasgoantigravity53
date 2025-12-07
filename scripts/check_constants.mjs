
import { ELECTRONICS_SUBCATEGORIES } from './app/data.js';

console.log("Subcategories in data.js:");
ELECTRONICS_SUBCATEGORIES.forEach(s => console.log(`${s.label}: '${s.id}'`));
