import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async generateSummary(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: 'gemini-3-flash-preview',
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
