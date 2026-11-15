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
      success('Medicine Created', `${data.name} (${data.medicine_code}) was added successfully.`);
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
      success('Medicine Updated', `${data.name} details were updated.`);
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
      title={medicineToEdit ? 'Edit Medicine' : 'Add New Medicine'}
      subtitle={medicineToEdit ? 'Update product catalogue specifications' : 'Register a new pharmaceutical entity'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Medicine Code *
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="e.g. MED-201"
              value={formData.medicine_code}
              onChange={(e) => setFormData({ ...formData, medicine_code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="e.g. Amoxicillin 500mg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Generic / Chemical Name *
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="e.g. Amoxicillin Trihydrate"
              value={formData.generic_name}
              onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Manufacturer *
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="e.g. GlaxoSmithKline"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              disabled={isSubmitting}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Unit
            </label>
            <select
              value={formData.unit}
              disabled={isSubmitting}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Reorder Level
            </label>
            <input
              type="number"
              min="0"
              disabled={isSubmitting}
              value={formData.reorder_level}
              onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Clinical / Storage Description
          </label>
          <textarea
            rows={2}
            disabled={isSubmitting}
            placeholder="Indications, storage requirements (e.g. 2-8°C)..."
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="is_active"
            disabled={isSubmitting}
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500 focus:ring-offset-slate-900"
          />
          <label htmlFor="is_active" className="text-xs text-slate-300 select-none cursor-pointer">
            Active in catalogue (Available for stock movements)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : medicineToEdit ? 'Save Changes' : 'Create Medicine'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
