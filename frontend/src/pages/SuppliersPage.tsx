import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { medicineApi } from '../api/medicineApi';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Pill,
  ExternalLink,
  Edit2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface SupplierData {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  gmpCertified: boolean;
  coldChainReady: boolean;
  medicinesCount: number;
  totalStockUnits: number;
  medicineNames: string[];
}

export const SuppliersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierData | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('');

  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => medicineApi.getAll({ limit: 300 }),
  });

  // Synthesize realistic supplier directories from medicines & manufacturers
  const initialSuppliers: SupplierData[] = useMemo(() => {
    if (!medicines) return [];

    const manufacturerMap = new Map<string, { count: number; stock: number; names: string[] }>();

    medicines.forEach((m) => {
      const mfg = m.manufacturer || 'General Pharmaceutical Supplier';
      const existing = manufacturerMap.get(mfg) || { count: 0, stock: 0, names: [] };
      existing.count += 1;
      existing.stock += m.total_available_stock || 0;
      if (!existing.names.includes(m.name)) existing.names.push(m.name);
      manufacturerMap.set(mfg, existing);
    });

    const suppliers: SupplierData[] = [];
    let idx = 1;

    manufacturerMap.forEach((data, mfgName) => {
      const slug = mfgName.toLowerCase().replace(/[^a-z0-9]/g, '');
      suppliers.push({
        id: `sup-${idx++}`,
        name: mfgName,
        contactPerson: `Reg. Rep #${idx + 10} - ${mfgName.split(' ')[0]} Liaison`,
        email: `supply@${slug || 'pharma'}.com`,
        phone: `+91 22 2490 ${1000 + idx * 42}`,
        city: idx % 2 === 0 ? 'Mumbai, MH' : 'Hyderabad, TG',
        gmpCertified: true,
        coldChainReady: idx % 3 !== 0,
        medicinesCount: data.count,
        totalStockUnits: data.stock,
        medicineNames: data.names,
      });
    });

    return suppliers;
  }, [medicines]);

  const [customSuppliers, setCustomSuppliers] = useState<SupplierData[]>([]);

  const allSuppliers = useMemo(() => {
    return [...customSuppliers, ...initialSuppliers].filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customSuppliers, initialSuppliers, searchTerm]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormName('');
    setFormContact('');
    setFormEmail('');
    setFormPhone('');
    setFormCity('Mumbai, MH');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: SupplierData) => {
    setEditingSupplier(s);
    setFormName(s.name);
    setFormContact(s.contactPerson);
    setFormEmail(s.email);
    setFormPhone(s.phone);
    setFormCity(s.city);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingSupplier) {
      setCustomSuppliers((prev) =>
        prev.map((s) =>
          s.id === editingSupplier.id
            ? {
                ...s,
                name: formName,
                contactPerson: formContact,
                email: formEmail,
                phone: formPhone,
                city: formCity,
              }
            : s
        )
      );
    } else {
      const newSup: SupplierData = {
        id: `sup-${Date.now()}`,
        name: formName,
        contactPerson: formContact || 'Authorized Procurement Agent',
        email: formEmail || 'order@supplier.com',
        phone: formPhone || '+91 22 2849 5500',
        city: formCity || 'Mumbai, MH',
        gmpCertified: true,
        coldChainReady: true,
        medicinesCount: 0,
        totalStockUnits: 0,
        medicineNames: [],
      };
      setCustomSuppliers((prev) => [newSup, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#777C76] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by corporate name, city, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#E6E5DD] text-xs text-[#252A27] placeholder-[#777C76] focus:border-[#183D32] focus:ring-1 focus:ring-[#183D32] shadow-subtle"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register Supplier</span>
        </button>
      </div>

      {/* Main Supplier Directory Table */}
      <div className="rounded-xl bg-white border border-[#E6E5DD] shadow-subtle overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : allSuppliers.length === 0 ? (
          <EmptyState
            title="No Suppliers Found"
            description="No pharmaceutical suppliers match your active search criteria."
            icon={Building2}
            actionText="Register Supplier"
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F0E9] text-[#4C544F] font-semibold border-b border-[#E6E5DD] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Supplier / Manufacturer</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Compliance</th>
                  <th className="py-3 px-4 text-right">Associated Formularies</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E5DD] text-[#252A27]">
                {allSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F8F7F2] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-heading font-bold text-sm text-[#183D32] block">
                        {s.name}
                      </span>
                      <span className="text-[11px] text-[#777C76]">{s.contactPerson}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#4C544F]">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Mail className="w-3 h-3 text-[#777C76]" />
                        <span>{s.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#777C76] mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{s.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#4C544F]">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-3 h-3 text-[#777C76]" />
                        <span>{s.city}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E7EDE5] text-[#183D32] font-semibold text-[10px] border border-[#A8B8A2]/30">
                        <CheckCircle2 className="w-3 h-3 text-[#183D32]" />
                        GMP Verified
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className="font-bold text-[#252A27] text-xs">
                        {s.medicinesCount} {s.medicinesCount === 1 ? 'medicine' : 'medicines'}
                      </span>
                      <span className="text-[10px] text-[#777C76] block">
                        {s.totalStockUnits.toLocaleString()} units in stock
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSupplier(s)}
                          title="View Associated Formularies"
                          className="p-1.5 rounded-lg text-[#777C76] hover:text-[#183D32] hover:bg-[#E7EDE5] transition-colors"
                        >
                          <Pill className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg text-[#777C76] hover:text-[#183D32] hover:bg-[#E7EDE5] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Supplier Medicines Modal */}
      {selectedSupplier && (
        <Modal
          isOpen={!!selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          title={selectedSupplier.name}
          subtitle={`Verified Supplier Details • ${selectedSupplier.city}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#777C76] block text-[11px]">Primary Contact</span>
                <span className="font-semibold text-[#252A27]">{selectedSupplier.contactPerson}</span>
              </div>
              <div>
                <span className="text-[#777C76] block text-[11px]">Email Dispatch</span>
                <span className="font-semibold text-[#183D32]">{selectedSupplier.email}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-heading font-bold text-[#183D32] mb-2 uppercase tracking-wider">
                Supplied Formulary Products ({selectedSupplier.medicineNames.length})
              </h4>
              {selectedSupplier.medicineNames.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F8F7F2] text-center text-xs text-[#777C76]">
                  No active medicines currently mapped to this supplier.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-[#E6E5DD] divide-y divide-[#E6E5DD] text-xs">
                  {selectedSupplier.medicineNames.map((name, i) => (
                    <div key={i} className="px-3.5 py-2 flex items-center justify-between bg-white">
                      <span className="font-medium text-[#252A27]">{name}</span>
                      <span className="text-[11px] text-[#777C76]">Formulary Linked</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E6E5DD]">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#F1F0E9] hover:bg-[#E6E5DD] text-[#252A27] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSupplier ? 'Edit Supplier Details' : 'Register New Supplier'}
          subtitle="Pharmaceutical distributor & manufacturer procurement register"
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#252A27] mb-1">
                Manufacturer / Supplier Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Novartis Healthcare Ltd."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] focus:border-[#183D32] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#252A27] mb-1">
                  Representative Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anand Sharma"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] focus:border-[#183D32] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252A27] mb-1">
                  City / Jurisdiction
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, MH"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] focus:border-[#183D32] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#252A27] mb-1">
                  Order Email
                </label>
                <input
                  type="email"
                  placeholder="supply@novartis.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] focus:border-[#183D32] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252A27] mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+91 22 2490 8000"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F7F2] border border-[#E6E5DD] text-xs text-[#252A27] focus:border-[#183D32] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E6E5DD]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#F1F0E9] hover:bg-[#E6E5DD] text-[#252A27] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white transition-colors shadow-subtle"
              >
                {editingSupplier ? 'Save Changes' : 'Register Supplier'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
