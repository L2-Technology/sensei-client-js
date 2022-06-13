class SenseiClient {
  constructor({ basePath, macaroon, token }) {
    this.basePath = basePath;
    this.macaroon = macaroon;
    this.token = token;
  }

  setMacaroon(macaroon) {
    this.macaroon = macaroon;
  }

  setToken(token) {
    this.token = token;
  }

  async request(input, init) {
    if (!init.headers) {
      init.headers = {};
    }

    if (this.macaroon && this.macaroon !== '') {
      init.headers = {
        ...init.headers,
        macaroon: this.macaroon,
      };
    }

    if (this.token && this.token !== '') {
      init.headers = {
        ...init.headers,
        token: this.token,
      };
    }

    return fetch(input, init)
      .then((res) => {
        if (res.status >= 400) {
          throw new Error('Bad response from server');
        }
        return res.json();
      })
      .catch((err) => {
        throw err;
      });
  }

  post(url, body, additionalHeaders = {}) {
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

  delete(url, body, additionalHeaders = {}) {
    return this.request(url, {
      method: 'DELETE',
      headers: {
        ...additionalHeaders,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  }

  get(url) {
    return this.request(url, {
      method: 'GET',
      credentials: 'include',
    });
  }

  getStatus() {
    return this.get(`${this.basePath}/v1/status`);
  }

  async init({ username, alias, passphrase, start }) {
    const response = await this.post(`${this.basePath}/v1/init`, {
      username,
      alias,
      passphrase,
      start,
    });
    return {
      pubkey: response.pubkey,
      macaroon: response.macaroon,
      id: response.id,
      role: response.role,
      token: response.token,
    };
  }

  async login(username, passphrase) {
    return this.post(`${this.basePath}/v1/login`, { username, passphrase });
  }

  async logout() {
    return this.post(`${this.basePath}/v1/logout`, {});
  }

  async startAdmin(passphrase) {
    return this.post(`${this.basePath}/v1/start`, { passphrase });
  }

  async stopAdmin() {
    return this.get(`${this.basePath}/v1/stop`);
  }

  async createAccessToken({ name, scope, singleUse, expiresAt }) {
    const { token } = await this.post(`${this.basePath}/v1/tokens`, {
      name,
      scope,
      single_use: singleUse,
      expires_at: expiresAt,
    });

    return token;
  }

  async getAccessTokens({ page, searchTerm, take }) {
    const { tokens, pagination } = await this.get(
      `${this.basePath}/v1/tokens?page=${page}&take=${take}&query=${searchTerm}`,
    );

    return {
      tokens: tokens.map((token) => {
        return {
          id: token.id,
          token: token.token,
          createdAt: token.created_at,
          updatedAt: token.updated_at,
          expiresAt: token.expires_at,
          singleUse: token.single_use,
          scope: token.scope,
          name: token.name,
        };
      }),
      pagination: {
        ...pagination,
        hasMore: pagination.has_more,
      },
    };
  }

  async deleteAccessToken(id) {
    return this.delete(`${this.basePath}/v1/tokens`, { id });
  }

  async batchCreateNode(nodes) {
    let response = await this.post(`${this.basePath}/v1/nodes/batch`, {
      nodes,
    });

    return response.nodes;
  }

  async createNode({ username, alias, passphrase, start }) {
    let response = await this.post(`${this.basePath}/v1/nodes`, {
      username,
      alias,
      passphrase,
      start,
    });

    return {
      id: response.id,
      pubkey: response.pubkey,
      macaroon: response.macaroon,
      listenAddress: response.listen_address,
      listenPort: response.listen_port,
    };
  }

  async adminStartNode(pubkey, passphrase) {
    const response = await this.post(`${this.basePath}/v1/nodes/start`, {
      pubkey,
      passphrase,
    });
    return {
      pubkey,
      macaroon: response.macaroon,
    };
  }

  async adminStopNode(pubkey) {
    return this.post(`${this.basePath}/v1/nodes/stop`, { pubkey });
  }

  async deleteNode(pubkey) {
    return this.post(`${this.basePath}/v1/nodes/delete`, { pubkey });
  }

  async getNodes({ page, searchTerm, take }) {
    const { nodes, pagination } = await this.get(
      `${this.basePath}/v1/nodes?page=${page}&take=${take}&query=${searchTerm}`,
    );

    return {
      nodes: nodes.map((node) => {
        return {
          id: node.id,
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
      pagination: {
        ...pagination,
        hasMore: pagination.has_more,
      },
    };
  }

  async getChannels({ page, searchTerm, take }) {
    const { channels, pagination } = await this.get(
      `${this.basePath}/v1/node/channels?page=${page}&take=${take}&query=${searchTerm}`,
    );

    return {
      channels: channels.map((channel) => {
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
          isChannelReady: channel.is_channel_ready,
          isUsable: channel.is_usable,
          isPublic: channel.is_public,
          counterpartyPubkey: channel.counterparty_pubkey,
          alias: channel.alias,
        };
      }),
      pagination: {
        ...pagination,
        hasMore: pagination.has_more,
      },
    };
  }

  async getTransactions({ page, searchTerm, take }) {
    const { transactions, pagination } = await this.get(
      `${this.basePath}/v1/node/transactions?page=${page}&take=${take}&query=${searchTerm}`,
    );

    return {
      transactions: transactions.map((transaction) => {
        return {
          txid: transaction.txid,
          sent: transaction.sent,
          received: transaction.received,
          fee: transaction.fee,
          confirmationTime: transaction.confirmation_time,
        };
      }),
      pagination: {
        ...pagination,
        hasMore: pagination.has_more,
      },
    };
  }

  async getPayments({ filter = {}, pagination }) {
    const { page, take, searchTerm } = pagination;
    const origin = filter.origin || '';
    const status = filter.status || '';

    const response = await this.get(
      `${this.basePath}/v1/node/payments?page=${page}&take=${take}&query=${searchTerm}&origin=${origin}&status=${status}`,
    );

    return {
      pagination: response.pagination,
      payments: response.payments.map((payment) => {
        return {
          id: payment.id,
          paymentHash: payment.payment_hash,
          preimage: payment.preimage,
          secret: payment.secret,
          status: payment.status,
          origin: payment.origin,
          amtMsat: payment.amt_msat,
          feePaidMsat: payment.fee_paid_msat,
          createdAt: payment.created_at,
          updatedAt: payment.updated_at,
          label: payment.label,
          invoice: payment.invoice,
        };
      }),
    };
  }

  async getPeers() {
    const { peers } = await this.get(`${this.basePath}/v1/node/peers`);

    return {
      peers: peers.map((peer) => {
        return {
          nodePubkey: peer.node_pubkey,
        };
      }),
    };
  }

  async getUnusedAddress() {
    const response = await this.get(`${this.basePath}/v1/node/wallet/address`);
    return {
      address: response.address,
    };
  }

  async getBalance() {
    const response = await this.get(`${this.basePath}/v1/node/wallet/balance`);
    return {
      onchainBalanceSats: response.onchain_balance_sats,
      channelBalanceMsats: response.channel_balance_msats,
      channelOutboundCapacityMsats: response.channel_outbound_capacity_msats,
      channelInboundCapacityMsats: response.channel_inbound_capacity_msats,
      usableChannelOutboundCapacityMsats: response.usable_channel_outbound_capacity_msats,
      usableChannelInboundCapacityMsats: response.usable_channel_inbound_capacity_msats,
    };
  }

  async startNode(passphrase) {
    return this.post(`${this.basePath}/v1/node/start`, { passphrase });
  }

  async stopNode() {
    return this.get(`${this.basePath}/v1/node/stop`);
  }

  async getInfo() {
    const { node_info } = await this.get(`${this.basePath}/v1/node/info`);

    return {
      version: node_info.version,
      nodePubkey: node_info.node_pubkey,
      numChannels: node_info.num_channels,
      numUsableChannels: node_info.num_usable_channels,
      numPeers: node_info.num_peers,
      localBalanceMsat: node_info.local_balance_msat,
    };
  }

  async createInvoice(amountMillisats, description) {
    const response = await this.post(`${this.basePath}/v1/node/invoices`, {
      amt_msat: amountMillisats,
      description,
    });

    return {
      invoice: response.invoice,
    };
  }

  async labelPayment(label, paymentHash) {
    return this.post(`${this.basePath}/v1/node/payments/label`, {
      label,
      payment_hash: paymentHash,
    });
  }

  async deletePayment(paymentHash) {
    return this.post(`${this.basePath}/v1/node/payments/delete`, {
      payment_hash: paymentHash,
    });
  }

  async payInvoice(invoice) {
    return this.post(`${this.basePath}/v1/node/invoices/pay`, { invoice });
  }

  async openChannel(openChannelRequest) {
    const response = await this.openChannels([openChannelRequest]);
    const result = response.results[0];
    return {
      error: result.error,
      errorMessage: result.error_message,
      tempChannelId: result.temp_channel_id,
    };
  }

  async openChannels(requests) {
    const response = await this.post(`${this.basePath}/v1/node/channels/open`, {
      requests: requests.map((channel) => {
        return {
          counterparty_pubkey: channel.counterpartyPubkey,
          public: channel.public,
          amount_sats: channel.amountSats,
          custom_id: channel.customId,
          counterparty_host_port: channel.counterpartyHostPort,
          push_amount_msats: channel.pushAmountMsats,
          forwarding_fee_proportional_millionths: channel.forwardingFeeProportionalMillionths,
          forwarding_fee_base_msat: channel.forwardingFeeBaseMsat,
          cltv_expiry_delta: channel.cltvExpiryDelta,
          max_dust_htlc_exposure_msat: channel.maxDustHtlcExposureMsat,
          force_close_avoidance_max_fee_sats: channel.forceCloseAvoidanceMaxFeeSats,
        };
      }),
    });

    return {
      requests: response.requests.map((request) => {
        return {
          counterpartyPubkey: request.counterparty_pubkey,
          public: request.public,
          amountSats: request.amount_sats,
          counterpartyHostPort: request.counterparty_host_port,
          customId: request.custom_id,
          pushAmountMsats: request.push_amount_msats,
          forwardingFeeProportionalMillionths: request.forwarding_fee_proportional_millionths,
          forwardingFeeBaseMsat: request.forwarding_fee_base_msat,
          cltvExpiryDelta: request.cltv_expiry_delta,
          maxDustHtlcExposureMsat: request.max_dust_htlc_exposure_msat,
          forceCloseAvoidanceMaxFeeSats: request.force_close_avoidance_max_fee_sats,
        };
      }),
      results: response.results.map((result) => {
        return {
          error: result.error,
          errorMessage: result.error_message,
          tempChannelId: result.temp_channel_id,
        };
      }),
    };
  }

  async closeChannel(channelId, force) {
    return this.post(`${this.basePath}/v1/node/channels/close`, {
      channel_id: channelId,
      force,
    });
  }

  async keysend(destPubkey, amtMsat) {
    return this.post(`${this.basePath}/v1/node/keysend`, {
      dest_pubkey: destPubkey,
      amt_msat: amtMsat,
    });
  }

  async connectPeer(nodeConnectionString) {
    return this.post(`${this.basePath}/v1/node/peers/connect`, {
      node_connection_string: nodeConnectionString,
    });
  }

  async signMessage(message) {
    const response = await this.post(`${this.basePath}/v1/node/sign/message`, {
      message,
    });
    return response.signature;
  }

  async verifyMessage(message, signature) {
    return this.post(`${this.basePath}/v1/node/verify/message`, {
      message,
      signature,
    });
  }
}

module.exports = SenseiClient;
