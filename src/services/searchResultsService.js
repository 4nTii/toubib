import { API_URL } from "../config/config";

export async function searchResults(searchValue, location, page = 1, limit = 10) {
  try {
    const params = new URLSearchParams();
    if (searchValue) params.set("searchValue", searchValue);
    if (location) params.set("location", location);
    params.set("page", page);
    params.set("limit", limit);

    const response = await fetch(
      `${API_URL}/search/results?${params.toString()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Search results fetch error:", error);
    return { success: false, error: error.message };
  }
}
