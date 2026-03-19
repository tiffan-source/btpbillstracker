import { Injectable } from '@angular/core';
import { ReferenceGeneratorService } from '../domain/ports/reference-generator.service';

@Injectable({ providedIn: 'root' })
export class SimpleReferenceGenerator implements ReferenceGeneratorService {
  async generate(): Promise<string> {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `F-${year}-${random}`;
  }
}
