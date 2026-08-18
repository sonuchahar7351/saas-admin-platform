import { Injectable } from '@nestjs/common';
import { AIProvider } from './interfaces/ai-provider.interface';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';

const PLATFORM_FACTS = `
Platform name: GiveForward
What it does: A crowdfunding platform connecting donors with verified NGO campaigns.
Key facts:
- Donations can be made as a guest (no account required) or logged in.
- Donors can donate on behalf of someone else — their name appears as the donor, not the account holder's.
- Recurring donations are supported (weekly, monthly, quarterly) via secure bank/UPI authorization.
- 80G tax exemption certificates can be applied for after any successful donation, from the Thank You page or donation history. Requires PAN, name, email, address. Reviewed by the platform, certificate emailed once approved.
- Receipts are generated automatically after successful payment and downloadable as PDF.
- Payments are processed securely via Razorpay; card details are never stored by the platform.
`.trim();

const FAQ_CONTENT = `
Q: How can I donate? A: Browse a campaign and click "Donate now" — choose a preset or custom amount, then complete payment.
Q: Do I need an account? A: No, guest donation is supported.
Q: Is my payment secure? A: Yes, processed via Razorpay, a PCI-DSS compliant gateway.
Q: Can I donate on behalf of someone else? A: Yes, enter their details as the donor during checkout.
Q: Where can I see my donations? A: In your Profile's Donation History.
Q: Will I get a receipt? A: Yes, automatically after a successful donation, downloadable as PDF.
Q: Can I donate to multiple campaigns? A: Yes, no limit.
`.trim();

@Injectable()
export class AiService {
  private provider: AIProvider;

  constructor(
    private openAIProvider: OpenAIProvider,
    private geminiProvider: GeminiProvider,
  ) {
    const selected = process.env.AI_PROVIDER || 'gemini';
    this.provider =
      selected === 'openai' ? this.openAIProvider : this.geminiProvider;
  }

  // generic entry point — reused by audit summaries, campaign stories, and every future AI feature
  generateText(prompt: string): Promise<string> {
    return this.provider.generateSummary(prompt);
  }

  async generateAuditSummary(logs: any[]): Promise<string> {
    const prompt = `Summarize the following admin panel activity logs in 3-4 concise sentences, highlighting any unusual patterns (e.g., many deletes, repeated actions by one user):\n\n${JSON.stringify(logs, null, 2)}`;
    return this.provider.generateSummary(prompt);
  }

  async generateCampaignStory(input: {
    title: string;
    categoryName: string;
    goalAmount: number;
    description: string;
  }): Promise<string> {
    const prompt = `Write an emotionally compelling fundraising campaign story for a crowdfunding platform.

      Campaign title: ${input.title}
      Category: ${input.categoryName}
      Goal amount: ₹${input.goalAmount}
      Short description: ${input.description}

      Requirements:
        - 4 to 5 short paragraphs, separated by blank lines
        - Warm, human, and sincere tone — never exaggerated or manipulative
        - Explain the need, who it helps, and the impact a donation makes
        - End with a gentle call to action
        - Plain text only, no markdown formatting, no headings`;

    return this.generateText(prompt);
  }

  async generateProduct(input: {
    campaignTitle: string;
    categoryName: string;
  }): Promise<{
    title: string;
    description: string;
    amount: number;
    priority: number;
    suggestedImagePrompt: string;
  }> {
    const prompt = `Suggest a donation product/reward tier for a crowdfunding campaign.

Campaign: ${input.campaignTitle}
Category: ${input.categoryName}

Respond ONLY with valid JSON, no markdown, no explanation, in this exact shape:
{"title": "...", "description": "...", "amount": 500, "priority": 1, "suggestedImagePrompt": "..."}

- title: short, specific product/reward name
- description: one or two sentences
- amount: a reasonable rupee value as an integer
- priority: an integer 1-10 for display ordering
- suggestedImagePrompt: a short visual description someone could use to generate or source an image for this`;

    const raw = await this.generateText(prompt);
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      throw new Error('AI returned an unexpected format. Try again.');
    }
  }

  async generateUpdate(input: {
    campaignTitle: string;
    context: string;
  }): Promise<string> {
    const prompt = `Write a short campaign progress update for a crowdfunding platform.

Campaign: ${input.campaignTitle}
What happened: ${input.context}

Requirements:
- 2 to 3 short paragraphs, separated by blank lines
- Warm, appreciative tone toward donors
- Clear about what progress was made
- Plain text only, no markdown`;
    return this.generateText(prompt);
  }

  async explainFraudFlag(input: {
    ruleCode: string;
    details: any;
    donorEmail: string;
    amount: number;
  }): Promise<string> {
    const prompt = `You are helping a nonprofit admin understand a fraud-detection flag on a donation. Explain in 2-3 plain sentences what likely happened and whether it looks like a real concern or a probable false positive. Be measured, not alarmist — many flags are innocent.

Rule triggered: ${input.ruleCode}
Details: ${JSON.stringify(input.details)}
Donor email: ${input.donorEmail}
Amount: ₹${(input.amount / 100).toFixed(2)}`;

    return this.generateText(prompt);
  }

  async chatSupport(
    history: { role: 'user' | 'assistant'; content: string }[],
    message: string,
    campaignContext?: {
      title: string;
      shortDescription: string;
      ngoName: string;
    },
  ): Promise<string> {
    const campaignBlock = campaignContext
      ? `\nThe visitor is currently viewing this campaign:\nTitle: ${campaignContext.title}\nNGO: ${campaignContext.ngoName}\nDescription: ${campaignContext.shortDescription}`
      : '';

    const systemPrompt = `You are a helpful, warm support assistant for a crowdfunding donation platform called GiveForward.

${PLATFORM_FACTS}

Frequently asked questions you can draw on:
${FAQ_CONTENT}
${campaignBlock}

Rules you must always follow:
- Never ask for or discuss card numbers, CVV, OTPs, or any payment credentials.
- Never give medical, legal, or tax advice beyond pointing to the 80G certificate feature generically — for specifics, tell them to consult a tax professional.
- You cannot look up a specific person's account, donation history, or payment status — if asked, direct them to log in and check their Profile, or contact human support.
- If you don't know something, say so plainly rather than guessing.
- Keep responses concise — 2-4 sentences unless the question genuinely needs more.
- Be warm but not saccharine; this is about real causes and real people.`;

    const conversationText = history
      .map(
        (h) => `${h.role === 'user' ? 'Visitor' : 'Assistant'}: ${h.content}`,
      )
      .join('\n');
    const prompt = `${systemPrompt}\n\nConversation so far:\n${conversationText}\n\nVisitor: ${message}\n\nAssistant:`;

    return this.generateText(prompt);
  }
}
