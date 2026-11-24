import { createClient } from '@supabase/supabase-js';
import {
  MockItem,
  MockParty,
  MockInvoice,
  MockInvoiceItem,
  BusinessProfile,
} from './mockData';

// Supabase Configuration
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://fyxqyylclamwigvdzjem.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eHF5eWxjbGFtd2lndmR6amVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2Mzk3OTEsImV4cCI6MjEwMzIxNTc5MX0.czzLDeM6fw81zepKfgK6ckpcoo0F8BIq_36Y3b_yrFE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface CompanyConfig {
  id: string;
  code: 'goodwin-1' | 'goodwin-2';
  name: string;
  displayName: string;
  shortName: string;
  tagline: string;
  gstin: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  invoicePrefix: string;
  uoiPrefix: string;
  cashBalance: number;
  bankBalance: number;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  // Feature flags
  hasPos: boolean;         // Removed for Goodwin Batteries 2
  hasGstReports: boolean;   // Removed for Goodwin Batteries 2
  hasOnlineStore: boolean;  // Removed for Goodwin Batteries 2
}

export const COMPANIES: CompanyConfig[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    code: 'goodwin-1',
    name: 'Goodwin Batteries',
    displayName: 'Goodwin Batteries (With GST)',
    shortName: 'GB 1',
    tagline: 'Main Branch • GST Enterprise Suite',
    gstin: '23AABCG1234F1Z5',
    phone: '+91 9667724411',
    email: 'info@goodwinbatteries.com',
    address: '202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road, Indore – 452012, Indore, Madhya Pradesh - 452012',
    city: 'Indore',
    state: 'Madhya Pradesh',
    stateCode: '23',
    pincode: '452012',
    invoicePrefix: 'GW-INV/',
    uoiPrefix: 'GW-CUST',
    cashBalance: 50000,
    bankBalance: 0,
    bankName: '',
    accountNumber: '',
    ifsc: '',
    hasPos: false,
    hasGstReports: true,
    hasOnlineStore: false,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    code: 'goodwin-2',
    name: 'Goodwin Batteries',
    displayName: 'Goodwin Batteries (Without GST)',
    shortName: 'GB 2',
    tagline: 'Unit 2 • Fast Invoicing & Inventory (Without GST)',
    gstin: '23AABCG1234F1Z5',
    phone: '+91 9667724411',
    email: 'info@goodwinbatteries.com',
    address: '202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road, Indore – 452012, Indore, Madhya Pradesh - 452012',
    city: 'Indore',
    state: 'Madhya Pradesh',
    stateCode: '23',
    pincode: '452012',
    invoicePrefix: 'GB2-INV/',
    uoiPrefix: 'GB2-CUST',
    cashBalance: 0,
    bankBalance: 0,
    bankName: '',
    accountNumber: '',
    ifsc: '',
    // POS Quick Bill, GST Reports, Online Store are removed for Goodwin Batteries 2
    hasPos: false,
    hasGstReports: false,
    hasOnlineStore: false,
  },
];

// Helper to convert company settings to BusinessProfile
export function companyToBusinessProfile(company: CompanyConfig): BusinessProfile {
  const cleanName = (company.name || 'Goodwin Batteries').replace(/\s*Pvt\.?\s*Ltd\.?/gi, '').trim();
  return {
    businessName: cleanName,
    gstin: company.gstin || '23AABCG1234F1Z5',
    phone: company.phone || '+91 9667724411',
    email: company.email || 'info@goodwinbatteries.com',
    address: company.address || '202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road, Indore – 452012, Indore, Madhya Pradesh - 452012',
    city: company.city || 'Indore',
    state: company.state || 'Madhya Pradesh',
    stateCode: company.stateCode || '23',
    pincode: company.pincode || '452012',
    upiId: `${company.code === 'goodwin-2' ? 'goodwin2' : 'goodwin'}@okaxis`,
    invoicePrefix: company.invoicePrefix,
    currentInvoiceNumber: 101,
    defaultPrintFormat: 'A4',
    termsAndConditions:
      '1. Goods once sold will not be returned without warranty card.\n2. Subject to Indore Jurisdiction.',
    bankDetails: company.bankName && company.accountNumber
      ? `${company.bankName} - A/C: ${company.accountNumber} - IFSC: ${company.ifsc}`
      : '',
    storeTagline: `Authorized Manufacturer of Automotive & Inverter Batteries - ${cleanName}`,
    storeNotice: '⚡ Express dispatch across MP & Maharashtra!',
    enableOnlineStore: company.hasOnlineStore,
  };
}

// ── Supabase Service Functions ──────────────────────────────────────────────

/**
 * Fetch company settings for a given company code or id
 */
export async function fetchCompanyFromSupabase(companyId: string): Promise<CompanyConfig | null> {
  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', companyId)
      .maybeSingle();

    if (error || !data) return null;

    const baseConfig = COMPANIES.find((c) => c.id === companyId) || COMPANIES[0];
    return {
      ...baseConfig,
      name: 'Goodwin Batteries',
      displayName: baseConfig.displayName,
      gstin: data.gstin || baseConfig.gstin,
      address: data.address || baseConfig.address,
      phone: data.phone || baseConfig.phone,
      email: data.email || baseConfig.email,
      bankName: data.bank_name || '',
      accountNumber: data.account_number || '',
      ifsc: data.ifsc_code || '',
      invoicePrefix: data.invoice_prefix || baseConfig.invoicePrefix,
      cashBalance: typeof data.cash_balance === 'number' ? data.cash_balance : baseConfig.cashBalance,
      bankBalance: typeof data.bank_balance === 'number' ? data.bank_balance : baseConfig.bankBalance,
    };
  } catch (err) {
    console.warn('[Supabase] Error loading company settings:', err);
    return null;
  }
}

/**
 * Fetch staff members from Supabase hrms_employees table (Deprecated - returns empty to prevent phantom dummy staff)
 */
export async function fetchEmployeesFromSupabase() {
  return [];
}

/**
 * Permanently purge obsolete dummy records from hrms_employees table in Supabase
 */
export async function clearHrmsEmployeesInSupabase(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('hrms_employees')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.warn('[Supabase] Could not clear hrms_employees:', error);
    return !error;
  } catch (err) {
    console.warn('[Supabase] Error clearing hrms_employees:', err);
    return false;
  }
}

/**
 * Insert staff member into Supabase hrms_employees table
 */
export async function insertEmployeeToSupabase(params: {
  name: string;
  phone?: string;
  email?: string;
  designation?: string;
}) {
  try {
    const parts = params.name.trim().split(/\s+/);
    const firstName = parts[0] || params.name.trim();
    const lastName = parts.slice(1).join(' ') || '';
    const empId = `EMP-${Date.now().toString().slice(-4)}`;

    await supabase.from('hrms_employees').insert([
      {
        employee_id: empId,
        first_name: firstName,
        last_name: lastName,
        email: params.email || '',
        phone: params.phone || '',
        department: 'Sales & Billing',
        designation: params.designation || 'Sales & Billing Executive',
        status: 'Active',
      },
    ]);
  } catch (err) {
    console.warn('[Supabase] Error inserting into hrms_employees:', err);
  }
}

/**
 * Fetch products from Supabase filtered for the given company
 */
export async function fetchProductsFromSupabase(companyCode: 'goodwin-1' | 'goodwin-2'): Promise<MockItem[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[Supabase] Error fetching products:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Filter by company
    const filtered = data.filter((p: any) => {
      const sku = (p.sku || '').toUpperCase();
      const desc = (p.description || '').toUpperCase();
      const isGB2 = sku.startsWith('GB2-') || desc.includes('[GB2]');
      return companyCode === 'goodwin-2' ? isGB2 : !isGB2;
    });

    return filtered.map((p: any): MockItem => ({
      id: p.id,
      name: p.name || p.battery_model || p.sku,
      sku: p.sku || `SKU-${p.id.slice(0, 6)}`,
      barcode: p.sku || p.id.slice(0, 8),
      hsnCode: p.hsn || p.hsn_code || '8507',
      unit: 'PCS',
      purchasePrice: Number(p.purchase_price) || 0,
      salesPrice: Number(p.selling_price) || 0,
      mrp: Number(p.mrp) || Math.round(Number(p.selling_price) * 1.15) || 0,
      stock: Number(p.stock) || 0,
      minStockAlert: 5,
      taxRate: Number(p.gst_percent || p.gst_rate) || 28,
      category: p.category || 'Automotive',
      godown: p.warehouse_rack || 'Main Warehouse',
      description: p.description || `${p.voltage || ''} ${p.ah ? p.ah + 'Ah' : ''} ${p.technology || ''}`.trim(),
      showInStore: true,
      isFeatured: Number(p.stock) > 0,
      warranty: p.warranty_months ? `${p.warranty_months} Months` : '18 Months',
    }));
  } catch (err) {
    console.error('[Supabase] Error fetching products:', err);
    return [];
  }
}

/**
 * Insert new product in Supabase
 */
export async function insertProductToSupabase(
  item: Omit<MockItem, 'id'>,
  companyCode: 'goodwin-1' | 'goodwin-2'
): Promise<MockItem | null> {
  try {
    const sku = companyCode === 'goodwin-2' && !item.sku.startsWith('GB2-')
      ? `GB2-${item.sku}`
      : item.sku;

    const payload = {
      name: item.name,
      battery_model: item.name,
      sku,
      hsn: item.hsnCode,
      category: item.category,
      purchase_price: item.purchasePrice,
      selling_price: item.salesPrice,
      mrp: item.mrp,
      stock: item.stock,
      gst_percent: item.taxRate,
      warehouse_rack: item.godown,
      description: companyCode === 'goodwin-2' ? `${item.description || ''} [GB2]`.trim() : item.description || '',
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error inserting product:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      sku: data.sku,
      barcode: data.sku,
      hsnCode: data.hsn,
      unit: item.unit || 'PCS',
      purchasePrice: Number(data.purchase_price),
      salesPrice: Number(data.selling_price),
      mrp: Number(data.mrp),
      stock: Number(data.stock),
      minStockAlert: item.minStockAlert,
      taxRate: Number(data.gst_percent),
      category: data.category,
      godown: data.warehouse_rack,
      description: data.description,
      showInStore: item.showInStore,
      isFeatured: item.isFeatured,
      warranty: item.warranty,
    };
  } catch (err) {
    console.error('[Supabase] Error inserting product:', err);
    return null;
  }
}

/**
 * Update product in Supabase
 */
export async function updateProductInSupabase(id: string, updated: Partial<MockItem>): Promise<boolean> {
  try {
    const payload: any = {};
    if (updated.name !== undefined) payload.name = updated.name;
    if (updated.salesPrice !== undefined) payload.selling_price = updated.salesPrice;
    if (updated.purchasePrice !== undefined) payload.purchase_price = updated.purchasePrice;
    if (updated.stock !== undefined) payload.stock = updated.stock;
    if (updated.category !== undefined) payload.category = updated.category;
    if (updated.hsnCode !== undefined) payload.hsn = updated.hsnCode;

    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) {
      console.error('[Supabase] Error updating product:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error updating product:', err);
    return false;
  }
}

/**
 * Delete product in Supabase
 */
export async function deleteProductInSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('[Supabase] Error deleting product:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error deleting product:', err);
    return false;
  }
}

/**
 * Fetch parties (customers & suppliers) from Supabase filtered by company
 */
export async function fetchPartiesFromSupabase(companyCode: 'goodwin-1' | 'goodwin-2'): Promise<MockParty[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[Supabase] Error fetching customers:', error);
      return [];
    }

    if (!data) return [];

    const filtered = data.filter((c: any) => {
      const uoi = (c.uoi || '').toUpperCase();
      const isGB2 = uoi.startsWith('GB2-') || (c.address || '').includes('[GB2]');
      return companyCode === 'goodwin-2' ? isGB2 : !isGB2;
    });

    return filtered.map((c: any): MockParty => {
      const gstin = c.gstin || '';
      const stateCode = gstin.length >= 2 && !isNaN(Number(gstin.slice(0, 2))) ? gstin.slice(0, 2) : '23';
      return {
        id: c.id,
        name: c.name,
        type: String(c.type || '').toLowerCase() === 'supplier' ? 'SUPPLIER' : 'CUSTOMER',
        phone: c.contact || '',
        email: c.email || '',
        gstin: c.gstin || '',
        state: 'Madhya Pradesh',
        stateCode,
        address: c.address ? c.address.replace('[GB2]', '').trim() : '',
        creditLimit: Number(c.credit_limit) || 0,
        currentBalance: Number(c.outstanding) || 0,
        createdAt: c.created_at ? String(c.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
      };
    });
  } catch (err) {
    console.error('[Supabase] Error fetching parties:', err);
    return [];
  }
}

/**
 * Insert customer in Supabase
 */
export async function insertCustomerToSupabase(
  party: Omit<MockParty, 'id'>,
  companyCode: 'goodwin-1' | 'goodwin-2'
): Promise<MockParty | null> {
  try {
    const prefix = companyCode === 'goodwin-2' ? 'GB2-CUST' : 'GW-CUST';
    const uoi = `${prefix}-${Date.now().toString().slice(-4)}`;
    const address = companyCode === 'goodwin-2'
      ? `${party.address || ''} [GB2]`.trim()
      : party.address || '';

    const payload = {
      uoi,
      name: party.name,
      contact: party.phone || '',
      email: party.email || null,
      gstin: party.gstin || null,
      type: party.type === 'SUPPLIER' ? 'supplier' : 'dealer',
      credit_limit: party.creditLimit || 0,
      outstanding: party.currentBalance || 0,
      address,
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error inserting customer:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      type: 'CUSTOMER',
      phone: data.contact,
      email: data.email,
      gstin: data.gstin,
      state: party.state || 'Madhya Pradesh',
      stateCode: party.stateCode || '23',
      address: party.address,
      creditLimit: Number(data.credit_limit),
      currentBalance: Number(data.outstanding),
      createdAt: data.created_at ? String(data.created_at).split('T')[0] : (party.createdAt || new Date().toISOString().split('T')[0]),
    };
  } catch (err) {
    console.error('[Supabase] Error inserting party:', err);
    return null;
  }
}

/**
 * Update customer in Supabase
 */
export async function updateCustomerInSupabase(id: string, updated: Partial<MockParty>): Promise<boolean> {
  try {
    const payload: any = {};
    if (updated.name !== undefined) payload.name = updated.name;
    if (updated.phone !== undefined) payload.contact = updated.phone;
    if (updated.email !== undefined) payload.email = updated.email;
    if (updated.gstin !== undefined) payload.gstin = updated.gstin;
    if (updated.address !== undefined) payload.address = updated.address;
    if (updated.currentBalance !== undefined) payload.outstanding = updated.currentBalance;
    if (updated.creditLimit !== undefined) payload.credit_limit = updated.creditLimit;

    const { error } = await supabase.from('customers').update(payload).eq('id', id);
    if (error) {
      console.error('[Supabase] Error updating customer:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error updating customer:', err);
    return false;
  }
}

/**
 * Delete customer in Supabase
 */
export async function deleteCustomerInSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
      console.error('[Supabase] Error deleting customer:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error deleting customer:', err);
    return false;
  }
}

/**
 * Fetch sales invoices from Supabase filtered by company
 */
export async function fetchInvoicesFromSupabase(companyCode: 'goodwin-1' | 'goodwin-2'): Promise<MockInvoice[]> {
  try {
    const { data, error } = await supabase
      .from('sales_invoices')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('[Supabase] Error fetching invoices:', error);
      return [];
    }

    if (!data) return [];

    const filtered = data.filter((inv: any) => {
      const invNum = (inv.invoice_number || '').toUpperCase();
      const notes = (inv.notes || '').toUpperCase();
      const isGB2 = invNum.startsWith('GB2-') || notes.includes('[GB2]');
      return companyCode === 'goodwin-2' ? isGB2 : !isGB2;
    });

    return filtered.map((inv: any): MockInvoice => {
      const gstin = inv.customer_gstin || '';
      const stateCode = gstin.length >= 2 && !isNaN(Number(gstin.slice(0, 2))) ? gstin.slice(0, 2) : '23';

      let meta: any = {};
      if (inv.notes && inv.notes.includes('[META:')) {
        try {
          const match = inv.notes.match(/\[META:(.*?)\]/);
          if (match && match[1]) {
            meta = JSON.parse(match[1]);
          }
        } catch {
          // ignore
        }
      }

      let items: MockInvoiceItem[] = [];
      if (Array.isArray(inv.items)) {
        items = inv.items.map((i: any) => ({
          itemId: i.product_id || i.id || 'item-0',
          name: i.product_name || i.name || i.sku || 'Battery Item',
          hsnCode: i.hsn || '8507',
          quantity: Number(i.quantity) || 1,
          unit: 'PCS',
          unitPrice: Number(i.rate || i.price || i.unitPrice) || 0,
          discount: Number(i.discount) || 0,
          taxRate: Number(i.gst_percent || i.gstPercent || 28),
          cgst: Number(i.gstVal ? i.gstVal / 2 : 0),
          sgst: Number(i.gstVal ? i.gstVal / 2 : 0),
          igst: 0,
          total: Number(i.amount || i.total) || 0,
        }));
      }

      const grandTotal = Number(inv.grand_total) || 0;
      const statusLower = String(inv.status || inv.payment_status || '').toLowerCase();
      const resolvedStatus: 'PAID' | 'PARTIAL' | 'UNPAID' =
        meta.paymentStatus === 'UNPAID' || statusLower === 'unpaid'
          ? 'UNPAID'
          : meta.paymentStatus === 'PARTIAL' || statusLower === 'partial'
          ? 'PARTIAL'
          : meta.paymentStatus === 'PAID' || statusLower === 'paid'
          ? 'PAID'
          : Number(inv.outstanding) > 0
          ? Number(inv.outstanding) < grandTotal
            ? 'PARTIAL'
            : 'UNPAID'
          : 'PAID';

      const resolvedPaidAmount =
        resolvedStatus === 'PAID'
          ? grandTotal
          : resolvedStatus === 'UNPAID'
          ? 0
          : typeof meta.paidAmount === 'number'
          ? meta.paidAmount
          : Math.max(0, grandTotal - (Number(inv.outstanding) || 0));

      const resolvedBalanceAmount =
        resolvedStatus === 'PAID'
          ? 0
          : resolvedStatus === 'UNPAID'
          ? grandTotal
          : Math.max(0, grandTotal - resolvedPaidAmount);

      const isQuotation = (inv.invoice_type || '').toLowerCase().includes('quotation');

      return {
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        invoiceType: isQuotation ? 'QUOTATION' : 'TAX_INVOICE',
        orderNumber: inv.order_number || meta.orderNumber || '',
        orderDate: inv.order_date || meta.orderDate || '',
        partyName: inv.customer_name || 'Cash Customer',
        partyPhone: inv.transport_contact_number || meta.customerPhone || '',
        partyGstin: inv.customer_gstin || '',
        billingName: inv.billing_name || meta.billingName || inv.customer_name || '',
        billingAddress: inv.billing_address || meta.billingAddress || '',
        billingState: inv.billing_state_ut || meta.billingState || 'Madhya Pradesh',
        shippingAddress: inv.shipping_address || meta.shippingAddress || '',
        shippingState: inv.shipping_state_ut || meta.shippingState || 'Madhya Pradesh',
        transportAddress: inv.transport_address || meta.transportAddress || '',
        transportContactNumber: inv.transport_contact_number || meta.transportContactNumber || '',
        transportGstin: inv.transport_gstin || meta.transportGstin || '',
        placeOfSupply: inv.place_of_supply || meta.placeOfSupply || 'Madhya Pradesh',
        placeOfDelivery: inv.place_of_delivery || meta.placeOfDelivery || 'Madhya Pradesh',
        referenceName: inv.reference_name || meta.referenceName || '',
        employeeName: meta.employeeName || inv.reference_name || meta.referenceName || 'Ansh Chourasiya',
        pvtMarka: inv.pvt_marka || meta.pvtMarka || '',
        partyStateCode: stateCode,
        invoiceDate: inv.date || new Date().toISOString().split('T')[0],
        dueDate: inv.date || new Date().toISOString().split('T')[0],
        subtotal: Number(inv.taxable_amount || grandTotal * 0.78),
        discountTotal: Number(inv.discount || 0),
        taxTotal: Number(inv.gst_amount ?? 0),
        cgstTotal: Number(inv.gst_amount ? inv.gst_amount / 2 : 0),
        sgstTotal: Number(inv.gst_amount ? inv.gst_amount / 2 : 0),
        igstTotal: 0,
        roundOff: 0,
        totalAmount: grandTotal,
        paidAmount: resolvedPaidAmount,
        balanceAmount: resolvedBalanceAmount,
        paymentStatus: resolvedStatus,
        paymentMode: (meta.paymentMode || (inv.payment_mode ? inv.payment_mode.toUpperCase() : 'UPI')) as any,
        paymentReference: meta.paymentReference || '',
        items,
      };
    });
  } catch (err) {
    console.error('[Supabase] Error fetching invoices:', err);
    return [];
  }
}

/**
 * Insert invoice in Supabase
 */
export async function insertInvoiceToSupabase(
  invoice: MockInvoice,
  companyCode: 'goodwin-1' | 'goodwin-2'
): Promise<MockInvoice | null> {
  try {
    let invNum = invoice.invoiceNumber;
    invNum = invNum.trim();

    const extraMeta = {
      orderNumber: invoice.orderNumber || '',
      orderDate: invoice.orderDate || '',
      customerPhone: invoice.partyPhone || '',
      billingName: invoice.billingName || invoice.partyName || '',
      billingAddress: invoice.billingAddress || '',
      billingState: invoice.billingState || 'Madhya Pradesh',
      shippingAddress: invoice.shippingAddress || '',
      shippingState: invoice.shippingState || 'Madhya Pradesh',
      transportAddress: invoice.transportAddress || '',
      transportContactNumber: invoice.transportContactNumber || '',
      transportGstin: invoice.transportGstin || '',
      placeOfSupply: invoice.placeOfSupply || 'Madhya Pradesh',
      placeOfDelivery: invoice.placeOfDelivery || invoice.placeOfSupply || 'Madhya Pradesh',
      referenceName: invoice.referenceName || '',
      employeeName: invoice.employeeName || invoice.referenceName || '',
      pvtMarka: invoice.pvtMarka || '',
      paymentMode: invoice.paymentMode || 'UPI',
      paymentReference: invoice.paymentReference || '',
      paymentStatus: invoice.paymentStatus,
      paidAmount: invoice.paidAmount,
      balanceAmount: invoice.balanceAmount,
    };
    const prefixTag = companyCode === 'goodwin-2' ? '[GB2]' : '';
    const notesStr = `${prefixTag} [META:${JSON.stringify(extraMeta)}]`.trim();

    const payload = {
      invoice_number: invNum,
      date: invoice.invoiceDate || new Date().toISOString().split('T')[0],
      invoice_type: invoice.invoiceType === 'QUOTATION' ? 'Quotation' : 'GST Tax Invoice',
      customer_name: invoice.partyName || 'Cash Sale',
      customer_gstin: invoice.partyGstin || null,
      taxable_amount: invoice.subtotal,
      subtotal: invoice.subtotal,
      gst_amount: invoice.taxTotal,
      grand_total: invoice.totalAmount,
      status: invoice.paymentStatus.toLowerCase(),
      payment_status: invoice.paymentStatus === 'PAID' ? 'Paid' : invoice.paymentStatus === 'PARTIAL' ? 'Partial' : 'Unpaid',
      payment_mode: (invoice.paymentMode || 'cash').toLowerCase(),
      outstanding: invoice.balanceAmount,
      items: invoice.items,
      notes: notesStr,
      transport_address: invoice.transportAddress || null,
      transport_contact_number: invoice.transportContactNumber || invoice.partyPhone || null,
      transport_gstin: invoice.transportGstin || null,
      place_of_supply: invoice.placeOfSupply || 'Madhya Pradesh',
      place_of_delivery: invoice.placeOfDelivery || invoice.placeOfSupply || 'Madhya Pradesh',
      reference_name: invoice.referenceName || null,
      pvt_marka: invoice.pvtMarka || null,
      billing_state_ut: invoice.billingState || 'Madhya Pradesh',
      shipping_state_ut: invoice.shippingState || 'Madhya Pradesh',
      dispatch_status: 'Not Delivered',
      order_type: invoice.orderNumber ? `Order #${invoice.orderNumber}` : 'New Order',
      lifecycle_status: invoice.invoiceType === 'QUOTATION' ? 'Quotation' : 'Confirmed',
    };

    const { data, error } = await supabase
      .from('sales_invoices')
      .insert([payload])
      .select()
      .single();

    // If invoice with this number already exists, return existing record to prevent duplicates
    if (error && error.message.includes('sales_invoices_invoice_number_key')) {
      const existing = await supabase
        .from('sales_invoices')
        .select('*')
        .eq('invoice_number', invNum)
        .maybeSingle();
      if (existing.data) {
        return {
          ...invoice,
          id: existing.data.id,
          invoiceNumber: existing.data.invoice_number,
        };
      }
    }

    if (error) {
      console.error('[Supabase] Error inserting invoice:', error);
      return null;
    }

    return {
      ...invoice,
      id: data?.id || invoice.id,
      invoiceNumber: payload.invoice_number,
    };
  } catch (err) {
    console.error('[Supabase] Error inserting invoice:', err);
    return null;
  }
}

/**
 * Update invoice in Supabase
 */
export async function updateInvoiceInSupabase(
  id: string,
  updated: Partial<MockInvoice>,
  companyCode?: 'goodwin-1' | 'goodwin-2'
): Promise<boolean> {
  try {
    const payload: any = {};
    if (updated.invoiceType) {
      payload.invoice_type = updated.invoiceType === 'QUOTATION' ? 'Quotation' : 'GST Tax Invoice';
      payload.lifecycle_status = updated.invoiceType === 'QUOTATION' ? 'Quotation' : 'Confirmed';
    }
    if (updated.invoiceNumber) payload.invoice_number = updated.invoiceNumber;
    if (updated.invoiceDate) payload.date = updated.invoiceDate;
    if (updated.partyName) payload.customer_name = updated.partyName;
    if (updated.partyGstin !== undefined) payload.customer_gstin = updated.partyGstin || null;
    if (updated.subtotal !== undefined) {
      payload.taxable_amount = updated.subtotal;
      payload.subtotal = updated.subtotal;
    }
    if (updated.taxTotal !== undefined) payload.gst_amount = updated.taxTotal;
    if (updated.totalAmount !== undefined) payload.grand_total = updated.totalAmount;
    if (updated.paymentStatus) {
      payload.status = updated.paymentStatus.toLowerCase();
      payload.payment_status =
        updated.paymentStatus === 'PAID'
          ? 'Paid'
          : updated.paymentStatus === 'PARTIAL'
          ? 'Partial'
          : 'Unpaid';
    }
    if (updated.balanceAmount !== undefined) {
      payload.outstanding = updated.balanceAmount;
    }
    if (updated.paymentMode) payload.payment_mode = updated.paymentMode.toLowerCase();
    if (updated.items) payload.items = updated.items;
    if (updated.transportAddress !== undefined) payload.transport_address = updated.transportAddress || null;
    if (updated.transportContactNumber !== undefined) payload.transport_contact_number = updated.transportContactNumber || null;
    if (updated.transportGstin !== undefined) payload.transport_gstin = updated.transportGstin || null;
    if (updated.placeOfSupply !== undefined) payload.place_of_supply = updated.placeOfSupply;
    if (updated.placeOfDelivery !== undefined) payload.place_of_delivery = updated.placeOfDelivery;
    if (updated.referenceName !== undefined) payload.reference_name = updated.referenceName || null;
    if (updated.pvtMarka !== undefined) payload.pvt_marka = updated.pvtMarka || null;
    if (updated.billingState !== undefined) payload.billing_state_ut = updated.billingState;
    if (updated.shippingState !== undefined) payload.shipping_state_ut = updated.shippingState;

    // Extra meta in notes
    const extraMeta = {
      orderNumber: updated.orderNumber || '',
      orderDate: updated.orderDate || '',
      customerPhone: updated.partyPhone || '',
      billingName: updated.billingName || updated.partyName || '',
      billingAddress: updated.billingAddress || '',
      billingState: updated.billingState || 'Madhya Pradesh',
      shippingAddress: updated.shippingAddress || '',
      shippingState: updated.shippingState || 'Madhya Pradesh',
      transportAddress: updated.transportAddress || '',
      transportContactNumber: updated.transportContactNumber || '',
      transportGstin: updated.transportGstin || '',
      placeOfSupply: updated.placeOfSupply || 'Madhya Pradesh',
      placeOfDelivery: updated.placeOfDelivery || updated.placeOfSupply || 'Madhya Pradesh',
      referenceName: updated.referenceName || '',
      employeeName: updated.employeeName || updated.referenceName || '',
      pvtMarka: updated.pvtMarka || '',
      paymentMode: updated.paymentMode || 'UPI',
      paymentReference: updated.paymentReference || '',
      paymentStatus: updated.paymentStatus,
      paidAmount: updated.paidAmount,
      balanceAmount: updated.balanceAmount,
    };
    const prefixTag = companyCode === 'goodwin-2' ? '[GB2]' : '';
    payload.notes = `${prefixTag} [META:${JSON.stringify(extraMeta)}]`.trim();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const query = isUuid
      ? supabase.from('sales_invoices').update(payload).eq('id', id)
      : supabase.from('sales_invoices').update(payload).eq('invoice_number', updated.invoiceNumber || '');

    const { error } = await query;
    if (error) {
      console.error('[Supabase] Error updating invoice:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error updating invoice:', err);
    return false;
  }
}

/**
 * Delete invoice in Supabase and clean up any linked payments
 */
export async function deleteInvoiceInSupabase(id: string, invoiceNumber?: string): Promise<boolean> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let invNum = invoiceNumber;
    if (!invNum && !isUuid) {
      invNum = id;
    }

    // If we have an invoice number, clean up any payments referencing this invoice
    if (invNum) {
      await supabase.from('payments').delete().or(`reference.eq.INV-${invNum},reference.eq.${invNum}`);
      await supabase.from('sales_invoices').delete().eq('invoice_number', invNum);
    }

    if (isUuid) {
      if (!invNum) {
        const { data } = await supabase.from('sales_invoices').select('invoice_number').eq('id', id).maybeSingle();
        if (data?.invoice_number) {
          await supabase.from('payments').delete().or(`reference.eq.INV-${data.invoice_number},reference.eq.${data.invoice_number}`);
        }
      }
      await supabase.from('sales_invoices').delete().eq('id', id);
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Error deleting invoice:', err);
    return false;
  }
}

/**
 * Fetch payments from Supabase filtered by company
 */
export async function fetchPaymentsFromSupabase(companyCode: 'goodwin-1' | 'goodwin-2') {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false });

    if (error || !data) return [];

    const filtered = data.filter((p: any) => {
      const rec = (p.receipt_number || '').toUpperCase();
      const isGB2 = rec.startsWith('GB2-');
      return companyCode === 'goodwin-2' ? isGB2 : !isGB2;
    });

    return filtered.map((p: any) => ({
      id: p.id,
      partyId: p.party_id || '',
      partyName: p.party_name || '',
      type: (p.direction === 'out' ? 'PAYMENT_OUT' : 'PAYMENT_IN') as 'PAYMENT_IN' | 'PAYMENT_OUT',
      amount: Number(p.amount) || 0,
      paymentMode: (p.payment_mode ? p.payment_mode.toUpperCase() : 'UPI') as any,
      referenceNumber: p.reference || p.receipt_number || '',
      date: p.date,
      notes: `Receipt #${p.receipt_number || ''}`,
    }));
  } catch (err) {
    console.error('[Supabase] Error fetching payments:', err);
    return [];
  }
}

/**
 * Insert payment in Supabase
 */
export async function insertPaymentToSupabase(payment: any, companyCode: 'goodwin-1' | 'goodwin-2') {
  try {
    const prefix = companyCode === 'goodwin-2' ? 'GB2-REC' : 'GW-REC';
    const receiptNumber = `${prefix}-${Date.now().toString().slice(-4)}`;

    const payload = {
      receipt_number: receiptNumber,
      date: payment.date,
      party_name: payment.partyName,
      party_id: payment.partyId,
      party_type: payment.type === 'PAYMENT_IN' ? 'customer' : 'supplier',
      payment_mode: payment.paymentMode.toLowerCase(),
      reference: payment.referenceNumber,
      amount: payment.amount,
      direction: payment.type === 'PAYMENT_IN' ? 'in' : 'out',
    };

    const { error } = await supabase.from('payments').insert([payload]);
    if (error) console.error('[Supabase] Error inserting payment:', error);
  } catch (err) {
    console.error('[Supabase] Error inserting payment:', err);
  }
}
