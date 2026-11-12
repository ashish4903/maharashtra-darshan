import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

afterEach(() => {
  cleanup();
  window.location.hash = '';
});

describe('App', () => {
  it('goes from a region to a district and its talukas', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('link', { name: /Vidarbha/ }));
    expect(await screen.findByRole('heading', { level: 1, name: /Vidarbha/ })).toBeTruthy();

    await user.click(screen.getByRole('link', { name: /^Nagpur/ }));
    expect(await screen.findByRole('heading', { level: 1, name: /Nagpur district/ })).toBeTruthy();
    expect(screen.getByText('Deekshabhoomi')).toBeTruthy();

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

  it('searches in Marathi', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox'), 'वडापाव');
    const results = screen.getByRole('region', { name: 'Search results' });
    expect(within(results).getByText('Vada pav')).toBeTruthy();
  });
});
