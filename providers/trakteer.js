/**
 * Trakteer Webhook Provider
 * 
 * Handles incoming webhook from Trakteer and normalizes
 * the payload to StreamGuard's standard donation format.
 * 
 * Trakteer webhook docs: https://help.trakteer.id/help-center/articles/70/panduan-webhook
 */

class TrakteerProvider {
  constructor() {
    this.name = "trakteer";
  }

  /**
   * Parse Trakteer webhook payload into standard donation format
   */
  parseDonation(body) {
    return {
      provider: "trakteer",
      id: body.transaction_id || `trakteer-${Date.now()}`,
      donator: body.supporter_name || "Anonymous",
      amount: body.price || 0,
      amountDisplay: body.price || 0,
      message: body.supporter_message || "",
      rawData: body,
      receivedAt: new Date(),
    };
  }
}

module.exports = TrakteerProvider;