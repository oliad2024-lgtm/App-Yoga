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

    // Get all video progress for the user
    const progress = await sql`
      SELECT 
        video_id,
        video_duration,
        last_watched_at
      FROM video_progress
      WHERE user_id = ${userId}
      ORDER BY last_watched_at DESC
    `;

    // Calculate total classes (unique videos)
    const totalClasses = progress.length;

    // Calculate total hours
    let totalSeconds = 0;
    progress.forEach((video) => {
      totalSeconds += video.video_duration || 0;
    });
    const totalHours = (totalSeconds / 3600).toFixed(1);

    // Calculate day streak
    let dayStreak = 0;
    if (progress.length > 0) {
      const sortedDates = progress.map((p) => {
        const date = new Date(p.last_watched_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });

      const uniqueDates = [...new Set(sortedDates)].sort((a, b) => b - a);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTime = today.getTime();

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayTime = yesterday.getTime();

      // Check if most recent activity was today or yesterday
      if (uniqueDates[0] === todayTime || uniqueDates[0] === yesterdayTime) {
        dayStreak = 1;

        // Count consecutive days
        for (let i = 1; i < uniqueDates.length; i++) {
          const expectedTime = uniqueDates[i - 1] - 24 * 60 * 60 * 1000;
          if (uniqueDates[i] === expectedTime) {
            dayStreak++;
          } else {
            break;
          }
        }
      }
    }

    return Response.json({
      dayStreak,
      totalClasses,
      totalHours: parseFloat(totalHours),
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return Response.json(
      { error: "Failed to fetch user stats" },
      { status: 500 },
    );
  }
}
