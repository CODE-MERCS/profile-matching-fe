// src/pages/ProsesProfileMatching/ProsesProfileMatching.tsx
import React, { useState, useEffect } from 'react';
import Button from '../../components/atoms/Button/Button';
import Dropdown from '../../components/atoms/Dropdown/Dropdown';
import Modal from '../../components/organisms/Modal/Modal';
import Toast from '../../components/atoms/Toast/Toast';
import ProsesProfileMatchingForm from '../../components/organisms/ProsesProfileMatchingForm/ProsesProfileMatchingForm';
import { pekerjaanService, Pekerjaan } from '../../services/pekerjaanService';
import { perhitunganService, PerhitunganFormData } from '../../services/perhitunganService';

const ProsesProfileMatching: React.FC = () => {
  // State untuk pekerjaan dan form
  const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
  const [selectedPekerjaanId, setSelectedPekerjaanId] = useState<number | undefined>(undefined);
  const [formData, setFormData] = useState<PerhitunganFormData | null>(null);
  const [isLoadingPekerjaan, setIsLoadingPekerjaan] = useState(true);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  
  // State untuk modals dan toast
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Load daftar pekerjaan saat component mount
  useEffect(() => {
    const fetchPekerjaan = async () => {
      setIsLoadingPekerjaan(true);
      try {
        const pekerjaan = await pekerjaanService.getAllPekerjaan();
        setPekerjaanList(pekerjaan);
        console.log('Loaded pekerjaan list:', pekerjaan);
      } catch (error) {
        console.error('Error fetching pekerjaan:', error);
        setToastMessage({
          type: 'error',
          message: error instanceof Error ? error.message : 'Gagal memuat data pekerjaan.'
        });
      } finally {
        setIsLoadingPekerjaan(false);
      }
    };
    
    fetchPekerjaan();
  }, []);

  // Handle perubahan pilihan pekerjaan
  const handlePekerjaanChange = (value: string | number) => {
    const pekerjaanId = value === '' ? undefined : Number(value);
    setSelectedPekerjaanId(pekerjaanId);
    setFormData(null); // Reset form data saat pekerjaan berubah
  };

  // Handle click mulai proses - load form data
  const handleMulaiProses = async () => {
    if (!selectedPekerjaanId) {
      setToastMessage({
        type: 'error',
        message: 'Silakan pilih pekerjaan terlebih dahulu.'
      });
      return;
    }

    setIsLoadingForm(true);
    try {
      const data = await perhitunganService.getFormData(selectedPekerjaanId);
      setFormData(data);
      setIsFormModalOpen(true);
      console.log('Form data loaded:', data);
    } catch (error) {
      console.error('Error loading form data:', error);
      setToastMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Gagal memuat form perhitungan.'
      });
    } finally {
      setIsLoadingForm(false);
    }
  };

  // Handle submit form
  const handleSubmitForm = async (matrixData: any) => {
    try {
      if (!selectedPekerjaanId) {
        throw new Error('Pekerjaan tidak dipilih');
      }

      const result = await perhitunganService.submitBulkInputMatrix({
        pekerjaan_id: selectedPekerjaanId,
        matrix_data: matrixData
      });

      setToastMessage({
        type: 'success',
        message: 'Data matrix berhasil disimpan. Proses perhitungan telah dimulai.'
      });

      setIsFormModalOpen(false);
      setFormData(null);
      setSelectedPekerjaanId(undefined);
    } catch (error) {
      console.error('Error submitting matrix data:', error);
      setToastMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Gagal menyimpan data matrix.'
      });
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

  // Get selected pekerjaan name for display
  const getSelectedPekerjaanName = () => {
    if (!selectedPekerjaanId) return '';
    const pekerjaan = pekerjaanList.find(p => p.id_pekerjaan === selectedPekerjaanId);
    return pekerjaan ? pekerjaan.namapekerjaan : '';
  };

  return (
    <div className="p-6 max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Proses Profile Matching</h1>
        <p className="text-gray-600 mt-1">
          Lakukan proses perhitungan Profile Matching untuk mengevaluasi kesesuaian pelamar dengan kriteria pekerjaan.
        </p>
      </div>

      {/* Selection Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Pilih Pekerjaan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">
              Pekerjaan <span className="text-red-500">*</span>
            </label>
            
            {isLoadingPekerjaan ? (
              <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md bg-gray-50">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-sm text-gray-600">Memuat daftar pekerjaan...</span>
              </div>
            ) : pekerjaanList.length === 0 ? (
              <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md bg-red-50">
                <span className="text-sm text-red-600">
                  Tidak ada pekerjaan tersedia. Silakan buat pekerjaan terlebih dahulu.
                </span>
              </div>
            ) : (
              <Dropdown
                value={selectedPekerjaanId || ''}
                onChange={handlePekerjaanChange}
                options={pekerjaanOptions}
                placeholder="Pilih Pekerjaan"
              />
            )}
            
            <p className="text-xs text-gray-500">
              Pilih pekerjaan yang akan diproses untuk perhitungan Profile Matching
            </p>
          </div>

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={handleMulaiProses}
              disabled={!selectedPekerjaanId || isLoadingForm}
              isLoading={isLoadingForm}
              className="w-full md:w-auto"
            >
              {isLoadingForm ? 'Memuat Form...' : 'Mulai Proses'}
            </Button>
          </div>
        </div>

        {selectedPekerjaanId && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Pekerjaan Dipilih:</span> {getSelectedPekerjaanName()}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Klik &quot;Mulai Proses&quot; untuk memuat form input matrix penilaian
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Tentang Profile Matching</h2>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Langkah-langkah Proses:</h3>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Pilih pekerjaan yang akan diproses</li>
              <li>Input nilai penilaian untuk setiap pelamar pada setiap subkriteria</li>
              <li>Sistem akan menghitung GAP (selisih antara nilai pelamar dan target)</li>
              <li>Konversi GAP menjadi bobot nilai</li>
              <li>Hitung nilai Core Factor dan Secondary Factor</li>
              <li>Tentukan ranking pelamar berdasarkan nilai akhir</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Skala Penilaian:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <span className="text-green-800 font-medium">Sangat Baik</span>
                <br />
                <span className="text-green-600 text-xs">80-100%</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <span className="text-blue-800 font-medium">Baik</span>
                <br />
                <span className="text-blue-600 text-xs">65-79%</span>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <span className="text-yellow-800 font-medium">Cukup Baik</span>
                <br />
                <span className="text-yellow-600 text-xs">45-64%</span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <span className="text-red-800 font-medium">Kurang Baik</span>
                <br />
                <span className="text-red-600 text-xs">0-44%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={`Proses Profile Matching - ${getSelectedPekerjaanName()}`}
      >
        {formData && (
          <ProsesProfileMatchingForm
            formData={formData}
            onSubmit={handleSubmitForm}
            onCancel={() => setIsFormModalOpen(false)}
          />
        )}
      </Modal>

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

export default ProsesProfileMatching;