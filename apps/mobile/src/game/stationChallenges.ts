import type { StationChallenge } from './petTypes';

// Station IDs should match T-money 역 코드 from the boarding/alighting API
export const STATION_CHALLENGES: StationChallenge[] = [
  {
    id: 'challenge_gangnam_trio',
    name: '강남 3대장',
    description: '강남 · 역삼 · 선릉 모두 방문하기',
    requiredStationIds: ['station_gangnam', 'station_yeoksam', 'station_seolleung'],
    rewardItemId: 'item_gangnam_bag',
  },
  {
    id: 'challenge_transfer_king',
    name: '환승왕',
    description: '서울 주요 환승역 4곳 모두 방문하기',
    requiredStationIds: [
      'station_sindorim',
      'station_wangsimni',
      'station_sadang',
      'station_jonggak',
    ],
    rewardItemId: 'item_transfer_crown',
  },
  {
    id: 'challenge_han_river',
    name: '한강 라인',
    description: '한강변 역 4곳 방문하기',
    requiredStationIds: [
      'station_yeouido',
      'station_banpo',
      'station_ttukseom',
      'station_mangwon',
    ],
    rewardItemId: 'item_han_river_badge',
  },
  {
    id: 'challenge_city_core',
    name: '서울 심장부',
    description: '종로 · 을지로 · 광화문 · 시청 모두 방문하기',
    requiredStationIds: [
      'station_jongno3ga',
      'station_euljiro1ga',
      'station_gwanghwamun',
      'station_cityhall',
    ],
    rewardItemId: 'item_city_badge',
  },
];

export function getNewlyCompletedChallenges(
  visitedStationIds: string[],
  completedChallengeIds: string[],
): StationChallenge[] {
  const visitedSet = new Set(visitedStationIds);
  const completedSet = new Set(completedChallengeIds);

  return STATION_CHALLENGES.filter(
    (c) =>
      !completedSet.has(c.id) &&
      c.requiredStationIds.every((id) => visitedSet.has(id)),
  );
}
