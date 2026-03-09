import { scenarioBlueprints, scenarioOrder } from '../demo/fixtures';
import type { DemoScenarioId } from '../demo/types';

interface PresenterDockProps {
  activeScenarioId: DemoScenarioId;
  onScenarioChange: (scenarioId: DemoScenarioId) => void;
  onReset: () => void;
}

export function PresenterDock({
  activeScenarioId,
  onScenarioChange,
  onReset,
}: PresenterDockProps) {
  return (
    <aside className="presenter-dock">
      <div className="presenter-dock__header">
        <span className="presenter-dock__eyebrow">Client demo control</span>
        <h2>Driver MVP story</h2>
        <p>
          Scripted mobile workflow built to pitch the simplest useful driver app: loads, delivery,
          documents, alerts.
        </p>
      </div>

      <div className="presenter-dock__scenario-list" role="tablist" aria-label="Demo scenarios">
        {scenarioOrder.map((scenarioId) => {
          const scenario = scenarioBlueprints[scenarioId];
          const isActive = scenarioId === activeScenarioId;

          return (
            <button
              key={scenarioId}
              type="button"
              className={`scenario-pill${isActive ? ' is-active' : ''}`}
              onClick={() => onScenarioChange(scenarioId)}
            >
              <span>{scenario.label}</span>
              <small>{scenario.summary}</small>
            </button>
          );
        })}
      </div>

      <button type="button" className="presenter-dock__reset" onClick={onReset}>
        Reset current flow
      </button>
    </aside>
  );
}
