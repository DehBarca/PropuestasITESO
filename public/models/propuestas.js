class Propuesta {
  constructor(id = -1, title, year, genre, rating, img) {
    this.id = id;
    this.title = title;
    this.year = year;
    this.genre = genre;
    this.rating = rating;
    this.img = img;
  }

  static fromObject(obj) {
    return new Pelicula(
      obj.id,
      obj.title,
      obj.year,
      obj.genre,
      obj.rating,
      obj.img
    );
  }
  static toObject(pelicula) {
    return {
      id: pelicula.id,
      title: pelicula.title,
      year: pelicula.year,
      genre: pelicula.genre,
      rating: pelicula.rating,
      img: pelicula.img,
    };
  }

  static fromJson(json) {
    const obj = JSON.parse(json);
    return Pelicula.fromObject(obj);
  }

  toHtml = () => {
    const card = document.createElement("div");
    card.classList.add("col-card");
    card.innerHTML = `<div class="col">
          <div class="card movie-card h-100"  style="width: 18rem; min-height: 400px; max-height: 700px;">
            <img
              src=${this.img}
              class="card-img-top"
              alt=${this.title}
            />
            <div class="card-body movie-info">
              <h5 class="card-title movie-title">${this.title}</h5>
              <p class="card-text movie-details">Año: ${this.year} | Género: ${this.genre}</p>
              <p class="card-text movie-rating">Rating: ${this.rating} / 10.0</p>
            </div>
          </div>
        </div>`;

    return card;
  };
}
