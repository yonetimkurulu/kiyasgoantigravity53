
import AuthForm from '@/app/components/AuthForm';

export const metadata = {
    title: 'Kayıt Ol - KıyasGO',
    description: 'Yeni hesap oluşturun.',
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black pt-24 pb-12 flex items-center justify-center px-4">
            <AuthForm type="register" />
        </div>
    );
}
