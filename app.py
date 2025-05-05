import pandas as pd
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
from werkzeug.exceptions import NotFound

# Load movie data
try:
    data = pd.read_csv('main_data.csv')
    print("Successfully loaded main_data.csv")
except Exception as e:
    print(f"Error loading main_data.csv: {e}")
    data = pd.DataFrame({'movie_title': [], 'comb': []})

def create_similarity():
    try:
        cv = CountVectorizer()
        count_matrix = cv.fit_transform(data['comb'])
        similarity = cosine_similarity(count_matrix)
        return data, similarity
    except Exception as e:
        print(f"Error creating similarity matrix: {e}")
        return data, None

def get_all_movies():
    try:
        movies = list(data['movie_title'].str.capitalize())
        print(f"Returning {len(movies)} movies from get_all_movies")
        return movies
    except Exception as e:
        print(f"Error getting movies: {e}")
        return []

def recommend(movie):
    movie = movie.lower()
    try:
        data, similarity = create_similarity()
        if similarity is None:
            print(f"No similarity matrix for {movie}")
            return []
        if movie not in data['movie_title'].unique():
            print(f"Movie not found: {movie}")
            return []
        movie_index = data.loc[data['movie_title'] == movie].index[0]
        lst = list(enumerate(similarity[movie_index]))
        lst = sorted(lst, key=lambda x: x[1], reverse=True)
        lst = lst[1:20]  # Exclude the movie itself, take top 19
        movie_list = [data['movie_title'][i[0]] for i in lst]
        print(f"Recommendations for {movie}: {movie_list}")
        return movie_list
    except Exception as e:
        print(f"Error in recommend for {movie}: {e}")
        return []

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'movie-recommender-app/build'), static_url_path='/')
CORS(app, resources={r"/api/*": {
    "origins": [
        "https://movies-recommendation-1tns.onrender.com",
        "https://movies-recommendation-1-m13t.onrender.com",
        "http://localhost:3000"
    ],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

@app.route('/api/movies', methods=['GET'])
def movies():
    try:
        movies = get_all_movies()
        return jsonify({'arr': movies})
    except Exception as e:
        print(f"Error in /api/movies: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/')
def serve():
    try:
        if not os.path.exists(os.path.join(app.static_folder, 'index.html')):
            print("Static index.html not found")
            return jsonify({'error': 'React build not found. Please run `npm run build` in the movie-recommender-app directory.'}), 500
        return send_from_directory(app.static_folder, 'index.html')
    except NotFound:
        print("NotFound error in serve route")
        return jsonify({'error': 'index.html not found in build directory'}), 404

@app.route('/api/similarity/<name>')
def similarity(name):
    try:
        recommendations = recommend(name)
        response = jsonify({'movies': recommendations})
        print(f"Response for /api/similarity/{name}: {recommendations}")
        return response
    except Exception as e:
        print(f"Error in /api/similarity/{name}: {e}")
        return jsonify({'error': 'Failed to fetch recommendations'}), 500

@app.errorhandler(404)
def not_found(e):
    try:
        if not os.path.exists(os.path.join(app.static_folder, 'index.html')):
            print("Static index.html not found in 404 handler")
            return jsonify({'error': 'React build not found. Please run `npm run build` in the movie-recommender-app directory.'}), 500
        return send_from_directory(app.static_folder, 'index.html')
    except NotFound:
        print("NotFound error in 404 handler")
        return jsonify({'error': 'index.html not found in build directory'}), 404

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"Starting Flask app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)