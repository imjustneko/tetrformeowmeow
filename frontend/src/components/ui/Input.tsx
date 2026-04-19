import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm text-gray-400 font-medium">{label}</label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 rounded-lg
          bg-[#1a1a28] border border-[#2a2a3a]
          text-white placeholder:text-gray-600
          focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30
          transition-colors duration-200
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}