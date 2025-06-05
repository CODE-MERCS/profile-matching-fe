// src/components/organisms/PekerjaanForm/PekerjaanForm.tsx
import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/Input/Input';
// Definisi interface Pekerjaan langsung di file ini
interface Pekerjaan {
  id_pekerjaan: number;
  namapekerjaan: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PekerjaanFormProps {
  initialData: Pekerjaan | null;
  onSubmit: (data: { namapekerjaan: string }) => Promise<void>;
  onCancel: () => void;
}

const PekerjaanForm: React.FC<PekerjaanFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    namapekerjaan: ''
  });
  
  const [errors, setErrors] = useState<{
    namapekerjaan?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        namapekerjaan: initialData.namapekerjaan
      });
    } else {
      setFormData({
        namapekerjaan: ''
      });
    }
  }, [initialData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = () => {
    const newErrors: {
      namapekerjaan?: string;
    } = {};
    
    if (!formData.namapekerjaan.trim()) {
      newErrors.namapekerjaan = 'Nama pekerjaan harus diisi';
    } else if (formData.namapekerjaan.trim().length < 2) {
      newErrors.namapekerjaan = 'Nama pekerjaan minimal 2 karakter';
    } else if (formData.namapekerjaan.trim().length > 100) {
      newErrors.namapekerjaan = 'Nama pekerjaan maksimal 100 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Trim whitespace dari nama pekerjaan
      const cleanedData = {
        namapekerjaan: formData.namapekerjaan.trim()
      };
      
      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display ID if editing */}
      {initialData && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Pekerjaan
          </label>
          <p className="text-sm text-gray-900 font-mono">#{initialData.id_pekerjaan}</p>
        </div>
      )}
      
      <Input
        label="Nama Pekerjaan"
        id="namapekerjaan"
        name="namapekerjaan"
        value={formData.namapekerjaan}
        onChange={handleChange}
        error={errors.namapekerjaan}
        placeholder="Masukkan nama pekerjaan"
        required
      />
      
      {/* Additional info for new pekerjaan */}
      {!initialData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                ID pekerjaan akan dibuatkan secara otomatis oleh sistem setelah data disimpan.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
        >
          {initialData ? 'Simpan Perubahan' : 'Tambah Pekerjaan'}
        </Button>
      </div>
    </form>
  );
};

export default PekerjaanForm;