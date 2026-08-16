import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const minDuration = searchParams.get("minDuration");
    const maxDuration = searchParams.get("maxDuration");
    const sortBy = searchParams.get("sortBy") || "newest";
    const search = searchParams.get("search");

    // Build the query dynamically
    let query = "SELECT * FROM practices WHERE 1=1";
    const params = [];
    let paramCount = 0;

    if (category && category !== "All") {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (level) {
      paramCount++;
      query += ` AND level = $${paramCount}`;
      params.push(level);
    }

    if (minDuration) {
      paramCount++;
      query += ` AND duration_minutes >= $${paramCount}`;
      params.push(parseInt(minDuration));
    }

    if (maxDuration) {
      paramCount++;
      query += ` AND duration_minutes <= $${paramCount}`;
      params.push(parseInt(maxDuration));
    }

    if (search) {
      paramCount++;
      query += ` AND (LOWER(title) LIKE LOWER($${paramCount}) OR LOWER(description) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    // Add sorting
    switch (sortBy) {
      case "duration-asc":
        query += " ORDER BY duration_minutes ASC";
        break;
      case "duration-desc":
        query += " ORDER BY duration_minutes DESC";
        break;
      case "difficulty":
        query +=
          " ORDER BY CASE level WHEN 'Beginner' THEN 1 WHEN 'Intermediate' THEN 2 WHEN 'Advanced' THEN 3 END";
        break;
      case "newest":
      default:
        query += " ORDER BY created_at DESC";
        break;
    }

    const practices = await sql(query, params);

    return Response.json({ practices });
  } catch (error) {
    console.error("Error fetching practices:", error);
    return Response.json(
      { error: "Failed to fetch practices" },
      { status: 500 },
    );
  }
}
