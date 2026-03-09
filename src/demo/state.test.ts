import { createScenarioState, driverAppReducer } from './state';

describe('driverAppReducer', () => {
  it('moves from login into loads', () => {
    const nextState = driverAppReducer(createScenarioState('happyPath'), { type: 'login' });

    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.screen).toBe('loads');
    expect(nextState.loads).toHaveLength(2);
  });

  it('completes the happy path upload flow', () => {
    let state = createScenarioState('happyPath');

    state = driverAppReducer(state, { type: 'login' });
    state = driverAppReducer(state, { type: 'selectLoad', loadId: 'load-happy-1' });
    state = driverAppReducer(state, { type: 'openDeliverySheet' });
    state = driverAppReducer(state, { type: 'confirmDelivered' });
    state = driverAppReducer(state, { type: 'openUpload' });
    state = driverAppReducer(state, { type: 'toggleUploadType', documentType: 'BOL' });
    state = driverAppReducer(state, { type: 'toggleUploadType', documentType: 'POD' });
    state = driverAppReducer(state, { type: 'submitUpload' });

    expect(state.screen).toBe('details');
    expect(state.loads[0]?.status).toBe('delivered');
    expect(state.loads[0]?.documents.every((document) => document.status === 'uploaded')).toBe(true);
    expect(state.notifications[0]?.title).toBe('Docs uploaded');
  });

  it('queues uploads offline and syncs them later', () => {
    let state = createScenarioState('offlinePending');

    state = driverAppReducer(state, { type: 'login' });
    state = driverAppReducer(state, { type: 'selectLoad', loadId: 'load-offline-1' });
    state = driverAppReducer(state, { type: 'openDeliverySheet' });
    state = driverAppReducer(state, { type: 'confirmDelivered' });
    state = driverAppReducer(state, { type: 'openUpload' });
    state = driverAppReducer(state, { type: 'toggleUploadType', documentType: 'BOL' });
    state = driverAppReducer(state, { type: 'toggleUploadType', documentType: 'POD' });
    state = driverAppReducer(state, { type: 'submitUpload' });

    expect(state.uploadsQueued).toBe(true);
    expect(state.loads[0]?.documents.every((document) => document.status === 'pending')).toBe(true);

    state = driverAppReducer(state, { type: 'restoreSignal' });

    expect(state.offline).toBe(false);
    expect(state.uploadsQueued).toBe(false);
    expect(state.loads[0]?.documents.every((document) => document.status === 'uploaded')).toBe(true);
  });

  it('keeps upload retry inside the same workflow', () => {
    let state = createScenarioState('uploadError');

    state = driverAppReducer(state, { type: 'login' });
    state = driverAppReducer(state, { type: 'selectLoad', loadId: 'load-error-1' });
    state = driverAppReducer(state, { type: 'openDeliverySheet' });
    state = driverAppReducer(state, { type: 'confirmDelivered' });
    state = driverAppReducer(state, { type: 'openUpload' });
    state = driverAppReducer(state, { type: 'toggleUploadType', documentType: 'BOL' });
    state = driverAppReducer(state, { type: 'toggleUploadType', documentType: 'POD' });
    state = driverAppReducer(state, { type: 'submitUpload' });

    expect(state.screen).toBe('upload');
    expect(state.uploadError).toMatch(/Weak signal/);

    state = driverAppReducer(state, { type: 'retryUpload' });

    expect(state.screen).toBe('details');
    expect(state.uploadError).toBeNull();
    expect(state.loads[0]?.documents.every((document) => document.status === 'uploaded')).toBe(true);
  });

  it('supports the empty no-loads state', () => {
    const state = driverAppReducer(createScenarioState('noLoads'), { type: 'login' });

    expect(state.screen).toBe('loads');
    expect(state.loads).toHaveLength(0);
    expect(state.selectedLoadId).toBeNull();
  });

  it('requires manual attach and supports logout from settings', () => {
    let state = createScenarioState('happyPath');

    state = driverAppReducer(state, { type: 'login' });
    state = driverAppReducer(state, { type: 'selectLoad', loadId: 'load-happy-1' });
    state = driverAppReducer(state, { type: 'openDeliverySheet' });
    state = driverAppReducer(state, { type: 'confirmDelivered' });
    state = driverAppReducer(state, { type: 'openUpload' });

    expect(state.uploadSelection).toHaveLength(0);

    state = driverAppReducer(state, { type: 'goBack' });
    state = driverAppReducer(state, { type: 'goBack' });
    state = driverAppReducer(state, { type: 'openSettings' });

    expect(state.screen).toBe('settings');

    state = driverAppReducer(state, { type: 'logout' });

    expect(state.screen).toBe('login');
    expect(state.isAuthenticated).toBe(false);
  });
});
