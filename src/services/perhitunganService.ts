import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Interface untuk Subkriteria dari response form
export interface SubkriteriaForm {
  id_subkriteria: number;
  namasubkriteria: string;
  nilaitarget: number;
  status: string;
  kode: string;
}

// Interface untuk Kriteria dari response form
export interface KriteriaForm {
  id_kriteria: number;
  namakriteria: string;
  bobot: number;
  subkriterias: SubkriteriaForm[];
}

// Interface untuk Pekerjaan dari response form
export interface PekerjaanForm {
  id_pekerjaan: number;
  namapekerjaan: string;
}

// Interface untuk Pelamar dari response form
export interface PelamarForm {
  id_pelamar: number;
  namapelamar: string;
  nopelamar: string;
  kode: string;
}

// Interface untuk data form perhitungan
export interface PerhitunganFormData {
  pekerjaan: PekerjaanForm;
  kriterias: KriteriaForm[];
  pelamars: PelamarForm[];
  existing_values: {
    [pelamar_id: string]: {
      [subkriteria_id: string]: number;
    };
  };
  conversion_info: {
    sangat_baik: string;
    baik: string;
    cukup_baik: string;
    kurang_baik: string;
  };
}

// Interface untuk response API form
export interface PerhitunganFormResponse {
  status: string;
  data: PerhitunganFormData;
}

// Interface untuk matrix data yang akan dikirim (updated untuk nilai 0-100)
export interface MatrixData {
  [pelamar_id: string]: {
    [subkriteria_id: string]: number; // Nilai 0-100 (bukan 1-5 seperti sebelumnya)
  };
}

// Interface untuk bulk calculate request
export interface BulkCalculateRequest {
  pekerjaan_id: number;
  matrix_data: MatrixData;
}

// Interface untuk kriteria scores dalam ranking details
export interface KriteriaScore {
  kriteria_id: number;
  kriteria_name: string;
  target: number;
  gap: number;
  ncf: number;
  nsf: number;
  total: number;
}

// Interface untuk final calculation details
export interface FinalCalculationDetail {
  kriteria_name: string;
  total: number;
  bobot_persen: number;
  contribution: number;
}

// Interface untuk final calculation
export interface FinalCalculation {
  score: number;
  formula: string;
  details: {
    [key: string]: FinalCalculationDetail;
  };
}

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
    [key: string]: KriteriaScore;
  };
  final_calculation: FinalCalculation;
}

// Interface untuk ranking summary
export interface RankingSummary {
  peringkat: number;
  namapelamar: string;
  hasil_akhir: number;
}

// Interface untuk perhitungan summary
export interface PerhitunganSummary {
  total_pelamar: number;
  total_kriteria: number;
  total_detail_records: number;
  total_agregat_records: number;
  completeness: {
    is_complete: boolean;
    warnings: string[];
  };
}

// Interface untuk bulk calculate response (updated untuk struktur baru)
export interface BulkCalculateResponse {
  status: string;
  message: string;
  data: {
    pekerjaan: PekerjaanForm;
    perhitungan_summary: PerhitunganSummary;
    ranking_summary: RankingSummary[];
    ranking_details: RankingDetail[];
    tahapan_perhitungan: {
      tabel_1_input_values: any[];
      tabel_2_gap_calculation: any[]; // Updated: sekarang menggunakan gap_calculation bukan target_dan_gap
      tabel_3_bobot_nilai: any[];
      tabel_4_cf_sf_kriteria_1: any[];
      tabel_5_cf_sf_kriteria_2: any[];
      tabel_6_cf_sf_kriteria_3: any[];
      tabel_7_hasil_akhir: any[]; // Dynamic columns berdasarkan kriteria
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

export const perhitunganService = {
  // Get form data untuk perhitungan berdasarkan pekerjaan ID
  async getFormData(pekerjaanId: number): Promise<PerhitunganFormData> {
    try {
      console.log('Fetching form data for pekerjaan ID:', pekerjaanId);
      
      const response = await axios.get<PerhitunganFormResponse>(
        `${API_URL}/api/perhitungan/form/${pekerjaanId}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Form data response:', response.data);
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Gagal memuat data form perhitungan');
    } catch (error: any) {
      console.error('Get form data error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        throw new Error('Data pekerjaan tidak ditemukan atau belum memiliki kriteria dan pelamar yang cukup');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memuat data form perhitungan');
    }
  },

  // Submit bulk calculate - Updated untuk API baru
  async submitBulkCalculate(data: BulkCalculateRequest): Promise<BulkCalculateResponse> {
    try {
      console.log('Submitting bulk calculate:', data);
      
      // Validate matrix data sebelum dikirim
      const validatedMatrixData: MatrixData = {};
      
      Object.keys(data.matrix_data).forEach(pelamarId => {
        validatedMatrixData[pelamarId] = {};
        Object.keys(data.matrix_data[pelamarId]).forEach(subkriteriaId => {
          const value = data.matrix_data[pelamarId][subkriteriaId];
          // Pastikan nilai dalam range 0-100
          if (value < 0 || value > 100) {
            throw new Error(`Nilai untuk pelamar ${pelamarId} subkriteria ${subkriteriaId} harus antara 0-100`);
          }
          validatedMatrixData[pelamarId][subkriteriaId] = value;
        });
      });
      
      const requestData = {
        pekerjaan_id: data.pekerjaan_id,
        matrix_data: validatedMatrixData
      };
      
      const response = await axios.post<BulkCalculateResponse>(
        `${API_URL}/api/perhitungan/bulk-calculate`,
        requestData,
        { headers: getAuthHeaders() }
      );
      
      console.log('Bulk calculate response:', response.data);
      
      if (response.data.status === 'success') {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Gagal memproses perhitungan');
    } catch (error: any) {
      console.error('Bulk calculate error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Data yang dikirim tidak valid. Pastikan semua nilai berada dalam rentang 0-100.');
      } else if (error.response?.status === 422) {
        throw new Error('Data tidak valid atau format salah. Periksa kembali input nilai.');
      } else if (error.response?.status === 500) {
        throw new Error('Terjadi kesalahan server. Silakan coba lagi atau hubungi administrator.');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Gagal memproses perhitungan');
    }
  }
};