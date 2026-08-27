export type UserRole = "customer" | "admin";
export type ProductStatus = "draft" | "active" | "archived";
export type CartStatus = "active" | "merged" | "converted" | "abandoned";
export type OrderStatus = "pending" | "paid" | "processing" | "fulfilled" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentRecordStatus = "created" | "authorized" | "captured" | "failed" | "refunded";
export type CustomizationRequestStatus = "pending" | "in_review" | "approved" | "rejected" | "completed";
export type CustomizationType = "logo_upload" | "personalization_text" | "gift_message" | "gift_wrap";
export type DiscountType = "percentage" | "fixed";
export type QuoteStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export interface CartItemCustomization {
  logo_url?: string;
  personalization_text?: string;
  gift_message?: string;
  gift_wrap?: boolean;
}

export interface OrderAddressSnapshot {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

type Row<T> = T;
type Insert<T, Optional extends keyof T> = Omit<T, Optional> & Partial<Pick<T, Optional>>;
type Update<T> = Partial<T>;

export interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AddressRow {
  id: string;
  profile_id: string;
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category_id: string | null;
  base_price: number;
  compare_at_price: number | null;
  is_customizable: boolean;
  min_order_quantity: number;
  occasion_tags: string[];
  status: ProductStatus;
  is_featured: boolean;
  avg_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  option1_name: string | null;
  option1_value: string | null;
  option2_name: string | null;
  option2_value: string | null;
  price_override: number | null;
  compare_at_price: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductCollectionMappingRow {
  product_id: string;
  collection_id: string;
}

export interface ProductCustomizationRow {
  id: string;
  product_id: string;
  customization_type: CustomizationType;
  label: string;
  is_required: boolean;
  extra_price: number;
  created_at: string;
}

export interface InventoryRow {
  id: string;
  variant_id: string;
  quantity_available: number;
  quantity_reserved: number;
  low_stock_threshold: number;
  updated_at: string;
}

export interface CartRow {
  id: string;
  user_id: string | null;
  status: CartStatus;
  created_at: string;
  updated_at: string;
}

export interface CartItemRow {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  customization: CartItemCustomization;
  created_at: string;
  updated_at: string;
}

export interface WishlistRow {
  id: string;
  user_id: string;
  created_at: string;
}

export interface WishlistItemRow {
  id: string;
  wishlist_id: string;
  product_id: string;
  created_at: string;
}

export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  phone: string;
  shipping_address: OrderAddressSnapshot;
  billing_address: OrderAddressSnapshot | null;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  notes: string | null;
  gift_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  unit_price: number;
  quantity: number;
  customization: CartItemCustomization;
  line_total: number;
  created_at: string;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  raw_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CustomizationRequestRow {
  id: string;
  user_id: string | null;
  product_id: string | null;
  order_item_id: string | null;
  company_name: string | null;
  logo_url: string | null;
  instructions: string | null;
  quantity: number;
  status: CustomizationRequestStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GiftMessageRow {
  id: string;
  order_id: string | null;
  order_item_id: string | null;
  recipient_name: string | null;
  sender_name: string | null;
  message: string;
  created_at: string;
}

export interface DiscountRow {
  id: string;
  code: string;
  description: string | null;
  type: DiscountType;
  value: number;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscountUsageRow {
  id: string;
  discount_id: string;
  order_id: string;
  user_id: string | null;
  amount_discounted: number;
  created_at: string;
}

export interface BulkQuoteRequestRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  product_interest: string | null;
  quantity: number | null;
  budget_range: string | null;
  occasion: string | null;
  message: string | null;
  status: QuoteStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriberRow {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

export interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string | null;
  order_item_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

type TableDef<R, InsertOptional extends keyof R> = {
  Row: Row<R>;
  Insert: Insert<R, InsertOptional>;
  Update: Update<R>;
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow, "role" | "created_at" | "updated_at" | "full_name" | "phone" | "company_name">;
      addresses: TableDef<AddressRow, "id" | "created_at" | "updated_at" | "label" | "line2" | "is_default" | "country">;
      categories: TableDef<CategoryRow, "id" | "created_at" | "updated_at" | "description" | "image_url" | "sort_order">;
      collections: TableDef<CollectionRow, "id" | "created_at" | "updated_at" | "tagline" | "description" | "image_url" | "is_featured" | "sort_order">;
      products: TableDef<ProductRow, "id" | "created_at" | "updated_at" | "description" | "category_id" | "compare_at_price" | "is_customizable" | "min_order_quantity" | "occasion_tags" | "status" | "is_featured" | "avg_rating" | "review_count">;
      product_variants: TableDef<ProductVariantRow, "id" | "created_at" | "updated_at" | "option1_name" | "option1_value" | "option2_name" | "option2_value" | "price_override" | "compare_at_price" | "is_default">;
      product_images: TableDef<ProductImageRow, "id" | "created_at" | "variant_id" | "alt_text" | "sort_order">;
      product_collection_mappings: TableDef<ProductCollectionMappingRow, never>;
      product_customizations: TableDef<ProductCustomizationRow, "id" | "created_at" | "is_required" | "extra_price">;
      inventory: TableDef<InventoryRow, "id" | "updated_at" | "quantity_available" | "quantity_reserved" | "low_stock_threshold">;
      carts: TableDef<CartRow, "id" | "created_at" | "updated_at" | "user_id" | "status">;
      cart_items: TableDef<CartItemRow, "id" | "created_at" | "updated_at" | "customization">;
      wishlists: TableDef<WishlistRow, "id" | "created_at">;
      wishlist_items: TableDef<WishlistItemRow, "id" | "created_at">;
      orders: TableDef<OrderRow, "id" | "order_number" | "created_at" | "updated_at" | "user_id" | "billing_address" | "discount_total" | "shipping_total" | "tax_total" | "currency" | "status" | "payment_status" | "notes" | "gift_message">;
      order_items: TableDef<OrderItemRow, "id" | "created_at" | "product_id" | "variant_id" | "variant_name" | "customization">;
      payments: TableDef<PaymentRow, "id" | "created_at" | "updated_at" | "razorpay_payment_id" | "razorpay_signature" | "currency" | "status" | "raw_response">;
      customization_requests: TableDef<CustomizationRequestRow, "id" | "created_at" | "updated_at" | "user_id" | "product_id" | "order_item_id" | "company_name" | "logo_url" | "instructions" | "quantity" | "status" | "admin_notes">;
      gift_messages: TableDef<GiftMessageRow, "id" | "created_at" | "order_id" | "order_item_id" | "recipient_name" | "sender_name">;
      discounts: TableDef<DiscountRow, "id" | "created_at" | "updated_at" | "description" | "min_order_value" | "max_uses" | "used_count" | "starts_at" | "expires_at" | "is_active">;
      discount_usage: TableDef<DiscountUsageRow, "id" | "created_at" | "user_id">;
      bulk_quote_requests: TableDef<BulkQuoteRequestRow, "id" | "created_at" | "updated_at" | "company_name" | "product_interest" | "quantity" | "budget_range" | "occasion" | "message" | "status" | "admin_notes">;
      newsletter_subscribers: TableDef<NewsletterSubscriberRow, "id" | "subscribed_at" | "is_active">;
      reviews: TableDef<ReviewRow, "id" | "created_at" | "updated_at" | "user_id" | "order_item_id" | "title" | "body" | "is_approved">;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      product_status: ProductStatus;
      cart_status: CartStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_record_status: PaymentRecordStatus;
      customization_request_status: CustomizationRequestStatus;
      customization_type: CustomizationType;
      discount_type: DiscountType;
      quote_status: QuoteStatus;
    };
  };
}
