// TODO: Since Twilio Libraries require a Node runtime,
// Cloudflare workers don't support the entire runtime.

// I would love to use [Twilio types](https://github.com/twilio/twilio-node/blob/392fedd59b633ee1a7195e48607646ac58c5cc6f/src/rest/conversations/v1/conversation/message.ts#L357) here
interface Message {
	author: string;
	body: string;
}

interface MessagingResponse {
	messages: Array<Message>;
}

export class ConversationHelper {
	private authorizationToken;
	private endpoint;

	constructor(twilioApiKey: string, twilioApiSecret: string, serviceSid: string, conversationSid: string) {
		this.authorizationToken = btoa(twilioApiKey + ':' + twilioApiSecret);
		this.endpoint = `https://conversations.twilio.com/v1/Services/${serviceSid}/Conversations/${conversationSid}/Messages`;
	}

	async getPreviousMessages() {
		const result = await fetch(this.endpoint, {
			headers: {
				Authorization: `Basic ${this.authorizationToken}`,
			},
		});
		const response: MessagingResponse = await result.json();
		// Create expected format for `ai.run`
		const messages = response.messages.map((msg) => {
			// Programmatically added Conversation Messages default to `system`
			const role = msg.author === 'system' ? 'assistant' : 'user';
			return { role, content: msg.body };
		});
		return messages;
	}

	async addMessage(content: string) {
		// Allows for URL Encoding
		const result = await fetch(this.endpoint, {
			method: 'POST',
			headers: {
				Authorization: `Basic ${this.authorizationToken}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				Body: content,
			}),
		});
		return result;
	}
}
