import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { movementApi } from '../../api/movementApi';
import { batchApi } from '../../api/batchApi';
import { extractErrorMessage } from '../../api/client';
import { ReturnInput } from '../../types/movement';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';

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
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Regulatory Policy Notice */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
          <div className="leading-relaxed">
            <strong className="block font-semibold">Standard Return Policy:</strong>
            Returned stock is strictly checked against batch expiry date. Expired medicines will be
            rejected by the system and cannot be placed back into active saleable inventory.
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Target Batch Lot *
          </label>
          <select
            required
            disabled={returnMutation.isPending}
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
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
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
            Warning: Selected batch is expired ({selectedBatch.expiry_date}). Submission will be rejected by backend policy enforcement.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quantity to Return *
            </label>
            <input
              type="number"
              min="1"
              required
              disabled={returnMutation.isPending}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Return RMA Reference
            </label>
            <input
              type="text"
              placeholder="e.g. RET-7102"
              disabled={returnMutation.isPending}
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Reason for Return
          </label>
          <input
            type="text"
            placeholder="e.g. Patient treatment changed; blister pack intact"
            disabled={returnMutation.isPending}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={returnMutation.isPending}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={returnMutation.isPending || !batchId}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-900/30 disabled:opacity-50 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            {returnMutation.isPending ? 'Processing...' : 'Process Return'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
