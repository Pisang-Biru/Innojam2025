import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const scrollToSection = (sectionId: string) => {
    const scrollWithOffset = () => {
      const element = document.getElementById(sectionId)
      if (element) {
        const headerHeight = 64 // h-16 = 64px
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerHeight
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }

    if (location.pathname === '/') {
      // Already on home page, just scroll with offset
      scrollWithOffset()
    } else {
      // Navigate to home page first, then scroll with offset
      navigate({ to: '/' }).then(() => {
        setTimeout(scrollWithOffset, 100)
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">PS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">Pak Samat</span>
                <span className="text-sm text-gray-600 -mt-1">Homestay</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200 cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200 cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('rooms')}
              className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200 cursor-pointer"
            >
              Rooms
            </button>
            <button 
              onClick={() => scrollToSection('facilities')}
              className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200 cursor-pointer"
            >
              Facilities
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200 cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* CTA Button & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/booking" 
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm"
            >
              Book Now
            </Link>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  scrollToSection('home');
                  setIsMenuOpen(false);
                }}
              >
                Home
              </button>
              <button
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  scrollToSection('about');
                  setIsMenuOpen(false);
                }}
              >
                About
              </button>
              <button
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  scrollToSection('rooms');
                  setIsMenuOpen(false);
                }}
              >
                Rooms
              </button>
              <button
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  scrollToSection('facilities');
                  setIsMenuOpen(false);
                }}
              >
                Facilities
              </button>
              <button
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  scrollToSection('contact');
                  setIsMenuOpen(false);
                }}
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
