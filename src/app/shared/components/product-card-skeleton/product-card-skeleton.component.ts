import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-product-card-skeleton',
  imports: [SkeletonLoaderComponent],
  template: `
    <div class="product-card-skeleton glass-effect">
      <app-skeleton-loader variant="image" />
      <div class="skeleton-content">
        <app-skeleton-loader variant="title" />
        <app-skeleton-loader variant="text" />
        <app-skeleton-loader variant="text" />
        <div class="skeleton-footer">
          <app-skeleton-loader variant="text" />
          <app-skeleton-loader variant="text" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card-skeleton {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
    }

    .skeleton-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      flex: 1;
    }

    .skeleton-footer {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-top: auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardSkeletonComponent {}
