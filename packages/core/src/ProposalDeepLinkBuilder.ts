import { Config } from './config'
import {
  NetworkId,
  ProposalAction,
  ProposalActionArg,
  ProposalActionValue,
  ProposalActionPayment,
  SerializableProposalAction,
} from './types'

type Options = {
  network?: NetworkId
}

const ArgBigIntPrefix = 'big:'

const QueryParams = {
  Title: 'title',
  Description: 'description',
  Actions: 'actions',
  AccessToken: 'accessToken',
}

export class ProposalDeepLinkBuilder {
  private network: NetworkId
  private teamId: string
  private userAccessToken: string | null = null

  private title: string | null = null
  private description: string | null = null
  private actions: ProposalAction[] = []

  constructor(teamId: string, options?: Options) {
    this.teamId = teamId
    this.network = options?.network || 'mainnet'
  }

  authenticate(accessToken: string): ProposalDeepLinkBuilder {
    this.userAccessToken = accessToken
    return this
  }

  setTitle(title: string): ProposalDeepLinkBuilder {
    this.title = title
    return this
  }

  setDescription(description: string): ProposalDeepLinkBuilder {
    this.description = description
    return this
  }

  addAction(
    destination: string,
    endpoint: string,
    value?: ProposalActionValue,
    args?: ProposalActionArg[],
    payments?: ProposalActionPayment[]
  ): ProposalDeepLinkBuilder {
    this.actions.push({
      destination,
      endpoint,
      value: value || BigInt(0),
      args: args || [],
      payments: payments || [],
    })
    return this
  }

  build(): string {
    if (!this.title) {
      throw new Error('title is required')
    }

    if (this.actions.length > Config.DeepLink.MaxActions) {
      throw new Error(`maximum number of actions is ${Config.DeepLink.MaxActions}`)
    }

    const params = new URLSearchParams()
    params.set(QueryParams.Title, this.title)
    if (this.description) params.set(QueryParams.Description, this.description)

    this.actions.map(this.toSerializableAction).forEach((serializable) => {
      params.append(QueryParams.Actions + '[]', JSON.stringify(serializable, null, 0))
    })

    if (this.userAccessToken) {
      params.set(QueryParams.AccessToken, this.userAccessToken)
    }

    return `${Config.Urls.Web(this.network)}/${this.teamId}/propose?${params.toString()}`
  }

  private toSerializableAction(action: ProposalAction): SerializableProposalAction {
    return {
      xdestination: action.destination,
      xendpoint: action.endpoint,
      xvalue: action.value.toString(),
      xargs: action.args.map((arg) => {
        if (typeof arg === 'bigint') return ArgBigIntPrefix + arg.toString()
        return arg
      }),
      xpayments: action.payments.map((payment) => ({
        tokenId: payment.tokenId,
        tokenNonce: payment.tokenNonce,
        tokenDecimals: payment.tokenDecimals,
        amount: payment.amount.toString(),
      })),
    }
  }
}
