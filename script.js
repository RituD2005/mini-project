// =======================
// TMDB API SETUP
// =======================

const apiKey = "7cada1bc35d7234ffd9cfdc59a01f791";
const baseUrl = "https://api.themoviedb.org/3";

let currentPage = 1;
let totalPages = 1;

// =======================
// ELEMENTS
// =======================

const movieInput = document.getElementById("movie-input");
const searchButton = document.getElementById("search-btn");

const genreFilter = document.getElementById("genre-filter");
const yearFilter = document.getElementById("year-filter");
const ratingFilter = document.getElementById("rating-filter");
const languageFilter = document.getElementById("language-filter");

const recommendationsDiv = document.getElementById("recommendations");

const loadingSpinner = document.getElementById("loading-spinner");

const prevButton = document.getElementById("prev-btn");
const nextButton = document.getElementById("next-btn");

// =======================
// LOADING
// =======================

function showLoading() {
    loadingSpinner.style.display = "block";
}

function hideLoading() {
    loadingSpinner.style.display = "none";
}

// =======================
// LOAD GENRES
// =======================

async function loadGenres() {

    try {

        const response = await fetch(
            `${baseUrl}/genre/movie/list?api_key=${apiKey}&language=en-US`
        );

        const data = await response.json();

        genreFilter.innerHTML =
            `<option value="">All Genres</option>`;

        data.genres.forEach((genre) => {

            const option = document.createElement("option");

            option.value = genre.id;

            option.textContent = genre.name;

            genreFilter.appendChild(option);

        });

    }

    catch (error) {

        console.log(error);

    }

}





// =======================
// FETCH POPULAR MOVIES
// =======================

async function fetchPopularMovies() {

    showLoading();

    try {

        let url = `${baseUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=${currentPage}`;

        const response = await fetch(url);

        const data = await response.json();

        totalPages = data.total_pages;

        displayMovies(data.results);

    }

    catch(error){

        console.log(error);

        recommendationsDiv.innerHTML =
        "<h2>Unable to load movies.</h2>";

    }

    hideLoading();

}

// =======================
// SEARCH MOVIES
// =======================

async function searchMovies(){

    showLoading();

    try{

        const query = movieInput.value.trim();

        const genre = genreFilter.value;

        const year = yearFilter.value;

        const rating = ratingFilter.value;

        const language = languageFilter.value || "en-US";

        let url;

        if(query){

            url = `${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=${language}&page=${currentPage}`;

        }

        else{

            url = `${baseUrl}/discover/movie?api_key=${apiKey}&language=${language}&page=${currentPage}`;

        }

        if(genre){

            url += `&with_genres=${genre}`;

        }

        if(year){

            url += `&primary_release_year=${year}`;

        }

        if(rating){

            url += `&vote_average.gte=${rating}`;

        }

        const response = await fetch(url);

        const data = await response.json();

        totalPages = data.total_pages;

        displayMovies(data.results);

    }

    catch(error){

        console.log(error);

        recommendationsDiv.innerHTML =
        "<h2>No Movies Found</h2>";

    }

    hideLoading();

}








// =======================
// DISPLAY MOVIES
// =======================

function displayMovies(movies){

    recommendationsDiv.innerHTML = "";

    if(!movies || movies.length===0){

        recommendationsDiv.innerHTML =
        "<h2 style='text-align:center;'>No Movies Found 😢</h2>";

        return;

    }

    movies.forEach(movie=>{

        const card=document.createElement("div");

        card.classList.add("movie-card");

        const poster=movie.poster_path
        ?`https://image.tmdb.org/t/p/w500${movie.poster_path}`
        :"https://via.placeholder.com/500x750?text=No+Image";

        card.innerHTML=`

        <img src="${poster}" alt="${movie.title}">

        <h3>${movie.title}</h3>

        <p class="rating">⭐ ${movie.vote_average}</p>

        <button onclick="movieDetails(${movie.id})">
            View Details
        </button>

        <button onclick="playTrailer(${movie.id})">
            ▶ Trailer
        </button>

        <button onclick="openMovie(${movie.id})">
            🎬 View on TMDB
        </button>

        `;

        recommendationsDiv.appendChild(card);

    });

    prevButton.style.display =
    currentPage>1 ? "inline-block":"none";

    nextButton.style.display =
    currentPage<totalPages ? "inline-block":"none";

}

// =======================
// MOVIE DETAILS
// =======================

async function movieDetails(id){

    try{

        const response=await fetch(
        `${baseUrl}/movie/${id}?api_key=${apiKey}&language=en-US`
        );

        const movie=await response.json();

        document.getElementById("movie-details-content").innerHTML=`

        <h2>${movie.title}</h2>

        <img
        class="movie-poster"
        src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
        >

        <p><b>Release :</b> ${movie.release_date}</p>

        <p><b>Rating :</b> ⭐ ${movie.vote_average}</p>

        <p>${movie.overview}</p>

        `;

        document.getElementById("movie-details-modal")
        .style.display="block";

    }

    catch(error){

        console.log(error);

    }

}

function closeMovieDetails(){

document.getElementById("movie-details-modal")
.style.display="none";

}





// =======================
// PLAY TRAILER
// =======================

async function playTrailer(id){

    try{

        const response = await fetch(
        `${baseUrl}/movie/${id}/videos?api_key=${apiKey}`
        );

        const data = await response.json();

        const trailer = data.results.find(video =>
            video.site === "YouTube" &&
            video.type === "Trailer"
        );

        if(trailer){

            document.getElementById("movie-trailer").innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/${trailer.key}"
                    frameborder="0"
                    allowfullscreen>
                </iframe>
            `;

            document.getElementById("trailer-modal").style.display = "block";

        }

        else{

            alert("Trailer not available.");

        }

    }

    catch(error){

        console.log(error);

    }

}

function closeTrailer(){

    document.getElementById("trailer-modal").style.display = "none";

    document.getElementById("movie-trailer").innerHTML = "";

}

function openMovie(movieId) {
    window.open(
        `https://www.themoviedb.org/movie/${movieId}`,
        "_blank"
    );
}

// =======================
// EVENTS
// =======================

searchButton.addEventListener("click", () => {

    currentPage = 1;

    searchMovies();

});

movieInput.addEventListener("keypress", e => {

    if(e.key === "Enter"){

        currentPage = 1;

        searchMovies();

    }

});

genreFilter.addEventListener("change", () => {

    currentPage = 1;

    searchMovies();

});

yearFilter.addEventListener("change", () => {

    currentPage = 1;

    searchMovies();

});

ratingFilter.addEventListener("change", () => {

    currentPage = 1;

    searchMovies();

});

languageFilter.addEventListener("change", () => {

    currentPage = 1;

    searchMovies();

});

// =======================
// PAGINATION
// =======================

prevButton.addEventListener("click", () => {

    if(currentPage > 1){

        currentPage--;

        searchMovies();

    }

});

nextButton.addEventListener("click", () => {

    if(currentPage < totalPages){

        currentPage++;

        searchMovies();

    }

});

// =======================
// START WEBSITE
// =======================

loadGenres();

fetchPopularMovies();