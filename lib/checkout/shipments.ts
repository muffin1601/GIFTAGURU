import type { Address } from "@prisma/client";
import type { StoreSettings } from "@/lib/data/store-settings";

/**
 * Groups order lines by destination and prices shipping per destination.
 *
 * Shared by the checkout preview and the order-creation route so the figure
 * the customer sees and the figure they are charged come from one function --
 * the storefront must never compute totals a different way from the server.
 *
 * Deliberately free of `server-only` and of any runtime import: it holds pure
 * functions over plain data, so the client preview and the authoritative
 * server calculation are literally the same code rather than two
 * implementations that can drift.
 */

export interface AddressSnapshot {
  name: string;
  company?: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShipmentLine<T> {
  /** Null means "the order's primary address". */
  addressId: string | null;
  lineTotal: number;
  item: T;
}

export interface ShipmentGroup<T> {
  addressId: string | null;
  label: string | null;
  address: AddressSnapshot;
  items: T[];
  subtotal: number;
  shippingTotal: number;
}

export function toAddressSnapshot(address: Address, company?: string): AddressSnapshot {
  return {
    name: address.fullName,
    company: company || undefined,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? undefined,
    landmark: address.landmark ?? undefined,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country || "IN",
  };
}

/**
 * Builds one group per distinct destination.
 *
 * Shipping is charged per destination and the free-shipping threshold is
 * evaluated against each destination's own subtotal -- splitting a large order
 * across three cities is three deliveries and costs three times as much to
 * fulfil, so one threshold check across the whole order would undercharge.
 */
export function groupIntoShipments<T>({
  lines,
  addresses,
  primaryAddress,
  primaryLabel,
  settings,
}: {
  lines: ShipmentLine<T>[];
  /** Saved addresses the customer may route to, keyed by id. */
  addresses: Map<string, AddressSnapshot & { label: string | null }>;
  /** Destination for lines with no explicit assignment. */
  primaryAddress: AddressSnapshot;
  primaryLabel: string | null;
  /** Narrowed to the two fields that affect shipping, so the client preview
   *  can call this without constructing a full settings object. */
  settings: Pick<StoreSettings, "freeShippingThreshold" | "shippingCharge">;
}): ShipmentGroup<T>[] {
  const groups = new Map<string, ShipmentGroup<T>>();

  for (const line of lines) {
    const resolved = line.addressId ? addresses.get(line.addressId) : undefined;

    // An assignment that no longer resolves (address deleted between adding to
    // cart and paying) falls back to the primary destination rather than
    // failing the order.
    const key = resolved ? line.addressId! : "__primary__";

    let group = groups.get(key);
    if (!group) {
      group = {
        addressId: resolved ? line.addressId : null,
        label: resolved ? resolved.label : primaryLabel,
        address: resolved ?? primaryAddress,
        items: [],
        subtotal: 0,
        shippingTotal: 0,
      };
      groups.set(key, group);
    }

    group.items.push(line.item);
    group.subtotal += line.lineTotal;
  }

  for (const group of groups.values()) {
    group.shippingTotal =
      group.subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCharge;
  }

  return [...groups.values()];
}

/** Order-level shipping is the sum of what each destination costs. */
export function totalShipping<T>(groups: ShipmentGroup<T>[]): number {
  return groups.reduce((sum, group) => sum + group.shippingTotal, 0);
}
