import { Injectable } from '@nestjs/common';
import { AIProvider } from './interfaces/ai-provider.interface';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';

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
}
