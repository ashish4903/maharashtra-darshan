import { describe, expect, it } from 'vitest';
import { categoryUrl, fileCaption, galleryUrl, parseGallery, plainText } from './commons';

let index = 0;
const file = (title, { mime = 'image/jpeg', licence = 'CC BY-SA 4.0', artist = 'A. Person' } = {}) => ({
  title: `File:${title}`,
  index: ++index,
  imageinfo: [
    {
      thumburl: `https://upload.wikimedia.org/thumb/${title}/400px-${title}?utm_source=commons.wikimedia.org`,
      mime,
      extmetadata: { LicenseShortName: { value: licence }, Artist: { value: artist } },
    },
  ],
});

describe('commons gallery', () => {
  it('asks Commons for a category only, anonymously and without keys', () => {
    const url = new URL(galleryUrl('Gateway of India'));
    expect(url.origin).toBe('https://commons.wikimedia.org');
    expect(url.searchParams.get('gsrsearch')).toBe('incategory:"Gateway_of_India" filemime:image/jpeg');
    expect(url.searchParams.get('origin')).toBe('*');
    expect([...url.searchParams.keys()].some((k) => /key|token/i.test(k))).toBe(false);
  });

  it('keeps freely licensed photos in search order, without the one already shown', () => {
    const b = file('B.jpg');
    const a = file('A.jpg', { licence: 'CC0' });
    const photos = parseGallery(
      {
        query: {
          pages: [
            a,
            b,
            file('Shown photo.jpg'),
            file('Map.svg', { mime: 'image/svg+xml' }),
            file('Badge.png', { mime: 'image/png' }),
            file('Fair use.jpg', { licence: 'Fair use' }),
            file('Video.webm', { mime: 'video/webm' }),
            { title: 'File:Broken.jpg' },
          ],
        },
      },
      { skipFile: 'Shown_photo.jpg' },
    );
    expect(photos.map((p) => p.file)).toEqual(['B.jpg', 'A.jpg']);
    expect(photos[1]).toEqual({
      file: 'A.jpg',
      src: 'https://upload.wikimedia.org/thumb/A.jpg/400px-A.jpg',
      licence: 'CC0',
      author: 'A. Person',
    });
  });

  it('copes with an empty or failed response, and caps the count', () => {
    expect(parseGallery(null)).toEqual([]);
    expect(parseGallery({})).toEqual([]);
    const many = { query: { pages: Array.from({ length: 30 }, (_, i) => file(`P${String(i).padStart(2, '0')}.jpg`)) } };
    expect(parseGallery(many)).toHaveLength(12);
  });

  it('turns the author HTML into plain text', () => {
    expect(plainText('<a href="//commons.wikimedia.org/wiki/User:X">X &amp; Y</a>\n<script>bad()</script>')).toBe(
      'X & Y bad()',
    );
    expect(plainText(undefined)).toBe('');
  });

  it('builds captions and category links', () => {
    expect(fileCaption('Gateway_of_India_2019.JPG')).toBe('Gateway of India 2019');
    expect(categoryUrl('Gateway of India')).toBe('https://commons.wikimedia.org/wiki/Category:Gateway_of_India');
  });
});
