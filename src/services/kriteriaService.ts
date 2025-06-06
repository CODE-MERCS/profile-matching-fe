import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Interface untuk Kriteria berdasarkan API response
export interface Kriteria {
  id_kriteria: number;
  namakriteria: string;
  bobot: number;
  createdAt: string;
  updatedAt: string;
  subkriterias?: Subkriteria[];
  pekerjaan?: Pekerjaan;
}

// Interface untuk Subkriteria
export interface Subkriteria {
  id_subkriteria: number;
  namasubkriteria: string;
  namakriteria: string;
  nilaitarget: number;
  status: string;
  kriteria_id: number;
}

// Interface untuk Pekerjaan berdasarkan API response
export interface Pekerjaan {
  id_pekerjaan: number;
  namapekerjaan: string;
  createdAt: string;
  updatedAt: string;
}

// Interface untuk Pekerjaan Detail dengan kriteria (untuk SubkriteriaForm)
export interface PekerjaanDetail {
  id_pekerjaan: number;
  namapekerjaan: string;
  createdAt: string;
  updatedAt: string;
  kriterias: KriteriaFromPekerjaan[];
}

// Interface untuk Kriteria dari response pekerjaan by ID
export interface KriteriaFromPekerjaan {
  id_kriteria: number;
  namakriteria: string;
  bobot: number;
  pekerjaan_id: number;
  createdAt: string;
  updatedAt: string;
  subkriterias: any[];
}

// Interface untuk data yang ditampilkan di frontend
export interface KriteriaDisplay {
  id: string;
  nama: string;
  bobot: number;
  pekerjaan: string;
  jumlahSubkriteria: number;
  tanggalDibuat: string;
}

// Interface untuk request create kriteria
export interface CreateKriteriaRequest {
  namakriteria: string;
  bobot: number;
  pekerjaan_id?: number;
}

// Interface untuk request update kriteria
export interface UpdateKriteriaRequest {
  namakriteria?: string;
  bobot?: number;
  pekerjaan_id?: number;
}

// Interface untuk API response
export interface KriteriaResponse {
  status?: string;
  data?: Kriteria[];
}

export interface SingleKriteriaResponse {
  status?: string;
  data?: Kriteria;
}

// Helper function untuk mendapatkan token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function untuk mapping data API ke format display
const mapKriteriaToDisplay = (kriteria: Kriteria): KriteriaDisplay => {
  // Cari nama pekerjaan dari data yang ada di kriteria response
  let namaPekerjaan = 'Belum ditentukan';
  
  // Jika ada relasi pekerjaan di response
  if (kriteria.pekerjaan && kriteria.pekerjaan.namapekerjaan) {
    namaPekerjaan = kriteria.pekerjaan.namapekerjaan;
  }
  
  return {
    id: `KRT-${String(kriteria.id_kriteria).padStart(3, '0')}`,
    nama: kriteria.namakriteria,
    bobot: kriteria.bobot,
    pekerjaan: namaPekerjaan,
    jumlahSubkriteria: kriteria.subkriterias?.length || 0,
    tanggalDibuat: kriteria.createdAt.split('T')[0], // Format YYYY-MM-DD
  };
};

// Helper function untuk mapping data display ke format API
const mapDisplayToKriteria = (display: Partial<KriteriaDisplay>, pekerjaan_id?: number): CreateKriteriaRequest => ({
  namakriteria: display.nama || '',
  bobot: display.bobot || 0,
  pekerjaan_id: pekerjaan_id,
});

export const kriteriaService = {
  // Get all kriteria
  async getAllKriteria(): Promise<KriteriaDisplay[]> {
    try {
      const response = await axios.get(
        `${API_URL}/kriteria`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Get kriteria response:', response.data);
      
      // Handle berbagai format response
      let kriteriaData: Kriteria[] = [];
      
      if (Array.isArray(response.data)) {
        kriteriaData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        kriteriaData = response.data.data;
      } else if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        kriteriaData = response.data.data;
      }
      
      return kriteriaData.map(mapKriteriaToDisplay);
    } catch (error: any) {
      console.error('Get kriteria error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memuat data kriteria');
    }
  },

  // Get kriteria by ID
  async getKriteriaById(id: number): Promise<KriteriaDisplay> {
    try {
      const response = await axios.get(
        `${API_URL}/kriteria/${id}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Get kriteria by ID response:', response.data);
      
      let kriteriaData: Kriteria;
      
      if (response.data.data) {
        kriteriaData = response.data.data;
      } else {
        kriteriaData = response.data;
      }
      
      return mapKriteriaToDisplay(kriteriaData);
    } catch (error: any) {
      console.error('Get kriteria by ID error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        throw new Error('Kriteria tidak ditemukan');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memuat data kriteria');
    }
  },

  // Create new kriteria
  async createKriteria(kriteriaInput: Partial<KriteriaDisplay>, pekerjaan_id?: number): Promise<KriteriaDisplay> {
    try {
      const requestData = mapDisplayToKriteria(kriteriaInput, pekerjaan_id);
      
      const response = await axios.post(
        `${API_URL}/kriteria`,
        requestData,
        { headers: getAuthHeaders() }
      );
      
      console.log('Create kriteria response:', response.data);
      
      let responseKriteria: Kriteria;
      
      if (response.data.data) {
        responseKriteria = response.data.data;
      } else {
        responseKriteria = response.data;
      }
      
      return mapKriteriaToDisplay(responseKriteria);
    } catch (error: any) {
      console.error('Create kriteria error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Data yang dimasukkan tidak valid');
      } else if (error.response?.status === 422) {
        throw new Error('Data tidak valid atau sudah ada');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal menambahkan kriteria');
    }
  },

  // Update kriteria
  async updateKriteria(id: number, kriteriaInput: Partial<KriteriaDisplay>, pekerjaan_id?: number): Promise<KriteriaDisplay> {
    try {
      const requestData: UpdateKriteriaRequest = {};
      
      if (kriteriaInput.nama) requestData.namakriteria = kriteriaInput.nama;
      if (kriteriaInput.bobot !== undefined) requestData.bobot = kriteriaInput.bobot;
      if (pekerjaan_id !== undefined) requestData.pekerjaan_id = pekerjaan_id;
      
      const response = await axios.put(
        `${API_URL}/kriteria/${id}`,
        requestData,
        { headers: getAuthHeaders() }
      );
      
      console.log('Update kriteria response:', response.data);
      
      let responseKriteria: Kriteria;
      
      if (response.data.data) {
        responseKriteria = response.data.data;
      } else {
        responseKriteria = response.data;
      }
      
      return mapKriteriaToDisplay(responseKriteria);
    } catch (error: any) {
      console.error('Update kriteria error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        throw new Error('Kriteria tidak ditemukan');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Data yang dimasukkan tidak valid');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memperbarui data kriteria');
    }
  },

  // Delete kriteria
  async deleteKriteria(id: number): Promise<void> {
    try {
      console.log('Deleting kriteria with ID:', id);
      
      const response = await axios.delete(
        `${API_URL}/kriteria/${id}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Delete kriteria response:', response.data);
      console.log('Delete response status:', response.status);
      
      // Untuk DELETE, biasanya status 200 atau 204 menandakan sukses
      if (response.status === 200 || response.status === 204) {
        return; // Berhasil dihapus
      }
      
      // Cek jika ada response dengan status success
      if (response.data && (response.data.status === 'success' || response.data.message)) {
        return;
      }
      
      throw new Error('Gagal menghapus kriteria');
    } catch (error: any) {
      console.error('Delete kriteria error:', error.response?.data || error);
      
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
      
      throw new Error(error.response?.data?.message || 'Gagal menghapus kriteria');
    }
  },

  // Helper function untuk extract ID dari display ID (KRT-001 -> 1)
  extractIdFromDisplayId(displayId: string): number {
    const match = displayId.match(/K-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
};