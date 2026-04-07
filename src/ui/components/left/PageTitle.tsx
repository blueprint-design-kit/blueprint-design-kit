// const logoSvg = <svg
//   width="32"
//   height="32"
//   viewBox="0 0 32 32"
//   xmlns="http://www.w3.org/2000/svg"
// >
//   {/* Outer circle */}
//   <circle
//     cx="16"
//     cy="12"
//     r="9"
//     fill="none"
//     stroke="#1B272F"
//     strokeWidth="2"
//   />
//   {/* Hinge */}
//   <rect
//     x="14"
//     y="3"
//     width="4"
//     height="6"
//     rx="1.2"
//     fill="#1B272F"
//   />
//   <circle
//     cx="16"
//     cy="7"
//     r="1.2"
//     fill="#EAE0CF"
//   />
//   {/* Left leg */}
//   <path
//     d="M16 9 L11 23 L13 24 L16 12 Z"
//     fill="#94B4C1"
//     stroke="#1B272F"
//     strokeWidth="1.2"
//     strokeLinejoin="round"
//   />
//   {/* Left tip */}
//   <path
//     d="M10.5 24 L14 24 L12.25 27 Z"
//     fill="#EAE0CF"
//     stroke="#1B272F"
//     strokeWidth="1.2"
//   />
//   {/* Right leg */}
//   <path
//     d="M16 9 L21 23 L19 24 L16 12 Z"
//     fill="#547792"
//     stroke="#1B272F"
//     strokeWidth="1.2"
//     strokeLinejoin="round"
//   />
//   {/* Right tip */}
//   <path
//     d="M18 24 L21.5 24 L19.75 27 Z"
//     fill="#EAE0CF"
//     stroke="#1B272F"
//     strokeWidth="1.2"
//   />
//   {/* Knob */}
//   <rect
//     x="21.5"
//     y="13"
//     width="3"
//     height="2"
//     rx="0.6"
//     fill="#1B272F"
//   />
// </svg>;

import type { ReactNode } from 'react';

export default function PageTitle({ title = 'Component Library', baseUrl = '/blueprint' }: { title?: ReactNode, baseUrl?: string }) {
    return <div className="blueprint-layout-page-title">
        <a href={baseUrl}>
            {/* <span className="blueprint-layout-page-title-logo-box">{logoSvg}</span> */}
            {title}
        </a>
    </div>;
}
