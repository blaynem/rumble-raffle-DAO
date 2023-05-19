/**
 *
 *
 *
 * WAGMI IS FUCKED RIGHT NOW I DONT CARE.
 */

import { createConfig, configureChains, mainnet } from 'wagmi'

import { polygon } from '@wagmi/core/chains'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon],
  [alchemyProvider({ apiKey: 'yourAlchemyApiKey' }), publicProvider()]
)

// Set up wagmi config
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi'
      }
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: '...'
      }
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true
      }
    })
  ],
  publicClient,
  webSocketPublicClient
})
