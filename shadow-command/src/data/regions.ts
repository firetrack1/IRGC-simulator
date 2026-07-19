import type { Region } from '../types';
import { PLAYABLE_GEOMETRY } from './worldGeo';

const centroid = (id: string): [number, number] => PLAYABLE_GEOMETRY[id].centroid;

export const INITIAL_REGIONS: Region[] = [
  { id: 'iran', name: 'Iran (Homeland)', position: centroid('iran'), intensity: 0, controlShare: 100, supplyLineIntact: true, isHomeland: true },
  { id: 'iraq', name: 'Iraq', position: centroid('iraq'), intensity: 1, controlShare: 35, supplyLineIntact: true },
  { id: 'syria', name: 'Syria', position: centroid('syria'), intensity: 2, controlShare: 40, supplyLineIntact: true },
  { id: 'lebanon', name: 'Lebanon', position: centroid('lebanon'), intensity: 3, controlShare: 55, supplyLineIntact: true },
  { id: 'yemen', name: 'Yemen', position: centroid('yemen'), intensity: 2, controlShare: 30, supplyLineIntact: true },
  { id: 'gulf', name: 'Gulf States', position: centroid('gulf'), intensity: 0, controlShare: 10, supplyLineIntact: true },
  { id: 'afghanistan', name: 'Afghanistan', position: centroid('afghanistan'), intensity: 1, controlShare: 20, supplyLineIntact: true },
  {
    id: 'usa',
    name: 'The United States ("The Great Satan")',
    position: centroid('usa'),
    intensity: 0,
    controlShare: 0,
    supplyLineIntact: true,
    isSuperpower: true,
  },
];
