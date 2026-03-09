import { cloneScenarioBlueprint } from './fixtures';
import type { DemoDocument, DemoLoad, DemoNotification, DemoScenarioId, DocumentType, DriverAppAction, DriverAppState } from './types';

const resolveDefaultSelectedLoad = (loads: DemoLoad[]) => loads[0]?.id ?? null;

const withNotification = (notifications: DemoNotification[], notification: DemoNotification) => [
  { ...notification, unread: true },
  ...notifications,
];

const updateSelectedLoad = (
  state: DriverAppState,
  updater: (load: DemoLoad) => DemoLoad,
): DriverAppState => ({
  ...state,
  loads: state.loads.map((load) => (load.id === state.selectedLoadId ? updater(load) : load)),
});

const updateDocuments = (
  documents: DemoDocument[],
  selection: DocumentType[],
  status: DemoDocument['status'],
  updatedAt: string,
  note: string,
) =>
  documents.map((document) =>
    selection.includes(document.type)
      ? {
          ...document,
          status,
          updatedAt,
          note,
        }
      : document,
  );

const markDeliveredLoad = (load: DemoLoad): DemoLoad => ({
  ...load,
  status: 'delivered',
  timeline: load.timeline.map((item) => {
    if (item.label === 'Delivered') {
      return { ...item, tone: 'current', at: '14:20' };
    }

    if (item.label === 'Docs verified') {
      return { ...item, tone: 'pending' };
    }

    return { ...item, tone: 'done' };
  }),
});

const syncQueuedDocuments = (documents: DemoDocument[]) =>
  documents.map((document) =>
    document.status === 'pending'
      ? {
          ...document,
          status: 'uploaded' as const,
          updatedAt: 'Synced at 14:37',
          note: 'Connection restored. Sent to broker instantly.',
        }
      : document,
  );

export const createScenarioState = (scenarioId: DemoScenarioId): DriverAppState => {
  const blueprint = cloneScenarioBlueprint(scenarioId);

  return {
    scenarioId,
    screen: 'login',
    isAuthenticated: false,
    selectedLoadId: resolveDefaultSelectedLoad(blueprint.loads),
    deliverySheetOpen: false,
    notificationsOpen: false,
    offline: blueprint.offline,
    uploadSelection: [],
    uploadError: null,
    uploadsQueued: false,
    loads: blueprint.loads,
    notifications: blueprint.notifications,
  };
};

export const getSelectedLoad = (state: DriverAppState) =>
  state.loads.find((load) => load.id === state.selectedLoadId) ?? null;

export const driverAppReducer = (
  state: DriverAppState,
  action: DriverAppAction,
): DriverAppState => {
  switch (action.type) {
    case 'applyScenario':
      return createScenarioState(action.scenarioId);

    case 'resetCurrentScenario':
      return createScenarioState(state.scenarioId);

    case 'login':
      return {
        ...state,
        isAuthenticated: true,
        screen: 'loads',
      };

    case 'selectLoad':
      return {
        ...state,
        selectedLoadId: action.loadId,
        screen: 'details',
        deliverySheetOpen: false,
        uploadError: null,
      };

    case 'goBack':
      if (state.screen === 'details') {
        return { ...state, screen: 'loads', deliverySheetOpen: false };
      }

      if (state.screen === 'upload') {
        return { ...state, screen: 'details', uploadError: null };
      }

      if (state.screen === 'settings') {
        return { ...state, screen: 'loads' };
      }

      return state;

    case 'toggleNotifications':
      return {
        ...state,
        notificationsOpen: !state.notificationsOpen,
        notifications: !state.notificationsOpen
          ? state.notifications.map((notification) => ({ ...notification, unread: false }))
          : state.notifications,
      };

    case 'openSettings':
      return {
        ...state,
        screen: 'settings',
        notificationsOpen: false,
        deliverySheetOpen: false,
        uploadError: null,
      };

    case 'openDeliverySheet':
      return { ...state, deliverySheetOpen: true };

    case 'closeDeliverySheet':
      return { ...state, deliverySheetOpen: false };

    case 'confirmDelivered': {
      const nextState = updateSelectedLoad(state, markDeliveredLoad);

      return {
        ...nextState,
        deliverySheetOpen: false,
        screen: 'details',
      };
    }

    case 'openUpload': {
      return {
        ...state,
        screen: 'upload',
        uploadSelection: [],
        uploadError: null,
      };
    }

    case 'toggleUploadType': {
      const uploadSelection = state.uploadSelection.includes(action.documentType)
        ? state.uploadSelection.filter((type) => type !== action.documentType)
        : [...state.uploadSelection, action.documentType];

      return {
        ...state,
        uploadSelection,
      };
    }

    case 'submitUpload': {
      if (state.uploadSelection.length === 0) {
        return state;
      }

      if (state.scenarioId === 'uploadError') {
        return {
          ...state,
          uploadError: 'Weak signal interrupted the upload. Retry without leaving the load.',
        };
      }

      if (state.scenarioId === 'offlinePending') {
        const queuedState = updateSelectedLoad(state, (load) => ({
          ...load,
          documents: updateDocuments(
            load.documents,
            state.uploadSelection,
            'pending',
            'Queued locally',
            'Saved offline. Will sync as soon as signal returns.',
          ),
        }));

        return {
          ...queuedState,
          screen: 'details',
          uploadSelection: [],
          uploadsQueued: true,
          notifications: withNotification(queuedState.notifications, {
            id: 'queued-upload',
            title: 'Upload queued',
            message: 'BOL/POD saved locally. Driver can keep moving.',
            severity: 'warning',
            unread: true,
            actionLabel: 'Sync later',
          }),
        };
      }

      const uploadedState = updateSelectedLoad(state, (load) => ({
        ...load,
        documents: updateDocuments(
          load.documents,
          state.uploadSelection,
          'uploaded',
          'Sent at 14:32',
          'Clean scan accepted and routed to broker.',
        ),
        timeline: load.timeline.map((item) =>
          item.label === 'Docs verified'
            ? { ...item, tone: 'done', at: '14:32' }
            : item.label === 'Delivered'
              ? { ...item, tone: 'done' }
              : item,
        ),
      }));

      return {
        ...uploadedState,
        screen: 'details',
        uploadSelection: [],
        uploadError: null,
        notifications: withNotification(uploadedState.notifications, {
          id: `upload-complete-${state.scenarioId}`,
          title: state.scenarioId === 'reuploadRequired' ? 'Re-upload accepted' : 'Docs uploaded',
          message:
            state.scenarioId === 'reuploadRequired'
              ? 'Replacement BOL is clean. Broker delivery packet is complete.'
              : 'BOL/POD packet sent to the broker instantly.',
          severity: 'info',
          unread: true,
        }),
      };
    }

    case 'retryUpload': {
      if (!state.uploadSelection.length) {
        return state;
      }

      const uploadedState = updateSelectedLoad(state, (load) => ({
        ...load,
        documents: updateDocuments(
          load.documents,
          state.uploadSelection,
          'uploaded',
          'Retried at 14:35',
          'Retry succeeded. Broker packet updated.',
        ),
      }));

      return {
        ...uploadedState,
        screen: 'details',
        uploadSelection: [],
        uploadError: null,
        notifications: withNotification(uploadedState.notifications, {
          id: 'upload-retry-success',
          title: 'Retry succeeded',
          message: 'Driver fixed the upload without leaving the workflow.',
          severity: 'info',
          unread: true,
        }),
      };
    }

    case 'restoreSignal': {
      const restoredLoads = state.loads.map((load) => ({
        ...load,
        documents: syncQueuedDocuments(load.documents),
      }));

      return {
        ...state,
        offline: false,
        uploadsQueued: false,
        loads: restoredLoads,
        notifications: withNotification(state.notifications, {
          id: 'signal-restored',
          title: 'Connection restored',
          message: 'Queued documents synced in the background.',
          severity: 'info',
          unread: true,
        }),
      };
    }

    case 'logout':
      return createScenarioState(state.scenarioId);

    default:
      return state;
  }
};
