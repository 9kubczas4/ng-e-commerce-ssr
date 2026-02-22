import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '@features/products/services/product.service';
import { BasketService } from '@core/services/basket.service';
import { Product } from '@core/models/product.model';
import { signal } from '@angular/core';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let mockProductService: any;
  let mockBasketService: any;
  let mockRouter: any;

  const mockProducts: Product[] = [
    {
      id: '1',
      title: 'Angular T-Shirt',
      description: 'Cool Angular shirt',
      price: 29.99,
      imageUrl: '/assets/shirt.jpg',
      category: 'Apparel'
    },
    {
      id: '2',
      title: 'Angular Mug',
      description: 'Coffee mug with Angular logo',
      price: 14.99,
      imageUrl: '/assets/mug.jpg',
      category: 'Accessories'
    }
  ];

  beforeEach(async () => {
    mockProductService = {
      products: signal(mockProducts),
      loading: signal(false),
      loadProducts: vi.fn()
    };

    mockBasketService = {
      addItem: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: BasketService, useValue: mockBasketService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on initialization', () => {
    expect(mockProductService.loadProducts).toHaveBeenCalled();
  });

  it('should update search query when onSearchChange is called', () => {
    const query = 'Angular';
    component.onSearchChange(query);
    expect(component.searchQuery()).toBe(query);
  });

  it('should update selected category when onCategoryChange is called', () => {
    const category = 'Apparel';
    component.onCategoryChange(category);
    expect(component.selectedCategory()).toBe(category);
  });

  it('should clear category when onCategoryChange is called with null', () => {
    component.onCategoryChange('Apparel');
    component.onCategoryChange(null);
    expect(component.selectedCategory()).toBeNull();
  });

  it('should call basketService.addItem when onAddToBasket is called', () => {
    const product = mockProducts[0];
    component.onAddToBasket(product);
    expect(mockBasketService.addItem).toHaveBeenCalledWith(product);
  });

  it('should navigate to product details when onProductClick is called', () => {
    const productId = '1';
    component.onProductClick(productId);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', productId]);
  });

  it('should expose products signal from ProductService', () => {
    expect(component.products()).toEqual(mockProducts);
  });

  it('should initialize with empty search query', () => {
    expect(component.searchQuery()).toBe('');
  });

  it('should initialize with null selected category', () => {
    expect(component.selectedCategory()).toBeNull();
  });

  // Integration Tests
  describe('Component Composition', () => {
    it('should render SearchBar component', () => {
      const searchBar = fixture.nativeElement.querySelector('app-search-bar');
      expect(searchBar).toBeTruthy();
    });

    it('should render CategoryFilter component', () => {
      const categoryFilter = fixture.nativeElement.querySelector('app-category-filter');
      expect(categoryFilter).toBeTruthy();
    });

    it('should render ProductGrid component', () => {
      const productGrid = fixture.nativeElement.querySelector('app-product-grid');
      expect(productGrid).toBeTruthy();
    });

    it('should pass products to CategoryFilter component', () => {
      const categoryFilter = fixture.debugElement.query(
        (el) => el.name === 'app-category-filter'
      );
      expect(categoryFilter).toBeTruthy();
      expect(categoryFilter.componentInstance.products()).toEqual(mockProducts);
    });

    it('should pass products, searchQuery, and selectedCategory to ProductGrid component', () => {
      component.searchQuery.set('Angular');
      component.selectedCategory.set('Apparel');
      fixture.detectChanges();

      const productGrid = fixture.debugElement.query(
        (el) => el.name === 'app-product-grid'
      );
      expect(productGrid).toBeTruthy();
      expect(productGrid.componentInstance.products()).toEqual(mockProducts);
      expect(productGrid.componentInstance.searchQuery()).toBe('Angular');
      expect(productGrid.componentInstance.selectedCategory()).toBe('Apparel');
    });
  });

  describe('Event Handling Flow', () => {
    it('should handle searchChange event from SearchBar', () => {
      const searchBar = fixture.debugElement.query(
        (el) => el.name === 'app-search-bar'
      );

      // Emit searchChange event
      searchBar.componentInstance.searchChange.emit('test query');
      fixture.detectChanges();

      expect(component.searchQuery()).toBe('test query');
    });

    it('should handle categoryChange event from CategoryFilter', () => {
      const categoryFilter = fixture.debugElement.query(
        (el) => el.name === 'app-category-filter'
      );

      // Emit categoryChange event
      categoryFilter.componentInstance.categoryChange.emit('Accessories');
      fixture.detectChanges();

      expect(component.selectedCategory()).toBe('Accessories');
    });

    it('should handle productClick event from ProductGrid', () => {
      const productGrid = fixture.debugElement.query(
        (el) => el.name === 'app-product-grid'
      );

      // Emit productClick event
      productGrid.componentInstance.productClick.emit('product-123');
      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', 'product-123']);
    });

    it('should handle addToBasket event from ProductGrid', () => {
      const productGrid = fixture.debugElement.query(
        (el) => el.name === 'app-product-grid'
      );
      const product = mockProducts[0];

      // Emit addToBasket event
      productGrid.componentInstance.addToBasket.emit(product);
      fixture.detectChanges();

      expect(mockBasketService.addItem).toHaveBeenCalledWith(product);
    });

    it('should update ProductGrid inputs when search query changes', () => {
      const productGrid = fixture.debugElement.query(
        (el) => el.name === 'app-product-grid'
      );

      component.onSearchChange('new search');
      fixture.detectChanges();

      expect(productGrid.componentInstance.searchQuery()).toBe('new search');
    });

    it('should update ProductGrid inputs when category changes', () => {
      const productGrid = fixture.debugElement.query(
        (el) => el.name === 'app-product-grid'
      );

      component.onCategoryChange('Apparel');
      fixture.detectChanges();

      expect(productGrid.componentInstance.selectedCategory()).toBe('Apparel');
    });
  });

  describe('Navigation Triggering', () => {
    it('should navigate to product details page with correct product ID', () => {
      component.onProductClick('angular-shirt-001');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', 'angular-shirt-001']);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate with different product IDs', () => {
      component.onProductClick('product-1');
      component.onProductClick('product-2');
      component.onProductClick('product-3');

      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(1, ['/product', 'product-1']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(2, ['/product', 'product-2']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(3, ['/product', 'product-3']);
    });

    it('should trigger navigation when ProductGrid emits productClick', () => {
      const productGrid = fixture.debugElement.query(
        (el) => el.name === 'app-product-grid'
      );

      productGrid.componentInstance.productClick.emit('test-product-id');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', 'test-product-id']);
    });
  });

  describe('Complete Integration Flow', () => {
    it('should handle complete user flow: search -> filter -> add to basket -> navigate', () => {
      // User searches for a product
      const searchBar = fixture.debugElement.query(
        (el) => el.name === 'app-search-bar'
      );
      searchBar.componentInstance.searchChange.emit('Angular');
      fixture.detectChanges();
      expect(component.searchQuery()).toBe('Angular');

      // User filters by category
      const categoryFilter = fixture.debugElement.query(
        (el) => el.name === 'app-category-filter'
      );
      categoryFilter.componentInstance.categoryChange.emit('Apparel');
      fixture.detectChanges();
      expect(component.selectedCategory()).toBe('Apparel');

      // User adds product to basket
      const productGrid = fixture.debugElement.query(
        (el) => el.name === 'app-product-grid'
      );
      const product = mockProducts[0];
      productGrid.componentInstance.addToBasket.emit(product);
      fixture.detectChanges();
      expect(mockBasketService.addItem).toHaveBeenCalledWith(product);

      // User clicks on product to view details
      productGrid.componentInstance.productClick.emit(product.id);
      fixture.detectChanges();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', product.id]);
    });

    it('should maintain state consistency across multiple interactions', () => {
      // Set initial search
      component.onSearchChange('shirt');
      expect(component.searchQuery()).toBe('shirt');

      // Change category
      component.onCategoryChange('Apparel');
      expect(component.selectedCategory()).toBe('Apparel');
      expect(component.searchQuery()).toBe('shirt'); // Search should persist

      // Clear category
      component.onCategoryChange(null);
      expect(component.selectedCategory()).toBeNull();
      expect(component.searchQuery()).toBe('shirt'); // Search should still persist

      // Update search again
      component.onSearchChange('mug');
      expect(component.searchQuery()).toBe('mug');
      expect(component.selectedCategory()).toBeNull(); // Category should still be null
    });
  });
});
