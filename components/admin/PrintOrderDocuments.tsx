"use client";

import { Printer } from "lucide-react";

type Address = {
  name?: string;
  company?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

type PrintItem = { name: string; variant?: string | null; quantity: number; sku?: string | null };
type Shipment = { label?: string | null; address: Address; items: PrintItem[] };

export default function PrintOrderDocuments({
  orderNumber,
  placedAt,
  customerEmail,
  customerPhone,
  total,
  items,
  shippingAddress,
  shipments,
  variant = "panel",
}: {
  orderNumber: string;
  placedAt: string;
  customerEmail: string;
  customerPhone: string;
  total: string;
  items: PrintItem[];
  shippingAddress: Address;
  shipments: Shipment[];
  variant?: "panel" | "slip-button";
}) {
  const openPrintWindow = (title: string, content: string) => {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) return;
    popup.opener = null;

    popup.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>
      @page { size: A4; margin: 12mm; }
      * { box-sizing: border-box; } body { color: #111827; font: 14px/1.45 Arial, sans-serif; margin: 0; }
      h1, h2, p { margin: 0; } .header { border-bottom: 2px solid #111827; display: flex; justify-content: space-between; gap: 20px; padding-bottom: 14px; }
      h1 { font-size: 24px; } h2 { font-size: 14px; letter-spacing: .06em; margin-bottom: 7px; text-transform: uppercase; }
      .muted { color: #4b5563; } .section { margin-top: 22px; } .grid { display: grid; gap: 22px; grid-template-columns: 1fr 1fr; }
      .box { border: 1px solid #9ca3af; padding: 14px; } table { border-collapse: collapse; margin-top: 10px; width: 100%; }
      th, td { border-bottom: 1px solid #d1d5db; padding: 9px 6px; text-align: left; vertical-align: top; } th { background: #f3f4f6; font-size: 12px; text-transform: uppercase; }
      .right { text-align: right; } .slip { border: 2px solid #111827; min-height: 132mm; padding: 14mm; page-break-after: always; }
      .slip:last-child { page-break-after: auto; } .to { font-size: 20px; font-weight: 700; line-height: 1.5; } .order { font-size: 18px; font-weight: 700; }
      @media print { body { print-color-adjust: exact; } }
    </style></head><body>${content}</body></html>`);
    popup.document.close();
    popup.focus();
    window.setTimeout(() => popup.print(), 200);
  };

  const printPackingSlip = () => {
    const itemRows = items.map((item) => `<tr><td><strong>${escapeHtml(item.name)}</strong>${item.variant ? `<br><span class="muted">${escapeHtml(item.variant)}</span>` : ""}${item.sku ? `<br><span class="muted">SKU: ${escapeHtml(item.sku)}</span>` : ""}</td><td class="right">${item.quantity}</td></tr>`).join("");
    openPrintWindow(`Packing slip ${orderNumber}`, `<main><div class="header"><div><h1>Gifta Guru — Packing Slip</h1><p class="muted">Order ${escapeHtml(orderNumber)}</p></div><div class="right"><strong>Placed</strong><br>${escapeHtml(placedAt)}</div></div><div class="grid section"><div class="box"><h2>Ship to</h2>${addressHtml(shippingAddress)}</div><div class="box"><h2>Customer contact</h2><p>${escapeHtml(customerEmail)}</p><p>${escapeHtml(customerPhone)}</p><p style="margin-top:16px"><strong>Order total: ${escapeHtml(total)}</strong></p></div></div><section class="section"><h2>Items to pack</h2><table><thead><tr><th>Item</th><th class="right">Qty</th></tr></thead><tbody>${itemRows}</tbody></table></section></main>`);
  };

  const printAddressSlips = () => {
    const destinations = shipments.length > 0 ? shipments : [{ address: shippingAddress, items }];
    const slips = destinations.map((destination, index) => `<section class="slip"><div class="header"><div><p class="muted">Gifta Guru delivery label</p><p class="order">${escapeHtml(orderNumber)}</p></div><div class="right"><strong>${shipments.length > 1 ? `Package ${index + 1} of ${shipments.length}` : "Delivery address"}</strong><br><span class="muted">${escapeHtml(placedAt)}</span></div></div><div class="section"><h2>Deliver to</h2><div class="to">${addressHtml(destination.address)}</div></div><div class="section"><h2>Package contents</h2><p>${destination.items.map((item) => `${escapeHtml(item.name)} × ${item.quantity}`).join("<br>")}</p></div></section>`).join("");
    openPrintWindow(`Address slip ${orderNumber}`, slips);
  };

  if (variant === "slip-button") {
    return (
      <button type="button" onClick={printAddressSlips} className="inline-flex items-center justify-center gap-1.5 btn btn-primary whitespace-nowrap px-3 py-2 text-xs">
        <Printer className="h-3.5 w-3.5" aria-hidden="true" /> Print slip
      </button>
    );
  }

  return (
    <section className="panel p-5">
      <h2 className="font-display text-xl text-navy-950">Print documents</h2>
      <p className="mt-2 text-sm text-ink-600">Print a packing slip for the box or an address slip to paste on the shipment.</p>
      <div className="mt-4 grid gap-3">
        <button type="button" onClick={printPackingSlip} className="inline-flex items-center justify-center gap-2 btn btn-secondary">
          <Printer className="h-4 w-4" aria-hidden="true" /> Print order details
        </button>
        <button type="button" onClick={printAddressSlips} className="inline-flex items-center justify-center gap-2 btn btn-primary">
          <Printer className="h-4 w-4" aria-hidden="true" /> Print address slip{shipments.length > 1 ? "s" : ""}
        </button>
      </div>
    </section>
  );
}

function addressHtml(address: Address) {
  const cityLine = [address.city, address.state, address.postalCode].filter(isNonEmpty).join(", ");
  return [address.name, address.company, address.line1, address.line2, address.landmark ? `Near ${address.landmark}` : undefined, cityLine, address.country ?? "India"]
    .filter(isNonEmpty)
    .map(escapeHtml)
    .join("<br>");
}

function isNonEmpty(value: string | undefined): value is string {
  return Boolean(value);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}
