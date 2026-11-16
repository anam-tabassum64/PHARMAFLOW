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
  Building2,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  currentUser?: { name: string; email: string; role: string; pharmacy?: string } | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, currentUser }) => {
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

  const { data: batches } = useQuery({
    queryKey: ['batches', 'dashboard-expiring'],
    queryFn: () => batchApi.getAll({ limit: 50 }),
  });

  const expiringBatches = (batches || [])
    .filter((b) => b.is_expired || b.days_to_expiry <= 60)
    .sort((a, b) => a.days_to_expiry - b.days_to_expiry)
    .slice(0, 4);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* 1. Personalized Welcome & Quick Operational Actions */}
      <div className="bg-white border border-[#E6E5DD] rounded-xl p-5 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#777C76] font-medium mb-1">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#183D32]" />
              {currentUser?.pharmacy || 'St. Jude Central Dispensary'}
            </span>
            <span>•</span>
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-[#2D7A58] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D7A58]" />
              Active Shift #1
            </span>
          </div>
          <h1 className="text-xl font-heading font-extrabold text-[#183D32] tracking-tight">
            Good day, {currentUser?.name || 'Dr. Pharmacist'}
          </h1>
          <p className="text-xs text-[#777C76] mt-0.5">
            Overview of monitored clinical formulary, lot shelf-life status, and recent dispensing activity.
          </p>
        </div>

        {/* Quick Operations CTA Strip */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSaleOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispense (Sale)</span>
          </button>
          <button
            onClick={() => setIsPurchaseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#F8F7F2] hover:bg-[#E7EDE5] text-[#183D32] border border-[#E6E5DD] shadow-subtle transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#183D32]" />
            <span>Receive (Purchase)</span>
          </button>
          <button
            onClick={() => setIsAddMedicineOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-[#F8F7F2] text-[#252A27] border border-[#E6E5DD] shadow-subtle transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#777C76]" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* 2. Key Inventory KPI Strip */}
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
              title="Total Available Stock"
              value={summary?.total_units_in_stock?.toLocaleString() || '0'}
              subtitle={`${summary?.total_batches || 0} batches • ${summary?.active_medicines || 0} active medicines`}
              icon={Boxes}
              variant="forest"
            />
            <StatCard
              title="Inventory Valuation"
              value={`$${Number(summary?.total_inventory_valuation || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              subtitle="Calculated at purchase acquisition cost"
              icon={DollarSign}
              variant="charcoal"
            />
            <StatCard
              title="Low-Stock Deficits"
              value={summary?.low_stock_medicines_count || 0}
              subtitle="Medicines at or below safety reorder level"
              icon={AlertTriangle}
              variant={summary?.low_stock_medicines_count ? 'amber' : 'forest'}
              badge={
                summary?.low_stock_medicines_count
                  ? 'Reorder Needed'
                  : 'Balanced'
              }
            />
            <StatCard
              title="Expiry Risk (≤30 Days)"
              value={summary?.expiring_soon_count || 0}
              subtitle={`${summary?.expired_batches_count || 0} expired lots rejected by FEFO`}
              icon={Clock}
              variant={summary?.expiring_soon_count || summary?.expired_batches_count ? 'rose' : 'forest'}
              badge={
                summary?.expired_batches_count
                  ? `${summary.expired_batches_count} Expired`
                  : undefined
              }
            />
          </>
        )}
      </div>

      {/* 3. Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Recent Stock Movements & Dispensing Feed */}
        <div className="lg:col-span-2 bg-white border border-[#E6E5DD] rounded-xl shadow-subtle flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-4 border-b border-[#E6E5DD] flex items-center justify-between bg-[#F8F7F2]">
              <div>
                <h3 className="text-sm font-heading font-extrabold text-[#183D32] tracking-tight">
                  Recent Inventory Transactions
                </h3>
                <p className="text-[11px] text-[#777C76]">
                  Real-time stock movements logged with atomic database integrity
                </p>
              </div>
              <button
                onClick={() => onNavigate('movements')}
                className="text-xs text-[#183D32] hover:text-[#122E26] font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Audit Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isMovementsLoading ? (
              <div className="p-4">
                <TableSkeleton rows={5} cols={5} />
              </div>
            ) : !recentMovements || recentMovements.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#777C76]">
                No stock transactions recorded in this shift.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F1F0E9] text-[#4C544F] font-semibold border-b border-[#E6E5DD] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Ref #</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-4">Medicine Item</th>
                      <th className="py-2.5 px-3">Batch Lot</th>
                      <th className="py-2.5 px-4 text-right">Delta Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E5DD] text-[#252A27]">
                    {recentMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-[#F8F7F2] transition-colors">
                        <td className="py-2.5 px-4 font-mono font-medium text-[#183D32]">
                          {m.reference_number}
                        </td>
                        <td className="py-2.5 px-3">
                          <MovementBadge type={m.movement_type} />
                        </td>
                        <td className="py-2.5 px-4 font-medium text-[#252A27] max-w-[200px] truncate">
                          {m.medicine_name || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#777C76]">
                          {m.batch_number || 'N/A'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold">
                          <span
                            className={m.quantity > 0 ? 'text-[#2D7A58]' : 'text-[#C93B2B]'}
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

          <div className="p-3 bg-[#F8F7F2] border-t border-[#E6E5DD] flex items-center justify-between text-xs text-[#777C76]">
            <span>All dispensing & inward movements update batch lots atomically.</span>
            <button
              onClick={() => onNavigate('movements')}
              className="text-[#183D32] hover:underline font-semibold"
            >
              Full Ledger →
            </button>
          </div>
        </div>

        {/* Right Column (1/3): Actionable Alert Panels */}
        <div className="space-y-6">
          {/* Panel 1: Low-Stock Deficit Watchlist */}
          <div className="bg-white border border-[#E6E5DD] rounded-xl p-4 shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E5DD] mb-3">
              <h3 className="text-xs font-heading font-extrabold text-[#183D32] tracking-tight flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-4 h-4 text-[#C27803]" />
                Low Stock Deficits ({lowStockItems?.length || 0})
              </h3>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs text-[#183D32] font-semibold hover:underline"
              >
                Inspect
              </button>
            </div>

            {!lowStockItems || lowStockItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#777C76]">
                All medicines are currently above reorder safety levels.
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-[#F8F7F2] border border-[#E6E5DD] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-[#252A27]">{item.name}</h4>
                      <p className="text-[11px] text-[#777C76] font-mono">
                        {item.medicine_code} • {item.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#252A27] block">
                        {item.total_available_stock} / {item.reorder_level} {item.unit}
                      </span>
                      <span className="text-[10px] text-[#C93B2B] font-semibold">
                        Deficit: -{item.deficit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-[#E6E5DD]">
              <button
                onClick={() => setIsPurchaseOpen(true)}
                className="w-full py-1.5 px-3 rounded-lg bg-[#E7EDE5] hover:bg-[#D5DFD1] text-[#183D32] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Restock Purchase Orders</span>
              </button>
            </div>
          </div>

          {/* Panel 2: Expiry FEFO Watchlist */}
          <div className="bg-white border border-[#E6E5DD] rounded-xl p-4 shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E5DD] mb-3">
              <h3 className="text-xs font-heading font-extrabold text-[#183D32] tracking-tight flex items-center gap-1.5 uppercase">
                <Clock className="w-4 h-4 text-[#C93B2B]" />
                FEFO Priority Expiry
              </h3>
              <button
                onClick={() => onNavigate('batches')}
                className="text-xs text-[#183D32] font-semibold hover:underline"
              >
                Batches
              </button>
            </div>

            {expiringBatches.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#777C76]">
                No batches expiring within the next 60 days.
              </div>
            ) : (
              <div className="space-y-2.5">
                {expiringBatches.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg bg-[#F8F7F2] border border-[#E6E5DD] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#252A27] block truncate max-w-[130px]">
                        {b.medicine_name || 'Medicine'}
                      </span>
                      <span className="text-[10px] font-mono text-[#777C76]">
                        Lot: {b.batch_number}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-[#252A27] block">
                        {b.available_quantity} units
                      </span>
                      {b.is_expired ? (
                        <span className="text-[10px] font-bold text-[#C93B2B] uppercase">Expired</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#C27803]">
                          {b.days_to_expiry}d remaining
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-[#E6E5DD]">
              <button
                onClick={() => onNavigate('reports')}
                className="w-full py-1.5 px-3 rounded-lg bg-[#F1F0E9] hover:bg-[#E6E5DD] text-[#252A27] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-[#777C76]" />
                <span>View Full Expiry Risk Report</span>
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
