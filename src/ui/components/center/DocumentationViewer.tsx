import type { ReactNode } from 'react';

export default function DocumentationViewer({ content, styleReset = false }: { content: ReactNode, styleReset?: boolean}) {
    return <div className={`blueprint-layout-documentation${styleReset ? ' blueprint-reset' : ''}`}>{content}</div>;
}
