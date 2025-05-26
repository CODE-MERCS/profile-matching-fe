// src/components/atoms/Dropdown/Dropdown.tsx
import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: number | string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: number | string;
  onChange: (value: number | string) => void;
  placeholder?: string;
  width?: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Pilih',
  width = 'auto',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(option => option.value === value);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  const handleSelect = (option: DropdownOption) => {
    onChange(option.value);
    setIsOpen(false);
  };
  
  return (
    <div 
      className="relative"
      ref={dropdownRef}
      style={{ width }}
    >
      <button
        type="button"
        className={`w-full inline-flex justify-between items-center px-3 py-2 border ${
          disabled ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-700'
        } rounded-md shadow-sm text-sm ${
          isOpen ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-300'
        }`}
        onClick={toggleDropdown}
        disabled={disabled}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className={`ml-2 h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md max-h-60 overflow-auto border border-gray-200">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                  option.value === value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                }`}
              >
                {option.label}
              </li>
            ))}
            
            {options.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">
                Tidak ada opsi
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;