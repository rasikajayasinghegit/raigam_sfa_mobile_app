#!/usr/bin/env node

const {execFileSync, spawn, spawnSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const BOOT_TIMEOUT_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 3000;

const adbBinary = resolveAdbBinary();
const emulatorBinary = resolveEmulatorBinary();
const npxBinary = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function resolveBinary(name, candidates) {
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    if (candidate === name) {
      return candidate;
    }

    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const exeCandidate = `${candidate}.exe`;
    if (fs.existsSync(exeCandidate)) {
      return exeCandidate;
    }
  }

  return name;
}

function resolveAdbBinary() {
  return resolveBinary('adb', [
    process.env.ANDROID_HOME &&
      path.join(process.env.ANDROID_HOME, 'platform-tools', 'adb'),
    process.env.ANDROID_SDK_ROOT &&
      path.join(process.env.ANDROID_SDK_ROOT, 'platform-tools', 'adb'),
    process.env.LOCALAPPDATA &&
      path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk', 'platform-tools', 'adb'),
    'adb',
  ]);
}

function resolveEmulatorBinary() {
  return resolveBinary('emulator', [
    process.env.ANDROID_HOME && path.join(process.env.ANDROID_HOME, 'emulator', 'emulator'),
    process.env.ANDROID_SDK_ROOT && path.join(process.env.ANDROID_SDK_ROOT, 'emulator', 'emulator'),
    process.env.LOCALAPPDATA &&
      path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk', 'emulator', 'emulator'),
    'emulator',
  ]);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message) {
  process.stdout.write(`${message}\n`);
}

function run(cmd, args = [], options = {}) {
  return execFileSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function runStreaming(cmd, args = [], options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Command failed with exit code ${result.status ?? 'unknown'}`);
  }
}

function hasRunningDevice() {
  const output = run(adbBinary, ['devices']);
  return output
    .split(/\r?\n/)
    .some(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('List of devices') && trimmed.endsWith('\tdevice');
    });
}

function listAvds() {
  const output = run(emulatorBinary, ['-list-avds']);
  return output.split(/\r?\n/).filter(Boolean);
}

function startEmulator(avdName) {
  log(`Starting emulator "${avdName}"...`);
  const child = spawn(emulatorBinary, ['-avd', avdName], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
}

async function waitForBoot() {
  log('Waiting for emulator to connect to adb...');
  execFileSync(adbBinary, ['wait-for-device'], {
    stdio: 'ignore',
    timeout: BOOT_TIMEOUT_MS,
  });

  const start = Date.now();
  log('Waiting for emulator to finish booting...');
  while (Date.now() - start < BOOT_TIMEOUT_MS) {
    const booted = run(adbBinary, ['shell', 'getprop', 'sys.boot_completed']);
    if (booted.trim() === '1') {
      log('Emulator booted.');
      return;
    }
    await sleep(CHECK_INTERVAL_MS);
  }

  throw new Error('Timed out waiting for emulator to boot.');
}

async function main() {
  try {
    execFileSync(adbBinary, ['start-server'], {stdio: 'ignore'});
    let startedEmulator = false;

    if (!hasRunningDevice()) {
      const avds = listAvds();
      if (avds.length === 0) {
        throw new Error('No Android Virtual Devices found. Create an AVD in Android Studio first.');
      }

      startEmulator(avds[0]);
      startedEmulator = true;
      await waitForBoot();
    } else {
      log('Android device or emulator already connected.');
    }

    log('Building and installing the app...');
    runStreaming(npxBinary, ['react-native', 'run-android']);
  } catch (error) {
    console.error(`\nFailed to run Android build: ${error.message}`);
    process.exit(1);
  }
}

main();
