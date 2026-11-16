import React from 'react';
import {
  Pill,
  ShieldCheck,
  Boxes,
  Clock,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowLeftRight,
  TrendingDown,
  Layers,
  Send,
  AlertTriangle,
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onGetStartedClick: () => void;
  onExploreWorkspace: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onGetStartedClick,
  onExploreWorkspace,
}) => {
  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#252A27] font-sans antialiased selection:bg-[#183D32] selection:text-white flex flex-col">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#F8F7F2]/90 backdrop-blur-md border-b border-[#E6E5DD]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#183D32] text-white flex items-center justify-center shadow-subtle">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base tracking-tight text-[#183D32]">
                PHARMAFLOW
              </span>
              <span className="block text-[10px] text-[#777C76] font-medium tracking-wider uppercase">
                Healthcare Tech Operations
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#4C544F]">
            <a href="#features" className="hover:text-[#183D32] transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-[#183D32] transition-colors">
              Platform Preview
            </a>
            <a href="#how-it-works" className="hover:text-[#183D32] transition-colors">
              How It Works
            </a>
            <a href="#compliance" className="hover:text-[#183D32] transition-colors">
              Compliance & Safety
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#183D32] hover:bg-[#E7EDE5] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStartedClick}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-colors flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7EDE5] border border-[#A8B8A2]/30 text-[#183D32] text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#183D32]" />
            <span>Modern Pharmacy Inventory & FEFO Batch Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-[#183D32] leading-[1.15] mb-6">
            Smarter Pharmacy Management. <br />
            <span className="text-[#343B37]">Better Healthcare Operations.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#777C76] leading-relaxed mb-8 max-w-2xl mx-auto">
            Manage medicines, monitor inventory, track expiry dates and simplify pharmacy operations with one intelligent, auditable platform designed for medical dispensaries.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={onGetStartedClick}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-all flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreWorkspace}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#FFFFFF] hover:bg-[#F1F0E9] text-[#252A27] border border-[#E6E5DD] shadow-subtle transition-colors flex items-center gap-2"
            >
              <span>Launch Live Workspace</span>
            </button>
          </div>
        </div>

        {/* 3. Hero Visual — Real Dashboard Preview Component */}
        <div id="preview" className="rounded-2xl border border-[#E6E5DD] bg-white p-6 shadow-cardHover max-w-5xl mx-auto">
          {/* Top Mock Window Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E6E5DD] mb-6 text-xs text-[#777C76]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E6E5DD]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E6E5DD]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E6E5DD]" />
              <span className="ml-2 font-mono text-[11px] text-[#252A27]">pharmaflow.app/workspace/dispensary</span>
            </div>
            <div className="flex items-center gap-2 text-[#183D32] font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#2D7A58]" />
              <span>FEFO Protocol Active</span>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777C76] block mb-1">
                Monitored Stock
              </span>
              <span className="text-xl font-heading font-bold text-[#183D32] block">
                14,280 Units
              </span>
              <span className="text-[10px] text-[#777C76]">Across 30 active formularies</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777C76] block mb-1">
                Valuation Basis
              </span>
              <span className="text-xl font-heading font-bold text-[#252A27] block">
                $124,580.00
              </span>
              <span className="text-[10px] text-[#777C76]">Purchase acquisition cost</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777C76] block mb-1">
                Deficit Alerts
              </span>
              <span className="text-xl font-heading font-bold text-[#C27803] block">
                2 Items
              </span>
              <span className="text-[10px] text-[#C27803] font-medium">Reorder required</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777C76] block mb-1">
                Batch Integrity
              </span>
              <span className="text-xl font-heading font-bold text-[#2D7A58] block">
                100% Safe
              </span>
              <span className="text-[10px] text-[#777C76]">Expired lots automatically blocked</span>
            </div>
          </div>

          {/* Quick Table Mock */}
          <div className="rounded-xl border border-[#E6E5DD] overflow-hidden text-xs">
            <div className="bg-[#F1F0E9] px-4 py-2.5 font-semibold text-[#4C544F] flex justify-between">
              <span>Recent Formularies & Expiry Batches</span>
              <span className="text-[#183D32] font-mono">FEFO Sorting: Enabled</span>
            </div>
            <div className="divide-y divide-[#E6E5DD]">
              <div className="px-4 py-3 flex items-center justify-between hover:bg-[#F8F7F2] transition-colors">
                <div>
                  <span className="font-semibold text-[#183D32] block">Amoxicillin 500mg</span>
                  <span className="text-[11px] text-[#777C76]">MED-001 • GlaxoSmithKline • Lot: BTH-AMX-01</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#252A27] block">450 Tablets</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#E7EDE5] text-[#183D32] font-semibold">
                    Expires in 280d
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 flex items-center justify-between hover:bg-[#F8F7F2] transition-colors">
                <div>
                  <span className="font-semibold text-[#183D32] block">Metformin 500mg</span>
                  <span className="text-[11px] text-[#777C76]">MED-004 • Merck Santé • Lot: BTH-MET-02</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#252A27] block">320 Strips</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] font-semibold">
                    Expires in 28d (FEFO Priority)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Grid */}
      <section id="features" className="py-20 bg-[#F1F0E9] border-y border-[#E6E5DD] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#183D32] uppercase tracking-wider block mb-2">
              End-to-End Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#183D32] tracking-tight">
              Designed For High-Compliance Pharmacy Operations
            </h2>
            <p className="text-xs sm:text-sm text-[#777C76] mt-3">
              Built specifically to eliminate dispensing errors, prevent expired inventory losses, and ensure strict regulatory audit compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle hover:shadow-cardHover transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#E7EDE5] text-[#183D32] flex items-center justify-center mb-4">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="text-base font-heading font-bold text-[#183D32] mb-2">
                Medicine Management
              </h3>
              <p className="text-xs text-[#777C76] leading-relaxed">
                Centralized formulary master catalogue. Track generic chemical compounds, commercial brand names, therapeutic categories, and custom reorder alert levels.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle hover:shadow-cardHover transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#E7EDE5] text-[#183D32] flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-heading font-bold text-[#183D32] mb-2">
                Inventory Tracking
              </h3>
              <p className="text-xs text-[#777C76] leading-relaxed">
                Real-time stock aggregation across all production lots. Monitor available stock versus minimum safety thresholds with automatic deficit indicators.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle hover:shadow-cardHover transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#E7EDE5] text-[#183D32] flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-heading font-bold text-[#183D32] mb-2">
                Batch & Expiry Monitoring
              </h3>
              <p className="text-xs text-[#777C76] leading-relaxed">
                Granular lot tracking with First-Expired, First-Out (FEFO) dispensing rules. Automated quarantine guarantees expired medicines cannot be dispensed or returned.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle hover:shadow-cardHover transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#E7EDE5] text-[#183D32] flex items-center justify-center mb-4">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <h3 className="text-base font-heading font-bold text-[#183D32] mb-2">
                Stock Movements Ledger
              </h3>
              <p className="text-xs text-[#777C76] leading-relaxed">
                Execute inward purchases, customer dispensing, patient returns, and audited adjustments with atomic database locking and immutable transaction histories.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle hover:shadow-cardHover transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#E7EDE5] text-[#183D32] flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-heading font-bold text-[#183D32] mb-2">
                Supplier & Manufacturer Management
              </h3>
              <p className="text-xs text-[#777C76] leading-relaxed">
                Direct procurement traceability. Connect pharmaceutical suppliers, distributors, and manufacturers directly to inward batches and restock orders.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle hover:shadow-cardHover transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#E7EDE5] text-[#183D32] flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-heading font-bold text-[#183D32] mb-2">
                Reports & Clinical Analytics
              </h3>
              <p className="text-xs text-[#777C76] leading-relaxed">
                Instant stock valuation analysis, shelf-life risk stratification, and transaction ledgers. Export legally compliant audit spreadsheets with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#183D32] uppercase tracking-wider block mb-2">
            Seamless Implementation
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#183D32] tracking-tight">
            How PharmaFlow Operates
          </h2>
          <p className="text-xs sm:text-sm text-[#777C76] mt-3">
            A reliable 3-step operational workflow engineered for dispensary efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="p-6 rounded-xl bg-white border border-[#E6E5DD] relative">
            <span className="w-8 h-8 rounded-full bg-[#183D32] text-white flex items-center justify-center font-heading font-bold text-xs mb-4">
              1
            </span>
            <h3 className="text-base font-heading font-bold text-[#183D32] mb-2">
              Set Up Your Pharmacy
            </h3>
            <p className="text-xs text-[#777C76] leading-relaxed">
              Register active formulary items, define minimum safety reorder thresholds, and link manufacturer suppliers with custom SKU codes.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-xl bg-white border border-[#E6E5DD] relative">
            <span className="w-8 h-8 rounded-full bg-[#183D32] text-white flex items-center justify-center font-heading font-bold text-xs mb-4">
              2
            </span>
            <h3 className="text-base font-heading font-bold text-[#183D32] mb-2">
              Manage Medicines & Batches
            </h3>
            <p className="text-xs text-[#777C76] leading-relaxed">
              Log inward shipments into distinct production lots with manufacturing dates, cost prices, selling margins, and strict expiry dates.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-xl bg-white border border-[#E6E5DD] relative">
            <span className="w-8 h-8 rounded-full bg-[#183D32] text-white flex items-center justify-center font-heading font-bold text-xs mb-4">
              3
            </span>
            <h3 className="text-base font-heading font-bold text-[#183D32] mb-2">
              Dispense & Gain Insights
            </h3>
            <p className="text-xs text-[#777C76] leading-relaxed">
              Dispense safely under automated FEFO rules, receive low-stock alerts before stockouts occur, and export clinical audit reports instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Regulatory & Compliance Banner */}
      <section id="compliance" className="py-12 bg-[#183D32] text-white px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-heading font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#A8B8A2]" />
              Hospital-Grade Audit & Concurrency Safety
            </h3>
            <p className="text-xs text-[#A8B8A2] max-w-xl">
              Equipped with database row-level locking, atomic stock decrement validations, and immutable transaction histories compliant with pharmaceutical record-keeping standards.
            </p>
          </div>
          <button
            onClick={onExploreWorkspace}
            className="px-5 py-2.5 rounded-xl bg-[#E7EDE5] hover:bg-white text-[#183D32] font-semibold text-xs transition-colors shrink-0"
          >
            Open Operational Console
          </button>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#183D32] mb-4">
          Take control of your pharmacy inventory.
        </h2>
        <p className="text-xs sm:text-sm text-[#777C76] max-w-lg mx-auto mb-8">
          Eliminate manual tracking errors, prevent expired product losses, and streamline your medical dispensary today.
        </p>
        <button
          onClick={onGetStartedClick}
          className="px-8 py-3.5 rounded-xl text-sm font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-cardHover transition-all inline-flex items-center gap-2"
        >
          <span>Get Started Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 8. Footer */}
      <footer className="mt-auto border-t border-[#E6E5DD] bg-[#F1F0E9] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#777C76]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#183D32] text-white flex items-center justify-center">
              <Pill className="w-4 h-4 -rotate-45" />
            </div>
            <div>
              <span className="font-heading font-bold text-[#183D32]">PHARMAFLOW</span>
              <p className="text-[11px] text-[#777C76]">Enterprise Pharmacy Inventory Management Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button onClick={onLoginClick} className="hover:text-[#183D32] transition-colors">
              Pharmacist Portal
            </button>
            <button onClick={onExploreWorkspace} className="hover:text-[#183D32] transition-colors">
              Dispensary Workspace
            </button>
            <span className="text-[#A8B8A2]">•</span>
            <span>License #PH-2026-MUM</span>
          </div>

          <p className="text-[11px]">
            &copy; {new Date().getFullYear()} PHARMAFLOW Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
