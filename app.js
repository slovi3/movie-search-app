const API_KEY = "4fa07907";
const BASE_URL = "https://www.omdbapi.com/";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const moviesGrid = document.getElementById("moviesGrid");
const statusBox = document.getElementById("statusBox");
const resultsTitle = document.getElementById("resultsTitle");
const clearBtn = document.getElementById("clearBtn");

function setStatus(message, type = "info") {
  statusBox.textContent = message;
  statusBox.className = `status-box ${type}`;
}

function createSkeletonCards(count = 8) {
  moviesGrid.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "movie-card loading";
    skeleton.innerHTML = `
      <div class="poster-wrap"></div>
      <div class="movie-body">
        <div style="height:18px;background:rgba(255,255,255,0.06);border-radius:8px;margin-bottom:10px;"></div>
        <div style="height:14px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:14px;width:70%;"></div>
        <div style="height:44px;background:rgba(255,255,255,0.06);border-radius:14px;"></div>
      </div>
    `;
    moviesGrid.appendChild(skeleton);
  }
}

function getPosterUrl(poster) {
  if (!poster || poster === "N/A") {
    return "https://via.placeholder.com/600x900/140d11/f7f4ef?text=No+Poster";
  }
  return poster;
}

async function fetchMovieDetails(imdbID) {
  const url = `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function createMovieCard(movie, rating = "N/A") {
  const poster = getPosterUrl(movie.Poster);

  return `
    <article class="movie-card">
      <div class="poster-wrap">
        <img src="${poster}" alt="${movie.Title} poster" loading="lazy" />
        <div class="rating-badge">${rating}</div>
      </div>

      <div class="movie-body">
        <h3 class="movie-title">${movie.Title}</h3>

        <div class="movie-meta">
          <span>${movie.Year}</span>
          <span class="movie-type">${movie.Type}</span>
        </div>

        <a
          class="movie-link"
          href="https://www.imdb.com/title/${movie.imdbID}/"
          target="_blank"
          rel="noopener noreferrer"
        >
          IMDb'de Aç
        </a>
      </div>
    </article>
  `;
}

async function searchMovies(query) {
  if (!query.trim()) {
    setStatus("Lütfen bir film adı gir.", "error");
    moviesGrid.innerHTML = "";
    resultsTitle.textContent = "Popüler Arama Denemeleri";
    return;
  }

  try {
    setStatus(`"${query}" için sonuçlar aranıyor...`, "info");
    resultsTitle.textContent = `"${query}" için sonuçlar`;
    createSkeletonCards();

    const searchUrl = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.Response === "False") {
      moviesGrid.innerHTML = `
        <div class="empty-card">
          Sonuç bulunamadı. Farklı bir film adı dene.
        </div>
      `;
      setStatus("Sonuç bulunamadı.", "error");
      return;
    }

    const movies = data.Search.slice(0, 8);
    const detailedMovies = await Promise.all(
      movies.map(async (movie) => {
        try {
          const details = await fetchMovieDetails(movie.imdbID);
          return {
            ...movie,
            imdbRating: details.imdbRating && details.imdbRating !== "N/A"
              ? details.imdbRating
              : "N/A",
          };
        } catch {
          return {
            ...movie,
            imdbRating: "N/A",
          };
        }
      })
    );

    moviesGrid.innerHTML = detailedMovies
      .map((movie) => createMovieCard(movie, movie.imdbRating))
      .join("");

    setStatus(`${detailedMovies.length} sonuç listelendi.`, "success");
  } catch (error) {
    console.error(error);
    moviesGrid.innerHTML = `
      <div class="empty-card">
        Bir hata oluştu. API key veya bağlantıyı kontrol et.
      </div>
    `;
    setStatus("Bir hata oluştu. API key veya bağlantıyı kontrol et.", "error");
  }
}

function clearResults() {
  searchInput.value = "";
  moviesGrid.innerHTML = "";
  resultsTitle.textContent = "Popüler Arama Denemeleri";
  setStatus("Aramak için bir film adı yaz.", "info");
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchMovies(searchInput.value);
});

clearBtn.addEventListener("click", clearResults);