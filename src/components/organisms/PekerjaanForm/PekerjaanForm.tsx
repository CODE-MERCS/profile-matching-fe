// src/components/organisms/PekerjaanForm/PekerjaanForm.tsx
import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/Input/Input';

interface Pekerjaan {
  id_pekerjaan: number;
  namapekerjaan: string;
}

interface PekerjaanFormProps {
  initialData: Pekerjaan | null;
  onSubmit: (data: Pekerjaan) => Promise<void>;
  onCancel: () => void;
}

const PekerjaanForm: React.FC<PekerjaanFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Pekerjaan>({
    id_pekerjaan: 0,
    namapekerjaan: ''
  });
  
  const [errors, setErrors] = useState<{
    namapekerjaan?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id_pekerjaan: 0,
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
      newErrors.namapekerjaan = 'Nama Pekerjaan harus diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input
          label="Nama Pekerjaan"
          id="namapekerjaan"
          name="namapekerjaan"
          value={formData.namapekerjaan}
          onChange={handleChange}
          error={errors.namapekerjaan}
          required
        />
        
        <div className="flex justify-end space-x-3 pt-4">
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
            {initialData ? 'Simpan Perubahan' : 'Simpan'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PekerjaanForm;