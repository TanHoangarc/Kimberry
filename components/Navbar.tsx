
import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';

interface NavbarProps {
  setActiveView: (view: ViewType) => void;
}

const NavButton: React.FC<{ 
  onClick: () => void; 
  children: React.ReactNode, 
  isAdmin?: boolean;
  isSpecial?: boolean;
}> = ({ onClick, children, isAdmin = false, isSpecial = false }) => {
    const baseClasses = "font-semibold m-2 px-5 py-3 rounded-lg text-sm transition-colors duration-300 shadow-sm";
    let colorClasses = "";

    if (isAdmin) {
        colorClasses = 'bg-red-600 text-white hover:bg-red-700';
    } else if (isSpecial) {
        colorClasses = 'bg-amber-500 text-white hover:bg-amber-600';
    } else {
        colorClasses = 'bg-[#a8d0a2] text-gray-800 hover:bg-[#5c9ead] hover:text-white';
    }
    
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${colorClasses}`}
      >
        {children}
      </button>
    );
};


const Navbar: React.FC<NavbarProps> = ({ setActiveView }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [canViewMblPayment, setCanViewMblPayment] = useState(false);

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      // This list can be expanded with more authorized emails
      const mblPaymentUsers = ['finance@kimberryline.com', 'doc@kimberry.com']; 

      if (user.email === 'tanhoangarc@gmail.com') {
        setIsAdmin(true);
        setCanViewMblPayment(true); // Admin can see everything
      } else if (mblPaymentUsers.includes(user.email)) {
        setCanViewMblPayment(true);
      }
    }
  }, []);

  return (
    <nav className="flex justify-center flex-wrap bg-white p-2 shadow-md sticky top-0 z-20">
      <NavButton onClick={() => setActiveView('tariff')}>Tariff Vietnam</NavButton>
      <NavButton onClick={() => setActiveView('handbook')}>Tài khoản Kimberry</NavButton>
      <NavButton onClick={() => setActiveView('policies')}>Hồ sơ Hoàn cược</NavButton>
      <NavButton onClick={() => setActiveView('template')}>File mẫu CVHC</NavButton>
      <NavButton onClick={() => setActiveView('marketing')}>Tra cứu Job</NavButton>
      <NavButton onClick={() => setActiveView('submission')}>Nộp hồ sơ hoàn cược</NavButton>
      {canViewMblPayment && (
        <NavButton onClick={() => setActiveView('mblPayment')} isSpecial={true}>
            💳 Thanh toán MBL
        </NavButton>
      )}
      {isAdmin && (
        <>
          <NavButton onClick={() => setActiveView('admin')} isAdmin={true}>
            ⚙️ Quản lý User
          </NavButton>
          <NavButton onClick={() => setActiveView('dataEntry')} isAdmin={true}>
            📝 Nhập liệu
          </NavButton>
        </>
      )}
    </nav>
  );
};

export default Navbar;