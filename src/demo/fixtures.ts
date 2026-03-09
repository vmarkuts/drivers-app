import type { DemoLoad, DemoNotification, DemoScenarioId, DemoTimelineEvent, ScenarioBlueprint } from './types';

const makeTimeline = (current: 'assigned' | 'enRoute' | 'delivered' | 'docs'): DemoTimelineEvent[] => {
  const order = ['assigned', 'enRoute', 'delivered', 'docs'] as const;
  const labels: Record<(typeof order)[number], { label: string; at: string }> = {
    assigned: { label: 'Assigned', at: '08:10' },
    enRoute: { label: 'Rolling to consignee', at: '11:45' },
    delivered: { label: 'Delivered', at: '14:20' },
    docs: { label: 'Docs verified', at: '14:32' },
  };

  const currentIndex = order.indexOf(current);

  return order.map((step, index) => ({
    label: labels[step].label,
    at: labels[step].at,
    tone: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'pending',
  }));
};

const makeLoad = (overrides: Partial<DemoLoad> & Pick<DemoLoad, 'id' | 'reference' | 'routeLabel'>): DemoLoad => ({
  id: overrides.id,
  reference: overrides.reference,
  routeLabel: overrides.routeLabel,
  broker: overrides.broker ?? 'Northline Brokerage',
  origin: overrides.origin ?? 'Dallas, TX',
  destination: overrides.destination ?? 'Laredo, TX',
  pickupWindow: overrides.pickupWindow ?? 'Today • 06:30 - 07:30',
  deliveryWindow: overrides.deliveryWindow ?? 'Today • 14:00 - 15:00',
  appointmentTime: overrides.appointmentTime ?? '14:30',
  equipment: overrides.equipment ?? '53FT Dry Van',
  trailer: overrides.trailer ?? 'TRL-9047',
  mileage: overrides.mileage ?? 428,
  stopCount: overrides.stopCount ?? 2,
  status: overrides.status ?? 'enRoute',
  driverNote: overrides.driverNote ?? 'Keep consignee signature visible in final shot.',
  documents: overrides.documents ?? [
    {
      id: `${overrides.id}-bol`,
      type: 'BOL',
      status: 'pending',
      required: true,
      pages: 2,
      updatedAt: 'Not uploaded',
      note: 'Need a flat, glare-free scan.',
    },
    {
      id: `${overrides.id}-pod`,
      type: 'POD',
      status: 'pending',
      required: true,
      pages: 1,
      updatedAt: 'Not uploaded',
      note: 'Capture signature and arrival stamp.',
    },
  ],
  timeline: overrides.timeline ?? makeTimeline('enRoute'),
});

const makeNotification = (
  id: string,
  title: string,
  message: string,
  severity: DemoNotification['severity'],
  actionLabel?: string,
): DemoNotification => ({
  id,
  title,
  message,
  severity,
  actionLabel,
  unread: true,
});

const happyLoads: DemoLoad[] = [
  makeLoad({
    id: 'load-happy-1',
    reference: 'HF-2481',
    routeLabel: 'Dallas -> Laredo',
    status: 'enRoute',
    timeline: makeTimeline('enRoute'),
  }),
  makeLoad({
    id: 'load-happy-2',
    reference: 'HF-2477',
    routeLabel: 'Houston -> Austin',
    destination: 'Austin, TX',
    deliveryWindow: 'Tomorrow • 08:00 - 09:30',
    appointmentTime: '08:15',
    mileage: 187,
    status: 'assigned',
    timeline: makeTimeline('assigned'),
    documents: [
      {
        id: 'load-happy-2-bol',
        type: 'BOL',
        status: 'pending',
        required: true,
        pages: 2,
        updatedAt: 'Need after delivery',
      },
      {
        id: 'load-happy-2-pod',
        type: 'POD',
        status: 'pending',
        required: true,
        pages: 1,
        updatedAt: 'Need after delivery',
      },
    ],
  }),
];

const rejectedLoad = makeLoad({
  id: 'load-reupload-1',
  reference: 'HF-2512',
  routeLabel: 'San Antonio -> El Paso',
  origin: 'San Antonio, TX',
  destination: 'El Paso, TX',
  status: 'delivered',
  timeline: makeTimeline('delivered'),
  documents: [
    {
      id: 'load-reupload-1-bol',
      type: 'BOL',
      status: 'rejected',
      required: true,
      pages: 2,
      updatedAt: '14:42',
      note: 'Reject reason: glare hides consignee signature.',
    },
    {
      id: 'load-reupload-1-pod',
      type: 'POD',
      status: 'uploaded',
      required: true,
      pages: 1,
      updatedAt: '14:43',
      note: 'Accepted and sent to broker.',
    },
  ],
  driverNote: 'Retake BOL in shade. Keep all corners visible.',
});

const offlineLoad = makeLoad({
  id: 'load-offline-1',
  reference: 'HF-2528',
  routeLabel: 'Odessa -> Amarillo',
  origin: 'Odessa, TX',
  destination: 'Amarillo, TX',
  status: 'enRoute',
  timeline: makeTimeline('enRoute'),
  driverNote: 'Signal is weak near the consignee. Queue upload if needed.',
});

const errorLoad = makeLoad({
  id: 'load-error-1',
  reference: 'HF-2550',
  routeLabel: 'McAllen -> Corpus Christi',
  origin: 'McAllen, TX',
  destination: 'Corpus Christi, TX',
  status: 'enRoute',
  timeline: makeTimeline('enRoute'),
  driverNote: 'Customer needs docs immediately after unload.',
});

export const scenarioOrder: DemoScenarioId[] = [
  'happyPath',
  'reuploadRequired',
  'offlinePending',
  'uploadError',
  'noLoads',
];

export const scenarioBlueprints: Record<DemoScenarioId, ScenarioBlueprint> = {
  happyPath: {
    id: 'happyPath',
    label: 'Happy path',
    accent: 'amber',
    summary: 'Standard driver flow from assigned load to delivered docs.',
    dockNote: 'Use this for the clean MVP pitch: sign in, open load, mark delivered, upload BOL/POD.',
    offline: false,
    loads: happyLoads,
    notifications: [
      makeNotification(
        'happy-assign',
        'New load assigned',
        'HF-2481 is ready for delivery. Upload paperwork right after arrival.',
        'info',
      ),
    ],
  },
  reuploadRequired: {
    id: 'reuploadRequired',
    label: 'Re-upload required',
    accent: 'crimson',
    summary: 'Driver sees a rejected BOL and gets back to clean upload quickly.',
    dockNote: 'Shows why a simple re-upload loop matters more than broad feature scope.',
    offline: false,
    loads: [rejectedLoad],
    notifications: [
      makeNotification(
        'reupload-1',
        'BOL needs re-upload',
        'Broker rejected the BOL for HF-2512. Signature is not readable.',
        'critical',
        'Retake BOL',
      ),
    ],
  },
  offlinePending: {
    id: 'offlinePending',
    label: 'Offline pending',
    accent: 'steel',
    summary: 'Driver can finish the task even when signal is poor.',
    dockNote: 'Important MVP proof: upload does not block the driver when connection drops.',
    offline: true,
    loads: [offlineLoad],
    notifications: [
      makeNotification(
        'offline-1',
        'Weak signal detected',
        'Uploads will queue locally until signal returns.',
        'warning',
      ),
    ],
  },
  uploadError: {
    id: 'uploadError',
    label: 'Upload retry',
    accent: 'orange',
    summary: 'Submission fails once, then driver retries without losing the flow.',
    dockNote: 'Use this if the client asks how the app stays reliable under real field conditions.',
    offline: false,
    loads: [errorLoad],
    notifications: [],
  },
  noLoads: {
    id: 'noLoads',
    label: 'No loads',
    accent: 'slate',
    summary: 'Quiet state for drivers between assignments.',
    dockNote: 'Shows the empty state is calm, useful, and still feels like a real app.',
    offline: false,
    loads: [],
    notifications: [
      makeNotification(
        'no-loads-1',
        'Waiting on dispatch',
        'No active loads yet. Push alerts will appear here when dispatch assigns one.',
        'info',
      ),
    ],
  },
};

export const cloneScenarioBlueprint = (scenarioId: DemoScenarioId): ScenarioBlueprint =>
  structuredClone(scenarioBlueprints[scenarioId]);
