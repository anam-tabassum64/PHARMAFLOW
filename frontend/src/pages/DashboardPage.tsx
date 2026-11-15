import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { movementApi } from '../api/movementApi';
import { StatCard } from '../components/ui/StatCard';
import { MovementBadge } from '../components/ui/Badge';
import { CardSkeleton, TableSkeleton } from '../components/ui/LoadingSkeleton';
import { NavTab } from '../components/layout/Sidebar';
import { PurchaseModal } from '../components/movements/PurchaseModal';
import { SaleModal } from '../components/movements/SaleModal';
import { MedicineFormModal } from '../components/medicines/MedicineFormModal';
import {
  Boxes,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  ShoppingCart,
  Send,
  TrendingUp,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: inventoryApi.getSummary,
    refetchInterval: 15000,
  });

  const { data: recentMovements, isLoading: isMovementsLoading } = useQuery({
    queryKey: ['movements', 'recent'],
    queryFn: () => movementApi.getAll({ limit: 7 }),
    refetchInterval: 15000,
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ['low-stock'],
    queryFn: inventoryApi.getLowStock,
  });

  return (
    <div className="space-y-8">
      {/* Quick Action Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Pharmacy Operations Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Execute real-time dispensing, inventory restocks, or manage clinical formulary
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSaleOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-lg shadow-sky-950/50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Sale (Dispense)</span>
          </button>
          <button
            onClick={() => setIsPurchaseOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/50"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Restock (Purchase)</span>
          </button>
          <button
            onClick={() => setIsAddMedicineOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/60 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isSummaryLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Available Stock"
              value={summary?.total_units_in_stock?.toLocaleString() || '0'}
              subtitle={`${summary?.total_batches || 0} batches across ${summary?.active_medicines || 0} products`}
              icon={Boxes}
              variant="emerald"
            />
            <StatCard
              title="Stock Valuation"
              value={`$${Number(summary?.total_inventory_valuation || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              subtitle="Calculated at purchase cost"
              icon={DollarSign}
              variant="indigo"
            />
            <StatCard
              title="Low Stock Alerts"
              value={summary?.low_stock_medicines_count || 0}
              subtitle="Medicines at or below reorder level"
              icon={AlertTriangle}
              variant={summary?.low_stock_medicines_count ? 'amber' : 'emerald'}
            />
            <StatCard
              title="Expiry Risk (≤30 Days)"
              value={summary?.expiring_soon_count || 0}
              subtitle={`${summary?.expired_batches_count || 0} batches expired`}
              icon={Clock}
              variant={summary?.expiring_soon_count ? 'rose' : 'emerald'}
            />
          </>
        )}
      </div>

      {/* Two Column Grid: Low Stock Warnings & Recent Movements Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Low Stock Action Items (1 col) */}
        <div className="rounded-2xl bg-slate-850 border border-slate-800 p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Critical Low Stock Items
              </h3>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {!lowStockItems || lowStockItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                All inventory items are currently above their reorder thresholds.
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {item.medicine_code} • {item.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400 block">
                        {item.total_available_stock} / {item.reorder_level} {item.unit}
                      </span>
                      <span className="text-[10px] text-rose-400 font-medium">
                        Deficit: -{item.deficit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => setIsPurchaseOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Purchase Restock Orders</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Movement Feed (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-850 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Live Stock Movements & Transactions
            </h3>
            <button
              onClick={() => onNavigate('movements')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Audit Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isMovementsLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : !recentMovements || recentMovements.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No recent movements logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 font-semibold border-b border-slate-800 pb-2">
                  <tr>
                    <th className="py-2 px-3">Ref #</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Medicine</th>
                    <th className="py-2 px-3">Batch Lot</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {recentMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-300">
                        {m.reference_number}
                      </td>
                      <td className="py-2.5 px-3">
                        <MovementBadge type={m.movement_type} />
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white max-w-[160px] truncate">
                        {m.medicine_name || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {m.batch_number || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        <span
                          className={m.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'}
                        >
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PurchaseModal isOpen={isPurchaseOpen} onClose={() => setIsPurchaseOpen(false)} />
      <SaleModal isOpen={isSaleOpen} onClose={() => setIsSaleOpen(false)} />
      <MedicineFormModal isOpen={isAddMedicineOpen} onClose={() => setIsAddMedicineOpen(false)} />
    </div>
  );
};
