const supabase = require('./supabase');
const axios = require('axios');

async function saveProduct(productData) {
    const { name, price, image_url, source_link } = productData;

    try {
        let publicImageUrl = image_url;

        // 1. Upload Image to Supabase Storage if it's a remote URL
        if (image_url && image_url.startsWith('http')) {
            try {
                const response = await axios.get(image_url, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data, 'binary');
                const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, buffer, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                if (!uploadError) {
                    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                    publicImageUrl = data.publicUrl;
                } else {
                    console.error(`⚠️ Image upload failed: ${uploadError.message}`);
                }
            } catch (err) {
                console.error(`⚠️ Failed to download/upload image: ${err.message}`);
            }
        }

        // 2. Upsert Product to Database
        const { error: dbError } = await supabase
            .from('products')
            .upsert({
                name: name,
                price: price,
                image: publicImageUrl, // Use the new Supabase URL if uploaded, else fallback
                link: source_link,
                source: 'railway_bot',
                updated_at: new Date().toISOString()
            }, { onConflict: 'name' });

        if (dbError) {
            console.error(`❌ DB Error for ${name}: ${dbError.message}`);
            return false;
        }

        console.log(`✅ Saved: ${name} (${price} TL)`);
        return true;

    } catch (error) {
        console.error(`❌ Unexpected error saving ${name}: ${error.message}`);
        return false;
    }
}

module.exports = saveProduct;
