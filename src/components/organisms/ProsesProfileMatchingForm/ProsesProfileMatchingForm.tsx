// src/components/organisms/ProsesProfileMatchingForm/ProsesProfileMatchingForm.tsx
import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/Input/Input';
import { PerhitunganFormData, MatrixData } from '../../../services/perhitunganService';

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
  const [matrixValues, setMatrixValues] = useState<MatrixData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Initialize matrix values saat component mount atau formData berubah
  useEffect(() => {
    const initializeMatrix = () => {
      const initialMatrix: MatrixData = {};
      
      formData.pelamars.forEach((pelamar) => {
        const pelamarId = pelamar.id_pelamar.toString();
        initialMatrix[pelamarId] = {};
        
        formData.kriterias.forEach(kriteria => {
          kriteria.subkriterias.forEach(sub => {
            const subId = sub.id_subkriteria.toString();
            // Cek apakah ada existing value
            const existingValue = formData.existing_values?.[pelamarId]?.[subId];
            initialMatrix[pelamarId][subId] = existingValue || 0;
          });
        });
      });
      
      setMatrixValues(initialMatrix);
      console.log('Initialized matrix values:', initialMatrix);
      console.log('Existing values from API:', formData.existing_values);
    };
    
    initializeMatrix();
  }, [formData]);

  // Handle perubahan nilai input
  const handleValueChange = (pelamarId: string, subkriteriaId: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    
    console.log(`Changing value for pelamar ${pelamarId}, subkriteria ${subkriteriaId} to ${numValue}`);
    
    setMatrixValues(prev => {
      const newMatrix = { ...prev };
      
      // Pastikan pelamarId ada dan buat object baru untuk pelamar ini
      if (!newMatrix[pelamarId]) {
        newMatrix[pelamarId] = {};
      } else {
        newMatrix[pelamarId] = { ...newMatrix[pelamarId] };
      }
      
      // Set nilai untuk kombinasi pelamar + subkriteria yang spesifik
      newMatrix[pelamarId][subkriteriaId] = numValue;
      
      console.log('New matrix state:', newMatrix);
      return newMatrix;
    });

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
    const value = matrixValues[pelamarId]?.[subkriteriaId];
    // Hanya tampilkan nilai jika > 0, jika 0 atau undefined tampilkan string kosong
    return value && value > 0 ? value.toString() : '';
  };

  // Get pelamar name by ID
  const getPelamarById = (id: number) => {
    return formData.pelamars.find(p => p.id_pelamar === id);
  };

  if (formData.pelamars.length === 0) {
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
      {/* Conversion Info */}
      

      {/* Matrix Tables - Separated by Kriteria */}
      <div className="space-y-6">
        {formData.kriterias.map((kriteria, kriteriaIndex) => (
          <div key={kriteria.id_kriteria} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Kriteria Header */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">
                K{kriteriaIndex + 1} - {kriteria.namakriteria}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Bobot: {kriteria.bobot}% • {kriteria.subkriterias.length} Subkriteria
              </p>
            </div>

            {/* Table for this Kriteria */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-40">
                      Kode Pelamar
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[200px]">
                      Nama Pelamar
                    </th>
                    {kriteria.subkriterias.map((subkriteria) => (
                      <th
                        key={subkriteria.id_subkriteria}
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[120px]"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-700">{subkriteria.kode}</div>
                          <div className="text-xs text-gray-600 normal-case font-normal leading-tight">
                            {subkriteria.namasubkriteria}
                          </div>
                          <div className="text-xs text-gray-500">
                            Target: {subkriteria.nilaitarget}
                          </div>
                          <div className={`inline-block text-xs px-2 py-0.5 rounded font-normal ${
                            subkriteria.status === 'CF' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {subkriteria.status}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.pelamars.map((pelamar) => {
                    const pelamarId = pelamar.id_pelamar.toString();
                    return (
                      <tr key={`${kriteria.id_kriteria}_${pelamar.id_pelamar}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                          {pelamar.kode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                          <div className="font-medium">{pelamar.namapelamar}</div>
                          <div className="text-xs text-gray-500">{pelamar.nopelamar}</div>
                        </td>
                        {kriteria.subkriterias.map((subkriteria) => {
                          const fieldKey = `${kriteria.id_kriteria}_${pelamar.id_pelamar}_${subkriteria.id_subkriteria}`;
                          const subkriteriaId = subkriteria.id_subkriteria.toString();
                          return (
                            <td
                              key={fieldKey}
                              className="px-3 py-3 border-r border-gray-200"
                            >
                              <div className="w-full">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={getFieldValue(pelamarId, subkriteriaId)}
                                  onChange={(e) => {
                                    console.log(`Input changed: pelamar=${pelamarId}, subkriteria=${subkriteriaId}, value=${e.target.value}`);
                                    handleValueChange(
                                      pelamarId,
                                      subkriteriaId,
                                      e.target.value
                                    );
                                  }}
                                  error={getFieldError(pelamarId, subkriteriaId)}
                                  placeholder="0-100"
                                  className="text-center text-sm w-full"
                                />
                                
                                {/* Show previous value if exists */}
                                {formData.existing_values?.[pelamarId]?.[subkriteriaId] && (
                                  <div className="text-xs text-blue-500 text-center mt-1">
                                    Sebelumnya: {formData.existing_values[pelamarId][subkriteriaId]}
                                  </div>
                                )}
                                
                                {/* Always show subkriteria name */}
                                <div className="text-xs text-gray-400 text-center mt-1">
                                  {subkriteria.namasubkriteria}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Ringkasan Data:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Total Pelamar: {formData.pelamars.length} orang</p>
          <p>• Total Kriteria: {formData.kriterias.length} kriteria</p>
          <p>• Total Subkriteria: {formData.kriterias.reduce((total, k) => total + k.subkriterias.length, 0)} subkriteria</p>
          <p>• Total Input Yang Diperlukan: {formData.pelamars.length * formData.kriterias.reduce((total, k) => total + k.subkriterias.length, 0)} nilai</p>
        </div>
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
          {isSubmitting ? 'Memproses Perhitungan...' : 'Proses Perhitungan Profile Matching'}
        </Button>
      </div>
    </form>
  );
};

export default ProsesProfileMatchingForm;