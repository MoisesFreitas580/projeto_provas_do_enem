import { Injectable } from '@angular/core';
import { environment } from '@environments/environments';

@Injectable({ providedIn: 'root' })
export class ImagesService {
  private readonly base_url = environment.image + 'images/path/';

  public buildUrl(path?: string | null): string | null {
    console.log('Building image URL for path:', path);
    if (!path) return null;

    if (/^https?:\/\//i.test(path)) return path;

    const segments = path
      .split('/')
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
      .map((segment) => encodeURIComponent(segment));

    if (segments.length === 0) return null;
    console.log('Image URL:', this.base_url + segments.join('/'));
    return this.base_url + segments.join('/');
  }
}