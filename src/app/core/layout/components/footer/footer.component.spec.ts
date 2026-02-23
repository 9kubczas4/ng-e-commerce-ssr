import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { provideRouter } from '@angular/router';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current year in copyright', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const currentYear = new Date().getFullYear();
    const copyrightText = compiled.querySelector('.footer__copyright')?.textContent;

    expect(copyrightText).toContain(currentYear.toString());
  });

  it('should render all footer link sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const linkColumns = compiled.querySelectorAll('.footer__links-column');

    expect(linkColumns.length).toBe(4);
  });

  it('should render shop links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const shopLinks = Array.from(compiled.querySelectorAll('.footer__links-column'))
      .find(col => col.querySelector('.footer__links-title')?.textContent?.includes('Shop'));

    expect(shopLinks).toBeTruthy();
    expect(shopLinks?.querySelectorAll('.footer__link').length).toBe(4);
  });

  it('should render support links including complaint form link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const supportLinks = Array.from(compiled.querySelectorAll('.footer__links-column'))
      .find(col => col.querySelector('.footer__links-title')?.textContent?.includes('Support'));

    expect(supportLinks).toBeTruthy();
    expect(supportLinks?.querySelectorAll('.footer__link').length).toBe(5);

    const complaintLink = Array.from(supportLinks?.querySelectorAll('.footer__link') || [])
      .find(link => link.textContent?.includes('Complaints'));
    expect(complaintLink).toBeTruthy();
  });

  it('should render social links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const socialLinks = compiled.querySelectorAll('.footer__social-link');

    expect(socialLinks.length).toBe(4);
  });

  it('should have proper accessibility attributes on social links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const socialLinks = compiled.querySelectorAll('.footer__social-link');

    socialLinks.forEach(link => {
      expect(link.getAttribute('aria-label')).toBeTruthy();
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  it('should render brand section with logo and description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const brandName = compiled.querySelector('.footer__brand-name');
    const description = compiled.querySelector('.footer__description');

    expect(brandName?.textContent).toContain('Angular Dev Shop');
    expect(description).toBeTruthy();
  });

  it('should have proper link structure for keyboard navigation', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.footer__link');

    links.forEach(link => {
      const href = link.getAttribute('href');
      const routerLink = link.getAttribute('ng-reflect-router-link');
      expect(href || routerLink).toBeTruthy();
    });
  });
});
