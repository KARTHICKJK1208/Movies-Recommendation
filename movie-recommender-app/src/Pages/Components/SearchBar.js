import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/SearchBarStyles.css";

function SearchBar({ movies, placeholder }) {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState("");
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [notFound, setNotFound] = useState(false);

    const handleChange = (event) => {
        const wordEntered = event.target.value.trim();
        setInputValue(wordEntered);
        setNotFound(false);

        if (wordEntered.length === 0) {
            setFilteredMovies([]);
            return;
        }

        const newFilter = movies.filter((value) =>
            value.toLowerCase().includes(wordEntered.toLowerCase())
        );
        setFilteredMovies(newFilter);
    };

    const buttonSubmit = () => {
        if (!inputValue) {
            setNotFound(true);
            return;
        }

        const matchedMovie = movies.find(
            (movie) => movie.toLowerCase() === inputValue.toLowerCase()
        );

        if (matchedMovie) {
            navigate(`/search/${matchedMovie}`);
        } else {
            setNotFound(true);
        }
    };

    return (
        <div className="SearchBody">
            <div className="CompleteBar">
                <div className="BAR">
                    <input
                        placeholder={placeholder}
                        className="searchingbar"
                        type="text"
                        title="Search"
                        value={inputValue}
                        onChange={handleChange}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                buttonSubmit();
                            }
                        }}
                    />
                    <button className="search-button" onClick={buttonSubmit}>
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>
            {notFound && (
                <div className="NotFound">
                    Sorry! The Movie You Searched for is not present in our database
                </div>
            )}
            {filteredMovies.length > 0 && (
                <div className="searchList">
                    {filteredMovies.slice(0, 10).map((movie) => (
                        <div
                            key={movie}
                            className="searchItem"
                            onClick={() => navigate(`/search/${movie}`)}
                        >
                            {movie}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchBar;