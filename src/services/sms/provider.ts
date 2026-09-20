/**
 * BcaFly SMS Provider Abstraction
 * Supports swappable providers: MockSmsProvider (demo/safe) and TwilioSmsProvider (production)
 */

export interface SmsProvider {
  send(phone: string, message: string): Promise<{ providerMessageId: string }>;
}

export class MockSmsProvider implements SmsProvider {
  async send(phone: string, message: string): Promise<{ providerMessageId: string }> {
    // Simulate lightweight network roundtrip
    await new Promise((resolve) => setTimeout(resolve, 250));
    const providerMessageId = `mock_sms_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    console.log(`%c[MOCK SMS DISPATCH]%c To: ${phone} | ID: ${providerMessageId}\nMessage: ${message}`, 'background: #4f46e5; color: white; padding: 2px 5px; border-radius: 4px;', 'color: #334155;');
    return { providerMessageId };
  }
}

export class TwilioSmsProvider implements SmsProvider {
  private accountSid?: string;
  private authToken?: string;
  private senderPhone?: string;

  constructor(accountSid?: string, authToken?: string, senderPhone?: string) {
    this.accountSid = accountSid || (typeof process !== 'undefined' ? process.env?.TWILIO_ACCOUNT_SID : undefined);
    this.authToken = authToken || (typeof process !== 'undefined' ? process.env?.TWILIO_AUTH_TOKEN : undefined);
    this.senderPhone = senderPhone || (typeof process !== 'undefined' ? process.env?.TWILIO_SENDER_PHONE : undefined);
  }

  async send(phone: string, message: string): Promise<{ providerMessageId: string }> {
    // In production, this issues an authenticated POST to Twilio Messages API
    if (!this.accountSid || !this.authToken) {
      console.warn('[TwilioSmsProvider] Twilio credentials not configured in environment. Falling back to simulated delivery.');
      return { providerMessageId: `twilio_sim_${Date.now()}` };
    }

    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      const body = new URLSearchParams({
        To: phone,
        From: this.senderPhone || 'BCAFLY',
        Body: message
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Twilio dispatch failed');
      }

      const data = await response.json();
      return { providerMessageId: data.sid };
    } catch (err: any) {
      console.error('[TwilioSmsProvider Error]', err);
      throw err;
    }
  }
}

export function getSmsProvider(providerType: 'mock' | 'twilio' = 'mock'): SmsProvider {
  if (providerType === 'twilio') {
    return new TwilioSmsProvider();
  }
  return new MockSmsProvider();
}
