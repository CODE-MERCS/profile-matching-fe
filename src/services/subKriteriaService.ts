import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Interface untuk Subkriteria berdasarkan API response
export interface Subkriteria {
  id_subkriteria: number;
  namasubkriteria: string;
  nilaitarget: number;
  status: string;
  kriteria_id: number;
  createdAt: string;
  updatedAt: string;
  kriteria?: {
    id_kriteria: number;
    namakriteria: string;
    bobot: number;
    pekerjaan_id: number;
    createdAt: string;
    updatedAt: string;
    pekerjaan?: {
      id_pekerjaan: number;
      namapekerjaan: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

// Interface untuk Kriteria (untuk dropdown)
export interface KriteriaOption {
  id_kriteria: number;
  namakriteria: string;
  bobot: number;
  pekerjaan_id?: number;
  createdAt: string;
  updatedAt: string;
}

// Interface untuk data yang ditampilkan di frontend
export interface SubkriteriaDisplay {
  id: string;
  nama: string;
  nilaiTarget: number;
  status: string;
  statusLabel: string;
  kriteria: string;
  pekerjaan: string;
  tanggalDibuat: string;
}

// Interface untuk request create subkriteria
export interface CreateSubkriteriaRequest {
  namasubkriteria: string;
  nilaitarget: number;
  status: string;
  kriteria_id: number;
}

// Interface untuk request update subkriteria
export interface UpdateSubkriteriaRequest {
  namasubkriteria?: string;
  nilaitarget?: number;
  status?: string;
  kriteria_id?: number;
}

// Interface untuk API response
export interface SubkriteriaResponse {
  status?: string;
  data?: Subkriteria[];
}

export interface SingleSubkriteriaResponse {
  status?: string;
  data?: Subkriteria;
}

// Status options untuk dropdown
export const STATUS_OPTIONS = [
  { value: 'CF', label: 'Core Factor (CF)' },
  { value: 'SF', label: 'Secondary Factor (SF)' }
] as const;

// Helper function untuk mendapatkan token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function untuk mapping status ke label
const getStatusLabel = (status: string): string => {
  const statusOption = STATUS_OPTIONS.find(option => option.value === status);
  return statusOption ? statusOption.label : status;
};

// Helper function untuk mapping data API ke format display
const mapSubkriteriaToDisplay = (subkriteria: Subkriteria): SubkriteriaDisplay => ({
  id: `S-${String(subkriteria.id_subkriteria).padStart(3, '0')}`,
  nama: subkriteria.namasubkriteria,
  nilaiTarget: subkriteria.nilaitarget,
  status: subkriteria.status,
  statusLabel: getStatusLabel(subkriteria.status),
  kriteria: subkriteria.kriteria?.namakriteria || 'Tidak ditemukan',
  pekerjaan: subkriteria.kriteria?.pekerjaan?.namapekerjaan || 'Belum ditentukan',
  tanggalDibuat: subkriteria.createdAt.split('T')[0], // Format YYYY-MM-DD
});

// Helper function untuk mapping data display ke format API
const mapDisplayToSubkriteria = (display: Partial<SubkriteriaDisplay>, kriteria_id: number): CreateSubkriteriaRequest => ({
  namasubkriteria: display.nama || '',
  nilaitarget: display.nilaiTarget || 0,
  status: display.status || 'CF',
  kriteria_id: kriteria_id,
});

export const subkriteriaService = {
  // Get all subkriteria
  async getAllSubkriteria(): Promise<SubkriteriaDisplay[]> {
    try {
      const response = await axios.get(
        `${API_URL}/subkriteria`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Get subkriteria response:', response.data);
      
      // Handle berbagai format response
      let subkriteriaData: Subkriteria[] = [];
      
      if (Array.isArray(response.data)) {
        subkriteriaData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        subkriteriaData = response.data.data;
      } else if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        subkriteriaData = response.data.data;
      }
      
      return subkriteriaData.map(mapSubkriteriaToDisplay);
    } catch (error: any) {
      console.error('Get subkriteria error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memuat data subkriteria');
    }
  },

  // Get subkriteria by ID
  async getSubkriteriaById(id: number): Promise<SubkriteriaDisplay> {
    try {
      const response = await axios.get(
        `${API_URL}/subkriteria/${id}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Get subkriteria by ID response:', response.data);
      
      let subkriteriaData: Subkriteria;
      
      if (response.data.data) {
        subkriteriaData = response.data.data;
      } else {
        subkriteriaData = response.data;
      }
      
      return mapSubkriteriaToDisplay(subkriteriaData);
    } catch (error: any) {
      console.error('Get subkriteria by ID error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        throw new Error('Subkriteria tidak ditemukan');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memuat data subkriteria');
    }
  },

  // Create new subkriteria
  async createSubkriteria(subkriteriaInput: Partial<SubkriteriaDisplay>, kriteria_id: number): Promise<SubkriteriaDisplay> {
    try {
      // Map data menggunakan function yang benar
      const requestData: CreateSubkriteriaRequest = {
        namasubkriteria: subkriteriaInput.nama || '',
        nilaitarget: subkriteriaInput.nilaiTarget || 0,
        status: subkriteriaInput.status || 'CF',
        kriteria_id: kriteria_id,
      };
      
      const response = await axios.post(
        `${API_URL}/subkriteria`,
        requestData,
        { headers: getAuthHeaders() }
      );
      
      console.log('Create subkriteria response:', response.data);
      
      let responseSubkriteria: Subkriteria;
      
      if (response.data.data) {
        responseSubkriteria = response.data.data;
      } else {
        responseSubkriteria = response.data;
      }
      
      return mapSubkriteriaToDisplay(responseSubkriteria);
    } catch (error: any) {
      console.error('Create subkriteria error:', error.response?.data || error);
      
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
      
      throw new Error(error.response?.data?.message || 'Gagal menambahkan subkriteria');
    }
  },

  // Update subkriteria
  async updateSubkriteria(id: number, subkriteriaInput: Partial<SubkriteriaDisplay>, kriteria_id?: number): Promise<SubkriteriaDisplay> {
    try {
      const requestData: UpdateSubkriteriaRequest = {};
      
      if (subkriteriaInput.nama) requestData.namasubkriteria = subkriteriaInput.nama;
      if (subkriteriaInput.nilaiTarget !== undefined) requestData.nilaitarget = subkriteriaInput.nilaiTarget;
      if (subkriteriaInput.status) requestData.status = subkriteriaInput.status;
      if (kriteria_id !== undefined) requestData.kriteria_id = kriteria_id;
      
      const response = await axios.put(
        `${API_URL}/subkriteria/${id}`,
        requestData,
        { headers: getAuthHeaders() }
      );
      
      console.log('Update subkriteria response:', response.data);
      
      let responseSubkriteria: Subkriteria;
      
      if (response.data.data) {
        responseSubkriteria = response.data.data;
      } else {
        responseSubkriteria = response.data;
      }
      
      return mapSubkriteriaToDisplay(responseSubkriteria);
    } catch (error: any) {
      console.error('Update subkriteria error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        throw new Error('Subkriteria tidak ditemukan');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Data yang dimasukkan tidak valid');
      }
      
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memperbarui data subkriteria');
    }
  },

  // Delete subkriteria
  async deleteSubkriteria(id: number): Promise<void> {
    try {
      console.log('Deleting subkriteria with ID:', id);
      
      const response = await axios.delete(
        `${API_URL}/subkriteria/${id}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Delete subkriteria response:', response.data);
      console.log('Delete response status:', response.status);
      
      // Untuk DELETE, biasanya status 200 atau 204 menandakan sukses
      if (response.status === 200 || response.status === 204) {
        return; // Berhasil dihapus
      }
      
      // Cek jika ada response dengan status success
      if (response.data && (response.data.status === 'success' || response.data.message)) {
        return;
      }
      
      throw new Error('Gagal menghapus subkriteria');
    } catch (error: any) {
      console.error('Delete subkriteria error:', error.response?.data || error);
      
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
      
      throw new Error(error.response?.data?.message || 'Gagal menghapus subkriteria');
    }
  },

  // Helper function untuk extract ID dari display ID (SUB-001 -> 1)
  extractIdFromDisplayId(displayId: string): number {
    const match = displayId.match(/S-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
};