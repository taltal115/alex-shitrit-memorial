// @ts-nocheck - Database types are not fully generated yet
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();

  const { data: memorial, error } = await supabase
    .from('memorial')
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(memorial);
}

export async function POST(request: Request) {
  const supabase = createClient();

  // Check if user is super admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check user role
  const { data: memberships } = await supabase
    .from('user_membership')
    .select('role')
    .eq('user_id', user.id);

  type MembershipRole = { role: string };
  const isSuperAdmin =
    memberships &&
    memberships.length > 0 &&
    (memberships[0] as MembershipRole).role === 'super_admin';

  if (!isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { death_time_relative_to_sunset } = body;

  if (!['before_sunset', 'after_sunset'].includes(death_time_relative_to_sunset)) {
    return NextResponse.json(
      { error: 'Invalid value for death_time_relative_to_sunset' },
      { status: 400 }
    );
  }

  // Get memorial ID
  const { data: memorial } = await supabase
    .from('memorial')
    .select('id')
    .single();

  if (!memorial) {
    return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });
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
  const updateData: any = {
    death_time_relative_to_sunset,
    hebrew_death_date_day: hebrewDateDay,
    hebrew_death_date_month: hebrewDateMonth,
    hebrew_death_date_year: hebrewDateYear,
    death_date_verified: true,
    death_date_verified_at: new Date().toISOString(),
    death_date_verified_by: user.id,
  };

  const { data, error: updateError } = await supabase
    .from('memorial')
    .update(updateData)
    .eq('id', memorial.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Log to audit
  await supabase.from('audit_log').insert({
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

  return NextResponse.json(data);
}
