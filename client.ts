import '@react-native-anywhere/polyfill-base64';
import { createClient } from '@dynamic-labs/client';
import { ReactNativeExtension } from '@dynamic-labs/react-native-extension';
import { ViemExtension } from '@dynamic-labs/viem-extension';
import { EthereumGaslessExtension } from '@dynamic-labs/ethereum-gasless-extension';
import 'fast-text-encoding';

export const dynamicClient = createClient({
  environmentId: process.env.EXPO_PUBLIC_DYNAMIC_ENVIRONMENT_ID || 'YOUR_DYNAMIC_ENVIRONMENT_ID',
  appName: '3310',
})
  .extend(ReactNativeExtension({
    appOrigin: 'https://auth.play3310.xyz',
  }))
  .extend(ViemExtension())
  .extend(EthereumGaslessExtension());
