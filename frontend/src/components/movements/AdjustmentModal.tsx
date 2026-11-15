import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { movementApi } from '../../api/movementApi';
import { batchApi } from '../../api/batchApi';
import { extractErrorMessage } from '../../api/client';
import { AdjustmentInput } from '../../types/movement';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Sliders, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [batchId, setBatchId] = useState<string>('');
  const [direction, setDirection] = useState<'INCREASE' | 'DECREASE'>('DECREASE');
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

  const adjustmentMutation = useMutation({
    mutationFn: movementApi.adjustment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success(
        'Stock Adjusted',
        `Adjusted ${data.quantity > 0 ? '+' : ''}${data.quantity} units for batch ${data.batch_number}.`
      );
      onClose();
    },
    onError: (err) => {
      const msg = extractErrorMessage(err);
      setErrorMsg(msg);
      toastError('Adjustment Failed', msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!batchId || !selectedBatch) {
      setErrorMsg('Please select a batch.');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('Quantity must be greater than zero.');
      return;
    }
    if (!notes.trim() || notes.trim().length < 3) {
      setErrorMsg('A mandatory justification/reason is required for inventory audit compliance.');
      return;
    }

    if (direction === 'DECREASE' && quantity > selectedBatch.available_quantity) {
      setErrorMsg(
        `Cannot reduce stock by ${quantity} units: Batch ${selectedBatch.batch_number} only has ${selectedBatch.available_quantity} units available. Stock cannot become negative.`
      );
      return;
    }

    const payload: AdjustmentInput = {
      batch_id: batchId,
      direction,
      quantity,
      reference_number: refNumber.trim() || undefined,
      notes: notes.trim(),
    };

    adjustmentMutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Stock Reconciliation / Adjustment"
      subtitle="Audited stock corrections for damage, loss, or physical inventory counting"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Target Batch Lot *
          </label>
          <select
            required
            disabled={adjustmentMutation.isPending}
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="">-- Choose Batch Lot --</option>
            {batches?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.medicine_name} | {b.batch_number} (Current Stock: {b.available_quantity})
              </option>
            ))}
          </select>
        </div>

        {/* Direction Switcher */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Adjustment Direction *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection('DECREASE')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                direction === 'DECREASE'
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-lg shadow-rose-950/50'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
              Decrease (Damage / Loss / Expiry)
            </button>
            <button
              type="button"
              onClick={() => setDirection('INCREASE')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                direction === 'INCREASE'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              Increase (Surplus / Audit Found)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quantity to Adjust *
            </label>
            <input
              type="number"
              min="1"
              required
              disabled={adjustmentMutation.isPending}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {selectedBatch && (
              <span className="text-[11px] text-slate-400 mt-1 block">
                Projected New Stock:{' '}
                <strong className="text-white">
                  {direction === 'INCREASE'
                    ? selectedBatch.available_quantity + quantity
                    : Math.max(0, selectedBatch.available_quantity - quantity)}
                </strong>
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Audit Ref / Incident Ticket
            </label>
            <input
              type="text"
              placeholder="e.g. ADJ-4091"
              disabled={adjustmentMutation.isPending}
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Mandatory Justification / Reason *
          </label>
          <textarea
            rows={2}
            required
            disabled={adjustmentMutation.isPending}
            placeholder="e.g. Damaged blister pack discarded during physical quality assurance audit"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={adjustmentMutation.isPending}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={adjustmentMutation.isPending || !batchId}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4" />
            {adjustmentMutation.isPending ? 'Reconciling...' : 'Commit Adjustment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
