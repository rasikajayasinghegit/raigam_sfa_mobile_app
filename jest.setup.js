/* eslint-env jest */

import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('phosphor-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return new Proxy(
    {},
    {
      get: () => React.forwardRef((props, ref) => React.createElement(View, { ...props, ref })),
    },
  );
});

jest.useFakeTimers();
if (typeof afterEach === 'function') {
  afterEach(() => {
    jest.runOnlyPendingTimers();
  });
}

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn((success, error) =>
    success({ coords: { latitude: 0, longitude: 0 } }),
  ),
}), { virtual: true });
jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn((success, error) =>
    success({ coords: { latitude: 0, longitude: 0 } }),
  ),
}), { virtual: true });
jest.mock(
  'react-native-immersive-mode',
  () => ({
    fullLayout: jest.fn(),
    setBarMode: jest.fn(),
    setBarColor: jest.fn(),
    setBarDefaultColor: jest.fn(),
    setBarStyle: jest.fn(),
    setBarTranslucent: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  }),
  { virtual: true },
);
