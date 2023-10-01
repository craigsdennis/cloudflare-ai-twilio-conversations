/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Ai } from '@cloudflare/ai';
import { ConversationHelper } from './utils';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
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
