


class PeliculaService {
  constructor() {
    this._baseUrl = "/api/pelicula";
  }

  getAll = async (page = null, limit = 4) => {
    const uri = this._baseUrl + (page ? `?pagina=${page}&limite=${limit}` : "");

    try {

      const response = await fetch(uri, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(
          `La solicitud GET falló con el estado ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener los productos:", error);
      throw error; // Re-lanza el error para que el llamador lo maneje
    }
  };
}