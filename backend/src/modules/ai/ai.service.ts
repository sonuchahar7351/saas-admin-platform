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

  async generateAuditSummary(logs: any[]): Promise<string> {
    const prompt = `Summarize the following admin panel activity logs in 3-4 concise sentences, highlighting any unusual patterns (e.g., many deletes, repeated actions by one user):\n\n${JSON.stringify(logs, null, 2)}`;
    return this.provider.generateSummary(prompt);
  }
}
