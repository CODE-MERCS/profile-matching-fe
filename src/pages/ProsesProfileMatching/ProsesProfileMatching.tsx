// src/pages/ProsesProfileMatching/ProsesProfileMatching.tsx
import React, { useState, useEffect } from 'react';
import Dropdown from '../../components/atoms/Dropdown/Dropdown';
import Toast from '../../components/atoms/Toast/Toast';
import Button from '../../components/atoms/Button/Button';
import ProsesProfileMatchingForm from '../../components/organisms/ProsesProfileMatchingForm/ProsesProfileMatchingForm';
import { pekerjaanService, Pekerjaan } from '../../services/pekerjaanService';
import { perhitunganService, PerhitunganFormData, BulkCalculateResponse } from '../../services/perhitunganService';

const ProsesProfileMatching: React.FC = () => {
  // State untuk pekerjaan dan form
  const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
  const [selectedPekerjaanId, setSelectedPekerjaanId] = useState<number | undefined>(undefined);
  const [formData, setFormData] = useState<PerhitunganFormData | null>(null);
  const [isLoadingPekerjaan, setIsLoadingPekerjaan] = useState(true);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  
  // State untuk hasil perhitungan
  const [calculationResult, setCalculationResult] = useState<BulkCalculateResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  // State untuk toast
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

  // Load form data saat pekerjaan dipilih
  useEffect(() => {
    const loadFormData = async () => {
      if (!selectedPekerjaanId) {
        setFormData(null);
        setShowResults(false);
        setCalculationResult(null);
        return;
      }

      setIsLoadingForm(true);
      try {
        const data = await perhitunganService.getFormData(selectedPekerjaanId);
        setFormData(data);
        setShowResults(false);
        setCalculationResult(null);
        console.log('Form data loaded:', data);
      } catch (error) {
        console.error('Error loading form data:', error);
        setFormData(null);
        setToastMessage({
          type: 'error',
          message: error instanceof Error ? error.message : 'Gagal memuat form perhitungan.'
        });
      } finally {
        setIsLoadingForm(false);
      }
    };

    loadFormData();
  }, [selectedPekerjaanId]);

  // Handle perubahan pilihan pekerjaan
  const handlePekerjaanChange = (value: string | number) => {
    const pekerjaanId = value === '' ? undefined : Number(value);
    setSelectedPekerjaanId(pekerjaanId);
  };

  // Handle submit form
  const handleSubmitForm = async (matrixData: any) => {
    try {
      if (!selectedPekerjaanId) {
        throw new Error('Pekerjaan tidak dipilih');
      }

      const result = await perhitunganService.submitBulkCalculate({
        pekerjaan_id: selectedPekerjaanId,
        matrix_data: matrixData
      });

      setCalculationResult(result);
      setShowResults(true);

      setToastMessage({
        type: 'success',
        message: 'Perhitungan Profile Matching berhasil diselesaikan!'
      });

    } catch (error) {
      console.error('Error submitting calculation:', error);
      setToastMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Gagal memproses perhitungan.'
      });
    }
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setFormData(null);
    setSelectedPekerjaanId(undefined);
    setShowResults(false);
    setCalculationResult(null);
  };

  // Handle new calculation
  const handleNewCalculation = () => {
    setShowResults(false);
    setCalculationResult(null);
    setSelectedPekerjaanId(undefined);
    setFormData(null);
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

  // Render hasil perhitungan
  const renderResults = () => {
    if (!calculationResult || !showResults) return null;

    return (
      <div className="space-y-6">
        {/* Header Hasil */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Hasil Perhitungan Profile Matching
              </h2>
              <p className="text-gray-600 mt-1">
                Pekerjaan: {calculationResult.data.pekerjaan.namapekerjaan}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleNewCalculation}
            >
              Perhitungan Baru
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Ringkasan Perhitungan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {calculationResult.data.perhitungan_summary.total_pelamar}
              </div>
              <div className="text-sm text-blue-600">Total Pelamar</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {calculationResult.data.perhitungan_summary.total_kriteria}
              </div>
              <div className="text-sm text-green-600">Total Kriteria</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {calculationResult.data.perhitungan_summary.total_detail_records}
              </div>
              <div className="text-sm text-purple-600">Detail Records</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {calculationResult.data.perhitungan_summary.total_agregat_records}
              </div>
              <div className="text-sm text-orange-600">Agregat Records</div>
            </div>
          </div>
        </div>

        {/* Ranking Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Peringkat Pelamar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peringkat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Pelamar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hasil Akhir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculationResult.data.ranking_summary.map((item, index) => (
                  <tr key={item.peringkat} className={index === 0 ? "bg-yellow-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && (
                          <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                        <span className={`text-lg font-semibold ${index === 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
                          #{item.peringkat}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.namapelamar}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-600">{item.hasil_akhir.toFixed(3)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        index === 0 
                          ? 'bg-green-100 text-green-800' 
                          : index < 3 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {index === 0 ? 'Terpilih' : index < 3 ? 'Kandidat' : 'Tidak Lolos'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Results */}
        {calculationResult.data.ranking_details && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Detail Perhitungan Pelamar Terbaik</h3>
            {calculationResult.data.ranking_details[0] && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-green-800">
                      {calculationResult.data.ranking_details[0].pelamar.namapelamar}
                    </h4>
                    <p className="text-sm text-green-600">
                      Peringkat {calculationResult.data.ranking_details[0].peringkat} dengan skor {calculationResult.data.ranking_details[0].final_calculation.score}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {calculationResult.data.ranking_details[0].final_calculation.score.toFixed(3)}
                    </div>
                    <div className="text-sm text-green-500">Skor Akhir</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <strong>Formula:</strong> {calculationResult.data.ranking_details[0].final_calculation.formula}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(calculationResult.data.ranking_details[0].final_calculation.details).map(([key, detail]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium text-gray-800">{detail.kriteria_name}</div>
                      <div className="text-sm text-gray-600">
                        Skor: {detail.total} × {detail.bobot_persen}% = {detail.contribution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Proses Profile Matching</h1>
        <p className="text-gray-600 mt-1">
          Lakukan proses perhitungan Profile Matching untuk mengevaluasi kesesuaian pelamar dengan kriteria pekerjaan.
        </p>
      </div>

      {!showResults ? (
        <>
          {/* Selection Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Pilih Pekerjaan</h2>
            
            <div className="max-w-md">
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
            </div>

            {selectedPekerjaanId && !isLoadingForm && (
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
                      Form input matrix penilaian tersedia di bawah
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isLoadingForm && (
              <div className="mt-4 flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Memuat form perhitungan...</span>
              </div>
            )}
          </div>

          {/* Form Section */}
          {formData && !isLoadingForm && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">
                  Input Matrix Penilaian - {getSelectedPekerjaanName()}
                </h2>
                <p className="text-gray-600 mt-1">
                  Masukkan nilai penilaian untuk setiap pelamar pada setiap subkriteria
                </p>
              </div>
              
              <div className="p-6">
                <ProsesProfileMatchingForm
                  formData={formData}
                  onSubmit={handleSubmitForm}
                  onCancel={handleCancelForm}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        renderResults()
      )}

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