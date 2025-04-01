export default function Navbar() {
    return (
      <header className="w-full bg-primary text-white flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold">Thrifty</h1>
        <div className="space-x-4">
          <a href="/items" className="hover:text-accent">Browse</a>
          <a href="/items/new" className="hover:text-accent">Post</a>
          <a href="/profile" className="hover:text-accent">Profile</a>
        </div>
      </header>
    )
  }
  