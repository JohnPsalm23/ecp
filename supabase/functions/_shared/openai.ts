import OpenAI from 'https://esm.sh/openai@4.28.4';

export const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

export const MODELS = {
  GPT4_VISION: 'gpt-4-vision-preview',
  GPT4_TURBO: 'gpt-4-turbo-preview',
  GPT4: 'gpt-4',
  GPT35_TURBO: 'gpt-3.5-turbo',
  EMBEDDING: 'text-embedding-3-small',
} as const;

export interface QCAnalysisResult {
  overall_score: number;
  status: 'passed' | 'warning' | 'failed';
  scores: {
    exposure: number;
    white_balance: number;
    sharpness: number;
    composition: number;
    color_accuracy: number;
    noise: number;
  };
  issues: Array<{
    type: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    description: string;
    location?: { x: number; y: number };
    confidence: number;
  }>;
  recommendations: string[];
  room_type?: string;
  scene_description?: string;
}

export const QC_SYSTEM_PROMPT = `You are an expert real estate photography quality control analyst. Analyze the provided image and evaluate it based on professional real estate photography standards.

Evaluate the following criteria on a scale of 0-100:
1. Exposure - Is the image properly exposed? No blown highlights or crushed shadows.
2. White Balance - Are the colors natural and accurate?
3. Sharpness - Is the image in focus with no motion blur?
4. Composition - Is the framing appropriate for real estate? Straight verticals, good angles.
5. Color Accuracy - Do colors look natural and appealing?
6. Noise - Is the image free from excessive digital noise?

Identify any issues such as:
- Dust spots or sensor dirt
- Reflections of photographer or equipment
- Crooked horizons or verticals
- Overexposed windows
- Underexposed interiors
- Missing HDR blending
- Poor staging or clutter
- Safety hazards visible
- Personal items that should be hidden

Classify the room/scene type (living room, kitchen, bedroom, bathroom, exterior, pool, etc.)

Return your analysis as JSON matching the QCAnalysisResult interface.`;

export async function analyzeImageForQC(imageUrl: string): Promise<QCAnalysisResult> {
  const response = await openai.chat.completions.create({
    model: MODELS.GPT4_VISION,
    messages: [
      {
        role: 'system',
        content: QC_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: 'Analyze this real estate photo for quality control. Return JSON matching the QCAnalysisResult interface.',
          },
        ],
      },
    ],
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(content) as QCAnalysisResult;
}

export interface SchedulingRecommendation {
  photographer_id: string;
  score: number;
  reasoning: string[];
  estimated_travel_time: number;
  estimated_arrival: string;
  conflicts: string[];
}

export const SCHEDULING_SYSTEM_PROMPT = `You are an expert scheduling optimizer for a real estate photography company. Given photographer availability, skills, locations, and job requirements, recommend the optimal photographer assignment.

Consider:
1. Travel distance from photographer's home or last job
2. Skills match (drone, matterport, video, etc.)
3. Equipment availability
4. Historical performance and QC scores
5. Customer preferences
6. Time zone considerations
7. Buffer time between appointments
8. Traffic patterns for the time of day
9. Photographer workload balance
10. Overtime considerations

Return ranked recommendations with reasoning.`;
