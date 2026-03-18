export default function SearchBar() {
  return (
    <div className="mb-8">
      <input
        type="text"
        placeholder="Enter city name..."
        className="w-full p-4 rounded-xl border border-stone-200 bg-white shadow-sm"
      />
    </div>
  );
}
