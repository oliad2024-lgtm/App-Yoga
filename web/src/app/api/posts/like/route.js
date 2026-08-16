import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId, postId } = await request.json();

    if (!userId || !postId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Toggle like - if exists, remove it; if not, add it
    const existing = await sql`
      SELECT id FROM post_likes 
      WHERE post_id = ${postId} AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      await sql`
        DELETE FROM post_likes 
        WHERE post_id = ${postId} AND user_id = ${userId}
      `;
      return Response.json({ liked: false });
    } else {
      await sql`
        INSERT INTO post_likes (post_id, user_id)
        VALUES (${postId}, ${userId})
      `;
      return Response.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return Response.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
