import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tagType'
})
export class TagTypePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';
    
    // Split by colon and get the last two parts
    const parts = value.split(':');
    if (parts.length >= 2) {
      const lastTwo = parts.slice(-2);
      return `Type: ${lastTwo[0]} --> ${lastTwo[1]}`;
    }
    
    return value;
  }
}