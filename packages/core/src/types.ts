export type NetworkId = 'mainnet' | 'testnet' | 'devnet'

export type ProposalAction = {
  destination: string
  endpoint: string
  value: bigint
  arguments: ProposalActionArg[]
  payments: ProposalActionPayment[]
};

export type ProposalActionArg = string | number | boolean | bigint | null

export type ProposalActionPayment = {
  tokenId: string;
  tokenNonce: number;
  tokenDecimals?: number | null;
  amount: bigint;
};

// we use x-prefix to avoid name collisions with wallet url parameters
export type SerializableProposalAction = {
  xdestination: string
  xendpoint: string
  xvalue: bigint
  xarguments: ProposalActionArg[]
  xpayments: ProposalActionPayment[]
};
