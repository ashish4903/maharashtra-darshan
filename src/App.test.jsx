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
    expect(screen.getByRole('heading', { level: 3, name: 'Ajanta Caves' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.getByText(/Nothing saved yet/)).toBeTruthy();
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
