import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-product-card-skeleton',
  imports: [SkeletonLoaderComponent],
  template: `
    <div class="product-card-skeleton glass-effect">
      <app-skeleton-loader variant="image" />
      <div class="skeleton-content">
        <app-skeleton-loader variant="text" />
        <app-skeleton-loader variant="text" />
        <app-skeleton-loader variant="text" />
        <div class="skeleton-footer">
          <app-skeleton-loader variant="text" />
          <app-skeleton-loader variant="button" />
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-card-skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardSkeletonComponent {}
