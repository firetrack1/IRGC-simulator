import type { Region } from '../types';

// Positions are stylized [x, z] coordinates on the map plane, not to real scale.
export const INITIAL_REGIONS: Region[] = [
  { id: 'iran', name: 'Iran (Homeland)', position: [0, 0], intensity: 0, controlShare: 100, supplyLineIntact: true, isHomeland: true },
  { id: 'iraq', name: 'Iraq', position: [-3.2, 0.6], intensity: 1, controlShare: 35, supplyLineIntact: true },
  { id: 'syria', name: 'Syria', position: [-6.4, 1.2], intensity: 2, controlShare: 40, supplyLineIntact: true },
  { id: 'lebanon', name: 'Lebanon', position: [-8.2, 1.6], intensity: 3, controlShare: 55, supplyLineIntact: true },
  { id: 'yemen', name: 'Yemen', position: [-2.0, -4.2], intensity: 2, controlShare: 30, supplyLineIntact: true },
  { id: 'gulf', name: 'Gulf States', position: [-4.4, -2.6], intensity: 0, controlShare: 10, supplyLineIntact: true },
  { id: 'afghanistan', name: 'Afghanistan', position: [3.8, 0.6], intensity: 1, controlShare: 20, supplyLineIntact: true },
];
