// components/MovieList.jsx
// Componente responsable únicamente de mostrar la cartelera (SRP)
const MovieList = ({ movies = [] }) => {
  return (
    <div className="movie-list">
      <h2>🎬 Cartelera</h2>
      {movies.length === 0 ? (
        <p className="no-movies">No hay películas disponibles</p>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <h3>{movie.titulo}</h3>
              <p className="movie-id">ID: {movie.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieList;
