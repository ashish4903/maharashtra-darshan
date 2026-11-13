import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import Carousel from './Carousel';
import LanguageProvider from './LanguageProvider';

// jsdom has no layout, so the row's sizes and scroll position are faked
let size = { scrollWidth: 0, clientWidth: 0 };
let scrollLeft = 0;
const fakeLayout = () => {
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(() => size.scrollWidth);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => size.clientWidth);
  vi.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockImplementation(() => scrollLeft);
};

const row = (n) => (
  <LanguageProvider>
    <Carousel title="Trails">
      {Array.from({ length: n }, (_, i) => (
        <li key={i}>Card {i}</li>
      ))}
    </Carousel>
  </LanguageProvider>
);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  scrollLeft = 0;
});

describe('Carousel', () => {
  it('shows no arrows when every card fits', () => {
    size = { scrollWidth: 800, clientWidth: 800 };
    fakeLayout();
    render(row(4));
    expect(screen.queryByRole('button', { name: /Scroll Trails/ })).toBeNull();
  });

  it('turns each arrow off at its end of the row', () => {
    size = { scrollWidth: 2000, clientWidth: 800 };
    fakeLayout();
    render(row(10));
    const back = screen.getByRole('button', { name: 'Scroll Trails back' });
    const forward = screen.getByRole('button', { name: 'Scroll Trails forward' });
    expect(back.disabled).toBe(true);
    expect(forward.disabled).toBe(false);

    const track = screen.getByRole('list');
    act(() => {
      scrollLeft = 600;
      fireEvent.scroll(track);
    });
    expect(back.disabled).toBe(false);
    expect(forward.disabled).toBe(false);

    act(() => {
      scrollLeft = 1200;
      fireEvent.scroll(track);
    });
    expect(back.disabled).toBe(false);
    expect(forward.disabled).toBe(true);
  });
});
