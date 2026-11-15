import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { movementApi } from '../../api/movementApi';
import { medicineApi } from '../../api/medicineApi';
import { batchApi } from '../../api/batchApi';
import { extractErrorMessage } from '../../api/client';
import { PurchaseInput } from '../../types/movement';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { ShoppingCart } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMedicineId?: string;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  preselectedMedicineId,
}) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [medicineId, setMedicineId] = useState<string>(preselectedMedicineId || '');
  const [useNewBatch, setUseNewBatch] = useState<boolean>(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  
  // New batch fields
  const [newBatchNumber, setNewBatchNumber] = useState<string>('');
  const [mfgDate, setMfgDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expDate, setExpDate] = useState<string>(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [costPrice, setCostPrice] = useState<number>(10);
  const [sellPrice, setSellPrice] = useState<number>(15);

  const [quantity, setQuantity] = useState<number>(50);
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
    enabled: isOpen && !!medicineId && !useNewBatch,
  });

  const purchaseMutation = useMutation({
    mutationFn: movementApi.purchase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Purchase Recorded', `Received ${data.quantity} units under ref ${data.reference_number}.`);
      onClose();
    },
    onError: (err) => {
      const msg = extractErrorMessage(err);
      setErrorMsg(msg);
      toastError('Purchase Failed', msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!medicineId) {
      setErrorMsg('Please select a target medicine.');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('Quantity must be greater than zero.');
      return;
    }

    const payload: PurchaseInput = {
      medicine_id: medicineId,
      quantity,
      reference_number: refNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (useNewBatch) {
      if (!newBatchNumber.trim()) {
        setErrorMsg('Please enter a batch number for the new batch.');
        return;
      }
      if (new Date(expDate) <= new Date(mfgDate)) {
        setErrorMsg('Expiry date must be strictly after manufacturing date.');
        return;
      }
      payload.batch_number = newBatchNumber.toUpperCase();
      payload.manufacturing_date = mfgDate;
      payload.expiry_date = expDate;
      payload.purchase_price = costPrice;
      payload.selling_price = sellPrice;
    } else {
      if (!selectedBatchId) {
        setErrorMsg('Please select an existing batch or switch to new batch.');
        return;
      }
      payload.batch_id = selectedBatchId;
    }

    purchaseMutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Purchase / Inward Shipment"
      subtitle="Receive and record pharmaceutical shipments into dispensary stock"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pharmaceutical Product *
          </label>
          <select
            required
            value={medicineId}
            disabled={purchaseMutation.isPending}
            onChange={(e) => {
              setMedicineId(e.target.value);
              setSelectedBatchId('');
            }}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
          >
            <option value="">-- Choose Medicine --</option>
            {medicines?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.medicine_code}) - In Stock: {m.total_available_stock} {m.unit}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Selection Mode */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Batch Destination:</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                <input
                  type="radio"
                  name="batch_mode"
                  checked={!useNewBatch}
                  onChange={() => setUseNewBatch(false)}
                  className="text-teal-700 focus:ring-teal-700"
                />
                Existing Lot
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                <input
                  type="radio"
                  name="batch_mode"
                  checked={useNewBatch}
                  onChange={() => setUseNewBatch(true)}
                  className="text-teal-700 focus:ring-teal-700"
                />
                Create New Lot
              </label>
            </div>
          </div>

          {!useNewBatch ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Select Existing Batch *
              </label>
              <select
                value={selectedBatchId}
                disabled={!medicineId || purchaseMutation.isPending}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
              >
                <option value="">-- Select Existing Lot --</option>
                {batches?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batch_number} (Avail: {b.available_quantity} | Exp: {b.expiry_date})
                  </option>
                ))}
              </select>
              {medicineId && batches && batches.length === 0 && (
                <p className="text-[11px] text-amber-700 mt-1">
                  No existing batches found for this product. Please select "Create New Lot".
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    New Batch Lot Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BTH-PO-09"
                    value={newBatchNumber}
                    onChange={(e) => setNewBatchNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Mfg Date
                  </label>
                  <input
                    type="date"
                    value={mfgDate}
                    onChange={(e) => setMfgDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Sell Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity Received *
            </label>
            <input
              type="number"
              min="1"
              required
              disabled={purchaseMutation.isPending}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PO / Delivery Ref
            </label>
            <input
              type="text"
              placeholder="e.g. PO-8492"
              disabled={purchaseMutation.isPending}
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Supplier & Inspection Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Delivered by cold-chain logistics in good condition"
            disabled={purchaseMutation.isPending}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={purchaseMutation.isPending}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={purchaseMutation.isPending}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{purchaseMutation.isPending ? 'Committing...' : 'Commit Purchase'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
