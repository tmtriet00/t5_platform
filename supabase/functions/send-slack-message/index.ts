// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { AuthMiddleware } from "../../shared/jwt.ts"

const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL')

interface SlackMessage {
    text: string
    channel?: string
    username?: string
    icon_emoji?: string
}

serve(async (req) => AuthMiddleware(req, async (req) => {
    try {
        // Handle CORS preflight requests
        if (req.method === 'OPTIONS') {
            return new Response('ok', {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                },
            })
        }

        // Check if webhook URL is configured
        if (!SLACK_WEBHOOK_URL) {
            throw new Error('SLACK_WEBHOOK_URL environment variable is not set')
        }

        // Parse request body
        const { text, channel, username, icon_emoji } = await req.json() as SlackMessage

        // Validate required fields
        if (!text) {
            return new Response(
                JSON.stringify({ error: 'Missing required field: text' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            )
        }

        // Prepare Slack message payload with user mention
        const slackPayload: Record<string, string> = {
            text: `${text}`,
        }

        if (channel) slackPayload.channel = channel
        if (username) slackPayload.username = username
        if (icon_emoji) slackPayload.icon_emoji = icon_emoji

        // Send message to Slack
        const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(slackPayload),
        })

        if (!slackResponse.ok) {
            const errorText = await slackResponse.text()
            throw new Error(`Slack API error: ${slackResponse.status} - ${errorText}`)
        }

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Slack message sent successfully',
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        )
    } catch (error) {
        console.error('Error sending Slack message:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: error,
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        )
    }
}))
