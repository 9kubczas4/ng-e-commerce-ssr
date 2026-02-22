/**
 * Minimal product interface for basket items
 * Features can pass their own product types that extend this
 */
export interface BasketProduct {
  id: string;
  price: number;
  discount?: number;
}

export interface BasketItem<T extends BasketProduct = BasketProduct> {
  product: T;
  quantity: number;
}

export interface Basket<T extends BasketProduct = BasketProduct> {
  items: BasketItem<T>[];
  totalPrice: number;
  itemCount: number;
}
