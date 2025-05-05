import NavBar from "./Components/NavBar";
import SearchBar from "./Components/SearchBar";
import Footer from "./Components/Footer";
import "./Components/styles/HomeStyles.css";
import MovieCard from "./Components/MovieCard";
import { useEffect, useState } from "react";

const Home = () => {
    const api_key = process.env.REACT_APP_TMDB_API_KEY || 'b97316ed479ee4226afefc88d1792909';
    const [list, setList] = useState([]);
    const [homeGenreList, setHomeGenreList] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [currMovies, setCurrMovies] = useState([]);

    useEffect(() => {
        setCurrMovies([]);
        setSelectedGenres([]);
        setHomeGenreList([]);
        setList([]);

        fetch('/api/movies')
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch movies');
                return response.json();
            })
            .then((data) => {
                setList(data.arr || []);
                console.log('Movies:', data.arr);
            })
            .catch((error) => console.error('Error fetching movies:', error));

        fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${api_key}`)
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch genres');
                return response.json();
            })
            .then((data) => {
                setHomeGenreList(data.genres || []);
                console.log('Genres:', data.genres);
            })
            .catch((error) => console.error('Error fetching genres:', error));
    }, [api_key]);

    useEffect(() => {
        setCurrMovies([]);
        if (selectedGenres.length > 0) {
            fetch(
                `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${api_key}&release_date.lte=2019-12-12&with_genres=${encodeURI(selectedGenres.join(","))}`
            )
                .then((response) => {
                    if (!response.ok) throw new Error('Failed to fetch movies by genre');
                    return response.json();
                })
                .then((data) => setCurrMovies(data.results || []))
                .catch((error) => console.error('Error fetching movies by genre:', error));
        }
    }, [selectedGenres, api_key]);

    const onTagClick = (genreId) => {
        setSelectedGenres((prevGenres) =>
            prevGenres.includes(genreId)
                ? prevGenres.filter((id) => id !== genreId)
                : [...prevGenres, genreId]
        );
    };

    const renderMovies = () =>
        currMovies.map((movie) => {
            if (movie && movie.id && movie.original_title) {
                return <MovieCard key={`${movie.id}-${movie.original_title}`} movie={movie} />;
            }
            return null;
        });

    return (
        <div className="container-fluid">
            <div className="HomePage">
                <NavBar isHome={false} />
                <div className="HomeSearch">
                    <SearchBar movies={list} placeholder="Search for a Movie" />
                </div>
                <h2 className="genreHeader">Get Top Movies Based On Genre</h2>
                <div className="buttonGrid">
                    {homeGenreList.map((genre) => (
                        <div
                            key={genre.id}
                            onClick={() => onTagClick(genre.id)}
                            className={selectedGenres.includes(genre.id) ? "genreTagON" : "genreTagOFF"}
                        >
                            {genre.name}
                            {selectedGenres.includes(genre.id) && <i className="fa fa-times" aria-hidden="true" />}
                        </div>
                    ))}
                </div>
            </div>
            <div className="container-fluid HomeMovies">
                <div className="container HomeMovieGrid">{currMovies.length > 0 ? renderMovies() : null}</div>
            </div>
            <div className="HomeFooter">
                <Footer />
            </div>
        </div>
    );
};

export default Home;