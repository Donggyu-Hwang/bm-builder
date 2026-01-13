import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import type { PriorityItem } from '../../../frontend/src/types/priorities';

// AWS Bedrock Runtime Client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

// Claude model ID on AWS Bedrock
// Available models:
// - anthropic.claude-3-5-sonnet-20241022-v2:0 (Claude 3.5 Sonnet v2)
// - anthropic.claude-3-5-sonnet-20240620-v1:0 (Claude 3.5 Sonnet v1)
// - anthropic.claude-3-5-haiku-20241022-v1:0 (Claude 3.5 Haiku)
// - anthropic.claude-3-opus-20240229-v1:0 (Claude 3 Opus)
const CLAUDE_MODEL_ID = process.env.CLAUDE_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0';

export async function generatePriorities(onboardingResponses: string): Promise<PriorityItem[]> {
  const prompt = `Based on the following onboarding responses, generate 5 specific, actionable priorities for building a business model:

${onboardingResponses}

Requirements:
1. Each priority should be a specific action item
2. Priorities should follow Lean Startup methodology
3. Return ONLY a JSON array with this exact structure:
[
  {
    "id": "unique-id-1",
    "title": "Priority Title",
    "description": "Detailed description of what to do",
    "order": 1
  }
]
4. Use business terminology appropriate for startups
5. Focus on customer discovery, MVP, and validation`;

  try {
    const command = new InvokeModelCommand({
      modelId: CLAUDE_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const response = await bedrockClient.send(command);

    // Decode the response stream
    const responseBody = new TextDecoder().decode(response.body);
    const parsedResponse = JSON.parse(responseBody);

    // Extract the content from Bedrock response format
    const content = parsedResponse.content?.[0]?.text;

    if (!content) {
      throw new Error('Empty response from Bedrock');
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const priorities = JSON.parse(jsonMatch[0]) as PriorityItem[];
      return priorities;
    }

    throw new Error('Failed to parse Claude response from Bedrock');
  } catch (error) {
    console.error('AWS Bedrock API error:', error);

    // Provide more detailed error information
    if (error instanceof Error) {
      throw new Error(`Failed to generate priorities with AWS Bedrock: ${error.message}`);
    }

    throw new Error('Failed to generate priorities with AWS Bedrock');
  }
}

export const claudeService = {
  generatePriorities,
};
