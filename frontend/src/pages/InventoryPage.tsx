import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { medicineApi } from '../api/medicineApi';
import { extractErrorMessage } from '../api/client';
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
      {/* KPI Overview Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Stock Units
            </span>
            <span className="text-xl font-bold text-white">
              {summary?.total_units_in_stock?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Low Stock Deficit Items
            </span>
            <span className="text-xl font-bold text-amber-400">
              {summary?.low_stock_medicines_count || 0}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Formularies
            </span>
            <span className="text-xl font-bold text-white">
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
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Inventory ({inventory?.length || 0})
          </button>
          <button
            onClick={() => setFilterMode('low')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterMode === 'low'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
                : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Low Stock Deficit ({lowStockItems?.length || 0})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-850 border border-slate-755 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Inventory Table Card */}
      <div className="rounded-2xl bg-slate-850 border border-slate-800 shadow-xl overflow-hidden">
        {isInvLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : filteredMedicines.length === 0 ? (
          <EmptyState
            title="No Items Match Criteria"
            description="All monitored inventory thresholds are currently balanced."
            icon={Layers}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Medicine Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Batches</th>
                  <th className="py-3 px-4">Stock vs Reorder Threshold</th>
                  <th className="py-3 px-4 text-right">Available Quantity</th>
                  <th className="py-3 px-4 text-center">Stock Health</th>
                  <th className="py-3 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredMedicines.map((m) => {
                  const isLow = m.total_available_stock <= m.reorder_level;
                  const ratio = Math.min(
                    100,
                    Math.round((m.total_available_stock / Math.max(1, m.reorder_level * 2)) * 100)
                  );

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block text-sm">{m.name}</span>
                        <span className="text-[11px] font-mono text-emerald-400">
                          {m.medicine_code}
                        </span>{' '}
                        • <span className="text-[11px] text-slate-400">{m.manufacturer}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px]">
                          {m.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {m.batch_count} {m.batch_count === 1 ? 'batch' : 'batches'}
                      </td>
                      <td className="py-3 px-4 w-52">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Avail: {m.total_available_stock}</span>
                            <span>Reorder: {m.reorder_level}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isLow ? 'bg-amber-400' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                        <span className={isLow ? 'text-amber-400' : 'text-emerald-400'}>
                          {m.total_available_stock}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400 font-normal">{m.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {m.total_available_stock === 0 ? (
                          <Badge variant="danger">Out of Stock</Badge>
                        ) : isLow ? (
                          <Badge variant="warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">Optimal</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailMedicine(m)}
                            title="Inspect Batches"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRestockMedicineId(m.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 transition-all"
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
