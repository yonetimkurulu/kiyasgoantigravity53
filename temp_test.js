const { fetchVariantsAction } = require('./app/actions/variantActions');

// Mock getBaseName logic from component (roughly)
const getBaseName = (name) => {
    if (!name) return "";
    return name
        .toLowerCase()
        .replace(/^(apple|samsung|xiaomi|huawei|oppo|vivo|realme|oneplus|general mobile|reeder|casper|honor|poco|tecno|infinix|google|asus|sony|vestel|omix)\s+/gi, '')
        .replace(/\s(16|32|64|128|256|512)\s?gb|1\s?tb/gi, '')
        .replace(/\s\d{1,2}\s?gb\s?ram/gi, '')
        .replace(/[\(\)\[\]]/g, '')
        .replace(/(\s|^)(5g|4g|lte)(\s|$)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
};

async function test() {
    const productName = "Samsung Galaxy S24 Ultra 256 GB";
    const baseName = getBaseName(productName);
    console.log(`Base Name: "${baseName}"`);

    // We can't import server actions in a standalone node script easily without Next.js context usually, 
    // but let's try or duplicate the logic.
    // Actually, we can't run 'use server' files in node directly. 
    // I will duplicate the logic of variantActions here to test the query.
}
// ... wait, I already have debug_variants.js which does exactly this.
