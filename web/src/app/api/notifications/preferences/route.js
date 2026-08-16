import sql from "@/app/api/utils/sql";

// Get notification preferences
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const preferences = await sql(
      `SELECT * FROM notification_preferences WHERE user_id = $1`,
      [userId],
    );

    // If no preferences exist, return defaults
    if (preferences.length === 0) {
      return Response.json({
        push_enabled: true,
        event_reminders: true,
        daily_practice: true,
        community_interactions: true,
        new_events: true,
        streak_milestones: true,
        new_content: true,
        practice_reminder_time: "09:00",
      });
    }

    return Response.json(preferences[0]);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return Response.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 },
    );
  }
}

// Update notification preferences
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      push_enabled,
      event_reminders,
      daily_practice,
      community_interactions,
      new_events,
      streak_milestones,
      new_content,
      practice_reminder_time,
      push_token,
    } = body;

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    // Build update query dynamically
    const updates = [];
    const values = [userId];
    let paramCount = 2;

    if (push_enabled !== undefined) {
      updates.push(`push_enabled = $${paramCount++}`);
      values.push(push_enabled);
    }
    if (event_reminders !== undefined) {
      updates.push(`event_reminders = $${paramCount++}`);
      values.push(event_reminders);
    }
    if (daily_practice !== undefined) {
      updates.push(`daily_practice = $${paramCount++}`);
      values.push(daily_practice);
    }
    if (community_interactions !== undefined) {
      updates.push(`community_interactions = $${paramCount++}`);
      values.push(community_interactions);
    }
    if (new_events !== undefined) {
      updates.push(`new_events = $${paramCount++}`);
      values.push(new_events);
    }
    if (streak_milestones !== undefined) {
      updates.push(`streak_milestones = $${paramCount++}`);
      values.push(streak_milestones);
    }
    if (new_content !== undefined) {
      updates.push(`new_content = $${paramCount++}`);
      values.push(new_content);
    }
    if (practice_reminder_time !== undefined) {
      updates.push(`practice_reminder_time = $${paramCount++}`);
      values.push(practice_reminder_time);
    }
    if (push_token !== undefined) {
      updates.push(`push_token = $${paramCount++}`);
      values.push(push_token);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const result = await sql(
      `INSERT INTO notification_preferences (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) 
       DO UPDATE SET ${updates.join(", ")}
       RETURNING *`,
      values,
    );

    return Response.json({ success: true, preferences: result[0] });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return Response.json(
      { error: "Failed to update notification preferences" },
      { status: 500 },
    );
  }
}
