/**
 * Product category type
 */
export type Category = 'Apparel' | 'Accessories' | 'Books' | 'Stickers' | 'Electronics';

/**
 * Product interface representing an item in the shop
 */
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discount?: number;
  imageUrl: string;
  category: Category;
}
