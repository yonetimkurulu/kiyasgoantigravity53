export default function robots() {
    return {
        rules: [
            // Genel kurallar
            { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/profil'] },
            // AI Botlarına özel izin
            { userAgent: 'GPTBot', allow: '/' },
            { userAgent: 'ChatGPT-User', allow: '/' },
            { userAgent: 'Google-Extended', allow: '/' },
            { userAgent: 'ClaudeBot', allow: '/' },
            { userAgent: 'Anthropic-AI', allow: '/' },
            { userAgent: 'PerplexityBot', allow: '/' },
            { userAgent: 'Bingbot', allow: '/' },
        ],
        sitemap: 'https://www.kiyasgo.com/sitemap.xml',
    }
}
