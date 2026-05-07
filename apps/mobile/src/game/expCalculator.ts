import type { ExpBreakdown, TransitRideInput } from './petTypes';

const BASE_RIDE_EXP = 10;
const EXP_PER_MOVED_STATION = 4;
const TRANSFER_BONUS_EXP = 15;
const NEW_STATION_BONUS_EXP = 25;
const MAX_STATION_EXP_PER_RIDE = 80;

export function calculateTransitExp(ride: TransitRideInput): ExpBreakdown {
  const movedStationCount = Math.max(0, Math.floor(ride.movedStationCount));
  const stationExp = Math.min(
    movedStationCount * EXP_PER_MOVED_STATION,
    MAX_STATION_EXP_PER_RIDE,
  );
  const transferBonusExp = ride.hasTransfer ? TRANSFER_BONUS_EXP : 0;
  const newStationBonusExp = ride.isNewStationVisit ? NEW_STATION_BONUS_EXP : 0;

  return {
    baseExp: BASE_RIDE_EXP,
    stationExp,
    transferBonusExp,
    newStationBonusExp,
    totalGainedExp: BASE_RIDE_EXP + stationExp + transferBonusExp + newStationBonusExp,
  };
}
