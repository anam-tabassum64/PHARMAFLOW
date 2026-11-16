import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { Medicine } from '../types/medicine';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { PurchaseModal } from '../components/movements/PurchaseModal';
import { MedicineDetailModal } from '../components/medicines/MedicineDetailModal';
import {
  Layers,
  Search,
  ShoppingCart,
  Eye,
  AlertTriangle,
  PackageCheck,
  TrendingDown,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'all' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [restockMedicineId, setRestockMedicineId] = useState<string | null>(null);
  const [detailMedicine, setDetailMedicine] = useState<Medicine | null>(null);

  const { data: inventory, isLoading: isInvLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryApi.getInventory,
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ['low-stock'],
    queryFn: inventoryApi.getLowStock,
  });

  const { data: summary } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: inventoryApi.getSummary,
  });

  const filteredMedicines = (inventory || []).filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.medicine_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'low') {
      return m.total_available_stock <= m.reorder_level;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E7EDE5] text-[#183D32] flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#777C76] uppercase tracking-wider block">
              Total Stock Units
            </span>
            <span className="text-xl font-heading font-bold text-[#183D32]">
              {summary?.total_units_in_stock?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#777C76] uppercase tracking-wider block">
              Low-Stock Deficit Items
            </span>
            <span className="text-xl font-heading font-bold text-amber-700">
              {summary?.low_stock_medicines_count || 0}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F1F0E9] text-[#252A27] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#777C76] uppercase tracking-wider block">
              Active Formularies
            </span>
            <span className="text-xl font-heading font-bold text-[#252A27]">
              {summary?.active_medicines || 0} Products
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              filterMode === 'all'
                ? 'bg-[#183D32] text-white shadow-subtle'
                : 'bg-white text-[#252A27] hover:bg-[#F8F7F2] border border-[#E6E5DD]'
            }`}
          >
            All Inventory ({inventory?.length || 0})
          </button>
          <button
            onClick={() => setFilterMode('low')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 ${
              filterMode === 'low'
                ? 'bg-amber-600 text-white shadow-subtle'
                : 'bg-white text-[#252A27] hover:bg-[#F8F7F2] border border-[#E6E5DD]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Low Stock Deficit ({lowStockItems?.length || 0})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#777C76] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] focus:outline-none focus:ring-2 focus:ring-[#183D32]/10 focus:border-[#183D32] shadow-subtle transition-colors"
          />
        </div>
      </div>

      {/* Main Inventory Table Card */}
      <div className="rounded-xl bg-white border border-[#E6E5DD] shadow-subtle overflow-hidden">
        {isInvLoading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : filteredMedicines.length === 0 ? (
          <EmptyState
            title="No Items Match Criteria"
            description="All monitored inventory thresholds are currently balanced."
            icon={Layers}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F0E9] text-[#252A27] font-heading font-semibold border-b border-[#E6E5DD] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Medicine Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Batches</th>
                  <th className="py-3.5 px-4">Stock vs Reorder Threshold</th>
                  <th className="py-3.5 px-4 text-right">Available Quantity</th>
                  <th className="py-3.5 px-4 text-center">Stock Health</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E5DD]/60 text-[#252A27]">
                {filteredMedicines.map((m) => {
                  const isLow = m.total_available_stock <= m.reorder_level;
                  const ratio = Math.min(
                    100,
                    Math.round((m.total_available_stock / Math.max(1, m.reorder_level * 2)) * 100)
                  );

                  return (
                    <tr key={m.id} className="hover:bg-[#F8F7F2]/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#252A27] block text-xs">{m.name}</span>
                        <span className="text-[11px] font-mono font-semibold text-[#183D32]">
                          {m.medicine_code}
                        </span>{' '}
                        • <span className="text-[11px] text-[#777C76]">{m.manufacturer}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F1F0E9] text-[#252A27] font-medium text-[11px] border border-[#E6E5DD]">
                          {m.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-[#252A27]">
                        {m.batch_count} {m.batch_count === 1 ? 'batch' : 'batches'}
                      </td>
                      <td className="py-3.5 px-4 w-52">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-[#777C76]">
                            <span>Avail: {m.total_available_stock}</span>
                            <span>Reorder: {m.reorder_level}</span>
                          </div>
                          <div className="w-full bg-[#F1F0E9] rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isLow ? 'bg-amber-500' : 'bg-[#183D32]'
                              }`}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-xs">
                        <span className={isLow ? 'text-amber-700' : 'text-[#252A27]'}>
                          {m.total_available_stock}
                        </span>{' '}
                        <span className="text-[10px] text-[#777C76] font-normal">{m.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {m.total_available_stock === 0 ? (
                          <Badge variant="danger">Out of Stock</Badge>
                        ) : isLow ? (
                          <Badge variant="warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">Optimal</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailMedicine(m)}
                            title="Inspect Batches"
                            className="p-1.5 rounded-lg text-[#777C76] hover:text-[#183D32] hover:bg-[#F1F0E9] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRestockMedicineId(m.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white text-[#183D32] hover:bg-[#E7EDE5] border border-[#A8B8A2] shadow-subtle transition-all duration-150"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Restock</span>
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

      {/* Restock Purchase Modal */}
      {restockMedicineId && (
        <PurchaseModal
          isOpen={!!restockMedicineId}
          onClose={() => setRestockMedicineId(null)}
          preselectedMedicineId={restockMedicineId}
        />
      )}

      {/* Medicine Batches Detail Modal */}
      <MedicineDetailModal
        isOpen={!!detailMedicine}
        onClose={() => setDetailMedicine(null)}
        medicine={detailMedicine}
      />
    </div>
  );
};
export default InventoryPage;
