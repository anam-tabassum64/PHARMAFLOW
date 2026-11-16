import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { movementApi } from '../api/movementApi';
import { MovementType } from '../types/movement';
import { MovementBadge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { PurchaseModal } from '../components/movements/PurchaseModal';
import { SaleModal } from '../components/movements/SaleModal';
import { ReturnModal } from '../components/movements/ReturnModal';
import { AdjustmentModal } from '../components/movements/AdjustmentModal';
import {
  ArrowLeftRight,
  ShoppingCart,
  Send,
  RotateCcw,
  Sliders,
} from 'lucide-react';

export const MovementsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<MovementType | 'ALL'>('ALL');

  // Modals state
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  const { data: movements, isLoading } = useQuery({
    queryKey: ['movements', selectedType],
    queryFn: () =>
      movementApi.getAll({
        movement_type: selectedType === 'ALL' ? undefined : selectedType,
        limit: 200,
      }),
  });

  return (
    <div className="space-y-6">
      {/* Operations Action Bar */}
      <div className="p-6 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-heading font-bold text-[#252A27] tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-[#183D32]" />
            Stock Movements & Audit Operations
          </h2>
          <p className="text-xs text-[#777C76] mt-1">
            Every material transaction updates batch quantity and commits an immutable, timestamped audit record.
          </p>
        </div>

        {/* The 4 Action Triggers */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPurchaseOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-all duration-150"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Purchase (Inward)</span>
          </button>
          <button
            onClick={() => setIsSaleOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#252A27] hover:bg-black text-white shadow-subtle transition-all duration-150"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Sale (Dispense)</span>
          </button>
          <button
            onClick={() => setIsReturnOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-subtle transition-all duration-150"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Process Return</span>
          </button>
          <button
            onClick={() => setIsAdjustmentOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F8F7F2] text-[#252A27] border border-[#E6E5DD] shadow-subtle transition-all duration-150"
          >
            <Sliders className="w-3.5 h-3.5 text-[#777C76]" />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>

      {/* Movement Type Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['ALL', 'PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
              selectedType === type
                ? 'bg-[#183D32] text-white shadow-subtle'
                : 'bg-white text-[#252A27] hover:bg-[#F8F7F2] border border-[#E6E5DD]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Movements Audit Table Card */}
      <div className="rounded-xl bg-white border border-[#E6E5DD] shadow-subtle overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={7} />
          </div>
        ) : !movements || movements.length === 0 ? (
          <EmptyState
            title="No Movements Recorded"
            description="No inventory transactions match the active filter criteria."
            icon={ArrowLeftRight}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F0E9] text-[#252A27] font-heading font-semibold border-b border-[#E6E5DD] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">Ref Number</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Medicine Item</th>
                  <th className="py-3.5 px-4">Batch Lot</th>
                  <th className="py-3.5 px-4 text-right">Quantity Delta</th>
                  <th className="py-3.5 px-4">Audit Justification / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E5DD]/60 text-[#252A27]">
                {movements.map((m) => {
                  const dateStr = new Date(m.created_at).toLocaleString();
                  const isPositive = m.quantity > 0;

                  return (
                    <tr key={m.id} className="hover:bg-[#F8F7F2]/80 transition-colors">
                      <td className="py-3.5 px-4 text-[#777C76] font-mono text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-[#252A27]">
                        {m.reference_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <MovementBadge type={m.movement_type} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#252A27] block">
                          {m.medicine_name || 'N/A'}
                        </span>
                        {m.medicine_code && (
                          <span className="text-[10px] text-[#183D32] font-mono font-semibold">
                            {m.medicine_code}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#777C76]">
                        {m.batch_number || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-xs">
                        <span className={isPositive ? 'text-emerald-700' : 'text-red-700'}>
                          {isPositive ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#777C76] max-w-xs truncate">
                        {m.notes || <span className="text-[#A8B8A2] italic">No notes</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Operational Modals */}
      <PurchaseModal isOpen={isPurchaseOpen} onClose={() => setIsPurchaseOpen(false)} />
      <SaleModal isOpen={isSaleOpen} onClose={() => setIsSaleOpen(false)} />
      <ReturnModal isOpen={isReturnOpen} onClose={() => setIsReturnOpen(false)} />
      <AdjustmentModal isOpen={isAdjustmentOpen} onClose={() => setIsAdjustmentOpen(false)} />
    </div>
  );
};
export default MovementsPage;
