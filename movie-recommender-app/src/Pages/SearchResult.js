import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Components/styles/SearchResultsStyles.css";
import MovieCard from "./Components/MovieCard";
import NavBar from "./Components/NavBar";
import Footer from "./Components/Footer";
import ReactPlayer from "react-player";


function SearchResult() {
    const params = useParams();
    const apiKey = process.env.REACT_APP_TMDB_API_KEY ? `api_key=${process.env.REACT_APP_TMDB_API_KEY}` : "api_key=b97316ed479ee4226afefc88d1792909";
    const inputValue = params.id;
    const [searchedMovie, setSearchedMovie] = useState({});
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    const [castMembers, setCastMembers] = useState([]);
    const [genreList, setGenreList] = useState([]);
    const [currGenre, setCurrGenre] = useState([]);
    const [videoData, setVideoData] = useState(null);
    const [playTrailer, setPlayTrailer] = useState(false);

    const gotCast = (castData) => {
        setCastMembers([]);
        const topCast = castData.slice(0, 5);
        setCastMembers(topCast);
    };

    const gotVideo = (data) => {
        if (data.videos && data.videos.results) {
            const trailer = data.videos.results.find(
                (vid) => vid.name === "Official Trailer"
            );
            setVideoData(trailer || data.videos.results[0]);
        }
    };

    const gotRecommendedData = async (apiData) => {
        if (!apiData.movies || !Array.isArray(apiData.movies)) {
            console.error("Invalid or empty movies array from backend:", apiData);
            return;
        }

        setRecommendedMovies([]);
        const maxMovies = 16;
        const moviePromises = apiData.movies.slice(0, maxMovies).map((movieTitle) =>
            fetch(`https://api.themoviedb.org/3/search/movie?${apiKey}&query=${encodeURIComponent(movieTitle)}`)
                .then((response) => {
                    if (!response.ok) throw new Error(`TMDb API error for ${movieTitle}: ${response.status}`);
                    return response.json();
                })
                .then((data) => {
                    if (data.results && data.results[0]) {
                        return data.results[0];
                    }
                    console.warn(`No TMDb results for ${movieTitle}`);
                    return null;
                })
                .catch((error) => {
                    console.error(`Error fetching TMDb data for ${movieTitle}:`, error);
                    return null;
                })
        );

        const movies = await Promise.all(moviePromises);
        const validMovies = movies.filter((movie) => movie !== null);
        setRecommendedMovies(validMovies);
    };

    useEffect(() => {
        const gotTMDBData = (apiData) => {
            const realMovieData = apiData.results[0];
            if (realMovieData) {
                setCurrGenre(realMovieData.genre_ids || []);
                setSearchedMovie(realMovieData);
                fetch(
                    `https://api.themoviedb.org/3/movie/${realMovieData.id}/credits?${apiKey}`
                ).then((response) =>
                    response.json().then((data) => gotCast(data.cast))
                );
                fetch(
                    `https://api.themoviedb.org/3/movie/${realMovieData.id}?${apiKey}&append_to_response=videos`
                ).then((response) =>
                    response.json().then((data) => gotVideo(data))
                );
            }
        };

        fetch(
            `https://api.themoviedb.org/3/search/movie?${apiKey}&query=${encodeURIComponent(inputValue)}`
        ).then((response) =>
            response.json().then((data) => gotTMDBData(data))
        );

        fetch(`${process.env.REACT_APP_API_URL}/api/similarity/${encodeURIComponent(inputValue)}`)
            .then((response) => {
                if (!response.ok) throw new Error(`Backend API error: ${response.status}`);
                return response.json();
            })
            .then((data) => gotRecommendedData(data))
            .catch((error) => console.error("Error fetching recommendations:", error));

        fetch(`https://api.themoviedb.org/3/genre/movie/list?${apiKey}`)
            .then((response) => response.json())
            .then((data) => setGenreList(data.genres || []))
            .catch((error) => console.error("Error fetching genres:", error));
    }, [inputValue, apiKey]);

    const RenderMovies = () => {
        if (recommendedMovies.length === 0) {
            return <div>No recommended movies available.</div>;
        }
        return recommendedMovies.map((movie) => (
            <MovieCard
                key={`${movie.id}-${movie.original_title}`}
                movie={movie}
            />
        ));
    };

    const RenderTrailer = () => {
        if (!videoData) return null;
        return (
            <div>
                <ReactPlayer
                    url={`https://www.youtube.com/watch?v=${videoData.key}`}
                    playing={true}
                    width="100%"
                    height="100%"
                    controls={true}
                    className="youtube-container"
                />
            </div>
        );
    };

    const displayGenre = () =>
        currGenre.slice(0, 3).map((movieId, ind) => {
            const genre = genreList.find((obj) => obj.id === movieId);
            if (!genre) return null;
            return (
                <span key={movieId}>
                    {genre.name}
                    {ind < 2 && currGenre.length > ind + 1 ? ", " : ""}
                </span>
            );
        });

    const imgLink = "https://image.tmdb.org/t/p/original";
    const backdropPath = "https://image.tmdb.org/t/p/w1280";

    return (
        <div
            style={{
                backgroundImage: searchedMovie.backdrop_path
                    ? `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)), url(${backdropPath}${searchedMovie.backdrop_path})`
                    : "none",
            }}
            className="MainBackGround"
        >
            <NavBar isHome={true} />
            <div className="container trailerContainer">
                {videoData && playTrailer ? <RenderTrailer /> : null}
                <div className="container movie-details">
                    <div className="row">
                        <div className="col-md-6 left-box col-md-push-6">
                            <h1 className="topTitle-Movie">
                                {searchedMovie.title || "Loading..."}
                            </h1>
                            <p className="overviewContent">
                                {searchedMovie.overview || ""}
                            </p>
                            <p>Cast:</p>
                            <div className="casting">
                                {castMembers.map((member) => (
                                    <a
                                        key={`${member.cast_id}-${member.id}`}
                                        href={`https://en.wikipedia.org/wiki/${encodeURIComponent(member.name)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <img
                                            src={
                                                member.profile_path
                                                    ? `${imgLink}${member.profile_path}`
                                                    : ""
                                            }
                                            title={member.name}
                                            alt={member.name}
                                        />
                                    </a>
                                ))}
                            </div>
                            <div>
                                <b>Rating: </b>
                                {searchedMovie.vote_average
                                    ? `${searchedMovie.vote_average}/10`
                                    : "N/A"}{" "}
                                <i className="fa-solid fa-star"></i>
                            </div>
                            <div>
                                <b>Release Date: </b>
                                {searchedMovie.release_date || "N/A"}
                            </div>
                            <div>
                                <b>Genres: </b>
                                {currGenre.length > 0 ? displayGenre() : "N/A"}
                            </div>
                            <div>
                                <button
                                    className="trailer-bttn"
                                    onClick={() => setPlayTrailer(true)}
                                    disabled={!videoData}
                                >
                                    <i className="fa-solid fa-play"></i> Watch Trailer
                                </button>
                            </div>
                        </div>
                        <div className="col-md-6 col-md-pull-6 text-center">
                            <img
                                className="main-img"
                                src={
                                    searchedMovie.poster_path
                                        ? `https://image.tmdb.org/t/p/w500${searchedMovie.poster_path}`
                                        : ""
                                }
                                alt={searchedMovie.title || "Movie"}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={playTrailer ? "DisplayOn" : "DisplayOFF"}>
                <button
                    className="close-bttn"
                    onClick={() => setPlayTrailer(false)}
                >
                    Close Trailer
                </button>
            </div>
            <div className="container-fluid recommendedMovies">
                <h2 className="container RecommendHeading">
                    Recommended Movies
                </h2>
                <div className="container recommendedGrid">
                    <RenderMovies />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default SearchResult;