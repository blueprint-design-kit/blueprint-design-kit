declare module '@markedjs/html-differ' {
    export interface HtmlDifferOptions {
        [key: string]: unknown;
    }

    export class HtmlDiffer {
        constructor(options?: HtmlDifferOptions);
        diffHtml(html1: string, html2: string): Promise<HtmlDiffObject[]>;
    }
}

type HtmlDiffObject = {
    count: number;
    added: boolean;
    removed: boolean;
    value: string;
}
