import pandas as pd
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
from werkzeug.exceptions import NotFound

# Load movie data
data = pd.read_csv('main_data.csv')

def create_similarity():
    cv = CountVectorizer()
    count_matrix = cv.fit_transform(data['comb'])
    similarity = cosine_similarity(count_matrix)
    return data, similarity

def get_all_movies():
    return list(data['movie_title'].str.capitalize())

def recommend(movie):
    movie = movie.lower()
    try:
        data, similarity = create_similarity()
    except Exception as e:
        print(f"Error creating similarity matrix: {e}")
        return []
    if movie not in data['movie_title'].unique():
        print(f"Movie not found: {movie}")
        return []
    movie_index = data.loc[data['movie_title'] == movie].index[0]
    lst = list(enumerate(similarity[movie_index]))
    lst = sorted(lst, key=lambda x: x[1], reverse=True)
    lst = lst[1:20]  # Exclude the movie itself, take top 19
    movie_list = [data['movie_title'][i[0]] for i in lst]
    return movie_list

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'movie-recommender-app/build'), static_url_path='/')
CORS(app, resources={r"/api/*": {"origins": ["https://stately-baklava-fe2288.netlify.app", "https://movies-recommendation-1-m13t.onrender.com", "http://localhost:3000"]}})

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
            return jsonify({'error': 'React build not found. Please run `npm run build` in the movie-recommender-app directory.'}), 500
        return send_from_directory(app.static_folder, 'index.html')
    except NotFound:
        return jsonify({'error': 'index.html not found in build directory'}), 404

@app.route('/api/similarity/<name>')
def similarity(name):
    try:
        recommendations = recommend(name)
        return jsonify({'movies': recommendations})
    except Exception as e:
        print(f"Error in /api/similarity/{name}: {e}")
        return jsonify({'error': 'Failed to fetch recommendations'}), 500

@app.errorhandler(404)
def not_found(e):
    try:
        if not os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return jsonify({'error': 'React build not found. Please run `npm run build` in the movie-recommender-app directory.'}), 500
        return send_from_directory(app.static_folder, 'index.html')
    except NotFound:
        return jsonify({'error': 'index.html not found in build directory'}), 404

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)