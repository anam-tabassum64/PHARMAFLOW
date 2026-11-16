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
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] font-mono focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] font-mono focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            />
          </div>
        </div>

        <div className="p-3.5 bg-[#F8F7F2] rounded-xl border border-[#E6E5DD] text-xs text-[#777C76] leading-relaxed">
          Physical quantities cannot be modified directly via pricing updates. Use the{' '}
          <strong className="text-[#183D32] font-semibold">Stock Movements</strong> hub to record an official
          purchase, sale, return or adjustment transaction.
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E6E5DD]">
          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#252A27] bg-white border border-[#E6E5DD] hover:bg-[#F8F7F2] shadow-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-all duration-150 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Updating...' : 'Save Pricing'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default BatchUpdateModal;
