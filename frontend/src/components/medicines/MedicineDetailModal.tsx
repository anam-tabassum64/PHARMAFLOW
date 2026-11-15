import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { batchApi } from '../../api/batchApi';
import { Medicine } from '../../types/medicine';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { TableSkeleton } from '../ui/LoadingSkeleton';
import { Boxes, Calendar } from 'lucide-react';

interface MedicineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  isOpen,
  onClose,
  medicine,
}) => {
  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches', medicine?.id],
    queryFn: () => batchApi.getAll({ medicine_id: medicine!.id }),
    enabled: !!medicine && isOpen,
  });

  if (!medicine) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={medicine.name}
      subtitle={`${medicine.medicine_code} • ${medicine.generic_name}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Medicine Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">Category</span>
            <span className="font-semibold text-slate-900">{medicine.category}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Manufacturer</span>
            <span className="font-semibold text-slate-900">{medicine.manufacturer}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Total Available Stock</span>
            <span className="font-bold text-slate-900 font-mono">
              {medicine.total_available_stock} {medicine.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Reorder Level</span>
            <span className="font-semibold text-amber-700 font-mono">{medicine.reorder_level}</span>
          </div>
        </div>

        {medicine.description && (
          <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <span className="font-semibold text-slate-900 block mb-1">Clinical Notes & Indications:</span>
            {medicine.description}
          </div>
        )}

        {/* Batches Table */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-teal-700" />
              Active Inventory Batches ({batches?.length || 0})
            </h4>
          </div>

          {isLoading ? (
            <TableSkeleton rows={3} cols={4} />
          ) : !batches || batches.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              No batches recorded for this medicine yet. Use the "Stock Movements" tab to receive stock.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Batch Number</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3">Stock Units</th>
                    <th className="py-2.5 px-3">Selling Price</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {b.batch_number}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 font-mono text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.expiry_date}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                        {b.available_quantity} / {b.initial_quantity}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-900">
                        ${Number(b.selling_price).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3">
                        {b.is_expired ? (
                          <Badge variant="danger">Expired</Badge>
                        ) : b.days_to_expiry <= 30 ? (
                          <Badge variant="warning">{b.days_to_expiry}d left</Badge>
                        ) : (
                          <Badge variant="success">Safe</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
