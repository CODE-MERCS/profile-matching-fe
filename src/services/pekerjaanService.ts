import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Interface untuk Pekerjaan berdasarkan API response
export interface Pekerjaan {
  id_pekerjaan: number;
  namapekerjaan: string;
  createdAt: string;
  updatedAt: string;
}

// Interface untuk request create pekerjaan
export interface CreatePekerjaanRequest {
  namapekerjaan: string;
}

// Interface untuk request update pekerjaan
export interface UpdatePekerjaanRequest {
  namapekerjaan: string;
}

// Interface untuk API response
export interface PekerjaanResponse {
  status: string;
  data: Pekerjaan[];
}

export interface SinglePekerjaanResponse {
  status: string;
  data: Pekerjaan;
}

// Helper function untuk mendapatkan token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const pekerjaanService = {
  // Get all pekerjaan
  async getAllPekerjaan(): Promise<Pekerjaan[]> {
    try {
      const response = await axios.get(
        `${API_URL}/pekerjaan`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Get pekerjaan response:', response.data);
      
      // Cek berbagai format response yang mungkin
      if (response.data) {
        // Jika response.data.data adalah array
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Jika response.data langsung adalah array
        if (Array.isArray(response.data)) {
          return response.data;
        }
        // Jika success dengan data kosong
        if (response.data.status === 'success' && !response.data.data) {
          return [];
        }
      }
      
      return [];
    } catch (error: any) {
      console.error('Get pekerjaan error:', error.response?.data || error.message || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Gagal memuat data pekerjaan');
    }
  },

  // Get pekerjaan by ID
  async getPekerjaanById(id: number): Promise<Pekerjaan> {
    try {
      const response = await axios.get<SinglePekerjaanResponse>(
        `${API_URL}/pekerjaan/${id}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Get pekerjaan by ID response:', response.data);
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Data pekerjaan tidak ditemukan');
    } catch (error: any) {
      console.error('Get pekerjaan by ID error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        throw new Error('Pekerjaan tidak ditemukan');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memuat data pekerjaan');
    }
  },

  // Create new pekerjaan
  async createPekerjaan(pekerjaanData: CreatePekerjaanRequest): Promise<Pekerjaan> {
    try {
      const response = await axios.post(
        `${API_URL}/pekerjaan`,
        pekerjaanData,
        { headers: getAuthHeaders() }
      );
      
      console.log('Create pekerjaan response:', response.data);
      
      // Cek berbagai format response yang mungkin
      if (response.data && (response.data.status === 'success' || response.status === 200 || response.status === 201)) {
        // Jika ada response.data.data, gunakan itu. Jika tidak, gunakan response.data
        return response.data.data || response.data;
      }
      
      throw new Error('Gagal menambahkan pekerjaan');
    } catch (error: any) {
      console.error('Create pekerjaan error:', error.response?.data || error.message || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Data yang dimasukkan tidak valid');
      } else if (error.response?.status === 422) {
        throw new Error('Data tidak valid atau sudah ada');
      }
      
      // Jika tidak ada response (network error), tampilkan pesan yang berbeda
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Gagal menambahkan pekerjaan');
    }
  },

  // Update pekerjaan
  async updatePekerjaan(id: number, pekerjaanData: UpdatePekerjaanRequest): Promise<Pekerjaan> {
    try {
      const response = await axios.put(
        `${API_URL}/pekerjaan/${id}`,
        pekerjaanData,
        { headers: getAuthHeaders() }
      );
      
      console.log('Update pekerjaan response:', response.data);
      
      // Cek berbagai format response yang mungkin
      if (response.data && (response.data.status === 'success' || response.status === 200)) {
        return response.data.data || response.data;
      }
      
      throw new Error('Gagal memperbarui data pekerjaan');
    } catch (error: any) {
      console.error('Update pekerjaan error:', error.response?.data || error.message || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        throw new Error('Pekerjaan tidak ditemukan');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Data yang dimasukkan tidak valid');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Gagal memperbarui data pekerjaan');
    }
  },

  // Delete pekerjaan
  async deletePekerjaan(id: number): Promise<void> {
    try {
      console.log('Deleting pekerjaan with ID:', id); // Debug log
      
      const response = await axios.delete(
        `${API_URL}/pekerjaan/${id}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Delete pekerjaan response:', response.data);
      console.log('Delete response status:', response.status);
      
      // Untuk DELETE, biasanya status 200 atau 204 menandakan sukses
      if (response.status === 200 || response.status === 204) {
        return; // Berhasil dihapus
      }
      
      // Cek jika ada response dengan status success
      if (response.data && response.data.status === 'success') {
        return;
      }
      
      throw new Error('Gagal menghapus pekerjaan');
    } catch (error: any) {
      console.error('Delete pekerjaan error:', error.response?.data || error.message || error);
      
      // Jika status 404, kemungkinan sudah terhapus
      if (error.response?.status === 404) {
        console.log('Item already deleted or not found');
        return; // Anggap berhasil karena item sudah tidak ada
      }
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      // Jika error tapi data berhasil terhapus di database, jangan lempar error
      if (error.response?.status >= 200 && error.response?.status < 300) {
        return;
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Gagal menghapus pekerjaan');
    }
  }
};