export default function SearchBox({ value, onChange }) {
  return (
    <div className="search">
      <label htmlFor="search" className="visually-hidden">
        Search
      </label>
      <input
        id="search"
        type="search"
        placeholder="Search a district, taluka, place or dish (English or मराठी)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
