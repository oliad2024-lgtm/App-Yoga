import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get posts with like and comment counts
    const posts = await sql`
      SELECT 
        p.id,
        p.user_id,
        p.user_name,
        p.user_avatar,
        p.content,
        p.image_url,
        p.location,
        p.created_at,
        COUNT(DISTINCT pl.id) as like_count,
        COUNT(DISTINCT pc.id) as comment_count,
        ${userId ? sql`EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ${userId})` : sql`false`} as is_liked
      FROM posts p
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN post_comments pc ON p.id = pc.post_id
      GROUP BY p.id, p.user_id, p.user_name, p.user_avatar, p.content, p.image_url, p.location, p.created_at
      ORDER BY p.created_at DESC
      LIMIT ${limit}
    `;

    // Fetch comments for each post
    for (const post of posts) {
      const comments = await sql`
        SELECT 
          id,
          user_id,
          user_name,
          user_avatar,
          content,
          created_at
        FROM post_comments
        WHERE post_id = ${post.id}
        ORDER BY created_at ASC
      `;
      post.comments = comments;
    }

    return Response.json({ posts });
  } catch (error) {
    console.error("Error listing posts:", error);
    return Response.json({ error: "Failed to list posts" }, { status: 500 });
  }
}
