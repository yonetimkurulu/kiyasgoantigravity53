/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
    modularizeImports: {
        'lucide-react': {
            transform: 'lucide-react/dist/esm/icons/{{lowerCase member}}',
        },
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
        ]
    },
    async rewrites() {
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/api/v1/:path*',
                    destination: 'http://127.0.0.1:8000/api/v1/:path*',
                },
            ]
        }
        return []
    },
}

module.exports = nextConfig