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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] text-xs">
          <div>
            <span className="text-[#777C76] block mb-0.5">Category</span>
            <span className="font-semibold text-[#252A27]">{medicine.category}</span>
          </div>
          <div>
            <span className="text-[#777C76] block mb-0.5">Manufacturer</span>
            <span className="font-semibold text-[#252A27]">{medicine.manufacturer}</span>
          </div>
          <div>
            <span className="text-[#777C76] block mb-0.5">Total Available Stock</span>
            <span className="font-bold text-[#183D32] font-mono">
              {medicine.total_available_stock} {medicine.unit}
            </span>
          </div>
          <div>
            <span className="text-[#777C76] block mb-0.5">Reorder Level</span>
            <span className="font-semibold text-amber-700 font-mono">{medicine.reorder_level}</span>
          </div>
        </div>

        {medicine.description && (
          <div className="text-xs text-[#252A27] bg-[#F1F0E9] p-3.5 rounded-xl border border-[#E6E5DD] leading-relaxed">
            <span className="font-heading font-semibold text-[#183D32] block mb-1">Clinical Notes & Indications:</span>
            {medicine.description}
          </div>
        )}

        {/* Batches Table */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#252A27] flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-[#183D32]" />
              Active Inventory Batches ({batches?.length || 0})
            </h4>
          </div>

          {isLoading ? (
            <TableSkeleton rows={3} cols={4} />
          ) : !batches || batches.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#777C76] bg-[#F8F7F2] rounded-xl border border-[#E6E5DD]">
              No batches recorded for this medicine yet. Use the "Stock Movements" tab to receive stock.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#E6E5DD]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F0E9] text-[#252A27] border-b border-[#E6E5DD] font-heading font-semibold">
                  <tr>
                    <th className="py-3 px-3.5">Batch Number</th>
                    <th className="py-3 px-3.5">Expiry Date</th>
                    <th className="py-3 px-3.5">Stock Units</th>
                    <th className="py-3 px-3.5">Selling Price</th>
                    <th className="py-3 px-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E5DD]/60 text-[#252A27]">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F8F7F2]/80 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-[#183D32]">
                        {b.batch_number}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1 font-mono text-[#252A27]">
                          <Calendar className="w-3.5 h-3.5 text-[#777C76]" />
                          <span>{b.expiry_date}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-mono font-semibold text-[#252A27]">
                        {b.available_quantity} / {b.initial_quantity}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-semibold text-[#183D32]">
                        ${Number(b.selling_price).toFixed(2)}
                      </td>
                      <td className="py-3 px-3.5">
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

        <div className="flex justify-end pt-3 border-t border-[#E6E5DD]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-all duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default MedicineDetailModal;
