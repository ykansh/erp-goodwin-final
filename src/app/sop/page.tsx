'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import { useApp } from '@/context/AppContext';
import {
  BookOpen,
  Download,
  Printer,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Building2,
  FileText,
  Receipt,
  Users,
  Package,
  TrendingUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  CreditCard,
  QrCode,
  AlertCircle,
  Info,
} from 'lucide-react';

export default function EmployeeSopPage() {
  const { selectedCompany } = useApp();
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('all');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800">
      {/* Sidebar (hidden during printing) */}
      <div className="print:hidden">
        <Sidebar onOpenQuickBill={() => setIsBillingModalOpen(true)} />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header (hidden during printing) */}
        <div className="print:hidden">
          <Header onOpenQuickBill={() => setIsBillingModalOpen(true)} />
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Top Navigation & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  title="Back to Dashboard"
                >
                  <ArrowLeft size={18} />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-[#4c3cce] border border-indigo-100">
                      Standard Operating Procedure
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Version 2.1 • Internal Staff Guide
                    </span>
                  </div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                    Goodwin Batteries Employee SOP Manual
                  </h1>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-2xs"
                >
                  <Printer size={15} className="text-slate-500" />
                  <span>Print SOP</span>
                </button>
                <a
                  href="/Goodwin_Batteries_Employee_SOP.pdf"
                  download="Goodwin_Batteries_Employee_SOP.pdf"
                  className="h-10 px-4 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <Download size={15} />
                  <span>Download Official PDF</span>
                </a>
              </div>
            </div>

            {/* PRINTABLE DOCUMENT WRAPPER */}
            <div id="sop-printable-document" className="space-y-6">
              {/* Document Header Banner */}
              <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1e293b] to-[#0f172a] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#db631a] text-white uppercase tracking-wider">
                        Operational Manual
                      </span>
                      <span className="text-xs text-indigo-200">
                        Doc ID: GB-SOP-2026-V2.1
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      GOODWIN BATTERIES
                    </h2>
                    <p className="text-base font-semibold text-indigo-100">
                      Standard Operating Procedure &amp; ERP Billing System Guide for Employees
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      This operational guide establishes the mandatory rules and step-by-step
                      procedures for billing, quotation conversions, party ledgers, stock audits,
                      and personal sales collection tracking for all store and field personnel.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shrink-0 text-right space-y-1">
                    <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                      Effective Date
                    </p>
                    <p className="text-sm font-bold text-white">November 2026</p>
                    <p className="text-[10px] text-amber-300 pt-1 font-medium">
                      Mandatory Staff Compliance
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 1: SYSTEM ACCESS & RBAC */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4c3cce] flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      System Access &amp; Role-Based Access Control (RBAC)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Understanding login procedures and authorized permission boundaries.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-green-600" />
                      <span>Employee Staff Role Permissions</span>
                    </h3>
                    <ul className="text-xs text-slate-600 space-y-1.5 pl-5 list-disc">
                      <li>
                        <strong>Billing &amp; Invoices:</strong> Full access to create GST &amp;
                        non-GST bills, quotations, and download A4 invoices.
                      </li>
                      <li>
                        <strong>Product &amp; Stock Search:</strong> Search items by name, SKU, or
                        HSN and view live inventory stock counts.
                      </li>
                      <li>
                        <strong>Parties Khata:</strong> Create new parties, view customer ledgers,
                        and record <em>Payment In</em> collections.
                      </li>
                      <li>
                        <strong>Personal Sales Tracker:</strong> View your own total sales figure,
                        cash/UPI collected, and pending dues.
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2">
                    <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldAlert size={16} className="text-amber-600" />
                      <span>Restricted Modules (Admin Only)</span>
                    </h3>
                    <ul className="text-xs text-amber-800 space-y-1.5 pl-5 list-disc">
                      <li>
                        <strong>Cash &amp; Bank Ledgers:</strong> Hidden for employee users to
                        protect bank balances and company bank statements.
                      </li>
                      <li>
                        <strong>GST Reports (GSTR-1 &amp; GSTR-3B):</strong> Handled exclusively by
                        chartered accountants and store administrators.
                      </li>
                      <li>
                        <strong>System Settings &amp; Staff Roles:</strong> Only administrators can
                        create, modify, or assign RBAC login accounts.
                      </li>
                      <li>
                        <strong>All-Employee Performance:</strong> Employees see only their own
                        metrics; aggregate figures are admin-only.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DUAL ENTITIES */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4c3cce] flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Dual Company Entities: With GST vs Without GST
                    </h2>
                    <p className="text-xs text-slate-500">
                      How to choose the correct entity before generating customer bills.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Entity 1 */}
                  <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                        Company 1 (GST Registered)
                      </span>
                      <span className="text-xs font-bold text-indigo-700">GW-INV-...</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Goodwin Batteries (With GST)
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Used for all registered B2B dealers, commercial clients, solar installations,
                      and any customer requiring official GST Input Tax Credit (ITC).
                    </p>
                    <div className="text-xs text-slate-700 space-y-1 pt-1 bg-white p-3 rounded-xl border border-indigo-100 font-mono">
                      <p>• Mandatory: HSN Codes &amp; GST Rates (18% / 28%)</p>
                      <p>• Tax Breakup: CGST + SGST (or IGST for interstate)</p>
                      <p>• Transport Details: Vehicle No &amp; Transporter GSTIN</p>
                    </div>
                  </div>

                  {/* Entity 2 */}
                  <div className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#db631a] text-white">
                        Company 2 (Non-GST / Retail)
                      </span>
                      <span className="text-xs font-bold text-amber-800">GB2-INV-...</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Goodwin Batteries 2 (Without GST)
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Used for walk-in retail consumers, individual vehicle battery replacements,
                      preliminary estimates, and simplified cash sales.
                    </p>
                    <div className="text-xs text-slate-700 space-y-1 pt-1 bg-white p-3 rounded-xl border border-amber-100 font-mono">
                      <p>• Zero Tax Breakup: Net clean pricing</p>
                      <p>• Simplified Fields: Fast counter billing</p>
                      <p>• Bill of Supply: Ideal for local consumer billing</p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                  <Info size={16} className="text-[#4c3cce] shrink-0" />
                  <span>
                    <strong>How to switch companies:</strong> Click the company name dropdown in
                    the top header or sidebar. Always verify the active entity badge before
                    clicking "+ Create Bill".
                  </span>
                </div>
              </div>

              {/* SECTION 3: STEP-BY-STEP INVOICING WORKFLOW */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4c3cce] flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Step-by-Step Billing &amp; Invoicing Workflow
                    </h2>
                    <p className="text-xs text-slate-500">
                      Follow these 6 steps for every customer transaction.
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-[#4c3cce] font-bold text-xs flex items-center justify-center shrink-0">
                      01
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">
                        Open the Invoicing Modal
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Click the orange <strong>&quot;+ Create GST Bill&quot;</strong> or{' '}
                        <strong>&quot;+ Create Bill&quot;</strong> button from the sidebar or header.
                        Confirm whether you are in Goodwin Batteries (GST) or Goodwin Batteries 2
                        (Without GST).
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl border-2 border-orange-200 bg-orange-50/20 flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      02
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          Select Employee / Sales Rep Attribution
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-rose-100 text-rose-700">
                          MANDATORY
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        In the bill header, locate the <strong>&quot;Employee / Sales Rep&quot;</strong>{' '}
                        dropdown. <strong>ALWAYS select your own name</strong> (e.g., Rahul Sharma).
                        If you leave it unassigned or select another employee, you will not receive
                        credit for the sale or the collected cash in your performance tracker.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-[#4c3cce] font-bold text-xs flex items-center justify-center shrink-0">
                      03
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">
                        Customer Search &amp; Automatic Khata Creation
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Type customer name or mobile number in the party field. If existing, select
                        them to auto-fill details. If it is a new customer, simply type the new
                        name and phone number. <em>The system will automatically create their Khata
                        account in Parties when you save the bill.</em>
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-[#4c3cce] font-bold text-xs flex items-center justify-center shrink-0">
                      04
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">
                        Select Products via Searchable Dropdown
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Type to search by Product Name, SKU, HSN, or Battery Capacity (e.g.{' '}
                        <em>&quot;Exide 150Ah&quot;</em>). Check the live stock badge (e.g.{' '}
                        <em>&quot;14 in stock&quot;</em>). Never bill zero-stock items without physical
                        verification. Enter quantity and selling rate.
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-[#4c3cce] font-bold text-xs flex items-center justify-center shrink-0">
                      05
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">
                        Set Payment Status &amp; Partial Amounts
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Choose <strong>Paid</strong> (full settlement), <strong>Partial</strong> (if
                        customer pays an advance, enter the exact amount collected), or{' '}
                        <strong>Unpaid</strong> (credit sale). Any remaining due is instantly posted
                        to the customer&apos;s Khata in RED (&quot;Money To Be Taken&quot;).
                      </p>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-[#4c3cce] font-bold text-xs flex items-center justify-center shrink-0">
                      06
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">
                        Save, Print &amp; Send on WhatsApp
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Click <strong>&quot;Generate Invoice&quot;</strong>. Print an A4 copy for the
                        customer or click &quot;Share on WhatsApp&quot; to send an immediate digital PDF
                        receipt directly to their mobile number.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Example Callout */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <AlertCircle size={16} className="text-amber-600" />
                    <span>Real-World Example: Partial Payment Accounting</span>
                  </div>
                  <p className="leading-relaxed">
                    Customer purchases a commercial inverter battery for <strong>₹21,880</strong>.
                    Customer pays <strong>₹2,000 cash</strong> on the spot and promises to pay the
                    rest next week.
                    <br />
                    • When billing, select Status = <strong>Partial</strong> and Paid Amount ={' '}
                    <strong>₹2,000</strong>.
                    <br />
                    • <strong>Your Dashboard Tracker:</strong> Total Sales = ₹21,880 | Got Money =
                    ₹2,000 | Money To Be Taken = ₹19,880.
                    <br />• <strong>Customer Khata Ledger:</strong> Automatically shows ₹19,880 in{' '}
                    <span className="text-red-700 font-bold">RED (&quot;Money To Be Taken&quot;)</span>.
                  </p>
                </div>
              </div>

              {/* SECTION 4: QUOTATION LIFECYCLE */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4c3cce] flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Quotation to Tax Invoice Conversion
                    </h2>
                    <p className="text-xs text-slate-500">
                      Converting approved deals without re-entering items or customer data.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    When prospective clients or institutional buyers request a formal price estimate,
                    generate a <strong>Quotation</strong>. A quotation does not deduct inventory and
                    does not generate tax liabilities.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 font-medium text-slate-800">
                    <p className="text-[#4c3cce] font-bold">
                      Once the quotation is finalized and payment is received:
                    </p>
                    <p>1. Open <strong>Sales Invoices</strong> and find the customer Quotation.</p>
                    <p>2. Click the <strong>&quot;Convert to Tax Invoice&quot;</strong> button.</p>
                    <p>
                      3. The system automatically creates the official Tax Invoice (GW-INV-...),
                      updates inventory, registers the received payment, and links the customer Khata
                      without needing you to re-type anything!
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 5: PARTIES KHATA & LEDGER */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4c3cce] flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Parties (Khata) &amp; Customer Ledger Management
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rules for managing receivables, recording payments, and downloading statements.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/40 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-600 text-white">
                      RED Balance
                    </span>
                    <h3 className="text-sm font-bold text-rose-950">
                      Money To Be Taken (Receivable Due)
                    </h3>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      Means the customer owes money to Goodwin Batteries for goods delivered on
                      credit or partial billing.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white">
                      GREEN Balance
                    </span>
                    <h3 className="text-sm font-bold text-emerald-950">
                      Money To Be Given (Payable / Advance)
                    </h3>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Means the customer paid advance cash or Goodwin Batteries owes a refund or
                      warranty credit to the party.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    How to Record Late Payments (&quot;Payment In&quot;):
                  </h3>
                  <ol className="text-xs text-slate-600 space-y-1.5 pl-5 list-decimal">
                    <li>Go to <strong>Parties (Khata)</strong> and search the customer.</li>
                    <li>Click on the customer row to open their complete transaction ledger.</li>
                    <li>Click the green <strong>&quot;+ Payment In&quot;</strong> button.</li>
                    <li>
                      Enter the collected amount, payment mode (Cash, UPI, Cheque), date, and
                      optional note/reference.
                    </li>
                    <li>
                      Click <strong>Save Payment</strong>. The customer&apos;s RED due balance will
                      immediately decrease in real time.
                    </li>
                    <li>
                      <strong>CRITICAL:</strong> Never create a zero-item invoice or dummy bill to
                      record money received. Always use &quot;Payment In&quot;.
                    </li>
                  </ol>
                </div>
              </div>

              {/* SECTION 6: EMPLOYEE PERFORMANCE DASHBOARD */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4c3cce] flex items-center justify-center font-bold">
                    6
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Employee Sales Tracking &amp; Dashboard Performance
                    </h2>
                    <p className="text-xs text-slate-500">
                      How to filter dates and analyze your personal performance metrics.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800">
                    Date Filtering (Month-wise &amp; Custom Dates):
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Use the filter bar on the Dashboard or Sales page. Choose quick presets:{' '}
                    <strong>&quot;All Time&quot;</strong>, <strong>&quot;This Month&quot;</strong>,{' '}
                    <strong>&quot;Last Month&quot;</strong>, or pick a custom{' '}
                    <strong>From Date – To Date</strong> range to evaluate sales for any target
                    period.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Total Sales</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">Total Sales Figure</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Gross billing value under your name
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] uppercase font-bold text-emerald-600">Collected</p>
                      <p className="text-sm font-black text-emerald-700 mt-0.5">
                        Got Money / Paid
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Hard cash/UPI received &amp; deposited
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] uppercase font-bold text-rose-600">Pending</p>
                      <p className="text-sm font-black text-rose-700 mt-0.5">Money To Be Taken</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Uncollected customer credit dues
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] uppercase font-bold text-indigo-600">Efficiency</p>
                      <p className="text-sm font-black text-[#4c3cce] mt-0.5">Collection %</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Target benchmark: &ge; 85%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 7: INVENTORY & STOCK */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4c3cce] flex items-center justify-center font-bold">
                    7
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Inventory Management &amp; Battery Stock Rules
                    </h2>
                    <p className="text-xs text-slate-500">
                      Preventing overselling and managing scrap buybacks.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <p>
                    • <strong>Real-time Stock Deductions:</strong> As soon as an invoice is created,
                    stock is automatically deducted. Quotations do not decrement stock.
                  </p>
                  <p>
                    • <strong>Low Stock Thresholds:</strong> Items with stock fewer than 5 units show
                    an amber/red warning pill. Alert your store manager when key fast-moving items
                    (e.g., 150Ah Inverter Batteries) are running low.
                  </p>
                  <p>
                    • <strong>Old Battery Scrap / Buyback:</strong> When a customer returns an old
                    lead-acid battery for scrap discount, weigh/verify the battery, enter the scrap
                    allowance in the bill remarks, and apply the agreed exchange discount on the bill.
                  </p>
                </div>
              </div>

              {/* SECTION 8: DO'S AND DON'TS TABLE */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4c3cce] flex items-center justify-center font-bold">
                    8
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Staff Code of Conduct: Do&apos;s and Don&apos;ts
                    </h2>
                    <p className="text-xs text-slate-500">
                      Essential daily operational rules for Goodwin Batteries personnel.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* DO's */}
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                    <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      <span>DO&apos;S (Best Practices)</span>
                    </h3>
                    <ul className="text-xs text-slate-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span>ALWAYS select your own name in the Employee dropdown on bills.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span>Search customer phone number first to prevent duplicate accounts.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span>Enter exact partial payment received at the counter immediately.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span>Verify physical battery serial numbers against invoice descriptions.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span>Use &quot;Payment In&quot; whenever customer clears pending credit dues.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span>Review your personal dashboard daily before closing the store counter.</span>
                      </li>
                    </ul>
                  </div>

                  {/* DON'TS */}
                  <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-3">
                    <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                      <XCircle size={18} className="text-rose-600" />
                      <span>DON&apos;TS (Strictly Prohibited)</span>
                    </h3>
                    <ul className="text-xs text-slate-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold shrink-0">✗</span>
                        <span>NEVER bill under another employee&apos;s name or leave it unassigned.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold shrink-0">✗</span>
                        <span>NEVER bill items showing zero available inventory without admin sign-off.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold shrink-0">✗</span>
                        <span>NEVER create a dummy invoice just to record a payment collection.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold shrink-0">✗</span>
                        <span>NEVER re-type an approved Quotation (use &quot;Convert to Tax Invoice&quot;).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold shrink-0">✗</span>
                        <span>NEVER share your personal password or staff login credentials with anyone.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold shrink-0">✗</span>
                        <span>NEVER delete or alter invoices without prior management authorization.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Document Sign-off / Helpdesk */}
              <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div>
                  <p className="font-bold text-slate-800">
                    Goodwin Batteries • Operations &amp; Technology Administration
                  </p>
                  <p className="text-[11px] text-slate-500">
                    For technical support, password resets, or billing queries, contact the Store
                    Administrator.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="/Goodwin_Batteries_Employee_SOP.pdf"
                    download="Goodwin_Batteries_Employee_SOP.pdf"
                    className="px-3 py-1.5 rounded-lg bg-[#4c3cce] text-white font-bold text-xs hover:bg-[#3d2eb5] flex items-center gap-1.5 transition-colors"
                  >
                    <Download size={13} />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Quick Bill Modal */}
      <CreateInvoiceModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
      />
    </div>
  );
}
