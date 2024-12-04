import {OpenAI} from 'openai';
import {config} from 'dotenv';
config();
export const client = new OpenAI({
	apiKey: process.env['OPENAI_API_KEY'],
});

const defaultModel: OpenAI.ChatModel = 'gpt-4o-mini';

export async function getTextResponse(
	messages: OpenAI.ChatCompletionMessageParam[],
): Promise<string | undefined> {
	try {
		const response = await client.chat.completions.create({
			messages: messages,
			model: defaultModel,
		});
		const message = response.choices[0]?.message.content;
		if (!message || typeof message !== 'string') {
			return undefined;
		}
		return message;
	} catch (err) {
		console.error(err);
		return undefined;
	}
}
