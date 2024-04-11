export type NetworkId = 'mainnet' | 'testnet' | 'devnet'

export type ProposalAction = {
  destination: string
  endpoint: string
  value: ProposalActionValue
  args: ProposalActionArg[]
  payments: ProposalActionPayment[]
}

export type ProposalActionValue = string | number | bigint

export type ProposalActionArg = string | number | boolean | bigint | null

export type ProposalActionPayment = {
  tokenId: string
  tokenNonce: number
  tokenDecimals?: number | null
  amount: ProposalActionValue
}

// we use x-prefix to avoid name collisions with wallet url parameters
export type SerializableProposalAction = {
  xdestination: string
  xendpoint: string
  xvalue: string
  xargs: ProposalActionArg[]
  xpayments: ProposalActionPayment[]
}
