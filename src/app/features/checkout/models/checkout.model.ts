import { BasketItem } from '@core/models/basket.model';
import { Product } from '@core/models/product.model';

/**
 * Shipping information collected during checkout
 */
export interface ShippingInfo {
  fullName: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
}

/**
 * Payment information collected during checkout
 */
export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string; // Format: MM/YY
  cvv: string;
  cardholderName: string;
}

/**
 * Complete checkout form value structure
 */
export interface CheckoutFormValue {
  shipping: ShippingInfo;
  payment: PaymentInfo;
}

/**
 * Order summary data for display
 */
export interface OrderSummary {
  items: BasketItem<Product>[];
  subtotal: number;
  total: number;
  itemCount: number;
}

/**
 * Result of order processing
 */
export interface OrderResult {
  success: boolean;
  orderId?: string;
  message: string;
  timestamp: number;
}
