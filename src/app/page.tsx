export default function HomePage() {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-3xl font-bold">Welcome to Thriftee</h2>
      <p className="text-subtext">Buy, sell, and request items in your local community</p>
      <a href="/items" className="inline-block bg-accent text-white px-4 py-2 rounded-xl mt-4">Browse Items</a>
    </div>
  )
}
