import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Practice ID is required" },
        { status: 400 },
      );
    }

    const practices = await sql("SELECT * FROM practices WHERE id = $1", [id]);

    if (practices.length === 0) {
      return Response.json({ error: "Practice not found" }, { status: 404 });
    }

    return Response.json({ practice: practices[0] });
  } catch (error) {
    console.error("Error fetching practice:", error);
    return Response.json(
      { error: "Failed to fetch practice" },
      { status: 500 },
    );
  }
}
