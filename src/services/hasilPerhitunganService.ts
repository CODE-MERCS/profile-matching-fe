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

// Interface untuk ranking response
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
  // Get ranking detail by pekerjaan ID
  async getRankingDetail(pekerjaanId: number): Promise<RankingResponse['data']> {
    try {
      console.log('Fetching ranking detail for pekerjaan ID:', pekerjaanId);
      
      const response = await axios.get<RankingResponse>(
        `${API_URL}/api/perhitungan/ranking/detail/${pekerjaanId}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Ranking detail response:', response.data);
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Gagal memuat data ranking');
    } catch (error: any) {
      console.error('Get ranking detail error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        throw new Error('Data ranking tidak ditemukan untuk pekerjaan ini');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memuat data ranking');
    }
  }
};