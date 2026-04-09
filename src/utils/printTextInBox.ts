import { styleText, type InspectColor } from 'node:util';

// Simple regex to strip ANSI escape codes (colors, bold, etc.)
function stripAnsi(str: string) {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1B\[[0-9;]*m/g, '');
}

type PrintTextInBoxOptions = {
    usesTitle?: boolean;
    boxColor?: InspectColor;
};

export function printTextInBox(text: string[] | string, options: PrintTextInBoxOptions = {}) {
    const lines = Array.isArray(text) ? text : String(text).split('\n');
    const { usesTitle = false, boxColor = 'whiteBright' } = options;

    function box(str: string) {
        return styleText([boxColor], str);
    }

    let title = '';
    if (usesTitle && lines.length > 1) {
        title = lines.shift() || '';
    }

    // Find longest line length
    const titleLength = title ? stripAnsi(title).length : 0;
    const width = lines.reduce((max, line) => {
        const visible = stripAnsi(line);
        return Math.max(max, visible.length, titleLength);
    }, 0);

    const horizontal = '─'.repeat(width + 2); // +2 for padding spaces
    const top    = box(`┌${horizontal}┐`);
    const bottom = box(`└${horizontal}┘`);
    let header = '';
    if (title) {
        header = `${box('│')} ${title}${' '.repeat(width - stripAnsi(title).length)} ${box('│')}\n`;
        header += box(`├${horizontal}┤`);
    }

    let middle = '';
    for (const line of lines) {
        const visible = stripAnsi(line);
        const padding = ' '.repeat(width - visible.length);
        middle += `${box('│')} ${line}${padding} ${box('│')}\n`;
    }

    return `\n${top}\n${header}\n${middle}${bottom}\n`;
}
