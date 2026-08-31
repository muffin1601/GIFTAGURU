"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Minus, Plus, Upload, X } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/components/cart/CartProvider";
import { PERSONALIZATION_MAX_LENGTH, buildWhatsAppUrl } from "@/lib/config/store";
import { checkDeliveryAvailability } from "@/lib/services/delivery";
import { formatPrice } from "@/lib/utils";
import { resolveUnitPrice } from "@/lib/pricing";
import ProductEnquiryButton from "@/components/lead/ProductEnquiryButton";

interface UploadedLogo {
  url: string;
  fileName: string;
  storage?: string;
}

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const {
    addItem,
    giftWrapPrice,
    minOrderQuantity,
    minOrderQuantityMessage,
    shippingMessage,
    shippingTimeline,
  } = useCart();
  const minimumQuantity = Math.max(product.minQuantity, minOrderQuantity);
  const [quantity, setQuantity] = useState(minimumQuantity);
  const [personalizationText, setPersonalizationText] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [logo, setLogo] = useState<UploadedLogo | null>(null);
  const [logoState, setLogoState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [logoError, setLogoError] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState("");
  // Before a PIN is checked, show the general timeline; checkDeliveryAvailability
  // below builds the fuller "<shippingMessage>. <shippingTimeline>." message.
  const [deliveryMessage, setDeliveryMessage] = useState(shippingTimeline);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const validQuantity = quantity >= minimumQuantity;
  const whatsappHref = buildWhatsAppUrl(
    `Hi Gifta Guru, I want to enquire about ${product.name}. Quantity: ${quantity}.`,
  );
  const unitPrice = resolveUnitPrice(product.price ?? 0, product.priceTiers, quantity);
  const lineTotal = unitPrice * quantity;

  const cartOptions = {
    quantity,
    personalizationText,
    logoUrl: logo?.url,
    logoFileName: logo?.fileName,
    giftWrap,
  };

  function addConfiguredItem() {
    if (!validQuantity) {
      setCartMessage(minOrderQuantityMessage);
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
    <div className="flex flex-col gap-8">
      {/* Quantity ---------------------------------------------------------- */}
      <div>
        <label className="field-label" htmlFor="quantity">
          Quantity
        </label>
        <div className="mt-2.5 inline-flex h-12 items-center border border-line bg-surface">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="px-4 text-navy-950 transition-colors duration-200 hover:text-gold-600"
            onClick={() => setQuantity((value) => Math.max(minimumQuantity, value - 1))}
          >
            <Minus className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          </button>
          <input
            id="quantity"
            type="number"
            min={minimumQuantity}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-20 bg-transparent text-center text-sm font-semibold outline-none"
          />
          <button
            type="button"
            aria-label="Increase quantity"
            className="px-4 text-navy-950 transition-colors duration-200 hover:text-gold-600"
            onClick={() => setQuantity((value) => value + 1)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          </button>
        </div>

        <p className="field-hint mt-2.5">Minimum order quantity: {minimumQuantity} units</p>

        {validQuantity ? (
          <p className="mt-2 text-sm font-semibold text-navy-950">
            {formatPrice(unitPrice)} / unit &middot; {formatPrice(lineTotal)} total for {quantity}
          </p>
        ) : (
          <p className="field-error mt-2">{minOrderQuantityMessage}</p>
        )}
      </div>

      {/* Customization ----------------------------------------------------- */}
      <div className="border-t border-line pt-8">
        <h2 className="type-eyebrow">Customize for your company</h2>
        <p className="type-body mt-2 max-w-md">
          Upload logo artwork, add personalization text and choose wrap preferences. We share a
          branding proof before production.
        </p>

        <div className="mt-6 flex flex-col gap-5">
          <div className="field">
            <label className="field-label" htmlFor="logo">
              Company logo
            </label>
            <input
              id="logo"
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={(event) => void uploadLogo(event.target.files?.[0])}
              className="field-input file:mr-3 file:border file:border-line file:bg-sunken file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-navy-950"
            />
            {logoState === "uploading" ? (
              <span className="field-hint flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" strokeWidth={1.5} /> Uploading&hellip;
              </span>
            ) : null}
            {logoState === "success" && logo ? (
              <span className="flex items-center justify-between gap-3 text-xs text-navy-950">
                <span className="flex items-center gap-1.5">
                  <Upload className="h-3 w-3" aria-hidden="true" strokeWidth={1.5} /> {logo.fileName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLogo(null);
                    setLogoState("idle");
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-ink-500 transition-colors duration-200 hover:text-navy-950"
                >
                  <X className="h-3 w-3" aria-hidden="true" strokeWidth={1.5} /> Remove
                </button>
              </span>
            ) : null}
            {logoError ? <span className="field-error">{logoError}</span> : null}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="personalization">
              Personalization text
            </label>
            <input
              id="personalization"
              value={personalizationText}
              maxLength={PERSONALIZATION_MAX_LENGTH}
              onChange={(event) => setPersonalizationText(event.target.value)}
              placeholder={`Up to ${PERSONALIZATION_MAX_LENGTH} characters`}
              className="field-input"
            />
            <span className="field-hint">
              {personalizationText.length}/{PERSONALIZATION_MAX_LENGTH}
            </span>
          </div>

          <label className="flex items-center justify-between gap-4 border-y border-line py-4">
            <span>
              <span className="block text-sm font-medium text-navy-950">Gift wrap</span>
              <span className="field-hint">{formatPrice(giftWrapPrice)} per cart item</span>
            </span>
            <input
              type="checkbox"
              checked={giftWrap}
              onChange={(event) => setGiftWrap(event.target.checked)}
              className="h-4 w-4 shrink-0 accent-navy-950"
            />
          </label>
        </div>
      </div>

      {/* Delivery ---------------------------------------------------------- */}
      <div className="field">
        <label className="field-label" htmlFor="pinCode">
          Delivery PIN code
        </label>
        <div className="flex gap-2">
          <input
            id="pinCode"
            value={pinCode}
            onChange={(event) => setPinCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit PIN"
            inputMode="numeric"
            className="field-input min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={() =>
              setDeliveryMessage(checkDeliveryAvailability(pinCode, shippingMessage, shippingTimeline).message)
            }
            className="btn btn-secondary shrink-0"
          >
            Check
          </button>
        </div>
        <p className="field-hint">{deliveryMessage}</p>
      </div>

      {/* Actions ----------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={addConfiguredItem} className="btn btn-primary flex-1">
          Add to Cart
        </button>
        <button
          type="button"
          onClick={() => {
            if (addConfiguredItem()) router.push("/checkout");
          }}
          className="btn btn-secondary flex-1"
        >
          Buy Now
        </button>
      </div>

      {cartMessage ? (
        <p role="status" className="text-sm font-medium text-navy-950">
          {cartMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6 text-sm font-medium">
        <ProductEnquiryButton product={product} />
        <Link
          href={`/bulk-enquiry?product=${encodeURIComponent(product.name)}`}
          className="link-underline text-navy-950"
        >
          Request a Quote
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-navy-950 transition-colors duration-200 hover:text-gold-600"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
