'use client';

import type { ChangeEvent, KeyboardEvent } from 'react';
import { TEST_RUNNER_URL_PATH } from '../../../config/constants.js';

const runAll = 'Test all expectations »';
const runMatching = 'Test matching expectations »';

function runTests() {
    const filterInput = document.getElementById('test_filter') as HTMLInputElement | null;
    const filter = filterInput && filterInput.value || '*';
    window.location.href = `${TEST_RUNNER_URL_PATH}/${encodeURIComponent(filter)}`;
}

function filterEntered(event: ChangeEvent<HTMLInputElement>) {
    const runButton = document.getElementById('run_button');
    if (runButton) {
        runButton.innerHTML = event.currentTarget.value ? runMatching : runAll;
    }
}

function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
        runTests();
    }
}

export default function TestRunnerLauncher() {
    return <div className='blueprint-layout-test-runner blueprint-reset'>
        <button id="run_button" onClick={runTests}>{runAll}</button>
        <div style={{ padding: 20 }}>---</div>
        <div>
            <input id="test_filter" type="text" placeholder="Filter by regex..." onChange={filterEntered} onKeyDown={onKeyDown} />
        </div>
    </div>;
}
