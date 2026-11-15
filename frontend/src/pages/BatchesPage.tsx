import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { batchApi } from '../api/batchApi';
import { medicineApi } from '../api/medicineApi';
import { extractErrorMessage } from '../api/client';
import { MedicineBatch } from '../types/batch';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { BatchFormModal } from '../components/batches/BatchFormModal';
import { BatchUpdateModal } from '../components/batches/BatchUpdateModal';
import {
  Boxes,
  Search,
  Plus,
  Calendar,
  DollarSign,
  Edit2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const BatchesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [batchToEdit, setBatchToEdit] = useState<MedicineBatch | null>(null);

  const { data: medicines } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => medicineApi.getAll({ is_active: true }),
  });

  const { data: batches, isLoading, isError, error } = useQuery({
    queryKey: ['batches', searchTerm, selectedMedicineId],
    queryFn: () =>
      batchApi.getAll({
        search: searchTerm.trim() || undefined,
        medicine_id: selectedMedicineId || undefined,
        limit: 300,
      }),
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-xl">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by batch lot number (e.g. BTH-101)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-850 border border-slate-750 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Medicine Selector */}
          <div className="w-56">
            <select
              value={selectedMedicineId}
              onChange={(e) => setSelectedMedicineId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-750 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">All Medicines</option>
              {medicines?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.medicine_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Register Batch</span>
        </button>
      </div>

      {/* Main Batches Table Card */}
      <div className="rounded-2xl bg-slate-850 border border-slate-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-400">
            Error loading batches: {extractErrorMessage(error)}
          </div>
        ) : !batches || batches.length === 0 ? (
          <EmptyState
            title="No Batches Found"
            description={
              searchTerm || selectedMedicineId
                ? 'No production batches match your filter parameters.'
                : 'No batches have been registered yet.'
            }
            icon={Boxes}
            actionText="Register First Batch"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Batch Lot #</th>
                  <th className="py-3 px-4">Medicine Product</th>
                  <th className="py-3 px-4">Mfg Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 text-center">Shelf Status</th>
                  <th className="py-3 px-4 text-right">Cost / Sell</th>
                  <th className="py-3 px-4 text-right">Available Qty</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {batches.map((b) => {
                  return (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {b.batch_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">
                          {b.medicine_name || 'N/A'}
                        </span>
                        {b.medicine_code && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {b.medicine_code}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {b.manufacturing_date}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-medium text-slate-200">
                        {b.expiry_date}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {b.is_expired ? (
                          <Badge variant="danger">Expired</Badge>
                        ) : b.days_to_expiry <= 30 ? (
                          <Badge variant="warning">{b.days_to_expiry}d left</Badge>
                        ) : b.days_to_expiry <= 90 ? (
                          <Badge variant="info">{b.days_to_expiry}d left</Badge>
                        ) : (
                          <Badge variant="success">Safe</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px]">
                        <span className="text-slate-400">${Number(b.purchase_price).toFixed(2)}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-emerald-400 font-semibold">
                          ${Number(b.selling_price).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold text-sm text-white">
                          {b.available_quantity}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          of {b.initial_quantity} init
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setBatchToEdit(b)}
                          title="Update Pricing"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Pricing</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <BatchFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <BatchUpdateModal
        isOpen={!!batchToEdit}
        onClose={() => setBatchToEdit(null)}
        batch={batchToEdit}
      />
    </div>
  );
};
