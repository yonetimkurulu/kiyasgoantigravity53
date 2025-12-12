
import AuthForm from '@/app/components/AuthForm';

export const metadata = {
    title: 'Giriş Yap - KıyasGO',
    description: 'Hesabınıza giriş yapın.',
};

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black pt-24 pb-12 flex items-center justify-center px-4">
            <AuthForm type="login" />
        </div>
    );
}
