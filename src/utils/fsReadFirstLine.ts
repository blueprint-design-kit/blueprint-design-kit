'use server';

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

export function fsReadFirstLine(filePath: string): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        const fileStream = createReadStream(`./${filePath}`, { start: 0, end: 20 });
        const stream = createInterface({
            input: fileStream,
            crlfDelay: Infinity // Ensures correct handling of all line endings
        });

        stream.on('line', (line) => {
            resolve(line); // Resolve the promise with the first line
            stream.close(); // Close the readline interface after the first line
            fileStream.destroy(); // Stop the file stream
        });

        stream.on('close', () => {
            // This event fires if the file ends before a line is found (e.g., empty file)
            resolve(undefined); 
        });

        stream.on('error', (err) => {
            fileStream.destroy();
            reject(err);
        });
    });
}
