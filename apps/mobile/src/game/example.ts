import { applyTransitRideToTiti, createInitialTitiPetState } from './petEngine';
import type { TransitRideInput } from './petTypes';

const titi = createInitialTitiPetState('user_001');

const ride: TransitRideInput = {
  rideId: 'ride_20260506_001',
  userId: 'user_001',
  startedAt: '2026-05-06T08:10:00+09:00',
  endedAt: '2026-05-06T08:42:00+09:00',
  lineId: 'subway_line_2',
  fromStationId: 'station_gangnam',
  toStationId: 'station_hongdae',
  movedStationCount: 12,
  hasTransfer: true,
  isNewStationVisit: true,
};

const result = applyTransitRideToTiti(titi, ride);

console.log({
  gainedExp: result.exp.totalGainedExp,
  level: result.next.level,
  leveledUp: result.leveledUp,
  rewards: result.rewards,
});
