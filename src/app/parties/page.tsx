'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AddPartyModal from '@/components/parties/AddPartyModal';
import RecordPaymentModal from '@/components/parties/RecordPaymentModal';
import PartyStatementModal from '@/components/parties/PartyStatementModal';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import ImportExportModal from '@/components/ImportExportModal';
import { useApp } from '@/context/AppContext';
import { MockParty, MockInvoice } from '@/lib/mockData';
import { formatINR } from '@/lib/utils';
import { exportPartiesToCSV } from '@/lib/csvUtils';
import {
  Plus,
  Search,
  Share2,
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  FileText,
  Download,
  Upload,
} from 'lucide-react';

export default function PartiesPage() {
  const {
    parties,
    invoices,
    payments,
    deleteParty,
    selectedCompany,
    isAdmin,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CUSTOMER' | 'SUPPLIER' | 'DUES'>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<MockParty | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDefaultType, setPaymentDefaultType] = useState<'PAYMENT_IN' | 'PAYMENT_OUT'>('PAYMENT_IN');
  const [paymentParty, setPaymentParty] = useState<MockParty | null>(null);
  const [statementParty, setStatementParty] = useState<MockParty | null>(null);
  const [autoDownloadStatementPdf, setAutoDownloadStatementPdf] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [repeatInvoice, setRepeatInvoice] = useState<MockInvoice | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const activeInvoiceNumbers = React.useMemo(() => {
    return new Set(invoices.map((inv) => (inv.invoiceNumber || '').trim().toLowerCase()));
  }, [invoices]);

  const isOrphanedInvoicePayment = React.useCallback(
    (pay: any) => {
      const ref = String(pay.referenceNumber || pay.reference || '').trim().toLowerCase();
      const notes = String(pay.notes || '').toLowerCase();
      const cleanRef = ref.startsWith('inv-') ? ref.slice(4) : ref;
      if (cleanRef.startsWith('gw-') || cleanRef.startsWith('gb2-')) {
        return !activeInvoiceNumbers.has(cleanRef) && !activeInvoiceNumbers.has(ref);
      }
      if (notes.includes('invoice') && (notes.includes('gw-') || notes.includes('gb2-'))) {
        for (const invNum of activeInvoiceNumbers) {
          if (notes.includes(invNum)) return false;
        }
        return true;
      }
      return false;
    },
    [activeInvoiceNumbers]
  );

  // Compute per-party Payment In, Payment Out, Latest Date, and Pure Balance (Payment Out - Payment In)
  const getPartyMetrics = (party: MockParty) => {
    const pInvoices = invoices.filter(
      (inv) =>
        inv.invoiceType !== 'QUOTATION' &&
        inv.partyName &&
        party.name &&
        inv.partyName.trim().toLowerCase() === party.name.trim().toLowerCase()
    );

    const pPayments = payments.filter((pay) => {
      if (pay.referenceNumber && pay.referenceNumber.startsWith('INV-')) return false;
      if (isOrphanedInvoicePayment(pay)) return false;
      const idMatch = Boolean(pay.partyId && party.id && pay.partyId === party.id);
      const nameMatch = Boolean(
        pay.partyName &&
          party.name &&
          pay.partyName.trim().toLowerCase() === party.name.trim().toLowerCase()
      );
      return idMatch || nameMatch;
    });

    let paymentIn = 0;
    let paymentOut = 0;
    const dates: string[] = [];
    if (party.createdAt) dates.push(party.createdAt);

    pInvoices.forEach((inv) => {
      paymentIn += Number(inv.paidAmount) || 0;
      paymentOut += Number(inv.totalAmount) || 0;
      if (inv.invoiceDate) dates.push(inv.invoiceDate);
    });

    pPayments.forEach((pay) => {
      const isOut =
        pay.type === 'PAYMENT_OUT' ||
        (pay as any).direction === 'out' ||
        String((pay as any).type || '').toUpperCase() === 'PAYMENT_OUT' ||
        String((pay as any).direction || '').toLowerCase() === 'out';
      if (isOut) {
        paymentOut += Number(pay.amount) || 0;
      } else {
        paymentIn += Number(pay.amount) || 0;
      }
      if (pay.date) dates.push(pay.date);
    });

    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const latestDate = dates[0] || todayStr;

    // Pure difference: Payment Out - Payment In (No opening balance, no net)
    // > 0 => Amount has to be taken (RED)
    // < 0 => Amount has to be given (GREEN)
    const balance = paymentOut - paymentIn;

    return {
      paymentIn,
      paymentOut,
      latestDate,
      balance,
    };
  };

  const partyRows = parties.map((p) => ({
    party: p,
    ...getPartyMetrics(p),
  }));

  const totalToBeTaken = partyRows
    .filter((r) => r.balance > 0)
    .reduce((acc, r) => acc + r.balance, 0);

  const totalToBeGiven = Math.abs(
    partyRows
      .filter((r) => r.balance < 0)
      .reduce((acc, r) => acc + r.balance, 0)
  );

  const grandPaymentIn = partyRows.reduce((acc, r) => acc + r.paymentIn, 0);
  const grandPaymentOut = partyRows.reduce((acc, r) => acc + r.paymentOut, 0);

  const customerCount = parties.filter((p) => p.type === 'CUSTOMER').length;
  const supplierCount = parties.filter((p) => p.type === 'SUPPLIER').length;

  // Filtered List
  const filteredPartyRows = partyRows.filter(({ party, latestDate, balance }) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      party.name.toLowerCase().includes(q) ||
      party.phone.includes(searchQuery) ||
      latestDate.toLowerCase().includes(q);

    const matchesType =
      filterType === 'ALL'
        ? true
        : filterType === 'CUSTOMER'
        ? party.type === 'CUSTOMER'
        : filterType === 'SUPPLIER'
        ? party.type === 'SUPPLIER'
        : balance !== 0;

    return matchesSearch && matchesType;
  });

  // Combined Date-wise Payment In / Payment Out log (Excludes deleted invoices & orphaned payments)
  const paymentLogRows = [
    ...invoices
      .filter((inv) => inv.invoiceType !== 'QUOTATION')
      .map((inv) => ({
        id: `inv-${inv.id}`,
        date: inv.invoiceDate || todayStr,
        partyName: inv.partyName || 'Customer',
        label: `Sale Invoice (${inv.invoiceNumber})`,
        mode: inv.paymentMode || inv.paymentStatus,
        refNo: inv.invoiceNumber,
        paymentIn: Number(inv.paidAmount) || 0,
        paymentOut: Number(inv.totalAmount) || 0,
      })),
    ...payments
      .filter((p) => {
        if (p.referenceNumber && p.referenceNumber.startsWith('INV-')) return false;
        if (isOrphanedInvoicePayment(p)) return false;
        return true;
      })
      .map((p) => {
        const isOut =
          p.type === 'PAYMENT_OUT' ||
          (p as any).direction === 'out' ||
          String((p as any).type || '').toUpperCase() === 'PAYMENT_OUT';
        return {
          id: p.id,
          date: p.date || todayStr,
          partyName: p.partyName || 'Party',
          label: isOut ? 'Payment Out' : 'Payment In',
          mode: p.paymentMode || 'UPI',
          refNo: p.referenceNumber || '—',
          paymentIn: isOut ? 0 : Number(p.amount) || 0,
          paymentOut: isOut ? Number(p.amount) || 0 : 0,
        };
      }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter recent log by party search if searching
  const filteredPaymentLogRows = paymentLogRows.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      row.partyName.toLowerCase().includes(q) ||
      row.refNo.toLowerCase().includes(q) ||
      row.date.toLowerCase().includes(q) ||
      row.label.toLowerCase().includes(q)
    );
  });

  const handleSendReminder = (party: MockParty, balance: number) => {
    const isToTake = balance >= 0;
    const text = isToTake
      ? `Dear ${party.name}, reminder from Goodwin Batteries. Amount to be taken is ${formatINR(
          Math.abs(balance)
        )}. Thank you!`
      : `Dear ${party.name}, your balance with Goodwin Batteries is ${formatINR(
          Math.abs(balance)
        )} (Amount to be given).`;
    window.open(`https://wa.me/91${party.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800">
      {/* Sidebar */}
      <Sidebar onOpenQuickBill={() => setIsBillingModalOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          onOpenQuickBill={() => setIsBillingModalOpen(true)}
          onOpenAddItem={() => {}}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Parties • Payment In &amp; Payment Out
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-[#4c3cce]">
                  {parties.length} Parties
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simple Payment In - Payment Out tracking • <span className="text-rose-600 font-bold">Red = Amount to be taken</span> • <span className="text-emerald-600 font-bold">Green = Amount to be given</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => exportPartiesToCSV(parties, selectedCompany.displayName)}
                    className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Download size={14} className="text-emerald-600" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => setIsImportExportOpen(true)}
                    className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Upload size={14} className="text-[#4c3cce]" />
                    <span>Import CSV</span>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setPaymentParty(null);
                  setPaymentDefaultType('PAYMENT_IN');
                  setIsPaymentModalOpen(true);
                }}
                className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <ArrowDownLeft size={15} />
                <span>Payment In</span>
              </button>

              <button
                onClick={() => {
                  setPaymentParty(null);
                  setPaymentDefaultType('PAYMENT_OUT');
                  setIsPaymentModalOpen(true);
                }}
                className="h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <ArrowUpRight size={15} />
                <span>Payment Out</span>
              </button>

              <button
                onClick={() => {
                  setEditingParty(null);
                  setIsAddModalOpen(true);
                }}
                className="h-9 px-4 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>+ Add Party</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Simple Summary Cards (No Net / No Credit Limit) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Amount To Be Taken -> RED */}
              <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs">
                <span className="text-[11px] font-bold text-rose-600 uppercase">
                  Amount To Be Taken
                </span>
                <p className="text-xl font-black text-rose-600 mt-1">
                  {formatINR(totalToBeTaken)}
                </p>
                <p className="text-[10px] text-rose-500 font-semibold mt-0.5">
                  Red = Amount has to be taken
                </p>
              </div>

              {/* Amount To Be Given -> GREEN */}
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-600 uppercase">
                  Amount To Be Given
                </span>
                <p className="text-xl font-black text-emerald-600 mt-1">
                  {formatINR(totalToBeGiven)}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  Green = Amount has to be given
                </p>
              </div>

              {/* Total Payment In */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Total Payment In
                </span>
                <p className="text-xl font-black text-emerald-600 mt-1">
                  {formatINR(grandPaymentIn)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">All payments in</p>
              </div>

              {/* Total Payment Out */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Total Payment Out
                </span>
                <p className="text-xl font-black text-rose-600 mt-1">
                  {formatINR(grandPaymentOut)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">All payments out</p>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[240px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search party by name, phone, or date..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    filterType === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All Contacts ({parties.length})
                </button>
                <button
                  onClick={() => setFilterType('CUSTOMER')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    filterType === 'CUSTOMER'
                      ? 'bg-white text-[#4c3cce] shadow-2xs'
                      : 'text-slate-500 hover:text-[#4c3cce]'
                  }`}
                >
                  Customers ({customerCount})
                </button>
                <button
                  onClick={() => setFilterType('SUPPLIER')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    filterType === 'SUPPLIER'
                      ? 'bg-white text-[#db631a] shadow-2xs'
                      : 'text-slate-500 hover:text-[#db631a]'
                  }`}
                >
                  Suppliers ({supplierCount})
                </button>
                <button
                  onClick={() => setFilterType('DUES')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    filterType === 'DUES'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-rose-600'
                  }`}
                >
                  Pending Balance
                </button>
              </div>
            </div>

            {/* Parties Table (Date, Party Name, Contact, Payment In, Payment Out, Amount To Be Taken/Given) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Customer &amp; Party Payment In — Payment Out List
                </h2>
                <span className="text-[11px] font-semibold text-slate-500">
                  Date: {todayStr}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase border-b border-slate-200">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-3">Party Name</th>
                      <th className="py-3 px-3">Contact Details</th>
                      <th className="py-3 px-3 text-right text-emerald-700">Payment In (₹)</th>
                      <th className="py-3 px-3 text-right text-rose-700">Payment Out (₹)</th>
                      <th className="py-3 px-3 text-right">Amount (Take / Give)</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPartyRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No parties found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredPartyRows.map(({ party, paymentIn, paymentOut, latestDate, balance }) => {
                        const isToTake = balance > 0;
                        const isToGive = balance < 0;

                        return (
                          <tr key={party.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Date */}
                            <td className="py-3 px-4 font-mono text-slate-600">
                              {latestDate}
                            </td>

                            {/* Name & Type */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                    party.type === 'CUSTOMER'
                                      ? 'bg-[#ece9fb] text-[#4c3cce]'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {party.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 leading-tight">
                                    {party.name}
                                  </p>
                                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                    {party.type}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="py-3 px-3">
                              <p className="font-mono text-slate-800 font-medium">+91 {party.phone}</p>
                              {selectedCompany.code !== 'goodwin-2' && party.gstin && (
                                <p className="font-mono text-[10px] font-bold text-[#4c3cce]">
                                  GSTIN: {party.gstin}
                                </p>
                              )}
                              <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                {party.address || party.state || '—'}
                              </p>
                            </td>

                            {/* Payment In */}
                            <td className="py-3 px-3 text-right font-bold text-emerald-600">
                              {formatINR(paymentIn)}
                            </td>

                            {/* Payment Out */}
                            <td className="py-3 px-3 text-right font-bold text-rose-600">
                              {formatINR(paymentOut)}
                            </td>

                            {/* Balance: Red if to be taken, Green if to be given */}
                            <td className="py-3 px-3 text-right">
                              <p
                                className={`text-sm font-extrabold ${
                                  isToTake
                                    ? 'text-rose-600'
                                    : isToGive
                                    ? 'text-emerald-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {formatINR(Math.abs(balance))}
                              </p>
                              <span
                                className={`text-[10px] font-bold ${
                                  isToTake
                                    ? 'text-rose-600'
                                    : isToGive
                                    ? 'text-emerald-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {isToTake
                                  ? 'To Be Taken'
                                  : isToGive
                                  ? 'To Be Given'
                                  : 'Settled'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Direct Individual Customer PDF Download */}
                                <button
                                  onClick={() => {
                                    setAutoDownloadStatementPdf(true);
                                    setStatementParty(party);
                                  }}
                                  title={`Download PDF Statement for ${party.name}`}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[#4c3cce] hover:bg-indigo-100 border border-indigo-200 font-bold text-[10px] flex items-center gap-1 transition-colors"
                                >
                                  <Download size={12} />
                                  <span>PDF</span>
                                </button>

                                {/* View Individual Statement */}
                                <button
                                  onClick={() => {
                                    setAutoDownloadStatementPdf(false);
                                    setStatementParty(party);
                                  }}
                                  title={`View Statement for ${party.name}`}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-[#4c3cce] hover:bg-indigo-50 transition-colors"
                                >
                                  <FileText size={15} />
                                </button>

                                {/* Quick Payment In */}
                                <button
                                  onClick={() => {
                                    setPaymentParty(party);
                                    setPaymentDefaultType('PAYMENT_IN');
                                    setIsPaymentModalOpen(true);
                                  }}
                                  title="Record Payment In"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <ArrowDownLeft size={15} />
                                </button>

                                {/* Quick Payment Out */}
                                <button
                                  onClick={() => {
                                    setPaymentParty(party);
                                    setPaymentDefaultType('PAYMENT_OUT');
                                    setIsPaymentModalOpen(true);
                                  }}
                                  title="Record Payment Out"
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <ArrowUpRight size={15} />
                                </button>

                                {/* 1-Click WhatsApp Reminder */}
                                <button
                                  onClick={() => handleSendReminder(party, balance)}
                                  title="Send WhatsApp Reminder"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <Share2 size={15} />
                                </button>

                                {/* Edit Party */}
                                <button
                                  onClick={() => {
                                    setEditingParty(party);
                                    setIsAddModalOpen(true);
                                  }}
                                  title="Edit Party"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                >
                                  <Edit2 size={14} />
                                </button>

                                {/* Delete Party (Admin Only) */}
                                {isAdmin && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove ${party.name}?`)) {
                                        deleteParty(party.id);
                                      }
                                    }}
                                    title="Delete Party (Admin Only)"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Date-wise Payment In & Payment Out Register */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Recent Payment In &amp; Payment Out Entries
                </h2>
                <span className="text-[11px] font-semibold text-slate-500">
                  {filteredPaymentLogRows.length} Entries
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase border-b border-slate-200">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-3">Party Name</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Mode / Ref</th>
                      <th className="py-2.5 px-4 text-right text-emerald-700">Payment In (₹)</th>
                      <th className="py-2.5 px-4 text-right text-rose-700">Payment Out (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPaymentLogRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          {searchQuery.trim()
                            ? `No recent entries found for "${searchQuery}".`
                            : 'No Payment In / Payment Out entries recorded yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredPaymentLogRows.slice(0, 30).map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 font-mono text-slate-600">{row.date}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{row.partyName}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.paymentIn > 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {row.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {row.mode} • {row.refNo}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-emerald-600">
                            {row.paymentIn > 0 ? formatINR(row.paymentIn) : '—'}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-rose-600">
                            {row.paymentOut > 0 ? formatINR(row.paymentOut) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddPartyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editParty={editingParty}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        defaultParty={paymentParty}
        defaultType={paymentDefaultType}
      />

      <PartyStatementModal
        isOpen={!!statementParty}
        onClose={() => {
          setStatementParty(null);
          setAutoDownloadStatementPdf(false);
        }}
        party={statementParty}
        autoDownloadPdf={autoDownloadStatementPdf}
        onAutoDownloadComplete={() => setAutoDownloadStatementPdf(false)}
        onRecordPayment={(party) => {
          setPaymentParty(party);
          setPaymentDefaultType('PAYMENT_IN');
          setIsPaymentModalOpen(true);
        }}
        onRepeatOrder={(inv) => {
          setRepeatInvoice(inv);
          setIsBillingModalOpen(true);
        }}
      />

      <CreateInvoiceModal
        isOpen={isBillingModalOpen}
        onClose={() => {
          setIsBillingModalOpen(false);
          setRepeatInvoice(null);
        }}
        repeatInvoice={repeatInvoice}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
      />
    </div>
  );
}
