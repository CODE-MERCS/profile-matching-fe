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

// Interface untuk matrix data yang akan dikirim
export interface MatrixData {
  [pelamar_id: string]: {
    [subkriteria_id: string]: number;
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

// Interface untuk bulk calculate response
export interface BulkCalculateResponse {
  status: string;
  message: string;
  data: {
    pekerjaan: PekerjaanForm;
    perhitungan_summary: PerhitunganSummary;
    ranking_summary: RankingSummary[];
    ranking_details: RankingDetail[];
    tahapan_perhitungan: any; // Detailed calculation steps
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
        throw new Error('Data pekerjaan tidak ditemukan atau belum memiliki kriteria');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memuat data form perhitungan');
    }
  },

  // Submit bulk calculate - mengganti bulk input matrix
  async submitBulkCalculate(data: BulkCalculateRequest): Promise<BulkCalculateResponse> {
    try {
      console.log('Submitting bulk calculate:', data);
      
      const response = await axios.post<BulkCalculateResponse>(
        `${API_URL}/api/perhitungan/bulk-calculate`,
        data,
        { headers: getAuthHeaders() }
      );
      
      console.log('Bulk calculate response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Bulk calculate error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Data yang dikirim tidak valid');
      } else if (error.response?.status === 422) {
        throw new Error('Data tidak valid atau format salah');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memproses perhitungan');
    }
  }
};