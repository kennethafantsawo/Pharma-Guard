
'use server';

/**
 * @fileOverview Server actions for the Health Library page.
 * This file now contains the action to generate health tips using an AI flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas for the AI flow
const HealthTipSchema = z.object({
  title: z.string().describe("The concise and engaging title of the health tip."),
  content: z.string().describe("The detailed content of the health tip, providing actionable advice. Should be around 2-3 sentences."),
});
export type HealthTip = z.infer<typeof HealthTipSchema>;

const GenerateHealthTipsOutputSchema = z.object({
  tips: z.array(HealthTipSchema).describe("An array of 5 unique and varied health tips."),
});
type GenerateHealthTipsOutput = z.infer<typeof GenerateHealthTipsOutputSchema>;


// 2. Define the AI Prompt
const healthTipsPrompt = ai.definePrompt({
  name: 'healthTipsPrompt',
  output: { schema: GenerateHealthTipsOutputSchema },
  prompt: `You are a health and wellness expert. Your goal is to provide users with simple, actionable, and encouraging health tips in French.

Please generate a list of 5 unique and varied health tips covering different aspects of well-being, such as nutrition, exercise, mental health, sleep, and hydration.

Each tip should have a catchy title and a short, easy-to-understand description. The tone should be positive and motivating. Do not repeat tips.`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  }
});


// 3. Define the AI Flow
const generateHealthTipsFlow = ai.defineFlow(
  {
    name: 'generateHealthTipsFlow',
    outputSchema: GenerateHealthTipsOutputSchema,
  },
  async () => {
    const { output } = await healthTipsPrompt({});
    return output!;
  }
);


// 4. Create the Server Action to be called from the client
export async function generateHealthTips(): Promise<{ success: boolean; tips?: HealthTip[]; error?: string }> {
  try {
    const result = await generateHealthTipsFlow();
    return { success: true, tips: result.tips };
  } catch (error) {
    console.error('Error generating health tips:', error);
    const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
    return { success: false, error: `Impossible de générer les conseils : ${message}` };
  }
}
