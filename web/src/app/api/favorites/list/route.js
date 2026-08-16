import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const favorites = await sql`
      SELECT practice_id, created_at
      FROM favorites
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    // Return just the practice IDs for easy lookup
    const practiceIds = favorites.map((f) => f.practice_id);

    return Response.json({ practiceIds });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return Response.json(
      { error: "Failed to fetch favorites" },
      { status: 500 },
    );
  }
}
