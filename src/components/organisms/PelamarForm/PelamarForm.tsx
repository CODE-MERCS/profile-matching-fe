// src/components/organisms/PelamarForm/PelamarForm.tsx
import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/Input/Input';
import Select from '../../atoms/Select/Select';
import DatePicker from '../../atoms/DatePicker/DatePicker';

interface Pelamar {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  pendidikan: string;
  posisi: string;
  status: 'pending' | 'interview' | 'hired' | 'rejected';
  tanggalLamar: string;
}

interface PelamarFormProps {
  initialData: Pelamar | null;
  onSubmit: (data: Pelamar) => void;
  onCancel: () => void;
}

const PelamarForm: React.FC<PelamarFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Pelamar>({
    id: '',
    nama: '',
    email: '',
    telepon: '',
    pendidikan: '',
    posisi: '',
    status: 'pending',
    tanggalLamar: new Date().toISOString().split('T')[0]
  });
  
  const [errors, setErrors] = useState<{
    id?: string;
    nama?: string;
    email?: string;
    telepon?: string;
    pendidikan?: string;
    posisi?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Opsi untuk dropdown
  const pendidikanOptions = [
    { value: 'SMA', label: 'SMA / Sederajat' },
    { value: 'D3', label: 'Diploma (D3)' },
    { value: 'S1', label: 'Sarjana (S1)' },
    { value: 'S2', label: 'Magister (S2)' },
    { value: 'S3', label: 'Doktor (S3)' }
  ];
  
  const posisiOptions = [
    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
    { value: 'Web Developer', label: 'Web Developer' },
    { value: 'Data Analyst', label: 'Data Analyst' },
    { value: 'HR Manager', label: 'HR Manager' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Digital Marketing', label: 'Digital Marketing' },
    { value: 'Content Writer', label: 'Content Writer' }
  ];
  
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'interview', label: 'Interview' },
    { value: 'hired', label: 'Diterima' },
    { value: 'rejected', label: 'Ditolak' }
  ];
  
  // Set initial form data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Generate new ID if adding
      const newId = `APL-${String(Math.floor(Math.random() * 900) + 100)}`;
      setFormData({
        id: newId,
        nama: '',
        email: '',
        telepon: '',
        pendidikan: '',
        posisi: '',
        status: 'pending',
        tanggalLamar: new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Handle date change
  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, tanggalLamar: date }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: {
      id?: string;
      nama?: string;
      email?: string;
      telepon?: string;
      pendidikan?: string;
      posisi?: string;
    } = {};
    
    if (!formData.id.trim()) {
      newErrors.id = 'ID Pelamar harus diisi';
    }
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama Pelamar harus diisi';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.telepon.trim()) {
      newErrors.telepon = 'Nomor Telepon harus diisi';
    } else if (!/^[0-9]{10,15}$/.test(formData.telepon.replace(/\D/g, ''))) {
      newErrors.telepon = 'Nomor telepon harus 10-15 digit';
    }
    
    if (!formData.pendidikan) {
      newErrors.pendidikan = 'Pendidikan harus dipilih';
    }
    
    if (!formData.posisi) {
      newErrors.posisi = 'Posisi harus dipilih';
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="ID Pelamar"
          id="id"
          name="id"
          value={formData.id}
          onChange={handleChange}
          error={errors.id}
          disabled={!!initialData} // Disable editing ID if updating
          required
        />
        <Input
          label="Nama Lengkap"
          id="nama"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          error={errors.nama}
          required
        />
        
        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        
        <Input
          label="Nomor Telepon"
          id="telepon"
          name="telepon"
          value={formData.telepon}
          onChange={handleChange}
          error={errors.telepon}
          required
        />
        
        <Select
          label="Pendidikan Terakhir"
          id="pendidikan"
          name="pendidikan"
          value={formData.pendidikan}
          onChange={handleChange}
          options={pendidikanOptions}
          error={errors.pendidikan}
          required
        />
        
        <Select
          label="Posisi yang Dilamar"
          id="posisi"
          name="posisi"
          value={formData.posisi}
          onChange={handleChange}
          options={posisiOptions}
          error={errors.posisi}
          required
        />
        
        <Select
          label="Status"
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
        />
        
        <DatePicker
          label="Tanggal Lamar"
          id="tanggalLamar"
          value={formData.tanggalLamar}
          onChange={handleDateChange}
          max={new Date().toISOString().split('T')[0]} // Tidak bisa memilih tanggal di masa depan
        />
      </div>
      
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
    </form>
  );
};

export default PelamarForm;