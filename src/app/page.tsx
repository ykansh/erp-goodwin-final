'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import AddItemModal from '@/components/inventory/AddItemModal';
import ImportExportModal from '@/components/ImportExportModal';
import CreateUserModal from '@/components/CreateUserModal';
import {
  TrendingUp,
  Receipt,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Printer,
  Share2,
  FileCheck2,
  Package,
  Plus,
  Cloud,
  Layers,
  Trash2,
  Landmark,
  FileSpreadsheet,
  ScanBarcode,
  Store,
  ChevronRight,
  Shield,
  Lock,
  Download,
  Upload,
  FileText,
  UserPlus,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const {
    invoices,
    items,
    parties,
    payments,
    deleteInvoice,
    business,
    selectedCompany,
    isLoading,
    isAdmin,
    isEmployee,
    isTestMode,
    currentUser,
    employees,
    refreshSystemUsers,
  } = useApp();

  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [billingModalType, setBillingModalType] = useState<'TAX_INVOICE' | 'QUOTATION'>('TAX_INVOICE');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isCreateEmployeeModalOpen, setIsCreateEmployeeModalOpen] = useState(false);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('ALL');

  // Date range filter for Employee Sales Tracker
  const [employeeDatePreset, setEmployeeDatePreset] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM'>('ALL');
  const [employeeStartDate, setEmployeeStartDate] = useState('');
  const [employeeEndDate, setEmployeeEndDate] = useState('');

  const handleSelectDatePreset = (preset: 'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM') => {
    setEmployeeDatePreset(preset);
    const now = new Date();
    if (preset === 'ALL') {
      setEmployeeStartDate('');
      setEmployeeEndDate('');
    } else if (preset === 'THIS_MONTH') {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
      setEmployeeStartDate(`${y}-${m}-01`);
      setEmployeeEndDate(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
    } else if (preset === 'LAST_MONTH') {
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, prevDate.getMonth() + 1, 0).getDate();
      setEmployeeStartDate(`${y}-${m}-01`);
      setEmployeeEndDate(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
    }
  };

  const getInvoiceEmployeeName = (inv: { employeeName?: string; referenceName?: string }) =>
    (inv.employeeName || inv.referenceName || 'Ansh Chourasiya').trim();

  // RBAC: Admin sees everyone's figures (or selected filter); Employee sees ONLY their own figures
  const visibleInvoices = React.useMemo(() => {
    if (isEmployee) {
      const targetName = (
        selectedEmployeeFilter !== 'ALL' && isTestMode
          ? selectedEmployeeFilter
          : currentUser.name
      )
        .trim()
        .toLowerCase();
      return invoices.filter(
        (inv) => getInvoiceEmployeeName(inv).toLowerCase() === targetName
      );
    }
    if (selectedEmployeeFilter !== 'ALL') {
      return invoices.filter(
        (inv) =>
          getInvoiceEmployeeName(inv).toLowerCase() ===
          selectedEmployeeFilter.trim().toLowerCase()
      );
    }
    return invoices;
  }, [invoices, isEmployee, isTestMode, currentUser.name, selectedEmployeeFilter]);

  // Metrics (Confirmed invoices & Estimates)
  const confirmedInvoices = visibleInvoices.filter((inv) => inv.invoiceType !== 'QUOTATION');
  const quotationInvoices = visibleInvoices.filter((inv) => inv.invoiceType === 'QUOTATION');
  const totalSales = confirmedInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalGotMoney = confirmedInvoices.reduce((acc, inv) => acc + (Number(inv.paidAmount) || 0), 0);
  const totalMoneyToBeTakenFromBills = confirmedInvoices.reduce(
    (acc, inv) => acc + (Number(inv.balanceAmount) || 0),
    0
  );
  const totalEstimatesValue = quotationInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

  // Per-Employee Sales, Estimates, Got Money (Paid), Money To Be Taken (Due) - Date Filtered
  const employeeSalesRows = React.useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        role: string;
        designation: string;
        billsCount: number;
        estimatesCount: number;
        estimatesTotal: number;
        totalSales: number;
        gotMoney: number;
        moneyToBeTaken: number;
      }
    >();

    employees.forEach((emp) => {
      const key = emp.name.trim().toLowerCase();
      map.set(key, {
        name: emp.name.trim(),
        role: emp.role,
        designation: emp.designation || 'Sales & Billing Staff',
        billsCount: 0,
        estimatesCount: 0,
        estimatesTotal: 0,
        totalSales: 0,
        gotMoney: 0,
        moneyToBeTaken: 0,
      });
    });

    invoices.forEach((inv) => {
      // From Date - To Date filter
      if (employeeStartDate && inv.invoiceDate && inv.invoiceDate < employeeStartDate) return;
      if (employeeEndDate && inv.invoiceDate && inv.invoiceDate > employeeEndDate) return;

      const empName = getInvoiceEmployeeName(inv);
      const key = empName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          name: empName,
          role: 'EMPLOYEE',
          designation: 'Sales & Billing Staff',
          billsCount: 0,
          estimatesCount: 0,
          estimatesTotal: 0,
          totalSales: 0,
          gotMoney: 0,
          moneyToBeTaken: 0,
        });
      }
      const rec = map.get(key)!;
      if (inv.invoiceType === 'QUOTATION') {
        rec.estimatesCount += 1;
        rec.estimatesTotal += Number(inv.totalAmount) || 0;
      } else {
        rec.billsCount += 1;
        rec.totalSales += Number(inv.totalAmount) || 0;
        rec.gotMoney += Number(inv.paidAmount) || 0;
        rec.moneyToBeTaken += Number(inv.balanceAmount) || 0;
      }
    });

    const allRows = Array.from(map.values())
      .filter((r) => {
        const isRegistered = employees.some(
          (e) => e.name.trim().toLowerCase() === r.name.trim().toLowerCase()
        );
        return isRegistered || r.billsCount > 0 || r.estimatesCount > 0;
      })
      .sort((a, b) => b.totalSales - a.totalSales);
    if (isEmployee) {
      const targetName = (
        selectedEmployeeFilter !== 'ALL' && isTestMode
          ? selectedEmployeeFilter
          : currentUser.name
      )
        .trim()
        .toLowerCase();
      return allRows.filter((r) => r.name.toLowerCase() === targetName);
    }
    if (selectedEmployeeFilter !== 'ALL') {
      return allRows.filter(
        (r) => r.name.toLowerCase() === selectedEmployeeFilter.trim().toLowerCase()
      );
    }
    return allRows;
  }, [employees, invoices, isEmployee, isTestMode, currentUser.name, selectedEmployeeFilter, employeeStartDate, employeeEndDate]);

  const employeeFilterTotals = React.useMemo(() => {
    let sales = 0;
    let got = 0;
    let due = 0;
    let est = 0;
    let bills = 0;
    employeeSalesRows.forEach((r) => {
      sales += r.totalSales;
      got += r.gotMoney;
      due += r.moneyToBeTaken;
      est += r.estimatesTotal;
      bills += r.billsCount;
    });
    return { sales, got, due, est, bills };
  }, [employeeSalesRows]);

  const allConfirmedInvoices = invoices.filter((inv) => inv.invoiceType !== 'QUOTATION');
  const getPartyBalance = (party: { id: string; name: string }) => {
    let pIn = 0;
    let pOut = 0;
    allConfirmedInvoices.forEach((inv) => {
      if (inv.partyName && party.name && inv.partyName.trim().toLowerCase() === party.name.trim().toLowerCase()) {
        pIn += Number(inv.paidAmount) || 0;
        pOut += Number(inv.totalAmount) || 0;
      }
    });
    payments.forEach((pay) => {
      if (pay.referenceNumber && pay.referenceNumber.startsWith('INV-')) return;
      const idMatch = Boolean(pay.partyId && party.id && pay.partyId === party.id);
      const nameMatch = Boolean(
        pay.partyName && party.name && pay.partyName.trim().toLowerCase() === party.name.trim().toLowerCase()
      );
      if (!idMatch && !nameMatch) return;
      const isOut =
        pay.type === 'PAYMENT_OUT' ||
        (pay as any).direction === 'out' ||
        String((pay as any).type || '').toUpperCase() === 'PAYMENT_OUT';
      if (isOut) pOut += Number(pay.amount) || 0;
      else pIn += Number(pay.amount) || 0;
    });
    return pOut - pIn;
  };

  const partyBalances = parties.map((p) => ({ party: p, balance: getPartyBalance(p) }));
  const debitParties = partyBalances.filter((x) => x.balance > 0).map((x) => x.party);
  const creditParties = partyBalances.filter((x) => x.balance < 0).map((x) => x.party);
  const totalReceivables = partyBalances.filter((x) => x.balance > 0).reduce((acc, x) => acc + x.balance, 0);
  const totalPayables = Math.abs(partyBalances.filter((x) => x.balance < 0).reduce((acc, x) => acc + x.balance, 0));
  const lowStockItems = items.filter((item) => item.stock <= item.minStockAlert);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800">
      {/* Navigation Sidebar */}
      <Sidebar onOpenQuickBill={() => setIsBillingModalOpen(true)} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          onOpenQuickBill={() => setIsBillingModalOpen(true)}
          onOpenAddItem={() => setIsAddModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#3a4b8d] via-[#4c3cce] to-[#5b4be4] rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md relative overflow-hidden">
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Live Business Pulse
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono font-bold">
                  {selectedCompany.shortName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-semibold flex items-center gap-1">
                  <Cloud size={11} /> Supabase Live
                </span>
                {isEmployee && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-100 font-bold flex items-center gap-1">
                    <Shield size={11} /> Employee Role
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black tracking-tight">
                {selectedCompany.displayName} Dashboard
              </h1>
              <p className="text-xs text-indigo-100 max-w-xl">
                Real-time invoicing, stock synchronization, and ledger balances. Click any metric card below to navigate directly to that section.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2 shrink-0">
              {isAdmin && (
                <button
                  onClick={() => setIsImportExportModalOpen(true)}
                  className="px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
                >
                  <FileSpreadsheet size={16} />
                  <span>Import / Export CSV</span>
                </button>
              )}
              <button
                onClick={() => {
                  setBillingModalType('QUOTATION');
                  setIsBillingModalOpen(true);
                }}
                className="px-4 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-300/40 text-amber-200 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
              >
                <FileText size={16} className="text-amber-300" />
                <span>+ Quotation / Estimate</span>
              </button>
              <button
                onClick={() => {
                  setBillingModalType('TAX_INVOICE');
                  setIsBillingModalOpen(true);
                }}
                className="px-5 py-3 rounded-xl bg-[#db631a] hover:bg-[#c45312] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Receipt size={17} />
                <span>+ Create Sale Invoice</span>
              </button>
            </div>
          </div>

          {/* Quick Clickable Navigation Modules Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Direct Section Navigation
              </h2>
              <span className="text-[11px] text-slate-400">Click to jump into any module</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Sales Invoices Module */}
              <Link
                href="/sales"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#4c3cce] hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4c3cce] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Receipt size={17} />
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-[#4c3cce] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Sales Invoices</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{invoices.length} Bills Saved</p>
                </div>
              </Link>

              {/* Items & Stock Module */}
              <Link
                href="/inventory"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package size={17} />
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Items &amp; Stock</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{items.length} Products</p>
                </div>
              </Link>

              {/* Parties Khata Module */}
              <Link
                href="/parties"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users size={17} />
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Parties Khata</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{parties.length} Customers</p>
                </div>
              </Link>

              {/* Cash & Banking Module */}
              <Link
                href="/banking"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-cyan-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Landmark size={17} />
                  </div>
                  {isEmployee ? (
                    <Lock size={12} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Cash &amp; Banking</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isEmployee ? 'Admin Only' : 'Daybook & Liquidity'}
                  </p>
                </div>
              </Link>

              {/* Settings Module */}
              <Link
                href="/settings"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers size={17} />
                  </div>
                  {isEmployee ? (
                    <Lock size={12} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Settings</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isEmployee ? 'Admin Only' : 'Company Profile'}
                  </p>
                </div>
              </Link>

              {/* GST Reports Module (or Store) */}
              {selectedCompany.hasGstReports ? (
                <Link
                  href="/reports"
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-violet-500 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileSpreadsheet size={17} />
                    </div>
                    {isEmployee ? (
                      <Lock size={12} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">GST Reports</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isEmployee ? 'Admin Only' : 'GSTR-1 & Financials'}
                    </p>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => setIsImportExportModalOpen(true)}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group flex flex-col justify-between text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4c3cce] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileSpreadsheet size={17} />
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#4c3cce] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Import/Export</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">CSV File Exchange</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Clickable Metric Cards Grid (RBAC Aware: Admin sees All/Filtered, Employee sees Own Figures) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sales -> Redirects to /sales */}
            <Link
              href="/sales"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#4c3cce] hover:shadow-md transition-all group block cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 group-hover:text-[#4c3cce] transition-colors">
                  {isEmployee ? 'My Total Sales (Billed)' : 'Total Sales (Billed)'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4c3cce] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatINR(totalSales)}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1">
                <span>
                  {confirmedInvoices.length} confirmed bills • {quotationInvoices.length} estimates
                </span>
                <span className="text-[#4c3cce] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  View Sales <ArrowRight size={11} />
                </span>
              </div>
            </Link>

            {/* Got Money (Paid) -> Green */}
            <Link
              href="/sales"
              className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all group block cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-emerald-600 transition-colors">
                  {isEmployee ? 'My Got Money (Paid)' : 'Got Money (Paid)'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2">{formatINR(totalGotMoney)}</p>
              <div className="flex items-center justify-between text-[11px] text-emerald-600 font-medium mt-1">
                <span>
                  {totalSales > 0 ? `${Math.round((totalGotMoney / totalSales) * 100)}% collected` : 'Collected from bills'}
                </span>
                <span className="text-emerald-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Details <ArrowRight size={11} />
                </span>
              </div>
            </Link>

            {/* Money To Be Taken (Red) */}
            <Link
              href={isEmployee ? '/sales' : '/parties'}
              className="bg-white p-5 rounded-2xl border border-rose-200 shadow-2xs hover:border-rose-500 hover:shadow-md transition-all group block cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-rose-600 transition-colors">
                  {isEmployee ? 'My Money To Be Taken' : 'Money To Be Taken'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-rose-600 mt-2">
                {formatINR(isEmployee ? totalMoneyToBeTakenFromBills : totalReceivables)}
              </p>
              <div className="flex items-center justify-between text-[11px] text-rose-500 font-medium mt-1">
                <span>
                  {isEmployee
                    ? 'Pending from my bills (Red)'
                    : `From ${debitParties.length} parties (Red)`}
                </span>
                <span className="text-rose-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Khata <ArrowRight size={11} />
                </span>
              </div>
            </Link>

            {/* Sales Estimates (Quotations) or Low Stock Alert */}
            <Link
              href="/sales"
              className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs hover:border-amber-500 hover:shadow-md transition-all group block cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-amber-700 transition-colors">
                  {isEmployee ? 'My Sales Estimates' : 'Sales Estimates (Quotations)'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-700 mt-2">
                {formatINR(totalEstimatesValue)}
              </p>
              <div className="flex items-center justify-between text-[11px] text-amber-700 font-medium mt-1">
                <span>{quotationInvoices.length} active estimates</span>
                <span className="text-amber-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Estimates <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          </div>

          {/* EMPLOYEE SALES & ESTIMATES PERFORMANCE SECTION (RBAC Enforced) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    {isAdmin
                      ? 'Employee Sales, Estimates & Collection Tracker (All Staff)'
                      : `My Sales, Estimates & Collection Summary (${currentUser.name})`}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isAdmin
                        ? 'bg-indigo-100 text-[#4c3cce]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isAdmin ? '👑 Admin View: All Employees' : '👤 Employee View: Own Sales Only'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isAdmin
                    ? 'Admin can view and filter sales figures, estimates, Got Money (Paid), and Money To Be Taken across every employee.'
                    : 'As an Employee, you can view only your own sales figures, estimates, Got Money (Paid), and Money To Be Taken.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Employee Filter Dropdown (Admin or Test Mode) */}
                {(isAdmin || isTestMode) && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-600">
                      {isTestMode ? 'Simulate Employee:' : 'Employee:'}
                    </span>
                    <select
                      value={selectedEmployeeFilter}
                      onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    >
                      {!isTestMode && <option value="ALL">All Employees ({employees.length})</option>}
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name} ({emp.role === 'ADMIN' ? 'Admin' : 'Employee'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Date Range & Month Filter Bar for Employee Sales */}
            <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-600 flex items-center gap-1">
                  <Calendar size={13} className="text-[#4c3cce]" />
                  <span>Date Range:</span>
                </span>

                {/* Quick Presets */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleSelectDatePreset('ALL')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      employeeDatePreset === 'ALL'
                        ? 'bg-[#4c3cce] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDatePreset('THIS_MONTH')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      employeeDatePreset === 'THIS_MONTH'
                        ? 'bg-[#4c3cce] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDatePreset('LAST_MONTH')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      employeeDatePreset === 'LAST_MONTH'
                        ? 'bg-[#4c3cce] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Last Month
                  </button>
                </div>

                {/* Custom From Date - To Date Inputs */}
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">From</span>
                  <input
                    type="date"
                    value={employeeStartDate}
                    onChange={(e) => {
                      setEmployeeStartDate(e.target.value);
                      setEmployeeDatePreset('CUSTOM');
                    }}
                    className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">To</span>
                  <input
                    type="date"
                    value={employeeEndDate}
                    onChange={(e) => {
                      setEmployeeEndDate(e.target.value);
                      setEmployeeDatePreset('CUSTOM');
                    }}
                    className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                  {(employeeStartDate || employeeEndDate) && (
                    <button
                      type="button"
                      onClick={() => handleSelectDatePreset('ALL')}
                      title="Clear date filter"
                      className="text-slate-400 hover:text-rose-600 font-bold px-1 text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Filtered Period Figures Summary */}
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <span className="font-semibold text-slate-500">
                  Bills: <strong className="text-slate-900">{employeeFilterTotals.bills}</strong>
                </span>
                <span className="font-semibold text-slate-500">
                  Sales: <strong className="text-slate-900">{formatINR(employeeFilterTotals.sales)}</strong>
                </span>
                <span className="font-semibold text-emerald-600">
                  Got Money: <strong>{formatINR(employeeFilterTotals.got)}</strong>
                </span>
                <span className="font-semibold text-rose-600">
                  Due: <strong>{formatINR(employeeFilterTotals.due)}</strong>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold text-[11px] uppercase border-b border-slate-200">
                    <th className="py-3 px-4">Employee Name</th>
                    <th className="py-3 px-3 text-center">Bills &amp; Estimates</th>
                    <th className="py-3 px-3 text-right text-amber-700">Sales Estimates (₹)</th>
                    <th className="py-3 px-3 text-right">Total Sales Figure (₹)</th>
                    <th className="py-3 px-3 text-right text-emerald-700">Got Money / Paid (₹)</th>
                    <th className="py-3 px-3 text-right text-rose-700">Money To Be Taken (₹)</th>
                    <th className="py-3 px-4 text-center">Collection %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employeeSalesRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No employee sales records found for this view.
                      </td>
                    </tr>
                  ) : (
                    employeeSalesRows.map((emp) => {
                      const pct =
                        emp.totalSales > 0
                          ? Math.round((emp.gotMoney / emp.totalSales) * 100)
                          : 0;
                      return (
                        <tr key={emp.name} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#4c3cce] font-bold flex items-center justify-center text-xs">
                                {emp.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{emp.name}</p>
                                <span className="text-[10px] text-slate-400">
                                  {emp.role === 'ADMIN' ? '👑 Administrator' : '👤 Employee'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[11px]">
                              {emp.billsCount} Bills
                            </span>
                            {emp.estimatesCount > 0 && (
                              <span className="ml-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[11px]">
                                {emp.estimatesCount} Est.
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                            {formatINR(emp.estimatesTotal)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                            {formatINR(emp.totalSales)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                            {formatINR(emp.gotMoney)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                            {formatINR(emp.moneyToBeTaken)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                pct >= 80
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : pct >= 40
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dual Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Sales Invoices (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <Link
                  href="/sales"
                  className="group flex items-center gap-1.5 cursor-pointer"
                  title="Click to view all sales invoices"
                >
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm group-hover:text-[#4c3cce] flex items-center gap-1 transition-colors">
                      <span>Recent Invoices</span>
                      <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#4c3cce] transition-all" />
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Live from Supabase • Click row to view details
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href="/sales"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>View All Invoices</span>
                    <ArrowRight size={12} />
                  </Link>
                  <button
                    onClick={() => setIsBillingModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4c3cce] font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus size={14} />
                    <span>New Bill</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {visibleInvoices.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Receipt size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No invoices generated yet</p>
                    <p className="text-xs mt-1 text-slate-400">
                      Click &ldquo;+ Create Sale Invoice&rdquo; above to record your first transaction.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase border-b border-slate-200">
                        <th className="py-2.5 px-4">Invoice #</th>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Party Name</th>
                        <th className="py-2.5 px-4">Employee</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleInvoices.slice(0, 8).map((inv) => (
                        <tr
                          key={inv.id}
                          onClick={() => router.push('/sales')}
                          className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 group-hover:text-[#4c3cce]">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3 px-4 text-slate-500">{inv.invoiceDate}</td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {inv.partyName}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-[#4c3cce]">
                              {getInvoiceEmployeeName(inv)}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {formatINR(inv.totalAmount)}
                          </td>
                          <td className="py-3 px-4">
                            {inv.invoiceType === 'QUOTATION' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                                ESTIMATE
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  inv.paymentStatus === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : inv.paymentStatus === 'PARTIAL'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {inv.paymentStatus}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => window.print()}
                                title="Print Invoice"
                                className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              >
                                <Printer size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  const msg = `Hello ${inv.partyName}, your invoice ${inv.invoiceNumber} of ${formatINR(inv.totalAmount)} from ${selectedCompany.displayName} is ready.`;
                                  window.open(`https://wa.me/91${inv.partyPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                title="Share on WhatsApp"
                                className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <Share2 size={15} />
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Permanently delete invoice ${inv.invoiceNumber} from Supabase?`)) {
                                      deleteInvoice(inv.id);
                                    }
                                  }}
                                  title="Delete from Supabase (Admin Only)"
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Low Stock & WhatsApp Reminder Sidebar (1 col) */}
            <div className="space-y-6">
              {/* Low Stock Watch -> Clickable to /inventory */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4">
                <div className="flex justify-between items-center mb-3">
                  <Link
                    href="/inventory"
                    className="font-bold text-slate-800 text-xs flex items-center gap-1.5 hover:text-rose-600 transition-colors group cursor-pointer"
                  >
                    <Package size={15} className="text-rose-500" />
                    <span>Low Stock Alert</span>
                    <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-rose-600 transition-transform" />
                  </Link>
                  <Link
                    href="/inventory"
                    className="text-[11px] text-[#4c3cce] font-semibold hover:underline"
                  >
                    All {items.length} items &rarr;
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {lowStockItems.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                      {items.length === 0
                        ? 'No products added yet. Click "+ Add Item" above.'
                        : 'All items in stock are above safety threshold.'}
                    </div>
                  ) : (
                    lowStockItems.slice(0, 4).map((item) => (
                      <Link
                        key={item.id}
                        href="/inventory"
                        className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100/60 transition-colors flex justify-between items-center cursor-pointer block"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Min Alert: {item.minStockAlert} {item.unit}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-700 font-bold text-xs shrink-0">
                          {item.stock} Left
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Quick WhatsApp Khata Reminder Card -> Clickable to /parties */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <Link
                    href="/parties"
                    className="flex items-center gap-2 text-emerald-800 font-bold text-xs hover:text-emerald-900 transition-colors cursor-pointer group"
                  >
                    <FileCheck2 size={16} />
                    <span>WhatsApp Payment Recovery</span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="/parties" className="text-[10px] text-emerald-700 font-semibold hover:underline">
                    View Khata &rarr;
                  </Link>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                  Send 1-click ledger payment reminders with dynamic UPI QR links directly to customers.
                </p>
                <button
                  onClick={() => {
                    const firstDebtor = debitParties[0] || parties[0];
                    if (!firstDebtor) return;
                    const msg = `Respected ${firstDebtor.name}, your outstanding dues at ${selectedCompany.displayName} is ${formatINR(firstDebtor.currentBalance)}. Please clear via UPI: ${business.upiId}`;
                    window.open(`https://wa.me/91${firstDebtor.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  disabled={parties.length === 0}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Share2 size={14} />
                  <span>
                    {parties.length > 0
                      ? `Send Reminder to ${(debitParties[0] || parties[0])?.name?.slice(0, 16)}...`
                      : 'No parties available'}
                  </span>
                </button>
              </div>
              {/* RBAC Permissions Summary Card (What Employee Can & Cannot Access) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <Shield size={15} className="text-[#4c3cce]" />
                    <span>RBAC Access Control ({isAdmin ? 'Admin' : 'Employee'})</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isAdmin ? 'bg-indigo-100 text-[#4c3cce]' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isAdmin ? 'Full Access' : 'Restricted'}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <p className="font-bold text-emerald-700 uppercase text-[10px]">
                    ✓ What Employee Can Access:
                  </p>
                  <div className="space-y-1 text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      <span>Create Sale Invoices &amp; Quotations (Auto-saves Customer to Khata)</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      <span>View ONLY their own Sales Figures, Estimates, Paid &amp; Due</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      <span>View Item Stock, Selling Price &amp; MRP for billing</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      <span>Add Customers &amp; Record Payment In in Parties Khata</span>
                    </p>
                  </div>

                  <p className="font-bold text-rose-700 uppercase text-[10px] pt-1.5">
                    ✕ Restricted from Employee (Admin Only):
                  </p>
                  <div className="space-y-1 text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <XCircle size={12} className="text-rose-500 shrink-0" />
                      <span>Other Employees&apos; Sales Figures &amp; Total Company Revenue</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <XCircle size={12} className="text-rose-500 shrink-0" />
                      <span>Item Purchase Price (Cost), Profit Margins &amp; Cost Valuation</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <XCircle size={12} className="text-rose-500 shrink-0" />
                      <span>Deleting Invoices, Inventory Items, or Parties</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <XCircle size={12} className="text-rose-500 shrink-0" />
                      <span>Cash &amp; Banking Daybook, GST Reports &amp; Staff Settings</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 8-Second Fast GST Billing Modal */}
      <CreateInvoiceModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        initialType={billingModalType}
      />

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* CSV Import & Export Modal */}
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
      />

      {/* Create Employee / User Modal */}
      <CreateUserModal
        isOpen={isCreateEmployeeModalOpen}
        onClose={() => setIsCreateEmployeeModalOpen(false)}
        onUserCreated={refreshSystemUsers}
      />
    </div>
  );
}
