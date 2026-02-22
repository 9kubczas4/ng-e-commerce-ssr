import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent - Input Sanitization and Error Handling', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('XSS Prevention', () => {
    it('should remove script tags from input', () => {
      const mockEvent = {
        target: { value: '<script>alert("xss")</script>test' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).not.toContain('<script>');
      expect(component.searchQuery()).not.toContain('</script>');
      // Parentheses are allowed in the sanitization, so result is 'alert(xss)test'
      expect(component.searchQuery()).toBe('alert(xss)test');
    });

    it('should remove img tags with onerror handlers', () => {
      const mockEvent = {
        target: { value: '<img src=x onerror="alert(1)">test' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).not.toContain('<img');
      expect(component.searchQuery()).not.toContain('onerror');
      // The = sign is removed by sanitization, result is just 'test'
      expect(component.searchQuery()).toBe('test');
    });

    it('should remove iframe tags', () => {
      const mockEvent = {
        target: { value: '<iframe src="evil.com"></iframe>search' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).not.toContain('<iframe');
      expect(component.searchQuery()).not.toContain('</iframe>');
    });

    it('should remove style tags', () => {
      const mockEvent = {
        target: { value: '<style>body{display:none}</style>test' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).not.toContain('<style>');
      expect(component.searchQuery()).not.toContain('</style>');
    });

    it('should remove multiple HTML tags', () => {
      const mockEvent = {
        target: { value: '<div><span>nested</span></div>text' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).not.toContain('<div>');
      expect(component.searchQuery()).not.toContain('<span>');
      expect(component.searchQuery()).not.toContain('</div>');
      expect(component.searchQuery()).not.toContain('</span>');
    });

    it('should handle self-closing tags', () => {
      const mockEvent = {
        target: { value: '<br/>test<hr/>' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).not.toContain('<br/>');
      expect(component.searchQuery()).not.toContain('<hr/>');
    });
  });

  describe('Special Character Handling', () => {
    it('should allow alphanumeric characters', () => {
      const mockEvent = {
        target: { value: 'Angular123' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('Angular123');
    });

    it('should allow spaces', () => {
      const mockEvent = {
        target: { value: 'Angular Dev Shop' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('Angular Dev Shop');
    });

    it('should allow hyphens', () => {
      const mockEvent = {
        target: { value: 'best-practices' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('best-practices');
    });

    it('should allow apostrophes', () => {
      const mockEvent = {
        target: { value: "Angular's features" }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe("Angular's features");
    });

    it('should allow common punctuation', () => {
      const mockEvent = {
        target: { value: 'test.,!?@#$%&*()' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toContain('.');
      expect(component.searchQuery()).toContain(',');
      expect(component.searchQuery()).toContain('!');
      expect(component.searchQuery()).toContain('?');
      expect(component.searchQuery()).toContain('@');
      expect(component.searchQuery()).toContain('#');
      expect(component.searchQuery()).toContain('$');
      expect(component.searchQuery()).toContain('%');
      expect(component.searchQuery()).toContain('&');
      expect(component.searchQuery()).toContain('*');
      expect(component.searchQuery()).toContain('(');
      expect(component.searchQuery()).toContain(')');
    });

    it('should remove dangerous special characters', () => {
      const mockEvent = {
        target: { value: 'test<>[]{}\\|`~' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // These characters should be removed
      expect(component.searchQuery()).not.toContain('[');
      expect(component.searchQuery()).not.toContain(']');
      expect(component.searchQuery()).not.toContain('{');
      expect(component.searchQuery()).not.toContain('}');
      expect(component.searchQuery()).not.toContain('\\');
      expect(component.searchQuery()).not.toContain('|');
      expect(component.searchQuery()).not.toContain('`');
      expect(component.searchQuery()).not.toContain('~');
    });

    it('should handle unicode characters', () => {
      const mockEvent = {
        target: { value: 'Angular™ café' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // Should preserve unicode characters
      expect(component.searchQuery()).toContain('Angular');
      expect(component.searchQuery()).toContain('caf');
    });

    it('should handle emoji characters', () => {
      const mockEvent = {
        target: { value: 'Angular 🚀 test' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // Should handle emoji (may be removed by sanitization)
      expect(component.searchQuery()).toContain('Angular');
      expect(component.searchQuery()).toContain('test');
    });
  });

  describe('Whitespace Handling', () => {
    it('should trim leading whitespace', () => {
      const mockEvent = {
        target: { value: '   Angular' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('Angular');
    });

    it('should trim trailing whitespace', () => {
      const mockEvent = {
        target: { value: 'Angular   ' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('Angular');
    });

    it('should trim both leading and trailing whitespace', () => {
      const mockEvent = {
        target: { value: '   Angular   ' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('Angular');
    });

    it('should preserve internal whitespace', () => {
      const mockEvent = {
        target: { value: '  Angular  Dev  Shop  ' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('Angular  Dev  Shop');
    });

    it('should handle tabs and newlines', () => {
      const mockEvent = {
        target: { value: '\tAngular\nDev\rShop' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // Tabs and newlines should be handled (may be converted to spaces or removed)
      expect(component.searchQuery()).toContain('Angular');
      expect(component.searchQuery()).toContain('Dev');
      expect(component.searchQuery()).toContain('Shop');
    });
  });

  describe('Length Validation', () => {
    it('should accept input within length limit', () => {
      const validString = 'a'.repeat(100);
      const mockEvent = {
        target: { value: validString }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery().length).toBe(100);
    });

    it('should truncate input exceeding 100 characters', () => {
      const longString = 'a'.repeat(150);
      const mockEvent = {
        target: { value: longString }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery().length).toBe(100);
      expect(component.searchQuery()).toBe('a'.repeat(100));
    });

    it('should truncate very long input', () => {
      const veryLongString = 'Angular '.repeat(100); // 800 characters
      const mockEvent = {
        target: { value: veryLongString }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery().length).toBeLessThanOrEqual(100);
    });

    it('should handle empty string', () => {
      const mockEvent = {
        target: { value: '' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('');
    });

    it('should handle single character', () => {
      const mockEvent = {
        target: { value: 'a' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('a');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null-like input gracefully', () => {
      const mockEvent = {
        target: { value: null as unknown as string }
      } as unknown as Event;

      // Should not throw
      expect(() => component.onSearchInput(mockEvent)).not.toThrow();
    });

    it('should handle undefined input gracefully', () => {
      const mockEvent = {
        target: { value: undefined as unknown as string }
      } as unknown as Event;

      // Should not throw
      expect(() => component.onSearchInput(mockEvent)).not.toThrow();
    });

    it('should handle only whitespace input', () => {
      const mockEvent = {
        target: { value: '     ' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('');
    });

    it('should handle only HTML tags', () => {
      const mockEvent = {
        target: { value: '<div></div><span></span>' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toBe('');
    });

    it('should handle mixed valid and invalid characters', () => {
      const mockEvent = {
        target: { value: 'Angular<script>alert(1)</script> Dev{test}' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      expect(component.searchQuery()).toContain('Angular');
      expect(component.searchQuery()).toContain('Dev');
      expect(component.searchQuery()).not.toContain('<script>');
      expect(component.searchQuery()).not.toContain('{');
      expect(component.searchQuery()).not.toContain('}');
    });

    it('should handle repeated sanitization', () => {
      const mockEvent1 = {
        target: { value: '<script>test</script>' }
      } as unknown as Event;

      component.onSearchInput(mockEvent1);
      const firstResult = component.searchQuery();

      const mockEvent2 = {
        target: { value: '<script>test</script>' }
      } as unknown as Event;

      component.onSearchInput(mockEvent2);
      const secondResult = component.searchQuery();

      // Should produce consistent results
      expect(firstResult).toBe(secondResult);
    });

    it('should handle SQL injection attempts', () => {
      const mockEvent = {
        target: { value: "'; DROP TABLE products; --" }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      // Should sanitize but preserve some characters
      const result = component.searchQuery();
      expect(result).toContain('DROP');
      expect(result).toContain('TABLE');
      expect(result).toContain('products');
    });

    it('should handle JavaScript code injection attempts', () => {
      const mockEvent = {
        target: { value: 'javascript:alert(document.cookie)' }
      } as unknown as Event;

      component.onSearchInput(mockEvent);

      const result = component.searchQuery();
      expect(result).toContain('javascript');
      expect(result).toContain('alert');
      // Parentheses are allowed, so they may be present
    });
  });

  describe('Sanitization Consistency', () => {
    it('should produce same output for same input', () => {
      const input = '<script>test</script>Angular';
      const mockEvent = {
        target: { value: input }
      } as unknown as Event;

      component.onSearchInput(mockEvent);
      const result1 = component.searchQuery();

      component.onSearchInput(mockEvent);
      const result2 = component.searchQuery();

      expect(result1).toBe(result2);
    });

    it('should be idempotent', () => {
      const mockEvent1 = {
        target: { value: '<div>test</div>' }
      } as unknown as Event;

      component.onSearchInput(mockEvent1);
      const firstPass = component.searchQuery();

      // Apply sanitization again to already sanitized input
      const mockEvent2 = {
        target: { value: firstPass }
      } as unknown as Event;

      component.onSearchInput(mockEvent2);
      const secondPass = component.searchQuery();

      expect(firstPass).toBe(secondPass);
    });
  });
});
