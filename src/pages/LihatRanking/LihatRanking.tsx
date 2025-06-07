// src/pages/LihatRanking/LihatRanking.tsx
import React, { useState, useEffect } from 'react';
import Dropdown from '../../components/atoms/Dropdown/Dropdown';
import Toast from '../../components/atoms/Toast/Toast';
import Button from '../../components/atoms/Button/Button';
import { pekerjaanService, Pekerjaan } from '../../services/pekerjaanService';
import { hasilPerhitunganService, RankingDetail } from '../../services/hasilPerhitunganService';

const LihatRanking: React.FC = () => {
  // State untuk pekerjaan dan ranking
  const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
  const [selectedPekerjaanId, setSelectedPekerjaanId] = useState<number | undefined>(undefined);
  const [rankingData, setRankingData] = useState<any>(null);
  const [isLoadingPekerjaan, setIsLoadingPekerjaan] = useState(true);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);
  
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

  // Load ranking data saat pekerjaan dipilih
  useEffect(() => {
    const loadRankingData = async () => {
      if (!selectedPekerjaanId) {
        setRankingData(null);
        return;
      }

      setIsLoadingRanking(true);
      try {
        const data = await hasilPerhitunganService.getRankingDetail(selectedPekerjaanId);
        setRankingData(data);
        console.log('Ranking data loaded:', data);
      } catch (error) {
        console.error('Error loading ranking data:', error);
        setRankingData(null);
        setToastMessage({
          type: 'error',
          message: error instanceof Error ? error.message : 'Gagal memuat data ranking.'
        });
      } finally {
        setIsLoadingRanking(false);
      }
    };

    loadRankingData();
  }, [selectedPekerjaanId]);

  // Handle perubahan pilihan pekerjaan
  const handlePekerjaanChange = (value: string | number) => {
    const pekerjaanId = value === '' ? undefined : Number(value);
    setSelectedPekerjaanId(pekerjaanId);
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

  // Export ranking data
  const handleExportRanking = () => {
    if (!rankingData) return;
    
    // Simple CSV export
    const csvHeaders = ['Peringkat', 'Nama Pelamar', 'No Pelamar', 'Email', 'Skor Akhir'];
    const csvData = rankingData.ranking_summary.map((item: any, index: number) => {
      const detail = rankingData.ranking_details.find((d: RankingDetail) => d.peringkat === item.peringkat);
      return [
        item.peringkat,
        item.namapelamar,
        detail?.pelamar.nopelamar || '',
        detail?.pelamar.email || '',
        item.hasil_akhir.toFixed(3)
      ];
    });
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ranking_${getSelectedPekerjaanName()}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setToastMessage({
      type: 'success',
      message: 'Data ranking berhasil diekspor.'
    });
  };

  return (
    <div className="p-6 max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Lihat Ranking Pelamar</h1>
        <p className="text-gray-600 mt-1">
          Lihat hasil ranking dan penilaian akhir pelamar berdasarkan perhitungan Profile Matching.
        </p>
      </div>

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
              Pilih pekerjaan untuk melihat ranking pelamar
            </p>
          </div>
        </div>

        {selectedPekerjaanId && !isLoadingRanking && (
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
                  Data ranking akan ditampilkan di bawah
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoadingRanking && (
          <div className="mt-4 flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Memuat data ranking...</span>
          </div>
        )}
      </div>

      {/* Ranking Results */}
      {rankingData && !isLoadingRanking && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Ringkasan Ranking</h3>
              <Button
                variant="secondary"
                onClick={handleExportRanking}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                }
              >
                Export CSV
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {rankingData.perhitungan_summary.total_pelamar}
                </div>
                <div className="text-sm text-blue-600">Total Pelamar</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {rankingData.perhitungan_summary.total_kriteria}
                </div>
                <div className="text-sm text-green-600">Total Kriteria</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {rankingData.ranking_summary.length}
                </div>
                <div className="text-sm text-purple-600">Pelamar Teranking</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {rankingData.perhitungan_summary.completeness.is_complete ? '100%' : 'Partial'}
                </div>
                <div className="text-sm text-orange-600">Kelengkapan Data</div>
              </div>
            </div>
          </div>

          {/* Ranking Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">
                Peringkat Pelamar - {rankingData.pekerjaan.namapekerjaan}
              </h3>
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
                      No Pelamar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skor Akhir
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rankingData.ranking_summary.map((item: any, index: number) => {
                    const detail = rankingData.ranking_details.find((d: RankingDetail) => d.peringkat === item.peringkat);
                    return (
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
                          <div className="text-sm text-gray-900">{detail?.pelamar.nopelamar || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{detail?.pelamar.email || '-'}</div>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Best Candidate Detail */}
          {rankingData.ranking_details && rankingData.ranking_details[0] && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Detail Pelamar Terbaik</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-green-800">
                      {rankingData.ranking_details[0].pelamar.namapelamar}
                    </h4>
                    <p className="text-sm text-green-600">
                      Peringkat {rankingData.ranking_details[0].peringkat} • {rankingData.ranking_details[0].pelamar.nopelamar}
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      {rankingData.ranking_details[0].pelamar.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {rankingData.ranking_details[0].final_calculation.score.toFixed(3)}
                    </div>
                    <div className="text-sm text-green-500">Skor Akhir</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <strong>Formula Perhitungan:</strong> {rankingData.ranking_details[0].final_calculation.formula}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(rankingData.ranking_details[0].final_calculation.details).map(([key, detail]: [string, any]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium text-gray-800">{detail.kriteria_name}</div>
                      <div className="text-sm text-gray-600">
                        Skor: {detail.total} × {detail.bobot_persen}% = {detail.contribution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
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

export default LihatRanking;