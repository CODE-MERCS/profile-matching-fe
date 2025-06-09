import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Interface untuk Pelamar berdasarkan API response
export interface Pelamar {
  id_pelamar: number;
  namapelamar: string;
  nopelamar: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Interface untuk data yang ditampilkan di frontend (mapping dari API)
export interface PelamarDisplay {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  tanggalLamar: string;
}

// Interface untuk request tambah pelamar
export interface CreatePelamarRequest {
  namapelamar: string;
  nopelamar: string;
  email: string;
}

// Interface untuk request update pelamar
export interface UpdatePelamarRequest {
  namapelamar?: string;
  nopelamar?: string;
  email?: string;
}

// Interface untuk API response
export interface PelamarResponse {
  status: string;
  data: Pelamar[];
}

export interface SinglePelamarResponse {
  status: string;
  data: Pelamar;
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
const mapPelamarToDisplay = (pelamar: Pelamar): PelamarDisplay => ({
  id: `A-${String(pelamar.id_pelamar).padStart(3, '0')}`,
  nama: pelamar.namapelamar,
  email: pelamar.email,
  telepon: pelamar.nopelamar,
  tanggalLamar: pelamar.createdAt.split('T')[0], // Format YYYY-MM-DD
});

// Helper function untuk mapping data display ke format API
const mapDisplayToPelamar = (display: Partial<PelamarDisplay>): CreatePelamarRequest => ({
  namapelamar: display.nama || '',
  nopelamar: display.telepon || '',
  email: display.email || '',
});

export const pelamarService = {
  // Get all pelamar
  async getAllPelamar(): Promise<PelamarDisplay[]> {
    try {
      const response = await axios.get<PelamarResponse>(
        `${API_URL}/pelamar`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Get pelamar response:', response.data);
      
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        return response.data.data.map(mapPelamarToDisplay);
      }
      
      return [];
    } catch (error: any) {
      console.error('Get pelamar error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memuat data pelamar');
    }
  },

  // Get pelamar by ID
  async getPelamarById(id: number): Promise<PelamarDisplay> {
    try {
      const response = await axios.get<SinglePelamarResponse>(
        `${API_URL}/pelamar/${id}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Get pelamar by ID response:', response.data);
      
      if (response.data.status === 'success') {
        return mapPelamarToDisplay(response.data.data);
      }
      
      throw new Error('Data pelamar tidak ditemukan');
    } catch (error: any) {
      console.error('Get pelamar by ID error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        throw new Error('Pelamar tidak ditemukan');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memuat data pelamar');
    }
  },

  // Create new pelamar
  async createPelamar(pelamarData: Partial<PelamarDisplay>): Promise<PelamarDisplay> {
    try {
      const requestData = mapDisplayToPelamar(pelamarData);
      
      const response = await axios.post<SinglePelamarResponse>(
        `${API_URL}/pelamar`,
        requestData,
        { headers: getAuthHeaders() }
      );
      
      console.log('Create pelamar response:', response.data);
      
      if (response.data.status === 'success') {
        return mapPelamarToDisplay(response.data.data);
      }
      
      throw new Error('Gagal menambahkan pelamar');
    } catch (error: any) {
      console.error('Create pelamar error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Data yang dimasukkan tidak valid');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal menambahkan pelamar');
    }
  },

  // Update pelamar
  async updatePelamar(id: number, pelamarData: Partial<PelamarDisplay>): Promise<PelamarDisplay> {
    try {
      const requestData: UpdatePelamarRequest = {};
      
      if (pelamarData.nama) requestData.namapelamar = pelamarData.nama;
      if (pelamarData.telepon) requestData.nopelamar = pelamarData.telepon;
      if (pelamarData.email) requestData.email = pelamarData.email;
      
      const response = await axios.put<SinglePelamarResponse>(
        `${API_URL}/pelamar/${id}`,
        requestData,
        { headers: getAuthHeaders() }
      );
      
      console.log('Update pelamar response:', response.data);
      
      if (response.data.status === 'success') {
        return mapPelamarToDisplay(response.data.data);
      }
      
      throw new Error('Gagal memperbarui data pelamar');
    } catch (error: any) {
      console.error('Update pelamar error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        throw new Error('Pelamar tidak ditemukan');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Data yang dimasukkan tidak valid');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal memperbarui data pelamar');
    }
  },

  // Delete pelamar
  async deletePelamar(id: number): Promise<void> {
    try {
      const response = await axios.delete(
        `${API_URL}/pelamar/${id}`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Delete pelamar response:', response.data);
      
      if (response.data.status !== 'success') {
        throw new Error('Gagal menghapus pelamar');
      }
    } catch (error: any) {
      console.error('Delete pelamar error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 404) {
        throw new Error('Pelamar tidak ditemukan');
      }
      
      throw new Error(error.response?.data?.message || 'Gagal menghapus pelamar');
    }
  },

  // Helper function untuk extract ID dari display ID (APL-001 -> 1)
  extractIdFromDisplayId(displayId: string): number {
    const match = displayId.match(/A-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
};