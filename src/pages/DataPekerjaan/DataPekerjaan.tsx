// src/pages/DataPekerjaan/DataPekerjaan.tsx
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/molecules/DataTable/DataTable';
import Button from '../../components/atoms/Button/Button';
import SearchInput from '../../components/atoms/SearchInput/SearchInput';
import Dropdown from '../../components/atoms/Dropdown/Dropdown';
import Modal from '../../components/organisms/Modal/Modal';
import PekerjaanForm from '../../components/organisms/PekerjaanForm/PekerjaanForm';
import DeleteConfirmation from '../../components/molecules/DeleteConfirmation/DeleteConfirmation';
import Toast from '../../components/atoms/Toast/Toast';
import { pekerjaanService, Pekerjaan } from '../../services/pekerjaanService';

const DataPekerjaan: React.FC = () => {
  // State untuk data dan UI
  const [pekerjaan, setPekerjaan] = useState<Pekerjaan[]>([]);
  const [filteredData, setFilteredData] = useState<Pekerjaan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPekerjaan, setCurrentPekerjaan] = useState<Pekerjaan | null>(null);
  const [toastMessage, setToastMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Definisi kolom untuk tabel
  const columns = [
    { 
      id: 'id_pekerjaan', 
      label: 'ID', 
      sortable: true 
    },
    { 
      id: 'namapekerjaan', 
      label: 'NAMA PEKERJAAN', 
      sortable: true 
    },
    { 
      id: 'actions', 
      label: 'ACTIONS', 
      sortable: false 
    }
  ];
  
  // Options untuk dropdown
  const entriesOptions = [10, 25, 50, 100];
  
  // Load data dari API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await pekerjaanService.getAllPekerjaan();
        setPekerjaan(data);
        setTotalEntries(data.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        setToastMessage({
          type: 'error',
          message: error instanceof Error ? error.message : 'Gagal memuat data pekerjaan.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter data berdasarkan pencarian
  useEffect(() => {
    const filterData = () => {
      if (!searchTerm.trim()) {
        setFilteredData(pekerjaan);
        return;
      }
      
      const filtered = pekerjaan.filter(item => 
        item.id_pekerjaan.toString().includes(searchTerm.toLowerCase()) || 
        item.namapekerjaan.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setFilteredData(filtered);
      setCurrentPage(1); // Reset ke halaman pertama saat pencarian
    };
    
    filterData();
  }, [searchTerm, pekerjaan]);
  
  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredData.slice(startIndex, endIndex);
  };
  
  // Calculate start index for numbering
  const getStartIndex = () => {
    return (currentPage - 1) * entriesPerPage;
  };
  
  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleEntriesPerPageChange = (value: string | number) => {
    setEntriesPerPage(Number(value));
    setCurrentPage(1); // Reset ke halaman pertama
  };
  
  const handleOpenAddModal = () => {
    setCurrentPekerjaan(null);
    setIsFormModalOpen(true);
  };
  
  const handleOpenEditModal = (item: Pekerjaan) => {
    setCurrentPekerjaan(item);
    setIsFormModalOpen(true);
  };
  
  const handleOpenDeleteModal = (item: Pekerjaan) => {
    setCurrentPekerjaan(item);
    setIsDeleteModalOpen(true);
  };
  
  const handleSubmitForm = async (data: { namapekerjaan: string }) => {
    try {
      console.log('Submitting form data:', data); // Debug log
      
      if (currentPekerjaan) {
        // Update existing
        console.log('Updating pekerjaan with ID:', currentPekerjaan.id_pekerjaan); // Debug log
        const updatedPekerjaan = await pekerjaanService.updatePekerjaan(
          currentPekerjaan.id_pekerjaan, 
          { namapekerjaan: data.namapekerjaan }
        );
        
        console.log('Updated pekerjaan:', updatedPekerjaan); // Debug log
        
        setPekerjaan(prev => 
          prev.map(item => 
            item.id_pekerjaan === currentPekerjaan.id_pekerjaan ? updatedPekerjaan : item
          )
        );
        
        setToastMessage({
          type: 'success',
          message: `Pekerjaan "${updatedPekerjaan.namapekerjaan}" berhasil diperbarui.`
        });
      } else {
        // Add new
        console.log('Creating new pekerjaan'); // Debug log
        const newPekerjaan = await pekerjaanService.createPekerjaan({ 
          namapekerjaan: data.namapekerjaan 
        });
        
        console.log('New pekerjaan created:', newPekerjaan); // Debug log
        
        setPekerjaan(prev => [...prev, newPekerjaan]);
        setTotalEntries(prev => prev + 1);
        
        setToastMessage({
          type: 'success',
          message: `Pekerjaan "${newPekerjaan.namapekerjaan}" berhasil ditambahkan.`
        });
      }
      
      setIsFormModalOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined
      }); // Enhanced debug log
      
      setToastMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.'
      });
    }
  };
  
  const handleDelete = async () => {
    if (!currentPekerjaan) return;
    
    try {
      console.log('Attempting to delete pekerjaan:', currentPekerjaan); // Debug log
      
      await pekerjaanService.deletePekerjaan(currentPekerjaan.id_pekerjaan);
      
      console.log('Delete successful, updating UI'); // Debug log
      
      // Update UI state
      setPekerjaan(prev => 
        prev.filter(item => item.id_pekerjaan !== currentPekerjaan.id_pekerjaan)
      );
      setTotalEntries(prev => prev - 1);
      
      setToastMessage({
        type: 'success',
        message: `Pekerjaan "${currentPekerjaan.namapekerjaan}" berhasil dihapus.`
      });
      
      setIsDeleteModalOpen(false);
      
      // Refresh data untuk memastikan konsistensi
      setTimeout(async () => {
        try {
          const refreshedData = await pekerjaanService.getAllPekerjaan();
          setPekerjaan(refreshedData);
          setTotalEntries(refreshedData.length);
        } catch (refreshError) {
          console.error('Error refreshing data:', refreshError);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error deleting item:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : undefined
      }); // Enhanced debug log
      
      // Jika data berhasil terhapus di database tapi ada error response,
      // cek apakah item masih ada di list
      const itemStillExists = pekerjaan.some(item => item.id_pekerjaan === currentPekerjaan.id_pekerjaan);
      
      if (!itemStillExists) {
        // Item sudah tidak ada, berarti delete berhasil
        setToastMessage({
          type: 'success',
          message: `Pekerjaan "${currentPekerjaan.namapekerjaan}" berhasil dihapus.`
        });
        setIsDeleteModalOpen(false);
      } else {
        // Item masih ada, tampilkan error
        setToastMessage({
          type: 'error',
          message: error instanceof Error ? error.message : 'Gagal menghapus data. Silakan coba lagi.'
        });
      }
    }
  };
  
  // Render row actions
  const renderActions = (item: Pekerjaan) => (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleOpenEditModal(item)}
      >
        Edit
      </Button>
      <Button 
        variant="danger" 
        size="sm" 
        onClick={() => handleOpenDeleteModal(item)}
      >
        Hapus
      </Button>
    </div>
  );
  
  return (
    <div className="p-6 max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Data Pekerjaan</h1>
        <p className="text-gray-600 mt-1">Kelola data pekerjaan yang tersedia dalam sistem.</p>
      </div>
      
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="primary" 
            onClick={handleOpenAddModal}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            }
          >
            Tambah Pekerjaan
          </Button>
        </div>
        
        <div className="w-full md:w-64">
          <SearchInput 
            placeholder="Cari pekerjaan..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {/* Entries Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-600">Tampilkan:</span>
          <Dropdown
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            options={entriesOptions.map(value => ({ value, label: String(value) }))}
            width="80px"
          />
          <span className="ml-2 text-sm text-gray-600">entri</span>
        </div>
        
        <div className="text-sm text-gray-600">
          Total: <span className="font-medium">{filteredData.length}</span> pekerjaan
          {filteredData.length !== totalEntries && ` (dari ${totalEntries} total)`}
        </div>
      </div>
      
      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={getCurrentPageData()}
          renderActions={renderActions}
          isLoading={isLoading}
          startIndex={getStartIndex()}
        />
        
        {/* Pagination */}
        <div className="px-4 py-3 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200">
          <div className="mb-2 sm:mb-0">
            <p className="text-sm text-gray-600">
              Menampilkan {filteredData.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0}-
              {Math.min(currentPage * entriesPerPage, filteredData.length)} dari {filteredData.length} entri
              {filteredData.length !== totalEntries && ` (difilter dari ${totalEntries} total)`}
            </p>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ◀
            </Button>
            
            {/* Pagination Numbers */}
            {Array.from({ length: Math.min(5, Math.ceil(filteredData.length / entriesPerPage)) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <Button
                  key={i}
                  variant={currentPage === pageNumber ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            {Math.ceil(filteredData.length / entriesPerPage) > 5 && (
              <>
                <span className="text-gray-500">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.ceil(filteredData.length / entriesPerPage))}
                >
                  {Math.ceil(filteredData.length / entriesPerPage)}
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredData.length / entriesPerPage)}
            >
              ▶
            </Button>
          </div>
        </div>
      </div>
      
      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={currentPekerjaan ? 'Edit Pekerjaan' : 'Tambah Pekerjaan'}
      >
        <PekerjaanForm
          initialData={currentPekerjaan}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
      >
        <DeleteConfirmation
          itemName={currentPekerjaan?.namapekerjaan || ''}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      </Modal>
      
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          message={toastMessage.message}
          onClose={() => setToastMessage(null)}
          duration={5000}
        />
      )}
    </div>
  );
};

export default DataPekerjaan;