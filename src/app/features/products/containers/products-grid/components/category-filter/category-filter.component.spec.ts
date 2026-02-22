import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryFilterComponent } from './category-filter.component';
import { Product } from '../../../../../../core/models/product.model';

describe('CategoryFilterComponent', () => {
  let component: CategoryFilterComponent;
  let fixture: ComponentFixture<CategoryFilterComponent>;

  const mockProducts: Product[] = [
    {
      id: '1',
      title: 'Product 1',
      description: 'Description 1',
      price: 10,
      imageUrl: '/test1.jpg',
      category: 'Apparel'
    },
    {
      id: '2',
      title: 'Product 2',
      description: 'Description 2',
      price: 20,
      imageUrl: '/test2.jpg',
      category: 'Accessories'
    },
    {
      id: '3',
      title: 'Product 3',
      description: 'Description 3',
      price: 30,
      imageUrl: '/test3.jpg',
      category: 'Apparel'
    },
    {
      id: '4',
      title: 'Product 4',
      description: 'Description 4',
      price: 40,
      imageUrl: '/test4.jpg',
      category: 'Books'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryFilterComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('products', mockProducts);
    fixture.detectChanges();
  });

  describe('Component Logic', () => {
    it('should create component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with no category selected', () => {
      expect(component.selectedCategory()).toBeNull();
    });
  });

  describe('Category Calculation', () => {
    it('should calculate categories with correct counts', () => {
      const categories = component.categories();

      expect(categories).toHaveLength(3);
      expect(categories).toEqual([
        { name: 'Accessories', count: 1 },
        { name: 'Apparel', count: 2 },
        { name: 'Books', count: 1 }
      ]);
    });

    it('should sort categories alphabetically', () => {
      const categories = component.categories();
      const categoryNames = categories.map(c => c.name);

      expect(categoryNames).toEqual(['Accessories', 'Apparel', 'Books']);
    });

    it('should handle empty product list', () => {
      fixture.componentRef.setInput('products', []);
      fixture.detectChanges();

      const categories = component.categories();

      expect(categories).toHaveLength(0);
    });

    it('should handle single category', () => {
      const singleCategoryProducts: Product[] = [
        {
          id: '1',
          title: 'Product 1',
          description: 'Description 1',
          price: 10,
          imageUrl: '/test1.jpg',
          category: 'Apparel'
        },
        {
          id: '2',
          title: 'Product 2',
          description: 'Description 2',
          price: 20,
          imageUrl: '/test2.jpg',
          category: 'Apparel'
        }
      ];

      fixture.componentRef.setInput('products', singleCategoryProducts);
      fixture.detectChanges();

      const categories = component.categories();

      expect(categories).toHaveLength(1);
      expect(categories[0]).toEqual({ name: 'Apparel', count: 2 });
    });
  });

  describe('Category Selection', () => {
    it('should update selectedCategory when selectCategory is called', () => {
      component.selectCategory('Apparel');

      expect(component.selectedCategory()).toBe('Apparel');
    });

    it('should emit categoryChange event when category is selected', () => {
      const emittedValues: (string | null)[] = [];
      component.categoryChange.subscribe((value: string | null) => {
        emittedValues.push(value);
      });

      component.selectCategory('Apparel');

      expect(emittedValues).toHaveLength(1);
      expect(emittedValues[0]).toBe('Apparel');
    });

    it('should allow selecting null to show all products', () => {
      component.selectCategory('Apparel');
      expect(component.selectedCategory()).toBe('Apparel');

      component.selectCategory(null);

      expect(component.selectedCategory()).toBeNull();
    });

    it('should emit null when "All" option is selected', () => {
      const emittedValues: (string | null)[] = [];
      component.categoryChange.subscribe((value: string | null) => {
        emittedValues.push(value);
      });

      component.selectCategory(null);

      expect(emittedValues).toHaveLength(1);
      expect(emittedValues[0]).toBeNull();
    });
  });

  describe('Selection State', () => {
    it('should return true for isSelected when category matches', () => {
      component.selectCategory('Apparel');

      expect(component.isSelected('Apparel')).toBe(true);
      expect(component.isSelected('Accessories')).toBe(false);
    });

    it('should return true for isSelected(null) when no category is selected', () => {
      expect(component.isSelected(null)).toBe(true);
      expect(component.isSelected('Apparel')).toBe(false);
    });

    it('should update isSelected after category change', () => {
      component.selectCategory('Apparel');
      expect(component.isSelected('Apparel')).toBe(true);

      component.selectCategory('Books');
      expect(component.isSelected('Apparel')).toBe(false);
      expect(component.isSelected('Books')).toBe(true);
    });
  });

  describe('Event Propagation', () => {
    it('should emit correct category value on multiple selections', () => {
      const emittedValues: (string | null)[] = [];
      component.categoryChange.subscribe((value: string | null) => {
        emittedValues.push(value);
      });

      component.selectCategory('Apparel');
      component.selectCategory('Books');
      component.selectCategory(null);

      expect(emittedValues).toEqual(['Apparel', 'Books', null]);
    });
  });
});
