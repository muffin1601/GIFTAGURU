import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DIRECT_URL or DATABASE_URL before backfilling image-based specifications.");

const exactHamperSlugs = new Set(["diwali-signature-hamper", "diwali-celebration-hamper", "diwali-grand-hamper"]);
const pair = (label, value) => ({ label, value });

function stationery({ productName, components, finish = "Coordinated premium finish", packaging = "Rigid presentation gift box with protective foam insert", notebook = true, folio = false }) {
  const specifications = [
    pair("Product Name", productName),
    pair("Gift Set Format", folio ? "Executive folio and stationery gift set" : "Corporate stationery gift set"),
    pair("Primary Components", components.join(", ")),
    pair("Finish", finish),
    ...(notebook ? [
      pair("Notebook / Diary Size", "Approx. A5"),
      pair("Pages", "Approx. 160 ruled pages"),
      pair("Paper", "Approx. 80 GSM writing paper"),
      pair("Binding", "Hardbound case binding"),
    ] : []),
    pair("Pen Type", "Metal ballpoint pen"),
    pair("Ink Colour", "Blue or black ink"),
    pair("Branding", "Logo printing, laser engraving or debossing, subject to component finish"),
    pair("Packaging", packaging),
    pair("Usage", "Corporate gifting, onboarding, employee appreciation and client gifting"),
  ];
  return { specifications, includes: components.concat(["Presentation gift box"]) };
}

function drinkware({ productName, components, vessel, capacity, finish, extras = [] }) {
  return {
    specifications: [
      pair("Product Name", productName),
      pair("Gift Set Format", "Festive corporate gift hamper"),
      pair("Primary Drinkware", vessel),
      pair("Capacity", capacity),
      pair("Material", "Stainless steel / insulated construction"),
      pair("Finish", finish),
      pair("Packaging", "Premium festive gift hamper box"),
      pair("Branding", "Logo print or laser engraving, subject to component finish"),
      pair("Usage", "Corporate Diwali gifting, employee appreciation and client gifting"),
    ],
    includes: components.concat(extras, ["Premium festive gift box"]),
  };
}

const productDetails = {
  "executive-onboarding-essentials-set": stationery({ productName: "Executive Onboarding Essentials Set", components: ["Blue hardbound diary", "Blue metal ballpoint pen"], finish: "Blue diary with matching blue-and-black pen" }),
  "classic-pen-and-keychain-welcome-set": {
    specifications: [pair("Product Name", "Classic Pen & Keychain Welcome Set"), pair("Gift Set Format", "Compact pen and keychain gift set"), pair("Primary Components", "Metal ballpoint pen and metal keychain"), pair("Pen Type", "Metal ballpoint pen"), pair("Ink Colour", "Blue or black ink"), pair("Keychain Material", "Metal alloy"), pair("Branding", "Laser engraving or logo printing"), pair("Packaging", "Compact presentation gift box"), pair("Usage", "Events, conferences, joining gifts and promotional campaigns")],
    includes: ["Metal ballpoint pen", "Metal keychain", "Presentation gift box"],
  },
  "client-appreciation-desk-set": stationery({ productName: "Client Appreciation Desk Set", components: ["Card holder", "Metal ballpoint pen", "Metal keychain"], notebook: false, finish: "Coordinated executive finish" }),
  "refined-folio-and-pen-gift-set": stationery({ productName: "Refined Folio & Pen Gift Set", components: ["Executive document folio", "Metal ballpoint pen"], folio: true, notebook: false, finish: "Refined executive finish" }),
  "journal-and-matching-pen-set": stationery({ productName: "Journal & Matching Pen Set", components: ["Hardbound journal", "Matching metal ballpoint pen"], finish: "Coordinated journal and pen finish" }),
  "luxury-clutch-executive-set": stationery({ productName: "Luxury Clutch Executive Set", components: ["Executive clutch", "Metal ballpoint pen", "Corporate accessory"], folio: true, notebook: false, finish: "Premium luxury finish" }),
  "green-gold-corporate-stationery-set": stationery({ productName: "Green Gold Corporate Stationery Set", components: ["Green hardbound notebook", "Gold-finish metal ballpoint pen"], finish: "Green and gold coordinated finish" }),
  "black-gold-premium-notebook-set": stationery({ productName: "Black Gold Premium Notebook Set", components: ["Black hardbound notebook", "Gold-finish metal ballpoint pen"], finish: "Black and gold coordinated finish" }),
  "corporate-gift-set-with-notebook": stationery({ productName: "Corporate Gift Set with Notebook", components: ["Hardbound notebook", "Metal ballpoint pen", "Corporate accessory"], finish: "Premium coordinated finish" }),
  "compact-corporate-welcome-kit": stationery({ productName: "Compact Corporate Welcome Kit", components: ["Hardbound notebook", "Metal ballpoint pen"], finish: "Compact professional finish", packaging: "Compact presentation gift box" }),
  "complete-stationery-gift-set": stationery({ productName: "Complete Stationery Gift Set", components: ["Hardbound notebook", "Metal ballpoint pen", "Metal keychain", "Corporate accessory"], finish: "Premium coordinated finish" }),
  "luxury-planner-gift-box": stationery({ productName: "Luxury Planner Gift Box", components: ["Hardbound planner", "Metal ballpoint pen"], finish: "Luxury executive finish", packaging: "Premium rigid gift box with protective foam insert" }),
  "notebook-and-pen-executive-set": stationery({ productName: "Notebook & Pen Executive Set", components: ["Hardbound notebook", "Metal ballpoint pen"], finish: "Executive coordinated finish" }),
  "blue-notebook-welcome-set": stationery({ productName: "Blue Notebook Welcome Set", components: ["Blue hardbound notebook", "Matching metal ballpoint pen"], finish: "Blue coordinated finish" }),
  "burgundy-relationship-gift-set": stationery({ productName: "Burgundy Relationship Gift Set", components: ["Burgundy hardbound notebook", "Metal ballpoint pen", "Corporate accessory"], finish: "Burgundy premium finish" }),
  "wood-finish-premium-gift-set": stationery({ productName: "Wood Finish Premium Gift Set", components: ["Wood-finish notebook", "Metal ballpoint pen", "Corporate accessory"], finish: "Wood-inspired premium finish" }),
  "minimal-notebook-and-pen-set": stationery({ productName: "Minimal Notebook & Pen Set", components: ["Hardbound notebook", "Metal ballpoint pen"], finish: "Minimal contemporary finish", packaging: "Compact presentation gift box" }),
  "sage-green-sustainable-gift-set": stationery({ productName: "Sage Green Sustainable Gift Set", components: ["Sage green notebook", "Metal ballpoint pen", "Corporate accessory"], finish: "Sage green coordinated finish" }),
  "green-eco-notebook-gift-set": stationery({ productName: "Green Eco Notebook Gift Set", components: ["Green notebook", "Metal ballpoint pen"], finish: "Green coordinated finish" }),
  "brown-luxury-stationery-set": stationery({ productName: "Brown Luxury Stationery Set", components: ["Brown hardbound journal", "Metal ballpoint pen", "Corporate accessory"], finish: "Brown luxury finish" }),
  "black-executive-corporate-set": stationery({ productName: "Black Executive Corporate Set", components: ["Black executive notebook", "Metal ballpoint pen", "Corporate accessory"], finish: "Black executive finish" }),
  "grey-folio-and-notebook-set": stationery({ productName: "Grey Folio & Notebook Set", components: ["Grey executive folio", "Hardbound notebook", "Metal ballpoint pen"], folio: true, finish: "Grey executive finish" }),
  "white-premium-corporate-gift-set": stationery({ productName: "White Premium Corporate Gift Set", components: ["White hardbound notebook", "Metal ballpoint pen", "Corporate accessory"], finish: "White premium finish" }),
  "grey-planner-corporate-set": stationery({ productName: "Grey Planner Corporate Set", components: ["Grey hardbound planner", "Black metal ballpoint pen"], finish: "Grey and black coordinated finish" }),
  "white-festive-flask-and-tumbler-hamper": drinkware({ productName: "White Festive Flask & Tumbler Hamper", components: ["White insulated flask", "White insulated tumbler"], vessel: "Stainless steel insulated flask and tumbler", capacity: "Flask approx. 500ml; tumbler approx. 350ml", finish: "White festive finish", extras: ["Festive chocolates", "Decorative diya set"] }),
  "tan-executive-diary-and-flask-gift-set": drinkware({ productName: "Tan Executive Diary & Flask Gift Set", components: ["Tan hardbound diary", "Matching metal ballpoint pen", "Insulated flask"], vessel: "Stainless steel insulated flask", capacity: "Approx. 500ml", finish: "Tan executive finish", extras: ["Diary approx. A5 with 160 ruled pages"] }),
  "white-notebook-and-flask-gift-set": drinkware({ productName: "White Notebook & Flask Gift Set", components: ["White hardbound notebook", "Metal ballpoint pen", "Insulated flask"], vessel: "Stainless steel insulated flask", capacity: "Approx. 500ml", finish: "White premium finish", extras: ["Notebook approx. A5 with 160 ruled pages"] }),
  "copper-festive-bottle-and-diya-hamper": {
    specifications: [pair("Product Name", "Copper Festive Bottle & Diya Hamper"), pair("Gift Set Format", "Festive corporate gift hamper"), pair("Primary Drinkware", "Copper bottle"), pair("Capacity", "Approx. 750ml"), pair("Material", "Copper bottle with decorative diya set"), pair("Packaging", "Premium festive gift hamper box"), pair("Branding", "Logo engraving or print, subject to bottle finish"), pair("Usage", "Corporate Diwali gifting, employee appreciation and client gifting")],
    includes: ["Copper bottle (approx. 750ml)", "Decorative diya set", "Festive treats", "Premium festive gift box"],
  },
  "copper-celebration-hamper": {
    specifications: [pair("Product Name", "Copper Celebration Hamper"), pair("Gift Set Format", "Festive corporate gift hamper"), pair("Primary Drinkware", "Copper-finish tumbler"), pair("Capacity", "Approx. 350ml"), pair("Material", "Copper-finish drinkware with festive accessories"), pair("Packaging", "Premium festive gift hamper box"), pair("Branding", "Logo engraving or print, subject to component finish"), pair("Usage", "Corporate Diwali gifting, employee appreciation and client gifting")],
    includes: ["Copper-finish tumbler (approx. 350ml)", "Festive treats", "Decorative diya set", "Premium festive gift box"],
  },
  "black-festive-flask-and-cookie-hamper": drinkware({ productName: "Black Festive Flask & Cookie Hamper", components: ["Black insulated flask"], vessel: "Stainless steel insulated flask", capacity: "Approx. 500ml", finish: "Black festive finish", extras: ["Gourmet cookie pack", "Festive chocolates", "Decorative diya set"] }),
  "black-celebration-flask-and-mug-hamper": drinkware({ productName: "Black Celebration Flask & Mug Hamper", components: ["Black insulated flask", "Black insulated mug"], vessel: "Stainless steel insulated flask and mug", capacity: "Flask approx. 500ml; mug approx. 350ml", finish: "Black festive finish", extras: ["Festive chocolates", "Decorative diya set"] }),
  "executive-black-mug-and-diary-gift-box": drinkware({ productName: "Executive Black Mug & Diary Gift Box", components: ["Black hardbound diary", "Black insulated mug", "Metal ballpoint pen"], vessel: "Stainless steel insulated mug", capacity: "Approx. 350ml", finish: "Black executive finish", extras: ["Diary approx. A5 with 160 ruled pages", "Festive chocolates", "Decorative diya set"] }),
  "premium-diya-and-glass-gift-box": {
    specifications: [pair("Product Name", "Premium Diya & Glass Gift Box"), pair("Gift Set Format", "Premium festive gift box"), pair("Primary Components", "Glass containers and decorative diya set"), pair("Glass Capacity", "Approx. 250ml each"), pair("Material", "Glass containers with decorative festive accessories"), pair("Packaging", "Premium rigid gift box"), pair("Branding", "Logo print on outer box or message card"), pair("Usage", "Corporate Diwali gifting, client gifting and festive celebrations")],
    includes: ["Two glass containers (approx. 250ml each)", "Decorative diya set", "Festive accessories", "Premium rigid gift box"],
  },
};

const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 });
try {
  const products = await pool.query("select id, slug, name from public.products where status = 'active' order by slug");
  const missing = products.rows.filter((product) => !exactHamperSlugs.has(product.slug) && !productDetails[product.slug]);
  if (missing.length) throw new Error(`No image specification mapping for: ${missing.map((product) => product.slug).join(", ")}`);

  for (const product of products.rows) {
    if (exactHamperSlugs.has(product.slug)) {
      console.log(`Preserved supplied specification: ${product.slug}`);
      continue;
    }
    const detail = productDetails[product.slug];
    await pool.query(
      `update public.products set specifications = $2::jsonb, package_includes = $3::jsonb,
       content_source = 'Product gallery review and realistic catalogue specifications', updated_at = now()
       where id = $1`,
      [product.id, JSON.stringify(detail.specifications), JSON.stringify(detail.includes)],
    );
    console.log(`Updated specifications: ${product.slug}`);
  }
} finally {
  await pool.end();
}
