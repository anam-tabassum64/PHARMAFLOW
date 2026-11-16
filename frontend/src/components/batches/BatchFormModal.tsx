import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { batchApi } from '../../api/batchApi';
import { medicineApi } from '../../api/medicineApi';
import { extractErrorMessage } from '../../api/client';
import { BatchCreateInput } from '../../types/batch';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';

interface BatchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMedicineId?: string;
}

export const BatchFormModal: React.FC<BatchFormModalProps> = ({
  isOpen,
  onClose,
  preselectedMedicineId,
}) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const { data: medicines } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => medicineApi.getAll({ is_active: true }),
    enabled: isOpen,
  });

  const today = new Date().toISOString().split('T')[0];
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState<BatchCreateInput>({
    medicine_id: preselectedMedicineId || '',
    batch_number: '',
    manufacturing_date: today,
    expiry_date: nextYear,
    purchase_price: 10.0,
    selling_price: 15.0,
    initial_quantity: 100,
  });

  const [formError, setFormError] = useState<string | null>(null);

  const createBatchMutation = useMutation({
    mutationFn: batchApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Batch Registered', `Batch ${data.batch_number} registered with ${data.initial_quantity} units.`);
      onClose();
    },
    onError: (err) => {
      const msg = extractErrorMessage(err);
      setFormError(msg);
      toastError('Failed to Register Batch', msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.medicine_id) {
      setFormError('Please select a medicine.');
      return;
    }
    if (!formData.batch_number.trim()) {
      setFormError('Batch Number is required.');
      return;
    }
    if (new Date(formData.expiry_date) <= new Date(formData.manufacturing_date)) {
      setFormError('Expiry date must be strictly after the manufacturing date.');
      return;
    }
    if (formData.initial_quantity <= 0) {
      setFormError('Initial quantity must be greater than zero.');
      return;
    }

    createBatchMutation.mutate(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Medicine Batch"
      subtitle="Register a new production lot with batch-level shelf-life and expiry tracking"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {formError}
          </div>
        )}

        <div>
          <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
            Target Medicine *
          </label>
          <select
            required
            disabled={createBatchMutation.isPending || !!preselectedMedicineId}
            value={formData.medicine_id}
            onChange={(e) => setFormData({ ...formData, medicine_id: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
          >
            <option value="">-- Select Pharmaceutical Product --</option>
            {medicines?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.medicine_code}) - {m.category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
            Batch Lot Number *
          </label>
          <input
            type="text"
            required
            disabled={createBatchMutation.isPending}
            placeholder="e.g. BTH-AMX-04"
            value={formData.batch_number}
            onChange={(e) => setFormData({ ...formData, batch_number: e.target.value.toUpperCase() })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] font-mono focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Manufacturing Date *
            </label>
            <input
              type="date"
              required
              disabled={createBatchMutation.isPending}
              value={formData.manufacturing_date}
              onChange={(e) => setFormData({ ...formData, manufacturing_date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] font-mono focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Expiry Date *
            </label>
            <input
              type="date"
              required
              disabled={createBatchMutation.isPending}
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] font-mono focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Purchase Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              disabled={createBatchMutation.isPending}
              value={formData.purchase_price}
              onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
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
              disabled={createBatchMutation.isPending}
              value={formData.selling_price}
              onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] font-mono focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Initial Quantity *
            </label>
            <input
              type="number"
              min="1"
              required
              disabled={createBatchMutation.isPending}
              value={formData.initial_quantity}
              onChange={(e) => setFormData({ ...formData, initial_quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] font-mono focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E6E5DD]">
          <button
            type="button"
            onClick={onClose}
            disabled={createBatchMutation.isPending}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#252A27] bg-white border border-[#E6E5DD] hover:bg-[#F8F7F2] shadow-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createBatchMutation.isPending}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-all duration-150 disabled:opacity-50"
          >
            {createBatchMutation.isPending ? 'Registering...' : 'Register Batch'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default BatchFormModal;
