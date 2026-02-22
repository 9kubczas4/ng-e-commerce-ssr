import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BasketSidebarComponent } from './basket-sidebar.component';
import { BasketService } from '../../../../core/services/basket.service';
import { signal } from '@angular/core';
import { Basket } from '../../models/basket-item.model';
import { Product } from '../../../products/models/product.model';

describe('BasketSidebarComponent - Responsive Behavior', () => {
  let component: BasketSidebarComponent;
  let fixture: ComponentFixture<BasketSidebarComponent>;
  let compiled: HTMLElement;
  let mockBasketService: {
    basket: ReturnType<typeof signal<Basket>>;
    removeItem: ReturnType<typeof vi.fn>;
    updateQuantity: ReturnType<typeof vi.fn>;
  };

  const mockProduct: Product = {
    id: 'product-1',
    title: 'Angular T-Shirt',
    description: 'Premium Angular branded t-shirt',
    price: 29.99,
    discount: 10,
    imageUrl: '/assets/tshirt.jpg',
    category: 'Apparel'
  };

  const basketWithItems: Basket = {
    items: [
      { product: mockProduct, quantity: 2 }
    ],
    totalPrice: 53.98,
    itemCount: 2
  };

  beforeEach(async () => {
    const basketSignal = signal<Basket>(basketWithItems);
    mockBasketService = {
      basket: basketSignal.asReadonly(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BasketSidebarComponent],
      providers: [
        { provide: BasketService, useValue: mockBasketService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BasketSidebarComponent);
    component = fixture.componentInstance;
    component.open(); // Open sidebar for testing
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  describe('Mobile Layout Structure', () => {
    it('should render basket sidebar container', () => {
      const sidebar = compiled.querySelector('.basket-sidebar');
      expect(sidebar).toBeTruthy();
    });

    it('should have fixed positioning', () => {
      const sidebar = compiled.querySelector('.basket-sidebar') as HTMLElement;
      const styles = window.getComputedStyle(sidebar);

      expect(styles.position).toBe('fixed');
    });

    it('should render basket overlay', () => {
      const overlay = compiled.querySelector('.basket-overlay');
      expect(overlay).toBeTruthy();
    });

    it('should have overlay with fixed positioning', () => {
      const overlay = compiled.querySelector('.basket-overlay') as HTMLElement;
      const styles = window.getComputedStyle(overlay);

      expect(styles.position).toBe('fixed');
    });

    it('should render basket header', () => {
      const header = compiled.querySelector('.basket-header');
      expect(header).toBeTruthy();
    });

    it('should render basket content area', () => {
      const content = compiled.querySelector('.basket-content');
      expect(content).toBeTruthy();
    });

    it('should render basket footer when items exist', () => {
      const footer = compiled.querySelector('.basket-footer');
      expect(footer).toBeTruthy();
    });
  });

  describe('Touch-Friendly Controls', () => {
    it('should have close button with minimum 44px width', () => {
      const closeButton = compiled.querySelector('.close-button') as HTMLElement;
      expect(closeButton).toBeTruthy();

      const styles = window.getComputedStyle(closeButton);
      const width = parseInt(styles.width);

      expect(width).toBeGreaterThanOrEqual(44);
    });

    it('should have close button with minimum 44px height', () => {
      const closeButton = compiled.querySelector('.close-button') as HTMLElement;
      const styles = window.getComputedStyle(closeButton);
      const height = parseInt(styles.height);

      expect(height).toBeGreaterThanOrEqual(44);
    });

    it('should have quantity increment button with minimum 44px width', () => {
      const incrementButton = compiled.querySelector('.quantity-button') as HTMLElement;
      expect(incrementButton).toBeTruthy();

      const styles = window.getComputedStyle(incrementButton);
      const minWidth = parseInt(styles.minWidth);

      expect(minWidth).toBeGreaterThanOrEqual(44);
    });

    it('should have quantity increment button with minimum 44px height', () => {
      const incrementButton = compiled.querySelector('.quantity-button') as HTMLElement;
      const styles = window.getComputedStyle(incrementButton);
      const minHeight = parseInt(styles.minHeight);

      expect(minHeight).toBeGreaterThanOrEqual(44);
    });

    it('should have remove button with minimum 44px width', () => {
      const removeButton = compiled.querySelector('.remove-button') as HTMLElement;
      expect(removeButton).toBeTruthy();

      const styles = window.getComputedStyle(removeButton);
      const minWidth = parseInt(styles.minWidth);

      expect(minWidth).toBeGreaterThanOrEqual(44);
    });

    it('should have remove button with minimum 44px height', () => {
      const removeButton = compiled.querySelector('.remove-button') as HTMLElement;
      const styles = window.getComputedStyle(removeButton);
      const minHeight = parseInt(styles.minHeight);

      expect(minHeight).toBeGreaterThanOrEqual(44);
    });

    it('should have all quantity buttons with same size', () => {
      const quantityButtons = compiled.querySelectorAll('.quantity-button');
      expect(quantityButtons.length).toBeGreaterThan(0);

      quantityButtons.forEach(button => {
        const styles = window.getComputedStyle(button as Element);
        const width = parseInt(styles.width);
        const height = parseInt(styles.height);

        expect(width).toBeGreaterThanOrEqual(44);
        expect(height).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Responsive Typography', () => {
    it('should render header title element', () => {
      const title = compiled.querySelector('.basket-header h2') as HTMLElement;
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Basket');
    });

    it('should render item titles', () => {
      const itemTitle = compiled.querySelector('.item-title') as HTMLElement;
      expect(itemTitle).toBeTruthy();
      expect(itemTitle.textContent).toBeTruthy();
    });

    it('should render price text', () => {
      const price = compiled.querySelector('.item-price') as HTMLElement;
      expect(price).toBeTruthy();
    });

    it('should render total price', () => {
      const totalPrice = compiled.querySelector('.total-price') as HTMLElement;
      expect(totalPrice).toBeTruthy();
      expect(totalPrice.textContent).toBeTruthy();
    });
  });

  describe('Sidebar Width and Positioning', () => {
    it('should have defined max-width', () => {
      const sidebar = compiled.querySelector('.basket-sidebar') as HTMLElement;
      const styles = window.getComputedStyle(sidebar);

      expect(styles.maxWidth).toBeTruthy();
    });

    it('should span full height', () => {
      const sidebar = compiled.querySelector('.basket-sidebar') as HTMLElement;
      const styles = window.getComputedStyle(sidebar);

      expect(styles.top).toBe('0px');
      expect(styles.bottom).toBe('0px');
    });

    it('should be positioned on the right side', () => {
      const sidebar = compiled.querySelector('.basket-sidebar') as HTMLElement;
      const styles = window.getComputedStyle(sidebar);

      expect(styles.right).toBe('0px');
    });

    it('should have flex layout for content organization', () => {
      const sidebar = compiled.querySelector('.basket-sidebar') as HTMLElement;
      const styles = window.getComputedStyle(sidebar);

      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
    });
  });

  describe('Scrollable Content Area', () => {
    it('should have scrollable content area', () => {
      const content = compiled.querySelector('.basket-content') as HTMLElement;
      const styles = window.getComputedStyle(content);

      expect(styles.overflowY).toBe('auto');
    });

    it('should have flex-grow for content area', () => {
      const content = compiled.querySelector('.basket-content') as HTMLElement;
      const styles = window.getComputedStyle(content);

      expect(styles.flex).toBeTruthy();
    });

    it('should have padding in content area', () => {
      const content = compiled.querySelector('.basket-content') as HTMLElement;
      const styles = window.getComputedStyle(content);

      expect(styles.padding).toBeTruthy();
      expect(styles.padding).not.toBe('0px');
    });
  });

  describe('Item Image Sizing', () => {
    it('should render item images', () => {
      const image = compiled.querySelector('.item-image');
      expect(image).toBeTruthy();
    });

    it('should have defined width for item images', () => {
      const image = compiled.querySelector('.item-image') as HTMLElement;
      const styles = window.getComputedStyle(image);

      expect(styles.width).toBeTruthy();
      expect(parseInt(styles.width)).toBeGreaterThan(0);
    });

    it('should have defined height for item images', () => {
      const image = compiled.querySelector('.item-image') as HTMLElement;
      const styles = window.getComputedStyle(image);

      expect(styles.height).toBeTruthy();
      expect(parseInt(styles.height)).toBeGreaterThan(0);
    });

    it('should use object-fit cover for images', () => {
      const image = compiled.querySelector('.item-image') as HTMLElement;
      const styles = window.getComputedStyle(image);

      expect(styles.objectFit).toBe('cover');
    });

    it('should have rounded corners on images', () => {
      const image = compiled.querySelector('.item-image') as HTMLElement;
      const styles = window.getComputedStyle(image);

      expect(styles.borderRadius).toBeTruthy();
      expect(styles.borderRadius).not.toBe('0px');
    });
  });

  describe('Basket Item Layout', () => {
    it('should render basket items list', () => {
      const itemsList = compiled.querySelector('.basket-items');
      expect(itemsList).toBeTruthy();
    });

    it('should render individual basket items', () => {
      const items = compiled.querySelectorAll('.basket-item');
      expect(items.length).toBe(basketWithItems.items.length);
    });

    it('should use flex layout for basket items', () => {
      const item = compiled.querySelector('.basket-item') as HTMLElement;
      const styles = window.getComputedStyle(item);

      expect(styles.display).toBe('flex');
    });

    it('should have gap between item elements', () => {
      const item = compiled.querySelector('.basket-item') as HTMLElement;
      const styles = window.getComputedStyle(item);

      expect(styles.gap).toBeTruthy();
      expect(styles.gap).not.toBe('0px');
    });

    it('should have padding in basket items', () => {
      const item = compiled.querySelector('.basket-item') as HTMLElement;
      const styles = window.getComputedStyle(item);

      expect(styles.padding).toBeTruthy();
      expect(styles.padding).not.toBe('0px');
    });
  });

  describe('Footer Layout', () => {
    it('should have footer element', () => {
      const footer = compiled.querySelector('.basket-footer') as HTMLElement;

      // Footer should exist
      expect(footer).toBeTruthy();
      expect(footer.classList.contains('basket-footer')).toBe(true);
    });

    it('should have padding in footer', () => {
      const footer = compiled.querySelector('.basket-footer') as HTMLElement;
      const styles = window.getComputedStyle(footer);

      expect(styles.padding).toBeTruthy();
      expect(styles.padding).not.toBe('0px');
    });

    it('should render total section', () => {
      const totalSection = compiled.querySelector('.total-section');
      expect(totalSection).toBeTruthy();
    });

    it('should use flex layout for total section', () => {
      const totalSection = compiled.querySelector('.total-section') as HTMLElement;
      const styles = window.getComputedStyle(totalSection);

      expect(styles.display).toBe('flex');
      expect(styles.justifyContent).toBe('space-between');
    });

    it('should render item count', () => {
      const itemCount = compiled.querySelector('.item-count');
      expect(itemCount).toBeTruthy();
      expect(itemCount?.textContent).toContain('2 items');
    });
  });

  describe('Animation and Transitions', () => {
    it('should have transition on sidebar', () => {
      const sidebar = compiled.querySelector('.basket-sidebar') as HTMLElement;
      const styles = window.getComputedStyle(sidebar);

      expect(styles.transition).toBeTruthy();
    });

    it('should have transition on overlay', () => {
      const overlay = compiled.querySelector('.basket-overlay') as HTMLElement;
      const styles = window.getComputedStyle(overlay);

      expect(styles.transition).toBeTruthy();
    });

    it('should apply open class when sidebar is open', () => {
      const sidebar = compiled.querySelector('.basket-sidebar');
      expect(sidebar?.classList.contains('open')).toBe(true);
    });

    it('should apply open class to overlay when sidebar is open', () => {
      const overlay = compiled.querySelector('.basket-overlay');
      expect(overlay?.classList.contains('open')).toBe(true);
    });
  });

  describe('Accessibility Features', () => {
    it('should have cursor pointer on close button', () => {
      const closeButton = compiled.querySelector('.close-button') as HTMLElement;
      const styles = window.getComputedStyle(closeButton);

      expect(styles.cursor).toBe('pointer');
    });

    it('should have cursor pointer on quantity buttons', () => {
      const quantityButton = compiled.querySelector('.quantity-button') as HTMLElement;
      const styles = window.getComputedStyle(quantityButton);

      expect(styles.cursor).toBe('pointer');
    });

    it('should have cursor pointer on remove button', () => {
      const removeButton = compiled.querySelector('.remove-button') as HTMLElement;
      const styles = window.getComputedStyle(removeButton);

      expect(styles.cursor).toBe('pointer');
    });

    it('should have proper button elements for interactions', () => {
      const closeButton = compiled.querySelector('.close-button');
      expect(closeButton?.tagName).toBe('BUTTON');

      const quantityButton = compiled.querySelector('.quantity-button');
      expect(quantityButton?.tagName).toBe('BUTTON');

      const removeButton = compiled.querySelector('.remove-button');
      expect(removeButton?.tagName).toBe('BUTTON');
    });
  });
});
