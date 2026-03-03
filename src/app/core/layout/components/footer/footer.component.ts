import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

type FooterLink =
  | { label: string; href: string; isRoute?: false }
  | { label: string; route: string; isRoute: true };

/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: 'footer[appFooter]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly footerLinks: {
    shop: FooterLink[];
    company: FooterLink[];
    support: FooterLink[];
    legal: FooterLink[];
  } = {
    shop: [
      { label: 'All Products', href: '#' },
      { label: 'New Arrivals', href: '#' },
      { label: 'Best Sellers', href: '#' },
      { label: 'Sale', href: '#' }
    ],
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Blog', href: '#' }
    ],
    support: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact Us', href: '#' },
      { label: 'Shipping Info', href: '#' },
      { label: 'Returns', href: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Accessibility', href: '#' }
    ]
  };

  protected readonly socialLinks = [
    { label: 'GitHub', href: 'https://github.com/angular', icon: 'github', ariaLabel: 'Visit our GitHub' },
    { label: 'Twitter', href: 'https://twitter.com/angular', icon: 'twitter', ariaLabel: 'Follow us on Twitter' },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/angular', icon: 'linkedin', ariaLabel: 'Connect on LinkedIn' },
    { label: 'YouTube', href: 'https://youtube.com/@Angular', icon: 'youtube', ariaLabel: 'Subscribe on YouTube' }
  ];
}
