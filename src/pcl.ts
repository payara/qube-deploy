import * as exec from '@actions/exec';
import * as core from '@actions/core';

export async function ensureJavaIsAvailable() {
    try {
        await exec.exec(getJava(21), ['-version'], {
            silent: true,
            listeners: {
                stdout: (data: Buffer) => core.info(data.toString()),
                stderr: (data: Buffer) => {
                    const message = data.toString();
                    // Only log certain critical errors as stderr
                    if (message.includes('ERROR') || message.includes('Failed')) {
                        core.error(message);
                    } else {
                        core.info(message); // Log informational messages in stdout
                    }
                },
            }
        });
    } catch (error) {
        core.setFailed('Java is not installed. Please ensure actions/setup-java is used in your workflow.');
        throw new Error('Java not available');
    }
}

export async function runPclCommand(command: string, args: string[]) {
    await ensureJavaIsAvailable();

    try {
        const javaArgs = ['-jar', command, ...args];
        core.debug(`Running Qube command: java ${javaArgs.join(' ')}`);

        await exec.exec(getJava(21), javaArgs, {
            silent: false,
            listeners: {
                stdout: (data: Buffer) => core.info(data.toString()),
                stderr: (data: Buffer) => {
                    const message = data.toString();
                    // Only log certain critical errors as stderr
                    if (message.includes('ERROR') || message.includes('Failed')) {
                        core.error(message);
                    } else {
                        core.info(message); // Log informational messages in stdout
                    }
                },
            },
        });
    } catch (error) {
        core.setFailed(`Failed to execute Qube command: ${(error as Error).message}`);
    }
}

export function getJava(version: number): string {
    let javaHome: string | undefined;

    // get the java home env variable based on version
    switch (version) {
        case 8:
            javaHome = process.env['JAVA_HOME_8_X64'];
            break;
        case 11:
            javaHome = process.env['JAVA_HOME_11_X64'];
            break;
        case 17:
            javaHome =  process.env['JAVA_HOME_17_X64'];
            break;
        case 21:
            javaHome = process.env['JAVA_HOME_21_X64'];
            break;
        default:
            javaHome = process.env['JAVA_HOME'];
            break;
    }

    if (javaHome) {
        return `${javaHome}/bin/java`;
    } else {
        throw new Error(`Cannot find Java ${version} in variables`);
    }

}
