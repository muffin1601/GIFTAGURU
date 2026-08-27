import { GIFT_WRAP_PRICE, MIN_ORDER_QUANTITY, STORE_CONTACT } from "@/lib/config/store";
import { formatPrice } from "@/lib/utils";

export const chatbotSuggestions = [
  "Explore gift collections",
  "Minimum order quantity",
  "Custom branding",
  "Bulk orders",
  "Delivery",
  "Track my order",
  "Talk to our team",
];

export function getChatbotResponse(input: string) {
  const text = input.toLowerCase();

  if (text.includes("collection") || text.includes("explore")) {
    return {
      answer: "You can explore Joining Gifts, Eco-Friendly Gifts, Premium Gifts, and Luxury Gifts.",
      actions: [
        { label: "Joining Gifts", href: "/categories/joining-gifts" },
        { label: "Eco-Friendly Gifts", href: "/categories/eco-gifts" },
        { label: "Premium Gifts", href: "/categories/premium-gifts" },
        { label: "Luxury Gifts", href: "/categories/luxury-gifts" },
      ],
    };
  }

  if (text.includes("minimum") || text.includes("moq")) {
    return { answer: `Most Gifta Guru products have a minimum order quantity of ${MIN_ORDER_QUANTITY} units.` };
  }

  if (text.includes("branding") || text.includes("custom")) {
    return {
      answer: "Yes, selected products can be customized with your company logo and branding.",
      actions: [{ label: "Request Custom Quote", href: "/bulk-enquiry?type=custom-branding" }],
    };
  }

  if (text.includes("bulk")) {
    return {
      answer: "We support bulk and corporate gifting orders with branding, packaging, and delivery planning.",
      actions: [{ label: "Get Bulk Quote", href: "/bulk-enquiry" }],
    };
  }

  if (text.includes("delivery")) {
    return { answer: "We provide Pan-India delivery for corporate gifting orders." };
  }

  if (text.includes("gift wrap") || text.includes("wrap")) {
    return { answer: `Gift wrap is available for ${formatPrice(GIFT_WRAP_PRICE)} where applicable.` };
  }

  if (text.includes("track")) {
    return { answer: "You can track an order securely using the order number and checkout email.", actions: [{ label: "Track Order", href: "/track-order" }] };
  }

  if (text.includes("talk") || text.includes("contact") || text.includes("team")) {
    return {
      answer: `You can contact our team on WhatsApp at ${STORE_CONTACT.phone} or email ${STORE_CONTACT.email}.`,
      actions: [{ label: "Chat on WhatsApp", href: `https://wa.me/${STORE_CONTACT.whatsappNumber}` }],
    };
  }

  return {
    answer: "I can help with collections, MOQ, custom branding, bulk orders, delivery, tracking, or connecting you with our team.",
    needsLead: true,
  };
}
