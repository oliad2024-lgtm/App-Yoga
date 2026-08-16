import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const {
      userId,
      videoId,
      videoTitle,
      videoImage,
      videoDuration,
      currentTime,
    } = await request.json();

    if (
      !userId ||
      !videoId ||
      !videoTitle ||
      videoDuration === undefined ||
      currentTime === undefined
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Insert or update video progress
    const result = await sql`
      INSERT INTO video_progress (user_id, video_id, video_title, video_image, video_duration, current_time_seconds, last_watched_at)
      VALUES (${userId}, ${videoId}, ${videoTitle}, ${videoImage || null}, ${videoDuration}, ${currentTime}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, video_id)
      DO UPDATE SET
        current_time_seconds = ${currentTime},
        video_title = ${videoTitle},
        video_image = ${videoImage || null},
        video_duration = ${videoDuration},
        last_watched_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    return Response.json({ success: true, progress: result[0] });
  } catch (error) {
    console.error("Error saving video progress:", error);
    return Response.json(
      { error: "Failed to save video progress" },
      { status: 500 },
    );
  }
}
