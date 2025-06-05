// src/pages/GantiPassword/GantiPassword.tsx
import React, { useState } from 'react';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import Toast from '../../components/atoms/Toast/Toast';
import { authService } from '../../services/authService'; // Import authService

const GantiPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    passwordLama: '',
    passwordBaru: '',
    konfirmasiPassword: ''
  });

  const [errors, setErrors] = useState<{
    passwordLama?: string;
    passwordBaru?: string;
    konfirmasiPassword?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    passwordLama: false,
    passwordBaru: false,
    konfirmasiPassword: false
  });
  const [toastMessage, setToastMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: {
      passwordLama?: string;
      passwordBaru?: string;
      konfirmasiPassword?: string;
    } = {};
    
    // Validate old password
    if (!formData.passwordLama) {
      newErrors.passwordLama = 'Password lama harus diisi';
    }
    
    // Validate new password
    if (!formData.passwordBaru) {
      newErrors.passwordBaru = 'Password baru harus diisi';
    } else if (formData.passwordBaru.length < 8) {
      newErrors.passwordBaru = 'Password baru minimal 8 karakter';
    } else if (!/(?=.*[A-Z])/.test(formData.passwordBaru)) {
      newErrors.passwordBaru = 'Password baru harus mengandung minimal 1 huruf besar';
    } else if (!/(?=.*\d)/.test(formData.passwordBaru)) {
      newErrors.passwordBaru = 'Password baru harus mengandung minimal 1 angka';
    } else if (formData.passwordBaru === formData.passwordLama) {
      newErrors.passwordBaru = 'Password baru tidak boleh sama dengan password lama';
    }
    
    // Validate password confirmation
    if (!formData.konfirmasiPassword) {
      newErrors.konfirmasiPassword = 'Konfirmasi password harus diisi';
    } else if (formData.passwordBaru !== formData.konfirmasiPassword) {
      newErrors.konfirmasiPassword = 'Konfirmasi password tidak cocok';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Call API to change password
      await authService.changePassword({
        currentPassword: formData.passwordLama,
        newPassword: formData.passwordBaru
      });
      
      // Reset form setelah berhasil
      setFormData({
        passwordLama: '',
        passwordBaru: '',
        konfirmasiPassword: ''
      });
      
      setToastMessage({
        type: 'success',
        message: 'Password berhasil diubah.'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Handle specific error messages
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Gagal mengubah password. Silakan coba lagi.';
      
      setToastMessage({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Determine label and color based on strength
    let label = '';
    let color = '';
    
    if (strength <= 2) {
      label = 'Lemah';
      color = 'bg-red-500';
    } else if (strength <= 4) {
      label = 'Sedang';
      color = 'bg-yellow-500';
    } else {
      label = 'Kuat';
      color = 'bg-green-500';
    }
    
    return {
      strength: Math.min(strength, 6),
      label,
      color
    };
  };

  const passwordStrength = getPasswordStrength(formData.passwordBaru);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Ganti Password</h1>
        <p className="text-gray-600 mt-1">Perbarui password akun Anda untuk keamanan yang lebih baik.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Lama */}
          <div>
            <Input
              label="Password Lama"
              id="passwordLama"
              name="passwordLama"
              type={showPassword.passwordLama ? 'text' : 'password'}
              value={formData.passwordLama}
              onChange={handleChange}
              error={errors.passwordLama}
              required
              className="pr-10"
              appendIcon={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('passwordLama')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword.passwordLama ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              }
            />
          </div>
          
          {/* Password Baru */}
          <div>
            <Input
              label="Password Baru"
              id="passwordBaru"
              name="passwordBaru"
              type={showPassword.passwordBaru ? 'text' : 'password'}
              value={formData.passwordBaru}
              onChange={handleChange}
              error={errors.passwordBaru}
              required
              className="pr-10"
              appendIcon={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('passwordBaru')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword.passwordBaru ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              }
            />
            
            {/* Password strength indicator */}
            {formData.passwordBaru && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Kekuatan Password:</span>
                  <span className="text-xs font-medium" style={{ color: passwordStrength.color === 'bg-red-500' ? '#ef4444' : passwordStrength.color === 'bg-yellow-500' ? '#eab308' : '#22c55e' }}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength.color}`} 
                    style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                  ></div>
                </div>
                
                <ul className="mt-2 space-y-1 text-xs text-gray-500">
                  <li className="flex items-center">
                    <span className={`inline-block w-3 h-3 mr-2 rounded-full ${formData.passwordBaru.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Minimal 8 karakter
                  </li>
                  <li className="flex items-center">
                    <span className={`inline-block w-3 h-3 mr-2 rounded-full ${/[A-Z]/.test(formData.passwordBaru) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Minimal 1 huruf besar
                  </li>
                  <li className="flex items-center">
                    <span className={`inline-block w-3 h-3 mr-2 rounded-full ${/\d/.test(formData.passwordBaru) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Minimal 1 angka
                  </li>
                  <li className="flex items-center">
                    <span className={`inline-block w-3 h-3 mr-2 rounded-full ${/[^A-Za-z0-9]/.test(formData.passwordBaru) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Minimal 1 karakter khusus (misalnya: !@#$%^&*)
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Konfirmasi Password */}
          <div>
            <Input
              label="Konfirmasi Password Baru"
              id="konfirmasiPassword"
              name="konfirmasiPassword"
              type={showPassword.konfirmasiPassword ? 'text' : 'password'}
              value={formData.konfirmasiPassword}
              onChange={handleChange}
              error={errors.konfirmasiPassword}
              required
              className="pr-10"
              appendIcon={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('konfirmasiPassword')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword.konfirmasiPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              }
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Ganti Password
            </Button>
          </div>
        </form>
      </div>
      
      {/* Info Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-sm text-blue-700">
              Pastikan untuk menggunakan password yang kuat dan unik. Jangan gunakan password yang sama dengan akun lain.
            </p>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          message={toastMessage.message}
          onClose={() => setToastMessage(null)}
          duration={5000}
        />
      )}
    </div>
  );
};

export default GantiPassword;