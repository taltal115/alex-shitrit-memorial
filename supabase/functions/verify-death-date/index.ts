// Death date verification Edge Function
// Handles memorial death date updates with admin authorization and audit logging

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    );

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Check if user is super admin
    const { data: memberships } = await supabaseClient
      .from('user_membership')
      .select('role')
      .eq('user_id', user.id);

    const isSuperAdmin =
      memberships &&
      memberships.length > 0 &&
      memberships[0].role === 'super_admin';

    if (!isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: super_admin role required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { death_time_relative_to_sunset } = body;

    if (!['before_sunset', 'after_sunset'].includes(death_time_relative_to_sunset)) {
      return new Response(
        JSON.stringify({ error: 'Invalid value for death_time_relative_to_sunset' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Get memorial ID
    const { data: memorial } = await supabaseClient
      .from('memorial')
      .select('id')
      .single();

    if (!memorial) {
      return new Response(
        JSON.stringify({ error: 'Memorial not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Determine which Hebrew date to use
    const hebrewDateDay =
      death_time_relative_to_sunset === 'before_sunset'
        ? body.hebrew_date_before_sunset_day
        : body.hebrew_date_after_sunset_day;
    const hebrewDateMonth =
      death_time_relative_to_sunset === 'before_sunset'
        ? body.hebrew_date_before_sunset_month
        : body.hebrew_date_after_sunset_month;
    const hebrewDateYear =
      death_time_relative_to_sunset === 'before_sunset'
        ? body.hebrew_date_before_sunset_year
        : body.hebrew_date_after_sunset_year;

    // Update memorial
    const updateData = {
      death_time_relative_to_sunset,
      hebrew_death_date_day: hebrewDateDay,
      hebrew_death_date_month: hebrewDateMonth,
      hebrew_death_date_year: hebrewDateYear,
      death_date_verified: true,
      death_date_verified_at: new Date().toISOString(),
      death_date_verified_by: user.id,
    };

    const { data, error: updateError } = await supabaseClient
      .from('memorial')
      .update(updateData)
      .eq('id', memorial.id)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Log to audit
    await supabaseClient.from('audit_log').insert({
      user_id: user.id,
      action: 'verify_death_date',
      resource_type: 'memorial',
      resource_id: memorial.id,
      changes: {
        death_time_relative_to_sunset,
        hebrew_date: {
          day: hebrewDateDay,
          month: hebrewDateMonth,
          year: hebrewDateYear,
        },
      },
    });

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
