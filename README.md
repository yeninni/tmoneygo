# 티머니 티티 프로젝트 구조 제안

`티머니 티티`는 대중교통 이용 경험을 자동 하차 알림과 수달 펫 육성으로 연결하는 하이브리드 모바일 앱입니다.  
이 문서는 React Native 기반 모바일 앱, 백그라운드 위치/알림 로직, 데이터 파이프라인, AI 예측 모델, 펫 성장 시스템을 함께 운영하기 위한 추천 파일 구조를 설명합니다.

## 핵심 기능

- **Zero-Click 하차 알림**
  - 사용자의 과거 승하차 데이터, 시간대, 요일, 노선, 위치 패턴을 학습합니다.
  - 사용자가 앱을 직접 조작하지 않아도 백그라운드에서 하차 가능성이 높은 정류장 또는 역을 예측합니다.
  - 예측 결과에 따라 스마트폰 푸시 알림을 발송합니다.

- **수달 펫 `티티` 육성**
  - 이동 거리, 환승 횟수, 정기 이용 패턴 등 대중교통 데이터를 경험치로 변환합니다.
  - 경험치 누적에 따라 티티가 레벨업합니다.
  - 레벨업 보상으로 디지털 굿즈, 의상, 소품, 배경 등을 제공합니다.

## 추천 전체 구조

```txt
tmoney-titi/
├── README.md
├── package.json
├── tsconfig.json
├── app.json
├── babel.config.js
├── metro.config.js
├── .env.example
├── .gitignore
│
├── apps/
│   └── mobile/
│       ├── package.json
│       ├── index.js
│       ├── App.tsx
│       ├── android/
│       ├── ios/
│       └── src/
│           ├── assets/
│           │   ├── images/
│           │   ├── icons/
│           │   ├── animations/
│           │   └── sounds/
│           ├── components/
│           │   ├── common/
│           │   ├── transit/
│           │   └── pet/
│           ├── screens/
│           │   ├── HomeScreen.tsx
│           │   ├── TransitAlertScreen.tsx
│           │   ├── PetRoomScreen.tsx
│           │   ├── RewardScreen.tsx
│           │   └── SettingsScreen.tsx
│           ├── navigation/
│           │   ├── RootNavigator.tsx
│           │   └── routes.ts
│           ├── features/
│           │   ├── auth/
│           │   ├── transit/
│           │   ├── alert/
│           │   ├── pet/
│           │   └── rewards/
│           ├── game/
│           │   ├── petEngine.ts
│           │   ├── expCalculator.ts
│           │   ├── levelRules.ts
│           │   └── itemCatalog.ts
│           ├── services/
│           │   ├── apiClient.ts
│           │   ├── pushNotification.ts
│           │   ├── backgroundLocation.ts
│           │   └── localStorage.ts
│           ├── hooks/
│           ├── store/
│           ├── theme/
│           ├── utils/
│           └── types/
│
├── services/
│   ├── api/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── modules/
│   │   │   │   ├── users/
│   │   │   │   ├── transit/
│   │   │   │   ├── predictions/
│   │   │   │   ├── notifications/
│   │   │   │   ├── pets/
│   │   │   │   └── rewards/
│   │   │   ├── common/
│   │   │   ├── config/
│   │   │   └── database/
│   │   └── test/
│   │
│   ├── worker/
│   │   ├── package.json
│   │   └── src/
│   │       ├── jobs/
│   │       │   ├── ingestTransitLogs.job.ts
│   │       │   ├── updateUserPattern.job.ts
│   │       │   ├── calculatePetExp.job.ts
│   │       │   └── sendDropOffAlert.job.ts
│   │       ├── queues/
│   │       └── scheduler.ts
│   │
│   └── ml-inference/
│       ├── app.py
│       ├── requirements.txt
│       ├── models/
│       ├── schemas/
│       └── src/
│           ├── predict_dropoff.py
│           ├── feature_builder.py
│           └── model_loader.py
│
├── data/
│   ├── pipelines/
│   │   ├── ingestion/
│   │   │   ├── collect_transit_events.py
│   │   │   └── validate_events.py
│   │   ├── transformation/
│   │   │   ├── build_user_routes.py
│   │   │   ├── build_commute_patterns.py
│   │   │   └── anonymize_location_data.py
│   │   └── training/
│   │       ├── train_dropoff_model.py
│   │       ├── evaluate_model.py
│   │       └── export_model.py
│   ├── notebooks/
│   ├── sample/
│   └── schemas/
│       ├── transit_event.schema.json
│       ├── prediction.schema.json
│       └── pet_event.schema.json
│
├── packages/
│   ├── shared-types/
│   │   ├── package.json
│   │   └── src/
│   │       ├── user.ts
│   │       ├── transit.ts
│   │       ├── prediction.ts
│   │       ├── pet.ts
│   │       └── reward.ts
│   ├── shared-config/
│   └── analytics-events/
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.worker
│   │   └── Dockerfile.ml
│   ├── docker-compose.yml
│   ├── terraform/
│   └── k8s/
│
├── docs/
│   ├── product/
│   │   ├── user-flow.md
│   │   ├── pet-growth-rules.md
│   │   └── reward-policy.md
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── data-flow.md
│   │   └── background-location.md
│   ├── api/
│   └── privacy/
│       ├── data-retention.md
│       ├── location-permission.md
│       └── anonymization-policy.md
│
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── fixtures/
│
└── scripts/
    ├── setup-dev.ps1
    ├── setup-dev.sh
    ├── seed-sample-data.ts
    └── run-local-stack.sh
```

## 폴더 및 파일 역할

### 루트 설정

- `README.md`: 프로젝트 개요, 구조, 실행 방법, 주요 설계 방향을 정리하는 문서입니다.
- `package.json`: 모노레포 루트 의존성, 워크스페이스, 공통 스크립트를 관리합니다.
- `tsconfig.json`: TypeScript 공통 컴파일 설정입니다.
- `app.json`: React Native 또는 Expo 기반 앱 메타데이터를 정의합니다.
- `babel.config.js`: React Native 빌드에 필요한 Babel 설정입니다.
- `metro.config.js`: React Native Metro 번들러 설정입니다.
- `.env.example`: 로컬 개발에 필요한 환경 변수 예시입니다.
- `.gitignore`: 빌드 산출물, 로컬 환경 파일, 민감한 파일 제외 규칙입니다.

### `apps/mobile`

React Native 모바일 앱 코드가 위치합니다. 사용자가 직접 경험하는 하차 알림 UI, 티티 육성 화면, 보상 화면, 설정 화면을 담당합니다.

- `App.tsx`: 모바일 앱의 최상위 컴포넌트입니다.
- `android/`, `ios/`: 네이티브 프로젝트 설정, 권한, 빌드 설정이 들어갑니다.
- `src/assets`: 티티 이미지, 아이콘, 애니메이션, 효과음 등 정적 리소스입니다.
- `src/components/common`: 버튼, 모달, 카드, 토스트 등 공통 UI 컴포넌트입니다.
- `src/components/transit`: 노선 정보, 하차 알림 상태, 정류장 표시 등 대중교통 전용 UI입니다.
- `src/components/pet`: 티티 캐릭터, 의상, 아이템, 성장 상태 UI입니다.
- `src/screens`: 앱의 주요 화면 단위입니다.
- `src/navigation`: 화면 이동 구조와 라우트 이름을 관리합니다.
- `src/features/auth`: 로그인, 사용자 인증, 토큰 관리 기능입니다.
- `src/features/transit`: 승하차 기록, 노선 정보, 이동 이력 관련 상태와 API 연동입니다.
- `src/features/alert`: Zero-Click 하차 알림 상태, 알림 권한, 예측 결과 표시 기능입니다.
- `src/features/pet`: 티티 상태, 레벨, 경험치, 장착 아이템 관련 기능입니다.
- `src/features/rewards`: 레벨업 보상, 굿즈 지급, 보상 수령 내역 기능입니다.
- `src/game/petEngine.ts`: 티티의 성장, 상태 변화, 보상 트리거를 처리하는 게임 로직입니다.
- `src/game/expCalculator.ts`: 이동 거리, 환승 횟수, 이용 빈도를 경험치로 변환합니다.
- `src/game/levelRules.ts`: 레벨별 필요 경험치와 해금 조건을 정의합니다.
- `src/game/itemCatalog.ts`: 의상, 소품, 배경 등 디지털 굿즈 목록을 정의합니다.
- `src/services/apiClient.ts`: 백엔드 API 호출을 담당하는 공통 클라이언트입니다.
- `src/services/pushNotification.ts`: 푸시 알림 권한 요청, 토큰 등록, 로컬 알림 처리를 담당합니다.
- `src/services/backgroundLocation.ts`: 백그라운드 위치 추적과 지오펜싱 연동을 담당합니다.
- `src/services/localStorage.ts`: 앱 내부 캐시와 로컬 저장소 접근을 추상화합니다.
- `src/hooks`: 재사용 가능한 React Hook입니다.
- `src/store`: Zustand, Redux Toolkit, Jotai 등 앱 전역 상태 관리 코드입니다.
- `src/theme`: 색상, 타이포그래피, spacing 등 디자인 토큰입니다.
- `src/utils`: 날짜, 거리 계산, 포맷팅 등 공통 유틸리티입니다.
- `src/types`: 모바일 앱 내부 TypeScript 타입입니다.

### `services/api`

모바일 앱과 데이터 시스템이 사용하는 메인 백엔드 API 서버입니다. NestJS, Express, Fastify 등으로 구현할 수 있습니다.

- `src/main.ts`: API 서버 진입점입니다.
- `src/app.module.ts`: 서버 모듈 구성을 관리합니다.
- `src/modules/users`: 사용자 프로필, 동의 상태, 계정 정보를 관리합니다.
- `src/modules/transit`: 승하차 기록, 노선, 정류장, 이동 이력 API를 제공합니다.
- `src/modules/predictions`: 하차 예측 요청, 예측 결과 저장, 예측 신뢰도 조회를 담당합니다.
- `src/modules/notifications`: 푸시 토큰, 알림 발송, 알림 이력 관리를 담당합니다.
- `src/modules/pets`: 티티의 레벨, 경험치, 상태, 장착 아이템을 관리합니다.
- `src/modules/rewards`: 보상 지급, 수령 상태, 아이템 인벤토리를 관리합니다.
- `src/common`: 공통 예외 처리, 응답 포맷, 인증 가드, 데코레이터입니다.
- `src/config`: 환경 변수, 외부 서비스 키, 런타임 설정입니다.
- `src/database`: DB 연결, 마이그레이션, ORM 설정입니다.
- `test`: API 단위 테스트와 통합 테스트입니다.

### `services/worker`

비동기 작업과 스케줄링을 담당합니다. 대중교통 로그 수집, 사용자 패턴 업데이트, 경험치 정산, 알림 발송 같은 작업은 API 요청과 분리해 처리하는 것이 좋습니다.

- `ingestTransitLogs.job.ts`: 외부 또는 내부 시스템에서 승하차 이벤트를 가져와 저장합니다.
- `updateUserPattern.job.ts`: 사용자별 자주 타는 노선, 하차 위치, 시간대 패턴을 갱신합니다.
- `calculatePetExp.job.ts`: 이동 데이터를 기반으로 티티 경험치를 계산하고 반영합니다.
- `sendDropOffAlert.job.ts`: 예측 결과와 현재 위치를 기반으로 하차 알림을 발송합니다.
- `queues`: BullMQ, RabbitMQ, SQS 등 큐 정의와 producer/consumer 코드입니다.
- `scheduler.ts`: 주기적으로 실행되는 작업을 등록합니다.

### `services/ml-inference`

하차 위치 예측 모델을 실시간 또는 준실시간으로 서빙하는 ML 추론 서비스입니다.

- `app.py`: FastAPI 등으로 구현되는 ML 추론 서버 진입점입니다.
- `requirements.txt`: Python 의존성 목록입니다.
- `models`: 학습 완료된 모델 파일 저장 위치입니다.
- `schemas`: 추론 요청과 응답 스키마입니다.
- `predict_dropoff.py`: 하차 위치 또는 하차 가능성 점수를 예측합니다.
- `feature_builder.py`: 시간, 요일, 노선, 현재 위치, 과거 이용 패턴을 모델 입력 피처로 변환합니다.
- `model_loader.py`: 모델 파일 로딩과 버전 관리를 담당합니다.

### `data`

데이터 수집, 정제, 학습, 검증을 위한 파이프라인 코드가 위치합니다.

- `pipelines/ingestion`: 승하차 이벤트, 노선 정보, 위치 데이터를 수집하고 검증합니다.
- `pipelines/transformation`: 사용자별 이동 패턴, 통근 패턴, 학습용 피처를 생성합니다.
- `pipelines/training`: 하차 예측 모델을 학습, 평가, export합니다.
- `notebooks`: 탐색적 데이터 분석과 모델 실험 노트북입니다.
- `sample`: 로컬 개발용 샘플 승하차 데이터입니다.
- `schemas`: 데이터 이벤트, 예측 결과, 펫 이벤트의 표준 JSON Schema입니다.

### `packages`

여러 앱과 서비스에서 공유하는 코드입니다. 모바일 앱과 백엔드가 같은 도메인 타입과 이벤트 이름을 공유하면 API 계약이 안정적으로 유지됩니다.

- `shared-types`: 사용자, 교통, 예측, 펫, 보상 관련 TypeScript 타입입니다.
- `shared-config`: ESLint, Prettier, TypeScript, 테스트 설정 등 공통 설정입니다.
- `analytics-events`: 앱 행동 로그와 데이터 파이프라인 이벤트 이름을 표준화합니다.

### `infra`

로컬 개발, 배포, 클라우드 인프라 설정을 관리합니다.

- `docker`: API, worker, ML 서비스별 Dockerfile입니다.
- `docker-compose.yml`: 로컬에서 API, DB, Redis, worker, ML inference를 함께 실행하기 위한 설정입니다.
- `terraform`: 클라우드 리소스, 네트워크, 데이터베이스, 큐, 스토리지 구성을 코드로 관리합니다.
- `k8s`: Kubernetes 배포 매니페스트입니다.

### `docs`

기획, 기술 설계, 개인정보 보호 정책을 문서화합니다.

- `product/user-flow.md`: 사용자의 앱 이용 흐름과 주요 시나리오입니다.
- `product/pet-growth-rules.md`: 티티 경험치, 레벨, 보상 규칙입니다.
- `product/reward-policy.md`: 디지털 굿즈 지급 기준과 운영 정책입니다.
- `architecture/system-overview.md`: 전체 시스템 구성도와 서비스 간 책임 분리입니다.
- `architecture/data-flow.md`: 승하차 데이터가 수집, 정제, 예측, 보상으로 이어지는 흐름입니다.
- `architecture/background-location.md`: 백그라운드 위치 추적, 권한, 배터리 최적화 전략입니다.
- `api`: API 명세, OpenAPI 문서, 예시 요청/응답입니다.
- `privacy/data-retention.md`: 위치 및 이동 데이터 보관 기간과 삭제 정책입니다.
- `privacy/location-permission.md`: 위치 권한 요청 사유와 사용자 고지 문구입니다.
- `privacy/anonymization-policy.md`: 위치 데이터 익명화와 가명화 기준입니다.

### `tests`

프로젝트 전체 품질을 검증하는 테스트 코드입니다.

- `e2e`: 실제 앱 흐름 기준의 엔드투엔드 테스트입니다.
- `integration`: API, worker, ML 서비스 간 연동 테스트입니다.
- `fixtures`: 테스트용 사용자, 승하차 이벤트, 예측 결과, 펫 상태 데이터입니다.

### `scripts`

반복 실행되는 개발 작업을 자동화합니다.

- `setup-dev.ps1`: Windows PowerShell 개발 환경 설정 스크립트입니다.
- `setup-dev.sh`: macOS/Linux 개발 환경 설정 스크립트입니다.
- `seed-sample-data.ts`: 로컬 DB에 샘플 승하차 기록과 펫 데이터를 주입합니다.
- `run-local-stack.sh`: Docker Compose 기반 로컬 백엔드 스택을 실행합니다.

## 데이터 흐름 요약

```txt
승하차 이벤트 수집
        ↓
데이터 검증 및 익명화
        ↓
사용자 이동 패턴 생성
        ↓
하차 예측 모델 학습 및 추론
        ↓
백그라운드 위치와 예측 결과 비교
        ↓
Zero-Click 하차 푸시 알림 발송
        ↓
이동 거리와 환승 정보를 경험치로 변환
        ↓
티티 레벨업 및 디지털 굿즈 보상 지급
```

## 초기 개발 우선순위

1. React Native 앱 기본 구조와 화면 네비게이션 구축
2. 티티 펫 상태, 경험치, 레벨업 규칙의 로컬 프로토타입 구현
3. 샘플 승하차 데이터 기반 경험치 계산 로직 구현
4. 백엔드 API 서버와 공통 타입 패키지 구성
5. 하차 예측용 데이터 스키마와 샘플 파이프라인 작성
6. 백그라운드 위치 권한, 푸시 알림 권한, 알림 UX 검증
7. ML 추론 서비스와 worker 기반 알림 발송 흐름 연결

## 설계 시 주의할 점

- 위치 정보와 이동 패턴은 민감 정보이므로 수집 목적, 보관 기간, 삭제 방법을 명확히 제공해야 합니다.
- 백그라운드 위치 추적은 배터리 사용량과 OS 정책의 영향을 많이 받으므로 지오펜싱, 저전력 위치 업데이트, 서버 예측을 조합하는 것이 좋습니다.
- Zero-Click 알림은 오탐이 잦으면 신뢰도가 떨어지므로 예측 신뢰도, 사용자 피드백, 알림 빈도 제한이 필요합니다.
- 펫 성장 시스템은 교통 이용량이 적은 사용자도 소외되지 않도록 출석 보상, 주간 미션, 친환경 이동 보너스 같은 보조 루프를 고려할 수 있습니다.
- 모바일 앱과 백엔드, 데이터 파이프라인이 같은 이벤트 정의를 사용하도록 `packages/analytics-events`와 `packages/shared-types`를 초기에 정리하는 것이 좋습니다.
