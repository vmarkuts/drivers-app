import type { PropsWithChildren } from 'react';

export function PhoneFrame({ children }: PropsWithChildren) {
  return (
    <section className="device-stage" aria-label="iPhone style preview frame">
      <div className="device-shell">
        <div className="device-shell__buttons" aria-hidden="true" />
        <div className="device-shell__camera" aria-hidden="true" />
        <div className="device-shell__screen">{children}</div>
      </div>
      <p className="device-stage__caption">iPhone 17 Pro Max style preview</p>
    </section>
  );
}
