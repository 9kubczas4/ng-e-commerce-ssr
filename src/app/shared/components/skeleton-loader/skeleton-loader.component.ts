import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  imports: [],
  template: `
    <div class="skeleton" [class]="variant()" [attr.aria-busy]="true" aria-label="Loading content">
      <div class="skeleton-shimmer"></div>
    </div>
  `,
  styleUrls: ['./skeleton-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonLoaderComponent {
  variant = input<'text' | 'image' | 'button' | 'card'>('text');
}
