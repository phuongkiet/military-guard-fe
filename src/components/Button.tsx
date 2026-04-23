import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseStyle = "px-4 py-2 font-semibold rounded shadow-sm transition-all active:scale-95";
  
  const variants = {
    primary: "bg-military-900 text-white hover:bg-military-800 focus:ring-2 focus:ring-military-800 focus:ring-offset-2",
    accent: "bg-brass-500 text-white hover:bg-brass-600 focus:ring-2 focus:ring-brass-500",
    outline: "border-2 border-military-900 text-military-900 hover:bg-military-50"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};