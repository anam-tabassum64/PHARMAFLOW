import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { movementApi } from '../../api/movementApi';
import { medicineApi } from '../../api/medicineApi';
import { batchApi } from '../../api/batchApi';
import { extractErrorMessage } from '../../api/client';
import { SaleInput } from '../../types/movement';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Send, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaleModal: React.FC<SaleModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [medicineId, setMedicineId] = useState<string>('');
  const [batchId, setBatchId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [refNumber, setRefNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch medicines
  const { data: medicines } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => medicineApi.getAll({ is_active: true }),
    enabled: isOpen,
  });

  // Fetch batches for selected medicine
  const { data: batches } = useQuery({
    queryKey: ['batches', medicineId],
    queryFn: () => batchApi.getAll({ medicine_id: medicineId }),
    enabled: isOpen && !!medicineId,
  });

  const selectedBatch = batches?.find((b) => b.id === batchId);

  const saleMutation = useMutation({
    mutationFn: movementApi.sale,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success(
        'Sale Dispatched',
        `Sold ${Math.abs(data.quantity)} units under invoice ${data.reference_number}. Stock deducted.`
      );
      onClose();
    },
    onError: (err) => {
      const msg = extractErrorMessage(err);
      setErrorMsg(msg);
      toastError('Sale Rejected', msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!batchId || !selectedBatch) {
      setErrorMsg('Please select a valid batch.');
      return;
    }

    if (selectedBatch.is_expired) {
      setErrorMsg(`Batch ${selectedBatch.batch_number} expired on ${selectedBatch.expiry_date} and cannot be sold.`);
      return;
    }

    if (quantity <= 0) {
      setErrorMsg('Sale quantity must be greater than zero.');
      return;
    }

    if (quantity > selectedBatch.available_quantity) {
      setErrorMsg(
        `Insufficient stock: Requested ${quantity} units, but only ${selectedBatch.available_quantity} are available in batch ${selectedBatch.batch_number}.`
      );
      return;
    }

    const payload: SaleInput = {
      batch_id: batchId,
      quantity,
      reference_number: refNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    saleMutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispense Prescription / Stock Sale"
      subtitle="Atomically deduct available inventory and generate customer sales ledger"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            1. Select Medicine *
          </label>
          <select
            required
            value={medicineId}
            disabled={saleMutation.isPending}
            onChange={(e) => {
              setMedicineId(e.target.value);
              setBatchId('');
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="">-- Choose Pharmaceutical Product --</option>
            {medicines?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.medicine_code}) - Avail: {m.total_available_stock} {m.unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            2. Select Specific Batch (FEFO / Expiry Enforced) *
          </label>
          <select
            required
            disabled={!medicineId || saleMutation.isPending}
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="">-- Choose Batch Lot --</option>
            {batches?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batch_number} {b.is_expired ? '[EXPIRED]' : ''} - Stock: {b.available_quantity} | Exp: {b.expiry_date} | ${Number(b.selling_price).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Batch Status Card */}
        {selectedBatch && (
          <div
            className={`p-3 rounded-xl border text-xs space-y-2 ${
              selectedBatch.is_expired
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : selectedBatch.available_quantity === 0
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Batch Validation Details:</span>
              {selectedBatch.is_expired ? (
                <Badge variant="danger">EXPIRED - SALE FORBIDDEN</Badge>
              ) : selectedBatch.available_quantity === 0 ? (
                <Badge variant="warning">OUT OF STOCK</Badge>
              ) : (
                <Badge variant="success">AVAILABLE FOR SALE</Badge>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-400 block">Available Qty:</span>
                <span className="font-bold text-white text-sm">
                  {selectedBatch.available_quantity}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Expiry Date:</span>
                <span className="font-mono text-white">{selectedBatch.expiry_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Unit Sell Price:</span>
                <span className="font-mono text-emerald-400">
                  ${Number(selectedBatch.selling_price).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quantity to Dispense *
            </label>
            <input
              type="number"
              min="1"
              max={selectedBatch?.available_quantity || undefined}
              required
              disabled={saleMutation.isPending || selectedBatch?.is_expired}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {selectedBatch && !selectedBatch.is_expired && (
              <span className="text-[11px] text-slate-400 mt-1 block">
                Total Value: ${(quantity * Number(selectedBatch.selling_price || 0)).toFixed(2)}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Invoice / Rx Reference
            </label>
            <input
              type="text"
              placeholder="e.g. INV-9201"
              disabled={saleMutation.isPending}
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Customer / Dispensation Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Outpatient prescription dispensing"
            disabled={saleMutation.isPending}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={saleMutation.isPending}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saleMutation.isPending || selectedBatch?.is_expired || !batchId}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-lg shadow-sky-900/30 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            {saleMutation.isPending ? 'Validating...' : 'Complete Sale'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
