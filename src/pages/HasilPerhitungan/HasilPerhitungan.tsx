
// src/pages/HasilPerhitungan/HasilPerhitungan.tsx
import React, { useState } from 'react';
import Button from '../../components/atoms/Button/Button';
import LihatRanking from '../LihatRanking/LihatRanking';

const HasilPerhitungan: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'ranking' | 'detail'>('menu');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ranking':
        return <LihatRanking />;
      case 'detail':
        return (
          <div className="p-6 max-w-full">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Lihat Hasil Perhitungan</h1>
              <p className="text-gray-600 mt-1">
                Lihat detail lengkap hasil perhitungan Profile Matching.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Fitur Lihat Hasil Perhitungan
                  </h3>
                  <p className="text-gray-500">
                    Halaman ini sedang dalam pengembangan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6 max-w-full">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Hasil Perhitungan</h1>
              <p className="text-gray-600 mt-1">
                Pilih jenis laporan yang ingin Anda lihat dari hasil perhitungan Profile Matching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lihat Ranking Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-800">Lihat Ranking</h3>
                      <p className="text-sm text-gray-600">Peringkat pelamar berdasarkan skor akhir</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6">
                    Lihat daftar peringkat pelamar yang telah diurutkan berdasarkan hasil perhitungan 
                    Profile Matching dengan skor akhir masing-masing pelamar.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Skor akhir setiap pelamar
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Status kelayakan (Terpilih/Kandidat/Tidak Lolos)
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Export data ke format PDF
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    onClick={() => setActiveTab('ranking')}
                    className="w-full"
                  >
                    Lihat Ranking Pelamar
                  </Button>
                </div>
              </div>

              {/* Lihat Hasil Perhitungan Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-800">Lihat Hasil Perhitungan</h3>
                      <p className="text-sm text-gray-600">Detail lengkap proses perhitungan</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6">
                    Lihat detail lengkap proses perhitungan Profile Matching termasuk tahapan-tahapan 
                    perhitungan, matrix GAP, bobot nilai, dan analisis per kriteria.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Matrix input dan target nilai
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Perhitungan GAP dan bobot nilai
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Analisis Core Factor & Secondary Factor
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Formula dan breakdown perhitungan akhir
                    </div>
                  </div>
                  
                  <Button
                    variant="secondary"
                    onClick={() => setActiveTab('detail')}
                    className="w-full"
                    disabled
                  >
                    Lihat Detail Perhitungan
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Informasi Penting</h4>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Data hasil perhitungan hanya tersedia setelah proses Profile Matching selesai dilakukan</li>
                      <li>Pastikan telah melakukan proses perhitungan pada menu "Proses Profile Matching" terlebih dahulu</li>
                      <li>Hasil ranking akan menampilkan pelamar dengan skor tertinggi di posisi teratas</li>
                      <li>Status kelayakan ditentukan berdasarkan peringkat: Peringkat 1 = Terpilih, Peringkat 2-3 = Kandidat, sisanya = Tidak Lolos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-full">
      {activeTab !== 'menu' && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <Button
            variant="outline"
            onClick={() => setActiveTab('menu')}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Kembali ke Menu
          </Button>
        </div>
      )}
      
      {renderTabContent()}
    </div>
  );
};

export default HasilPerhitungan;