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
}
