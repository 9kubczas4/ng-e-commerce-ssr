import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductGridComponent } from './product-grid.component';
import { Product } from '@core/models/product.model';

describe('ProductGridComponent', () => {
  let component: ProductGridComponent;
  let fixture: ComponentFixture<ProductGridComponent>;

  const mockProducts: Product[] = [
    {
      id: 'test-1',
      title: 'Test Product 1',
      description: 'Test description 1',
      price: 29.99,
      imageUrl: '/test1.jpg',
      category: 'Apparel'
    },
    {
      id: 'test-2',
      title: 'Test Product 2',
      description: 'Test description 2',
      price: 19.99,
      imageUrl: '/test2.jpg',
      category: 'Accessories'
    },
    {
      id: 'test-3',
      title: 'Angular Mug',
      description: 'Coffee mug with Angular logo',
      price: 14.99,
      imageUrl: '/test3.jpg',
      category: 'Accessories'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductGridComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('products', mockProducts);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all products when no filters are applied', () => {
    expect(component.filteredProducts().length).toBe(3);
  });

  it('should filter products by search query', () => {
    fixture.componentRef.setInput('searchQuery', 'angular');
    fixture.detectChanges();

    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].title).toBe('Angular Mug');
  });

  it('should filter products by category', () => {
    fixture.componentRef.setInput('selectedCategory', 'Accessories');
    fixture.detectChanges();

    expect(component.filteredProducts().length).toBe(2);
  });

  it('should filter products by both search query and category', () => {
    fixture.componentRef.setInput('searchQuery', 'test');
    fixture.componentRef.setInput('selectedCategory', 'Apparel');
    fixture.detectChanges();

    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].id).toBe('test-1');
  });

  it('should emit productClick event when product card is clicked', () => {
    let emittedId: string | undefined;
    component.productClick.subscribe((id: string) => {
      emittedId = id;
    });

    component.onProductClick('test-1');

    expect(emittedId).toBe('test-1');
  });

  it('should emit addToBasket event when add to basket is clicked', () => {
    let emittedProduct: Product | undefined;
    component.addToBasket.subscribe((product: Product) => {
      emittedProduct = product;
    });

    component.onAddToBasket(mockProducts[0]);

    expect(emittedProduct).toEqual(mockProducts[0]);
  });

  it('should show empty state when no products match filters', () => {
    fixture.componentRef.setInput('searchQuery', 'nonexistent');
    fixture.detectChanges();

    expect(component.filteredProducts().length).toBe(0);

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyState = compiled.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should perform case-insensitive search', () => {
    fixture.componentRef.setInput('searchQuery', 'ANGULAR');
    fixture.detectChanges();

    expect(component.filteredProducts().length).toBe(1);
  });

  it('should search in both title and description', () => {
    fixture.componentRef.setInput('searchQuery', 'coffee');
    fixture.detectChanges();

    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].id).toBe('test-3');
  });
});
