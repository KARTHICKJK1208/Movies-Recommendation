# Movie Recommendation System

## Project Overview
The Movie Recommendation System is a web-based application designed to provide users with an engaging platform to search for movies, explore detailed information, and receive personalized recommendations. Built using modern web technologies, the application combines a user-friendly interface with robust backend processing to deliver a seamless experience across desktop and mobile devices.

### Key Features
- **Search Functionality**: Users can search a database of over 5,000 movies, accessing details such as cast, genre, release date, and trailers, sourced from The Movie Database (TMDb) API.
- **Personalized Recommendations**: Based on a user’s search, the system suggests similar movies using a content-based filtering algorithm, powered by a local dataset and cosine similarity computations.
- **Genre-Based Filtering**: Users can explore top-rated movies filtered by genre, retrieved dynamically from the TMDb API.
- **Responsive Design**: The application is optimized for use on both desktop and mobile devices, ensuring accessibility and ease of use.

### Technologies Used
- **Frontend**: React.js, a JavaScript library for building interactive user interfaces.
- **Backend**: Flask, a lightweight Python web framework for handling server-side logic.
- **Data Processing**: Pandas and scikit-learn for data management and recommendation algorithms.
- **External API**: TMDb API for real-time movie data retrieval.
- **Python Version**: 3.9.6 or higher.


---

## Installation Instructions
To deploy the Movie Recommendation System on a local machine, follow these steps:

1. **Clone the Repository**:
   - Download or clone the project files from the repository to your local computer.

2. **Set Up the Backend**:
   - Ensure Python 3.9.6 or higher is installed.
   - Open a terminal in the project’s root directory (`movies-recommendations/`).
   - Install the required Python libraries by running:
     ```bash
     pip install flask pandas scikit-learn flask-cors
     ```
   - Start the Flask server:
     ```bash
     python app.py
     ```

3. **Set Up the Frontend**:
   - Open a new terminal and navigate to the `movie-recommender-app/` directory:
     ```bash
     cd movie-recommender-app
     ```
   - Install Node.js dependencies:
     ```bash
     npm install
     ```
   - Build the React application:
     ```bash
     npm run build
     ```

4. **Access the Application**:
   - Open a web browser and navigate to `http://localhost:5000`.
   - The application should load, displaying the homepage with search and genre-filtering options.

5. **Optional Development Mode**:
   - For development or testing, run the React frontend separately:
     ```bash
     npm start
     ```
   - This launches the frontend on `http://localhost:3000`. Note that API calls must be configured to point to `http://localhost:5000` (e.g., by setting a proxy in `package.json`).

---

## System Architecture
The application follows a client-server architecture:
- **Frontend (React.js)**: Handles the user interface, including search, movie details, and recommendation displays.
- **Backend (Flask)**: Manages API requests, processes the local movie dataset, and computes recommendations.
- **External API (TMDb)**: Provides real-time movie data, such as posters, trailers, and genres.
- **Local Dataset**: A CSV file (`main_data.csv`) containing movie titles and attributes for recommendation processing.

This modular design ensures efficient communication between components and scalability for future enhancements.

---

## Recommendation Algorithm
The system generates movie recommendations using a content-based filtering approach:
- **Data Preparation**: For each movie, attributes like genre, title, cast, and director are combined into a single text field.
- **Vectorization**: These attributes are converted into numerical vectors using text processing techniques.
- **Similarity Computation**: Cosine similarity, a mathematical method, calculates how similar movies are based on their vectors.
- **Recommendation**: For a searched movie, the system identifies and ranks movies with the highest similarity scores, presenting them to the user.

This approach ensures accurate and relevant recommendations tailored to user preferences.

---
