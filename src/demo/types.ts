export type DemoScenarioId =
  | 'happyPath'
  | 'reuploadRequired'
  | 'offlinePending'
  | 'uploadError'
  | 'noLoads';

export type AppScreen =
  | 'email'
  | 'password'
  | 'forgotPassword'
  | 'updatePassword'
  | 'loads'
  | 'details'
  | 'upload'
  | 'settings';
export type DocumentType = 'BOL' | 'POD';
export type DocumentStatus = 'pending' | 'uploaded' | 'rejected';
export type LoadStage = 'assigned' | 'enRoute' | 'delivered';
export type NotificationSeverity = 'info' | 'warning' | 'critical';

export interface DemoTimelineEvent {
  label: string;
  at: string;
  tone: 'done' | 'current' | 'pending';
}

export interface DemoDocument {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  required: boolean;
  pages: number;
  updatedAt: string;
  note?: string;
}

export interface DemoLoad {
  id: string;
  reference: string;
  broker: string;
  routeLabel: string;
  origin: string;
  destination: string;
  pickupWindow: string;
  deliveryWindow: string;
  appointmentTime: string;
  equipment: string;
  trailer: string;
  mileage: number;
  stopCount: number;
  status: LoadStage;
  documents: DemoDocument[];
  timeline: DemoTimelineEvent[];
  driverNote?: string;
}

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  unread: boolean;
  actionLabel?: string;
}

export interface ScenarioBlueprint {
  id: DemoScenarioId;
  label: string;
  accent: string;
  summary: string;
  dockNote: string;
  offline: boolean;
  loads: DemoLoad[];
  notifications: DemoNotification[];
}

export interface DriverAppState {
  scenarioId: DemoScenarioId;
  screen: AppScreen;
  isAuthenticated: boolean;
  forgotSubmitted: boolean;
  selectedLoadId: string | null;
  deliverySheetOpen: boolean;
  notificationsOpen: boolean;
  offline: boolean;
  uploadSelection: DocumentType[];
  uploadError: string | null;
  uploadsQueued: boolean;
  loads: DemoLoad[];
  notifications: DemoNotification[];
}

export type DriverAppAction =
  | { type: 'applyScenario'; scenarioId: DemoScenarioId }
  | { type: 'resetCurrentScenario' }
  | { type: 'continueToPassword' }
  | { type: 'openForgotPassword' }
  | { type: 'submitForgotPassword' }
  | { type: 'openUpdatePassword' }
  | { type: 'login' }
  | { type: 'selectLoad'; loadId: string }
  | { type: 'goBack' }
  | { type: 'toggleNotifications' }
  | { type: 'openSettings' }
  | { type: 'openDeliverySheet' }
  | { type: 'closeDeliverySheet' }
  | { type: 'confirmDelivered' }
  | { type: 'openUpload' }
  | { type: 'toggleUploadType'; documentType: DocumentType }
  | { type: 'submitUpload' }
  | { type: 'retryUpload' }
  | { type: 'restoreSignal' }
  | { type: 'logout' };
