'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Printer,
  PlusCircle,
  Building,
  Download,
  Loader2,
  CheckCircle2,
  Repeat,
} from 'lucide-react';
import { MockParty, MockInvoice } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/utils';
import { downloadInvoicePdf } from '@/lib/pdfUtils';

interface PartyStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  party: MockParty | null;
  onRecordPayment: (party: MockParty) => void;
  onRepeatOrder?: (invoice: MockInvoice) => void;
  autoDownloadPdf?: boolean;
  onAutoDownloadComplete?: () => void;
}

export default function PartyStatementModal({
  isOpen,
  onClose,
  party,
  onRecordPayment,
  onRepeatOrder,
  autoDownloadPdf = false,
  onAutoDownloadComplete,
}: PartyStatementModalProps) {
  const { invoices, payments } = useApp();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfSuccessMsg, setPdfSuccessMsg] = useState<string | null>(null);

  // Filter confirmed invoices and Payment In / Payment Out records for THIS specific customer
  const activeInvoiceNumbers = React.useMemo(() => {
    return new Set(invoices.map((inv) => (inv.invoiceNumber || '').trim().toLowerCase()));
  }, [invoices]);

  const partyInvoices = party
    ? invoices.filter(
        (inv) =>
          inv.invoiceType !== 'QUOTATION' &&
          inv.partyName &&
          party.name &&
          inv.partyName.trim().toLowerCase() === party.name.trim().toLowerCase()
      )
    : [];

  const partyPayments = party
    ? payments.filter((p) => {
        if (p.referenceNumber && p.referenceNumber.startsWith('INV-')) return false;
        const ref = String(p.referenceNumber || (p as any).reference || '').toLowerCase().trim();
        const cleanRef = ref.startsWith('inv-') ? ref.slice(4) : ref;
        if (cleanRef.startsWith('gw-') || cleanRef.startsWith('gb2-')) {
          if (!activeInvoiceNumbers.has(cleanRef) && !activeInvoiceNumbers.has(ref)) return false;
        }
        const idMatch = Boolean(p.partyId && party.id && p.partyId === party.id);
        const nameMatch = Boolean(
          p.partyName &&
            party.name &&
            p.partyName.trim().toLowerCase() === party.name.trim().toLowerCase()
        );
        return idMatch || nameMatch;
      })
    : [];

  interface StatementRow {
    id: string;
    date: string;
    title: string;
    refNo: string;
    paymentIn: number;
    paymentOut: number;
  }

  const rows: StatementRow[] = [
    ...partyInvoices.map((inv) => ({
      id: `inv-${inv.id}`,
      date: inv.invoiceDate || new Date().toISOString().split('T')[0],
      title: `Sale Invoice (${inv.invoiceNumber})`,
      refNo: inv.invoiceNumber,
      paymentIn: Number(inv.paidAmount) || 0,
      paymentOut: Number(inv.totalAmount) || 0,
    })),
    ...partyPayments.map((pay) => {
      const isPaymentOut =
        pay.type === 'PAYMENT_OUT' ||
        (pay as any).direction === 'out' ||
        String((pay as any).type || '').toUpperCase() === 'PAYMENT_OUT' ||
        String((pay as any).direction || '').toLowerCase() === 'out';
      const isPaymentIn = !isPaymentOut;

      return {
        id: pay.id,
        date: pay.date || new Date().toISOString().split('T')[0],
        title: isPaymentIn
          ? `Payment In (${pay.paymentMode})`
          : `Payment Out (${pay.paymentMode})`,
        refNo: pay.referenceNumber || '—',
        paymentIn: isPaymentIn ? Number(pay.amount) || 0 : 0,
        paymentOut: isPaymentOut ? Number(pay.amount) || 0 : 0,
      };
    }),
  ];

  // Sort descending by date
  rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPaymentIn = rows.reduce((sum, r) => sum + r.paymentIn, 0);
  const totalPaymentOut = rows.reduce((sum, r) => sum + r.paymentOut, 0);

  // Pure Payment In - Payment Out calculation (no opening balance, no net)
  // If Payment Out > Payment In -> Amount has to be taken (RED)
  // If Payment In > Payment Out -> Amount has to be given (GREEN)
  const balance = totalPaymentOut - totalPaymentIn;
  const isToTake = balance > 0;
  const isToGive = balance < 0;

  const handleDownloadStatementPdf = async () => {
    if (!party) return;
    try {
      setIsDownloadingPdf(true);
      setPdfSuccessMsg(`Generating PDF for ${party.name}...`);
      const safePartyName = party.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${safePartyName}_Payment_Statement_${new Date().toISOString().split('T')[0]}`;
      await downloadInvoicePdf('printable-statement', filename);
      setPdfSuccessMsg(`Downloaded ${filename}.pdf`);
      setTimeout(() => setPdfSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to download statement PDF:', err);
      alert('Failed to download PDF. You can also click Print -> Save as PDF.');
      setPdfSuccessMsg(null);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  useEffect(() => {
    if (isOpen && party && autoDownloadPdf) {
      const timer = setTimeout(async () => {
        await handleDownloadStatementPdf();
        if (onAutoDownloadComplete) {
          onAutoDownloadComplete();
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, party?.id, autoDownloadPdf]);

  if (!isOpen || !party) return null;

  const handleSendWhatsAppReminder = () => {
    const text = isToTake
      ? `Dear ${party.name}, reminder from Goodwin Batteries. Payment In: ${formatINR(
          totalPaymentIn
        )}, Payment Out: ${formatINR(totalPaymentOut)}. Amount to be taken: ${formatINR(
          Math.abs(balance)
        )}. Thank you!`
      : `Dear ${party.name}, your statement with Goodwin Batteries — Payment In: ${formatINR(
          totalPaymentIn
        )}, Payment Out: ${formatINR(totalPaymentOut)}, ${
          isToGive ? `Amount to be given: ${formatINR(Math.abs(balance))}` : 'Settled (₹0.00)'
        }.`;
    window.open(`https://wa.me/91${party.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Top Modal Action Bar (No Print) */}
        <div className="no-print h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4c3cce] text-white flex items-center justify-center font-bold text-sm">
              <Building size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-base">{party.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {party.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Phone: +91 {party.phone} • Date: {party.createdAt || new Date().toISOString().split('T')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadStatementPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4c3cce] border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isDownloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleSendWhatsAppReminder}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Share2 size={14} />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onRecordPayment(party);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <PlusCircle size={14} />
              <span>Payment In / Out</span>
            </button>

            {onRepeatOrder && partyInvoices.length > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onRepeatOrder(partyInvoices[0]);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 border border-purple-200 transition-colors"
                title={`Repeat order from latest bill #${partyInvoices[0].invoiceNumber}`}
              >
                <Repeat size={14} className="text-purple-600" />
                <span>Repeat Last Order</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600"
              title="Print Customer Statement"
            >
              <Printer size={15} />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {pdfSuccessMsg && (
          <div className="no-print bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center justify-between text-xs text-emerald-900">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              {pdfSuccessMsg}
            </span>
            <button onClick={() => setPdfSuccessMsg(null)} className="text-emerald-700 font-bold">
              ×
            </button>
          </div>
        )}

        {/* Printable Statement Content for THIS Individual Customer */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
          <div
            id="printable-statement"
            className="w-full max-w-[800px] bg-white border border-slate-300 p-6 sm:p-8 rounded-xl shadow-xs space-y-5 text-slate-800"
          >
            {/* Company & Individual Customer Header */}
            <div className="flex flex-wrap justify-between items-start border-b border-slate-300 pb-4 gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/goodwin-logo.svg"
                  alt="Goodwin Batteries"
                  className="h-12 w-auto object-contain shrink-0"
                />
                <div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                    Goodwin Batteries
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road, Indore – 452012
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono">
                    Phone: +91 9667724411
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded bg-[#4c3cce] text-white font-extrabold text-xs uppercase tracking-wider">
                  Customer Payment Statement
                </span>
                <p className="text-sm font-black text-slate-900 mt-1.5">{party.name}</p>
                <p className="text-[11px] text-slate-600 font-mono">Mobile: +91 {party.phone}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Date: {new Date().toISOString().split('T')[0]}
                </p>
              </div>
            </div>

            {/* Simple Payment In - Payment Out Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Payment In
                </span>
                <p className="text-lg font-black text-emerald-600 mt-0.5">
                  {formatINR(totalPaymentIn)}
                </p>
              </div>

              <div className="sm:border-l border-slate-200 sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Payment Out
                </span>
                <p className="text-lg font-black text-rose-600 mt-0.5">
                  {formatINR(totalPaymentOut)}
                </p>
              </div>

              <div className="sm:border-l border-slate-200 sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {isToTake
                    ? 'Amount To Be Taken'
                    : isToGive
                    ? 'Amount To Be Given'
                    : 'Balance'}
                </span>
                <p
                  className={`text-xl font-black mt-0.5 ${
                    isToTake
                      ? 'text-rose-600'
                      : isToGive
                      ? 'text-emerald-600'
                      : 'text-slate-500'
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
                  {isToTake ? 'To Be Taken (Red)' : isToGive ? 'To Be Given (Green)' : 'Settled'}
                </span>
              </div>
            </div>

            {/* Statement Table: Date, Particulars, Payment In, Payment Out */}
            <div>
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                {party.name} — Payment In &amp; Payment Out Entries
              </h3>

              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-300">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Type / Mode</th>
                      <th className="py-2.5 px-4">Ref No.</th>
                      <th className="py-2.5 px-4 text-right text-emerald-700">Payment In (₹)</th>
                      <th className="py-2.5 px-4 text-right text-rose-700">Payment Out (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No Payment In / Payment Out entries recorded for {party.name} yet.
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 font-mono text-slate-700">{row.date}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{row.title}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-500">{row.refNo}</td>
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
                  <tfoot>
                    <tr className="bg-slate-50 font-black border-t border-slate-300">
                      <td colSpan={3} className="py-2.5 px-4 text-right text-slate-700 uppercase">
                        Total
                      </td>
                      <td className="py-2.5 px-4 text-right text-emerald-600">
                        {formatINR(totalPaymentIn)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-rose-600">
                        {formatINR(totalPaymentOut)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
              <p>Generated via Goodwin Batteries ERP</p>
              <p className="font-bold text-slate-800">For Goodwin Batteries</p>
            </div>
          </div>
        </div>

        {/* Footer (No Print) */}
        <div className="no-print h-14 px-6 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-[11px] text-slate-500">
            Red = Amount to be taken • Green = Amount to be given
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
