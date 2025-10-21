import * as core from '@actions/core';
import * as path from 'path';
import semver from 'semver';
import { downloadPclJarFile } from './download';
import { uploadToPayaraCloud } from './actions/upload';

async function main() {
    try {
        // Retrieve input parameters
        const token = core.getInput('token');
        const subscriptionName = core.getInput('subscription_name');
        const namespace = core.getInput('namespace');
        const appName = core.getInput('app_name');
        const artifact = core.getInput('artifact_location');
        const isDeploy = core.getBooleanInput('deploy');
        const pclVersion = core.getInput('qube_version') || '2.0.0';

        // Set environment variables
        process.env.PCL_AUTH_TOKEN = token;

        let binaryUrl = `https://nexus.payara.fish/repository/payara-artifacts/fish/payara/qube/qube-cli/2.0.0/qube-cli-${pclVersion}.jar`
        let binaryName = `qube-cli-${pclVersion}.jar`;
        // Download PCL
        if (semver.lt(pclVersion, '2.0.0')) {
            binaryUrl =  `https://nexus.payara.fish/repository/payara-artifacts/fish/payara/cloud/pcl/${pclVersion}/pcl-${pclVersion}.jar`;
            binaryName = `pcl-${pclVersion}.jar`;
        }

        const pclJarPath = path.join(__dirname, binaryName);

        await downloadPclJarFile(binaryUrl, pclJarPath);
        core.debug(`Binary file downloaded to ${pclJarPath}`);
        await uploadToPayaraCloud(pclJarPath, subscriptionName, namespace, appName, artifact, isDeploy);
    } catch (error) {
        core.setFailed(`Action failed: ${(error as Error).message}`);
    }
}

main();
