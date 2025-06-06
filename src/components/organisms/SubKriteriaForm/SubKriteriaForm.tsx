// src/components/organisms/SubkriteriaForm/SubkriteriaForm.tsx
import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/Input/Input';
import Dropdown from '../../atoms/Dropdown/Dropdown';
import { pekerjaanService, Pekerjaan } from '../../../services/pekerjaanService';
import { STATUS_OPTIONS } from '../../../services/subKriteriaService';

// Interface untuk data subkriteria
interface SubkriteriaDisplay {
  id: string;
  nama: string;
  nilaiTarget: number;
  status: string;
  statusLabel: string;
  kriteria: string;
  pekerjaan: string;
  tanggalDibuat: string;
}

// Interface untuk kriteria dari response pekerjaan by ID
interface KriteriaFromPekerjaan {
  id_kriteria: number;
  namakriteria: string;
  bobot: number;
  pekerjaan_id: number;
  createdAt: string;
  updatedAt: string;
  subkriterias: any[];
}

// Interface untuk pekerjaan detail dengan kriteria (ini sesuai dengan response API yang Anda tunjukkan)
interface PekerjaanDetail {
  id_pekerjaan: number;
  namapekerjaan: string;
  createdAt: string;
  updatedAt: string;
  kriterias: KriteriaFromPekerjaan[];
}

interface SubkriteriaFormProps {
  initialData: SubkriteriaDisplay | null;
  onSubmit: (data: { nama: string; nilaiTarget: number; status: string; kriteria_id: number }) => Promise<void>;
  onCancel: () => void;
}

const SubkriteriaForm: React.FC<SubkriteriaFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    nama: '',
    nilaiTarget: 0,
    status: 'CF' as string,
    pekerjaan_id: undefined as number | undefined,
    kriteria_id: undefined as number | undefined
  });
  
  const [errors, setErrors] = useState<{
    nama?: string;
    nilaiTarget?: string;
    status?: string;
    pekerjaan_id?: string;
    kriteria_id?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
  const [kriteriaList, setKriteriaList] = useState<KriteriaFromPekerjaan[]>([]);
  const [isLoadingPekerjaan, setIsLoadingPekerjaan] = useState(true);
  const [isLoadingKriteria, setIsLoadingKriteria] = useState(false);
  
  // Load daftar pekerjaan saat form dibuka
  useEffect(() => {
    const fetchPekerjaan = async () => {
      setIsLoadingPekerjaan(true);
      try {
        const pekerjaan = await pekerjaanService.getAllPekerjaan();
        setPekerjaanList(pekerjaan);
        console.log('Loaded pekerjaan list:', pekerjaan);
      } catch (error) {
        console.error('Error fetching pekerjaan:', error);
      } finally {
        setIsLoadingPekerjaan(false);
      }
    };
    
    fetchPekerjaan();
  }, []);
  
  // Load kriteria saat pekerjaan dipilih
  useEffect(() => {
    const fetchKriteriaByPekerjaan = async () => {
      if (!formData.pekerjaan_id) {
        setKriteriaList([]);
        return;
      }
      
      setIsLoadingKriteria(true);
      try {
        console.log('Fetching kriteria for pekerjaan_id:', formData.pekerjaan_id);
        
        // Fetch pekerjaan by ID to get kriteria
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pekerjaan/${formData.pekerjaan_id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch pekerjaan detail');
        }
        
        const pekerjaanDetail = await response.json() as PekerjaanDetail;
        console.log('Pekerjaan detail response:', pekerjaanDetail);
        
        if (pekerjaanDetail.kriterias && Array.isArray(pekerjaanDetail.kriterias)) {
          setKriteriaList(pekerjaanDetail.kriterias);
          console.log('Loaded kriteria:', pekerjaanDetail.kriterias);
        } else {
          setKriteriaList([]);
          console.log('No kriteria found for this pekerjaan');
        }
      } catch (error) {
        console.error('Error fetching kriteria by pekerjaan:', error);
        setKriteriaList([]);
      } finally {
        setIsLoadingKriteria(false);
      }
    };
    
    fetchKriteriaByPekerjaan();
  }, [formData.pekerjaan_id]);
  
  // Set form data berdasarkan initial data untuk mode edit
  useEffect(() => {
    if (initialData && pekerjaanList.length > 0) {
      // Saat edit, cari pekerjaan_id berdasarkan nama pekerjaan
      const selectedPekerjaan = pekerjaanList.find(
        pekerjaan => pekerjaan.namapekerjaan === initialData.pekerjaan
      );
      
      setFormData(prev => ({
        ...prev,
        nama: initialData.nama,
        nilaiTarget: initialData.nilaiTarget,
        status: initialData.status,
        pekerjaan_id: selectedPekerjaan?.id_pekerjaan
      }));
      
      console.log('Set initial data for edit:', {
        nama: initialData.nama,
        pekerjaan: initialData.pekerjaan,
        kriteria: initialData.kriteria,
        selectedPekerjaan
      });
    } else if (!initialData) {
      // Form untuk data baru - reset form
      setFormData({
        nama: '',
        nilaiTarget: 0,
        status: 'CF',
        pekerjaan_id: undefined,
        kriteria_id: undefined
      });
    }
  }, [initialData, pekerjaanList]);
  
  // Set kriteria_id saat edit dan kriteria sudah di-load
  useEffect(() => {
    if (initialData && kriteriaList.length > 0) {
      const selectedKriteria = kriteriaList.find(
        kriteria => kriteria.namakriteria === initialData.kriteria
      );
      
      if (selectedKriteria) {
        setFormData(prev => ({
          ...prev,
          kriteria_id: selectedKriteria.id_kriteria
        }));
        
        console.log('Set kriteria_id for edit:', selectedKriteria);
      }
    }
  }, [initialData, kriteriaList]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'nilaiTarget') {
      // Parse ke number untuk field nilaiTarget
      const numValue = parseInt(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error saat field diubah
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleStatusChange = (value: string | number) => {
    const status = String(value);
    setFormData(prev => ({ ...prev, status }));
    
    // Clear error saat field diubah
    if (errors.status) {
      setErrors(prev => ({ ...prev, status: undefined }));
    }
  };
  
  const handlePekerjaanChange = (value: string | number) => {
    const pekerjaan_id = value === '' ? undefined : Number(value);
    console.log('Pekerjaan changed to:', pekerjaan_id);
    
    setFormData(prev => ({ 
      ...prev, 
      pekerjaan_id,
      kriteria_id: undefined // Reset kriteria saat pekerjaan berubah
    }));
    
    // Clear error saat field diubah
    if (errors.pekerjaan_id) {
      setErrors(prev => ({ ...prev, pekerjaan_id: undefined }));
    }
    if (errors.kriteria_id) {
      setErrors(prev => ({ ...prev, kriteria_id: undefined }));
    }
  };
  
  const handleKriteriaChange = (value: string | number) => {
    const kriteria_id = value === '' ? undefined : Number(value);
    console.log('Kriteria changed to:', kriteria_id);
    
    setFormData(prev => ({ ...prev, kriteria_id }));
    
    // Clear error saat field diubah
    if (errors.kriteria_id) {
      setErrors(prev => ({ ...prev, kriteria_id: undefined }));
    }
  };
  
  const validateForm = () => {
    const newErrors: {
      nama?: string;
      nilaiTarget?: string;
      status?: string;
      pekerjaan_id?: string;
      kriteria_id?: string;
    } = {};
    
    // Validasi nama subkriteria
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama subkriteria harus diisi';
    } else if (formData.nama.trim().length < 2) {
      newErrors.nama = 'Nama subkriteria minimal 2 karakter';
    } else if (formData.nama.trim().length > 100) {
      newErrors.nama = 'Nama subkriteria maksimal 100 karakter';
    }
    
    // Validasi nilai target
    if (formData.nilaiTarget <= 0) {
      newErrors.nilaiTarget = 'Nilai target harus lebih besar dari 0';
    } else if (formData.nilaiTarget > 10) {
      newErrors.nilaiTarget = 'Nilai target tidak boleh lebih dari 10';
    }
    
    // Validasi status
    if (!formData.status) {
      newErrors.status = 'Status harus dipilih';
    }
    
    // Validasi pekerjaan
    if (!formData.pekerjaan_id) {
      newErrors.pekerjaan_id = 'Pekerjaan harus dipilih';
    }
    
    // Validasi kriteria
    if (!formData.kriteria_id) {
      newErrors.kriteria_id = 'Kriteria harus dipilih';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Clean data sebelum submit - HANYA kirim data yang dibutuhkan API
      const cleanedData = {
        nama: formData.nama.trim(),
        nilaiTarget: formData.nilaiTarget,
        status: formData.status,
        kriteria_id: formData.kriteria_id! // Hanya kriteria_id yang dikirim, bukan pekerjaan_id
      };
      
      console.log('Submitting subkriteria data:', cleanedData);
      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Prepare dropdown options untuk pekerjaan
  const pekerjaanOptions = [
    { value: '', label: 'Pilih Pekerjaan' },
    ...pekerjaanList.map(pekerjaan => ({
      value: pekerjaan.id_pekerjaan,
      label: pekerjaan.namapekerjaan
    }))
  ];
  
  // Prepare dropdown options untuk kriteria
  const kriteriaOptions = [
    { value: '', label: 'Pilih Kriteria' },
    ...kriteriaList.map(kriteria => ({
      value: kriteria.id_kriteria,
      label: `${kriteria.namakriteria} (Bobot: ${kriteria.bobot}%)`
    }))
  ];
  
  // Prepare dropdown options untuk status
  const statusOptions = STATUS_OPTIONS.map(option => ({
    value: option.value,
    label: option.label
  }));
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display ID if editing */}
      {initialData && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Subkriteria
          </label>
          <p className="text-sm text-gray-900 font-mono">{initialData.id}</p>
        </div>
      )}
      
      <Input
        label="Nama Subkriteria"
        id="nama"
        name="nama"
        value={formData.nama}
        onChange={handleChange}
        error={errors.nama}
        placeholder="Masukkan nama subkriteria (contoh: Kelengkapan Berkas)"
        required
      />
      
      <Input
        label="Nilai Target"
        id="nilaiTarget"
        name="nilaiTarget"
        type="number"
        value={formData.nilaiTarget.toString()}
        onChange={handleChange}
        error={errors.nilaiTarget}
        placeholder="Masukkan nilai target (1-10)"
        min="1"
        max="10"
        step="1"
        required
      />
      
      <div className="space-y-2">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status <span className="text-red-500">*</span>
        </label>
        <Dropdown
          value={formData.status}
          onChange={handleStatusChange}
          options={statusOptions}
          placeholder="Pilih Status"
        />
        {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Core Factor (CF):</strong> Faktor utama yang paling berpengaruh pada kompetensi</p>
          <p><strong>Secondary Factor (SF):</strong> Faktor pendukung yang kurang berpengaruh</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="pekerjaan_id" className="block text-sm font-medium text-gray-700">
          Pekerjaan <span className="text-red-500">*</span>
        </label>
        {isLoadingPekerjaan ? (
          <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md bg-gray-50">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-sm text-gray-600">Memuat daftar pekerjaan...</span>
          </div>
        ) : pekerjaanList.length === 0 ? (
          <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md bg-red-50">
            <span className="text-sm text-red-600">Tidak ada pekerjaan tersedia. Silakan buat pekerjaan terlebih dahulu.</span>
          </div>
        ) : (
          <Dropdown
            value={formData.pekerjaan_id || ''}
            onChange={handlePekerjaanChange}
            options={pekerjaanOptions}
            placeholder="Pilih Pekerjaan"
          />
        )}
        {errors.pekerjaan_id && <p className="text-sm text-red-600">{errors.pekerjaan_id}</p>}
        <p className="text-xs text-gray-500">
          Pilih pekerjaan untuk melihat kriteria yang tersedia pada pekerjaan tersebut
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="kriteria_id" className="block text-sm font-medium text-gray-700">
          Kriteria <span className="text-red-500">*</span>
        </label>
        {!formData.pekerjaan_id ? (
          <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md bg-gray-50">
            <span className="text-sm text-gray-500">Pilih pekerjaan terlebih dahulu</span>
          </div>
        ) : isLoadingKriteria ? (
          <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md bg-gray-50">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-sm text-gray-600">Memuat kriteria untuk pekerjaan ini...</span>
          </div>
        ) : kriteriaList.length === 0 ? (
          <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md bg-red-50">
            <span className="text-sm text-red-600">Tidak ada kriteria untuk pekerjaan ini. Silakan tambah kriteria untuk pekerjaan ini terlebih dahulu.</span>
          </div>
        ) : (
          <Dropdown
            value={formData.kriteria_id || ''}
            onChange={handleKriteriaChange}
            options={kriteriaOptions}
            placeholder="Pilih Kriteria"
          />
        )}
        {errors.kriteria_id && <p className="text-sm text-red-600">{errors.kriteria_id}</p>}
        <p className="text-xs text-gray-500">
          Kriteria yang tersedia pada pekerjaan yang dipilih
        </p>
      </div>
      
      {/* Show selected kriteria info */}
      {formData.kriteria_id && kriteriaList.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              {(() => {
                const selectedKriteria = kriteriaList.find(k => k.id_kriteria === formData.kriteria_id);
                const selectedPekerjaan = pekerjaanList.find(p => p.id_pekerjaan === formData.pekerjaan_id);
                return (
                  <div>
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Pekerjaan:</span> {selectedPekerjaan?.namapekerjaan}
                    </p>
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Kriteria:</span> {selectedKriteria?.namakriteria} (Bobot: {selectedKriteria?.bobot}%)
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* Additional info for new subkriteria */}
      {!initialData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Informasi Subkriteria</h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>ID subkriteria akan dibuatkan secara otomatis oleh sistem</li>
                  <li>Pilih pekerjaan terlebih dahulu untuk melihat kriteria yang tersedia</li>
                  <li>Nilai target digunakan untuk perhitungan GAP dalam Profile Matching</li>
                  <li>Status menentukan bobot subkriteria dalam perhitungan akhir</li>
                </ul>
              </div>
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
          disabled={isLoadingPekerjaan || !formData.kriteria_id}
        >
          {initialData ? 'Simpan Perubahan' : 'Tambah Subkriteria'}
        </Button>
      </div>
    </form>
  );
};

export default SubkriteriaForm;