import { parseDatesWorn } from './utils';

export interface WearStats {
  last1m: number;
  last3m: number;
  last6m: number;
  last12m: number;
  frequencyText: string;
}

export const getHeightBadgeStyle = (height: string) => {
  const h = height.toLowerCase();
  if (h.includes('low')) {
    return 'bg-sky-600 text-white';
  }
  if (h.includes('mid')) {
    return 'bg-amber-600 text-white';
  }
  if (h.includes('high')) {
    return 'bg-rose-600 text-white';
  }
  return 'bg-emerald-600 text-white';
};

export const getConditionBadgeStyle = (condition: string, variant: 'light' | 'dark' = 'light') => {
  const c = condition.toLowerCase();

  let color = 'emerald';

  if (c.includes('beater')) {
    color = 'red';
  } else if (c.includes('poor')) {
    color = 'orange';
  } else if (c.includes('fair')) {
    color = 'amber';
  } else if (c.includes('very good')) {
    color = 'lime';
  } else if (c.includes('good')) {
    color = 'yellow';
  } else if (c.includes('excellent')) {
    color = 'green';
  } else if (c.includes('vnds') || c.includes('very near deadstock')) {
    color = 'emerald';
  } else if (c.includes('ds') || c.includes('deadstock')) {
    color = 'sky';
  }

  if (variant === 'dark') {
    switch (color) {
      case 'red': return 'bg-red-600/10 text-red-400 border-red-700/20';
      case 'orange': return 'bg-orange-600/10 text-orange-400 border-orange-700/20';
      case 'amber': return 'bg-amber-600/10 text-amber-400 border-amber-700/20';
      case 'yellow': return 'bg-yellow-600/10 text-yellow-400 border-yellow-700/20';
      case 'lime': return 'bg-lime-600/10 text-lime-400 border-lime-700/20';
      case 'green': return 'bg-green-600/10 text-green-400 border-green-700/20';
      case 'emerald': return 'bg-emerald-600/10 text-emerald-400 border-emerald-700/20';
      case 'sky': return 'bg-sky-600/10 text-sky-400 border-sky-700/20';
      default: return 'bg-emerald-600/10 text-emerald-400 border-emerald-700/20';
    }
  }

  // Light variant
  switch (color) {
    case 'red': return 'bg-red-50 text-red-700 border-red-200/80';
    case 'orange': return 'bg-orange-50 text-orange-700 border-orange-200/80';
    case 'amber': return 'bg-amber-50 text-amber-800 border-amber-200/80';
    case 'yellow': return 'bg-yellow-50 text-yellow-800 border-yellow-200/80';
    case 'lime': return 'bg-lime-50 text-lime-800 border-lime-200/80';
    case 'green': return 'bg-green-50 text-green-700 border-green-200/80';
    case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    case 'sky': return 'bg-sky-50 text-sky-700 border-sky-200/80';
    default: return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  }
};

export function calculateWearStats(
  datesWorn?: unknown,
  totalWornCount: number = 0,
  lastWornDateStr?: string | null
): WearStats {
  const nowMs = Date.now();

  const ms1m = 30 * 24 * 60 * 60 * 1000;
  const ms3m = 90 * 24 * 60 * 60 * 1000;
  const ms6m = 180 * 24 * 60 * 60 * 1000;
  const ms12m = 365 * 24 * 60 * 60 * 1000;

  const parsedIsoDates = parseDatesWorn(datesWorn);
  const validTimes: number[] = parsedIsoDates
    .map(d => new Date(d).getTime())
    .filter(t => !isNaN(t))
    .sort((a, b) => a - b);

  // Normalize last_worn if it's 'Never' or an invalid string
  let normalizedLastWorn = lastWornDateStr;
  if (normalizedLastWorn && (normalizedLastWorn.toLowerCase() === 'never' || isNaN(new Date(normalizedLastWorn).getTime()))) {
    normalizedLastWorn = null;
  }

  const rawWornNum = Number(totalWornCount) || 0;
  const totalWears = Math.max(rawWornNum, validTimes.length);

  let l1 = 0;
  let l3 = 0;
  let l6 = 0;
  let l12 = 0;

  if (validTimes.length > 0) {
    validTimes.forEach(t => {
      const diff = nowMs - t;
      if (diff >= -86400000) { // allow 1 day tolerance for timezones
        if (diff <= ms1m) l1++;
        if (diff <= ms3m) l3++;
        if (diff <= ms6m) l6++;
        if (diff <= ms12m) l12++;
      }
    });
  } else if (totalWears > 0 && normalizedLastWorn) {
    const lwTime = new Date(normalizedLastWorn).getTime();
    if (!isNaN(lwTime)) {
      const diff = nowMs - lwTime;
      if (diff <= ms1m) l1 = Math.min(totalWears, 1);
      if (diff <= ms3m) l3 = Math.min(totalWears, 1);
      if (diff <= ms6m) l6 = Math.min(totalWears, 1);
      if (diff <= ms12m) l12 = Math.min(totalWears, 1);
    }
  }

  let frequencyText = 'Never worn';

  if (totalWears === 0) {
    frequencyText = 'Never worn';
  } else if (totalWears === 1) {
    frequencyText = 'Worn once';
  } else if (validTimes.length >= 2) {
    let avgGapDays = 0;
    const tFirst = validTimes[0];
    const tLast = validTimes[validTimes.length - 1];
    const daysBetweenWears = (tLast - tFirst) / (24 * 60 * 60 * 1000);
    const gaps = validTimes.length - 1;

    const gapFromWears = gaps > 0 ? daysBetweenWears / gaps : 0;
    const daysFromFirstToNow = Math.max(0, (nowMs - tFirst) / (24 * 60 * 60 * 1000));
    const overallAvgSpan = daysFromFirstToNow / validTimes.length;

    if (gapFromWears <= 0) {
      avgGapDays = overallAvgSpan;
    } else if (daysFromFirstToNow > daysBetweenWears + gapFromWears) {
      avgGapDays = Math.max(gapFromWears, overallAvgSpan);
    } else {
      avgGapDays = gapFromWears;
    }

    if (avgGapDays < 1.5) {
      frequencyText = 'Every day';
    } else if (avgGapDays < 25) {
      const roundedDays = Math.max(1, Math.round(avgGapDays));
      if (roundedDays === 1) {
        frequencyText = 'Every ~1 day';
      } else {
        frequencyText = `Every ~${roundedDays} days`;
      }
    } else if (avgGapDays <= 45) {
      frequencyText = 'Every ~1 month';
    } else if (avgGapDays < 300) {
      const roundedMonths = Math.max(1, Math.round(avgGapDays / 30));
      frequencyText = `Every ~${roundedMonths} ${roundedMonths === 1 ? 'month' : 'months'}`;
    } else {
      frequencyText = 'Rarely';
    }
  } else {
    frequencyText = 'Needs more data';
  }

  return {
    last1m: l1,
    last3m: l3,
    last6m: l6,
    last12m: l12,
    frequencyText,
  };
}
