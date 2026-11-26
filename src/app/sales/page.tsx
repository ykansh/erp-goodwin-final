'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import InvoiceDetailModal from '@/components/sales/InvoiceDetailModal';
import CreateUserModal from '@/components/CreateUserModal';
import { useApp } from '@/context/AppContext';
import { MockInvoice } from '@/lib/mockData';
import { formatINR } from '@/lib/utils';
import { exportInvoicesToCSV } from '@/lib/csvUtils';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Printer,
  Share2,
  Eye,
  FileCheck2,
  Calendar,
  CheckCircle,
  TrendingUp,
  Trash2,
  Download,
  Sparkles,
  FileText,
  Edit,
  UserPlus,
  Shield,
  Repeat,
} from 'lucide-react';

export default function SalesPage() {
  const {
    invoices,
    addInvoice,
    deleteInvoice,
    convertQuotationToInvoice,
    business,
    selectedCompany,
    isAdmin,
    isEmployee,
    isTestMode,
    currentUser,
    employees,
    refreshSystemUsers,
  } = useApp();

  const isGB2 = selectedCompany?.code === 'goodwin-2';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');

  // Date range filter
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [datePreset, setDatePreset] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM'>('ALL');

  const handleSelectDatePreset = (preset: 'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM') => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'ALL') {
      setFromDate('');
      setToDate('');
    } else if (preset === 'THIS_MONTH') {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
      setFromDate(`${y}-${m}-01`);
      setToDate(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
    } else if (preset === 'LAST_MONTH') {
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, prevDate.getMonth() + 1, 0).getDate();
      setFromDate(`${y}-${m}-01`);
      setToDate(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
    }
  };

  // Modals
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [billingModalType, setBillingModalType] = useState<'TAX_INVOICE' | 'QUOTATION'>('TAX_INVOICE');
  const [viewingInvoice, setViewingInvoice] = useState<MockInvoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<MockInvoice | null>(null);
  const [repeatInvoice, setRepeatInvoice] = useState<MockInvoice | null>(null);
  const [isCreateEmployeeModalOpen, setIsCreateEmployeeModalOpen] = useState(false);

  const handleRepeatInvoice = (inv: MockInvoice) => {
    setViewingInvoice(null);
    setEditingInvoice(null);
    setRepeatInvoice(inv);
    setIsBillingModalOpen(true);
  };

  const getInvoiceEmployeeName = (inv: MockInvoice) =>
    (inv.employeeName || inv.referenceName || 'Ansh Chourasiya').trim();

  // RBAC & Date Filter: Admin sees all (or selected employee); Employee sees ONLY their own invoices; filtered by From-To date
  const roleScopedInvoices = invoices.filter((inv) => {
    if (isEmployee) {
      const targetName = (
        selectedEmployee !== 'ALL' && isTestMode ? selectedEmployee : currentUser.name
      )
        .trim()
        .toLowerCase();
      if (getInvoiceEmployeeName(inv).toLowerCase() !== targetName) return false;
    } else if (selectedEmployee !== 'ALL') {
      if (getInvoiceEmployeeName(inv).toLowerCase() !== selectedEmployee.trim().toLowerCase()) {
        return false;
      }
    }

    // From Date - To Date check
    if (fromDate && inv.invoiceDate && inv.invoiceDate < fromDate) return false;
    if (toDate && inv.invoiceDate && inv.invoiceDate > toDate) return false;

    return true;
  });

  // Financial Metrics (Only confirmed invoices, excluding Quotations / Estimates)
  const confirmedInvoices = roleScopedInvoices.filter((inv) => inv.invoiceType !== 'QUOTATION');
  const quotationInvoices = roleScopedInvoices.filter((inv) => inv.invoiceType === 'QUOTATION');
  const totalSales = confirmedInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = confirmedInvoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalDue = confirmedInvoices.reduce((acc, inv) => acc + inv.balanceAmount, 0);
  const totalGstTax = confirmedInvoices.reduce((acc, inv) => acc + (Number(inv.taxTotal) || 0), 0);
  const totalEstimates = quotationInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

  // Filter Invoices
  const filteredInvoices = roleScopedInvoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const empName = getInvoiceEmployeeName(inv).toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.partyName.toLowerCase().includes(q) ||
      inv.partyPhone.includes(searchQuery) ||
      inv.invoiceDate.toLowerCase().includes(q) ||
      empName.includes(q);

    const matchesType = selectedType === 'ALL' || inv.invoiceType === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || inv.paymentStatus === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleShareWhatsApp = (inv: MockInvoice) => {
    const text = `Hello ${inv.partyName}, your invoice ${inv.invoiceNumber} for ${formatINR(
      inv.totalAmount
    )} from ${business.businessName} is ready. Pay via UPI: ${business.upiId}.`;
    window.open(`https://wa.me/91${inv.partyPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800">
      {/* Sidebar */}
      <Sidebar onOpenQuickBill={() => {
        setEditingInvoice(null);
        setIsBillingModalOpen(true);
      }} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          onOpenQuickBill={() => {
            setEditingInvoice(null);
            setIsBillingModalOpen(true);
          }}
          onOpenAddItem={() => {}}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEmployee ? `My Sales Invoices & Estimates (${currentUser.name})` : 'Sales Invoices & Estimates'}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-[#4c3cce]">
                  {roleScopedInvoices.length} Bills
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isAdmin ? 'bg-indigo-100 text-[#4c3cce]' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isAdmin ? '👑 Admin: All Staff' : '👤 Employee: Own Bills Only'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEmployee
                  ? 'Viewing your own sales invoices, estimates, Got Money (Paid), and Money To Be Taken'
                  : 'Manage GST tax invoices, quotations, employee sales & track customer payment status'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {isAdmin && (
                <button
                  onClick={() => exportInvoicesToCSV(roleScopedInvoices, selectedCompany.displayName)}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                  title="Download sales invoices spreadsheet"
                >
                  <Download size={14} className="text-emerald-600" />
                  <span>Export CSV</span>
                </button>
              )}

              <button
                onClick={() => {
                  setEditingInvoice(null);
                  setBillingModalType('QUOTATION');
                  setIsBillingModalOpen(true);
                }}
                className="h-9 px-3.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-[0.98]"
              >
                <FileText size={15} className="text-amber-700" />
                <span>+ Quotation / Estimate</span>
              </button>

              <button
                onClick={() => {
                  setEditingInvoice(null);
                  setBillingModalType('TAX_INVOICE');
                  setIsBillingModalOpen(true);
                }}
                className="h-9 px-4 rounded-xl bg-[#db631a] hover:bg-[#c45312] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>+ Create Sale Invoice</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sales */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                {isEmployee ? 'My Total Sales' : 'Total Invoiced (Sales)'}
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">{formatINR(totalSales)}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {!isGB2
                  ? `Includes GST Tax: ${formatINR(totalGstTax)}`
                  : `${confirmedInvoices.length} confirmed bills`}
              </p>
            </div>

            {/* Collected / Got Money (Paid) */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase">
                Got Money (Paid)
              </span>
              <p className="text-xl font-black text-emerald-600 mt-1">{formatINR(totalPaid)}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {totalSales > 0 ? `${Math.round((totalPaid / totalSales) * 100)}% recovery rate` : '0%'}
              </p>
            </div>

            {/* Money To Be Taken / Balance Due */}
            <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs">
              <span className="text-[11px] font-bold text-rose-600 uppercase">
                Money To Be Taken (Due)
              </span>
              <p className="text-xl font-black text-rose-600 mt-1">{formatINR(totalDue)}</p>
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">
                Across partial/unpaid bills (Red)
              </p>
            </div>

            {/* Sales Estimates (Quotations) */}
            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase">
                Sales Estimates (Quotations)
              </span>
              <p className="text-xl font-black text-amber-700 mt-1">{formatINR(totalEstimates)}</p>
              <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                {quotationInvoices.length} estimates • {confirmedInvoices.length} confirmed bills
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice number, customer name, mobile, employee..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            {/* Employee Name Dropdown Filter (Admin or Test Mode) */}
            {(isAdmin || isTestMode) && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Employee:</span>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                >
                  {!isTestMode && <option value="ALL">All Employees ({employees.length})</option>}
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Voucher Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              >
                <option value="ALL">All Types</option>
                <option value="TAX_INVOICE">Tax Invoice</option>
                <option value="BILL_OF_SUPPLY">Bill of Supply</option>
                <option value="QUOTATION">Quotation / Estimate</option>
                <option value="DELIVERY_CHALLAN">Delivery Challan</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedStatus === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setSelectedStatus('PAID')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedStatus === 'PAID'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setSelectedStatus('PARTIAL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedStatus === 'PARTIAL'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-amber-700'
                }`}
              >
                Partial
              </button>
              <button
                onClick={() => setSelectedStatus('UNPAID')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedStatus === 'UNPAID'
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                Unpaid
              </button>
            </div>

            {/* Date Range & Month Filter Controls */}
            <div className="w-full pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-600 flex items-center gap-1">
                  <Calendar size={13} className="text-[#4c3cce]" />
                  <span>Date Range:</span>
                </span>

                {/* Presets */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleSelectDatePreset('ALL')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      datePreset === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDatePreset('THIS_MONTH')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      datePreset === 'THIS_MONTH'
                        ? 'bg-[#4c3cce] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDatePreset('LAST_MONTH')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      datePreset === 'LAST_MONTH'
                        ? 'bg-[#4c3cce] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Last Month
                  </button>
                </div>

                {/* From Date - To Date Inputs */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">From</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setDatePreset('CUSTOM');
                    }}
                    className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">To</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setDatePreset('CUSTOM');
                    }}
                    className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                  {(fromDate || toDate) && (
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

              {/* Filter Status Badge */}
              <div className="text-[11px] text-slate-500 font-semibold">
                Showing <strong className="text-slate-900">{roleScopedInvoices.length}</strong> bills
                {(fromDate || toDate) && (
                  <span className="ml-1 text-[#4c3cce] font-bold">
                    ({fromDate || 'Start'} to {toDate || 'Today'})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase border-b border-slate-200">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-3">Invoice Number</th>
                    <th className="py-3 px-3">Customer Name</th>
                    <th className="py-3 px-3">Employee Name</th>
                    {!isGB2 && <th className="py-3 px-3 text-right">GST Tax (₹)</th>}
                    <th className="py-3 px-3 text-right">Amount (₹)</th>
                    <th className="py-3 px-3 text-right">Balance Due</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={!isGB2 ? 9 : 8} className="py-12 text-center text-slate-400">
                        No invoices found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Date */}
                        <td className="py-3 px-4 font-mono text-slate-500">{inv.invoiceDate}</td>

                        {/* Number */}
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800 leading-tight">
                            {inv.partyName}
                          </p>
                          <span className="font-mono text-[10px] text-slate-400">
                            +91 {inv.partyPhone}
                            {!isGB2 && inv.partyGstin ? ` • GST: ${inv.partyGstin}` : ''}
                          </span>
                        </td>

                        {/* Employee Name */}
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-[#4c3cce] border border-indigo-100">
                            {getInvoiceEmployeeName(inv)}
                          </span>
                        </td>

                        {/* GST Tax (With GST Portal) */}
                        {!isGB2 && (
                          <td className="py-3 px-3 text-right font-mono font-semibold text-[#4c3cce]">
                            {formatINR(inv.taxTotal || 0)}
                          </td>
                        )}

                        {/* Total Amount */}
                        <td className="py-3 px-3 text-right font-black text-slate-900">
                          {formatINR(inv.totalAmount)}
                        </td>

                        {/* Balance Due */}
                        <td className="py-3 px-3 text-right font-semibold text-rose-600">
                          {inv.invoiceType === 'QUOTATION'
                            ? '—'
                            : inv.balanceAmount > 0
                            ? formatINR(inv.balanceAmount)
                            : '—'}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          {inv.invoiceType === 'QUOTATION' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Estimate
                            </span>
                          ) : (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Convert Quotation to Invoice Button */}
                            {inv.invoiceType === 'QUOTATION' && (
                              <button
                                onClick={async () => {
                                  if (
                                    confirm(
                                      `Convert quotation ${inv.invoiceNumber} to an active Tax Invoice? Stock and Khata will be updated.`
                                    )
                                  ) {
                                    await convertQuotationToInvoice(inv.id);
                                    alert('Quotation converted to Tax Invoice successfully!');
                                  }
                                }}
                                title="Convert to Tax Invoice"
                                className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                              >
                                <Sparkles size={15} />
                              </button>
                            )}

                            {/* View & Print Modal */}
                            <button
                              onClick={() => setViewingInvoice(inv)}
                              title="View & Print Invoice"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#4c3cce] hover:bg-indigo-50 transition-colors"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Edit Invoice */}
                            <button
                              onClick={() => {
                                setEditingInvoice(inv);
                                setRepeatInvoice(null);
                                setIsBillingModalOpen(true);
                              }}
                              title="Edit Invoice"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Edit size={15} />
                            </button>

                            {/* Repeat Order */}
                            <button
                              onClick={() => handleRepeatInvoice(inv)}
                              title="Repeat Order (New bill with same party & items)"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                            >
                              <Repeat size={15} />
                            </button>

                            {/* WhatsApp Share with PDF */}
                            <button
                              onClick={() => setViewingInvoice(inv)}
                              title="Share on WhatsApp with attached PDF"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <Share2 size={15} />
                            </button>

                            {/* Direct Print */}
                            <button
                              onClick={() => {
                                setViewingInvoice(inv);
                                setTimeout(() => window.print(), 200);
                              }}
                              title="Direct Print"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            >
                              <Printer size={15} />
                            </button>

                            {/* Delete Invoice (Admin Only) */}
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  if (confirm(`Permanently delete invoice ${inv.invoiceNumber} from Supabase?`)) {
                                    deleteInvoice(inv.id);
                                  }
                                }}
                                title="Delete Invoice (Admin Only)"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <InvoiceDetailModal
        isOpen={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
        onEdit={(inv) => {
          setViewingInvoice(null);
          setEditingInvoice(inv);
          setRepeatInvoice(null);
          setIsBillingModalOpen(true);
        }}
        onRepeat={(inv) => {
          handleRepeatInvoice(inv);
        }}
      />

      <CreateInvoiceModal
        isOpen={isBillingModalOpen}
        onClose={() => {
          setIsBillingModalOpen(false);
          setEditingInvoice(null);
          setRepeatInvoice(null);
        }}
        initialType={billingModalType}
        editingInvoice={editingInvoice}
        repeatInvoice={repeatInvoice}
        onInvoiceCreated={(newInv) => {
          setViewingInvoice(newInv);
          setEditingInvoice(null);
          setRepeatInvoice(null);
        }}
      />

      <CreateUserModal
        isOpen={isCreateEmployeeModalOpen}
        onClose={() => setIsCreateEmployeeModalOpen(false)}
        onUserCreated={refreshSystemUsers}
      />
    </div>
  );
}
