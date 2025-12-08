import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        // Basic Validation
        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Use FormSubmit.co for email delivery without SMTP credentials
        // We use the /ajax/ endpoint to keep the user on our site
        const targetEmail = "kiyasgo@gmail.com";
        const formSubmitUrl = `https://formsubmit.co/ajax/${targetEmail}`;

        const response = await fetch(formSubmitUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `[KıyasGO] ${subject}`, // Custom subject
                _template: 'table', // Nice looking email table
                _captcha: 'false', // Disable captcha for cleaner UX (optional)
                name: name,
                email: email,
                message: message
            })
        });

        if (!response.ok) {
            throw new Error('FormSubmit API failed');
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Contact Form Error:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
