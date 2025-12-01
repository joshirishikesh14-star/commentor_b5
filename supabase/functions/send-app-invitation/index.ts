import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { invitationId, inviteeEmail, appName, inviterName } = await req.json();

    if (!invitationId || !inviteeEmail || !appName) {
      throw new Error('Missing required fields');
    }

    const { data: invitation, error: invError } = await supabase
      .from('app_invitations')
      .select('*, apps!inner(id, name, base_url)')
      .eq('id', invitationId)
      .single();

    if (invError || !invitation) {
      throw new Error('Invitation not found');
    }

    const acceptUrl = `${req.headers.get('origin') || 'http://localhost:5173'}/accept-invitation?token=${invitation.invitation_token}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 14px 28px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .app-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">App Review Invitation</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;"><strong>${inviterName}</strong> has invited you to review their app:</p>

              <div class="app-info">
                <h2 style="margin: 0 0 10px 0; color: #667eea; font-size: 20px;">${appName}</h2>
                <p style="margin: 0; color: #666; font-size: 14px;">${invitation.apps.base_url}</p>
              </div>

              <p style="font-size: 16px;">You've been invited to test and provide feedback on this application. Click the button below to accept the invitation and start reviewing:</p>

              <div style="text-align: center;">
                <a href="${acceptUrl}" class="button">Accept Invitation & Start Reviewing</a>
              </div>

              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #1976d2;"><strong>What you can do:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #1976d2; font-size: 14px;">
                  <li>Browse the application in a live preview</li>
                  <li>Leave comments and feedback on any page</li>
                  <li>Report bugs with screenshots</li>
                  <li>Collaborate with other reviewers</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>This invitation was sent to ${inviteeEmail}</p>
              <p style="font-size: 12px; color: #999;">If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
      inviteeEmail,
      {
        redirectTo: acceptUrl,
        data: {
          invitation_id: invitationId,
          app_id: invitation.apps.id,
          app_name: appName,
          inviter_name: inviterName,
        },
      }
    );

    if (authError) {
      console.error('Supabase auth error:', authError);
      throw new Error(`Failed to send invitation: ${authError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation sent successfully',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});