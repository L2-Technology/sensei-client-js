export interface SenseiClientConfig {
  basePath: string;
  macaroon?: string;
  token?: string;
}
export interface NodeStatus {
  version: string;
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
  start: boolean;
}
export interface InitResponse {
  id: string;
  pubkey: string;
  macaroon: string;
  token: string;
  role: number;
}
export interface LoginResponse {
  pubkey: string;
  macaroon: string;
  token: string;
  alias: string;
  role: number;
}
export interface NodeAuthInfo {
  pubkey: string;
  macaroon: string;
}

export interface CreateNodeResponse {
  id: string;
  pubkey: string;
  macaroon: string;
  listenAddress: string;
  listenPort: number;
}

export interface OpenChannelRequest {
  counterpartyPubkey: string;
  public: boolean;
  amountSats: number;
  counterpartyHostPort?: string;
  customId?: number;
  pushAmountMsats?: number;
  forwardingFeeProportionalMillionths?: number;
  forwardingFeeBaseMsat?: number;
  cltvExpiryDelta?: number;
  maxDustHtlcExposureMsat?: number;
  forceCloseAvoidanceMaxFeeSats?: number;
}

export interface OpenChannelResult {
  error: boolean;
  errorMessage?: string;
  tempChannelId?: string;
}

export interface OpenChannelsResponse {
  requests: OpenChannelRequest[];
  results: OpenChannelResult[];
}

export interface OpenChannelResponse {
  tempChannelId: string;
}
export interface CreateAccessTokenParams {
  name: string;
  scope: string;
  expiresAt: number;
  singleUse: boolean;
}
export interface AccessToken {
  id: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  singleUse: boolean;
  name: string;
  token: string;
  scope: string;
}

export interface CreateNodeParams {
  username: string;
  alias: string;
  passphrase: string;
  start: boolean;
}
export interface Node {
  id: string;
  role: number;
  username: string;
  alias: string;
  network: string;
  listenAddr: string;
  listenPort: number;
  pubkey: string;
  createdAt: number;
  updatedAt: number;
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
  isChannelReady: boolean;
  isUsable: boolean;
  isPublic: boolean;
  counterpartyPubkey: string;
  alias?: string;
}
export interface BlockTime {
  height: number;
  timestamp: number;
}
export interface TransactionDetails {
  txid: string;
  received: number;
  sent: number;
  fee?: number;
  confirmationTime?: BlockTime;
}
export interface GetNodesResponse {
  nodes: Node[];
  pagination: PaginationResponse;
}
export interface GetAccessTokensResponse {
  tokens: AccessToken[];
  pagination: PaginationResponse;
}
export interface GetChannelsResponse {
  channels: Channel[];
  pagination: PaginationResponse;
}
export interface GetTransactionsResponse {
  transactions: TransactionDetails[];
  pagination: PaginationResponse;
}
export interface Payment {
  id: string;
  paymentHash: string;
  preimage?: string;
  secret?: string;
  status: string;
  origin: string;
  amtMsat?: number;
  feePaidMsat?: number;
  createdAt: number;
  updatedAt: number;
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
  onchainBalanceSats: number;
  channelBalanceMsats: number;
  channelOutboundCapacityMsats: number;
  channelInboundCapacityMsats: number;
  usableChannelOutboundCapacityMsats: number;
  usableChannelInboundCapacityMsats: number;
}
export interface NodeInfo {
  version: string;
  nodePubkey: string;
  numChannels: number;
  numUsableChannels: number;
  numPeers: number;
  localBalanceMsat: number;
}
export interface Invoice {
  invoice: string;
}
export interface VerifyMessageResponse {
  valid: boolean;
  pubkey: string;
}

export interface NetworkGraphInfo {
  numChannels: number;
  numNodes: number;
  numKnownEdgePolicies: number;
}

export declare type ListParams = PaginationParams & SearchableParams;

declare class SenseiClient {
  basePath: string;
  macaroon?: string;
  token?: string;
  constructor({ basePath, macaroon, token }: SenseiClientConfig);
  setMacaroon(macaroon: string): void;
  setToken(token: string): void;
  request(input: RequestInfo, init: RequestInit): Promise<any>;
  post(url: string, body: Record<any, any>, additionalHeaders?: Record<any, any>): Promise<any>;
  delete(url: string, body: Record<any, any>, additionalHeaders?: Record<any, any>): Promise<any>;
  get(url: string): Promise<any>;
  getStatus(): Promise<NodeStatus>;
  init({ username, alias, passphrase, start }: InitParams): Promise<InitResponse>;
  login(username: string, passphrase: string): Promise<LoginResponse>;
  logout(): Promise<void>;
  startAdmin(passphrase: string): Promise<NodeAuthInfo>;
  stopAdmin(): Promise<void>;
  createAccessToken({ name, scope, singleUse, expiresAt }: CreateAccessTokenParams): Promise<AccessToken>;
  getAccessTokens({ page, searchTerm, take }: ListParams): Promise<GetAccessTokensResponse>;
  deleteAccessToken(id: number): Promise<void>;
  createNode({ username, alias, passphrase, start }: CreateNodeParams): Promise<CreateNodeResponse>;
  batchCreateNode(nodes: CreateNodeParams[]): Promise<CreateNodeResponse[]>;
  adminStartNode(pubkey: string, passphrase: string): Promise<NodeAuthInfo>;
  adminStopNode(pubkey: string): Promise<void>;
  deleteNode(pubkey: string): Promise<void>;
  getNodes({ page, searchTerm, take }: ListParams): Promise<GetNodesResponse>;
  getChannels({ page, searchTerm, take }: ListParams): Promise<GetChannelsResponse>;
  getTransactions({ page, searchTerm, take }: ListParams): Promise<GetTransactionsResponse>;
  getPayments({ filter, pagination }: GetPaymentsParams): Promise<GetPaymentsResponse>;
  getPeers(): Promise<GetPeersResponse>;
  getUnusedAddress(): Promise<AddressInfo>;
  getBalance(): Promise<BalanceInfo>;
  startNode(passphrase: string): Promise<void>;
  stopNode(): Promise<void>;
  getInfo(): Promise<NodeInfo>;
  createInvoice(amountMillisats: number, description: string): Promise<Invoice>;
  labelPayment(label: string, paymentHash: string): Promise<void>;
  deletePayment(paymentHash: string): Promise<void>;
  payInvoice(invoice: string): Promise<void>;
  openChannel(channel: OpenChannelRequest): Promise<OpenChannelResult>;
  openChannels(channels: OpenChannelRequest[]): Promise<OpenChannelsResponse>;
  closeChannel(channelId: string, force: boolean): Promise<void>;
  keysend(destPubkey: string, amtMsat: number): Promise<void>;
  connectPeer(nodeConnectionString: string): Promise<void>;
  signMessage(message: string): Promise<string>;
  verifyMessage(message: string, signature: string): Promise<VerifyMessageResponse>;
  networkGraphInfo(): Promise<NetworkGraphInfo>;
}
export default SenseiClient;
