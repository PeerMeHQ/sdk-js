import { Config } from './config'
import { ProposalDeepLinkBuilder } from './ProposalDeepLinkBuilder'
import { ProposalAction, ProposalActionPayment } from './types'

describe('ProposalDeepLinkBuilder', () => {
  const baseWebURL = 'https://peerme.io'
  const teamId = 'team123'

  beforeEach(() => {
    Config.Urls.Web = jest.fn().mockReturnValue(baseWebURL)
    Config.DeepLink.MaxActions = 5
  })

  it('should build a correct URL with minimal required fields', () => {
    const builder = new ProposalDeepLinkBuilder(teamId)
    const title = 'Test Proposal'

    const url = builder.setTitle(title).build()

    expect(url).toBe('https://peerme.io/team123/propose?title=Test+Proposal')
  })

  it('should throw an error if title is not set', () => {
    const builder = new ProposalDeepLinkBuilder(teamId)

    expect(() => {
      builder.build()
    }).toThrow('title is required')
  })

  it('should encode and include description in the URL', () => {
    const builder = new ProposalDeepLinkBuilder(teamId)
    const title = 'Test Proposal'
    const description = 'Detailed description & info'

    const url = builder.setTitle(title).setDescription(description).build()

    expect(url).toBe('https://peerme.io/team123/propose?title=Test+Proposal&description=Detailed+description+%26+info')
  })

  it('should handle multiple actions and serialize them correctly', () => {
    const builder = new ProposalDeepLinkBuilder(teamId)
    const title = 'Test Proposal'
    const action1: ProposalAction = {
      destination: 'addr1',
      endpoint: 'end1',
      value: BigInt(100),
      args: ['arg1', 200, true, BigInt(300), null],
      payments: [
        {
          tokenId: 'token1',
          tokenNonce: 1,
          amount: BigInt(1000),
        },
      ],
    }
    const action2: ProposalAction = {
      destination: 'addr2',
      endpoint: 'end2',
      value: BigInt(200),
      args: ['arg2', 300, false, BigInt(400), null],
      payments: [
        {
          tokenId: 'token2',
          tokenNonce: 2,
          amount: BigInt(2000),
        },
      ],
    }

    builder
      .setTitle(title)
      .addAction(action1.destination, action1.endpoint, action1.value, action1.args, action1.payments)
      .addAction(action2.destination, action2.endpoint, action2.value, action2.args, action2.payments)

    const url = builder.build()
    const actionsParam = new URL(url).searchParams.get('actions[]')

    expect(actionsParam).not.toBeNull()
    expect(url).toBe(
      'https://peerme.io/team123/propose?title=Test+Proposal&actions%5B%5D=%7B%22xdestination%22%3A%22addr1%22%2C%22xendpoint%22%3A%22end1%22%2C%22xvalue%22%3A%22100%22%2C%22xargs%22%3A%5B%22arg1%22%2C200%2Ctrue%2C%22big%3A300%22%2Cnull%5D%2C%22xpayments%22%3A%5B%7B%22tokenId%22%3A%22token1%22%2C%22tokenNonce%22%3A1%2C%22amount%22%3A%221000%22%7D%5D%7D&actions%5B%5D=%7B%22xdestination%22%3A%22addr2%22%2C%22xendpoint%22%3A%22end2%22%2C%22xvalue%22%3A%22200%22%2C%22xargs%22%3A%5B%22arg2%22%2C300%2Cfalse%2C%22big%3A400%22%2Cnull%5D%2C%22xpayments%22%3A%5B%7B%22tokenId%22%3A%22token2%22%2C%22tokenNonce%22%3A2%2C%22amount%22%3A%222000%22%7D%5D%7D'
    )
  })

  it('should enforce the maximum number of actions', () => {
    const builder = new ProposalDeepLinkBuilder(teamId).setTitle('Test Proposal')
    const action = {
      destination: 'addr',
      endpoint: 'end',
      value: BigInt(100),
      arguments: ['arg'],
      payments: [
        {
          tokenId: 'token',
          tokenNonce: 1,
          amount: BigInt(1000),
        },
      ],
    }

    for (let i = 0; i <= Config.DeepLink.MaxActions; i++) {
      builder.addAction(action.destination, action.endpoint, action.value, action.arguments, action.payments)
    }

    expect(() => builder.build()).toThrow(`maximum number of actions is ${Config.DeepLink.MaxActions}`)
  })
})
