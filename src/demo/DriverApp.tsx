import type { Dispatch, PropsWithChildren } from 'react';
import { getSelectedLoad } from './state';
import type { DemoDocument, DemoNotification, DemoTimelineEvent, DriverAppAction, DriverAppState, LoadStage } from './types';

interface DriverAppProps {
  state: DriverAppState;
  dispatch: Dispatch<DriverAppAction>;
}

const statusLabel: Record<LoadStage, string> = {
  assigned: 'Assigned',
  enRoute: 'Rolling',
  delivered: 'Delivered',
};

const documentStatusLabel: Record<DemoDocument['status'], string> = {
  pending: 'Pending',
  uploaded: 'Uploaded',
  rejected: 'Rejected',
};

const countUnread = (notifications: DemoNotification[]) =>
  notifications.filter((notification) => notification.unread).length;

const severityLabel: Record<DemoNotification['severity'], string> = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
};

function StatusBadge({ tone, children }: PropsWithChildren<{ tone: string }>) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
}

function NotificationOverlay({
  notifications,
  onClose,
}: {
  notifications: DemoNotification[];
  onClose: () => void;
}) {
  return (
    <div className="notification-sheet" role="dialog" aria-label="Notifications">
      <div className="notification-sheet__header">
        <div>
          <span className="eyebrow">Push inbox</span>
          <h3>Driver alerts</h3>
        </div>
        <button type="button" className="ghost-button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="notification-sheet__list">
        {notifications.length === 0 ? (
          <div className="empty-block">
            <strong>No alerts</strong>
            <p>New assignments and re-upload requests will land here.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <article key={notification.id} className={`notification-card notification-card--${notification.severity}`}>
              <div className="notification-card__topline">
                <StatusBadge tone={notification.severity}>{severityLabel[notification.severity]}</StatusBadge>
                {notification.actionLabel ? <span className="mini-chip">{notification.actionLabel}</span> : null}
              </div>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function DeliverySheet({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="bottom-sheet" role="dialog" aria-label="Confirm delivered">
      <div className="bottom-sheet__handle" aria-hidden="true" />
      <span className="eyebrow">Delivery confirmation</span>
      <h3>Mark this load as delivered?</h3>
      <p>Once confirmed, the app pushes the document step to the front so the driver can upload immediately.</p>
      <div className="action-row">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Not yet
        </button>
        <button type="button" className="primary-button" onClick={onConfirm}>
          Confirm delivered
        </button>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="screen screen--login">
      <div className="brand-mark">
        <span className="brand-mark__line" />
        <span className="brand-mark__name">HaulFlow</span>
      </div>
      <div className="login-hero">
        <h2>Loads in. Docs out. No browser clutter.</h2>
        <p>
          Built to keep a driver on one fast loop: open assigned trip, mark delivered, upload clean
          paperwork.
        </p>
      </div>
      <div className="paper-card">
        <div className="field-block">
          <span>Driver ID</span>
          <strong>DR-1187</strong>
        </div>
        <div className="field-block">
          <span>PIN</span>
          <strong>••••</strong>
        </div>
        <div className="field-note">
          Existing auth/API stays untouched. This demo focuses on the mobile workflow layer only.
        </div>
      </div>
      <button type="button" className="primary-button primary-button--full" onClick={onLogin}>
        Sign in to assigned loads
      </button>
    </section>
  );
}

function LoadsScreen({
  state,
  onOpenLoad,
  onOpenSettings,
}: {
  state: DriverAppState;
  onOpenLoad: (loadId: string) => void;
  onOpenSettings: () => void;
}) {
  return (
    <section className="screen">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Assigned trips</span>
          <h2>{state.loads.length === 0 ? 'Nothing active right now' : `${state.loads.length} active loads`}</h2>
        </div>
        <div className="section-heading__actions">
          {state.offline ? <StatusBadge tone="warning">Offline assist</StatusBadge> : null}
          <button type="button" className="secondary-button secondary-button--compact" onClick={onOpenSettings}>
            Settings
          </button>
        </div>
      </div>

      {state.loads.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">+</div>
          <strong>No loads yet</strong>
          <p>Dispatch will push new trips here. The same notification center handles new assignments.</p>
        </div>
      ) : (
        <div className="load-list">
          {state.loads.map((load) => {
            const documentTone = load.documents.some((document) => document.status === 'rejected')
              ? 'critical'
              : load.documents.some((document) => document.status === 'uploaded')
                ? 'info'
                : 'warning';

            return (
              <button
                key={load.id}
                type="button"
                className="load-card"
                onClick={() => onOpenLoad(load.id)}
              >
                <div className="load-card__header">
                  <div>
                    <span className="eyebrow">{load.reference}</span>
                    <h3>{load.routeLabel}</h3>
                  </div>
                  <StatusBadge tone={load.status}>{statusLabel[load.status]}</StatusBadge>
                </div>
                <div className="load-card__meta">
                  <span>{load.broker}</span>
                  <span>{load.mileage} mi</span>
                  <span>{load.appointmentTime}</span>
                </div>
                <div className="load-card__footer">
                  <div>
                    <strong>{load.destination}</strong>
                    <p>{load.deliveryWindow}</p>
                  </div>
                  <StatusBadge tone={documentTone}>
                    {load.documents.some((document) => document.status === 'rejected')
                      ? 'Docs need attention'
                      : load.documents.some((document) => document.status === 'uploaded')
                        ? 'Docs in system'
                        : 'Docs pending'}
                  </StatusBadge>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SettingsScreen({
  onLogout,
}: {
  onLogout: () => void;
}) {
  return (
    <section className="screen">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Driver profile</span>
          <h2>Settings</h2>
        </div>
      </div>

      <article className="detail-panel">
        <div className="panel-heading">
          <span className="eyebrow">Session</span>
          <h3>DR-1187</h3>
        </div>
        <p className="driver-note">Keep the session simple: notifications on, paperwork first, logout one tap away.</p>
      </article>

      <article className="detail-panel">
        <div className="panel-heading">
          <span className="eyebrow">Preferences</span>
          <h3>Driver defaults</h3>
        </div>
        <dl className="metric-grid">
          <div>
            <dt>Notifications</dt>
            <dd>Enabled</dd>
          </div>
          <div>
            <dt>Uploads</dt>
            <dd>Manual attach</dd>
          </div>
          <div>
            <dt>Theme</dt>
            <dd>High contrast</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>Driver</dd>
          </div>
        </dl>
      </article>

      <div className="sticky-actions">
        <button type="button" className="primary-button" onClick={onLogout}>
          Log out
        </button>
      </div>
    </section>
  );
}

function Timeline({ items }: { items: DemoTimelineEvent[] }) {
  return (
    <div className="timeline">
      {items.map((item) => (
        <div key={item.label} className={`timeline__item timeline__item--${item.tone}`}>
          <span className="timeline__dot" aria-hidden="true" />
          <div>
            <strong>{item.label}</strong>
            <p>{item.at}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentsPanel({ documents }: { documents: DemoDocument[] }) {
  return (
    <div className="document-list">
      {documents.map((document) => (
        <article key={document.id} className={`document-card document-card--${document.status}`}>
          <div className="document-card__paper" aria-hidden="true">
            <span />
          </div>
          <div className="document-card__body">
            <div className="document-card__topline">
              <strong>{document.type}</strong>
              <StatusBadge tone={document.status}>{documentStatusLabel[document.status]}</StatusBadge>
            </div>
            <p>
              {document.pages} page{document.pages > 1 ? 's' : ''} • {document.updatedAt}
            </p>
            {document.note ? <small>{document.note}</small> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function LoadDetailsScreen({
  state,
  onBack,
  onMarkDelivered,
  onUpload,
  onRestoreSignal,
}: {
  state: DriverAppState;
  onBack: () => void;
  onMarkDelivered: () => void;
  onUpload: () => void;
  onRestoreSignal: () => void;
}) {
  const selectedLoad = getSelectedLoad(state);

  if (!selectedLoad) {
    return (
      <section className="screen">
        <div className="empty-state">
          <strong>Load not found</strong>
          <p>Reset the scenario to return to a valid load state.</p>
        </div>
      </section>
    );
  }

  const needsReupload = selectedLoad.documents.some((document) => document.status === 'rejected');
  const hasUploadedDocs = selectedLoad.documents.every((document) => document.status === 'uploaded');

  return (
    <section className="screen screen--details">
      <div className="detail-hero">
        <div>
          <span className="eyebrow">{selectedLoad.reference}</span>
          <h2>{selectedLoad.routeLabel}</h2>
        </div>
        <StatusBadge tone={selectedLoad.status}>{statusLabel[selectedLoad.status]}</StatusBadge>
      </div>

      <div className="detail-grid">
        <article className="detail-panel">
          <div className="panel-heading">
            <span className="eyebrow">Trip brief</span>
            <h3>{selectedLoad.destination}</h3>
          </div>
          <dl className="metric-grid">
            <div>
              <dt>Broker</dt>
              <dd>{selectedLoad.broker}</dd>
            </div>
            <div>
              <dt>Appointment</dt>
              <dd>{selectedLoad.appointmentTime}</dd>
            </div>
            <div>
              <dt>Equipment</dt>
              <dd>{selectedLoad.equipment}</dd>
            </div>
            <div>
              <dt>Trailer</dt>
              <dd>{selectedLoad.trailer}</dd>
            </div>
          </dl>
          <p className="driver-note">{selectedLoad.driverNote}</p>
        </article>

        <article className="detail-panel">
          <div className="panel-heading">
            <span className="eyebrow">Status line</span>
            <h3>Move fast, then verify docs</h3>
          </div>
          <Timeline items={selectedLoad.timeline} />
        </article>
      </div>

      <article className="detail-panel">
        <div className="panel-heading">
          <span className="eyebrow">Delivery packet</span>
          <h3>BOL / POD checklist</h3>
        </div>
        <DocumentsPanel documents={selectedLoad.documents} />
      </article>

      {state.uploadsQueued ? (
        <article className="signal-banner">
          <div>
            <span className="eyebrow">Queued offline</span>
            <strong>Docs are saved locally and waiting for signal.</strong>
          </div>
          <button type="button" className="secondary-button" onClick={onRestoreSignal}>
            Restore signal & sync
          </button>
        </article>
      ) : null}

      <div className="sticky-actions">
        {selectedLoad.status !== 'delivered' ? (
          <button type="button" className="primary-button" onClick={onMarkDelivered}>
            Mark delivered
          </button>
        ) : (
          <button type="button" className="primary-button" onClick={onUpload}>
            {needsReupload ? 'Re-upload documents' : hasUploadedDocs ? 'Update documents' : 'Upload documents'}
          </button>
        )}
      </div>
    </section>
  );
}

function UploadScreen({
  state,
  onBack,
  onToggleType,
  onSubmit,
  onRetry,
}: {
  state: DriverAppState;
  onBack: () => void;
  onToggleType: (documentType: DemoDocument['type']) => void;
  onSubmit: () => void;
  onRetry: () => void;
}) {
  const selectedLoad = getSelectedLoad(state);

  if (!selectedLoad) {
    return null;
  }

  const ctaLabel = state.uploadError ? 'Retry upload' : 'Submit packet';

  return (
    <section className="screen screen--upload">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Upload flow</span>
          <h2>Capture only what matters</h2>
        </div>
        {state.offline ? <StatusBadge tone="warning">Signal weak</StatusBadge> : null}
      </div>

      {state.uploadError ? (
        <article className="error-banner">
          <strong>Upload interrupted</strong>
          <p>{state.uploadError}</p>
        </article>
      ) : null}

      <article className="capture-panel">
        <div className="panel-heading">
          <span className="eyebrow">Required set</span>
          <h3>{selectedLoad.reference}</h3>
        </div>
        <div className="selection-grid">
          {selectedLoad.documents.map((document) => {
            const isSelected = state.uploadSelection.includes(document.type);

            return (
              <button
                key={document.id}
                type="button"
                className={`scan-card${isSelected ? ' is-selected' : ''}`}
                onClick={() => onToggleType(document.type)}
              >
                <div className="scan-card__paper" aria-hidden="true">
                  <span />
                </div>
                <div className="scan-card__body">
                  <strong>{document.type}</strong>
                  <p>{document.status === 'rejected' ? 'Retake with cleaner framing' : 'Stage photo for upload'}</p>
                  <small>{isSelected ? 'Included in packet' : 'Tap to include'}</small>
                </div>
              </button>
            );
          })}
        </div>
      </article>

      <article className="paper-card paper-card--compact">
        <span className="eyebrow">Camera strategy</span>
        <p>Large edge-to-edge previews mimic a fast scan flow without needing native camera APIs in this demo.</p>
      </article>

      <div className="sticky-actions">
        <button
          type="button"
          className="primary-button"
          onClick={state.uploadError ? onRetry : onSubmit}
          disabled={state.uploadSelection.length === 0}
        >
          {ctaLabel}
        </button>
      </div>
    </section>
  );
}

export function DriverApp({ state, dispatch }: DriverAppProps) {
  const selectedLoad = getSelectedLoad(state);
  const unreadCount = countUnread(state.notifications);
  const canGoBack = state.screen === 'details' || state.screen === 'upload' || state.screen === 'settings';

  return (
    <div className="driver-app">
      <div className="driver-app__statusbar">
        <span className="statusbar-time">9:41</span>
        <div className="driver-app__status-icons">
          {state.offline ? (
            <span className="statusbar-pill statusbar-pill--offline">
              <span className="statusbar-pill__dot" aria-hidden="true" />
              No signal
            </span>
          ) : (
            <>
              <span className="statusbar-signal" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
              <span className="statusbar-network">5G</span>
            </>
          )}
          <span className="statusbar-battery" aria-label="Battery full">
            <span className="statusbar-battery__level" />
          </span>
        </div>
      </div>

      <header className="driver-app__header">
        <div className="driver-app__header-copy">
          {canGoBack ? (
            <button type="button" className="back-link back-link--header" onClick={() => dispatch({ type: 'goBack' })}>
              Back
            </button>
          ) : (
            <span className="eyebrow">HaulFlow Driver</span>
          )}
          <h1>
            {state.screen === 'login'
              ? 'Fast paperwork'
              : state.screen === 'loads'
                ? 'Assigned loads'
                : state.screen === 'details'
                  ? selectedLoad?.reference ?? 'Load details'
                  : state.screen === 'settings'
                    ? 'Settings'
                  : 'Upload packet'}
          </h1>
        </div>

        {state.screen !== 'login' ? (
          <button
            type="button"
            className="notification-button"
            onClick={() => dispatch({ type: 'toggleNotifications' })}
            aria-label="Open notifications"
          >
            Alerts
            {unreadCount > 0 ? <span className="notification-badge">{unreadCount}</span> : null}
          </button>
        ) : null}
      </header>

      <main className="driver-app__content">
        {state.screen === 'login' ? <LoginScreen onLogin={() => dispatch({ type: 'login' })} /> : null}
        {state.screen === 'loads' ? (
          <LoadsScreen
            state={state}
            onOpenLoad={(loadId) => dispatch({ type: 'selectLoad', loadId })}
            onOpenSettings={() => dispatch({ type: 'openSettings' })}
          />
        ) : null}
        {state.screen === 'details' ? (
          <LoadDetailsScreen
            state={state}
            onBack={() => dispatch({ type: 'goBack' })}
            onMarkDelivered={() => dispatch({ type: 'openDeliverySheet' })}
            onUpload={() => dispatch({ type: 'openUpload' })}
            onRestoreSignal={() => dispatch({ type: 'restoreSignal' })}
          />
        ) : null}
        {state.screen === 'upload' ? (
          <UploadScreen
            state={state}
            onBack={() => dispatch({ type: 'goBack' })}
            onToggleType={(documentType) => dispatch({ type: 'toggleUploadType', documentType })}
            onSubmit={() => dispatch({ type: 'submitUpload' })}
            onRetry={() => dispatch({ type: 'retryUpload' })}
          />
        ) : null}
        {state.screen === 'settings' ? <SettingsScreen onLogout={() => dispatch({ type: 'logout' })} /> : null}
      </main>

      {state.notificationsOpen ? (
        <NotificationOverlay
          notifications={state.notifications}
          onClose={() => dispatch({ type: 'toggleNotifications' })}
        />
      ) : null}

      {state.deliverySheetOpen ? (
        <DeliverySheet
          onCancel={() => dispatch({ type: 'closeDeliverySheet' })}
          onConfirm={() => dispatch({ type: 'confirmDelivered' })}
        />
      ) : null}
    </div>
  );
}
