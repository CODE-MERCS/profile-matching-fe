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

// Interface untuk data form perhitungan
export interface PerhitunganFormData {
  pekerjaan: PekerjaanForm;
  kriterias: KriteriaForm[];
  pelamars: any[];
  existing_values: any;
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

// Interface untuk bulk input request
export interface BulkInputMatrixRequest {
  pekerjaan_id: number;
  matrix_data: MatrixData;
}

// Interface untuk bulk input response
export interface BulkInputMatrixResponse {
  status: string;
  message: string;
  data?: any;
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

  // Submit bulk input matrix data
  async submitBulkInputMatrix(data: BulkInputMatrixRequest): Promise<BulkInputMatrixResponse> {
    try {
      console.log('Submitting bulk input matrix:', data);
      
      const response = await axios.post<BulkInputMatrixResponse>(
        `${API_URL}/api/perhitungan/bulk-input-matrix`,
        data,
        { headers: getAuthHeaders() }
      );
      
      console.log('Bulk input matrix response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Bulk input matrix error:', error.response?.data || error);
      
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
      
      throw new Error(error.response?.data?.message || 'Gagal menyimpan data matrix');
    }
  }
};