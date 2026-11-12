import { useContext } from 'react';
import { TripContext } from './TripContext';

export default function useTrip() {
  return useContext(TripContext);
}
