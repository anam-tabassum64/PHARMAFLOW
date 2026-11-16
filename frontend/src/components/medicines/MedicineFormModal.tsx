import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medicineApi } from '../../api/medicineApi';
import { extractErrorMessage } from '../../api/client';
import { Medicine, MedicineCreateInput } from '../../types/medicine';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicineToEdit?: Medicine | null;
}

export const MedicineFormModal: React.FC<MedicineFormModalProps> = ({
  isOpen,
  onClose,
  medicineToEdit,
}) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState<MedicineCreateInput>({
    medicine_code: '',
    name: '',
    generic_name: '',
    category: 'Antibiotics',
    manufacturer: '',
    unit: 'Tablets',
    reorder_level: 10,
    description: '',
    is_active: true,
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (medicineToEdit) {
      setFormData({
        medicine_code: medicineToEdit.medicine_code,
        name: medicineToEdit.name,
        generic_name: medicineToEdit.generic_name,
        category: medicineToEdit.category,
        manufacturer: medicineToEdit.manufacturer,
        unit: medicineToEdit.unit,
        reorder_level: medicineToEdit.reorder_level,
        description: medicineToEdit.description || '',
        is_active: medicineToEdit.is_active,
      });
    } else {
      setFormData({
        medicine_code: '',
        name: '',
        generic_name: '',
        category: 'Antibiotics',
        manufacturer: '',
        unit: 'Tablets',
        reorder_level: 10,
        description: '',
        is_active: true,
      });
    }
    setFormError(null);
  }, [medicineToEdit, isOpen]);

  const createMutation = useMutation({
    mutationFn: medicineApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      success('Medicine Registered', `${data.name} (${data.medicine_code}) was added successfully.`);
      onClose();
    },
    onError: (err) => {
      const msg = extractErrorMessage(err);
      setFormError(msg);
      toastError('Failed to Create Medicine', msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; data: Partial<MedicineCreateInput> }) =>
      medicineApi.update(vars.id, vars.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      success('Medicine Updated', `${data.name} details were saved.`);
      onClose();
    },
    onError: (err) => {
      const msg = extractErrorMessage(err);
      setFormError(msg);
      toastError('Failed to Update Medicine', msg);
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.medicine_code.trim()) {
      setFormError('Medicine Code is required.');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Medicine Name is required.');
      return;
    }
    if (!formData.generic_name.trim()) {
      setFormError('Generic Name is required.');
      return;
    }
    if (!formData.manufacturer.trim()) {
      setFormError('Manufacturer is required.');
      return;
    }

    if (medicineToEdit) {
      updateMutation.mutate({ id: medicineToEdit.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const categories = [
    'Antibiotics',
    'Analgesics',
    'Cardiovascular',
    'Antidiabetics',
    'Gastrointestinal',
    'Respiratory',
    'Antihistamines',
    'Neurology',
    'Psychiatry',
    'Corticosteroids',
    'Vitamins & Supplements',
    'General',
  ];

  const units = ['Tablets', 'Capsules', 'Bottles', 'Strips', 'Vials', 'Inhalers', 'Ampoules'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={medicineToEdit ? 'Edit Medicine Details' : 'Register New Medicine'}
      subtitle={medicineToEdit ? 'Update product specifications in the formulary' : 'Add a pharmaceutical entity to the active dispensary formulary'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Medicine SKU Code *
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="e.g. MED-201"
              value={formData.medicine_code}
              onChange={(e) => setFormData({ ...formData, medicine_code: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Commercial / Brand Name *
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="e.g. Amoxicillin 500mg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Generic / Chemical Formula *
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="e.g. Amoxicillin Trihydrate"
              value={formData.generic_name}
              onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Manufacturer *
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="e.g. GlaxoSmithKline"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              disabled={isSubmitting}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Dispensing Unit
            </label>
            <select
              value={formData.unit}
              disabled={isSubmitting}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors"
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
              Reorder Level
            </label>
            <input
              type="number"
              min="0"
              disabled={isSubmitting}
              value={formData.reorder_level}
              onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] font-mono transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-heading font-medium text-[#252A27] mb-1.5">
            Clinical Notes & Storage Specifications
          </label>
          <textarea
            rows={2}
            disabled={isSubmitting}
            placeholder="Indications, storage requirements (e.g. Keep refrigerated at 2-8°C)..."
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] transition-colors resize-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="is_active"
            disabled={isSubmitting}
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 rounded text-[#183D32] bg-white border-[#E6E5DD] focus:ring-[#183D32]"
          />
          <label htmlFor="is_active" className="text-xs text-[#252A27] select-none cursor-pointer">
            Active in formulary (Available for stock movements and dispensing)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E6E5DD]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#252A27] bg-white border border-[#E6E5DD] hover:bg-[#F8F7F2] shadow-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-all duration-150 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : medicineToEdit ? 'Save Changes' : 'Register Medicine'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default MedicineFormModal;
