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
  
  // State untuk selection pelamar yang lolos
  const [selectedWinners, setSelectedWinners] = useState<number[]>([]);
  
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
        setSelectedWinners([]);
        return;
      }

      setIsLoadingRanking(true);
      try {
        const data = await hasilPerhitunganService.getRankingDetail(selectedPekerjaanId);
        setRankingData(data);
        setSelectedWinners([]); // Reset selection
        console.log('Ranking data loaded:', data);
      } catch (error) {
        console.error('Error loading ranking data:', error);
        setRankingData(null);
        setSelectedWinners([]);
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

  // Handle selection pelamar yang lolos
  const handleWinnerSelection = (peringkat: number) => {
    setSelectedWinners(prev => {
      if (prev.includes(peringkat)) {
        return prev.filter(p => p !== peringkat);
      } else {
        return [...prev, peringkat];
      }
    });
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

  // Helper function untuk mendapatkan nama kriteria dari tabel hasil akhir (dynamic)
  const getKriteriaColumns = () => {
    if (!rankingData?.tahapan_perhitungan?.tabel_7_hasil_akhir || rankingData.tahapan_perhitungan.tabel_7_hasil_akhir.length === 0) {
      return [];
    }

    const sampleRow = rankingData.tahapan_perhitungan.tabel_7_hasil_akhir[0];
    return Object.keys(sampleRow).filter(key => 
      !['nama_pelamar', 'hasil_akhir', 'peringkat'].includes(key) && key.startsWith('nilai_')
    );
  };

  // Export ke PDF HTML
  const handleExportPDF = () => {
    if (!rankingData || selectedWinners.length === 0) {
      setToastMessage({
        type: 'error',
        message: 'Silakan pilih pelamar yang lolos terlebih dahulu.'
      });
      return;
    }
    
    // Get selected winners data
    const winnersData = rankingData.ranking_summary.filter((item: any) => 
      selectedWinners.includes(item.peringkat)
    );
    
    // Get kriteria columns dynamically
    const kriteriaColumns = getKriteriaColumns();
    
    // Generate HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hasil Seleksi - ${getSelectedPekerjaanName()}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4CAF50;
        }
        .header h1 {
            color: #2E7D32;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .header h2 {
            color: #388E3C;
            margin: 0;
            font-size: 20px;
            font-weight: normal;
        }
        .congratulations {
            background: linear-gradient(135deg, #E8F5E8, #C8E6C9);
            border: 2px solid #4CAF50;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .congratulations h3 {
            color: #1B5E20;
            margin: 0 0 10px 0;
            font-size: 22px;
        }
        .job-info {
            background-color: #F5F5F5;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .ranking-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .ranking-table th {
            background-color: #4CAF50;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
        }
        .ranking-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #ddd;
        }
        .ranking-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .ranking-table tbody tr:hover {
            background-color: #E8F5E8;
        }
        .rank-number {
            font-weight: bold;
            color: #2E7D32;
            font-size: 16px;
        }
        .winner-badge {
            background-color: #4CAF50;
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .summary-stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        .stat-box {
            background-color: #E3F2FD;
            border: 1px solid #2196F3;
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            margin: 5px;
            min-width: 120px;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #1976D2;
        }
        .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        @media print {
            body { margin: 0; background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 HASIL SELEKSI KARYAWAN</h1>
            <h2>Sistem Profile Matching</h2>
        </div>

        <div class="congratulations">
            <h3>🎉 SELAMAT KEPADA PELAMAR/KANDIDAT YANG LOLOS! 🎉</h3>
            <p>Berdasarkan hasil perhitungan Profile Matching untuk posisi <strong>${getSelectedPekerjaanName()}</strong></p>
        </div>

        <div class="job-info">
            <h4>📋 Informasi Seleksi:</h4>
            <p><strong>Posisi:</strong> ${getSelectedPekerjaanName()}</p>
            <p><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            })}</p>
            <p><strong>Total Pelamar Lolos:</strong> ${selectedWinners.length} dari ${rankingData.ranking_summary.length} pelamar</p>
        </div>

        <div class="summary-stats">
            <div class="stat-box">
                <div class="stat-number">${rankingData.perhitungan_summary.total_pelamar}</div>
                <div class="stat-label">Total Pelamar</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">${rankingData.perhitungan_summary.total_kriteria}</div>
                <div class="stat-label">Kriteria Penilaian</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">${selectedWinners.length}</div>
                <div class="stat-label">Pelamar Lolos</div>
            </div>
        </div>

        <h3>📊 Daftar Lengkap Ranking Pelamar</h3>
        <table class="ranking-table">
            <thead>
                <tr>
                    <th>Peringkat</th>
                    <th>Nama Pelamar</th>
                    <th>No Pelamar</th>
                    <th>Email</th>
                    ${kriteriaColumns.map(col => 
                      `<th>${col.replace('nilai_', '').replace(/_/g, ' ').toUpperCase()}</th>`
                    ).join('')}
                    <th>Skor Akhir</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${rankingData.ranking_summary.map((item: any) => {
                  const detail = rankingData.ranking_details.find((d: RankingDetail) => d.peringkat === item.peringkat);
                  const isWinner = selectedWinners.includes(item.peringkat);
                  const hasilAkhirRow = rankingData.tahapan_perhitungan?.tabel_7_hasil_akhir?.find((row: any) => 
                    row.nama_pelamar === item.namapelamar
                  );
                  
                  return `
                    <tr>
                        <td class="rank-number">#${item.peringkat}</td>
                        <td>${item.namapelamar}</td>
                        <td>${detail?.pelamar.nopelamar || '-'}</td>
                        <td>${detail?.pelamar.email || '-'}</td>
                        ${kriteriaColumns.map(col => 
                          `<td>${hasilAkhirRow ? hasilAkhirRow[col] : '-'}</td>`
                        ).join('')}
                        <td><strong>${item.hasil_akhir.toFixed(3)}</strong></td>
                        <td>${isWinner ? '<span class="winner-badge">LOLOS</span>' : '-'}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>

        <div class="footer">
            <p>Dokumen ini dibuat secara otomatis oleh Sistem Profile Matching</p>
            <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        </div>
    </div>
</body>
</html>`;

    // Create and download HTML file
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Hasil_Seleksi_${getSelectedPekerjaanName()}_${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    
    setToastMessage({
      type: 'success',
      message: `File HTML berhasil diekspor untuk ${selectedWinners.length} pelamar yang lolos.`
    });
  };

  return (
    <div className="p-6 max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Lihat Ranking Pelamar</h1>
        <p className="text-gray-600 mt-1">
          Lihat hasil ranking dan pilih pelamar yang lolos untuk diekspor sebagai dokumen resmi.
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
                  Pilih pelamar yang lolos dan export sebagai dokumen resmi
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
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Pelamar Dipilih: <span className="font-bold text-green-600">{selectedWinners.length}</span>
                </div>
                <Button
                  variant="primary"
                  onClick={handleExportPDF}
                  disabled={selectedWinners.length === 0}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Export PDF HTML
                </Button>
              </div>
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
                  {selectedWinners.length}
                </div>
                <div className="text-sm text-orange-600">Pelamar Lolos</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-yellow-700">
                  <strong>Petunjuk:</strong> Centang kotak di samping nama pelamar yang dinyatakan lolos seleksi, 
                  kemudian klik tombol "Export PDF HTML" untuk mengunduh dokumen resmi hasil seleksi.
                </div>
              </div>
            </div>
          </div>

          {/* Ranking Table with Dynamic Kriteria Columns */}
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
                      Pilih
                    </th>
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
                    {/* Dynamic Kriteria Columns */}
                    {getKriteriaColumns().map(col => (
                      <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {col.replace('nilai_', '').replace(/_/g, ' ').toUpperCase()}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skor Akhir
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rankingData.ranking_summary.map((item: any, index: number) => {
                    const detail = rankingData.ranking_details.find((d: RankingDetail) => d.peringkat === item.peringkat);
                    const isSelected = selectedWinners.includes(item.peringkat);
                    const hasilAkhirRow = rankingData.tahapan_perhitungan?.tabel_7_hasil_akhir?.find((row: any) => 
                      row.nama_pelamar === item.namapelamar
                    );
                    
                    return (
                      <tr key={item.peringkat} className={isSelected ? "bg-green-50" : index === 0 ? "bg-yellow-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleWinnerSelection(item.peringkat)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                        </td>
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
                        {/* Dynamic Kriteria Values */}
                        {getKriteriaColumns().map(col => (
                          <td key={col} className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{hasilAkhirRow ? hasilAkhirRow[col] : '-'}</div>
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-blue-600">{item.hasil_akhir.toFixed(3)}</div>
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