import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class ImageGenerationService {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // async generateImage(prompt: string): Promise<Buffer> {
  //   // Keep prompts subject-focused and safe by construction — never pass raw user text
  //   // straight through without framing, since this is a public-content-generation path
  //   const safePrompt = `A professional, warm, photorealistic image suitable for a charitable crowdfunding campaign. ${prompt}. No text, no watermarks, no logos.`;

  //   const response = await this.client.models.generateContent({
  //     model: 'gemini-2.5-flash-image',
  //     contents: safePrompt,
  //     config: {
  //       responseModalities: ['IMAGE', 'TEXT'],
  //     },
  //   });

  //   const part = response.candidates?.[0]?.content?.parts?.find(
  //     (p) => p.inlineData,
  //   );

  //   if (!part?.inlineData?.data) {
  //     throw new Error('No image returned from Gemini');
  //   }

  //   return Buffer.from(part.inlineData.data, 'base64');
  // }

  // Replace your Gemini service method with a direct fetch:

  async generateImage(prompt: string): Promise<Buffer> {
    const safePrompt = encodeURIComponent(
      `A professional, warm, photorealistic image suitable for a charitable crowdfunding campaign. ${prompt}. No text, no watermarks, no logos.`,
    );

    const url = `https://image.pollinations.ai/prompt/${safePrompt}?width=1024&height=1024&model=flux&nologo=true`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Image fetch failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
