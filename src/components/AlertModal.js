"use client";

import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  X 
} from 'lucide-react';

export default function AlertModal({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  isConfirm = false,
  onConfirm,
  onCancel
}) {
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isConfirm) {
          onCancel();
        } else {
          onConfirm();
        }
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirm, onConfirm, onCancel]);

  if (!isOpen) return null;

  // Icon and theme config based on type
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: isConfirm ? Trash2 : AlertTriangle,
          iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
          defaultTitle: 'Delete Confirmation'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
          defaultTitle: 'Warning'
        };
      case 'success':
        return {
          icon: CheckCircle2,
          iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
          defaultTitle: 'Success'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
          defaultTitle: 'Error'
        };
      case 'info':
      default:
        return {
          icon: Info,
          iconBg: 'bg-slate-100 border-slate-200 text-slate-700',
          confirmBtn: 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs',
          defaultTitle: 'Notice'
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Modal Dialog Card */}
      <div 
        role="dialog"
        aria-modal="true"
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 relative"
      >
        {/* Close (X) button */}
        <button
          onClick={isConfirm ? onCancel : onConfirm}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Type Icon Badge */}
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${config.iconBg}`}>
              <IconComponent className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {displayTitle}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed break-words whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          {isConfirm && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all cursor-pointer shadow-2xs"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${config.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
