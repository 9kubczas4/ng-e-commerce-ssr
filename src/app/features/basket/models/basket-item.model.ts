import { Product } from '../../products/models/product.model';

export interface BasketItem {
  product: Product;
  quantity: number;
}

export interface Basket {
  items: BasketItem[];
  totalPrice: number;
  itemCount: number;
}
