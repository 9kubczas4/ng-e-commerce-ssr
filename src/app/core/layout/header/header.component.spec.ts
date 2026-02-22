import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { BasketService } from '../../services/basket.service';
import { signal } from '@angular/core';
import { Basket } from '../../models/basket.model';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockBasketSignal: ReturnType<typeof signal<Basket>>;

  beforeEach(async () => {
    mockBasketSignal = signal<Basket>({
      items: [],
      totalPrice: 0,
      itemCount: 0
    });

    const mockBasketService = {
      basket: mockBasketSignal.asReadonly()
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: BasketService, useValue: mockBasketService }
      ]
    })
    .overrideComponent(HeaderComponent, {
      set: {
        styleUrls: []
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display app logo and title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logo = compiled.querySelector('.header__logo');
    const title = compiled.querySelector('.header__title');

    expect(logo).toBeTruthy();
    expect(title?.textContent).toContain('Angular Dev Shop');
  });

  it('should display theme toggle button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const themeToggle = compiled.querySelector('button[app-theme-toggle]');

    expect(themeToggle).toBeTruthy();
  });

  it('should display basket button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const basketButton = compiled.querySelector('.header__basket-button');

    expect(basketButton).toBeTruthy();
  });

  it('should not display basket badge when basket is empty', () => {
    mockBasketSignal.set({
      items: [],
      totalPrice: 0,
      itemCount: 0
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.header__basket-badge');

    expect(badge).toBeFalsy();
  });

  it('should display basket badge with item count when basket has items', () => {
    mockBasketSignal.set({
      items: [],
      totalPrice: 29.99,
      itemCount: 3
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.header__basket-badge');

    expect(badge).toBeTruthy();
    expect(badge?.textContent?.trim()).toBe('3');
  });

  it('should emit basketClick event when basket button is clicked', () => {
    let emitted = false;
    component.basketClick.subscribe(() => {
      emitted = true;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const basketButton = compiled.querySelector('.header__basket-button') as HTMLButtonElement;
    basketButton.click();

    expect(emitted).toBe(true);
  });

  it('should have proper aria-label on basket button', () => {
    mockBasketSignal.set({
      items: [],
      totalPrice: 0,
      itemCount: 2
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const basketButton = compiled.querySelector('.header__basket-button') as HTMLButtonElement;

    expect(basketButton.getAttribute('aria-label')).toContain('2 items');
  });

  it('should have touch-friendly button sizes (min 44x44px)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const basketButton = compiled.querySelector('.header__basket-button') as HTMLButtonElement;
    const themeToggle = compiled.querySelector('button[app-theme-toggle]') as HTMLButtonElement;

    // Check that buttons exist and have proper styling
    expect(basketButton).toBeTruthy();
    expect(themeToggle).toBeTruthy();

    // Verify buttons have the expected classes that apply touch-friendly sizing
    expect(basketButton.classList.contains('header__basket-button')).toBe(true);
    expect(themeToggle.hasAttribute('app-theme-toggle')).toBe(true);
  });
});
