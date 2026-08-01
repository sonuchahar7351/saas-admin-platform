export interface AIProvider {
  generateSummary(prompt: string): Promise<string>;
}
