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
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
            Target Batch Lot *
          </label>
          <select
            required
            disabled={adjustmentMutation.isPending}
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
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
          <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
            Adjustment Direction *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection('DECREASE')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                direction === 'DECREASE'
                  ? 'bg-red-50 border-red-300 text-red-700 shadow-subtle'
                  : 'bg-white border-[#E6E5DD] text-[#252A27] hover:bg-[#F8F7F2]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-red-600" />
              Decrease (Damage / Loss / Expiry)
            </button>
            <button
              type="button"
              onClick={() => setDirection('INCREASE')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                direction === 'INCREASE'
                  ? 'bg-[#E7EDE5] border-[#A8B8A2] text-[#183D32] shadow-subtle'
                  : 'bg-white border-[#E6E5DD] text-[#252A27] hover:bg-[#F8F7F2]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-[#183D32]" />
              Increase (Surplus / Audit Found)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Quantity to Adjust *
            </label>
            <input
              type="number"
              min="1"
              required
              disabled={adjustmentMutation.isPending}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] font-mono focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            />
            {selectedBatch && (
              <span className="text-[11px] text-[#777C76] mt-1 block">
                Projected New Stock:{' '}
                <strong className="text-[#252A27] font-mono">
                  {direction === 'INCREASE'
                    ? selectedBatch.available_quantity + quantity
                    : Math.max(0, selectedBatch.available_quantity - quantity)}
                </strong>
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Audit Ref / Incident Ticket
            </label>
            <input
              type="text"
              placeholder="e.g. ADJ-4091"
              disabled={adjustmentMutation.isPending}
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] font-mono placeholder-[#777C76] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
            Mandatory Justification / Reason *
          </label>
          <textarea
            rows={2}
            required
            disabled={adjustmentMutation.isPending}
            placeholder="e.g. Damaged blister pack discarded during physical quality assurance audit"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E6E5DD]">
          <button
            type="button"
            onClick={onClose}
            disabled={adjustmentMutation.isPending}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#252A27] bg-white border border-[#E6E5DD] hover:bg-[#F8F7F2] shadow-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={adjustmentMutation.isPending || !batchId}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-all duration-150 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{adjustmentMutation.isPending ? 'Reconciling...' : 'Commit Adjustment'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default AdjustmentModal;
