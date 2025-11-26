
import React, { useState, useEffect } from 'react';

interface LoginFormProps {
    onLoginSuccess: () => void;
    switchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, switchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Vui lòng điền cả email và mật khẩu.');
            return;
        }

        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const user = storedUsers.find((u: any) => u.email === email);

        if (user && user.password === password) {
            localStorage.setItem('user', JSON.stringify({ email: user.email }));

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            onLoginSuccess();
        } else {
            setError('Email hoặc mật khẩu không chính xác.');
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-fade-in">
            <div className="text-center mb-8">
                <div className="w-28 h-28 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center p-5 border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <img 
                        src="https://i.ibb.co/Lm6Bcb2/kim.png" 
                        alt="Kimberry Logo" 
                        className="w-full h-full object-contain drop-shadow-md"
                    />
                </div>
                <h2 className="text-3xl font-bold text-white mb-1">Chào mừng trở lại</h2>
                <p className="text-blue-200 text-sm">Đăng nhập để truy cập hệ thống Kimberry</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-xl text-center backdrop-blur-sm">
                        ⚠️ {error}
                    </div>
                )}
                
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-300 ml-1">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                            placeholder="user@kimberry.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-300 ml-1">Mật khẩu</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-green-500 focus:ring-green-400 border-gray-600 rounded bg-white/10"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300 cursor-pointer select-none">
                            Ghi nhớ đăng nhập
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-[#184d47] to-[#20635b] hover:from-[#20635b] hover:to-[#2d8a7e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5"
                >
                    Đăng nhập ngay
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-sm text-gray-400">
                    Chưa có tài khoản?{' '}
                    <button onClick={switchToRegister} className="font-bold text-green-400 hover:text-green-300 transition-colors ml-1">
                        Đăng ký tài khoản mới
                    </button>
                </p>
            </div>
            
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default LoginForm;
