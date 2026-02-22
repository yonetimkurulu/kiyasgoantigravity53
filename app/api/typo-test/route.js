import { NextResponse } from 'next/server'
import { normalizeQuery, suggestCorrections } from '@/app/utils/typo'

export async function GET() {
    const samples = [
        'appel iphone',
        'samsun tv',
        'xiomi phone',
        'macbok pro',
        'roborok süpürge'
    ];

    const results = samples.map(q => {
        const { normalized, changed } = normalizeQuery(q);
        const corrections = suggestCorrections(q, 2);
        return { query: q, normalized, changed, corrections };
    });

    return NextResponse.json({ ok: true, results });
}
