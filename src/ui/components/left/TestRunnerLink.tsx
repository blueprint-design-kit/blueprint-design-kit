import { TEST_RUNNER_URL_PATH } from "../../../config/constants.js";

const testRunnerSvg = <svg viewBox="0 0 40 40" width="20px" height="20px">
    <path
        d="M25.5 7.5h4a2 2 0 012 2v24a2 2 0 01-2 2h-19a2 2 0 01-2-2v-24a2 2 0 012-2h4m5.5-4a2 2 0 012 2h2.5a1 1 0 011 1v2a1 1 0 01-1 1h-9a1 1 0 01-1-1v-2a1 1 0 011-1H18a2 2 0 012-2Zm-.5 22h8m-8-5h6m-6-5h8m-15 0L14 17l3.5-3.5m-5 7L14 22l3.5-3.5m-5 7L14 27l3.5-3.5"
        stroke="currentColor"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
    ></path>
</svg>;

export default function TestRunnerLink({ baseUrl = '/blueprint' }: { baseUrl?: string }) {
    return <div className="blueprint-layout-test-runner-link">
        <a href={`${baseUrl}/${TEST_RUNNER_URL_PATH}`}>{testRunnerSvg} Run UI Tests &raquo;</a>
    </div>
}
