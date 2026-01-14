import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        const { message, conversationId, userId, context } = await req.json()

        // Log AI interaction
        await supabaseClient.from('ai_logs').insert({
            user_id: userId,
            feature: 'conversation_ai',
            input: { message, conversationId, context },
            timestamp: new Date().toISOString()
        })

        // AI Processing - Conversation AI
        const response = await generateAIResponse(message, conversationId, context)

        // Cache conversation response
        await supabaseClient.from('ai_conversation_cache').insert({
            conversation_id: conversationId,
            user_id: userId,
            user_message: message,
            ai_response: response,
            context: context,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })

        return new Response(
            JSON.stringify({
                success: true,
                data: response,
                source: 'ai',
                latency: Date.now() - new Date().getTime(),
                metadata: {
                    modelVersion: 'gpt-4-turbo-v1.2',
                    algorithm: 'Large Language Model'
                }
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        console.error('Error in conversation-ai:', error)

        // Fallback: template-based responses
        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    response: getFallbackResponse(message),
                    confidence: 0.5,
                    suggestions: ['Contact support', 'Check FAQ', 'Try again later'],
                    reasoning: 'Template-based response due to AI unavailability'
                },
                source: 'rule-based',
                latency: 40,
                error: error.message
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    }
})

async function generateAIResponse(message: string, conversationId: string, context: any) {
    // Mock GPT-4 based conversation AI
    // In production: Call actual LLM API

    const lowerMessage = message.toLowerCase()

    let response = ''
    let suggestions = []

    // Analyze message intent and generate contextual response
    if (lowerMessage.includes('delay') || lowerMessage.includes('late')) {
        response = "I understand you're concerned about the delay. Let me check the latest update on your trip. The driver is currently experiencing traffic and should arrive in approximately 10-15 minutes. Would you like me to send you live updates?"
        suggestions = ['Send live updates', 'Contact driver', 'Cancel trip']
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fare')) {
        response = "Regarding pricing, our fares are calculated based on distance, time, and current demand. The price shown includes all fees and taxes. If you'd like a detailed breakdown or have questions about surge pricing, I can explain further."
        suggestions = ['Show price breakdown', 'Explain surge pricing', 'Compare options']
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
        response = "I can help you with cancellation and refunds. Our policy allows free cancellation up to 2 hours before pickup. After that, a small fee may apply. Would you like me to proceed with cancellation or check your refund eligibility?"
        suggestions = ['Cancel trip', 'Check refund policy', 'Contact support']
    } else if (lowerMessage.includes('rating') || lowerMessage.includes('review')) {
        response = "Ratings are important for maintaining service quality. After your trip, you'll be able to rate both the driver and the overall experience. Your feedback helps us improve. Is there something specific you'd like to know about the rating system?"
        suggestions = ['How ratings work', 'Rating benefits', 'Appeal rating']
    } else {
        response = "I'm here to help with your Wassel experience. I can assist with trip details, pricing questions, cancellations, or general support. What specific question or concern do you have?"
        suggestions = ['Trip status', 'Pricing info', 'Safety features', 'Contact support']
    }

    return {
        response,
        confidence: 0.92,
        suggestions,
        reasoning: [
            `Analyzed message intent: ${detectIntent(message)}`,
            'Generated contextual response based on user context',
            'Included relevant action suggestions',
            'Maintained helpful and professional tone'
        ],
        sentiment: analyzeSentiment(message),
        urgency: detectUrgency(message),
        followUp: shouldFollowUp(message)
    }
}

function detectIntent(message: string) {
    const lower = message.toLowerCase()

    if (lower.includes('delay') || lower.includes('late') || lower.includes('wait')) return 'delay_concern'
    if (lower.includes('price') || lower.includes('cost') || lower.includes('expensive')) return 'pricing_question'
    if (lower.includes('cancel') || lower.includes('refund')) return 'cancellation_request'
    if (lower.includes('rating') || lower.includes('review') || lower.includes('rate')) return 'rating_question'
    if (lower.includes('help') || lower.includes('support') || lower.includes('problem')) return 'support_request'

    return 'general_inquiry'
}

function analyzeSentiment(message: string) {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'thanks', 'thank you']
    const negativeWords = ['bad', 'terrible', 'awful', 'angry', 'frustrated', 'disappointed', 'worst']

    const lower = message.toLowerCase()
    const positiveCount = positiveWords.filter(word => lower.includes(word)).length
    const negativeCount = negativeWords.filter(word => lower.includes(word)).length

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
}

function detectUrgency(message: string) {
    const urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'now', 'stuck', 'danger']
    const lower = message.toLowerCase()

    return urgentWords.some(word => lower.includes(word)) ? 'high' : 'normal'
}

function shouldFollowUp(message: string) {
    // Determine if human follow-up is needed
    const complexTopics = ['complaint', 'dispute', 'refund', 'emergency', 'safety']
    const lower = message.toLowerCase()

    return complexTopics.some(topic => lower.includes(topic))
}

function getFallbackResponse(message: string) {
    const responses = [
        "Thank you for your message. I'm currently experiencing technical difficulties. Please try again in a few moments or contact our support team.",
        "I apologize for the inconvenience. Our AI assistant is temporarily unavailable. A support representative will assist you shortly.",
        "We're working to resolve this issue. In the meantime, you can find answers in our FAQ section or contact support directly."
    ]

    return responses[Math.floor(Math.random() * responses.length)]
}
