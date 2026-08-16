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

    await sql`
      DELETE FROM favorites
      WHERE user_id = ${userId} AND practice_id = ${practiceId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return Response.json(
      { error: "Failed to remove favorite" },
      { status: 500 },
    );
  }
}
