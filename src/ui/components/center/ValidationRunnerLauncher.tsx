'use client';

import type { ChangeEvent, KeyboardEvent } from 'react';

const runAll = 'Test all expectations »';
const runMatching = 'Test matching expectations »';

function runValidations() {
    const filterInput = document.getElementById('validation_filter') as HTMLInputElement | null;
    const filter = filterInput && filterInput.value || '*';
    window.location.href = `validate/${encodeURIComponent(filter)}`;
}

function filterEntered(event: ChangeEvent<HTMLInputElement>) {
    const runButton = document.getElementById('run_button');
    if (runButton) {
        runButton.innerHTML = event.currentTarget.value ? runMatching : runAll;
    }
}

function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
        runValidations();
    }
}

export default function ValidationRunnerLauncher() {
    return <div className='blueprint-layout-validations-runner blueprint-reset'>
        <button id="run_button" onClick={runValidations}>{runAll}</button>
        <div style={{ padding: 20 }}>---</div>
        <div>
            <input id="validation_filter" type="text" placeholder="Filter by regex..." onChange={filterEntered} onKeyDown={onKeyDown} />
        </div>
    </div>;
}
