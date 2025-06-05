// src/pages/DataPelamar/DataPelamar.tsx
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/molecules/DataTable/DataTable';
import Button from '../../components/atoms/Button/Button';
import SearchInput from '../../components/atoms/SearchInput/SearchInput';
import Dropdown from '../../components/atoms/Dropdown/Dropdown';
import Modal from '../../components/organisms/Modal/Modal';
import PelamarForm from '../../components/organisms/PelamarForm/PelamarForm';
import DeleteConfirmation from '../../components/molecules/DeleteConfirmation/DeleteConfirmation';
import Toast from '../../components/atoms/Toast/Toast';
import { pelamarService, PelamarDisplay } from '../../services/pelamarService';

const DataPelamar: React.FC = () => {
  // State untuk data dan UI
  const [pelamar, setPelamar] = useState<PelamarDisplay[]>([]);
  const [filteredData, setFilteredData] = useState<PelamarDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPelamar, setCurrentPelamar] = useState<PelamarDisplay | null>(null);
  const [toastMessage, setToastMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Definisi kolom untuk tabel
  const columns = [
    { 
      id: 'id', 
      label: 'ID', 
      sortable: true 
    },
    { 
      id: 'nama', 
      label: 'NAMA', 
      sortable: true 
    },
    { 
      id: 'email', 
      label: 'EMAIL', 
      sortable: true 
    },
    { 
      id: 'telepon', 
      label: 'TELEPON', 
      sortable: true 
    },
    { 
      id: 'tanggalLamar', 
      label: 'TANGGAL DAFTAR', 
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
        const data = await pelamarService.getAllPelamar();
        setPelamar(data);
        setTotalEntries(data.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        setToastMessage({
          type: 'error',
          message: error instanceof Error ? error.message : 'Gagal memuat data pelamar.'
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
      let filtered = [...pelamar];
      
      // Filter by search term
      if (searchTerm.trim()) {
        filtered = filtered.filter(item => 
          item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.telepon.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredData(filtered);
      setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
    };
    
    filterData();
  }, [searchTerm, pelamar]);
  
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
  
  // Format date to Indonesian format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleEntriesPerPageChange = (value: number | string) => {
    setEntriesPerPage(Number(value));
    setCurrentPage(1); // Reset ke halaman pertama
  };
  
  const handleOpenAddModal = () => {
    setCurrentPelamar(null);
    setIsFormModalOpen(true);
  };
  
  const handleOpenEditModal = (item: PelamarDisplay) => {
    setCurrentPelamar(item);
    setIsFormModalOpen(true);
  };
  
  const handleOpenViewModal = (item: PelamarDisplay) => {
    setCurrentPelamar(item);
    setIsViewModalOpen(true);
  };
  
  const handleOpenDeleteModal = (item: PelamarDisplay) => {
    setCurrentPelamar(item);
    setIsDeleteModalOpen(true);
  };
  
  const handleSubmitForm = async (data: PelamarDisplay) => {
    try {
      if (currentPelamar) {
        // Update existing
        const id = pelamarService.extractIdFromDisplayId(data.id);
        const updatedPelamar = await pelamarService.updatePelamar(id, data);
        
        setPelamar(prev => 
          prev.map(item => item.id === data.id ? updatedPelamar : item)
        );
        
        setToastMessage({
          type: 'success',
          message: `Data pelamar "${updatedPelamar.nama}" berhasil diperbarui.`
        });
      } else {
        // Add new
        const newPelamar = await pelamarService.createPelamar(data);
        
        setPelamar(prev => [...prev, newPelamar]);
        setTotalEntries(prev => prev + 1);
        
        setToastMessage({
          type: 'success',
          message: `Pelamar "${newPelamar.nama}" berhasil ditambahkan.`
        });
      }
      
      setIsFormModalOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setToastMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.'
      });
    }
  };
  
  const handleDelete = async () => {
    if (!currentPelamar) return;
    
    try {
      const id = pelamarService.extractIdFromDisplayId(currentPelamar.id);
      await pelamarService.deletePelamar(id);
      
      setPelamar(prev => 
        prev.filter(item => item.id !== currentPelamar.id)
      );
      setTotalEntries(prev => prev - 1);
      
      setToastMessage({
        type: 'success',
        message: `Pelamar "${currentPelamar.nama}" berhasil dihapus.`
      });
      
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      setToastMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Gagal menghapus data. Silakan coba lagi.'
      });
    }
  };
  
  const handleExport = () => {
    // Implementasi export data ke Excel/CSV
    setToastMessage({
      type: 'success',
      message: 'Data berhasil diekspor.'
    });
  };
  
  // Render cell data for custom columns
  const renderCellData = (item: PelamarDisplay, columnId: string) => {
    switch (columnId) {
      case 'tanggalLamar':
        return formatDate(item.tanggalLamar);
      default:
        return item[columnId as keyof PelamarDisplay];
    }
  };
  
  // Render row actions
  const renderActions = (item: PelamarDisplay) => (
    <div className="flex space-x-2">
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => handleOpenViewModal(item)}
      >
        Lihat
      </Button>
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
        <h1 className="text-2xl font-semibold text-gray-800">Data Pelamar</h1>
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
            Tambah Pelamar
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleExport}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            }
          >
            Export
          </Button>
        </div>
        
        <div className="w-full md:w-64">
          <SearchInput 
            placeholder="Cari pelamar..." 
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
          Total: <span className="font-medium">{filteredData.length}</span> pelamar
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
          renderCell={renderCellData}
        />
        
        {/* Pagination */}
        <div className="px-4 py-3 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200">
          <div className="mb-2 sm:mb-0">
            <p className="text-sm text-gray-600">
              Menampilkan {filteredData.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0}-
              {Math.min(currentPage * entriesPerPage, filteredData.length)} dari {filteredData.length} entri
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
        title={currentPelamar ? "Edit Data Pelamar" : "Tambah Data Pelamar"}
      >
        <PelamarForm
          initialData={currentPelamar}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>
      
      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detail Pelamar"
      >
        {currentPelamar && (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-700">
                <span className="text-2xl font-bold">{currentPelamar.nama.charAt(0)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">ID Pelamar</h3>
                <p className="mt-1 text-sm text-gray-900">{currentPelamar.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nama Lengkap</h3>
                <p className="mt-1 text-sm text-gray-900">{currentPelamar.nama}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm text-gray-900">{currentPelamar.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nomor Telepon</h3>
                <p className="mt-1 text-sm text-gray-900">{currentPelamar.telepon}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tanggal Daftar</h3>
                <p className="mt-1 text-sm text-gray-900">{formatDate(currentPelamar.tanggalLamar)}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 mt-6">
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEditModal(currentPelamar);
                  }}
                >
                  Edit Pelamar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
      >
        <DeleteConfirmation
          itemName={currentPelamar?.nama || ''}
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

export default DataPelamar;