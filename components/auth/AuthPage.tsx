
import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthPageProps {
    onLoginSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
    const [view, setView] = useState<'login' | 'register'>('login');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const switchToRegister = () => setView('register');
    const switchToLogin = () => setView('login');

    // Effect to track mouse movement for parallax background
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Calculate movement value (small range for subtle effect)
            // Range: -20px to +20px based on screen position
            const x = (e.clientX / window.innerWidth - 0.5) * 40;
            const y = (e.clientY / window.innerHeight - 0.5) * 40;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans bg-black">
            {/* Background Image with Parallax Effect */}
            <div 
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-100 ease-out will-change-transform"
                style={{ 
                    backgroundImage: "url('https://3jtqcr0thkwcmrlm.public.blob.vercel-storage.com/image-150.jpg')",
                    filter: "brightness(0.85)",
                    transform: `scale(1.1) translate(${-mousePos.x}px, ${-mousePos.y}px)` // Scale 1.1 ensures edges don't show when moving
                }}
            ></div>

            {/* Auth Card Container */}
            <div className="relative z-10 w-full max-w-md px-4">
                {view === 'login' ? (
                    <LoginForm onLoginSuccess={onLoginSuccess} switchToRegister={switchToRegister} />
                ) : (
                    <RegisterForm onRegisterSuccess={onLoginSuccess} switchToLogin={switchToLogin} />
                )}
                
                {/* Footer Text */}
                <div className="mt-8 text-center text-white/40 text-xs">
                    <p>&copy; {new Date().getFullYear()} Kimberry Merchant Line. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
