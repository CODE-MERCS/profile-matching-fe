// src/components/organisms/KriteriaForm/KriteriaForm.tsx
import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/Input/Input';
import Dropdown from '../../atoms/Dropdown/Dropdown';
import { pekerjaanService, Pekerjaan } from '../../../services/pekerjaanService';

// Interface untuk data kriteria
interface KriteriaDisplay {
  id: string;
  nama: string;
  bobot: number;
  pekerjaan: string;
  jumlahSubkriteria: number;
  tanggalDibuat: string;
}

interface KriteriaFormProps {
  initialData: KriteriaDisplay | null;
  onSubmit: (data: { nama: string; bobot: number; pekerjaan_id?: number }) => Promise<void>;
  onCancel: () => void;
}

const KriteriaForm: React.FC<KriteriaFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    nama: '',
    bobot: 0,
    pekerjaan_id: undefined as number | undefined
  });
  
  const [errors, setErrors] = useState<{
    nama?: string;
    bobot?: string;
    pekerjaan_id?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
  const [isLoadingPekerjaan, setIsLoadingPekerjaan] = useState(true);
  
  // Load daftar pekerjaan saat form dibuka
  useEffect(() => {
    const fetchPekerjaan = async () => {
      setIsLoadingPekerjaan(true);
      try {
        const pekerjaan = await pekerjaanService.getAllPekerjaan();
        setPekerjaanList(pekerjaan);
      } catch (error) {
        console.error('Error fetching pekerjaan:', error);
        // Tidak perlu menampilkan error karena ini optional
      } finally {
        setIsLoadingPekerjaan(false);
      }
    };
    
    fetchPekerjaan();
  }, []);
  
  // Set form data berdasarkan initial data
  useEffect(() => {
    if (initialData) {
      // Saat edit, cari pekerjaan_id berdasarkan nama pekerjaan
      const selectedPekerjaan = pekerjaanList.find(
        pekerjaan => pekerjaan.namapekerjaan === initialData.pekerjaan
      );
      
      setFormData({
        nama: initialData.nama,
        bobot: initialData.bobot,
        pekerjaan_id: selectedPekerjaan?.id_pekerjaan
      });
    } else {
      // Form untuk data baru
      setFormData({
        nama: '',
        bobot: 0,
        pekerjaan_id: undefined
      });
    }
  }, [initialData, pekerjaanList]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'bobot') {
      // Parse ke number untuk field bobot
      const numValue = parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error saat field diubah
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handlePekerjaanChange = (value: string | number) => {
    const pekerjaan_id = value === '' ? undefined : Number(value);
    setFormData(prev => ({ ...prev, pekerjaan_id }));
    
    // Clear error saat field diubah
    if (errors.pekerjaan_id) {
      setErrors(prev => ({ ...prev, pekerjaan_id: undefined }));
    }
  };
  
  const validateForm = () => {
    const newErrors: {
      nama?: string;
      bobot?: string;
      pekerjaan_id?: string;
    } = {};
    
    // Validasi nama kriteria
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama kriteria harus diisi';
    } else if (formData.nama.trim().length < 2) {
      newErrors.nama = 'Nama kriteria minimal 2 karakter';
    } else if (formData.nama.trim().length > 100) {
      newErrors.nama = 'Nama kriteria maksimal 100 karakter';
    }
    
    // Validasi bobot
    if (formData.bobot <= 0) {
      newErrors.bobot = 'Bobot harus lebih besar dari 0';
    } else if (formData.bobot > 100) {
      newErrors.bobot = 'Bobot tidak boleh lebih dari 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Clean data sebelum submit
      const cleanedData = {
        nama: formData.nama.trim(),
        bobot: formData.bobot,
        pekerjaan_id: formData.pekerjaan_id
      };
      
      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Prepare dropdown options untuk pekerjaan
  const pekerjaanOptions = [
    { value: '', label: 'Pilih Pekerjaan (Opsional)' },
    ...pekerjaanList.map(pekerjaan => ({
      value: pekerjaan.id_pekerjaan,
      label: pekerjaan.namapekerjaan
    }))
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display ID if editing */}
      {initialData && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Kriteria
          </label>
          <p className="text-sm text-gray-900 font-mono">{initialData.id}</p>
        </div>
      )}
      
      <Input
        label="Nama Kriteria"
        id="nama"
        name="nama"
        value={formData.nama}
        onChange={handleChange}
        error={errors.nama}
        placeholder="Masukkan nama kriteria (contoh: Kompetensi, Pengalaman)"
        required
      />
      
      <Input
        label="Bobot (%)"
        id="bobot"
        name="bobot"
        type="number"
        value={formData.bobot.toString()}
        onChange={handleChange}
        error={errors.bobot}
        placeholder="Masukkan bobot kriteria (1-100)"
        min="0.1"
        max="100"
        step="0.1"
        required
      />
      
      <div className="space-y-2">
        <label htmlFor="pekerjaan_id" className="block text-sm font-medium text-gray-700">
          Pekerjaan Terkait
        </label>
        {isLoadingPekerjaan ? (
          <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md bg-gray-50">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-sm text-gray-600">Memuat daftar pekerjaan...</span>
          </div>
        ) : (
          <Dropdown
            value={formData.pekerjaan_id || ''}
            onChange={handlePekerjaanChange}
            options={pekerjaanOptions}
            placeholder="Pilih Pekerjaan (Opsional)"
          />
        )}
        <p className="text-xs text-gray-500">
          Opsional: Pilih pekerjaan untuk mengaitkan kriteria dengan posisi tertentu
        </p>
      </div>
      
      {/* Additional info for new kriteria */}
      {!initialData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Informasi Kriteria</h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>ID kriteria akan dibuatkan secara otomatis oleh sistem</li>
                  <li>Bobot kriteria menunjukkan tingkat kepentingan (persentase)</li>
                  <li>Setelah kriteria dibuat, Anda dapat menambahkan subkriteria</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Display subkriteria count if editing */}
      {initialData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                Kriteria ini memiliki <span className="font-medium">{initialData.jumlahSubkriteria}</span> subkriteria
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
          disabled={isLoadingPekerjaan}
        >
          {initialData ? 'Simpan Perubahan' : 'Tambah Kriteria'}
        </Button>
      </div>
    </form>
  );
};

export default KriteriaForm;