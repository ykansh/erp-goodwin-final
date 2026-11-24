'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MockParty } from '@/lib/mockData';
import { GST_STATES } from '@/lib/constants';

interface AddPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  editParty?: MockParty | null;
}

export default function AddPartyModal({ isOpen, onClose, editParty }: AddPartyModalProps) {
  const { addParty, updateParty, selectedCompany } = useApp();
  const isGB2 = selectedCompany?.code === 'goodwin-2';

  const [type, setType] = useState<'CUSTOMER' | 'SUPPLIER'>('CUSTOMER');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [stateCode, setStateCode] = useState('23');
  const [address, setAddress] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (editParty) {
      setType(editParty.type);
      setName(editParty.name);
      setPhone(editParty.phone);
      setEmail(editParty.email || '');
      setGstin(editParty.gstin || '');
      setStateCode(editParty.stateCode || '23');
      setAddress(editParty.address || '');
      setCreatedAt(editParty.createdAt || new Date().toISOString().split('T')[0]);
    } else {
      setType('CUSTOMER');
      setName('');
      setPhone('');
      setEmail('');
      setGstin('');
      setStateCode('23');
      setAddress('');
      setCreatedAt(new Date().toISOString().split('T')[0]);
    }
  }, [editParty, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a party name');
      return;
    }

    const stateObj = GST_STATES.find((s) => s.code === stateCode);

    if (editParty) {
      updateParty(editParty.id, {
        type,
        name,
        phone,
        email,
        gstin,
        state: stateObj?.name || 'Madhya Pradesh',
        stateCode,
        address,
        createdAt,
      });
    } else {
      addParty({
        type,
        name,
        phone,
        email,
        gstin,
        state: stateObj?.name || 'Madhya Pradesh',
        stateCode,
        address,
        creditLimit: 0,
        currentBalance: 0,
        createdAt,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4c3cce] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">
                {editParty ? 'Edit Party Details' : 'Add Customer / Vendor'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Simple customer &amp; vendor details for Payment In / Payment Out tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Party Type Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('CUSTOMER')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                type === 'CUSTOMER'
                  ? 'bg-white text-[#4c3cce] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Customer (Buyer)
            </button>
            <button
              type="button"
              onClick={() => setType('SUPPLIER')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                type === 'SUPPLIER'
                  ? 'bg-white text-[#db631a] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Supplier (Vendor)
            </button>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {type === 'CUSTOMER' ? 'Customer / Company Name *' : 'Vendor / Company Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter party / company name"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mobile Number (WhatsApp) *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>
          </div>

          {/* Date & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">State / Place of Supply</label>
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              >
                {GST_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address & Email / GSTIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop No, Street, City"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            {!isGB2 ? (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 23AAAAA0000A1Z5"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@party.com"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
            >
              {editParty ? 'Save Changes' : 'Add Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
