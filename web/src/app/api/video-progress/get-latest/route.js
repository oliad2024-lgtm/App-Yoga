import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json(
        { error: "Missing userId parameter" },
        { status: 400 },
      );
    }

    // Get the most recently watched video for this user
    const result = await sql`
      SELECT *
      FROM video_progress
      WHERE user_id = ${userId}
      ORDER BY last_watched_at DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      return Response.json({ progress: null });
    }

    return Response.json({ progress: result[0] });
  } catch (error) {
    console.error("Error fetching video progress:", error);
    return Response.json(
      { error: "Failed to fetch video progress" },
      { status: 500 },
    );
  }
}
