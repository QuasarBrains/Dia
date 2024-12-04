import {z} from 'zod';
import {zodResponseFormat} from 'openai/helpers/zod';
import {nameManager} from '../utils/names.js';
import {client, getTextResponse} from '../utils/openai.js';

const debate = z.object({
	topic: z.string(),
	positions: z.array(z.string()),
});

export type Debate = z.infer<typeof debate>;

type DebateConfig = {
	topic: string;
	context: string;
};
export async function initializeDebate({topic, context}: DebateConfig) {
	try {
		const completion = await client.beta.chat.completions.parse({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: `
					# Purpose
					Based on the topic and context given, initialize a debate layout.
					The user will provide a topic, you should formalize it to be clear and concise.
					Then, based on the topic, you should initialize positions which should be argued for.

					# Context
					Each position should essentially outline the position that a debate participant might take.
					You can have as many positions as would be valuable, not every debate will be two-sided.
					Each position will be assigned to an entity, who will argue for that position against the others.

					# Rules
					- Don't over-embelish, keep things formal
					- Positions should disagree with one another
					- Minimize positions, including only those which are significantly distinct and important
					`,
				},
				{
					role: 'user',
					content: `
					The user provided the following prompt for the debate:
					---
					${topic}
					---

					The user provided the following context for initialization:
					---
					${context}
					---
					`,
				},
			],
			response_format: zodResponseFormat(debate, 'debate'),
		});

		const debateParsed = completion.choices[0]?.message.parsed;
		if (!debateParsed) {
			return undefined;
		}
		return debateParsed;
	} catch (err) {
		console.error(err);
		throw new Error('Error initializing the debate.');
	}
}

export type Statement = {
	name: string;
	position: string;
	content: string;
};

type DebaterConfig = {
	position: string;
	debate: Debate;
};
export class Debater {
	private _name: string;
	private _position: string;
	private _debate: Debate;

	constructor({position, debate}: DebaterConfig) {
		this._name = nameManager.getName();
		this._position = position;
		this._debate = debate;
	}

	get name() {
		return this._name;
	}

	get position() {
		return this._position;
	}

	get debate() {
		return this._debate;
	}

	get systemPrompt() {
		return `Your name is ${this.name}. You are a participant in a debate.

		# Context
		The debate is on the following topic: ${this.debate.topic}

		# Position
		You are to take the following position in this debate:
		${this.debate}
		`;
	}

	async getOpeningStatement(): Promise<Statement | undefined> {
		try {
			const response = await getTextResponse([
				{
					role: 'system',
					content: this.systemPrompt,
				},
				{
					role: 'system',
					content: 'Please greet the audience.',
				},
			]);

			if (!response) {
				return undefined;
			}

			return {
				name: this.name,
				position: this.position,
				content: response,
			};
		} catch (err) {
			console.error(err);
			return undefined;
		}
	}
}
