import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { places } from './lib/catalogue';

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

    await user.click(screen.getByRole('tab', { name: /Talukas/ }));
    expect(screen.getByRole('link', { name: 'Ramtek' })).toBeTruthy();
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
