import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  elementId?: string;
  filename?: string;
  marginSideMm?: number;
  marginTopMm?: number;
  marginBottomMm?: number;
}

/**
 * Helper: Converts any modern CSS color function (oklch, oklab, lab, lch, color)
 * into standard hex/rgba using an offscreen 2D canvas so html2canvas never crashes.
 */
function sanitizeModernColorsInString(cssText: string, ctx: CanvasRenderingContext2D | null): string {
  if (!cssText || !ctx) return cssText;
  const colorFnRegex = /(?:oklch|oklab|lch|lab|color)\([^)]+\)/gi;
  return cssText.replace(colorFnRegex, (match) => {
    try {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = match;
      return ctx.fillStyle || '#1e293b';
    } catch {
      return '#1e293b';
    }
  });
}

/**
 * Captures ONLY the specified HTML element (isolated in an offscreen container so
 * background pages/tables behind modals are never included) and compiles it into an A4 PDF.
 */
export async function generateInvoicePdfBlob(
  elementId: string = 'printable-invoice',
  filename: string = 'invoice',
  options?: Partial<GeneratePdfOptions>
): Promise<{ blob: Blob; file: File }> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    throw new Error(`Printable element with id "${elementId}" not found in DOM.`);
  }

  const helperCanvas = document.createElement('canvas');
  helperCanvas.width = 1;
  helperCanvas.height = 1;
  const helperCtx = helperCanvas.getContext('2d');

  // Create an isolated offscreen container so html2canvas measures and renders ONLY this element
  // (never capturing the background page behind a fixed modal)
  const tempWrapper = document.createElement('div');
  tempWrapper.id = '__pdf_isolated_wrapper__';
  tempWrapper.style.position = 'fixed';
  tempWrapper.style.left = '-10000px';
  tempWrapper.style.top = '0';
  tempWrapper.style.width = '800px';
  tempWrapper.style.backgroundColor = '#ffffff';
  tempWrapper.style.zIndex = '-9999';
  tempWrapper.style.overflow = 'visible';

  const isolatedClone = sourceElement.cloneNode(true) as HTMLElement;
  isolatedClone.id = `${elementId}-isolated-clone`;
  isolatedClone.style.width = '800px';
  isolatedClone.style.maxWidth = '800px';
  isolatedClone.style.maxHeight = 'none';
  isolatedClone.style.height = 'auto';
  isolatedClone.style.overflow = 'visible';
  isolatedClone.style.boxShadow = 'none';
  isolatedClone.style.margin = '0';

  // Remove any .no-print elements inside the clone
  isolatedClone.querySelectorAll('.no-print').forEach((np) => np.remove());

  tempWrapper.appendChild(isolatedClone);
  document.body.appendChild(tempWrapper);

  try {
    const canvas = await html2canvas(isolatedClone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 800,
      windowWidth: 1024,
      onclone: (clonedDoc) => {
        // 1. Sanitize all <style> tags in clonedDoc so html2canvas never encounters oklch/oklab
        const styleTags = clonedDoc.querySelectorAll('style');
        styleTags.forEach((styleEl) => {
          if (styleEl.textContent) {
            styleEl.textContent = sanitizeModernColorsInString(styleEl.textContent, helperCtx);
          }
        });

        // 2. Inline and sanitize accessible rules from <link rel="stylesheet"> tags
        const linkTags = Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'));
        linkTags.forEach((linkEl) => {
          try {
            const matchingSheet = Array.from(document.styleSheets).find(
              (s) => s.href && s.href === (linkEl as HTMLLinkElement).href
            );
            if (matchingSheet && matchingSheet.cssRules) {
              const rawCss = Array.from(matchingSheet.cssRules)
                .map((r) => r.cssText)
                .join('\n');
              const newStyle = clonedDoc.createElement('style');
              newStyle.textContent = sanitizeModernColorsInString(rawCss, helperCtx);
              linkEl.parentNode?.insertBefore(newStyle, linkEl);
              linkEl.remove();
            }
          } catch {
            // Cross-origin stylesheet; leave as-is
          }
        });
      },
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    const marginX = options?.marginSideMm ?? 12;
    const marginY = options?.marginTopMm ?? 10;
    const marginBottom = options?.marginBottomMm ?? 10;

    const contentWidth = pdfWidth - marginX * 2;
    const contentHeight = pdfHeight - marginY - marginBottom;

    const totalImgHeightMm = (canvas.height * contentWidth) / canvas.width;

    if (totalImgHeightMm <= contentHeight) {
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(
        imgData,
        'JPEG',
        marginX,
        marginY,
        contentWidth,
        totalImgHeightMm,
        undefined,
        'FAST'
      );
    } else {
      const pxPerMm = canvas.width / contentWidth;
      const pagePxHeight = contentHeight * pxPerMm;

      let sourceY = 0;
      let pageIndex = 0;

      while (sourceY < canvas.height) {
        const chunkPxHeight = Math.min(pagePxHeight, canvas.height - sourceY);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = chunkPxHeight;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            chunkPxHeight,
            0,
            0,
            canvas.width,
            chunkPxHeight
          );
        }

        const chunkMmHeight = (chunkPxHeight * contentWidth) / canvas.width;
        const chunkData = pageCanvas.toDataURL('image/jpeg', 0.98);

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          chunkData,
          'JPEG',
          marginX,
          marginY,
          contentWidth,
          chunkMmHeight,
          undefined,
          'FAST'
        );

        sourceY += chunkPxHeight;
        pageIndex++;
      }
    }

    const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    const blob = pdf.output('blob');
    const file = new File([blob], cleanFilename, { type: 'application/pdf' });

    return { blob, file };
  } finally {
    if (tempWrapper.parentNode) {
      tempWrapper.parentNode.removeChild(tempWrapper);
    }
  }
}

/**
 * Directly downloads the rendered document as a PDF file to the user's computer.
 */
export async function downloadInvoicePdf(
  elementId: string = 'printable-invoice',
  filename: string = 'invoice',
  options?: Partial<GeneratePdfOptions>
): Promise<void> {
  const { blob, file } = await generateInvoicePdfBlob(elementId, filename, options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ShareInvoiceOptions {
  elementId?: string;
  invoiceNumber: string;
  partyName: string;
  partyPhone: string;
  totalAmount: number;
  businessName?: string;
  upiId?: string;
  marginSideMm?: number;
}

/**
 * Shares invoice via Web Share API with attached PDF file.
 */
export async function shareInvoicePdfWithWhatsApp({
  elementId = 'printable-invoice',
  invoiceNumber,
  partyName,
  partyPhone,
  totalAmount,
  businessName = 'Goodwin Batteries',
  marginSideMm,
}: ShareInvoiceOptions): Promise<{ sharedVia: 'native-share' | 'whatsapp-with-download' }> {
  const filename = `${invoiceNumber}.pdf`;
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(totalAmount);

  const { file, blob } = await generateInvoicePdfBlob(elementId, filename, {
    marginSideMm,
  });

  const shareText = `Dear ${partyName},\n\nPlease find attached your invoice *${invoiceNumber}* for *${formattedAmount}* from ${businessName}.\n\nThank you for choosing Goodwin Batteries!`;

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Invoice ${invoiceNumber}`,
        text: shareText,
        files: [file],
      });
      return { sharedVia: 'native-share' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { sharedVia: 'native-share' };
      }
      console.warn('Native share failed, falling back to download + WhatsApp:', err);
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const cleanPhone = partyPhone.replace(/\D/g, '');
  const waText = `${shareText}\n\n📎 (Official PDF invoice has been downloaded as "${filename}". Please attach it in this chat.)`;
  const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waText)}`;
  window.open(waUrl, '_blank');

  return { sharedVia: 'whatsapp-with-download' };
}
