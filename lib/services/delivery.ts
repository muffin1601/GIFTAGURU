export const DELIVERY_WINDOW = "Ships within 10-15 days";

export function isValidIndianPinCode(pinCode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pinCode.trim());
}

export function checkDeliveryAvailability(pinCode: string) {
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
    message: `Delivery available across India. ${DELIVERY_WINDOW}.`,
    pinCode: normalizedPinCode,
  };
}
