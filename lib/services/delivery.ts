export function isValidIndianPinCode(pinCode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pinCode.trim());
}

/**
 * `shippingMessage`/`shippingTimeline` come from live store settings
 * (lib/data/store-settings.ts, editable at /admin/settings) rather than
 * hardcoded strings here, so an admin editing either field actually changes
 * what a customer sees after checking their PIN code.
 */
export function checkDeliveryAvailability(pinCode: string, shippingMessage: string, shippingTimeline: string) {
  const normalizedPinCode = pinCode.trim();

  if (!isValidIndianPinCode(normalizedPinCode)) {
    return {
      available: false,
      message: "Enter a valid 6-digit Indian PIN code.",
      pinCode: normalizedPinCode,
    };
  }

  return {
    available: true,
    message: `${shippingMessage}. ${shippingTimeline}.`,
    pinCode: normalizedPinCode,
  };
}
