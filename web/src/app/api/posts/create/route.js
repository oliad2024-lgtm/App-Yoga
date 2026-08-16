import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId, userName, userAvatar, content, imageUrl, location } =
      await request.json();

    if (!userId || !userName || !content) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO posts (user_id, user_name, user_avatar, content, image_url, location)
      VALUES (${userId}, ${userName}, ${userAvatar || null}, ${content}, ${imageUrl || null}, ${location || null})
      RETURNING id, user_id, user_name, user_avatar, content, image_url, location, created_at
    `;

    return Response.json({ post: result[0] });
  } catch (error) {
    console.error("Error creating post:", error);
    return Response.json({ error: "Failed to create post" }, { status: 500 });
  }
}
