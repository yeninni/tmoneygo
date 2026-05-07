import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import type { TitiPetState } from '../game/petTypes';

const TITI_IMAGE_URI = './assets/titi.png';

interface TodayTransitSummary {
  rideCount: number;
  movedStationCount: number;
  transferCount: number;
  newStationVisitCount: number;
  gainedExp: number;
}

interface MainScreenProps {
  pet?: TitiPetState;
  todaySummary?: TodayTransitSummary;
}

const UI_TEXT = {
  appName: '\uD2F0\uBA38\uB2C8 \uD2F0\uD2F0',
  title: '\uD2F0\uD2F0\uC640 \uD568\uAED8 \uC774\uB3D9 \uC911',
  exp: '\uACBD\uD5D8\uCE58',
  todayTransit: '\uC624\uB298\uC758 \uC774\uB3D9 \uAE30\uB85D',
  ride: '\uD0D1\uC2B9',
  moved: '\uC774\uB3D9',
  transfer: '\uD658\uC2B9',
  newVisit: '\uC2E0\uADDC \uBC29\uBB38',
  times: '\uD68C',
  stations: '\uAC1C \uC815\uAC70\uC7A5',
  places: '\uACF3',
  moods: {
    excited: '\uC2E0\uB0A8',
    sleepy: '\uC878\uB9BC',
    happy: '\uAE30\uBD84 \uC88B\uC74C',
    normal: '\uD3C9\uC628',
  },
} as const;

const DEFAULT_PET: Pick<
  TitiPetState,
  'level' | 'currentLevelExp' | 'expToNextLevel' | 'mood'
> = {
  level: 3,
  currentLevelExp: 86,
  expToNextLevel: 154,
  mood: 'happy',
};

const DEFAULT_TODAY_SUMMARY: TodayTransitSummary = {
  rideCount: 2,
  movedStationCount: 18,
  transferCount: 1,
  newStationVisitCount: 1,
  gainedExp: 122,
};

export default function MainScreen({
  pet,
  todaySummary = DEFAULT_TODAY_SUMMARY,
}: MainScreenProps) {
  const displayPet = pet ?? DEFAULT_PET;
  const requiredExp = displayPet.currentLevelExp + displayPet.expToNextLevel;
  const progressRatio = requiredExp > 0 ? displayPet.currentLevelExp / requiredExp : 1;
  const progressPercent = Math.min(100, Math.max(0, progressRatio * 100));
  const titiImageSource = getTitiImageSource(displayPet.mood);
  const [isTitiImageVisible, setIsTitiImageVisible] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>{UI_TEXT.appName}</Text>
            <Text style={styles.title}>{UI_TEXT.title}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>LV</Text>
            <Text style={styles.levelValue}>{displayPet.level}</Text>
          </View>
        </View>

        <View style={styles.expSection}>
          <View style={styles.expLabelRow}>
            <Text style={styles.expLabel}>{UI_TEXT.exp}</Text>
            <Text style={styles.expValue}>
              {displayPet.currentLevelExp} / {requiredExp} EXP
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, getProgressFillStyle(progressPercent)]} />
          </View>
        </View>

        <View style={styles.petStage}>
          <View style={styles.wallAccent} />
          <View style={styles.roomShelf}>
            <View style={styles.roomShelfDot} />
            <View style={styles.roomShelfDot} />
            <View style={styles.roomShelfDot} />
          </View>
          <View style={styles.subwayChair}>
            <View style={styles.chairBack} />
            <View style={styles.chairSeat} />
            <View style={styles.chairLegRow}>
              <View style={styles.chairLeg} />
              <View style={styles.chairLeg} />
            </View>
          </View>
          <View style={styles.floorPad} />
          <View style={styles.petShadow} />
          <View style={styles.petImageFrame}>
            {isTitiImageVisible ? (
              <Image
                accessibilityLabel="Titi character"
                onError={() => setIsTitiImageVisible(false)}
                resizeMode="contain"
                source={titiImageSource}
                style={styles.petImage}
              />
            ) : (
              <TitiFallbackCharacter mood={displayPet.mood} />
            )}
          </View>
          <View style={styles.moodPill}>
            <Text style={styles.moodText}>{getMoodLabel(displayPet.mood)}</Text>
          </View>
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>{UI_TEXT.todayTransit}</Text>
            <Text style={styles.summaryExp}>+{todaySummary.gainedExp} EXP</Text>
          </View>

          <View style={styles.metricGrid}>
            <MetricCard
              label={UI_TEXT.ride}
              value={`${todaySummary.rideCount}${UI_TEXT.times}`}
            />
            <MetricCard
              label={UI_TEXT.moved}
              value={`${todaySummary.movedStationCount}${UI_TEXT.stations}`}
            />
            <MetricCard
              label={UI_TEXT.transfer}
              value={`${todaySummary.transferCount}${UI_TEXT.times}`}
            />
            <MetricCard
              label={UI_TEXT.newVisit}
              value={`${todaySummary.newStationVisitCount}${UI_TEXT.places}`}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function getProgressFillStyle(progressPercent: number): ViewStyle {
  return {
    width: `${progressPercent}%`,
  };
}

function getMoodLabel(mood: TitiPetState['mood']) {
  return UI_TEXT.moods[mood] ?? UI_TEXT.moods.normal;
}

function getTitiImageSource(mood: TitiPetState['mood']) {
  if (mood === 'happy') {
    return { uri: TITI_IMAGE_URI };
  }

  return { uri: TITI_IMAGE_URI };
}

function TitiFallbackCharacter({ mood }: { mood: TitiPetState['mood'] }) {
  const isHappy = mood === 'happy';

  return (
    <View style={styles.fallbackPet}>
      <View style={[styles.fallbackEar, styles.fallbackEarLeft]} />
      <View style={[styles.fallbackEar, styles.fallbackEarRight]} />
      <View style={styles.fallbackHead}>
        <View style={styles.fallbackFacePatch} />
        <View style={styles.fallbackEyeRow}>
          <View style={isHappy ? styles.fallbackWinkEye : styles.fallbackEye} />
          <View style={styles.fallbackEye} />
        </View>
        <View style={styles.fallbackNose} />
        <View style={styles.fallbackMouth} />
      </View>
      <View style={styles.fallbackBody}>
        <View style={styles.fallbackBelly} />
        <View style={styles.fallbackMap}>
          <View style={styles.fallbackMapLine} />
          <View style={styles.fallbackMapLineShort} />
        </View>
        <View style={styles.fallbackBackpack} />
      </View>
      <View style={styles.fallbackTail} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAF8',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    color: '#21735A',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    marginTop: 4,
    color: '#16231F',
    fontSize: 24,
    fontWeight: '800',
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F7A63',
    borderWidth: 3,
    borderColor: '#CFE7DD',
  },
  levelLabel: {
    color: '#DDF4EC',
    fontSize: 11,
    fontWeight: '800',
  },
  levelValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  expSection: {
    marginTop: 22,
  },
  expLabelRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expLabel: {
    color: '#34443F',
    fontSize: 14,
    fontWeight: '800',
  },
  expValue: {
    color: '#5E6F69',
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 14,
    marginTop: 10,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#DCE7E2',
  },
  progressFill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: '#F0B84F',
  },
  petStage: {
    minHeight: 330,
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF3E7',
    overflow: 'hidden',
  },
  wallAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 118,
    backgroundColor: '#FBE1D5',
  },
  roomShelf: {
    position: 'absolute',
    top: 52,
    left: 24,
    width: 86,
    height: 14,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#EBC7A3',
  },
  roomShelfDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF7ED',
  },
  subwayChair: {
    position: 'absolute',
    right: 26,
    bottom: 66,
    width: 86,
    height: 74,
    alignItems: 'center',
  },
  chairBack: {
    width: 78,
    height: 38,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#88BEE8',
    borderWidth: 3,
    borderColor: '#5D91BD',
  },
  chairSeat: {
    width: 86,
    height: 16,
    marginTop: -2,
    borderRadius: 8,
    backgroundColor: '#6EA7D4',
  },
  chairLegRow: {
    width: 62,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chairLeg: {
    width: 7,
    height: 22,
    backgroundColor: '#557382',
  },
  floorPad: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 92,
    backgroundColor: '#F6D9B8',
  },
  petShadow: {
    position: 'absolute',
    bottom: 58,
    width: 154,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(112, 82, 57, 0.18)',
  },
  petImageFrame: {
    width: 230,
    height: 254,
    marginBottom: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImage: {
    width: 260,
    height: 462,
    transform: [{ translateY: -118 }],
  },
  fallbackPet: {
    width: 178,
    height: 226,
    alignItems: 'center',
  },
  fallbackEar: {
    position: 'absolute',
    top: 22,
    width: 30,
    height: 34,
    borderRadius: 16,
    backgroundColor: '#8A5E42',
    zIndex: 1,
  },
  fallbackEarLeft: {
    left: 28,
    transform: [{ rotate: '-18deg' }],
  },
  fallbackEarRight: {
    right: 28,
    transform: [{ rotate: '18deg' }],
  },
  fallbackHead: {
    width: 116,
    height: 104,
    marginTop: 20,
    borderRadius: 54,
    alignItems: 'center',
    backgroundColor: '#A97956',
    borderWidth: 2,
    borderColor: '#5D3F30',
    zIndex: 2,
  },
  fallbackFacePatch: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    height: 44,
    borderRadius: 24,
    backgroundColor: '#F3D8BD',
  },
  fallbackEyeRow: {
    width: 68,
    marginTop: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  fallbackEye: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#2C211B',
  },
  fallbackWinkEye: {
    width: 17,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2C211B',
  },
  fallbackNose: {
    width: 24,
    height: 16,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#2E211C',
    zIndex: 3,
  },
  fallbackMouth: {
    width: 34,
    height: 14,
    marginTop: 2,
    borderBottomWidth: 2,
    borderColor: '#3F2C25',
    borderRadius: 12,
    zIndex: 3,
  },
  fallbackBody: {
    width: 98,
    height: 106,
    marginTop: -6,
    borderRadius: 44,
    alignItems: 'center',
    backgroundColor: '#9C6E4F',
    borderWidth: 2,
    borderColor: '#5D3F30',
    zIndex: 2,
  },
  fallbackBelly: {
    width: 60,
    height: 78,
    marginTop: 16,
    borderRadius: 30,
    backgroundColor: '#F3D8BD',
  },
  fallbackMap: {
    position: 'absolute',
    left: -26,
    top: 28,
    width: 34,
    height: 54,
    borderRadius: 4,
    backgroundColor: '#FFF8ED',
    borderWidth: 2,
    borderColor: '#5D3F30',
    transform: [{ rotate: '-14deg' }],
  },
  fallbackMapLine: {
    width: 22,
    height: 2,
    marginTop: 13,
    marginLeft: 5,
    backgroundColor: '#7FB9D2',
  },
  fallbackMapLineShort: {
    width: 16,
    height: 2,
    marginTop: 8,
    marginLeft: 8,
    backgroundColor: '#E7A857',
  },
  fallbackBackpack: {
    position: 'absolute',
    right: -22,
    top: 24,
    width: 30,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#B5C7B8',
    borderWidth: 2,
    borderColor: '#5D3F30',
  },
  fallbackTail: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 54,
    height: 22,
    borderRadius: 14,
    backgroundColor: '#7E513B',
    transform: [{ rotate: '16deg' }],
    zIndex: 1,
  },
  moodPill: {
    position: 'absolute',
    top: 18,
    right: 18,
    minWidth: 74,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  moodText: {
    color: '#31564B',
    fontSize: 13,
    fontWeight: '800',
  },
  summarySection: {
    marginTop: 24,
  },
  summaryHeader: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTitle: {
    color: '#172420',
    fontSize: 18,
    fontWeight: '900',
  },
  summaryExp: {
    color: '#B06D16',
    fontSize: 17,
    fontWeight: '900',
  },
  metricGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  metricCard: {
    width: '48.4%',
    minHeight: 82,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E8E4',
  },
  metricLabel: {
    color: '#6B7B75',
    fontSize: 13,
    fontWeight: '800',
  },
  metricValue: {
    marginTop: 8,
    color: '#1B2B26',
    fontSize: 17,
    fontWeight: '900',
  },
});
