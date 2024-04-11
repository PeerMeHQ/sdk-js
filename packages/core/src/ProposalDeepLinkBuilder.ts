import qs from 'qs'
import { Config } from './config'
import { NetworkId, ProposalAction, SerializableProposalAction } from './types'

type Options = {
  network?: NetworkId
}

export class ProposalDeepLinkBuilder {
  private network: NetworkId
  private teamId: string
  private title: string | null = null
  private description: string | null = null
  private actions: ProposalAction[] = []

  constructor(teamId: string, options?: Options) {
    this.teamId = teamId
    this.network = options?.network || 'mainnet'
  }

  setTitle(title: string): ProposalDeepLinkBuilder {
    this.title = title
    return this
  }

  setDescription(description: string): ProposalDeepLinkBuilder {
    this.description = description
    return this
  }

  addAction(action: ProposalAction): ProposalDeepLinkBuilder {
    this.actions.push(action)
    return this
  }

  build(): string {
    if (!this.title) {
      throw new Error('title is required')
    }

    if (this.actions.length > Config.DeepLink.MaxActions) {
      throw new Error(`maximum number of actions is ${Config.DeepLink.MaxActions}`)
    }

    const webBaseUrl = Config.Urls.Web(this.network)
    const encodedTitle = encodeURIComponent(this.title)
    const encodedDescription = this.description ? encodeURIComponent(this.description) : ''
    const serializableActions = this.actions.map(this.toSerializableAction)
    const serializedActions = qs.stringify(serializableActions)

    return `${webBaseUrl}/${this.teamId}/propose/new?title=${encodedTitle}&description=${encodedDescription}&${serializedActions}`
  }

  private toSerializableAction(action: ProposalAction): SerializableProposalAction {
    return {
      xdestination: action.destination,
      xendpoint: action.endpoint,
      xvalue: action.value,
      xarguments: action.arguments,
      xpayments: action.payments,
    }
  }
}
