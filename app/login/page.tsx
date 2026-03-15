'use client';
import LoginForm from '@/app/components/auth/LoginForm';
import '@styles/scss/LoginForm.scss';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoginForm />
    </div>
  );
}