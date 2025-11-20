
'use server';

/**
 * @fileOverview An AI flow to process a client's product demand.
 *
 * - processDemand - A function that analyzes a product description and/or images to identify the correct product name.
 * - ProcessDemandInput - The input type for the processDemand function.
 * - ProcessDemandOutput - The return type for the processDemand function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input schema for the AI flow
const ProcessDemandInputSchema = z.object({
  description: z
    .string()
    .describe("The user's raw text description of the product they are looking for."),
  photoDataUris: z
    .array(z.string())
    .describe(
      "An array of public URLs to photos of the product. These are the primary source of truth if available."
    ),
});
export type ProcessDemandInput = z.infer<typeof ProcessDemandInputSchema>;

// Output schema for the AI flow
const ProcessDemandOutputSchema = z.object({
  productName: z
    .string()
    .describe("The corrected, official, or most likely name of the product identified from the inputs."),
});
export type ProcessDemandOutput = z.infer<typeof ProcessDemandOutputSchema>;

// The exported server action that can be called from other server-side code.
export async function processDemand(input: ProcessDemandInput): Promise<ProcessDemandOutput> {
  return processDemandFlow(input);
}

// Definition of the AI prompt
const prompt = ai.definePrompt({
  name: 'processDemandPrompt',
  input: { schema: ProcessDemandInputSchema },
  output: { schema: ProcessDemandOutputSchema },
  prompt: `You are an expert pharmacist assistant. Your task is to accurately identify a pharmaceutical or parapharmaceutical product based on a user's request. The user may provide a text description and/or photos.

  Context:
  - The user is looking for a specific product in a pharmacy.
  - The text description might contain typos or be vague.
  - The photos, if provided, are the most reliable source of information. Analyze them carefully to read the product name from the packaging.
  - If both text and photos are provided, prioritize the name visible in the photos.
  - If only text is provided, correct any obvious spelling mistakes for common medication names (e.g., "dolipran" should be "Doliprane", "paracétamole" should be "Paracétamol").
  - If no product can be reasonably identified, return the original description.

  User's text description: {{{description}}}

  {{#if photoDataUris}}
  Product photos (analyze these for the product name):
  {{#each photoDataUris}}
  - {{media url=this}}
  {{/each}}
  {{/if}}

  Based on this information, determine the most accurate and official name of the product.
  `,
});

// Definition of the Genkit flow
const processDemandFlow = ai.defineFlow(
  {
    name: 'processDemandFlow',
    inputSchema: ProcessDemandInputSchema,
    outputSchema: ProcessDemandOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
