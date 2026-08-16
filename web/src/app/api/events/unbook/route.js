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

    await sql`
      DELETE FROM event_bookings
      WHERE user_id = ${userId} AND event_id = ${eventId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error unbooking event:", error);
    return Response.json({ error: "Failed to unbook event" }, { status: 500 });
  }
}
