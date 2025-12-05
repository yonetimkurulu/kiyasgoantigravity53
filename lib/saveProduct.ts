
import { supabaseAdmin } from './supabase';

interface ProductData {
    title: string;
    price: number;
    image: string | null;
    link: string | null;
    source: string;
}

export async function saveProduct(product: ProductData) {
    try {
        let publicImageUrl = product.image;

        // 1. Upload Image to Supabase Storage if it exists
        if (product.image && product.image.startsWith('http')) {
            try {
                const imageRes = await fetch(product.image);
                if (imageRes.ok) {
                    const imageBuffer = await imageRes.arrayBuffer();
                    const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

                    const { error: uploadError } = await supabaseAdmin
                        .storage
                        .from('product-images')
                        .upload(fileName, imageBuffer, {
                            contentType: 'image/jpeg',
                            upsert: true
                        });

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabaseAdmin
                            .storage
                            .from('product-images')
                            .getPublicUrl(fileName);

                        publicImageUrl = publicUrl;
                    } else {
                        console.error('Image upload error:', uploadError);
                    }
                }
            } catch (err) {
                console.error('Image fetch error:', err);
            }
        }

        // 2. Insert/Update Product in DB
        // Assuming table 'products' has columns: name, price, image, link, source, updated_at
        // And 'name' or 'link' is unique or we use a slug.
        // Logic: If product name exists, update it.

        // We'll upsert based on 'name' as a simple unique identifier for now, 
        // or better, generate a slug.

        const { data, error } = await supabaseAdmin
            .from('products')
            .upsert({
                name: product.title,
                price: product.price,
                image: publicImageUrl, // Use the new storage URL or original if upload failed
                link: product.link,
                source: 'akakce',
                updated_at: new Date().toISOString()
            }, { onConflict: 'name' }) // Ensure 'name' is unique in DB or add specific constraint
            .select();

        if (error) {
            throw new Error(`DB Insert Error: ${error.message}`);
        }

        return { success: true, product: data };

    } catch (error) {
        console.error('saveProduct error:', error);
        return { success: false, error };
    }
}
