import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { Badge, MovementBadge } from '../components/ui/Badge';
import {
  Download,
  Boxes,
  Clock,
  ArrowLeftRight,
  ShieldAlert,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'stock' | 'expiry' | 'movements'>('stock');

  const { data: stockReport, isLoading: isStockLoading } = useQuery({
    queryKey: ['report-stock'],
    queryFn: reportApi.getStockReport,
    enabled: activeReport === 'stock',
  });

  const { data: expiryReport, isLoading: isExpiryLoading } = useQuery({
    queryKey: ['report-expiry'],
    queryFn: reportApi.getExpiryReport,
    enabled: activeReport === 'expiry',
  });

  const { data: movementReport, isLoading: isMovementLoading } = useQuery({
    queryKey: ['report-movements'],
    queryFn: reportApi.getMovementReport,
    enabled: activeReport === 'movements',
  });

  // CSV Export utility
  const exportToCSV = (filename: string, rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows
        .map((e) =>
          e
            .map((val) => {
              const str = String(val ?? '').replace(/"/g, '""');
              return `"${str}"`;
            })
            .join(',')
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (activeReport === 'stock' && stockReport) {
      const headers = [
        'Medicine Code',
        'Medicine Name',
        'Generic Name',
        'Category',
        'Reorder Level',
        'Total Available Stock',
        'Total Valuation ($)',
      ];
      const rows = stockReport.map((m) => [
        m.medicine_code,
        m.name,
        m.generic_name,
        m.category,
        m.reorder_level,
        m.total_available_stock,
        m.total_valuation,
      ]);
      exportToCSV('PharmaFlow_Stock_Valuation_Report', [headers, ...rows]);
    } else if (activeReport === 'expiry' && expiryReport) {
      const headers = [
        'Batch Lot #',
        'Medicine Name',
        'Medicine Code',
        'Manufacturing Date',
        'Expiry Date',
        'Available Qty',
        'Status',
      ];
      const allBatches = [
        ...expiryReport.expired_batches.map((b) => [
          b.batch_number,
          b.medicine_name || '',
          b.medicine_code || '',
          b.manufacturing_date,
          b.expiry_date,
          b.available_quantity,
          'EXPIRED',
        ]),
        ...expiryReport.expiring_in_30_days.map((b) => [
          b.batch_number,
          b.medicine_name || '',
          b.medicine_code || '',
          b.manufacturing_date,
          b.expiry_date,
          b.available_quantity,
          'EXPIRING_30_DAYS',
        ]),
        ...expiryReport.expiring_in_60_days.map((b) => [
          b.batch_number,
          b.medicine_name || '',
          b.medicine_code || '',
          b.manufacturing_date,
          b.expiry_date,
          b.available_quantity,
          'EXPIRING_60_DAYS',
        ]),
        ...expiryReport.safe_batches.map((b) => [
          b.batch_number,
          b.medicine_name || '',
          b.medicine_code || '',
          b.manufacturing_date,
          b.expiry_date,
          b.available_quantity,
          'SAFE',
        ]),
      ];
      exportToCSV('PharmaFlow_Expiry_Stratification_Report', [headers, ...allBatches]);
    } else if (activeReport === 'movements' && movementReport) {
      const headers = [
        'Reference #',
        'Timestamp',
        'Movement Type',
        'Medicine',
        'Batch Lot',
        'Quantity Delta',
        'Audit Notes',
      ];
      const rows = movementReport.recent_movements.map((m) => [
        m.reference_number,
        m.created_at,
        m.movement_type,
        m.medicine_name || '',
        m.batch_number || '',
        m.quantity,
        m.notes || '',
      ]);
      exportToCSV('PharmaFlow_Movement_Audit_Ledger', [headers, ...rows]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-6 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle">
        {/* Report Selector Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveReport('stock')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              activeReport === 'stock'
                ? 'bg-[#183D32] text-white shadow-subtle'
                : 'bg-white text-[#252A27] hover:bg-[#F8F7F2] border border-[#E6E5DD]'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Stock Valuation</span>
          </button>
          <button
            onClick={() => setActiveReport('expiry')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              activeReport === 'expiry'
                ? 'bg-[#183D32] text-white shadow-subtle'
                : 'bg-white text-[#252A27] hover:bg-[#F8F7F2] border border-[#E6E5DD]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Expiry Risk</span>
          </button>
          <button
            onClick={() => setActiveReport('movements')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              activeReport === 'movements'
                ? 'bg-[#183D32] text-white shadow-subtle'
                : 'bg-white text-[#252A27] hover:bg-[#F8F7F2] border border-[#E6E5DD]'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Movement Audit</span>
          </button>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F8F7F2] text-[#252A27] border border-[#E6E5DD] transition-all duration-150 shadow-subtle"
        >
          <Download className="w-4 h-4 text-[#183D32]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Report 1: Stock Valuation */}
      {activeReport === 'stock' && (
        <div className="rounded-xl bg-white border border-[#E6E5DD] shadow-subtle overflow-hidden">
          <div className="p-5 border-b border-[#E6E5DD] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-heading font-bold text-[#252A27] tracking-tight">
                Formula Valuation & Inventory Breakdown
              </h3>
              <p className="text-xs text-[#777C76] mt-0.5">
                Aggregated valuation calculated from physical batch purchase cost
              </p>
            </div>
            <span className="text-xs font-medium text-[#777C76]">
              Total Formularies: {stockReport?.length || 0}
            </span>
          </div>

          {isStockLoading ? (
            <div className="p-6">
              <TableSkeleton rows={8} cols={6} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F0E9] text-[#252A27] uppercase tracking-wider text-[11px] font-heading font-semibold border-b border-[#E6E5DD]">
                  <tr>
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Medicine Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-center">Batch Count</th>
                    <th className="py-3.5 px-4 text-right">Available Units</th>
                    <th className="py-3.5 px-4 text-right">Inventory Valuation ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E5DD]/60 text-[#252A27]">
                  {stockReport?.map((m) => (
                    <tr key={m.medicine_id} className="hover:bg-[#F8F7F2]/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#183D32]">
                        {m.medicine_code}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#252A27]">
                        {m.name}
                        <span className="text-[#777C76] font-normal block text-[11px] italic">
                          {m.generic_name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#777C76]">{m.category}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-[#252A27]">
                        {m.batches.length}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-xs text-[#252A27]">
                        {m.total_available_stock}{' '}
                        <span className="text-[10px] text-[#777C76] font-normal">{m.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#183D32]">
                        ${Number(m.total_valuation).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Report 2: Expiry Risk */}
      {activeReport === 'expiry' && (
        <div className="space-y-6">
          {/* Expiry KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-red-50/60 border border-red-200 shadow-subtle">
              <span className="text-[11px] font-semibold text-red-800 uppercase block tracking-wider">
                Expired Batches
              </span>
              <span className="text-2xl font-heading font-bold text-red-700 mt-1 block">
                {expiryReport?.expired_batches.length || 0}
              </span>
              <span className="text-[11px] text-red-600 block mt-1">Dispensing rejected</span>
            </div>

            <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200 shadow-subtle">
              <span className="text-[11px] font-semibold text-amber-800 uppercase block tracking-wider">
                Expiring ≤ 30 Days
              </span>
              <span className="text-2xl font-heading font-bold text-amber-700 mt-1 block">
                {expiryReport?.expiring_in_30_days.length || 0}
              </span>
              <span className="text-[11px] text-amber-600 block mt-1">Immediate FEFO focus</span>
            </div>

            <div className="p-5 rounded-xl bg-[#F1F0E9] border border-[#E6E5DD] shadow-subtle">
              <span className="text-[11px] font-semibold text-[#777C76] uppercase block tracking-wider">
                Expiring 31-90 Days
              </span>
              <span className="text-2xl font-heading font-bold text-[#252A27] mt-1 block">
                {(expiryReport?.expiring_in_60_days.length || 0) +
                  (expiryReport?.expiring_in_90_days.length || 0)}
              </span>
              <span className="text-[11px] text-[#777C76] block mt-1">Medium shelf-life</span>
            </div>

            <div className="p-5 rounded-xl bg-[#E7EDE5] border border-[#A8B8A2]/50 shadow-subtle">
              <span className="text-[11px] font-semibold text-[#183D32] uppercase block tracking-wider">
                Safe Batches (&gt;90d)
              </span>
              <span className="text-2xl font-heading font-bold text-[#183D32] mt-1 block">
                {expiryReport?.safe_batches.length || 0}
              </span>
              <span className="text-[11px] text-[#183D32]/80 block mt-1">Stable inventory</span>
            </div>
          </div>

          {/* Expired Batches Table */}
          {expiryReport && expiryReport.expired_batches.length > 0 && (
            <div className="rounded-xl bg-white border border-red-200 shadow-subtle overflow-hidden">
              <div className="p-4 bg-red-50 border-b border-red-200 flex items-center gap-2 text-red-800 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Action Required: Expired Lots (Barred from Sales & Customer Returns)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F1F0E9] text-[#252A27] border-b border-[#E6E5DD] font-heading">
                    <tr>
                      <th className="py-3 px-4">Batch Lot #</th>
                      <th className="py-3 px-4">Medicine Item</th>
                      <th className="py-3 px-4">Expiry Date</th>
                      <th className="py-3 px-4 text-right">Units Trapped</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E5DD]/60 text-[#252A27]">
                    {expiryReport.expired_batches.map((b) => (
                      <tr key={b.id} className="hover:bg-red-50/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-red-700">
                          {b.batch_number}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#252A27]">{b.medicine_name}</td>
                        <td className="py-3 px-4 font-mono text-red-700 font-semibold">
                          {b.expiry_date}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#252A27]">
                          {b.available_quantity}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="danger">EXPIRED</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report 3: Movements Audit */}
      {activeReport === 'movements' && (
        <div className="space-y-6">
          {/* Movement Aggregation Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle">
              <span className="text-[11px] font-semibold text-[#777C76] uppercase block tracking-wider">
                Total Purchases
              </span>
              <span className="text-xl font-heading font-bold text-[#183D32] mt-1 block">
                {movementReport?.purchases_count || 0}
              </span>
              <span className="text-[10px] text-[#777C76] block mt-0.5">
                {movementReport?.total_units_purchased || 0} units inward
              </span>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle">
              <span className="text-[11px] font-semibold text-[#777C76] uppercase block tracking-wider">
                Total Sales
              </span>
              <span className="text-xl font-heading font-bold text-[#252A27] mt-1 block">
                {movementReport?.sales_count || 0}
              </span>
              <span className="text-[10px] text-[#777C76] block mt-0.5">
                {movementReport?.total_units_sold || 0} units dispensed
              </span>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle">
              <span className="text-[11px] font-semibold text-[#777C76] uppercase block tracking-wider">
                Customer Returns
              </span>
              <span className="text-xl font-heading font-bold text-amber-700 mt-1 block">
                {movementReport?.returns_count || 0}
              </span>
              <span className="text-[10px] text-[#777C76] block mt-0.5">
                {movementReport?.total_units_returned || 0} units restocked
              </span>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle">
              <span className="text-[11px] font-semibold text-[#777C76] uppercase block tracking-wider">
                Manual Adjustments
              </span>
              <span className="text-xl font-heading font-bold text-[#252A27] mt-1 block">
                {movementReport?.adjustments_count || 0}
              </span>
              <span className="text-[10px] text-[#777C76] block mt-0.5">
                Net: {movementReport?.net_units_adjusted || 0} units
              </span>
            </div>
          </div>

          {/* Audit Ledger Table */}
          <div className="rounded-xl bg-white border border-[#E6E5DD] shadow-subtle overflow-hidden">
            <div className="p-5 border-b border-[#E6E5DD] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-heading font-bold text-[#252A27] tracking-tight">
                  Historical Transaction Audit Ledger
                </h3>
                <p className="text-xs text-[#777C76] mt-0.5">
                  Full immutable history of stock changes with audit notes
                </p>
              </div>
              <span className="text-xs font-medium text-[#777C76]">
                Total Logged: {movementReport?.total_movements || 0}
              </span>
            </div>

            {isMovementLoading ? (
              <div className="p-6">
                <TableSkeleton rows={8} cols={6} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F1F0E9] text-[#252A27] uppercase tracking-wider text-[11px] font-heading font-semibold border-b border-[#E6E5DD]">
                    <tr>
                      <th className="py-3.5 px-4">Ref Number</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Medicine Item</th>
                      <th className="py-3.5 px-4">Batch Lot</th>
                      <th className="py-3.5 px-4 text-right">Delta</th>
                      <th className="py-3.5 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E5DD]/60 text-[#252A27]">
                    {movementReport?.recent_movements.map((m) => (
                      <tr key={m.id} className="hover:bg-[#F8F7F2]/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-[#252A27]">
                          {m.reference_number}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#777C76] text-[11px]">
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <MovementBadge type={m.movement_type} />
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#252A27]">{m.medicine_name}</td>
                        <td className="py-3.5 px-4 font-mono text-[#777C76]">{m.batch_number}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          <span className={m.quantity > 0 ? 'text-emerald-700' : 'text-red-700'}>
                            {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#777C76] max-w-xs truncate">{m.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ReportsPage;
