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

        const { userId, context, limit = 5 } = await req.json()

        // Log AI interaction
        await supabaseClient.from('ai_logs').insert({
            user_id: userId,
            feature: 'personalized_recommendations',
            input: { context, limit },
            timestamp: new Date().toISOString()
        })

        // AI Processing - Personalized Recommendations
        const recommendations = await generatePersonalizedRecommendations(userId, context, limit)

        // Cache recommendations
        await supabaseClient.from('ai_recommendations_cache').insert({
            user_id: userId,
            type: 'personalized',
            context: context,
            recommendations: recommendations,
            expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours
        })

        return new Response(
            JSON.stringify({
                success: true,
                data: recommendations,
                source: 'ai',
                latency: Date.now() - new Date().getTime(),
                metadata: {
                    modelVersion: 'collaborative-filtering-v1.2',
                    algorithm: 'Matrix Factorization'
                }
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        console.error('Error in recommendations-personalized:', error)

        // Fallback: popular routes
        return new Response(
            JSON.stringify({
                success: true,
                data: [
                    { type: 'route', title: 'Dubai → Abu Dhabi', reason: 'Popular route' },
                    { type: 'route', title: 'Dubai Marina → Jumeirah', reason: 'Trending destination' },
                    { type: 'feature', title: 'Try Premium Marketplace', reason: 'Enhanced experience' }
                ],
                source: 'rule-based',
                latency: 35,
                error: error.message
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    }
})

async function generatePersonalizedRecommendations(userId: string, context: any, limit: number) {
    // Mock collaborative filtering-based recommendations
    // In production: Call actual recommendation engine

    const recommendations = []

    // Route recommendations based on user history
    const routeRecs = await getRouteRecommendations(userId, limit)
    recommendations.push(...routeRecs)

    // Feature recommendations based on usage patterns
    const featureRecs = await getFeatureRecommendations(userId, context, limit)
    recommendations.push(...featureRecs)

    // Social recommendations
    const socialRecs = await getSocialRecommendations(userId, limit)
    recommendations.push(...socialRecs)

    return recommendations.slice(0, limit).map((rec, index) => ({
        ...rec,
        confidence: Math.max(0.9 - index * 0.05, 0.7),
        position: index + 1
    }))
}

async function getRouteRecommendations(userId: string, limit: number) {
    // Mock: In production, analyze user's trip history
    const popularRoutes = [
        { type: 'route', title: 'Dubai → Abu Dhabi', reason: 'Based on your travel patterns' },
        { type: 'route', title: 'Dubai Marina → Palm Jumeirah', reason: 'Similar to your recent trips' },
        { type: 'route', title: 'Sharjah → Dubai', reason: 'Popular with users like you' }
    ]

    return popularRoutes.slice(0, Math.ceil(limit / 3))
}

async function getFeatureRecommendations(userId: string, context: any, limit: number) {
    // Mock: In production, analyze feature usage
    const features = [
        { type: 'feature', title: 'Try Recurring Trips', reason: 'Save time on regular routes' },
        { type: 'feature', title: 'Enable Split Payments', reason: 'Share costs with friends' },
        { type: 'feature', title: 'Join Referral Program', reason: 'Earn rewards for inviting friends' }
    ]

    return features.slice(0, Math.ceil(limit / 3))
}

async function getSocialRecommendations(userId: string, limit: number) {
    // Mock: In production, analyze social connections
    const social = [
        { type: 'social', title: 'Connect with verified drivers', reason: 'Build trust network' },
        { type: 'social', title: 'Join rider community', reason: 'Share experiences' },
        { type: 'social', title: 'Rate recent trips', reason: 'Help improve service' }
    ]

    return social.slice(0, Math.ceil(limit / 3))
}