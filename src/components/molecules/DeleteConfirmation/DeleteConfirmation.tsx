// src/components/molecules/DeleteConfirmation/DeleteConfirmation.tsx
import React, { useState } from 'react';
import Button from '../../atoms/Button/Button';

interface DeleteConfirmationProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  itemName,
  onConfirm,
  onCancel
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleConfirm = async () => {
    setIsDeleting(true);
    
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error deleting item:', error);
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="text-center py-4">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <div className="mt-3">
        <h3 className="text-lg font-medium text-gray-900">
          Hapus {itemName}?
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Apakah Anda yakin ingin menghapus "{itemName}"? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-center space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Batal
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleConfirm}
          isLoading={isDeleting}
        >
          Hapus
        </Button>
      </div>
    </div>
  );
};

export default DeleteConfirmation;