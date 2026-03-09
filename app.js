const API_KEY = "4fa07907";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const statusText = document.getElementById("statusText");

const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorText = document.getElementById("errorText");
const resultsGrid = document.getElementById("resultsGrid");

function setView(view) {
  emptyState.classList.add("hidden");
  loadingState.classList.add("hidden");
  errorState.classList.add("hidden");
  resultsGrid.classList.add("hidden");

  if (view === "empty") emptyState.classList.remove("hidden");
  if (view === "loading") loadingState.classList.remove("hidden");
  if (view === "error") errorState.classList.remove("hidden");
  if (view === "results") resultsGrid.classList.remove("hidden");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createMovieCard(movie) {
  const title = escapeHtml(movie.Title || "Unknown Title");
  const year = escapeHtml(movie.Year || "N/A");
  const type = escapeHtml(movie.Type || "movie");

  const posterHtml =
    movie.Poster && movie.Poster !== "N/A"
      ? `<img src="${movie.Poster}" alt="${title} poster" loading="lazy" />`
      : `<div class="poster-fallback">Poster bulunamadı</div>`;

  return `
    <article class="movie-card">
      <div class="poster-wrap">
        ${posterHtml}
      </div>
      <div class="movie-body">
        <h3 class="movie-title">${title}</h3>
        <div class="movie-meta">
          <span>${year}</span>
          <span>${type}</span>
        </div>
      </div>
    </article>
  `;
}

async function searchMovies(query) {
  const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Ağ hatası oluştu.");
  }

  const data = await response.json();

  if (data.Response === "False") {
    throw new Error(data.Error || "Sonuç bulunamadı.");
  }

  return data.Search || [];
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();

  if (!query) {
    setView("error");
    errorText.textContent = "Lütfen bir film adı gir.";
    statusText.textContent = "Arama yapılmadı.";
    return;
  }

  setView("loading");
  statusText.textContent = `"${query}" için sonuçlar getiriliyor...`;

  try {
    const movies = await searchMovies(query);

    if (!movies.length) {
      setView("error");
      errorText.textContent = "Hiç sonuç bulunamadı.";
      statusText.textContent = "Sonuç bulunamadı.";
      return;
    }

    resultsGrid.innerHTML = movies.map(createMovieCard).join("");
    setView("results");
    statusText.textContent = `"${query}" için ${movies.length} sonuç listelendi.`;
  } catch (error) {
    setView("error");
    errorText.textContent = error.message;
    statusText.textContent = "Bir hata oluştu.";
  }
});