import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';

// Initialize PDF in A4 portrait
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
  compress: true,
});

const pageWidth = 210;
const pageHeight = 297;
const marginX = 14;
const contentWidth = pageWidth - marginX * 2; // 182mm
const totalPages = 4;

// Color Palette
const COLORS = {
  navy: [30, 58, 138],       // Primary brand #1E3A8A
  indigo: [76, 60, 206],     // Accent purple/indigo #4C3CCE
  orange: [219, 99, 26],     // Secondary brand #DB631A
  dark: [15, 23, 42],        // Slate 900
  body: [51, 65, 85],        // Slate 700
  muted: [100, 116, 139],    // Slate 500
  lightBg: [248, 250, 252],  // Slate 50
  cardBg: [241, 245, 249],   // Slate 100
  border: [226, 232, 240],   // Slate 200
  green: [22, 163, 74],      // Green 600
  greenBg: [240, 253, 244],  // Green 50
  red: [220, 38, 38],        // Red 600
  redBg: [254, 242, 242],    // Red 50
  amber: [217, 119, 6],      // Amber 600
  amberBg: [254, 243, 199],  // Amber 100
  white: [255, 255, 255],
};

// Embed Logo if exists
let logoBase64 = null;
try {
  const logoPath = path.resolve('public/goodwin-logo.png');
  if (fs.existsSync(logoPath)) {
    const buffer = fs.readFileSync(logoPath);
    logoBase64 = 'data:image/png;base64,' + buffer.toString('base64');
  }
} catch (e) {
  console.warn('Logo could not be loaded:', e);
}

// Helper: Running Header
function drawPageHeader(pageNum) {
  // Top accent bar
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 4, 'F');

  doc.setFillColor(...COLORS.orange);
  doc.rect(0, 4, pageWidth, 1.5, 'F');

  // Header Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.navy);
  doc.text('GOODWIN BATTERIES', marginX, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text('|  STANDARD OPERATING PROCEDURE (SOP)  -  EMPLOYEE & STORE USER MANUAL', marginX + 37, 11);

  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginX, 11, { align: 'right' });

  // Thin separator rule
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(marginX, 13, pageWidth - marginX, 13);
}

// Helper: Running Footer
function drawPageFooter(pageNum) {
  const y = pageHeight - 10;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(marginX, y, pageWidth - marginX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text('Goodwin Batteries Internal Operations  •  Confidential  •  Unauthorized distribution prohibited', marginX, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.text(`Version 2.1  |  Page ${pageNum} of ${totalPages}`, pageWidth - marginX, y + 4.5, { align: 'right' });
}

// Helper: Section Title
function drawSectionTitle(y, number, title, badge = null) {
  doc.setFillColor(...COLORS.indigo);
  doc.roundedRect(marginX, y, 7, 7, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.white);
  doc.text(String(number), marginX + 3.5, y + 5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.navy);
  doc.text(title, marginX + 9.5, y + 5.2);

  if (badge) {
    const textWidth = doc.getTextWidth(title);
    const badgeX = marginX + 11.5 + textWidth;
    doc.setFillColor(...COLORS.amberBg);
    doc.roundedRect(badgeX, y + 0.5, 24, 5.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.amber);
    doc.text(badge, badgeX + 12, y + 4.2, { align: 'center' });
  }

  return y + 10;
}

// Helper: Draw Card Box
function drawCard(x, y, w, h, bgColor = COLORS.lightBg, borderColor = COLORS.border) {
  doc.setFillColor(...bgColor);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');
}

// ============================================================================
// PAGE 1: TITLE, EXECUTIVE OVERVIEW, ACCESS & ROLES, DUAL ENTITIES
// ============================================================================
drawPageHeader(1);

// Hero Header Banner
doc.setFillColor(...COLORS.navy);
doc.roundedRect(marginX, 16, contentWidth, 34, 3, 3, 'F');

// Decorative subtle highlight
doc.setFillColor(...COLORS.indigo);
doc.roundedRect(marginX, 16, contentWidth, 4, 3, 3, 'F');

// Logo or Brand text inside Hero
if (logoBase64) {
  try {
    doc.addImage(logoBase64, 'PNG', marginX + 4, 21, 38, 19);
  } catch {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.white);
    doc.text('GOODWIN BATTERIES', marginX + 6, 28);
  }
} else {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.white);
  doc.text('GOODWIN BATTERIES', marginX + 6, 28);
}

// Title block
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(...COLORS.white);
doc.text('STANDARD OPERATING PROCEDURE (SOP)', marginX + 46, 26);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(220, 225, 245);
doc.text('Comprehensive ERP User Manual for Billing, Khata, Inventory & Sales Staff', marginX + 46, 31);

doc.setFontSize(7.5);
doc.setTextColor(...COLORS.amberBg);
doc.text('Document ID: GB-SOP-2026-V2.1  |  Effective: November 2026  |  Scope: All Branches & Store Outlets', marginX + 46, 36);

// Executive Purpose Card
let curY = 53;
drawCard(marginX, curY, contentWidth, 23, COLORS.lightBg, COLORS.border);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(...COLORS.navy);
doc.text('1. PURPOSE & OPERATIONAL OBJECTIVE', marginX + 4, curY + 5.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(...COLORS.body);
const purposeText =
  'This Standard Operating Procedure (SOP) defines the mandatory step-by-step procedures for Goodwin Batteries billing executives, sales staff, and store managers. Adherence ensures 100% tax compliance, accurate stock deductions, transparent customer Khata ledgers, and tamper-free employee sales tracking. Every staff member must operate strictly in accordance with these guidelines.';
const splitPurpose = doc.splitTextToSize(purposeText, contentWidth - 8);
doc.text(splitPurpose, marginX + 4, curY + 10.5);

// SECTION 2: SYSTEM ACCESS, LOGIN & RBAC
curY = 80;
curY = drawSectionTitle(curY, 2, 'SYSTEM ACCESS & ROLE-BASED ACCESS CONTROL (RBAC)');

// Access Box
drawCard(marginX, curY, contentWidth, 20, COLORS.white, COLORS.border);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...COLORS.dark);
doc.text('System Login & Credentials:', marginX + 4, curY + 5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(...COLORS.body);
doc.text('• Web Portal Access: Launch your browser and navigate to the company ERP portal (e.g., http://localhost:3000).', marginX + 4, curY + 9.5);
doc.text('• Login Procedure: Enter your authorized User ID / Mobile Number and Password provided by Administration.', marginX + 4, curY + 13.5);
doc.text('• Account Security: Never share your login credentials. All bills, receipts, and edits are logged to your personal profile.', marginX + 4, curY + 17.5);

curY += 23;

// RBAC Permissions Table
const tableY = curY;
const colW = [50, 66, 66];
// Table Header
doc.setFillColor(...COLORS.navy);
doc.rect(marginX, tableY, contentWidth, 7, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.white);
doc.text('ERP SYSTEM MODULE', marginX + 4, tableY + 4.8);
doc.text('EMPLOYEE / SALES STAFF ROLE', marginX + colW[0] + 4, tableY + 4.8);
doc.text('ADMINISTRATOR ROLE', marginX + colW[0] + colW[1] + 4, tableY + 4.8);

const rbacRows = [
  ['Billing & Invoicing', 'FULL ACCESS (Create GST & Non-GST Bills)', 'FULL ACCESS (All Companies)'],
  ['Search Products & Live Stock', 'FULL ACCESS (Search items, live stock count)', 'FULL ACCESS (Edit pricing, cost, stock adjustments)'],
  ['Parties Khata & Ledger', 'FULL ACCESS (View ledger, record Payment In/Out)', 'FULL ACCESS (Audit, edit, balance adjustments)'],
  ['Sales Performance Tracker', 'OWN FIGURES ONLY (Personal sales & collections)', 'COMPANY-WIDE (All employee stats & aggregates)'],
  ['Cash & Bank Accounts', 'RESTRICTED (Locked for privacy & reconciliation)', 'FULL ACCESS (Bank deposits, transfers, balances)'],
  ['GST Reports (GSTR-1 / 3B)', 'RESTRICTED (Locked - Handled by Accounts team)', 'FULL ACCESS (Tax liability, JSON export, audits)'],
  ['Settings & Staff Management', 'RESTRICTED (Locked - Cannot alter company rules)', 'FULL ACCESS (Add staff, roles, rates, company info)'],
];

let rowY = tableY + 7;
rbacRows.forEach((row, idx) => {
  const isEven = idx % 2 === 0;
  doc.setFillColor(...(isEven ? COLORS.white : COLORS.lightBg));
  doc.rect(marginX, rowY, contentWidth, 6.2, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.rect(marginX, rowY, contentWidth, 6.2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.dark);
  doc.text(row[0], marginX + 4, rowY + 4.2);

  doc.setFont('helvetica', row[1].startsWith('RESTRICTED') ? 'bold' : 'normal');
  doc.setTextColor(...(row[1].startsWith('RESTRICTED') ? COLORS.red : COLORS.body));
  doc.text(row[1], marginX + colW[0] + 4, rowY + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.navy);
  doc.text(row[2], marginX + colW[0] + colW[1] + 4, rowY + 4.2);

  rowY += 6.2;
});

// SECTION 3: DUAL ENTITIES
curY = rowY + 5;
curY = drawSectionTitle(curY, 3, 'DUAL COMPANY ENTITIES (WITH GST vs WITHOUT GST)', 'IMPORTANT');

// Two Column Cards for Entities
const cardW = (contentWidth - 6) / 2;

// Card 1: Goodwin Batteries (With GST)
drawCard(marginX, curY, cardW, 46, COLORS.white, COLORS.indigo);
doc.setFillColor(...COLORS.indigo);
doc.roundedRect(marginX, curY, cardW, 6.5, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.white);
doc.text('GOODWIN BATTERIES (WITH GST)', marginX + 4, curY + 4.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(...COLORS.body);
doc.text('• Entity Type: Registered GST Tax Entity', marginX + 4, curY + 11);
doc.text('• Invoice Prefix: GW-INV-YYYYMMDD-XXXX', marginX + 4, curY + 15.5);
doc.text('• Tax Compliance: Requires HSN Codes, GST Slabs', marginX + 4, curY + 20);
doc.text('  (18% or 28%), CGST/SGST or IGST tax breakup.', marginX + 4, curY + 24.5);
doc.text('• Target Customers: B2B Dealers, Commercial Fleets,', marginX + 4, curY + 29);
doc.text('  and Customers requiring official GST Tax Invoices.', marginX + 4, curY + 33.5);
doc.text('• Transport / E-Way: Includes Transporter GSTIN & Vehicle No.', marginX + 4, curY + 38);
doc.text('• Output: Legally compliant Tax Invoice with QR Code.', marginX + 4, curY + 42.5);

// Card 2: Goodwin Batteries 2 (Without GST)
drawCard(marginX + cardW + 6, curY, cardW, 46, COLORS.white, COLORS.orange);
doc.setFillColor(...COLORS.orange);
doc.roundedRect(marginX + cardW + 6, curY, cardW, 6.5, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.white);
doc.text('GOODWIN BATTERIES 2 (WITHOUT GST)', marginX + cardW + 10, curY + 4.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(...COLORS.body);
doc.text('• Entity Type: Simplified Retail / Bill of Supply Entity', marginX + cardW + 10, curY + 11);
doc.text('• Invoice Prefix: GB2-INV-YYYYMMDD-XXXX', marginX + cardW + 10, curY + 15.5);
doc.text('• Tax Compliance: Zero Tax breakdown shown.', marginX + cardW + 10, curY + 20);
doc.text('  Simplified net pricing for walk-in retail consumers.', marginX + cardW + 10, curY + 24.5);
doc.text('• Target Customers: Walk-in retail consumers, individual', marginX + cardW + 10, curY + 29);
doc.text('  battery buyers, and preliminary Quotation estimates.', marginX + cardW + 10, curY + 33.5);
doc.text('• Key Feature: Quick billing with minimum required fields.', marginX + cardW + 10, curY + 38);
doc.text('• Switching: Use top-header dropdown to select company.', marginX + cardW + 10, curY + 42.5);

drawPageFooter(1);

// ============================================================================
// PAGE 2: COMPLETE INVOICING & BILLING WORKFLOW (STEP-BY-STEP)
// ============================================================================
doc.addPage();
drawPageHeader(2);

curY = 16;
curY = drawSectionTitle(curY, 4, 'STEP-BY-STEP INVOICING & BILLING WORKFLOW', 'CRITICAL WORKFLOW');

// Workflow Introduction Card
drawCard(marginX, curY, contentWidth, 14, COLORS.lightBg, COLORS.border);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...COLORS.navy);
doc.text('STANDARD OPERATING PROCEDURE FOR GENERATING INVOICES:', marginX + 4, curY + 4.5);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.body);
doc.text('Follow these six sequential steps for every customer transaction. Skipping steps leads to inventory and accounting discrepancies.', marginX + 4, curY + 9.5);

curY += 17;

// 6 Detailed Steps
const steps = [
  {
    stepNum: 'STEP 1',
    title: 'Select Active Company & Open Bill Modal',
    color: COLORS.indigo,
    badge: 'Check Entity First',
    instructions: [
      '• Verify the active company indicator in the top header (Goodwin Batteries vs Goodwin Batteries 2).',
      '• If billing a GST customer, ensure "Goodwin Batteries" is selected.',
      '• Click the orange "+ Create GST Bill" or "+ Create Bill" button from the sidebar or dashboard.',
    ],
  },
  {
    stepNum: 'STEP 2',
    title: 'Select Employee / Sales Rep Attribution (MANDATORY)',
    color: COLORS.orange,
    badge: 'Crucial for Target Tracking',
    instructions: [
      '• In the bill header, locate the "Employee / Sales Rep" dropdown field.',
      '• ALWAYS select your own name (e.g., Rahul Sharma). Never leave it unassigned or select another staff member.',
      '• Why? All sales revenue and cash/UPI collections will be officially credited to your personal employee tracker!',
    ],
  },
  {
    stepNum: 'STEP 3',
    title: 'Customer Selection & Automatic Party Creation',
    color: COLORS.navy,
    badge: 'Auto Khata Integration',
    instructions: [
      '• Search Existing Customer: Type customer name or mobile number in the searchable party field.',
      '• Create New Customer: If customer is new, type their name, mobile number, and billing address.',
      '• Automatic Khata Sync: The system automatically registers the new customer into the Parties Khata upon bill generation!',
      '• For GST bills: Verify customer GSTIN if they claim Input Tax Credit (ITC).',
    ],
  },
  {
    stepNum: 'STEP 4',
    title: 'Product Selection Using Searchable Dropdown',
    color: COLORS.indigo,
    badge: 'Type to Search Feature',
    instructions: [
      '• Click on the item search field. Type any part of the Product Name, SKU, HSN, or Battery Capacity (e.g. "Exide 150Ah").',
      '• Check the stock pill: The dropdown displays live available stock (e.g., "14 in stock"). Do not bill out-of-stock items!',
      '• Enter Quantity and Unit Price. If any special discount was pre-approved by the manager, enter the discount percentage.',
      '• Click "+ Add Item" to append additional batteries, inverters, trolleys, or accessories to the invoice.',
    ],
  },
  {
    stepNum: 'STEP 5',
    title: 'Payment Status & Partial Collection Tracking',
    color: COLORS.amber,
    badge: 'Financial Accuracy',
    instructions: [
      '• Paid (Full Payment): Select Payment Mode (Cash, UPI/QR, Bank Transfer). The full amount is credited to collections.',
      '• Partial Payment: Enter the exact amount collected now (e.g., Received ₹2,000 on a ₹21,880 bill).',
      '  -> The ₹2,000 is credited to your "Got Money / Paid" figure. The pending ₹19,880 is automatically posted to customer Khata.',
      '• Unpaid (Credit Sale): Select "Unpaid". Only authorized credit customers are eligible. Full bill value is added to Khata Due.',
    ],
  },
  {
    stepNum: 'STEP 6',
    title: 'Review, Generate & Share Invoice',
    color: COLORS.green,
    badge: 'Final Handover',
    instructions: [
      '• Click "Generate Invoice". The invoice number is sequentially generated and stock is immediately decremented.',
      '• Options Available: "Print Invoice" (Standard A4 Thermal/Laser format), "Download PDF", or "Share on WhatsApp".',
      '• Hand over the printed invoice or send the PDF link to the customer before releasing battery merchandise.',
    ],
  },
];

steps.forEach((st) => {
  const boxH = 26;
  drawCard(marginX, curY, contentWidth, boxH, COLORS.white, COLORS.border);

  // Step Header bar inside card
  doc.setFillColor(...st.color);
  doc.roundedRect(marginX, curY, 24, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.white);
  doc.text(st.stepNum, marginX + 12, curY + 4.2, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.dark);
  doc.text(st.title, marginX + 27, curY + 4.3);

  // Badge
  const bW = 34;
  doc.setFillColor(...COLORS.lightBg);
  doc.roundedRect(pageWidth - marginX - bW - 2, curY + 1, bW, 4.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...st.color);
  doc.text(st.badge, pageWidth - marginX - bW / 2 - 2, curY + 3.8, { align: 'center' });

  // Instructions
  let insY = curY + 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.body);
  st.instructions.forEach((ins) => {
    doc.text(ins, marginX + 4, insY);
    insY += 4.2;
  });

  curY += boxH + 2.5;
});

// Highlight Callout Box: Handling Partial Payments
curY += 1.5;
drawCard(marginX, curY, contentWidth, 22, COLORS.amberBg, COLORS.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...COLORS.amber);
doc.text('IMPORTANT OPERATING RULE: HOW PARTIAL PAYMENTS IMPACT KHATA & YOUR TRACKER', marginX + 4, curY + 5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.dark);
const partialNote =
  'Example: Customer buys an inverter battery worth ₹21,880. Customer pays ₹2,000 cash on the spot and agrees to pay ₹19,880 next week. When creating the bill, set Status to "Partial" and Paid Amount to ₹2,000.\n' +
  '• In your Employee Dashboard: Total Sales Figure = ₹21,880 | Got Money / Paid = ₹2,000 | Money To Be Taken = ₹19,880.\n' +
  '• In Customer Khata: Balance automatically shows ₹19,880 in RED ("Money To Be Taken"). When they pay later, use "Payment In".';
const splitNote = doc.splitTextToSize(partialNote, contentWidth - 8);
doc.text(splitNote, marginX + 4, curY + 9.5);

drawPageFooter(2);

// ============================================================================
// PAGE 3: QUOTATION CONVERSION & PARTIES KHATA MANAGEMENT
// ============================================================================
doc.addPage();
drawPageHeader(3);

curY = 16;
curY = drawSectionTitle(curY, 5, 'QUOTATION / ESTIMATE TO TAX INVOICE LIFECYCLE', 'NO RE-ENTRY');

// Explanation card
drawCard(marginX, curY, contentWidth, 34, COLORS.white, COLORS.border);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...COLORS.navy);
doc.text('Converting Approved Quotations Without Duplicate Entries:', marginX + 4, curY + 5.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.body);
const quoteWorkflow = [
  '1. When a prospective buyer or corporate party requests price estimates, generate a Quotation in the Sales section.',
  '2. A Quotation does NOT deduct inventory and does NOT create a tax liability until formally approved.',
  '3. Once the customer finalizes the order and pays (advance or full), DO NOT CREATE A FRESH INVOICE FROM SCRATCH.',
  '4. Go to "Sales Invoices" -> Locate the Quotation -> Click the "Convert to Tax Invoice" button.',
  '5. The software instantly transforms the estimate into an official Tax Invoice (GW-INV-...), assigns the active invoice serial number, decrements stock from inventory, and records payment directly into the party ledger.',
];
let qY = curY + 10;
quoteWorkflow.forEach((line) => {
  doc.text(line, marginX + 4, qY);
  qY += 4.5;
});

curY += 38;

// SECTION 6: PARTIES KHATA & LEDGER MANAGEMENT
curY = drawSectionTitle(curY, 6, 'PARTIES (KHATA) & LEDGER MANAGEMENT', 'CREDIT CONTROL');

// Balances explanation
drawCard(marginX, curY, contentWidth, 23, COLORS.lightBg, COLORS.border);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...COLORS.navy);
doc.text('Understanding Ledger Balances & Color Coding:', marginX + 4, curY + 5.5);

// Two colored badge boxes
const halfW = (contentWidth - 10) / 2;
// RED: Money To Be Taken
drawCard(marginX + 2, curY + 8, halfW, 12, COLORS.redBg, COLORS.red);
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.red);
doc.text('RED: "MONEY TO BE TAKEN" (RECEIVABLE)', marginX + 5, curY + 12.5);
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(...COLORS.dark);
doc.text('Customer owes money to Goodwin Batteries (Pending dues on bills).', marginX + 5, curY + 17);

// GREEN: Money To Be Given
drawCard(marginX + halfW + 6, curY + 8, halfW, 12, COLORS.greenBg, COLORS.green);
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.green);
doc.text('GREEN: "MONEY TO BE GIVEN" (PAYABLE / ADVANCE)', marginX + halfW + 9, curY + 12.5);
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(...COLORS.dark);
doc.text('Customer has advance balance or Goodwin Batteries owes a refund.', marginX + halfW + 9, curY + 17);

curY += 27;

// Recording Payments in Khata
drawCard(marginX, curY, contentWidth, 38, COLORS.white, COLORS.border);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...COLORS.navy);
doc.text('How to Record Customer Payments (Payment In & Payment Out):', marginX + 4, curY + 5.5);

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.green);
doc.text('• RECORDING "PAYMENT IN" (Clearing Dues):', marginX + 4, curY + 11);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(...COLORS.body);
doc.text('  1. Navigate to "Parties (Khata)" and search for the customer by name or phone.', marginX + 4, curY + 15);
doc.text('  2. Click on the customer name to open their complete transaction ledger.', marginX + 4, curY + 19);
doc.text('  3. Click the green "+ Payment In" button.', marginX + 4, curY + 23);
doc.text('  4. Enter the Amount Received, Payment Date, Payment Mode (Cash / UPI / Bank / Cheque), and Reference No.', marginX + 4, curY + 27);
doc.text('  5. Click "Save Payment". The customer\'s RED due balance decreases immediately in real time.', marginX + 4, curY + 31);
doc.text('  6. Never create a dummy invoice just to record a payment! Always use the "+ Payment In" voucher.', marginX + 4, curY + 35);

curY += 42;

// Customer Statement & Recent Section Policy
drawCard(marginX, curY, contentWidth, 38, COLORS.lightBg, COLORS.border);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...COLORS.navy);
doc.text('Customer Statements & Deleted Invoice Handling:', marginX + 4, curY + 5.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(...COLORS.body);
const stmtRules = [
  '• Downloading Account Statement: Click "Download Statement (PDF)" inside the party profile to produce an official chronological statement showing all invoices, payments, and running balance for payment reconciliation.',
  '• WhatsApp Reminders: Use the "Share Statement" link to send an automated payment summary directly to the customer\'s mobile.',
  '• Deleted Invoices Policy: If an invoice was cancelled or deleted by an administrator, the software automatically removes all associated entries and orphaned receipts from the customer\'s Recent Section and ledger calculations.',
  '• Accuracy Guarantee: Customer ledger balances reflect only active, verified transactions.',
];
let sY = curY + 11;
stmtRules.forEach((rule) => {
  const splitRule = doc.splitTextToSize(rule, contentWidth - 8);
  doc.text(splitRule, marginX + 4, sY);
  sY += splitRule.length * 4.2;
});

drawPageFooter(3);

// ============================================================================
// PAGE 4: PERFORMANCE DASHBOARD, INVENTORY & STAFF BEST PRACTICES
// ============================================================================
doc.addPage();
drawPageHeader(4);

curY = 16;
curY = drawSectionTitle(curY, 7, 'EMPLOYEE PERFORMANCE TRACKER & DASHBOARD', 'SELF-AUDIT');

// Tracker Table & Explanation
drawCard(marginX, curY, contentWidth, 36, COLORS.white, COLORS.border);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...COLORS.navy);
doc.text('Understanding Your Performance Metrics on the Dashboard & Sales Page:', marginX + 4, curY + 5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(...COLORS.body);
const trackerMetrics = [
  '• Date Range Filters: Use "All Time", "This Month", "Last Month", or custom "From Date - To Date" to review sales targets.',
  '• Bills & Estimates: Number of total vouchers generated by you in the selected date window.',
  '• Total Sales Figure (₹): The total gross value of goods billed under your employee ID.',
  '• Got Money / Paid (₹): Actual hard cash and verified bank/UPI amounts collected and submitted by you.',
  '• Money To Be Taken (₹): Uncollected credit amounts on your bills. High dues indicate slow customer collection.',
  '• Collection % Ratio: Your collection efficiency (Formula: [Got Money ÷ Total Sales] × 100). Target: Maintain 85% or higher!',
  '• Confidentiality: You will only see your own performance numbers. Company-wide figures are restricted to Management.',
];
let tY = curY + 10;
trackerMetrics.forEach((tm) => {
  doc.text(tm, marginX + 4, tY);
  tY += 3.8;
});

curY += 40;

// SECTION 8: INVENTORY MANAGEMENT & STOCK AUDIT
curY = drawSectionTitle(curY, 8, 'INVENTORY & STOCK RULES');

drawCard(marginX, curY, contentWidth, 24, COLORS.lightBg, COLORS.border);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...COLORS.navy);
doc.text('Guidelines for Stock & Battery Handling:', marginX + 4, curY + 5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(...COLORS.body);
const invRules = [
  '• Checking Stock: Open "Items & Stock" before committing bulk battery orders to verify available warehouse stock.',
  '• Low Stock Badges: Products highlighted in amber/red have fallen below the minimum safety threshold (e.g., < 5 units). Notify store manager immediately.',
  '• Old Battery Scrap / Buyback: When a customer exchanges an old battery, inspect scrap weight/plates, calculate the agreed scrap allowance, record it in the invoice notes, and apply the scrap discount before finalizing the bill.',
];
let iY = curY + 10;
invRules.forEach((ir) => {
  const splitIr = doc.splitTextToSize(ir, contentWidth - 8);
  doc.text(splitIr, marginX + 4, iY);
  iY += splitIr.length * 4.2;
});

curY += 28;

// SECTION 9: DO'S AND DON'TS TABLE
curY = drawSectionTitle(curY, 9, 'STAFF CODE OF CONDUCT: DOS AND DONTS', 'MANDATORY COMPLIANCE');

const dosW = (contentWidth - 6) / 2;
// DOS Card
drawCard(marginX, curY, dosW, 46, COLORS.greenBg, COLORS.green);
doc.setFillColor(...COLORS.green);
doc.roundedRect(marginX, curY, dosW, 6, 1.5, 1.5, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.white);
doc.text('DO\'S (BEST PRACTICES)', marginX + 4, curY + 4.2);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(...COLORS.dark);
const dos = [
  '✓ ALWAYS select your own name in the Employee dropdown.',
  '✓ Search customer mobile first to avoid creating duplicate accounts.',
  '✓ Enter the exact partial cash/UPI received at the time of sale.',
  '✓ Double check battery warranty serial number on physical box.',
  '✓ Issue official GST Tax Invoice for all commercial clients.',
  '✓ Use "+ Payment In" when customers clear overdue balances.',
  '✓ Review your personal sales figures daily before closing store.',
  '✓ Log out of the ERP system when stepping away from the counter.',
];
let dY = curY + 10;
dos.forEach((d) => {
  doc.text(d, marginX + 4, dY);
  dY += 4.2;
});

// DONTS Card
drawCard(marginX + dosW + 6, curY, dosW, 46, COLORS.redBg, COLORS.red);
doc.setFillColor(...COLORS.red);
doc.roundedRect(marginX + dosW + 6, curY, dosW, 6, 1.5, 1.5, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.white);
doc.text('DON\'TS (STRICTLY PROHIBITED)', marginX + dosW + 10, curY + 4.2);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(...COLORS.dark);
const donts = [
  '✗ NEVER bill under another employee\'s name or leave it unassigned.',
  '✗ NEVER bill items that show zero available stock in the system.',
  '✗ NEVER create a fake invoice just to record a payment collection.',
  '✗ NEVER re-type an approved Quotation (use "Convert to Tax Invoice").',
  '✗ NEVER modify invoice dates to artificially inflate month-end stats.',
  '✗ NEVER release credit goods to unapproved parties without manager sign-off.',
  '✗ NEVER share your personal user login or password with anyone.',
  '✗ NEVER delete invoices without prior authorization from the Admin.',
];
let dtY = curY + 10;
donts.forEach((dt) => {
  doc.text(dt, marginX + dosW + 10, dtY);
  dtY += 4.2;
});

curY += 50;

// Administrative Sign-off Box
drawCard(marginX, curY, contentWidth, 14, COLORS.cardBg, COLORS.border);
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.navy);
doc.text('ACKNOWLEDGEMENT & COMPLIANCE:', marginX + 4, curY + 4.5);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(...COLORS.body);
doc.text('By using the Goodwin Batteries ERP platform, employees confirm they have read, understood, and agreed to adhere to this SOP.', marginX + 4, curY + 8.5);
doc.text('For system issues, password resets, or authorization requests, contact the Store Administrator or IT Helpdesk.', marginX + 4, curY + 12);

drawPageFooter(4);

// Write output PDF files
const outputDir = path.resolve('public');
const publicPdfPath = path.join(outputDir, 'Goodwin_Batteries_Employee_SOP.pdf');
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

fs.writeFileSync(publicPdfPath, pdfBuffer);
console.log(`Saved public SOP PDF to: ${publicPdfPath} (${pdfBuffer.length} bytes)`);

// Also save to artifact directory if provided
const artifactDir = '/Users/anshchourasiya/.gemini/antigravity/brain/739fc90e-7a55-44fc-9693-06503abd91c4';
if (fs.existsSync(artifactDir)) {
  const artifactPdfPath = path.join(artifactDir, 'Goodwin_Batteries_Employee_SOP.pdf');
  fs.writeFileSync(artifactPdfPath, pdfBuffer);
  console.log(`Saved artifact SOP PDF to: ${artifactPdfPath}`);
}
