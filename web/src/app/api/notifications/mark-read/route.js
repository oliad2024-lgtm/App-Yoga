import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, notificationId } = body;

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    // If notificationId is provided, mark that one as read
    // Otherwise, mark all as read
    if (notificationId) {
      await sql(
        `UPDATE notifications 
         SET read = true 
         WHERE id = $1 AND user_id = $2`,
        [notificationId, userId],
      );
    } else {
      await sql(
        `UPDATE notifications 
         SET read = true 
         WHERE user_id = $1`,
        [userId],
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return Response.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 },
    );
  }
}
