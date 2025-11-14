import {runPclCommand} from '../pcl';
import semver from 'semver';

export async function uploadToPayaraCloud(
    pclExecutable: string,
    subscriptionName: string | null,
    namespace: string,
    appName: string | null,
    warFile: string,
    isDeploy: boolean,
    endpointUrl: string | null,
    pclVersion: string
) {
    const args: string[] = ['upload', '-n', namespace];

    if (subscriptionName) {
        args.push('-s', subscriptionName);
    }

    if (appName) {
        args.push('-a', appName);
    }

    args.push(warFile);

    if (isDeploy) {
        args.push('--deploy');
    }

    if (endpointUrl && semver.valid(pclVersion) && semver.gte(pclVersion, '2.0.0')) {
        args.push('--endpoint', endpointUrl);
    }

    await runPclCommand(pclExecutable, args);
}
