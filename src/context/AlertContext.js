"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import AlertModal from '@/components/AlertModal';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'danger' | 'warning' | 'info' | 'success' | 'error'
    confirmText: 'OK',
    cancelText: 'Cancel',
    isConfirm: false
  });

  const resolverRef = useRef(null);

  /**
   * Show a confirmation dialog (replaces window.confirm)
   * Returns a Promise resolving to true (confirmed) or false (cancelled)
   */
  const showConfirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    type = 'danger',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm = null,
    onCancel = null
  }) => {
    return new Promise((resolve) => {
      resolverRef.current = {
        resolve: (val) => {
          if (val && typeof onConfirm === 'function') {
            onConfirm();
          } else if (!val && typeof onCancel === 'function') {
            onCancel();
          }
          resolve(val);
        }
      };

      setModalState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        isConfirm: true
      });
    });
  }, []);

  /**
   * Show an alert dialog (replaces window.alert)
   * Returns a Promise resolving when closed
   */
  const showAlert = useCallback(({
    title = 'Notification',
    message = '',
    type = 'info',
    confirmText = 'OK',
    onClose = null
  }) => {
    return new Promise((resolve) => {
      resolverRef.current = {
        resolve: () => {
          if (typeof onClose === 'function') {
            onClose();
          }
          resolve(true);
        }
      };

      setModalState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText: '',
        isConfirm: false
      });
    });
  }, []);

  const handleConfirm = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current.resolve(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current.resolve(false);
      resolverRef.current = null;
    }
  };

  return (
    <AlertContext.Provider value={{ showConfirm, showAlert }}>
      {children}
      <AlertModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        isConfirm={modalState.isConfirm}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
