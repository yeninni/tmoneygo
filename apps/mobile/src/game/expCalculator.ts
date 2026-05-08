import type { ExpBreakdown, TransitRideInput } from './petTypes';

const BASE_RIDE_EXP = 10;
const EXP_PER_MOVED_STATION = 4;
const TRANSFER_BONUS_EXP = 15;
const NEW_STATION_BONUS_EXP = 25;
const MAX_STATION_EXP_PER_RIDE = 80;
const OFF_PEAK_BONUS_EXP = 20;

// Peak hours: 07–09, 18–20 (출퇴근 혼잡 시간대)
function isPeakHour(isoString: string): boolean {
  const hour = new Date(isoString).getHours();
  return (hour >= 7 && hour < 9) || (hour >= 18 && hour < 20);
}

export function calculateTransitExp(ride: TransitRideInput): Omit<ExpBreakdown, 'streakBonusExp' | 'totalGainedExp'> & { rideTotal: number } {
  const movedStationCount = Math.max(0, Math.floor(ride.movedStationCount));
  const stationExp = Math.min(
    movedStationCount * EXP_PER_MOVED_STATION,
    MAX_STATION_EXP_PER_RIDE,
  );
  const transferBonusExp = ride.hasTransfer ? TRANSFER_BONUS_EXP : 0;
  const newStationBonusExp = ride.isNewStationVisit ? NEW_STATION_BONUS_EXP : 0;
  const offPeakBonusExp = isPeakHour(ride.startedAt) ? 0 : OFF_PEAK_BONUS_EXP;
  const rideTotal = BASE_RIDE_EXP + stationExp + transferBonusExp + newStationBonusExp + offPeakBonusExp;

  return {
    baseExp: BASE_RIDE_EXP,
    stationExp,
    transferBonusExp,
    newStationBonusExp,
    offPeakBonusExp,
    rideTotal,
  };
}
