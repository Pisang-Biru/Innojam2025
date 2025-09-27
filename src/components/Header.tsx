export default function Header() {
  return (
    <header className="w-full h-16 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo/Brand section */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Your Brand</h1>
          </div>

          {/* Navigation section */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Add navigation items here */}
          </nav>

          {/* Action buttons section */}
          <div className="flex items-center space-x-4">
            {/* Add buttons or other actions here */}
          </div>
        </div>
      </div>
    </header>
  )
}
