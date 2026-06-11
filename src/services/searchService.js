import { API_URL } from "../config/config";

const MIN_SEARCH_LENGTH = 3;

async function fetchApi(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${API_URL}${endpoint}?${queryString}` : `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return { success: false, error: "Erreur lors de la recherche" };
    }

    const data = await response.json();
    return { success: true, data: data.data || {} };
  } catch (error) {
    console.error("API error:", error);
    return { success: false, error: "Erreur de connexion" };
  }
}

export async function search(value) {
  if (value.length < MIN_SEARCH_LENGTH) {
    return { success: true, data: { doctors: [], businessSite: [], specialities: [] } };
  }
  return fetchApi("/search", { value });
}

export async function searchGeo(value) {
  if (value.length < MIN_SEARCH_LENGTH) {
    return { success: true, data: { regions: [], villes: [] } };
  }

  const result = await fetchApi("/searchgeo", { value });
  if (result.success) {
    return { success: true, data: { regions: result.data.regions || [], villes: result.data.villes || [] } };
  }
  return result;
}

export async function searchResults(searchValue, location, page = 1, limit = 10) {
  try {
    const params = new URLSearchParams();
    if (searchValue) params.set("searchValue", searchValue);
    if (location) params.set("location", location);
    params.set("page", page);
    params.set("limit", limit);

    const response = await fetch(`${API_URL}/search/results?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Search results fetch error:", error);
    return { success: false, error: error.message };
  }
}
