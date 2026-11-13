import { describe, expect, it } from 'vitest';
import { addDays, assessDay, dayForecast, daysBetween, suggestSwap, tripForecastUrl } from './tripWeather';

const stop = (kind) => ({ place: { kind } });

describe('weather-aware trips', () => {
  it('works with local dates', () => {
    expect(addDays('2026-11-30', 2)).toBe('2026-12-02');
    expect(daysBetween('2026-11-12', '2026-11-28')).toBe(16);
  });

  it('asks Open-Meteo for each day’s place over the trip dates, with no key', () => {
    const url = new URL(tripForecastUrl([[18.5, 73.8], [19, 74]], '2026-11-14', '2026-11-15'));
    expect(url.searchParams.get('latitude')).toBe('18.5,19');
    expect(url.searchParams.get('start_date')).toBe('2026-11-14');
    expect(url.searchParams.get('daily')).toContain('precipitation_sum');
    expect(url.searchParams.has('apikey')).toBe(false);
  });

  it('reads the forecast for each day from a multi-place response', () => {
    const daily = (rain) => ({
      time: ['2026-11-14', '2026-11-15'],
      weather_code: [63, 0],
      temperature_2m_max: [27.6, 31],
      temperature_2m_min: [20, 19],
      precipitation_sum: rain,
      precipitation_probability_max: [90, 5],
    });
    const response = [{ daily: daily([30, 0]) }, { daily: daily([30, 0]) }];
    expect(dayForecast(response, 0)).toMatchObject({ code: 63, max: 28, rainMm: 30 });
    expect(dayForecast(response, 1)).toMatchObject({ code: 0, rainMm: 0 });
    expect(dayForecast(response, 2)).toBeNull();
  });

  it('warns about rain or heat only on outdoor days', () => {
    const rainy = { rainMm: 30, rainChance: 90, max: 26 };
    const hot = { rainMm: 0, rainChance: 0, max: 40 };
    expect(assessDay(rainy, [stop('fort'), stop('temple')])).toMatchObject({ rain: true, outdoor: 1 });
    expect(assessDay(rainy, [stop('temple')])).toMatchObject({ rain: false, wet: true });
    expect(assessDay(hot, [stop('nature')])).toMatchObject({ heat: true });
    expect(assessDay(null, [stop('fort')])).toMatchObject({ known: false });
  });

  it('suggests swapping a rainy outdoor day with a drier, less outdoor one', () => {
    const fortsInRain = { known: true, wet: true, rain: true, outdoor: 3 };
    const templesDry = { known: true, wet: false, rain: false, outdoor: 0 };
    const unknown = { known: false, wet: false, rain: false, outdoor: 0 };
    expect(suggestSwap([fortsInRain, templesDry])).toEqual({ from: 0, to: 1 });
    expect(suggestSwap([fortsInRain, unknown])).toBeNull();
    expect(suggestSwap([templesDry, templesDry])).toBeNull();
  });
});
