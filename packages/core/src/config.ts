import { NetworkId } from './types'

export const Config = {
  Urls: {
    Web: (network: NetworkId) => {
      if (network === 'devnet') return 'https://devnet.peerme.io'
      if (network === 'testnet') return 'https://testnet.peerme.io'
      return 'https://peerme.io'
    },
  },
  DeepLink: {
    MaxActions: 1,
  },
}
