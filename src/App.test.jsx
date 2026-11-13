import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { districts, places } from './lib/catalogue';

beforeEach(() => {
  // The place page loads a Wikipedia summary; tests never touch the network.
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => ({ extract: 'A summary from Wikipedia.' }) })),
  );
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.location.hash = '';
});

const go = async (hash) => {
  window.location.hash = hash;
  await new Promise((r) => setTimeout(r, 0));
};

describe('App', () => {
  it('goes from a region to a district and its talukas', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole('link', { name: /^Vidarbha/ })[0]);
    expect(await screen.findByRole('heading', { level: 1, name: /Vidarbha/ })).toBeTruthy();

    // Both the district card and the map bubble lead to Nagpur
    await user.click(screen.getAllByRole('link', { name: /^Nagpur/ })[0]);
    expect(await screen.findByRole('heading', { level: 1, name: /Nagpur district/ })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Deekshabhoomi' })).toBeTruthy();

    // A taluka with places opens the Places tab filtered to that taluka
    await user.click(screen.getByRole('tab', { name: /Talukas/ }));
    await user.click(screen.getByRole('button', { name: /^Ramtek/ }));
    expect(screen.getByRole('tab', { name: /Places/ }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('button', { name: /Ramtek \(\d+\)/ }).getAttribute('aria-pressed')).toBe('true');
    const shown = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(shown).toContain('Ramtek');
    expect(shown).not.toContain('Deekshabhoomi');
  });

  it('shows what a district is known for, and its taluka places', async () => {
    const user = userEvent.setup();
    const yavatmal = districts.find((d) => d.name === 'Yavatmal district');
    window.location.hash = `#/district/${yavatmal.id}`;
    render(<App />);

    const knownFor = screen.getByRole('list', { name: 'Known for' });
    expect(within(knownFor).getByText(/Cotton City/)).toBeTruthy();
    expect(screen.getByText('★ Shree Chintamani Ganesh temple')).toBeTruthy();

    await user.click(screen.getByRole('tab', { name: /About/ }));
    expect(await screen.findByText('A summary from Wikipedia.')).toBeTruthy();
  });

  it('finds districts and places by what they are known for', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox'), 'chintamani');
    const results = screen.getByRole('region', { name: 'Search results' });
    expect(within(results).getByText('Kalamb, Yavatmal')).toBeTruthy();

    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'cotton city');
    expect(screen.getByRole('link', { name: 'Yavatmal district' })).toBeTruthy();
  });

  it('filters a region’s places by type', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/region/marathwada';
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /Places/ }));
    await user.click(screen.getByRole('button', { name: /Forts/ }));
    const cards = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(cards).toContain('Daulatabad Fort');
    expect(cards).not.toContain('Ajanta Caves');
  });

  it('reads a place aloud with the device’s voice, and can pause and stop', async () => {
    const user = userEvent.setup();
    const spoken = [];
    const synth = {
      getVoices: () => [{ lang: 'en-IN', name: 'English (India)' }],
      speak: vi.fn((u) => spoken.push(u)),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      addEventListener: () => {},
      removeEventListener: () => {},
    };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        constructor(text) {
          this.text = text;
        }
      },
    );
    const ajanta = places.find((p) => p.name === 'Ajanta Caves');
    window.location.hash = `#/place/${ajanta.id}`;
    render(<App />);
    await screen.findByText('A summary from Wikipedia.');

    await user.click(screen.getByRole('button', { name: 'Listen to Ajanta Caves' }));
    const text = spoken.map((u) => u.text);
    expect(text[0]).toBe('Ajanta Caves.');
    expect(text).toContain('A summary from Wikipedia.');
    expect(spoken[0].lang).toBe('en-IN');

    await user.click(screen.getByRole('button', { name: /Pause/ }));
    expect(synth.pause).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /Resume/ }));
    await user.click(screen.getByRole('button', { name: /Stop/ }));
    expect(synth.cancel).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Listen to Ajanta Caves' })).toBeTruthy();
    cleanup();

    // In Marathi on a device with no Marathi or Hindi voice, it reads English and says so
    spoken.length = 0;
    localStorage.setItem('maharashtra-darshan-lang-v1', 'mr');
    render(<App />);
    await screen.findByText('A summary from Wikipedia.');
    await user.click(screen.getByRole('button', { name: /बद्दल ऐका/ }));
    expect(spoken[0].text).toBe('Ajanta Caves.');
    expect(screen.getByText(/मराठी आवाज नाही/)).toBeTruthy();
  });

  it('walks a history trail through time, on the map and in the address', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('link', { name: /Shivaji Maharaj and Swarajya/ }));
    expect(screen.getByRole('heading', { level: 1, name: /Shivaji Maharaj and Swarajya/ })).toBeTruthy();

    const player = screen.getByRole('region', { name: 'Timeline' });
    expect(within(player).getByRole('heading', { level: 2, name: 'Shivneri Fort' })).toBeTruthy();
    expect(within(player).getByText(/born at the fort on 19 February 1630/)).toBeTruthy();
    expect(within(player).getByRole('link', { name: /^Wikipedia: Shivneri/ })).toBeTruthy();
    expect(window.location.hash).toBe('#/trail/shivaji/1');
    // The map draws the story so far: one stop
    expect(within(player).getAllByRole('link', { name: /^Stop \d+:/ })).toHaveLength(1);

    await user.click(within(player).getByRole('button', { name: /Later/ }));
    expect(within(player).getByRole('heading', { level: 2, name: 'Torna Fort' })).toBeTruthy();
    expect(within(player).getAllByRole('link', { name: /^Stop \d+:/ })).toHaveLength(2);
    expect(window.location.hash).toBe('#/trail/shivaji/2');

    // Jump from the timeline list, and the slider follows
    const story = screen.getByRole('region', { name: 'The whole story' });
    await user.click(within(story).getByRole('button', { name: /Raigad Fort/ }));
    expect(within(player).getByRole('heading', { level: 2, name: 'Raigad Fort' })).toBeTruthy();
    expect(within(player).getByRole('slider').value).toBe(String(within(story).getAllByRole('button').length - 1));
    expect(within(player).getByRole('button', { name: /Later/ }).disabled).toBe(true);

    // The place page links back to the trail at its stop
    await user.click(within(player).getByRole('link', { name: 'Raigad Fort' }));
    await new Promise((r) => setTimeout(r, 0));
    const inHistory = screen.getByText('In history:').closest('p');
    expect(within(inHistory).getByRole('link', { name: /Shivaji Maharaj and Swarajya/ }).getAttribute('href')).toMatch(
      /^#\/trail\/shivaji\/\d+$/,
    );
  });

  it('opens a trail at a shared stop, in Marathi', async () => {
    localStorage.setItem('maharashtra-darshan-lang-v1', 'mr');
    window.location.hash = '#/trail/freedom/4';
    render(<App />);
    const player = screen.getByRole('region', { name: 'कालपट' });
    expect(within(player).getByText('१९४२–१९४४')).toBeTruthy();
    expect(within(player).getByText(/भारत छोडो आंदोलन/)).toBeTruthy();
  });

  it('opens a place with its Wikipedia summary and nearby places', async () => {
    const ajanta = places.find((p) => p.name === 'Ajanta Caves');
    window.location.hash = `#/place/${ajanta.id}`;
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /Ajanta Caves/ })).toBeTruthy();
    expect(await screen.findByText('A summary from Wikipedia.')).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/page/summary/Ajanta_Caves'), expect.anything());
    const nearby = screen.getByRole('region', { name: 'Nearby places' });
    expect(within(nearby).getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0);

    // Food spots open Google Maps, which shows its own current ratings
    const restaurants = screen.getByRole('link', { name: /Top-rated restaurants nearby/ });
    expect(restaurants.getAttribute('href')).toBe(
      'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent('restaurants near Ajanta Caves, Chhatrapati Sambhajinagar'),
    );
    const food = screen.getByRole('region', { name: 'Food to try nearby' });
    const spot = within(food).getAllByRole('link', { name: /on Google Maps/ })[0];
    expect(decodeURIComponent(spot.getAttribute('href'))).toMatch(/ near Ajanta Caves$/);
  });

  it('saves places to my trip', async () => {
    const user = userEvent.setup();
    const ajanta = places.find((p) => p.name === 'Ajanta Caves');
    window.location.hash = `#/place/${ajanta.id}`;
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Save to my trip/ }));
    expect(screen.getByRole('button', { name: /Saved to my trip/ })).toBeTruthy();
    expect(within(screen.getByRole('navigation', { name: 'Main' })).getByText('1')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('maharashtra-darshan-trip-v1'))).toEqual([ajanta.id]);

    await go('#/trip');
    expect(await screen.findByRole('heading', { level: 1, name: 'My trip' })).toBeTruthy();
    const day1 = screen.getByRole('region', { name: 'Day 1' });
    expect(within(day1).getByText('Ajanta Caves')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Stop 1: Ajanta Caves' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.getByText(/Nothing saved yet/)).toBeTruthy();
  });

  it('plans a trip into days with Google Maps directions, and opens shared trips', async () => {
    const user = userEvent.setup();
    const pick = ['Ajanta Caves', 'Ellora Caves', 'Daulatabad Fort', 'Bibi Ka Maqbara', 'Shaniwar Wada'].map(
      (name) => places.find((p) => p.name === name).id,
    );
    window.location.hash = `#/trip/${pick.join(',')}`;
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'A shared trip' })).toBeTruthy();
    expect(screen.getByText(/5 stops/)).toBeTruthy();
    // 3 stops a day by default, and Pune is far from the Sambhajinagar sites
    expect(screen.getAllByRole('region', { name: /^Day \d$/ }).length).toBeGreaterThanOrEqual(2);
    const directions = screen.getAllByRole('link', { name: /Directions/ })[0].getAttribute('href');
    expect(directions).toMatch(/^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&/);

    await user.selectOptions(screen.getByRole('combobox', { name: /Stops a day/ }), '6');
    expect(screen.getAllByRole('region', { name: /^Day \d$/ }).length).toBeGreaterThanOrEqual(1);

    await user.click(screen.getByRole('button', { name: /Save all to my trip/ }));
    expect(JSON.parse(localStorage.getItem('maharashtra-darshan-trip-v1'))).toEqual(pick);
    expect(screen.getByRole('button', { name: /Saved to my trip/ })).toBeTruthy();
  });

  it('plans a circuit in its traditional order and adds it to my trip', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/circuit/ashtavinayak';
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /Ashtavinayak/ })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: /Order/ }).value).toBe('given');
    expect(screen.getByRole('link', { name: /^Stop 1: Ganesha Temple, Morgaon/ })).toBeTruthy();
    // Every stop is on the route: in the banner and in the route summary
    expect(screen.getAllByText(/8 stops/)).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: /Add all to my trip/ }));
    expect(JSON.parse(localStorage.getItem('maharashtra-darshan-trip-v1'))).toHaveLength(8);
    expect(screen.getByRole('button', { name: /All in my trip/ })).toBeTruthy();
  });

  it('shows circuits on the home page and on their places', async () => {
    render(<App />);
    const section = screen.getByRole('region', { name: 'Circuits and pilgrimages' });
    expect(within(section).getByRole('link', { name: /Jyotirlingas of Maharashtra/ })).toBeTruthy();

    cleanup();
    const ajanta = places.find((p) => p.name === 'Ajanta Caves');
    window.location.hash = `#/place/${ajanta.id}`;
    render(<App />);
    expect(screen.getByRole('link', { name: /UNESCO World Heritage Sites/ })).toBeTruthy();
  });

  it('switches the whole app to Marathi and remembers it', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /View in Marathi/ }));
    expect(document.documentElement.lang).toBe('mr');
    expect(screen.getByRole('heading', { level: 2, name: 'विभाग निवडा' })).toBeTruthy();
    // Region card and map legend
    expect(screen.getAllByRole('link', { name: /^विदर्भ/ }).length).toBeGreaterThan(1);
    expect(screen.getByRole('link', { name: /माझी सहल/ })).toBeTruthy();
    expect(localStorage.getItem('maharashtra-darshan-lang-v1')).toBe('mr');

    // Place pages use Marathi names, with the English one alongside
    cleanup();
    const ajanta = places.find((p) => p.name === 'Ajanta Caves');
    window.location.hash = `#/place/${ajanta.id}`;
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /अजिंठा/ })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: /Ajanta Caves/ })).toBeTruthy();
    expect(screen.getByText('जवळची ठिकाणे')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /View in English/ }));
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByText('Nearby places')).toBeTruthy();
  });

  it('shows a short weather forecast on place pages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => ({
        ok: true,
        json: async () =>
          url.startsWith('https://api.open-meteo.com/')
            ? {
                daily: {
                  time: ['2026-11-12', '2026-11-13'],
                  weather_code: [0, 63],
                  temperature_2m_max: [31.4, 28],
                  temperature_2m_min: [18.6, 19],
                  precipitation_probability_max: [0, 80],
                },
              }
            : { extract: 'A summary from Wikipedia.' },
      })),
    );
    const lonar = places.find((p) => p.name === 'Lonar Lake');
    window.location.hash = `#/place/${lonar.id}`;
    render(<App />);

    const weather = await screen.findByRole('region', { name: 'Weather here' });
    expect(within(weather).getByText('Today')).toBeTruthy();
    expect(within(weather).getByText('Clear')).toBeTruthy();
    expect(within(weather).getByText('31° / 19°')).toBeTruthy();
    expect(within(weather).getByText('Rain')).toBeTruthy();
    expect(within(weather).getByRole('link', { name: /Open-Meteo/ })).toBeTruthy();
    const call = fetch.mock.calls.find(([u]) => u.startsWith('https://api.open-meteo.com/'))[0];
    expect(new URL(call).searchParams.get('latitude')).toBe(String(lonar.coords[0]));
  });

  it('shows places and dishes that have no Wikipedia article, with their source', async () => {
    const farkande = places.find((p) => p.name === 'Swinging Towers of Farkande');
    expect(farkande.wikipedia).toBeUndefined();
    window.location.hash = `#/place/${farkande.id}`;
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /Swinging Towers of Farkande/ })).toBeTruthy();
    const source = screen.getByRole('link', { name: /Source: jalgaon\.gov\.in/ });
    expect(source.getAttribute('href')).toMatch(/^https:\/\/jalgaon\.gov\.in\//);
    expect(screen.getByText(/no Wikipedia article about this place yet/)).toBeTruthy();
    // No Wikipedia summary is requested for it
    expect(fetch.mock.calls.some(([u]) => u.includes('/page/summary/'))).toBe(false);

    cleanup();
    const nagpur = districts.find((d) => d.name === 'Nagpur district');
    window.location.hash = `#/district/${nagpur.id}`;
    render(<App />);
    await userEvent.setup().click(screen.getByRole('tab', { name: /Food/ }));
    const tarri = screen.getByRole('heading', { level: 3, name: 'Tarri poha' }).closest('.card');
    expect(within(tarri).getByText(/Source: en\.wikipedia\.org/)).toBeTruthy();
  });

  it('warns about rain on an outdoor day and swaps it with a drier one', async () => {
    // Fake forecast: heavy rain over the forts south-west of Pune, dry over the city temples
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        if (!url.startsWith('https://api.open-meteo.com/v1/forecast?') || !url.includes('start_date')) {
          return { ok: true, json: async () => ({ extract: 'A summary from Wikipedia.' }) };
        }
        const lats = new URL(url).searchParams.get('latitude').split(',').map(Number);
        const response = lats.map(() => ({
          daily: {
            time: lats.map((_, i) => `d${i}`),
            weather_code: lats.map((lat) => (lat < 18.45 ? 63 : 0)),
            temperature_2m_max: lats.map(() => 28),
            temperature_2m_min: lats.map(() => 20),
            precipitation_sum: lats.map((lat) => (lat < 18.45 ? 40 : 0)),
            precipitation_probability_max: lats.map((lat) => (lat < 18.45 ? 95 : 5)),
          },
        }));
        return { ok: true, json: async () => response };
      }),
    );
    const user = userEvent.setup();
    const names = ['Sinhagad', 'Torna Fort', 'Rajgad', 'Kasba Ganapati', 'Dagadusheth Halwai Ganapati Temple', 'Chaturshringi Temple'];
    const ids = names.map((n) => places.find((p) => p.name === n).id);
    window.location.hash = `#/trip/${ids.join(',')}`;
    render(<App />);

    const warning = await screen.findByText(/Heavy rain likely/);
    const rainyDay = warning.closest('section');
    expect(within(rainyDay).getByText('Sinhagad')).toBeTruthy();
    const rainyName = rainyDay.getAttribute('aria-label');

    await user.click(within(rainyDay).getByRole('button', { name: /Swap with Day \d \(drier\)/ }));
    const fortsDay = screen.getByText('Sinhagad').closest('section');
    expect(fortsDay.getAttribute('aria-label')).not.toBe(rainyName);
  });

  it('plans a getaway from a starting point and saves it', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/plan';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Plan a getaway' })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: /Starting from/ }).value).toBe('Q1797336'); // Pune

    await user.click(screen.getByRole('button', { name: /Forts/ }));
    await user.click(screen.getByRole('button', { name: '1 day' }));
    const day1 = screen.getByRole('region', { name: 'Day 1' });
    expect(within(day1).getAllByRole('listitem').length).toBeGreaterThan(0);
    expect(screen.getByRole('combobox', { name: /Order/ }).value).toBe('given');

    await user.click(screen.getByRole('button', { name: /Save all to my trip/ }));
    expect(JSON.parse(localStorage.getItem('maharashtra-darshan-trip-v1')).length).toBeGreaterThan(0);

    // Changing the start re-plans the trip
    await user.selectOptions(screen.getByRole('combobox', { name: /Starting from/ }), 'Q1797367'); // Nagpur
    expect(screen.getByRole('button', { name: /Save all to my trip/ })).toBeTruthy();
  });

  it('shows where to go in any month, and the best time on a place', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/seasons';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Where to go, and when' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /^Jan/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Best in January' })).toBeTruthy();
    const atBest = screen.getByRole('region', { name: 'Places at their best' });
    expect(within(atBest).getByRole('heading', { level: 3, name: 'Bhigwan' })).toBeTruthy();
    expect(within(atBest).getByText(/Bird season · Dec–Mar/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /^Aug/ }));
    expect(screen.getByRole('heading', { level: 3, name: 'Kas Plateau Reserved Forest' })).toBeTruthy();

    cleanup();
    const thoseghar = places.find((p) => p.name === 'Thoseghar Waterfalls');
    window.location.hash = `#/place/${thoseghar.id}`;
    render(<App />);
    expect(screen.getByText('Best time')).toBeTruthy();
    expect(screen.getByText(/Monsoon waterfalls · Jul–Nov/)).toBeTruthy();
  });

  it('lists festivals month by month and on their places', async () => {
    window.location.hash = '#/festivals';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Festivals and fairs' })).toBeTruthy();
    const august = screen.getByRole('region', { name: 'August' });
    expect(within(august).getByRole('heading', { level: 3, name: 'Ganesh Chaturthi' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Every few years' })).toBeTruthy();

    cleanup();
    const pandharpur = places.find((p) => p.name === 'Pandharpur');
    window.location.hash = `#/place/${pandharpur.id}`;
    render(<App />);
    expect(screen.getByRole('link', { name: /Pandharpur Vari/ })).toBeTruthy();
  });

  it('searches in Marathi', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox'), 'वडापाव');
    const results = screen.getByRole('region', { name: 'Search results' });
    expect(within(results).getByText('Vada pav')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.queryByRole('region', { name: 'Search results' })).toBeNull();
  });
});
