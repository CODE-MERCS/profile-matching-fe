// src/components/organisms/ProsesProfileMatchingForm/ProsesProfileMatchingForm.tsx
import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/Input/Input';
import { PerhitunganFormData, MatrixData } from '../../../services/perhitunganService';
import { pelamarService, PelamarDisplay } from '../../../services/pelamarService';

interface ProsesProfileMatchingFormProps {
  formData: PerhitunganFormData;
  onSubmit: (matrixData: MatrixData) => Promise<void>;
  onCancel: () => void;
}

const ProsesProfileMatchingForm: React.FC<ProsesProfileMatchingFormProps> = ({
  formData,
  onSubmit,
  onCancel
}) => {
  const [pelamarList, setPelamarList] = useState<PelamarDisplay[]>([]);
  const [matrixValues, setMatrixValues] = useState<MatrixData>({});
  const [isLoadingPelamar, setIsLoadingPelamar] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load daftar pelamar saat component mount
  useEffect(() => {
    const fetchPelamar = async () => {
      setIsLoadingPelamar(true);
      try {
        const pelamar = await pelamarService.getAllPelamar();
        setPelamarList(pelamar);
        
        // Initialize matrix values dengan nilai default (0)
        const initialMatrix: MatrixData = {};
        pelamar.forEach(p => {
          const pelamarId = pelamarService.extractIdFromDisplayId(p.id).toString();
          initialMatrix[pelamarId] = {};
          
          formData.kriterias.forEach(kriteria => {
            kriteria.subkriterias.forEach(sub => {
              initialMatrix[pelamarId][sub.id_subkriteria.toString()] = 0;
            });
          });
        });
        
        setMatrixValues(initialMatrix);
        console.log('Initialized matrix values:', initialMatrix);
      } catch (error) {
        console.error('Error fetching pelamar:', error);
      } finally {
        setIsLoadingPelamar(false);
      }
    };
    
    fetchPelamar();
  }, [formData]);

  // Handle perubahan nilai input
  const handleValueChange = (pelamarId: string, subkriteriaId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    
    setMatrixValues(prev => ({
      ...prev,
      [pelamarId]: {
        ...prev[pelamarId],
        [subkriteriaId]: numValue
      }
    }));

    // Clear error untuk field ini
    const errorKey = `${pelamarId}_${subkriteriaId}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Validasi form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    Object.keys(matrixValues).forEach(pelamarId => {
      Object.keys(matrixValues[pelamarId]).forEach(subkriteriaId => {
        const value = matrixValues[pelamarId][subkriteriaId];
        const errorKey = `${pelamarId}_${subkriteriaId}`;
        
        if (value < 0 || value > 100) {
          newErrors[errorKey] = 'Nilai harus antara 0-100';
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(matrixValues);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get error untuk field tertentu
  const getFieldError = (pelamarId: string, subkriteriaId: string) => {
    return errors[`${pelamarId}_${subkriteriaId}`];
  };

  // Get nilai untuk field tertentu
  const getFieldValue = (pelamarId: string, subkriteriaId: string) => {
    return matrixValues[pelamarId]?.[subkriteriaId] || 0;
  };

  if (isLoadingPelamar) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Memuat data pelamar...</span>
      </div>
    );
  }

  if (pelamarList.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-red-800">Tidak Ada Data Pelamar</h3>
          <p className="mt-2 text-sm text-red-600">
            Tidak ada pelamar yang tersedia untuk diproses. Silakan tambah data pelamar terlebih dahulu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Petunjuk Pengisian</h4>
            <div className="mt-2 text-sm text-blue-700">
              <p>Masukkan nilai penilaian (0-100) untuk setiap pelamar pada setiap subkriteria.</p>
              <p className="mt-1">Gunakan skala: Sangat Baik (80-100), Baik (65-79), Cukup Baik (45-64), Kurang Baik (0-44)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pekerjaan Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-800">
          {formData.pekerjaan.namapekerjaan}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {formData.kriterias.length} Kriteria • {formData.kriterias.reduce((total, k) => total + k.subkriterias.length, 0)} Subkriteria
        </p>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Pelamar
              </th>
              {formData.kriterias.map((kriteria) => (
                <th 
                  key={kriteria.id_kriteria}
                  colSpan={kriteria.subkriterias.length}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
                >
                  {kriteria.namakriteria} ({kriteria.bobot}%)
                </th>
              ))}
            </tr>
            <tr>
              {formData.kriterias.map((kriteria) =>
                kriteria.subkriterias.map((subkriteria) => (
                  <th
                    key={subkriteria.id_subkriteria}
                    className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
                  >
                    <div className="space-y-1">
                      <div>{subkriteria.kode}</div>
                      <div className="text-xs text-gray-400 normal-case">
                        Target: {subkriteria.nilaitarget}
                      </div>
                      <div className={`text-xs px-1 py-0.5 rounded ${
                        subkriteria.status === 'CF' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {subkriteria.status}
                      </div>
                    </div>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pelamarList.map((pelamar) => {
              const pelamarId = pelamarService.extractIdFromDisplayId(pelamar.id).toString();
              return (
                <tr key={pelamar.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                    <div className="space-y-1">
                      <div className="font-medium">{pelamar.nama}</div>
                      <div className="text-xs text-gray-500">{pelamar.id}</div>
                    </div>
                  </td>
                  {formData.kriterias.map((kriteria) =>
                    kriteria.subkriterias.map((subkriteria) => (
                      <td
                        key={`${pelamar.id}_${subkriteria.id_subkriteria}`}
                        className="px-2 py-2 border-r border-gray-200"
                      >
                        <div className="space-y-1">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={getFieldValue(pelamarId, subkriteria.id_subkriteria.toString()).toString()}
                            onChange={(e) => handleValueChange(
                              pelamarId,
                              subkriteria.id_subkriteria.toString(),
                              e.target.value
                            )}
                            error={getFieldError(pelamarId, subkriteria.id_subkriteria.toString())}
                            placeholder="0-100"
                            className="text-center"
                          />
                        </div>
                      </td>
                    ))
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Conversion Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Panduan Penilaian:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <div className="font-medium text-green-800">Sangat Baik</div>
            <div className="text-green-600">{formData.conversion_info.sangat_baik}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <div className="font-medium text-blue-800">Baik</div>
            <div className="text-blue-600">{formData.conversion_info.baik}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <div className="font-medium text-yellow-800">Cukup Baik</div>
            <div className="text-yellow-600">{formData.conversion_info.cukup_baik}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <div className="font-medium text-red-800">Kurang Baik</div>
            <div className="text-red-600">{formData.conversion_info.kurang_baik}</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Ringkasan Data:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Total Pelamar: {pelamarList.length} orang</p>
          <p>• Total Kriteria: {formData.kriterias.length} kriteria</p>
          <p>• Total Subkriteria: {formData.kriterias.reduce((total, k) => total + k.subkriterias.length, 0)} subkriteria</p>
          <p>• Total Input Yang Diperlukan: {pelamarList.length * formData.kriterias.reduce((total, k) => total + k.subkriterias.length, 0)} nilai</p>
        </div>
      </div>

      {/* Form Actions */}
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
          disabled={Object.keys(errors).length > 0}
        >
          {isSubmitting ? 'Menyimpan Data...' : 'Proses Perhitungan'}
        </Button>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">Terdapat {Object.keys(errors).length} kesalahan input</h4>
              <p className="text-sm text-red-700 mt-1">
                Silakan perbaiki nilai-nilai yang tidak valid sebelum melanjutkan proses.
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default ProsesProfileMatchingForm;