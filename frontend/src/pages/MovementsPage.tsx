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
      <div className="p-5 rounded-lg bg-white border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-teal-700" />
            Stock Movements & Audit Operations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every material transaction updates batch quantity and commits an immutable audit record.
          </p>
        </div>

        {/* The 4 Action Triggers */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPurchaseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-sm transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Purchase (Inward)</span>
          </button>
          <button
            onClick={() => setIsSaleOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#14243A] hover:bg-slate-800 text-white shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Sale (Dispense)</span>
          </button>
          <button
            onClick={() => setIsReturnOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Process Return</span>
          </button>
          <button
            onClick={() => setIsAdjustmentOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedType === type
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Movements Audit Table Card */}
      <div className="rounded-lg bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4">
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
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Medicine Item</th>
                  <th className="py-3 px-4">Batch Lot</th>
                  <th className="py-3 px-4 text-right">Quantity Delta</th>
                  <th className="py-3 px-4">Audit Justification / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {movements.map((m) => {
                  const dateStr = new Date(m.created_at).toLocaleString();
                  const isPositive = m.quantity > 0;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {m.reference_number}
                      </td>
                      <td className="py-3 px-4">
                        <MovementBadge type={m.movement_type} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {m.medicine_name || 'N/A'}
                        </span>
                        {m.medicine_code && (
                          <span className="text-[10px] text-teal-700 font-mono">
                            {m.medicine_code}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {m.batch_number || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-xs">
                        <span className={isPositive ? 'text-emerald-700' : 'text-red-700'}>
                          {isPositive ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {m.notes || <span className="text-slate-400 italic">No notes</span>}
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
