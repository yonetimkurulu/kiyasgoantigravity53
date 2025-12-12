/** @type {import('next').NextConfig} */
const nextConfig = {
    // Debugging: Log Env Vars (Hidden in production usually, but visible in build logs)
    onDemandEntries: {
        // Make sure this doesn't break build
    },
}

console.log("--- WORKAROUND DEBUG ---");
console.log("NEXT_PUBLIC_SUPABASE_URL Exists?", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY Exists?", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log("--- DEBUG END ---");

module.exports = nextConfig