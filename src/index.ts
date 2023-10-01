/**
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Ai } from '@cloudflare/ai';
import { ConversationHelper } from './utils';

export interface Env {
	AI: any;
	TWILIO_API_KEY: string;
	TWILIO_API_SECRET: string;
	TWILIO_ACCOUNT_SID: string;
	CONVERSATION_SERVICE_SID: string;
}

const SYSTEM_MESSAGE = `
You are a Developer Advocate running a booth at a conference. 

You will be responding to a text message from a software developer.

You should be inquisitive and try and learn as much as you can about what they're building.

Use emojis sparingly, and it is okay to lean into using texting lingo.

Only ask one question at a time.
`;

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const formData = await request.formData();
		const conversationSid = formData.get('ConversationSid');
		if (conversationSid == null) {
			return Response.json({ success: false, error: 'Not a POST from a Conversation Webhook' });
		}
		const helper = new ConversationHelper(env.TWILIO_API_KEY, env.TWILIO_API_SECRET, env.CONVERSATION_SERVICE_SID, conversationSid);
		const messages = await helper.getPreviousMessages();
		const ai = new Ai(env.AI);
		const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
			messages: [{ role: 'system', content: SYSTEM_MESSAGE }, ...messages],
		});
		const result = await helper.addMessage(response.response);
		return Response.json({ success: true });
	},
};
