import * as exec from '@actions/exec';
import * as core from '@actions/core';
import { runPclCommand, ensureJavaIsAvailable, getJava } from '../pcl';

jest.mock('@actions/exec');
jest.mock('@actions/core');

describe('PCL Commands', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env['JAVA_HOME_21_X64'] = '/usr/lib/jvm/java-21';
    });

    afterEach(() => {
        delete process.env['JAVA_HOME_21_X64'];
    });

    describe('getJava', () => {
        it('should return correct Java path for version 21', () => {
            expect(getJava(21)).toBe('/usr/lib/jvm/java-21/bin/java');
        });

        it('should throw an error if Java version is not set', () => {
            delete process.env['JAVA_HOME_21_X64'];
            expect(() => getJava(21)).toThrow('Cannot find Java 21 in variables');
        });
    });

    describe('ensureJavaIsAvailable', () => {
        it('should not throw if Java is available', async () => {
            (exec.exec as jest.Mock).mockResolvedValue(0);
            await expect(ensureJavaIsAvailable()).resolves.not.toThrow();
        });

        it('should fail if Java is not available', async () => {
            (exec.exec as jest.Mock).mockRejectedValue(new Error('Java not found'));
            await expect(ensureJavaIsAvailable()).rejects.toThrow('Java not available');
            expect(core.setFailed).toHaveBeenCalledWith(
                'Java is not installed. Please ensure actions/setup-java is used in your workflow.'
            );
        });
    });

    describe('runPclCommand', () => {
        it('should execute the Qube command when Java is available', async () => {
            (exec.exec as jest.Mock).mockResolvedValue(0);
            await runPclCommand('qube-2.0.0.jar', ['deploy']);
            expect(exec.exec).toHaveBeenCalledWith(
                '/usr/lib/jvm/java-21/bin/java',
                ['-jar', 'qube-2.0.0.jar', 'deploy'],
                expect.any(Object)
            );
        });

        it('should setFailed when PCL command fails', async () => {
            (exec.exec as jest.Mock)
                .mockImplementationOnce(() => Promise.resolve(0))
                .mockRejectedValueOnce(new Error('PCL command failed'));
            await runPclCommand('qube-2.0.0.jar', ['deploy']);
            expect(core.setFailed).toHaveBeenCalledWith('Failed to execute Qube command: PCL command failed');
        });
    });

});
