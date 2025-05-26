// src/components/organisms/PekerjaanForm/PekerjaanForm.tsx
import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/Input/Input';
import TextArea from '../../atoms/TextArea/TextArea';

interface Pekerjaan {
  id: string;
  name: string;
  description?: string;
}

interface PekerjaanFormProps {
  initialData: Pekerjaan | null;
  onSubmit: (data: Pekerjaan) => void;
  onCancel: () => void;
}

const PekerjaanForm: React.FC<PekerjaanFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Pekerjaan>({
    id: '',
    name: '',
    description: ''
  });
  
  const [errors, setErrors] = useState<{
    id?: string;
    name?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set initial form data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Generate new ID if adding
      const newId = `PK-${String(Math.floor(Math.random() * 900) + 100)}`;
      setFormData({
        id: newId,
        name: '',
        description: ''
      });
    }
  }, [initialData]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: {
      id?: string;
      name?: string;
    } = {};
    
    if (!formData.id.trim()) {
      newErrors.id = 'ID Pekerjaan harus diisi';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama Pekerjaan harus diisi';
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
          label="ID Pekerjaan"
          id="id"
          name="id"
          value={formData.id}
          onChange={handleChange}
          error={errors.id}
          disabled={!!initialData} // Disable editing ID if updating
          required
        />
        
        <Input
          label="Nama Pekerjaan"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        
        <TextArea
          label="Deskripsi Pekerjaan"
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
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