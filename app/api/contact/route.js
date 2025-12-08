import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        // Basic Validation
        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Email Transport Configuration
        // USER MUST PROVIDE THESE ENV VARIABLES
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS;

        if (!user || !pass) {
            console.error("⚠️ SMTP Credentials Missing! Please add EMAIL_USER and EMAIL_PASS to .env.local");

            // For development safety, if no creds, we simulate success but log to console
            console.log("--------------- MOCK EMAIL SENT ---------------");
            console.log(`From: ${name} <${email}>`);
            console.log(`Subject: ${subject}`);
            console.log(`Message: ${message}`);
            console.log("-----------------------------------------------");

            // Return success so the UI text doesn't look broken during dev
            return NextResponse.json({ success: true, mock: true });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user,
                pass,
            },
        });

        const mailOptions = {
            from: `"${name}" <${email}>`, // Sensible sender name, though often overridden by Gmail
            to: 'kiyasgo@gmail.com', // Target email
            replyTo: email,
            subject: `[KıyasGO Form] ${subject}`,
            text: `
İsim: ${name}
E-posta: ${email}
Konu: ${subject}

Mesaj:
${message}
            `,
            html: `
                <h3>Yeni İletişim Formu Mesajı</h3>
                <p><strong>İsim:</strong> ${name}</p>
                <p><strong>E-posta:</strong> ${email}</p>
                <p><strong>Konu:</strong> ${subject}</p>
                <hr/>
                <p><strong>Mesaj:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Email Send Error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
