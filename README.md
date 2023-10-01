# Twilio Conversations + Cloudflare Worker AI exploration

This is a WIP to use the new [Cloudflare Worker AI LLM](https://developers.cloudflare.com/workers-ai/models/llm/) and connecting it with [Twilio Conversations](https://twilio.com/conversations) which is an API that allows for omni-channel communications.

## Installation

Create a Conversation Service:

```bash
twilio api:conversations:v1:services:create --friendly-name="cloudflareconvo"
```

Use the `SID` (String Identifier) to add a new address configuration

Wire up your Twilio Phone Number to a Conversation Service

```bash
twilio api:conversations:v1:configuration:addresses:create \
    --friendly-name="Cloudflare Convo" \
    --auto-creation.enabled  \
    --auto-creation.type="webhook" \
    --auto-creation.conversation-service-sid="YOUR-SID-HERE" \
    --auto-creation.webhook-url=https://example.com \
    --auto-creation.webhook-method="POST" \
    --auto-creation.webhook-filters="onMessageAdded" \
    --type="sms" \
    --address="YOUR-TWILIO-NUMBER"

```

If you need to unset your SMS webhook url:

```bash
twilio phone-numbers:update <YOUR-TWILIO-NUMBER> --sms-url=""
```