import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'themeName'
})
export class ThemeNamePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';
    
    // Convert theme_1 to Theme 1, theme_2 to Theme 2, etc.
    const match = value.match(/theme_(\d+)/);
    if (match) {
      return `Theme ${match[1]}`;
    }
    
    return value;
  }
}
