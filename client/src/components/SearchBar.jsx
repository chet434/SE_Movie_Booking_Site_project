import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="position-relative">
      <FaSearch className="position-absolute text-muted"
        style={{ left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
      <input
        type="text"
        className="form-control ps-5"
        placeholder="Search movies by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
