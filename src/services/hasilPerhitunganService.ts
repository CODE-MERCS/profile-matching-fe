// src/services/hasilPerhitunganService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Interface untuk ranking detail
export interface RankingDetail {
  peringkat: number;
  pelamar: {
    id_pelamar: number;
    namapelamar: string;
    nopelamar: string;
    email: string;
  };
  kriteria_scores: {
    [key: string]: {
      kriteria_id: number;
      kriteria_name: string;
      target: number;
      gap: number;
      ncf: number;
      nsf: number;
      total: number;
    };
  };
  final_calculation: {
    score: number;
    formula: string;
    details: {
      [key: string]: {
        kriteria_name: string;
        total: number;
        bobot_persen: number;
        contribution: number;
      };
    };
  };
}

// Interface untuk ranking response - Updated untuk struktur API baru
export interface RankingResponse {
  status: string;
  data: {
    pekerjaan: {
      id_pekerjaan: number;
      namapekerjaan: string;
    };
    ranking_details: RankingDetail[];
    ranking_summary: {
      peringkat: number;
      namapelamar: string;
      hasil_akhir: number;
    }[];
    perhitungan_summary: {
      total_pelamar: number;
      total_kriteria: number;
      total_detail_records: number;
      total_agregat_records: number;
      completeness: {
        is_complete: boolean;
        warnings: string[];
      };
    };
    // Updated: Tahapan perhitungan dengan struktur baru
    tahapan_perhitungan: {
      tabel_1_input_values: any[];
      tabel_2_gap_calculation: any[]; // Changed from tabel_2_target_dan_gap to tabel_2_gap_calculation
      tabel_3_bobot_nilai: any[];
      tabel_4_cf_sf_kriteria_1?: any[];
      tabel_5_cf_sf_kriteria_2?: any[];
      tabel_6_cf_sf_kriteria_3?: any[];
      tabel_7_hasil_akhir: any[]; // Dynamic columns based on kriteria names
    };
    // Optional conversion info
    conversion_info?: {
      sangat_baik: string;
      baik: string;
      cukup_baik: string;
      kurang_baik: string;
    };
  };
}

// Helper function untuk mendapatkan token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const hasilPerhitunganService = {
  // Get ranking detail by pekerjaan ID - Updated untuk struktur API baru
  async getRankingDetail(pekerjaanId: number): Promise<RankingResponse['data']> {
    try {
      console.log('Fetching ranking detail for pekerjaan ID:', pekerjaanId);
      
      const response = await axios.get<RankingResponse>(
        `${API_URL}/api/perhitungan/ranking/detail/${pekerjaanId}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Ranking detail response:', response.data);
      
      if (response.data.status === 'success') {
        // Validate and process response data
        const data = response.data.data;
        
        // Pastikan tahapan_perhitungan memiliki struktur yang benar
        if (!data.tahapan_perhitungan) {
          console.warn('Tahapan perhitungan tidak ditemukan dalam response');
          data.tahapan_perhitungan = {
            tabel_1_input_values: [],
            tabel_2_gap_calculation: [],
            tabel_3_bobot_nilai: [],
            tabel_7_hasil_akhir: []
          };
        }
        
        // Ensure tabel_2_gap_calculation exists (compatibility dengan struktur lama)
        if (!data.tahapan_perhitungan.tabel_2_gap_calculation && (data.tahapan_perhitungan as any).tabel_2_target_dan_gap) {
          console.log('Converting tabel_2_target_dan_gap to tabel_2_gap_calculation for compatibility');
          data.tahapan_perhitungan.tabel_2_gap_calculation = (data.tahapan_perhitungan as any).tabel_2_target_dan_gap;
        }
        
        // Add default conversion info if not provided
        if (!data.conversion_info) {
          data.conversion_info = {
            sangat_baik: '81-100 = 5',
            baik: '61-80 = 4',
            cukup_baik: '41-60 = 3',
            kurang_baik: '21-40 = 2'
          };
        }
        
        console.log('Processed ranking data:', data);
        return data;
      }
      
      throw new Error('Gagal memuat data ranking');
    } catch (error: any) {
      console.error('Get ranking detail error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        throw new Error('Data ranking tidak ditemukan untuk pekerjaan ini. Pastikan perhitungan Profile Matching sudah dilakukan.');
      } else if (error.response?.status === 400) {
        throw new Error('Permintaan tidak valid. Periksa ID pekerjaan yang dipilih.');
      } else if (error.response?.status === 500) {
        throw new Error('Terjadi kesalahan server. Silakan coba lagi atau hubungi administrator.');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memuat data ranking');
    }
  }
};