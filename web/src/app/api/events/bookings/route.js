import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const bookings = await sql`
      SELECT event_id FROM event_bookings
      WHERE user_id = ${userId}
    `;

    const bookedEventIds = bookings.map((b) => b.event_id);

    return Response.json({ bookedEventIds });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return Response.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}
