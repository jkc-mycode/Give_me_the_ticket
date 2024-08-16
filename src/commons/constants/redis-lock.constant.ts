export const REDIS_LOCK = {
  TICKET: 'ticketLockKey',
  CREATE_TRADE: 'tradeCreateLockKey',
  PURCHASE_TRADE: 'tradePurchaseLockKey',
  DURATION: 1000,
  RETRY_COUNT: 10,
  RETRY_DELAY: 200,
  RETRY_JITTER: 200,
};
