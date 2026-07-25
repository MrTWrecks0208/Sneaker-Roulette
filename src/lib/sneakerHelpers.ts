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
    return 'bg-amber-600/10 text-amber-500 border-amber-600/20';
  }
  if (h.includes('high')) {
    return 'bg-rose-600/10 text-rose-500 border-rose-600/20';
  }
  return 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20';
};

export function calculateWearStats(
  datesWorn?: unknown,
  totalWornCount: number = 0,
  lastWornDateStr?: string | null,
  createdAtStr?: string | null
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
  } else {
    let avgGapDays = 0;

    if (validTimes.length >= 2) {
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
    } else {
      const tCreated = createdAtStr ? new Date(createdAtStr).getTime() : NaN;
      const tLast = normalizedLastWorn ? new Date(normalizedLastWorn).getTime() : NaN;
      let tRef = NaN;
      if (!isNaN(tCreated) && !isNaN(tLast)) tRef = Math.min(tCreated, tLast);
      else if (!isNaN(tCreated)) tRef = tCreated;
      else if (!isNaN(tLast)) tRef = tLast;

      const daysSpan = !isNaN(tRef) ? Math.max(1, (nowMs - tRef) / (24 * 60 * 60 * 1000)) : 30;
      avgGapDays = daysSpan / totalWears;
    }

    if (avgGapDays < 1.5 && totalWears >= 5) {
      frequencyText = 'Every day (~30x / mo)';
    } else if (avgGapDays < 25) {
      const roundedDays = Math.round(avgGapDays);
      const wearsPerMonthVal = 30 / Math.max(0.5, avgGapDays);
      const wearsPerMonth = wearsPerMonthVal >= 10 ? Math.round(wearsPerMonthVal) : parseFloat(wearsPerMonthVal.toFixed(1));
      if (roundedDays <= 1) {
        frequencyText = `Every ~1 day (~${wearsPerMonth}x / mo)`;
      } else {
        frequencyText = `Every ~${roundedDays} days (~${wearsPerMonth}x / mo)`;
      }
    } else if (avgGapDays <= 45) {
      frequencyText = '1x / month';
    } else if (avgGapDays < 300) {
      const roundedMonths = Math.max(1, Math.round(avgGapDays / 30));
      frequencyText = `Once every ~${roundedMonths} ${roundedMonths === 1 ? 'month' : 'months'}`;
    } else {
      frequencyText = 'Rarely / Once in a blue moon';
    }
  }

  return {
    last1m: l1,
    last3m: l3,
    last6m: l6,
    last12m: l12,
    frequencyText,
  };
}
