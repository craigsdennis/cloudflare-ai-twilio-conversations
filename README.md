# Twilio Conversations + Cloudflare Worker AI exploration

This is a WIP to use the new [Cloudflare Worker AI LLM](https://developers.cloudflare.com/workers-ai/models/llm/) and connecting it with [Twilio Conversations](https://twilio.com/conversations) which is an API that allows for omni-channel communications.

## Installation

### Twilio

Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart)

Buy a [phone number](https://console.twilio.com/us1/develop/phone-numbers/manage/search) if you need one.

Create a Conversation Service:

```bash
twilio api:conversations:v1:services:create --friendly-name="cloudflareconvo"
```

Use the `SID` (String Identifier) to add a new address configuration

If you need to unset your SMS webhook url:

```bash
twilio phone-numbers:update <YOUR-TWILIO-NUMBER> --sms-url=""
```

### Cloudflare

Setup a Cloudflare account

[Install wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) and login if you haven't already.

If you need to authenticate

```bash
wrangler login
```

Modify [wrangler.toml](./wrangler.toml) with your information.

```bash
wrangler deploy
```

### Altogether now

Configure your Twilio Phone Number to connect to a Conversation Service. Point it to your Cloudflare worker using the `auto-creation.webhook-url` parameter.

```bash
twilio api:conversations:v1:configuration:addresses:create \
    --friendly-name="Cloudflare Convo" \
    --auto-creation.enabled  \
    --auto-creation.type="webhook" \
    --auto-creation.conversation-service-sid="YOUR-SID-HERE" \
    --auto-creation.webhook-url="https://YOUR-CLOUDFLARE-WORKER-NAME.workers.dev" \
    --auto-creation.webhook-method="POST" \
    --auto-creation.webhook-filters="onMessageAdded" \
    --type="sms" \
    --address="YOUR-TWILIO-NUMBER"

```
