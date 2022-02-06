import fetch from 'cross-fetch';

export interface SenseiClientConfig {
  basePath: string;
  macaroon?: string;
}

export interface SenseiConfig {
  electrumUrl: string;
}

export interface NodeStatus {
  created: boolean;
  running: boolean;
  authenticated: boolean;
  alias?: string;
  pubkey?: string;
  username?: string;
  role?: number;
}

export interface InitParams {
  username: string;
  alias: string;
  passphrase: string;
  electrumUrl: string;
  start: boolean;
}

export interface InitResponse {
  pubkey: string;
  macaroon: string;
  externalId: string;
  role: number;
}

export interface LoginResponse {
  pubkey: string;
  macaroon: string;
  alias: string;
  role: number;
}

export interface NodeAuthInfo {
  pubkey: string;
  macaroon: string;
}

export interface CreateNodeParams {
  username: string;
  alias: string;
  passphrase: string;
  start: boolean;
}

export interface Node {
  id: number;
  externalId: string;
  role: number;
  username: string;
  alias: string;
  network: string;
  listenAddr: string;
  listenPort: number;
  pubkey: string;
  createdAt: string;
  updatedAt: string;
  status: number;
}

export interface Channel {
  channelId: string;
  fundingTxid?: string;
  fundingTxIndex?: number;
  shortChannelId?: number;
  channelValueSatoshis: number;
  balanceMsat: number;
  unspendablePunishmentEeserve?: number;
  userChannelId: number;
  outboundCapacityMsat: number;
  inboundCapacityMsat: number;
  confirmationsRequired?: number;
  forceCloseSpendDelay?: number;
  isOutbound: boolean;
  isFundingLocked: boolean;
  isUsable: boolean;
  isPublic: boolean;
  counterpartyPubkey: string;
  alias?: string;
}

export interface GetNodesResponse {
  nodes: Node[];
  pagination: PaginationResponse;
}

export interface GetChannelsResponse {
  channels: Channel[];
  pagination: PaginationResponse;
}

export interface Payment {
  id: number;
  paymentHash: string;
  preimage?: string;
  secret?: string;
  status: string;
  origin: string;
  amtMsat?: number;
  createdAt: string;
  updatedAt: string;
  label?: string;
  invoice?: string;
}

export interface GetPaymentsResponse {
  payments: Payment[];
  pagination: PaginationResponse;
}

export interface Peer {
  nodePubkey: string;
}

export interface GetPeersResponse {
  peers: Peer[];
}

export interface PaginationResponse {
  hasMore: boolean;
  total: number;
}

export interface PaginationParams {
  page: number;
  take: number;
}

export interface SearchableParams {
  searchTerm: string;
}

export interface PaymentsFilter {
  origin?: string;
  status?: string;
}

export interface GetPaymentsParams {
  filter?: PaymentsFilter;
  pagination: ListParams;
}

export interface AddressInfo {
  address: string;
}

export interface BalanceInfo {
  balanceSatoshis: number;
}

export interface NodeInfo {
  nodePubkey: string;
  numChannels: number;
  numUsableChannels: number;
  numPeers: number;
  localBalanceMsat: number;
}

export interface Invoice {
  invoice: string;
}

export type ListParams = PaginationParams & SearchableParams;

class SenseiClient {
  basePath: string;
  macaroon?: string;

  constructor({ basePath, macaroon }: SenseiClientConfig) {
    this.basePath = basePath;
    this.macaroon = macaroon;
  }

  setMacaroon(macaroon: string) {
    this.macaroon = macaroon;
  }

  async request(input: RequestInfo, init: RequestInit): Promise<any> {
    if (this.macaroon && this.macaroon !== '') {
      if (!init.headers) {
        init.headers = {};
      }

      init.headers = {
        ...init.headers,
        macaroon: this.macaroon,
      };
    }

    return fetch(input, init)
      .then((res: Response): Promise<any> => {
        if (res.status >= 400) {
          throw new Error('Bad response from server');
        }
        return res.json();
      })
      .catch((err: Error): void => {
        throw err;
      });
  }

  post(url: string, body: Record<any, any>, additionalHeaders: Record<any, any> = {}): Promise<any> {
    return this.request(url, {
      method: 'POST',
      headers: {
        ...additionalHeaders,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  }

  get(url: string): Promise<any> {
    return this.request(url, {
      method: 'GET',
      credentials: 'include',
    });
  }

  async getConfig(): Promise<SenseiConfig> {
    const config = await this.get(`${this.basePath}/v1/config`);
    return {
      electrumUrl: config.electrum_url,
    };
  }

  updateConfig({ electrumUrl }: SenseiConfig): Promise<void> {
    return this.post(`${this.basePath}/v1/config`, {
      electrum_url: electrumUrl,
    });
  }

  getStatus(): Promise<NodeStatus> {
    return this.get(`${this.basePath}/v1/status`);
  }

  async init({ username, alias, passphrase, electrumUrl, start }: InitParams): Promise<InitResponse> {
    const response = await this.post(`${this.basePath}/v1/init`, {
      username,
      alias,
      passphrase,
      electrum_url: electrumUrl,
      start,
    });
    return {
      pubkey: response.pubkey,
      macaroon: response.macaroon,
      externalId: response.external_id,
      role: response.role,
    };
  }

  async login(username: string, passphrase: string): Promise<LoginResponse> {
    return this.post(`${this.basePath}/v1/login`, { username, passphrase });
  }

  async logout(): Promise<void> {
    return this.post(`${this.basePath}/v1/logout`, {});
  }

  async startAdmin(passphrase: string): Promise<NodeAuthInfo> {
    return this.post(`${this.basePath}/v1/start`, { passphrase });
  }

  async stopAdmin(): Promise<void> {
    return this.get(`${this.basePath}/v1/stop`);
  }

  async createNode({ username, alias, passphrase, start }: CreateNodeParams): Promise<NodeAuthInfo> {
    return this.post(`${this.basePath}/v1/nodes`, {
      username,
      alias,
      passphrase,
      start,
    });
  }

  async adminStartNode(pubkey: string, passphrase: string): Promise<NodeAuthInfo> {
    const response = await this.post(`${this.basePath}/v1/nodes/start`, {
      pubkey,
      passphrase,
    });
    return {
      pubkey,
      macaroon: response.macaroon,
    };
  }

  async adminStopNode(pubkey: string): Promise<void> {
    return this.post(`${this.basePath}/v1/nodes/stop`, { pubkey });
  }

  async deleteNode(pubkey: string): Promise<void> {
    return this.post(`${this.basePath}/v1/nodes/delete`, { pubkey });
  }

  async getNodes({ page, searchTerm, take }: ListParams): Promise<GetNodesResponse> {
    const { nodes, pagination } = await this.get(
      `${this.basePath}/v1/nodes?page=${page}&take=${take}&query=${searchTerm}`,
    );

    return {
      nodes: nodes.map((node: any) => {
        return {
          id: node.id,
          externalId: node.external_id,
          role: node.role,
          username: node.username,
          alias: node.alias,
          network: node.network,
          listenAddr: node.listen_addr,
          listenPort: node.listen_port,
          pubkey: node.pubkey,
          createdAt: node.created_at,
          updatedAt: node.updated_at,
          status: node.status,
        };
      }),
      pagination,
    };
  }

  async getChannels({ page, searchTerm, take }: ListParams): Promise<GetChannelsResponse> {
    const { channels, pagination } = await this.get(
      `${this.basePath}/v1/node/channels?page=${page}&take=${take}&query=${searchTerm}`,
    );

    return {
      channels: channels.map((channel: any) => {
        return {
          channelId: channel.channel_id,
          fundingTxid: channel.funding_txid,
          fundingTxIndex: channel.funding_tx_index,
          shortChannelId: channel.short_channel_id,
          channelValueSatoshis: channel.channel_value_satoshis,
          balanceMsat: channel.balance_msat,
          unspendablePunishmentReserve: channel.unspendable_punishment_reserve,
          userChannelId: channel.user_channel_id,
          outboundCapacityMsat: channel.outbound_capacity_msat,
          inboundCapacityMsat: channel.inbound_capacity_msat,
          confirmationsRequired: channel.confirmations_required,
          forceCloseSpendDelay: channel.force_close_spend_delay,
          isOutbound: channel.is_outbound,
          isFundingLocked: channel.is_funding_locked,
          isUsable: channel.is_usable,
          isPublic: channel.is_public,
          counterpartyPubkey: channel.counterparty_pubkey,
          alias: channel.channel.alias,
        };
      }),
      pagination,
    };
  }

  async getPayments({ filter = {}, pagination }: GetPaymentsParams): Promise<GetPaymentsResponse> {
    const { page, take, searchTerm } = pagination;
    const origin = filter.origin || '';
    const status = filter.status || '';

    const response = await this.get(
      `${this.basePath}/v1/node/payments?page=${page}&take=${take}&query=${searchTerm}&origin=${origin}&status=${status}`,
    );

    return {
      pagination: response.pagination,
      payments: response.payments.map((payment: any) => {
        return {
          id: payment.id,
          paymentHash: payment.payment_hash,
          preimage: payment.preimage,
          secret: payment.secret,
          status: payment.status,
          origin: payment.origin,
          amtMsat: payment.amt_msat,
          createdAt: payment.created_at,
          updatedAt: payment.updated_at,
          label: payment.label,
          invoice: payment.invoice,
        };
      }),
    };
  }

  async getPeers(): Promise<GetPeersResponse> {
    const { peers } = await this.get(`${this.basePath}/v1/node/peers`);

    return {
      peers: peers.map((peer: any) => {
        return {
          nodePubkey: peer.node_pubkey,
        };
      }),
    };
  }

  async getUnusedAddress(): Promise<AddressInfo> {
    const response = await this.get(`${this.basePath}/v1/node/wallet/address`);
    return {
      address: response.address,
    };
  }

  async getBalance(): Promise<BalanceInfo> {
    const response = await this.get(`${this.basePath}/v1/node/wallet/balance`);
    return {
      balanceSatoshis: response.balance_satoshis,
    };
  }

  async startNode(passphrase: string): Promise<void> {
    return this.post(`${this.basePath}/v1/node/start`, { passphrase });
  }

  async stopNode(): Promise<void> {
    return this.get(`${this.basePath}/v1/node/stop`);
  }

  async getInfo(): Promise<NodeInfo> {
    const { node_info } = await this.get(`${this.basePath}/v1/node/info`);

    return {
      nodePubkey: node_info.node_pubkey,
      numChannels: node_info.num_channels,
      numUsableChannels: node_info.num_usable_channels,
      numPeers: node_info.num_peers,
      localBalanceMsat: node_info.local_balance_msat,
    };
  }

  async createInvoice(amountMillisats: number, description: string): Promise<Invoice> {
    const response = await this.post(`${this.basePath}/v1/node/invoices`, {
      amt_msat: amountMillisats,
      description,
    });

    return {
      invoice: response.invoice,
    };
  }

  async labelPayment(label: string, paymentHash: string): Promise<void> {
    return this.post(`${this.basePath}/v1/node/payments/label`, {
      label,
      payment_hash: paymentHash,
    });
  }

  async deletePayment(paymentHash: string): Promise<void> {
    return this.post(`${this.basePath}/v1/node/payments/delete`, {
      payment_hash: paymentHash,
    });
  }

  async payInvoice(invoice: string): Promise<void> {
    return this.post(`${this.basePath}/v1/node/invoices/pay`, { invoice });
  }

  async openChannel(nodeConnectionString: string, amtSatoshis: number, isPublic: boolean): Promise<void> {
    return this.post(`${this.basePath}/v1/node/channels/open`, {
      node_connection_string: nodeConnectionString,
      amt_satoshis: amtSatoshis,
      public: isPublic,
    });
  }

  async closeChannel(channelId: string, force: boolean): Promise<void> {
    return this.post(`${this.basePath}/v1/node/channels/close`, {
      channel_id: channelId,
      force,
    });
  }

  async keysend(destPubkey: string, amtMsat: number): Promise<void> {
    return this.post(`${this.basePath}/v1/node/keysend`, {
      dest_pubkey: destPubkey,
      amt_msat: amtMsat,
    });
  }

  async connectPeer(nodeConnectionString: string): Promise<void> {
    return this.post(`${this.basePath}/v1/node/peers/connect`, {
      node_connection_string: nodeConnectionString,
    });
  }

  async signMessage(message: string): Promise<string> {
    const response = await this.post(`${this.basePath}/v1/node/sign/message`, {
      message,
    });
    return response.signature;
  }
}

export default SenseiClient;
