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
        return [
            {
                source: '/api/v1/:path*',
                destination:
                    process.env.NODE_ENV === 'development'
                        ? 'http://127.0.0.1:8000/api/v1/:path*'
                        : '/api/v1/:path*',
            },
        ]
    },
}

module.exports = nextConfig