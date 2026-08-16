import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId, practiceId } = await request.json();

    if (!userId || !practiceId) {
      return Response.json(
        { error: "userId and practiceId are required" },
        { status: 400 },
      );
    }

    // Insert favorite (ON CONFLICT DO NOTHING prevents duplicates)
    await sql`
      INSERT INTO favorites (user_id, practice_id)
      VALUES (${userId}, ${practiceId})
      ON CONFLICT (user_id, practice_id) DO NOTHING
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return Response.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}
