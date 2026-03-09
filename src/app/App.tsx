import { useReducer } from 'react';
import { PresenterDock } from './PresenterDock';
import { PhoneFrame } from './PhoneFrame';
import { DriverApp } from '../demo/DriverApp';
import { driverAppReducer, createScenarioState } from '../demo/state';
import type { DemoScenarioId } from '../demo/types';

export default function App() {
  const [state, dispatch] = useReducer(driverAppReducer, 'happyPath', createScenarioState);

  return (
    <div className="scene-shell">
      <div className="scene-shell__backdrop" aria-hidden="true" />
      <PresenterDock
        activeScenarioId={state.scenarioId}
        onScenarioChange={(scenarioId: DemoScenarioId) => dispatch({ type: 'applyScenario', scenarioId })}
        onReset={() => dispatch({ type: 'resetCurrentScenario' })}
      />
      <PhoneFrame>
        <DriverApp state={state} dispatch={dispatch} />
      </PhoneFrame>
    </div>
  );
}
