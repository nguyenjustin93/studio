import { Block } from '../types';

type BucketSize = 'Small' | 'Medium' | 'Large';

function createBlock(
  name: string,
  clubs: string[],
  durationMinutes: number,
  index: number
): Block {
  return {
    id: `block-${index}-${name.replace(/\s/g, '-').toLowerCase()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    suggestedClubs: clubs,
    durationMinutes,
  };
}

// Per-block durations in minutes, keyed by bucket size.
// Totals: Small ≈ 30 min, Medium ≈ 50 min, Large ≈ 70 min.
// Wedges and short irons receive the most time; driver/fairway slightly less;
// putter the least.

const FULL_BAG_DURATIONS: Record<BucketSize, number[]> = {
  //         Driver  Fairway  LongI  MidI  ShortI  Wedges  Putter
  Small:  [      4,       4,     4,    4,      5,      6,      3], // 30 min
  Medium: [      6,       6,     7,    7,      8,     10,      6], // 50 min
  Large:  [      9,       9,    10,   10,     12,     14,      6], // 70 min
};

const EVEN_DAY_DURATIONS: Record<BucketSize, number[]> = {
  //         Fairway  4&6  8&PW  Putter
  Small:  [       7,   7,    9,     7], // 30 min
  Medium: [      11,  12,   15,    12], // 50 min
  Large:  [      15,  17,   22,    16], // 70 min
};

const ODD_DAY_DURATIONS: Record<BucketSize, number[]> = {
  //         Driver  5&7  9&Wedges  Putter
  Small:  [      7,   8,        9,     6], // 30 min
  Medium: [     11,  13,       16,    10], // 50 min
  Large:  [     15,  18,       23,    14], // 70 min
};

const FOCUS_CLUB_DURATIONS: Record<BucketSize, number> = {
  Small: 30,
  Medium: 50,
  Large: 70,
};

export function getBlocksForTemplate(
  template: 'Full Bag' | 'Even Day' | 'Odd Day' | 'Focus Club',
  bucketSize: BucketSize,
  focusClub?: string
): Block[] {
  switch (template) {
    case 'Full Bag': {
      const d = FULL_BAG_DURATIONS[bucketSize];
      return [
        createBlock('Driver',      ['Driver'],        d[0], 0),
        createBlock('Fairway',     ['3W', '5W'],       d[1], 1),
        createBlock('Long Irons',  ['4i', '5i'],       d[2], 2),
        createBlock('Mid Irons',   ['6i', '7i'],       d[3], 3),
        createBlock('Short Irons', ['8i', '9i'],       d[4], 4),
        createBlock('Wedges',      ['PW', 'SW', 'LW'], d[5], 5),
        createBlock('Putter',      ['Putter'],         d[6], 6),
      ];
    }

    case 'Even Day': {
      const d = EVEN_DAY_DURATIONS[bucketSize];
      return [
        createBlock('Fairway', ['3W', '5W'],  d[0], 0),
        createBlock('4 & 6',   ['4i', '6i'],  d[1], 1),
        createBlock('8 & PW',  ['8i', 'PW'],  d[2], 2),
        createBlock('Putter',  ['Putter'],    d[3], 3),
      ];
    }

    case 'Odd Day': {
      const d = ODD_DAY_DURATIONS[bucketSize];
      return [
        createBlock('Driver',     ['Driver'],       d[0], 0),
        createBlock('5 & 7',      ['5i', '7i'],     d[1], 1),
        createBlock('9 & Wedges', ['9i', 'SW', 'LW'], d[2], 2),
        createBlock('Putter',     ['Putter'],       d[3], 3),
      ];
    }

    case 'Focus Club': {
      const club = focusClub?.trim() || 'Focus Club';
      return [
        createBlock(club, [club], FOCUS_CLUB_DURATIONS[bucketSize], 0),
      ];
    }

    default:
      return [];
  }
}
