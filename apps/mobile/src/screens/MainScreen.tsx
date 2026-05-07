import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

interface ChatMessage {
  id: string;
  role: 'titi' | 'user';
  text: string;
}

const CHAT_API_URL = 'http://127.0.0.1:5173/api/chat';

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
  chatButton: '\uD2F0\uD2F0\uC5D0\uAC8C \uBB3B\uAE30',
  chatTitle: 'TITI CHAT',
  chatPlaceholder: '\uD2F0\uD2F0\uC5D0\uAC8C \uBB3C\uC5B4\uBCF4\uAE30',
  send: '\uC804\uC1A1',
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatText, setChatText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'titi',
      text: '안녕! 오늘 이동 기록, 경험치, 보상, 하차 알림을 물어봐.',
    },
    {
      id: 'sample-user',
      role: 'user',
      text: '오늘 얼마나 성장했어?',
    },
    {
      id: 'sample-titi',
      role: 'titi',
      text: `오늘 +${todaySummary.gainedExp} EXP를 얻었어. 다음 보상도 금방이야.`,
    },
  ]);

  async function askTiti(question: string) {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return;
    }

    const loadingId = `loading-${Date.now()}`;
    setChatMessages((messages) => [
      ...messages,
      { id: `user-${Date.now()}`, role: 'user', text: trimmedQuestion },
      { id: loadingId, role: 'titi', text: '티티가 생각 중...' },
    ]);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedQuestion,
          context: {
            level: displayPet.level,
            todayExp: todaySummary.gainedExp,
            todayRides: todaySummary.rideCount,
            todayStations: todaySummary.movedStationCount,
            todayTransfers: todaySummary.transferCount,
            todayNewVisits: todaySummary.newStationVisitCount,
          },
        }),
      });
      const data = await response.json();
      setChatMessages((messages) =>
        messages.map((message) =>
          message.id === loadingId
            ? {
                ...message,
                text: response.ok
                  ? data.reply
                  : data.error || '지금은 티티가 대답하기 어려워.',
              }
            : message,
        ),
      );
    } catch (error) {
      setChatMessages((messages) =>
        messages.map((message) =>
          message.id === loadingId
            ? { ...message, text: '네트워크 연결을 확인해줘. 티티가 잠깐 길을 잃었어.' }
            : message,
        ),
      );
    }
  }

  function sendChatMessage() {
    const message = chatText;
    setChatText('');
    askTiti(message);
  }

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
          <View style={styles.headerActions}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelLabel}>LV</Text>
              <Text style={styles.levelValue}>{displayPet.level}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={UI_TEXT.chatButton}
              onPress={() => setIsChatOpen(true)}
              style={styles.chatFab}
            >
              <Text style={styles.chatFabIcon}>💬</Text>
            </Pressable>
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

      <Modal
        animationType="slide"
        transparent
        visible={isChatOpen}
        onRequestClose={() => setIsChatOpen(false)}
      >
        <Pressable style={styles.chatOverlay} onPress={() => setIsChatOpen(false)}>
          <Pressable style={styles.chatSheet}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>{UI_TEXT.chatTitle}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsChatOpen(false)}
                style={styles.chatCloseButton}
              >
                <Text style={styles.chatCloseText}>X</Text>
              </Pressable>
            </View>

            <View style={styles.chatMessages}>
              {chatMessages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.chatBubble,
                    message.role === 'titi' ? styles.titiBubble : styles.userBubble,
                  ]}
                >
                  <Text
                    style={
                      message.role === 'titi'
                        ? styles.titiBubbleText
                        : styles.userBubbleText
                    }
                  >
                    {message.text}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.chatSuggestionList}>
              <ChatSuggestion label="오늘 이동 기록 알려줘" onPress={askTiti} />
              <ChatSuggestion label="다음 보상 뭐야?" onPress={askTiti} />
              <ChatSuggestion label="하차 알림 켜줘" onPress={askTiti} />
            </View>

            <View style={styles.chatInputRow}>
              <TextInput
                value={chatText}
                onChangeText={setChatText}
                placeholder={UI_TEXT.chatPlaceholder}
                placeholderTextColor="#8EA19A"
                style={styles.chatInput}
              />
              <Pressable style={styles.chatSendButton} onPress={sendChatMessage}>
                <Text style={styles.chatSendText}>{UI_TEXT.send}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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

function ChatSuggestion({
  label,
  onPress,
}: {
  label: string;
  onPress: (label: string) => void;
}) {
  return (
    <Pressable style={styles.chatSuggestion} onPress={() => onPress(label)}>
      <Text style={styles.chatSuggestionText}>{label}</Text>
    </Pressable>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  chatFab: {
    width: 42,
    height: 42,
    marginLeft: 8,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F7A63',
    borderWidth: 2,
    borderColor: '#DDF4EC',
    shadowColor: '#31564B',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  chatFabIcon: {
    fontSize: 20,
  },
  chatOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(13, 24, 21, 0.46)',
  },
  chatSheet: {
    maxHeight: '74%',
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: '#F7FAF8',
  },
  chatHeader: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatTitle: {
    color: '#16231F',
    fontSize: 16,
    fontWeight: '900',
  },
  chatCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5EFEA',
  },
  chatCloseText: {
    color: '#31564B',
    fontSize: 14,
    fontWeight: '900',
  },
  chatMessages: {
    marginTop: 16,
  },
  chatBubble: {
    maxWidth: '84%',
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
  },
  titiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E8E4',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1F7A63',
  },
  titiBubbleText: {
    color: '#1B2B26',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  userBubbleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  chatSuggestionList: {
    marginTop: 4,
    gap: 8,
  },
  chatSuggestion: {
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EAF3EF',
  },
  chatSuggestionText: {
    color: '#31564B',
    fontSize: 14,
    fontWeight: '800',
  },
  chatInputRow: {
    minHeight: 46,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#16231F',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE7E2',
    fontSize: 14,
    fontWeight: '700',
  },
  chatSendButton: {
    width: 58,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0B84F',
  },
  chatSendText: {
    color: '#4C3510',
    fontSize: 14,
    fontWeight: '900',
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
