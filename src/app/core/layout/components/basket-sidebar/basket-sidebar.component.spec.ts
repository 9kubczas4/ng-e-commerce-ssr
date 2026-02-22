import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BasketSidebarComponent } from './basket-sidebar.component';
import { BasketService } from '@core/services/basket.service';
import { signal } from '@angular/core';
import { Basket } from '@core/models/basket.model';
import { Product } from '@core/models/product.model';

describe('BasketSidebarComponent', () => {
  let component: BasketSidebarComponent;
  let fixture: ComponentFixture<BasketSidebarComponent>;
  let mockBasketService: {
    basket: ReturnType<typeof signal<Basket>>;
    removeItem: ReturnType<typeof vi.fn>;
    updateQuantity: ReturnType<typeof vi.fn>;
  };

  const mockProduct1: Product = {
    id: 'product-1',
    title: 'Angular T-Shirt',
    description: 'Premium Angular branded t-shirt',
    price: 29.99,
    discount: 10,
    imageUrl: '/assets/tshirt.jpg',
    category: 'Apparel'
  };

  const mockProduct2: Product = {
    id: 'product-2',
    title: 'Angular Mug',
    description: 'Coffee mug with Angular logo',
    price: 14.99,
    imageUrl: '/assets/mug.jpg',
    category: 'Accessories'
  };

  const emptyBasket: Basket = {
    items: [],
    totalPrice: 0,
    itemCount: 0
  };

  const basketWithItems: Basket = {
    items: [
      { product: mockProduct1, quantity: 2 },
      { product: mockProduct2, quantity: 1 }
    ],
    totalPrice: 68.97,
    itemCount: 3
  };

  beforeEach(async () => {
    // Create mock basket service with signal
    const basketSignal = signal<Basket>(emptyBasket);
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
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with closed state', () => {
      expect(component.isOpen()).toBe(false);
    });

    it('should have access to basket from service', () => {
      expect(component.basket).toBeDefined();
      expect(component.basket()).toEqual(emptyBasket);
    });
  });

  describe('Open/Close Functionality', () => {
    it('should open sidebar when open() is called', () => {
      expect(component.isOpen()).toBe(false);

      component.open();

      expect(component.isOpen()).toBe(true);
    });

    it('should close sidebar when close() is called', () => {
      component.open();
      expect(component.isOpen()).toBe(true);

      component.close();

      expect(component.isOpen()).toBe(false);
    });

    it('should toggle between open and closed states', () => {
      expect(component.isOpen()).toBe(false);

      component.open();
      expect(component.isOpen()).toBe(true);

      component.close();
      expect(component.isOpen()).toBe(false);

      component.open();
      expect(component.isOpen()).toBe(true);
    });
  });

  describe('Remove Item Interaction', () => {
    it('should call basketService.removeItem with correct product id', () => {
      component.removeItem('product-1');

      expect(mockBasketService.removeItem).toHaveBeenCalledWith('product-1');
      expect(mockBasketService.removeItem).toHaveBeenCalledTimes(1);
    });

    it('should call basketService.removeItem for different product ids', () => {
      component.removeItem('product-1');
      component.removeItem('product-2');

      expect(mockBasketService.removeItem).toHaveBeenCalledWith('product-1');
      expect(mockBasketService.removeItem).toHaveBeenCalledWith('product-2');
      expect(mockBasketService.removeItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('Quantity Controls', () => {
    describe('incrementQuantity', () => {
      it('should call basketService.updateQuantity with incremented value', () => {
        component.incrementQuantity('product-1', 2);

        expect(mockBasketService.updateQuantity).toHaveBeenCalledWith('product-1', 3);
        expect(mockBasketService.updateQuantity).toHaveBeenCalledTimes(1);
      });

      it('should increment from 1 to 2', () => {
        component.incrementQuantity('product-1', 1);

        expect(mockBasketService.updateQuantity).toHaveBeenCalledWith('product-1', 2);
      });

      it('should increment from 98 to 99', () => {
        component.incrementQuantity('product-1', 98);

        expect(mockBasketService.updateQuantity).toHaveBeenCalledWith('product-1', 99);
      });

      it('should not call updateQuantity when quantity is at maximum (99)', () => {
        component.incrementQuantity('product-1', 99);

        expect(mockBasketService.updateQuantity).not.toHaveBeenCalled();
      });

      it('should not call updateQuantity when quantity exceeds maximum', () => {
        component.incrementQuantity('product-1', 100);

        expect(mockBasketService.updateQuantity).not.toHaveBeenCalled();
      });
    });

    describe('decrementQuantity', () => {
      it('should call basketService.updateQuantity with decremented value', () => {
        component.decrementQuantity('product-1', 3);

        expect(mockBasketService.updateQuantity).toHaveBeenCalledWith('product-1', 2);
        expect(mockBasketService.updateQuantity).toHaveBeenCalledTimes(1);
      });

      it('should decrement from 2 to 1', () => {
        component.decrementQuantity('product-1', 2);

        expect(mockBasketService.updateQuantity).toHaveBeenCalledWith('product-1', 1);
      });

      it('should not call updateQuantity when quantity is 1', () => {
        component.decrementQuantity('product-1', 1);

        expect(mockBasketService.updateQuantity).not.toHaveBeenCalled();
      });

      it('should not call updateQuantity when quantity is less than 1', () => {
        component.decrementQuantity('product-1', 0);

        expect(mockBasketService.updateQuantity).not.toHaveBeenCalled();
      });
    });
  });

  describe('Empty State Display', () => {
    it('should display empty basket message when basket has no items', () => {
      mockBasketService.basket = signal(emptyBasket).asReadonly();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const emptyMessage = compiled.querySelector('.empty-basket');

      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage?.textContent).toContain('Your basket is empty');
    });

    it('should display empty basket subtitle', () => {
      mockBasketService.basket = signal(emptyBasket).asReadonly();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const subtitle = compiled.querySelector('.empty-basket-subtitle');

      expect(subtitle).toBeTruthy();
      expect(subtitle?.textContent).toContain('Add some products to get started');
    });

    it('should not display basket items when basket is empty', () => {
      mockBasketService.basket = signal(emptyBasket).asReadonly();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const basketItems = compiled.querySelector('.basket-items');

      expect(basketItems).toBeFalsy();
    });

    it('should not display basket footer when basket is empty', () => {
      mockBasketService.basket = signal(emptyBasket).asReadonly();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const basketFooter = compiled.querySelector('.basket-footer');

      expect(basketFooter).toBeFalsy();
    });
  });

  describe('Basket with Items Display', () => {
    it('should not display empty basket message when basket has items', () => {
      // Create a new component with basket containing items
      const basketSignalWithItems = signal<Basket>(basketWithItems);
      mockBasketService.basket = basketSignalWithItems.asReadonly();

      fixture = TestBed.createComponent(BasketSidebarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const emptyMessage = compiled.querySelector('.empty-basket');

      expect(emptyMessage).toBeFalsy();
    });

    it('should display basket items list when basket has items', () => {
      const basketSignalWithItems = signal<Basket>(basketWithItems);
      mockBasketService.basket = basketSignalWithItems.asReadonly();

      fixture = TestBed.createComponent(BasketSidebarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const basketItems = compiled.querySelector('.basket-items');

      expect(basketItems).toBeTruthy();
    });

    it('should display correct number of basket items', () => {
      const basketSignalWithItems = signal<Basket>(basketWithItems);
      mockBasketService.basket = basketSignalWithItems.asReadonly();

      fixture = TestBed.createComponent(BasketSidebarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const items = compiled.querySelectorAll('.basket-item');

      expect(items.length).toBe(2);
    });

    it('should display product titles', () => {
      const basketSignalWithItems = signal<Basket>(basketWithItems);
      mockBasketService.basket = basketSignalWithItems.asReadonly();

      fixture = TestBed.createComponent(BasketSidebarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const titles = compiled.querySelectorAll('.item-title');

      expect(titles[0].textContent).toContain('Angular T-Shirt');
      expect(titles[1].textContent).toContain('Angular Mug');
    });

    it('should display product quantities', () => {
      const basketSignalWithItems = signal<Basket>(basketWithItems);
      mockBasketService.basket = basketSignalWithItems.asReadonly();

      fixture = TestBed.createComponent(BasketSidebarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const quantities = compiled.querySelectorAll('.quantity');

      expect(quantities[0].textContent?.trim()).toBe('2');
      expect(quantities[1].textContent?.trim()).toBe('1');
    });

    it('should display total price in footer', () => {
      const basketSignalWithItems = signal<Basket>(basketWithItems);
      mockBasketService.basket = basketSignalWithItems.asReadonly();

      fixture = TestBed.createComponent(BasketSidebarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const totalPrice = compiled.querySelector('.total-price');

      expect(totalPrice?.textContent).toContain('68.97');
    });

    it('should display item count in footer', () => {
      const basketSignalWithItems = signal<Basket>(basketWithItems);
      mockBasketService.basket = basketSignalWithItems.asReadonly();

      fixture = TestBed.createComponent(BasketSidebarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const itemCount = compiled.querySelector('.item-count');

      expect(itemCount?.textContent).toContain('3 items');
    });

    it('should display singular "item" when count is 1', () => {
      const singleItemBasket: Basket = {
        items: [{ product: mockProduct1, quantity: 1 }],
        totalPrice: 26.99,
        itemCount: 1
      };
      const basketSignalSingleItem = signal<Basket>(singleItemBasket);
      mockBasketService.basket = basketSignalSingleItem.asReadonly();

      fixture = TestBed.createComponent(BasketSidebarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const itemCount = compiled.querySelector('.item-count');

      expect(itemCount?.textContent).toContain('1 item');
      expect(itemCount?.textContent).not.toContain('items');
    });
  });

  describe('getItemPrice Method', () => {
    it('should calculate price without discount', () => {
      const price = component.getItemPrice(100, undefined, 2);

      expect(price).toBe(200);
    });

    it('should calculate price with discount', () => {
      const price = component.getItemPrice(100, 20, 2);

      expect(price).toBe(160);
    });

    it('should round to 2 decimal places', () => {
      const price = component.getItemPrice(10.99, 10, 3);

      expect(price).toBe(29.67);
    });

    it('should handle quantity of 1', () => {
      const price = component.getItemPrice(50, 10, 1);

      expect(price).toBe(45);
    });

    it('should handle 0% discount', () => {
      const price = component.getItemPrice(100, 0, 2);

      expect(price).toBe(200);
    });

    it('should handle 100% discount', () => {
      const price = component.getItemPrice(100, 100, 2);

      expect(price).toBe(0);
    });
  });
});
