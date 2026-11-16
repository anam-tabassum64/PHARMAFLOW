import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicineApi } from '../api/medicineApi';
import { extractErrorMessage } from '../api/client';
import { Medicine } from '../types/medicine';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { MedicineFormModal } from '../components/medicines/MedicineFormModal';
import { MedicineDetailModal } from '../components/medicines/MedicineDetailModal';
import {
  Pill,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';

export const MedicinesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | null>(null);
  const [medicineToView, setMedicineToView] = useState<Medicine | null>(null);

  const { data: medicines, isLoading, isError, error } = useQuery({
    queryKey: ['medicines', searchTerm, selectedCategory],
    queryFn: () =>
      medicineApi.getAll({
        search: searchTerm.trim() || undefined,
        category: selectedCategory || undefined,
        limit: 200,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: medicineApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      success('Medicine Deleted', 'Product removed from formulary.');
    },
    onError: (err) => {
      const msg = extractErrorMessage(err);
      toastError('Cannot Delete Medicine', msg);
    },
  });

  const handleDelete = (m: Medicine) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${m.name}" (${m.medicine_code})?\n\nNote: If this medicine has historical transactions, deletion will be blocked to maintain the audit trail.`
      )
    ) {
      deleteMutation.mutate(m.id);
    }
  };

  const categories = [
    'All Categories',
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
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-xl">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#777C76] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code, commercial name, generic chemical, or manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] shadow-subtle transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value === 'All Categories' ? '' : e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E5DD] text-xs text-[#252A27] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] shadow-subtle transition-colors"
            >
              {categories.map((c) => (
                <option key={c} value={c === 'All Categories' ? '' : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setMedicineToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl bg-white border border-[#E6E5DD] shadow-subtle overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={7} />
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-red-600">
            Error loading catalogue: {extractErrorMessage(error)}
          </div>
        ) : !medicines || medicines.length === 0 ? (
          <EmptyState
            title="No Medicines Found"
            description={
              searchTerm || selectedCategory
                ? 'No pharmaceutical entities match your search or category filter.'
                : 'Your formulary is empty. Register the first medicine below.'
            }
            icon={Pill}
            actionText="Register Medicine"
            onAction={() => {
              setMedicineToEdit(null);
              setIsAddModalOpen(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F0E9] text-[#252A27] font-heading font-semibold border-b border-[#E6E5DD] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Commercial Name</th>
                  <th className="py-3.5 px-4">Generic Formula</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Manufacturer</th>
                  <th className="py-3.5 px-4 text-center">Batches</th>
                  <th className="py-3.5 px-4 text-right">Available Stock</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E5DD]/60 text-[#252A27]">
                {medicines.map((m) => {
                  const isLow = m.total_available_stock <= m.reorder_level;
                  return (
                    <tr key={m.id} className="hover:bg-[#F8F7F2]/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#183D32]">
                        {m.medicine_code}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#252A27]">
                        {m.name}
                      </td>
                      <td className="py-3.5 px-4 text-[#777C76] italic">
                        {m.generic_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F1F0E9] text-[#252A27] font-medium text-[11px] border border-[#E6E5DD]">
                          {m.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#777C76]">
                        {m.manufacturer}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-[#252A27]">
                        {m.batch_count}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isLow ? 'text-amber-700' : 'text-[#252A27]'
                          }`}
                        >
                          {m.total_available_stock}{' '}
                          <span className="text-[10px] text-[#777C76] font-normal">
                            {m.unit}
                          </span>
                        </span>
                        {isLow && (
                          <span className="block text-[10px] text-amber-600 font-medium">
                            ≤ reorder ({m.reorder_level})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {m.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="neutral">Archived</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setMedicineToView(m)}
                            title="View Batches & Info"
                            className="p-1.5 rounded-lg text-[#777C76] hover:text-[#183D32] hover:bg-[#F1F0E9] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setMedicineToEdit(m);
                              setIsAddModalOpen(true);
                            }}
                            title="Edit Details"
                            className="p-1.5 rounded-lg text-[#777C76] hover:text-[#183D32] hover:bg-[#F1F0E9] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            title="Delete Medicine"
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded-lg text-[#777C76] hover:text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form and Detail Modals */}
      <MedicineFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setMedicineToEdit(null);
        }}
        medicineToEdit={medicineToEdit}
      />

      <MedicineDetailModal
        isOpen={!!medicineToView}
        onClose={() => setMedicineToView(null)}
        medicine={medicineToView}
      />
    </div>
  );
};
export default MedicinesPage;
