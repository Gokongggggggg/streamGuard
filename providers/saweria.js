/**
 * Saweria Provider
 * 
 * Handles incoming webhook requests from Saweria and normalizes
 * the donation data into a standard format.
 * 
 * This abstraction allows adding new providers (Trakteer, Sociabuzz, etc.)
 * later without changing the core server logic.
 * 
 * Standard donation format:
 * {
 *   provider: "saweria",
 *   id: string,
 *   donator: string,
 *   amount: number,
 *   message: string,
 *   rawData: object,
 *   receivedAt: Date
 * }
 */

const crypto = require("crypto");

class SaweriaProvider {
  constructor(streamKey) {
    this.streamKey = streamKey;
    this.name = "saweria";
  }

  /**
   * Verify that the webhook request is actually from Saweria
   * Saweria signs requests with HMAC-SHA256 using your stream key
   */
  verifySignature(body, signature) {
    if (!signature) return false;
    const computed = crypto
      .createHmac("sha256", this.streamKey)
      .update(JSON.stringify(body))
      .digest("hex");
    return computed === signature;
  }

  /**
   * Parse Saweria webhook payload into standard donation format
   * 
   * Saweria webhook payload looks like:
   * {
   *   version: "2022.01",
   *   created_at: "2021-01-01T12:00:00+00:00",
   *   id: "00000000-0000-0000-0000-000000000000",
   *   type: "donation",
   *   amount_raw: 69420,
   *   cut: 3471,
   *   donator_name: "Someguy",
   *   donator_email: "someguy@example.com",
   *   message: "THIS IS A FAKE MESSAGE!",
   *   etc: { amount_to_display: 69420 }
   * }
   */
  parseDonation(body) {
    return {
      provider: this.name,
      id: body.id || "unknown",
      donator: body.donator_name || "Anonymous",
      amount: body.amount_raw || 0,
      amountDisplay: body.etc?.amount_to_display || body.amount_raw || 0,
      message: body.message || "",
      rawData: body,
      receivedAt: new Date(),
    };
  }

  /**
   * Express middleware for handling Saweria webhook
   */
  createWebhookHandler(onDonation) {
    return (req, res) => {
      const signature = req.headers["saweria-callback-signature"];

      // Verify signature (skip in dev if needed)
      if (this.streamKey && signature) {
        if (!this.verifySignature(req.body, signature)) {
          console.log("[Saweria] Invalid webhook signature — rejected");
          return res.status(401).json({ error: "Invalid signature" });
        }
      }

      // Parse the donation
      const donation = this.parseDonation(req.body);
      console.log(`[Saweria] Donation received: ${donation.donator} - Rp${donation.amountDisplay} - "${donation.message}"`);

      // Pass to callback
      onDonation(donation);

      // Always respond 200 so Saweria knows we received it
      res.status(200).json({ status: "received" });
    };
  }
}

module.exports = SaweriaProvider;
