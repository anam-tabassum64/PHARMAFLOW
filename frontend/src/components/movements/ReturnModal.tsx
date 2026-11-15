import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { movementApi } from '../../api/movementApi';
import { batchApi } from '../../api/batchApi';
import { extractErrorMessage } from '../../api/client';
import { ReturnInput } from '../../types/movement';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { RotateCcw, ShieldAlert } from 'lucide-react';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [batchId, setBatchId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [refNumber, setRefNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchApi.getAll(),
    enabled: isOpen,
  });

  const selectedBatch = batches?.find((b) => b.id === batchId);

  const returnMutation = useMutation({
    mutationFn: movementApi.returnStock,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Return Processed', `Restocked ${data.quantity} units to batch ${data.batch_number}.`);
      onClose();
    },
    onError: (err) => {
      const msg = extractErrorMessage(err);
      setErrorMsg(msg);
      toastError('Return Blocked', msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!batchId) {
      setErrorMsg('Please select a batch.');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('Return quantity must be greater than zero.');
      return;
    }

    const payload: ReturnInput = {
      batch_id: batchId,
      quantity,
      reference_number: refNumber.trim() || undefined,
      notes: notes.trim() || 'Patient unopened return',
    };

    returnMutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Return / Re-entry Process"
      subtitle="Process customer or clinical returns under pharmaceutical compliance policy"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Regulatory Policy Notice */}
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div className="leading-relaxed">
            <strong className="block font-semibold">Standard Return Policy:</strong>
            Returned stock is strictly checked against batch expiry date. Expired medicines will be
            rejected by the system and cannot be placed back into active saleable inventory.
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Batch Lot *
          </label>
          <select
            required
            disabled={returnMutation.isPending}
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
          >
            <option value="">-- Choose Batch Lot --</option>
            {batches?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.medicine_name} | Lot: {b.batch_number} {b.is_expired ? '[EXPIRED]' : ''} (Exp: {b.expiry_date})
              </option>
            ))}
          </select>
        </div>

        {selectedBatch?.is_expired && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            Warning: Selected batch is expired ({selectedBatch.expiry_date}). Submission will be rejected by backend compliance policy.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity to Return *
            </label>
            <input
              type="number"
              min="1"
              required
              disabled={returnMutation.isPending}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Return RMA Reference
            </label>
            <input
              type="text"
              placeholder="e.g. RET-7102"
              disabled={returnMutation.isPending}
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason for Return
          </label>
          <input
            type="text"
            placeholder="e.g. Patient prescription altered; blister pack intact"
            disabled={returnMutation.isPending}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={returnMutation.isPending}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={returnMutation.isPending || !batchId}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{returnMutation.isPending ? 'Processing...' : 'Process Return'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
