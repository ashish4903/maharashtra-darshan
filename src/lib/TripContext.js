import { createContext } from 'react';

/** Saved places ("My trip"). Provided by components/TripProvider.jsx. */
export const TripContext = createContext({ ids: [], has: () => false, toggle: () => {}, clear: () => {} });
