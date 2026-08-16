import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return Response.json({ error: "Missing postId" }, { status: 400 });
    }

    const comments = await sql`
      SELECT id, post_id, user_id, user_name, user_avatar, content, created_at
      FROM post_comments
      WHERE post_id = ${postId}
      ORDER BY created_at ASC
    `;

    return Response.json({ comments });
  } catch (error) {
    console.error("Error getting comments:", error);
    return Response.json({ error: "Failed to get comments" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, userName, userAvatar, postId, content } =
      await request.json();

    if (!userId || !userName || !postId || !content) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO post_comments (post_id, user_id, user_name, user_avatar, content)
      VALUES (${postId}, ${userId}, ${userName}, ${userAvatar || null}, ${content})
      RETURNING id, post_id, user_id, user_name, user_avatar, content, created_at
    `;

    return Response.json({ comment: result[0] });
  } catch (error) {
    console.error("Error adding comment:", error);
    return Response.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
