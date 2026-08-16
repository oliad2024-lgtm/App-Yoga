import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, eventId } = body;

    if (!userId || !eventId) {
      return Response.json(
        { error: "userId and eventId are required" },
        { status: 400 },
      );
    }

    // Insert booking (will fail if already exists due to UNIQUE constraint)
    await sql`
      INSERT INTO event_bookings (user_id, event_id)
      VALUES (${userId}, ${eventId})
      ON CONFLICT (user_id, event_id) DO NOTHING
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error booking event:", error);
    return Response.json({ error: "Failed to book event" }, { status: 500 });
  }
}
