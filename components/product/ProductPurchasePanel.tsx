"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, Heart, Loader2, MessageCircle, Minus, Plus, Truck, Upload, X, Zap } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/components/cart/CartProvider";
import { GIFT_WRAP_PRICE, MIN_ORDER_QUANTITY, MIN_ORDER_QUANTITY_MESSAGE, PERSONALIZATION_MAX_LENGTH, buildWhatsAppUrl } from "@/lib/config/store";
import { checkDeliveryAvailability, DELIVERY_WINDOW } from "@/lib/services/delivery";
import { formatPrice } from "@/lib/utils";
import ProductEnquiryButton from "@/components/lead/ProductEnquiryButton";

interface UploadedLogo {
  url: string;
  fileName: string;
  storage?: string;
}

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const minimumQuantity = Math.max(product.minQuantity, MIN_ORDER_QUANTITY);
  const [quantity, setQuantity] = useState(minimumQuantity);
  const [personalizationText, setPersonalizationText] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [logo, setLogo] = useState<UploadedLogo | null>(null);
  const [logoState, setLogoState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [logoError, setLogoError] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState(DELIVERY_WINDOW);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const validQuantity = quantity >= minimumQuantity;
  const whatsappHref = buildWhatsAppUrl(`Hi Gifta Guru, I want to enquire about ${product.name}. Quantity: ${quantity}.`);

  const cartOptions = {
    quantity,
    personalizationText,
    logoUrl: logo?.url,
    logoFileName: logo?.fileName,
    giftWrap,
  };

  function addConfiguredItem() {
    if (!validQuantity) {
      setCartMessage(MIN_ORDER_QUANTITY_MESSAGE);
      return false;
    }
    addItem(product, cartOptions);
    setCartMessage("Added to cart.");
    return true;
  }

  async function uploadLogo(file: File | undefined) {
    if (!file) return;
    setLogoState("uploading");
    setLogoError(null);
    const formData = new FormData();
    formData.append("logo", file);

    const response = await fetch("/api/uploads/logo", { method: "POST", body: formData });
    const payload = (await response.json()) as UploadedLogo & { error?: string };

    if (!response.ok) {
      setLogo(null);
      setLogoState("error");
      setLogoError(payload.error ?? "Unable to upload logo.");
      return;
    }

    setLogo({ url: payload.url, fileName: payload.fileName, storage: payload.storage });
    setLogoState("success");
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-navy-950" htmlFor="quantity">Quantity</label>
        <div className="mt-2 inline-flex h-12 items-center rounded-full border border-navy-950/15 bg-white">
          <button type="button" aria-label="Decrease quantity" className="px-4" onClick={() => setQuantity((value) => Math.max(minimumQuantity, value - 1))}>
            <Minus className="h-4 w-4" />
          </button>
          <input
            id="quantity"
            type="number"
            min={minimumQuantity}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-20 bg-transparent text-center text-sm font-semibold outline-none"
          />
          <button type="button" aria-label="Increase quantity" className="px-4" onClick={() => setQuantity((value) => value + 1)}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-ink-600">MOQ: {minimumQuantity} products</p>
        {!validQuantity ? <p className="mt-2 text-sm text-red-700">{MIN_ORDER_QUANTITY_MESSAGE}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="rounded-lg border border-navy-950/10 bg-white p-4">
          <span className="block text-sm font-semibold text-navy-950">Company logo</span>
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={(event) => void uploadLogo(event.target.files?.[0])}
            className="mt-3 block w-full text-sm text-ink-700 file:mr-3 file:rounded-full file:border-0 file:bg-cream-200 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy-950"
          />
          {logoState === "uploading" ? <span className="mt-2 flex items-center gap-2 text-xs text-ink-500"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</span> : null}
          {logoState === "success" && logo ? (
            <span className="mt-2 flex items-center justify-between gap-3 text-xs text-green-700">
              <span><Upload className="mr-1 inline h-3 w-3" /> {logo.fileName}</span>
              <button type="button" onClick={() => { setLogo(null); setLogoState("idle"); }} className="inline-flex items-center gap-1 font-semibold text-ink-500 hover:text-navy-950">
                <X className="h-3 w-3" /> Remove
              </button>
            </span>
          ) : null}
          {logoError ? <span className="mt-2 block text-xs text-red-700">{logoError}</span> : null}
        </label>
        <label className="rounded-lg border border-navy-950/10 bg-white p-4">
          <span className="block text-sm font-semibold text-navy-950">Personalization text</span>
          <input
            value={personalizationText}
            maxLength={PERSONALIZATION_MAX_LENGTH}
            onChange={(event) => setPersonalizationText(event.target.value)}
            placeholder="Max 10 chars"
            className="mt-3 w-full rounded-xl border border-navy-950/10 px-3 py-2 text-sm outline-none focus:border-navy-900"
          />
          <span className="mt-2 block text-xs text-ink-500">{personalizationText.length}/{PERSONALIZATION_MAX_LENGTH}</span>
        </label>
      </div>

      <label className="flex items-center justify-between gap-4 rounded-lg border border-navy-950/10 bg-white p-4">
        <span className="flex items-center gap-3">
          <Gift className="h-5 w-5 text-gold-600" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold text-navy-950">Gift wrap</span>
            <span className="text-sm text-ink-600">{formatPrice(GIFT_WRAP_PRICE)} per cart item</span>
          </span>
        </span>
        <input type="checkbox" checked={giftWrap} onChange={(event) => setGiftWrap(event.target.checked)} className="h-5 w-5 accent-navy-950" />
      </label>

      <div className="rounded-lg border border-navy-950/10 bg-white p-4">
        <label className="text-sm font-semibold text-navy-950" htmlFor="pinCode">Delivery PIN code</label>
        <div className="mt-3 flex gap-2">
          <input
            id="pinCode"
            value={pinCode}
            onChange={(event) => setPinCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit PIN"
            inputMode="numeric"
            className="min-w-0 flex-1 rounded-xl border border-navy-950/10 px-3 py-2 text-sm outline-none focus:border-navy-900"
          />
          <button type="button" onClick={() => setDeliveryMessage(checkDeliveryAvailability(pinCode).message)} className="rounded-full bg-cream-200 px-4 text-sm font-semibold text-navy-950 hover:bg-cream-300">
            Check
          </button>
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-ink-600"><Truck className="h-4 w-4 text-gold-600" /> {deliveryMessage}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={addConfiguredItem} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-100 transition-colors hover:bg-navy-800 disabled:opacity-50">
          Add to Cart
        </button>
        <button type="button" onClick={() => { if (addConfiguredItem()) router.push("/checkout"); }} className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400">
          <Zap className="h-4 w-4" />
          Buy Now
        </button>
      </div>
      {cartMessage ? <p className="text-sm font-medium text-navy-950">{cartMessage}</p> : null}
      <div className="flex flex-wrap gap-4">
        <ProductEnquiryButton product={product} />
        <Link href={`/bulk-enquiry?product=${encodeURIComponent(product.name)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-navy-950 hover:text-gold-600">
          Bulk Enquiry
        </Link>
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-navy-950 hover:text-gold-600">
          <MessageCircle className="h-4 w-4" />
          WhatsApp Enquiry
        </a>
      </div>
      <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-navy-950 hover:text-gold-600">
        <Heart className="h-4 w-4" />
        Save to Wishlist
      </button>
    </div>
  );
}
