// src/pages/LihatHasilPerhitungan/LihatHasilPerhitungan.tsx
import React, { useState, useEffect } from 'react';
import Dropdown from '../../components/atoms/Dropdown/Dropdown';
import Toast from '../../components/atoms/Toast/Toast';
import Button from '../../components/atoms/Button/Button';
import { pekerjaanService, Pekerjaan } from '../../services/pekerjaanService';
import { hasilPerhitunganService } from '../../services/hasilPerhitunganService';

const LihatHasilPerhitungan: React.FC = () => {
  // State untuk pekerjaan dan data perhitungan
  const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
  const [selectedPekerjaanId, setSelectedPekerjaanId] = useState<number | undefined>(undefined);
  const [perhitunganData, setPerhitunganData] = useState<any>(null);
  const [isLoadingPekerjaan, setIsLoadingPekerjaan] = useState(true);
  const [isLoadingPerhitungan, setIsLoadingPerhitungan] = useState(false);
  
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

  // Load data perhitungan saat pekerjaan dipilih
  useEffect(() => {
    const loadPerhitunganData = async () => {
      if (!selectedPekerjaanId) {
        setPerhitunganData(null);
        return;
      }

      setIsLoadingPerhitungan(true);
      try {
        const data = await hasilPerhitunganService.getRankingDetail(selectedPekerjaanId);
        setPerhitunganData(data);
        console.log('Perhitungan data loaded:', data);
      } catch (error) {
        console.error('Error loading perhitungan data:', error);
        setPerhitunganData(null);
        setToastMessage({
          type: 'error',
          message: error instanceof Error ? error.message : 'Gagal memuat data perhitungan.'
        });
      } finally {
        setIsLoadingPerhitungan(false);
      }
    };

    loadPerhitunganData();
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

  // Export detailed calculation to HTML
  const handleExportDetailedCalculation = () => {
    if (!perhitunganData) {
      setToastMessage({
        type: 'error',
        message: 'Tidak ada data perhitungan untuk diekspor.'
      });
      return;
    }

    // Generate detailed HTML content
    const htmlContent = generateDetailedCalculationHTML();
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Detail_Perhitungan_${getSelectedPekerjaanName()}_${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    
    setToastMessage({
      type: 'success',
      message: 'Detail perhitungan berhasil diekspor.'
    });
  };

  // Generate detailed calculation HTML
  const generateDetailedCalculationHTML = () => {
    if (!perhitunganData?.tahapan_perhitungan) return '';

    const tahapan = perhitunganData.tahapan_perhitungan;
    
    return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Perhitungan Profile Matching - ${getSelectedPekerjaanName()}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
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
            border-bottom: 3px solid #2196F3;
        }
        .header h1 {
            color: #1976D2;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .section {
            margin: 30px 0;
        }
        .section-title {
            background: linear-gradient(135deg, #1976D2, #2196F3);
            color: white;
            padding: 12px 20px;
            margin: 0 0 15px 0;
            border-radius: 6px;
            font-size: 18px;
            font-weight: bold;
        }
        .calculation-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            font-size: 12px;
        }
        .calculation-table th {
            background-color: #1976D2;
            color: white;
            padding: 10px 6px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #ddd;
        }
        .calculation-table td {
            padding: 8px 6px;
            border: 1px solid #ddd;
            text-align: center;
        }
        .calculation-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .calculation-table tbody tr:hover {
            background-color: #E3F2FD;
        }
        .pelamar-name {
            font-weight: bold;
            background-color: #E8F5E8 !important;
            text-align: left !important;
            padding-left: 12px !important;
        }
        .target-row {
            background-color: #FFF3E0 !important;
            font-weight: bold;
        }
        .gap-row {
            background-color: #FFEBEE !important;
        }
        .conversion-info {
            background-color: #E8F5E8;
            border: 2px solid #4CAF50;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .conversion-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 10px;
        }
        .conversion-item {
            background: white;
            padding: 10px;
            border-radius: 4px;
            border-left: 4px solid #4CAF50;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
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
            <h1>📊 DETAIL PERHITUNGAN PROFILE MATCHING</h1>
            <h2>Posisi: ${getSelectedPekerjaanName()}</h2>
            <p>Tanggal: ${new Date().toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            })}</p>
        </div>

        <div class="conversion-info">
            <h3>🔄 Konversi Nilai Bobot</h3>
            <div class="conversion-grid">
                <div class="conversion-item">
                    <strong>Sangat Baik:</strong> ${perhitunganData.conversion_info?.sangat_baik || '81-100 = 5'}
                </div>
                <div class="conversion-item">
                    <strong>Baik:</strong> ${perhitunganData.conversion_info?.baik || '61-80 = 4'}
                </div>
                <div class="conversion-item">
                    <strong>Cukup Baik:</strong> ${perhitunganData.conversion_info?.cukup_baik || '41-60 = 3'}
                </div>
                <div class="conversion-item">
                    <strong>Kurang Baik:</strong> ${perhitunganData.conversion_info?.kurang_baik || '21-40 = 2'}
                </div>
            </div>
        </div>

        ${generateTabelInputValues(tahapan)}
        ${generateTabelTargetDanGap(tahapan)}
        ${generateTabelBobotNilai(tahapan)}
        ${generateTabelCoreFactorSecondaryFactor(tahapan)}
        ${generateTabelHasilAkhir(tahapan)}

        <div class="footer">
            <p>Dokumen ini dibuat secara otomatis oleh Sistem Profile Matching</p>
            <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        </div>
    </div>
</body>
</html>`;
  };

  // Generate table for input values
  const generateTabelInputValues = (tahapan: any) => {
    if (!tahapan?.tabel_1_input_values) return '';
    
    const data = tahapan.tabel_1_input_values;
    if (data.length === 0) return '';

    // Get all subkriteria columns dynamically
    const subkriteriaColumns = Object.keys(data[0]).filter(key => key !== 'nama_pelamar');
    
    return `
        <div class="section">
            <div class="section-title">Tabel 1: Input Nilai Pelamar</div>
            <table class="calculation-table">
                <thead>
                    <tr>
                        <th>Nama Pelamar</th>
                        ${subkriteriaColumns.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map((row: any) => `
                        <tr>
                            <td class="pelamar-name">${row.nama_pelamar}</td>
                            ${subkriteriaColumns.map(col => `<td>${row[col]}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
  };

  // Generate table for target and gap
  const generateTabelTargetDanGap = (tahapan: any) => {
    if (!tahapan?.tabel_2_target_dan_gap) return '';
    
    const data = tahapan.tabel_2_target_dan_gap;
    if (data.length === 0) return '';

    const subkriteriaColumns = Object.keys(data[0]).filter(key => key !== 'nama_pelamar');
    
    return `
        <div class="section">
            <div class="section-title">Tabel 2: Nilai Target dan GAP</div>
            <table class="calculation-table">
                <thead>
                    <tr>
                        <th>Nama Pelamar</th>
                        ${subkriteriaColumns.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map((row: any, index: number) => `
                        <tr class="${row.nama_pelamar.includes('Target') ? 'target-row' : 
                                   row.nama_pelamar.includes('GAP') ? 'gap-row' : ''}">
                            <td class="pelamar-name">${row.nama_pelamar}</td>
                            ${subkriteriaColumns.map(col => `<td>${row[col]}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
  };

  // Generate table for bobot nilai
  const generateTabelBobotNilai = (tahapan: any) => {
    if (!tahapan?.tabel_3_bobot_nilai) return '';
    
    const data = tahapan.tabel_3_bobot_nilai;
    if (data.length === 0) return '';

    const subkriteriaColumns = Object.keys(data[0]).filter(key => key !== 'nama_pelamar');
    
    return `
        <div class="section">
            <div class="section-title">Tabel 3: Konversi ke Bobot Nilai</div>
            <table class="calculation-table">
                <thead>
                    <tr>
                        <th>Nama Pelamar</th>
                        ${subkriteriaColumns.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map((row: any) => `
                        <tr>
                            <td class="pelamar-name">${row.nama_pelamar}</td>
                            ${subkriteriaColumns.map(col => `<td>${row[col]}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
  };

  // Generate tables for Core Factor and Secondary Factor
  const generateTabelCoreFactorSecondaryFactor = (tahapan: any) => {
    let content = '';
    
    // Generate table for each kriteria
    ['tabel_4_cf_sf_kriteria_1', 'tabel_5_cf_sf_kriteria_2', 'tabel_6_cf_sf_kriteria_3'].forEach((tableKey, index) => {
      if (tahapan[tableKey]) {
        const data = tahapan[tableKey];
        if (data.length === 0) return;

        const kriteriaName = data[0]?.kriteria_name || `Kriteria ${index + 1}`;
        const columns = Object.keys(data[0]).filter(key => 
          !['nama_pelamar', 'kriteria_name', 'kriteria_id'].includes(key)
        );
        
        content += `
            <div class="section">
                <div class="section-title">Tabel ${index + 4}: Core Factor & Secondary Factor - ${kriteriaName}</div>
                <table class="calculation-table">
                    <thead>
                        <tr>
                            <th>Nama Pelamar</th>
                            ${columns.map(col => `<th>${col.replace('_', ' ').toUpperCase()}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((row: any) => `
                            <tr>
                                <td class="pelamar-name">${row.nama_pelamar}</td>
                                ${columns.map(col => `<td>${row[col]}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
      }
    });
    
    return content;
  };

  // Generate table for final results
  const generateTabelHasilAkhir = (tahapan: any) => {
    if (!tahapan?.tabel_7_hasil_akhir) return '';
    
    const data = tahapan.tabel_7_hasil_akhir;
    if (data.length === 0) return '';

    return `
        <div class="section">
            <div class="section-title">Tabel 7: Hasil Akhir Perhitungan</div>
            <table class="calculation-table">
                <thead>
                    <tr>
                        <th>Nama Pelamar</th>
                        <th>NA (Administrasi)</th>
                        <th>NWA (Wawancara)</th>
                        <th>NKO (Kompetensi)</th>
                        <th>Hasil Akhir</th>
                        <th>Peringkat</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((row: any, index: number) => `
                        <tr style="${index === 0 ? 'background-color: #FFF3E0; font-weight: bold;' : ''}">
                            <td class="pelamar-name">${row.nama_pelamar}</td>
                            <td>${row.na}</td>
                            <td>${row.nwa}</td>
                            <td>${row.nko}</td>
                            <td style="font-weight: bold; color: #1976D2;">${row.hasil_akhir.toFixed(3)}</td>
                            <td>${index + 1}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
  };

  return (
    <div className="p-6 max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Lihat Hasil Perhitungan</h1>
        <p className="text-gray-600 mt-1">
          Lihat detail lengkap tahapan perhitungan Profile Matching untuk analisis mendalam.
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
              Pilih pekerjaan untuk melihat detail perhitungan Profile Matching
            </p>
          </div>
        </div>

        {selectedPekerjaanId && !isLoadingPerhitungan && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
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
                    Detail tahapan perhitungan akan ditampilkan di bawah
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={handleExportDetailedCalculation}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                }
              >
                Export Detail HTML
              </Button>
            </div>
          </div>
        )}

        {isLoadingPerhitungan && (
          <div className="mt-4 flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Memuat data perhitungan...</span>
          </div>
        )}
      </div>

      {/* Calculation Results */}
      {perhitunganData && !isLoadingPerhitungan && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Ringkasan Perhitungan</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {perhitunganData.perhitungan_summary.total_pelamar}
                </div>
                <div className="text-sm text-blue-600">Total Pelamar</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {perhitunganData.perhitungan_summary.total_kriteria}
                </div>
                <div className="text-sm text-green-600">Total Kriteria</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {perhitunganData.perhitungan_summary.total_detail_records}
                </div>
                <div className="text-sm text-purple-600">Detail Records</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {perhitunganData.perhitungan_summary.total_agregat_records}
                </div>
                <div className="text-sm text-orange-600">Agregat Records</div>
              </div>
            </div>
          </div>

          {/* Conversion Info */}
          {perhitunganData.conversion_info && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Konversi Nilai Bobot</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="font-medium text-green-800">Sangat Baik</div>
                  <div className="text-green-600 text-sm">{perhitunganData.conversion_info.sangat_baik}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="font-medium text-blue-800">Baik</div>
                  <div className="text-blue-600 text-sm">{perhitunganData.conversion_info.baik}</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="font-medium text-yellow-800">Cukup Baik</div>
                  <div className="text-yellow-600 text-sm">{perhitunganData.conversion_info.cukup_baik}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <div className="font-medium text-red-800">Kurang Baik</div>
                  <div className="text-red-600 text-sm">{perhitunganData.conversion_info.kurang_baik}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tahapan Perhitungan Tables */}
          {perhitunganData.tahapan_perhitungan && (
            <>
              {/* Table 1: Input Values */}
              {perhitunganData.tahapan_perhitungan.tabel_1_input_values && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                    <h3 className="text-lg font-medium text-blue-800">
                      Tabel 1: Input Nilai Pelamar
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Pelamar
                          </th>
                          {Object.keys(perhitunganData.tahapan_perhitungan.tabel_1_input_values[0])
                            .filter(key => key !== 'nama_pelamar')
                            .map(subkriteria => (
                              <th key={subkriteria} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {subkriteria}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {perhitunganData.tahapan_perhitungan.tabel_1_input_values.map((row: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-green-50">
                              {row.nama_pelamar}
                            </td>
                            {Object.keys(row)
                              .filter(key => key !== 'nama_pelamar')
                              .map(subkriteria => (
                                <td key={subkriteria} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {row[subkriteria]}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Table 2: Target dan GAP */}
              {perhitunganData.tahapan_perhitungan.tabel_2_target_dan_gap && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
                    <h3 className="text-lg font-medium text-orange-800">
                      Tabel 2: Nilai Target dan GAP
                    </h3>
                    <p className="text-sm text-orange-600 mt-1">
                      GAP = Nilai Pelamar - Nilai Target
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Pelamar
                          </th>
                          {Object.keys(perhitunganData.tahapan_perhitungan.tabel_2_target_dan_gap[0])
                            .filter(key => key !== 'nama_pelamar')
                            .map(subkriteria => (
                              <th key={subkriteria} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {subkriteria}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {perhitunganData.tahapan_perhitungan.tabel_2_target_dan_gap.map((row: any, index: number) => {
                          const isTarget = row.nama_pelamar.includes('Target');
                          const isGap = row.nama_pelamar.includes('GAP');
                          
                          return (
                            <tr key={index} className={
                              isTarget ? "bg-yellow-50" : 
                              isGap ? "bg-red-50" : 
                              "hover:bg-gray-50"
                            }>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${
                                isTarget ? 'bg-yellow-100' : 
                                isGap ? 'bg-red-100' : 
                                'bg-green-50'
                              }`}>
                                {row.nama_pelamar}
                              </td>
                              {Object.keys(row)
                                .filter(key => key !== 'nama_pelamar')
                                .map(subkriteria => (
                                  <td key={subkriteria} className={`px-6 py-4 whitespace-nowrap text-sm text-center ${
                                    isGap && row[subkriteria] < 0 ? 'text-red-600 font-bold' :
                                    isGap && row[subkriteria] > 0 ? 'text-green-600 font-bold' :
                                    isTarget ? 'text-orange-800 font-bold' :
                                    'text-gray-900'
                                  }`}>
                                    {row[subkriteria]}
                                  </td>
                                ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Table 3: Bobot Nilai */}
              {perhitunganData.tahapan_perhitungan.tabel_3_bobot_nilai && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
                    <h3 className="text-lg font-medium text-purple-800">
                      Tabel 3: Konversi ke Bobot Nilai
                    </h3>
                    <p className="text-sm text-purple-600 mt-1">
                      Nilai GAP dikonversi berdasarkan tabel bobot nilai Profile Matching
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Pelamar
                          </th>
                          {Object.keys(perhitunganData.tahapan_perhitungan.tabel_3_bobot_nilai[0])
                            .filter(key => key !== 'nama_pelamar')
                            .map(subkriteria => (
                              <th key={subkriteria} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {subkriteria}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {perhitunganData.tahapan_perhitungan.tabel_3_bobot_nilai.map((row: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-green-50">
                              {row.nama_pelamar}
                            </td>
                            {Object.keys(row)
                              .filter(key => key !== 'nama_pelamar')
                              .map(subkriteria => (
                                <td key={subkriteria} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                                  {row[subkriteria]}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tables 4-6: Core Factor & Secondary Factor */}
              {['tabel_4_cf_sf_kriteria_1', 'tabel_5_cf_sf_kriteria_2', 'tabel_6_cf_sf_kriteria_3'].map((tableKey, tableIndex) => {
                const tableData = perhitunganData.tahapan_perhitungan[tableKey];
                if (!tableData || tableData.length === 0) return null;

                const kriteriaName = tableData[0]?.kriteria_name || `Kriteria ${tableIndex + 1}`;
                const columns = Object.keys(tableData[0]).filter(key => 
                  !['nama_pelamar', 'kriteria_name', 'kriteria_id'].includes(key)
                );

                return (
                  <div key={tableKey} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
                      <h3 className="text-lg font-medium text-indigo-800">
                        Tabel {tableIndex + 4}: Core Factor & Secondary Factor - {kriteriaName}
                      </h3>
                      <p className="text-sm text-indigo-600 mt-1">
                        CF = 60% dari total, SF = 40% dari total
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nama Pelamar
                            </th>
                            {columns.map(col => (
                              <th key={col} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {col.replace('_', ' ').toUpperCase()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tableData.map((row: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-green-50">
                                {row.nama_pelamar}
                              </td>
                              {columns.map(col => (
                                <td key={col} className={`px-6 py-4 whitespace-nowrap text-sm text-center ${
                                  col.includes('core_factor') || col.includes('secondary_factor') ? 
                                  'font-bold text-blue-600' : 'text-gray-900'
                                }`}>
                                  {row[col]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {/* Table 7: Hasil Akhir */}
              {perhitunganData.tahapan_perhitungan.tabel_7_hasil_akhir && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                    <h3 className="text-lg font-medium text-green-800">
                      Tabel 7: Hasil Akhir Perhitungan
                    </h3>
                    <p className="text-sm text-green-600 mt-1">
                      Hasil akhir berdasarkan bobot kriteria: Administrasi (25%), Wawancara (25%), Kompetensi (50%)
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Pelamar
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            NA (Administrasi)
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            NWA (Wawancara)
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            NKO (Kompetensi)
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hasil Akhir
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Peringkat
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {perhitunganData.tahapan_perhitungan.tabel_7_hasil_akhir.map((row: any, index: number) => (
                          <tr key={index} className={index === 0 ? "bg-yellow-50" : "hover:bg-gray-50"}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-green-50">
                              {row.nama_pelamar}
                              {index === 0 && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  🏆 Terbaik
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {row.na}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {row.nwa}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {row.nko}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                              <span className={`font-bold text-lg ${index === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                {typeof row.hasil_akhir === 'number' ? row.hasil_akhir.toFixed(3) : row.hasil_akhir}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                index === 0 ? 'bg-green-100 text-green-800' :
                                index < 3 ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                #{index + 1}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Penjelasan Tahapan Perhitungan</h4>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Tabel 1:</strong> Nilai input asli dari setiap pelamar untuk setiap subkriteria</li>
                    <li><strong>Tabel 2:</strong> Nilai target dan GAP (selisih nilai pelamar dengan target)</li>
                    <li><strong>Tabel 3:</strong> Konversi nilai GAP menjadi bobot nilai (1-5) berdasarkan tabel Profile Matching</li>
                    <li><strong>Tabel 4-6:</strong> Pengelompokan Core Factor (60%) dan Secondary Factor (40%) per kriteria</li>
                    <li><strong>Tabel 7:</strong> Hasil akhir dengan formula pembobotan kriteria untuk menentukan ranking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
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

export default LihatHasilPerhitungan;