
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
                    backgroundImage: "url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop')",
                    filter: "brightness(0.6)",
                    transform: `scale(1.1) translate(${-mousePos.x}px, ${-mousePos.y}px)` // Scale 1.1 ensures edges don't show when moving
                }}
            ></div>

            {/* Big Typography Background */}
            <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <h1 
                    className="text-[15vw] font-black tracking-widest uppercase whitespace-nowrap bg-gradient-to-t from-white/0 via-white/40 to-white/80 text-transparent bg-clip-text" 
                    style={{ 
                        mixBlendMode: 'overlay',
                        // Sync exactly with background (Same scale and translation direction)
                        transform: `scale(1.1) translate(${-mousePos.x}px, ${-mousePos.y}px)`
                    }}
                >
                KIMBERRY
                </h1>
            </div>

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
