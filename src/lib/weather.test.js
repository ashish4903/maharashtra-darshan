import { describe, expect, it } from 'vitest';
import { forecastUrl, weatherKind } from './weather';

describe('weather', () => {
  it('asks Open-Meteo for a keyless daily forecast for the coordinates only', () => {
    const url = new URL(forecastUrl([18.52, 73.86]));
    expect(url.origin).toBe('https://api.open-meteo.com');
    expect(url.searchParams.get('latitude')).toBe('18.52');
    expect(url.searchParams.get('longitude')).toBe('73.86');
    expect(url.searchParams.get('daily')).toContain('weather_code');
    expect(url.searchParams.get('timezone')).toBe('Asia/Kolkata');
    expect(url.searchParams.has('apikey')).toBe(false);
  });

  it('groups weather codes', () => {
    expect(weatherKind(0).id).toBe('clear');
    expect(weatherKind(63).id).toBe('rain');
    expect(weatherKind(95).id).toBe('storm');
    expect(weatherKind(1234).id).toBe('unknown');
  });
});
