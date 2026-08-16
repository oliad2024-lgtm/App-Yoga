import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const result = await sql(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = $1 AND read = false`,
      [userId],
    );

    return Response.json({ count: parseInt(result[0].count) });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return Response.json(
      { error: "Failed to fetch unread count" },
      { status: 500 },
    );
  }
}
