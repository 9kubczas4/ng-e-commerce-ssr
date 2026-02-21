import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { BasketSidebarComponent } from '../../../features/basket/components/basket-sidebar/basket-sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { provideRouter } from '@angular/router';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([])
      ]
    })
    .overrideComponent(MainLayoutComponent, {
      set: {
        styleUrls: []
      }
    })
    .overrideComponent(HeaderComponent, {
      set: {
        styleUrls: []
      }
    })
    .overrideComponent(BasketSidebarComponent, {
      set: {
        styleUrls: []
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('header[appHeader]');

    expect(header).toBeTruthy();
  });

  it('should render router outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutlet = compiled.querySelector('router-outlet');

    expect(routerOutlet).toBeTruthy();
  });

  it('should render basket sidebar component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const basketSidebar = compiled.querySelector('app-basket-sidebar');

    expect(basketSidebar).toBeTruthy();
  });

  it('should have main content area', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const mainContent = compiled.querySelector('.main-content');

    expect(mainContent).toBeTruthy();
  });

  it('should open basket sidebar when header basket button is clicked', () => {
    const basketSidebar = component.basketSidebar();
    const openSpy = vi.spyOn(basketSidebar, 'open');

    component.onBasketClick();

    expect(openSpy).toHaveBeenCalledOnce();
  });

  it('should handle basketClick event from header', () => {
    const basketSidebar = component.basketSidebar();
    const openSpy = vi.spyOn(basketSidebar, 'open');

    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('header[appHeader]');

    // Trigger the basketClick event
    header?.dispatchEvent(new Event('basketClick'));
    fixture.detectChanges();

    expect(openSpy).toHaveBeenCalledOnce();
  });

  it('should have proper layout structure', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const layout = compiled.querySelector('.main-layout');
    const header = layout?.querySelector('header[appHeader]');
    const main = layout?.querySelector('main.main-content');
    const sidebar = layout?.querySelector('app-basket-sidebar');

    expect(layout).toBeTruthy();
    expect(header).toBeTruthy();
    expect(main).toBeTruthy();
    expect(sidebar).toBeTruthy();
  });
});
