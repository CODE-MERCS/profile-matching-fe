// src/pages/DataSubkriteria/DataSubkriteria.tsx
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/molecules/DataTable/DataTable';
import Button from '../../components/atoms/Button/Button';
import SearchInput from '../../components/atoms/SearchInput/SearchInput';
import Dropdown from '../../components/atoms/Dropdown/Dropdown';
import Modal from '../../components/organisms/Modal/Modal';
import SubkriteriaForm from '../../components/organisms/SubKriteriaForm/SubKriteriaForm';
import DeleteConfirmation from '../../components/molecules/DeleteConfirmation/DeleteConfirmation';
import Toast from '../../components/atoms/Toast/Toast';
import { subkriteriaService, SubkriteriaDisplay } from '../../services/subKriteriaService';

const DataSubkriteria: React.FC = () => {
  // State untuk data dan UI
  const [subkriteria, setSubkriteria] = useState<SubkriteriaDisplay[]>([]);
  const [filteredData, setFilteredData] = useState<SubkriteriaDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentSubkriteria, setCurrentSubkriteria] = useState<SubkriteriaDisplay | null>(null);
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
      label: 'NAMA SUBKRITERIA', 
      sortable: true 
    },
    { 
      id: 'nilaiTarget', 
      label: 'NILAI TARGET', 
      sortable: true 
    },
    { 
      id: 'statusLabel', 
      label: 'STATUS', 
      sortable: true 
    },
    { 
      id: 'kriteria', 
      label: 'KRITERIA', 
      sortable: true 
    },
    { 
      id: 'pekerjaan', 
      label: 'PEKERJAAN', 
      sortable: true 
    },
    { 
      id: 'tanggalDibuat', 
      label: 'TANGGAL DIBUAT', 
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
        const data = await subkriteriaService.getAllSubkriteria();
        setSubkriteria(data);
        setTotalEntries(data.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        setToastMessage({
          type: 'error',
          message: error instanceof Error ? error.message : 'Gagal memuat data subkriteria.'
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
      let filtered = [...subkriteria];
      
      // Filter by search term
      if (searchTerm.trim()) {
        filtered = filtered.filter(item => 
          item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.kriteria.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.pekerjaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.statusLabel.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredData(filtered);
      setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
    };
    
    filterData();
  }, [searchTerm, subkriteria]);
  
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
    setCurrentSubkriteria(null);
    setIsFormModalOpen(true);
  };
  
  const handleOpenEditModal = (item: SubkriteriaDisplay) => {
    setCurrentSubkriteria(item);
    setIsFormModalOpen(true);
  };
  
  const handleOpenViewModal = (item: SubkriteriaDisplay) => {
    setCurrentSubkriteria(item);
    setIsViewModalOpen(true);
  };
  
  const handleOpenDeleteModal = (item: SubkriteriaDisplay) => {
    setCurrentSubkriteria(item);
    setIsDeleteModalOpen(true);
  };
  
  const handleSubmitForm = async (data: { nama: string; nilaiTarget: number; status: string; kriteria_id: number }) => {
    try {
      if (currentSubkriteria) {
        // Update existing
        const id = subkriteriaService.extractIdFromDisplayId(currentSubkriteria.id);
        const updatedSubkriteria = await subkriteriaService.updateSubkriteria(id, {
          nama: data.nama,
          nilaiTarget: data.nilaiTarget,
          status: data.status
        }, data.kriteria_id);
        
        setSubkriteria(prev => 
          prev.map(item => item.id === currentSubkriteria.id ? updatedSubkriteria : item)
        );
        
        setToastMessage({
          type: 'success',
          message: `Subkriteria "${updatedSubkriteria.nama}" berhasil diperbarui.`
        });
      } else {
        // Add new - pass kriteria_id as second parameter
        const newSubkriteria = await subkriteriaService.createSubkriteria({
          nama: data.nama,
          nilaiTarget: data.nilaiTarget,
          status: data.status
        }, data.kriteria_id);
        
        setSubkriteria(prev => [...prev, newSubkriteria]);
        setTotalEntries(prev => prev + 1);
        
        setToastMessage({
          type: 'success',
          message: `Subkriteria "${newSubkriteria.nama}" berhasil ditambahkan.`
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
    if (!currentSubkriteria) return;
    
    try {
      const id = subkriteriaService.extractIdFromDisplayId(currentSubkriteria.id);
      await subkriteriaService.deleteSubkriteria(id);
      
      setSubkriteria(prev => 
        prev.filter(item => item.id !== currentSubkriteria.id)
      );
      setTotalEntries(prev => prev - 1);
      
      setToastMessage({
        type: 'success',
        message: `Subkriteria "${currentSubkriteria.nama}" berhasil dihapus.`
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
  const renderCellData = (item: SubkriteriaDisplay, columnId: string) => {
    switch (columnId) {
      case 'nilaiTarget':
        return (
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Target: {item.nilaiTarget}
            </span>
          </div>
        );
      case 'statusLabel':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.status === 'CF' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {item.statusLabel}
          </span>
        );
      case 'tanggalDibuat':
        return formatDate(item.tanggalDibuat);
      case 'pekerjaan':
        return (
          <span className={`${
            item.pekerjaan === 'Belum ditentukan' 
              ? 'text-gray-500 italic' 
              : 'text-gray-900'
          }`}>
            {item.pekerjaan}
          </span>
        );
      default:
        return item[columnId as keyof SubkriteriaDisplay];
    }
  };
  
  // Render row actions
  const renderActions = (item: SubkriteriaDisplay) => (
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
        <h1 className="text-2xl font-semibold text-gray-800">Data Subkriteria</h1>
        <p className="text-gray-600 mt-1">Kelola subkriteria untuk setiap kriteria penilaian dalam sistem.</p>
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
            Tambah Subkriteria
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
            placeholder="Cari subkriteria..." 
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
          Total: <span className="font-medium">{filteredData.length}</span> subkriteria
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
        title={currentSubkriteria ? "Edit Subkriteria" : "Tambah Subkriteria"}
      >
        <SubkriteriaForm
          initialData={currentSubkriteria}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>
      
      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detail Subkriteria"
      >
        {currentSubkriteria && (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-700">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">ID Subkriteria</h3>
                <p className="mt-1 text-sm text-gray-900 font-mono">{currentSubkriteria.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nama Subkriteria</h3>
                <p className="mt-1 text-sm text-gray-900">{currentSubkriteria.nama}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nilai Target</h3>
                <p className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Target: {currentSubkriteria.nilaiTarget}
                  </span>
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentSubkriteria.status === 'CF' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentSubkriteria.statusLabel}
                  </span>
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Kriteria</h3>
                <p className="mt-1 text-sm text-gray-900 font-medium">{currentSubkriteria.kriteria}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Pekerjaan Terkait</h3>
                <p className={`mt-1 text-sm ${
                  currentSubkriteria.pekerjaan === 'Belum ditentukan' 
                    ? 'text-gray-500 italic' 
                    : 'text-gray-900'
                }`}>
                  {currentSubkriteria.pekerjaan}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Tanggal Dibuat</h3>
                <p className="mt-1 text-sm text-gray-900">{formatDate(currentSubkriteria.tanggalDibuat)}</p>
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
                    handleOpenEditModal(currentSubkriteria);
                  }}
                >
                  Edit Subkriteria
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
          itemName={currentSubkriteria?.nama || ''}
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

export default DataSubkriteria;