export default function Header() {
  return (
    <header className="w-full h-20 bg-background border-b border-border backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo/Brand section */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">SmartCity</h1>
          </div>

          {/* Navigation section */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Explore
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              About
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Contact
            </a>
          </nav>

          {/* Action buttons section */}
          <div className="flex items-center space-x-4">
            <button className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Sign In
            </button>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
