export const hamperContent = {
  "diwali-signature-hamper": {
    name: "Utsav-on-the-go Hamper",
    intro: "Utsav-on-the-go Hamper is thoughtfully curated with a premium 1200ml tumbler, delicious snacks, and festive candle essentials designed to bring warmth, convenience, and celebration, making it an ideal choice for corporate Diwali gifting, employee appreciation, client gifting, festive celebrations, and premium holiday hampers.",
    features: [
      ["Premium Large Capacity Tumbler", "1200ml tumbler ideal for hydration on the go"],
      ["Healthy Snack Selection", "Includes roasted almonds and California pistachios for a nutritious treat"],
      ["Gourmet Cookie Pack", "Open Secret Cookies (Pack of 6) for a delicious and guilt-free indulgence"],
      ["Artisanal Mithai Candles", "Set of 2 decorative candles inspired by traditional sweets for festive décor"],
      ["Perfect Corporate Diwali Hamper", "Thoughtfully curated for professional and festive gifting"],
      ["Balanced Gift Assortment", "Combines utility, indulgence, and festive elements"],
      ["Ready-to-Gift Packaging", "Elegant presentation suitable for corporate gifting"],
      ["Modern & Festive Appeal", "Blends contemporary lifestyle products with traditional Diwali charm"],
    ],
    specifications: [
      ["Product Name", "Utsav-on-the-go Hamper"], ["Material (Tumbler)", "Stainless Steel / Insulated"],
      ["Capacity (Tumbler)", "1200ml"], ["Usage", "Gifting, Travel, Daily Use, Festive Celebrations"],
      ["Packaging", "Premium Corporate Gift Hamper Box"], ["Net Weight", "Combined Hamper Weight (Approx.)"],
      ["Design", "Modern Festive Corporate Gift Set"],
    ],
    includes: ["Premium Tumbler (1200ml)", "Nutty Gritties Roasted Almonds (40g)", "Nutty Gritties California Pistachios (40g)", "Open Secret Cookies (Pack of 6)", "Artisanal Mithai Candle Set (Set of 2)"],
  },
  "diwali-celebration-hamper": {
    name: "The Diwali Delight Box",
    intro: null,
    features: [
      ["Premium Copper Bottle", "1000ml high-quality copper bottle for a healthy and traditional drinking experience"],
      ["Nutritious Dry Fruits", "Includes roasted almonds and California pistachios for a wholesome festive treat"],
      ["Handcrafted Decorative Diyas", "Set of 2 diyas to enhance Diwali décor and celebrations"],
      ["Luxury Incense Cones", "Phool luxury incense cones for a calming and aromatic festive ambiance"],
      ["Perfect Diwali Gift Hamper", "Thoughtfully curated to celebrate the festival of lights"],
      ["Traditional & Elegant Appeal", "Blends wellness, tradition, and festive charm"],
      ["Ready-to-Gift Packaging", "Ideal for corporate gifting and personal celebrations"],
      ["Balanced Festive Experience", "Combines health, décor, and indulgence in one hamper"],
    ],
    specifications: [
      ["Product Name", "The Diwali Delight Box"], ["Material (Bottle)", "Pure Copper"],
      ["Capacity (Bottle)", "1000ml"], ["Usage", "Drinking, Gifting, Festive Celebrations"],
      ["Packaging", "Premium Gift Hamper Box"], ["Net Weight", "Combined Hamper Weight (Approx.)"],
      ["Design", "Festive Curated Gift Set"],
    ],
    includes: ["Premium Copper Bottle (1000ml)", "Nutty Gritties Roasted Almonds (40g)", "Nutty Gritties California Pistachios (40g)", "2 Handcrafted Decorative Diyas", "Phool Luxury Incense Cones Pack"],
  },
  "diwali-grand-hamper": {
    name: "Shubh Utsav Hamper",
    intro: "Diwali Special: Shubh Utsav Gift Hamper is thoughtfully curated with a premium 340ml travel flask, rich coffee, and gourmet snacks designed to create a festive and indulgent experience, making it a perfect choice for corporate Diwali gifting, employee appreciation, client gifting, festive celebrations, and premium holiday hampers.",
    features: [
      ["Premium Black Travel Flask", "340ml sleek flask ideal for hot and cold beverages on the go"],
      ["Gourmet Snack Selection", "Includes Nutty Gritties Barbeque Almonds & Roasted Pistachios for a rich snacking experience"],
      ["Delicious Cookie Treat", "Open Secret Nutty Cookies for a healthy and tasty indulgence"],
      ["Luxury Chocolate Box", "Set of 4 Ferrero Rocher chocolates for a premium sweet touch"],
      ["Artisan Coffee Experience", "Includes Blue Tokai Coffee Roasters coffee for a refined brew"],
      ["Scented Candle Jar", "Adds a warm and festive ambiance to any space"],
      ["Perfect Diwali Gift Hamper", "Thoughtfully curated for festive celebrations and gifting"],
      ["Ready-to-Gift Packaging", "Elegant presentation ideal for corporate and personal gifting"],
      ["Balanced Gift Assortment", "Combines utility, indulgence, and relaxation in one hamper"],
    ],
    specifications: [
      ["Product Name", "Shubh Utsav Hamper"], ["Material (Flask)", "Stainless Steel (Insulated)"],
      ["Capacity (Flask)", "340ml"], ["Usage", "Gifting, Travel, Festive Celebrations"],
      ["Packaging", "Premium Gift Hamper Box"], ["Net Weight", "Combined Hamper Weight (Approx.)"],
      ["Design", "Festive Curated Gift Set"],
    ],
    includes: ["Black Travel Flask (340ml)", "Open Secret Nutty Cookies (Box)", "Candle Jar", "Nutty Gritties Barbeque Almonds (40g)", "Nutty Gritties Roasted Pistachios (40g)", "Ferrero Rocher Chocolates (Set of 4)", "Blue Tokai Coffee Roasters Coffee (Box)"],
  },
};

export function contentRecord(content) {
  return {
    name: content.name,
    description: content.intro,
    longDescription: content.intro,
    keyFeatures: content.features.map(([title, description]) => ({ title, description })),
    specifications: content.specifications.map(([label, value]) => ({ label, value })),
    packageIncludes: content.includes,
  };
}
