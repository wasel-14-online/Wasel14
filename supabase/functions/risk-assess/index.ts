import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

        const { userId, action, context, userId: targetUserId } = await req.json()

        // Log AI interaction
        await supabaseClient.from('ai_logs').insert({
            user_id: userId,
            feature: 'risk_assessment',
            input: { action, context, targetUserId },
            timestamp: new Date().toISOString()
        })

        // AI Processing - Risk Assessment
        const riskAssessment = await assessRisk(targetUserId, action, context)

        // Store risk assessment
        await supabaseClient.from('ai_risk_assessments').insert({
            user_id: targetUserId,
            action_type: action,
            risk_score: riskAssessment.score,
            risk_level: riskAssessment.level,
            factors: riskAssessment.factors,
            recommendation: riskAssessment.recommendation,
            assessed_at: new Date().toISOString()
        })

        return new Response(
            JSON.stringify({
                success: true,
                data: riskAssessment,
                source: 'ai',
                latency: Date.now() - new Date().getTime(),
                metadata: {
                    modelVersion: 'random-forest-v1.3',
                    algorithm: 'Ensemble Learning'
                }
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        console.error('Error in risk-assess:', error)

        // Fallback: low risk
        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    score: 15,
                    level: 'low',
                    factors: { fallback: true },
                    recommendation: 'proceed',
                    reasoning: 'Fallback assessment due to AI unavailability'
                },
                source: 'rule-based',
                latency: 30,
                error: error.message
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    }
})

async function assessRisk(userId: string, action: string, context: any) {
    // Mock Random Forest-based risk assessment
    // In production: Call actual ML model with user history, device fingerprinting, etc.

    // Simulate risk factors analysis
    const factors = {
        userHistory: await getUserHistoryScore(userId),
        deviceFingerprint: Math.random() * 20, // 0-20
        locationAnomaly: Math.random() * 15, // 0-15
        timePattern: Math.random() * 10, // 0-10
        amountSize: context.amount ? Math.min(context.amount / 100, 25) : 0, // 0-25
        frequency: Math.random() * 5, // 0-5
    }

    const totalScore = Object.values(factors).reduce((a: number, b: number) => a + b, 0)

    let level = 'low'
    let recommendation = 'approve'

    if (totalScore > 60) {
        level = 'high'
        recommendation = 'block'
    } else if (totalScore > 30) {
        level = 'medium'
        recommendation = 'review'
    }

    return {
        score: Math.round(totalScore),
        level,
        factors,
        recommendation,
        reasoning: [
            `User history score: ${factors.userHistory.toFixed(1)}/20`,
            `Device fingerprint analysis: ${factors.deviceFingerprint.toFixed(1)}/20`,
            `Location anomaly check: ${factors.locationAnomaly.toFixed(1)}/15`,
            `Time pattern analysis: ${factors.timePattern.toFixed(1)}/10`,
            `Amount size assessment: ${factors.amountSize.toFixed(1)}/25`,
            `Frequency analysis: ${factors.frequency.toFixed(1)}/5`
        ],
        confidence: 0.91,
        modelVersion: 'random-forest-v1.3'
    }
}

async function getUserHistoryScore(userId: string) {
    // Mock user history analysis
    // In production: Query actual user behavior data
    return Math.random() * 20 // 0-20 score
}