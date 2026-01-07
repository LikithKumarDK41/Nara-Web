import api from "@/lib/api"; // your axios instance

function parseAxiosError(err: any, fallback: string): string {
    return err?.response?.data?.message || err?.message || fallback;
}

/* ================================
   Nearby Monuments
================================ */
export async function apiGetNearbyMonuments(params: {
  lat: number;
  lng: number;
  radius?: number;
}): Promise<any> {
  const { lat, lng, radius = 1000 } = params;

  try {
    const { data } = await api.get("/v1/nearbymonument", {
      params: { lat, lng, radius },
    });

    return data;
  } catch (err: any) {
    throw new Error(
      parseAxiosError(err, "Failed to fetch nearby monuments")
    );
  }
}

/* ================================
   Nearby Attractions
================================ */
export async function apiGetNearbyAttractions(params: {
  lat: number;
  lng: number;
  monumentId: string;
  radius?: number;
}): Promise<any> {
  const { lat, lng, monumentId, radius = 1000 } = params;

  try {
    const { data } = await api.get("/v1/nearbyattraction", {
      params: {
        lat,
        lng,
        radius,
        monument: monumentId,
      },
    });

    return data;
  } catch (err: any) {
    throw new Error(
      parseAxiosError(err, "Failed to fetch nearby attractions")
    );
  }
}


export async function apiGetNearbyAttractionCategories(params:{
  lat:number;
  lng:number;
  monumentId:string;
  radius?:number;
}) {
  const { lat, lng, monumentId, radius = 1000 } = params;

  try {
    const { data } = await api.get("/v1/nearbyattractioncategory", {
      params:{ lat, lng, radius, monument: monumentId },
    });
    return data;
  } catch (err:any) {
    throw new Error(parseAxiosError(err,"Failed to fetch categories"));
  }
}

/* ================================
   Nearby Attractions By Category
================================ */
export async function apiGetNearbyAttractionsByCategory(params: {
  lat: number;
  lng: number;
  radius?: number;
  category: string;
}): Promise<any> {

  const { lat, lng, radius = 1000, category } = params;

  try {
    const { data } = await api.get("/v1/nearbyattraction", {
      params: {
        lat,
        lng,
        radius,
        category,
      },
    });

    // ← component expects array inside attractions
    return data;
  } catch (err: any) {
    throw new Error(
      parseAxiosError(err, "Failed to fetch nearby attractions by category")
    );
  }
}
