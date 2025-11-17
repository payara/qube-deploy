import * as axios from 'axios';
import * as fs from 'fs';

export async function downloadPclJarFile(url: string, outputPath: string) {
    try {
        const writer = fs.createWriteStream(outputPath);
        const response = await axios.default({
            url,
            method: 'GET',
            responseType: 'stream',
        });
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            // @ts-ignore
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        throw new Error(`Failed to download PCL binaries: ${(error as Error).message}`);
    }
}
