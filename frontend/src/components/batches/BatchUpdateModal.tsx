import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { batchApi } from '../../api/batchApi';
import { extractErrorMessage } from '../../api/client';
import { MedicineBatch } from '../../types/batch';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';

interface BatchUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: MedicineBatch | null;
}

export const BatchUpdateModal: React.FC<BatchUpdateModalProps> = ({ isOpen, onClose, batch }) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (batch) {
      setPurchasePrice(Number(batch.purchase_price) || 0);
      setSellingPrice(Number(batch.selling_price) || 0);
      setErrorMsg(null);
    }
  }, [batch, isOpen]);

  const updateMutation = useMutation({
    mutationFn: () =>
      batchApi.update(batch!.id, {
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Pricing Updated', `Batch ${updated.batch_number} prices adjusted.`);
      onClose();
    },
    onError: (err) => {
      const msg = extractErrorMessage(err);
      setErrorMsg(msg);
      toastError('Update Failed', msg);
    },
  });

  if (!batch) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Pricing: ${batch.batch_number}`}
      subtitle={`${batch.medicine_name || 'Medicine'} • Expiry: ${batch.expiry_date}`}
      maxWidth="md"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
        className="space-y-4"
      >
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Purchase Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              disabled={updateMutation.isPending}
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Selling Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              disabled={updateMutation.isPending}
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400">
          Note: Quantity fields cannot be directly modified through metadata edits. Use the{' '}
          <strong className="text-slate-200">Stock Movements</strong> hub to record an official
          purchase, sale, return or adjustment.
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Updating...' : 'Save Pricing'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
