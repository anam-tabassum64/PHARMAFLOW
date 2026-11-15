import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { movementApi } from '../api/movementApi';
import { batchApi } from '../api/batchApi';
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
  Calendar,
  AlertCircle,
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
    queryFn: () => movementApi.getAll({ limit: 8 }),
    refetchInterval: 15000,
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ['low-stock'],
    queryFn: inventoryApi.getLowStock,
  });

  const { data: batches } = useQuery({
    queryKey: ['batches', 'dashboard-expiring'],
    queryFn: () => batchApi.getAll({ limit: 50 }),
  });

  // Filter expiring batches (< 60 days or expired)
  const expiringBatches = (batches || [])
    .filter((b) => b.is_expired || b.days_to_expiry <= 60)
    .sort((a, b) => a.days_to_expiry - b.days_to_expiry)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Pharmacy Operations Quick Actions Bar */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Pharmacy Dispensing & Stock Operations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Dispensary • Log daily counter dispensing, inward receipts, or register formulary items
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSaleOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispense (Sale)</span>
          </button>
          <button
            onClick={() => setIsPurchaseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
            <span>Receive (Purchase)</span>
          </button>
          <button
            onClick={() => setIsAddMedicineOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              title="Available Stock"
              value={summary?.total_units_in_stock?.toLocaleString() || '0'}
              subtitle={`${summary?.total_batches || 0} batches • ${summary?.active_medicines || 0} medicines`}
              icon={Boxes}
              variant="teal"
            />
            <StatCard
              title="Inventory Valuation"
              value={`$${Number(summary?.total_inventory_valuation || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              subtitle="Purchase cost basis"
              icon={DollarSign}
              variant="navy"
            />
            <StatCard
              title="Low-Stock Alerts"
              value={summary?.low_stock_medicines_count || 0}
              subtitle="At or below reorder threshold"
              icon={AlertTriangle}
              variant={summary?.low_stock_medicines_count ? 'amber' : 'teal'}
              badge={
                summary?.low_stock_medicines_count
                  ? 'Needs Restock'
                  : 'Optimal'
              }
            />
            <StatCard
              title="Expiry Risk (≤30 Days)"
              value={summary?.expiring_soon_count || 0}
              subtitle={`${summary?.expired_batches_count || 0} expired lots rejected`}
              icon={Clock}
              variant={summary?.expiring_soon_count || summary?.expired_batches_count ? 'rose' : 'teal'}
              badge={
                summary?.expired_batches_count
                  ? `${summary.expired_batches_count} Expired`
                  : undefined
              }
            />
          </>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Stock Movements & Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-lg shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recent Stock Movements & Audit Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Last 8 transactions recorded with atomic batch quantity updates
                </p>
              </div>
              <button
                onClick={() => onNavigate('movements')}
                className="text-xs text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1"
              >
                <span>View Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isMovementsLoading ? (
              <div className="p-4">
                <TableSkeleton rows={5} cols={5} />
              </div>
            ) : !recentMovements || recentMovements.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No recent transactions recorded in this shift.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Ref #</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-4">Medicine Item</th>
                      <th className="py-2.5 px-3">Batch Lot</th>
                      <th className="py-2.5 px-4 text-right">Delta Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {recentMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                          {m.reference_number}
                        </td>
                        <td className="py-2.5 px-3">
                          <MovementBadge type={m.movement_type} />
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900 max-w-[200px] truncate">
                          {m.medicine_name || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {m.batch_number || 'N/A'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold">
                          <span
                            className={m.quantity > 0 ? 'text-emerald-700' : 'text-red-700'}
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

          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Audit trail is immutable and legally compliant.</span>
            <button
              onClick={() => onNavigate('movements')}
              className="text-teal-700 hover:text-teal-800 font-medium"
            >
              Manage Movements →
            </button>
          </div>
        </div>

        {/* Right Column: Operational Alert Items (1 col) */}
        <div className="space-y-6">
          {/* Low Stock Watchlist */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Low Stock Deficits ({lowStockItems?.length || 0})
              </h3>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs text-teal-700 hover:text-teal-800 font-medium"
              >
                View
              </button>
            </div>

            {!lowStockItems || lowStockItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                All medicines are currently above reorder levels.
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {item.medicine_code} • {item.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-900 block">
                        {item.total_available_stock} / {item.reorder_level} {item.unit}
                      </span>
                      <span className="text-[10px] text-red-600 font-medium">
                        Deficit: -{item.deficit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsPurchaseOpen(true)}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-teal-700" />
                <span>Restock Inventory</span>
              </button>
            </div>
          </div>

          {/* Expiry Risk Focus */}
          <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
                <Clock className="w-4 h-4 text-red-600" />
                Expiry FEFO Priority
              </h3>
              <button
                onClick={() => onNavigate('batches')}
                className="text-xs text-teal-700 hover:text-teal-800 font-medium"
              >
                Batches
              </button>
            </div>

            {expiringBatches.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No batches expiring within the next 60 days.
              </div>
            ) : (
              <div className="space-y-2.5">
                {expiringBatches.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block truncate max-w-[130px]">
                        {b.medicine_name || 'Medicine'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Lot: {b.batch_number}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-700 block">
                        {b.available_quantity} units
                      </span>
                      {b.is_expired ? (
                        <span className="text-[10px] font-bold text-red-600 uppercase">Expired</span>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-700">
                          {b.days_to_expiry}d remaining
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => onNavigate('reports')}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>View Expiry Stratification</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Modals */}
      <PurchaseModal isOpen={isPurchaseOpen} onClose={() => setIsPurchaseOpen(false)} />
      <SaleModal isOpen={isSaleOpen} onClose={() => setIsSaleOpen(false)} />
      <MedicineFormModal isOpen={isAddMedicineOpen} onClose={() => setIsAddMedicineOpen(false)} />
    </div>
  );
};
