
import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface AdminPanelContentProps {
  back: () => void;
}

const AdminPanelContent: React.FC<AdminPanelContentProps> = ({ back }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showPasswords, setShowPasswords] = useState(false); // State to toggle password visibility
  const adminEmail = 'tanhoangarc@gmail.com';

  useEffect(() => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(storedUsers);
    } catch (error) {
      console.error("Failed to parse user data in Admin Panel:", error);
      setUsers([]); // Fallback to an empty list on error
    }
  }, []);

  const handleRoleChange = (email: string, newRole: 'Admin' | 'Document' | 'Customer') => {
    const updatedUsers = users.map(user => {
      if (user.email === email) {
        return { ...user, role: newRole };
      }
      return user;
    });
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleDeleteUser = (emailToDelete: string) => {
    if (emailToDelete === adminEmail) {
      alert("Không thể xóa tài khoản Admin.");
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${emailToDelete}?`)) {
      const updatedUsers = users.filter(user => user.email !== emailToDelete);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  };

  const roleBadgeStyles: Record<User['role'], string> = {
    Admin: 'bg-green-500/20 text-green-400 border-green-500/40',
    Document: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    Customer: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
         <div className="flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
                <h4 className="font-bold text-blue-300">Quản trị viên</h4>
                <p className="text-sm text-blue-200/80">Quản lý người dùng và phân quyền truy cập hệ thống.</p>
            </div>
         </div>
         
         <button 
            onClick={() => setShowPasswords(!showPasswords)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${showPasswords ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'}`}
         >
            <span>{showPasswords ? '🙈' : '👁️'}</span>
            {showPasswords ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
         </button>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-white/10 text-green-300 uppercase text-xs tracking-wider border-b border-white/10">
                <th className="p-5 font-bold">Email Người dùng</th>
                <th className="p-5 font-bold">Mật khẩu</th>
                <th className="p-5 font-bold">Vai trò hiện tại</th>
                <th className="p-5 font-bold">Điều chỉnh quyền</th>
                <th className="p-5 font-bold text-right">Hành động</th>
                </tr>
            </thead>
            <tbody className="text-gray-200">
                {users.map((user) => (
                <tr key={user.email} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-5 align-middle">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {user.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{user.email}</span>
                        </div>
                    </td>
                    <td className="p-5 align-middle">
                        {showPasswords ? (
                            <code className="bg-black/30 px-2 py-1 rounded text-yellow-300 font-mono text-sm border border-white/10">
                                {user.password}
                            </code>
                        ) : (
                            <span className="text-gray-500 text-lg tracking-widest">••••••••</span>
                        )}
                    </td>
                    <td className="p-5 align-middle">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${roleBadgeStyles[user.role]}`}>
                            {user.role}
                        </span>
                    </td>
                    <td className="p-5 align-middle">
                    {user.email !== adminEmail ? (
                        <div className="relative w-full max-w-[150px]">
                            <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.email, e.target.value as User['role'])}
                                className="w-full appearance-none bg-white/10 border border-white/20 text-white py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent cursor-pointer hover:bg-white/20 transition-colors font-medium text-sm shadow-sm"
                                style={{ colorScheme: 'dark' }} // Force dark dropdown on browser
                            >
                                <option value="Customer" className="bg-gray-800">Customer</option>
                                <option value="Document" className="bg-gray-800">Document</option>
                                <option value="Admin" className="bg-gray-800">Admin</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/70">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    ) : (
                        <span className="text-gray-500 italic text-sm flex items-center gap-1">
                            🔒 Mặc định
                        </span>
                    )}
                    </td>
                    <td className="p-5 align-middle text-right">
                        <button
                            onClick={() => handleDeleteUser(user.email)}
                            disabled={user.email === adminEmail}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed group-hover:shadow-md"
                            title="Xóa người dùng"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
      
      {users.length === 0 && (
          <div className="text-center py-10 bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-400">
            Không tìm thấy người dùng nào.
          </div>
      )}
    </div>
  );
};

export default AdminPanelContent;
