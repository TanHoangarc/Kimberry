import React, { useState } from 'react';
import { User } from '../../types';

interface RegisterFormProps {
    onRegisterSuccess: () => void;
    switchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, switchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password || !confirmPassword) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp.');
            return;
        }

        const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = storedUsers.some((u) => u.email === email);

        if (userExists) {
            setError('Email này đã được sử dụng.');
            return;
        }

        const newUser: User = { email, password, role: 'Customer' };
        storedUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(storedUsers));

        localStorage.setItem('user', JSON.stringify({ email }));
        onRegisterSuccess();
    };


    return (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-fade-in">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center p-3 border border-white/20">
                    <span className="text-3xl">✨</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-1">Tạo tài khoản</h2>
                <p className="text-blue-200 text-sm">Tham gia cùng Kimberry Line ngay hôm nay</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-xl text-center backdrop-blur-sm">
                        ⚠️ {error}
                    </div>
                )}
                
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-300 ml-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                        placeholder="user@example.com"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-300 ml-1">Mật khẩu</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-300 ml-1">Xác nhận mật khẩu</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-[#184d47] to-[#20635b] hover:from-[#20635b] hover:to-[#2d8a7e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5 mt-2"
                >
                    Đăng ký
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-sm text-gray-400">
                    Đã có tài khoản?{' '}
                    <button onClick={switchToLogin} className="font-bold text-green-400 hover:text-green-300 transition-colors ml-1">
                        Đăng nhập
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

export default RegisterForm;