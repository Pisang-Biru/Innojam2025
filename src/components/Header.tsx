import { useLocation } from '@tanstack/react-router'
import { useState } from 'react'

// Admin page configurations
const adminPageConfig = {
  '/admin/pay': {
    icon: (
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
      </svg>
    ),
    title: 'Point of Sale System',
    description: 'Scan NFC cards to add items to cart and process payments',
    tags: ['Admin', 'NFC Payment Terminal'],
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    tagColor: 'bg-green-100 text-green-700'
  },
  '/admin/read-item': {
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'NFC Item Reader',
    description: 'Scan and read item data stored on NFC cards',
    tags: ['Admin', 'NFC Scanner Tool'],
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    tagColor: 'bg-blue-100 text-blue-700'
  },
  '/admin/create-item': {
    icon: (
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    title: 'Item Creation Tool',
    description: 'Create new items and write them as JSON data to NFC cards',
    tags: ['Admin', 'NFC Writer Tool'],
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    tagColor: 'bg-purple-100 text-purple-700'
  },
  '/admin/create-card': {
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    title: 'Private Key Generator',
    description: 'Generate secure private keys and store them on NFC cards',
    tags: ['Admin', 'Cryptographic Key Management', '🔒 Secure'],
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
    tagColor: 'bg-amber-100 text-amber-700'
  },
  '/admin/transaction': {
    icon: (
      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: 'Transaction History',
    description: 'View all payment transactions and blockchain activity',
    tags: ['Admin', 'Blockchain Explorer', '📊 Analytics'],
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-600',
    tagColor: 'bg-indigo-100 text-indigo-700'
  }
}

export default function Header() {
  const location = useLocation()
  const currentPath = location.pathname
  const isAdminPage = currentPath.startsWith('/admin/')
  const adminConfig = adminPageConfig[currentPath as keyof typeof adminPageConfig]
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Navigation items for different sections
  const mainNavItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/preferences', label: 'Find Spots', icon: '🎯' },
    { href: '/account', label: 'My Account', icon: '👤' },
  ]

  const adminNavItems = [
    { href: '/admin/pay', label: 'POS System', icon: '💳' },
    { href: '/admin/read-item', label: 'Read Items', icon: '📖' },
    { href: '/admin/create-item', label: 'Create Items', icon: '➕' },
    { href: '/admin/create-card', label: 'Create Cards', icon: '🔑' },
    { href: '/admin/transaction', label: 'Transactions', icon: '📊' },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  if (isAdminPage && adminConfig) {
    return (
      <>
        <header className="w-full h-20 bg-background border-b border-border backdrop-blur-sm relative z-50">
          <div className="max-w-7xl mx-auto px-6 h-full">
            <div className="flex items-center justify-between h-full">
              {/* Admin Logo/Brand section */}
              <div className="flex items-center">
                <div className={`w-8 h-8 ${adminConfig.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                  <div className="w-5 h-5 text-current">
                    {adminConfig.icon}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-foreground">{adminConfig.title}</h1>
                  <p className="text-xs text-muted-foreground">{adminConfig.description}</p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-lg font-bold text-foreground">Admin</h1>
                </div>
              </div>

              {/* Desktop Admin Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                {adminNavItems.map((item) => (
                  <a 
                    key={item.href}
                    href={item.href} 
                    className={`text-muted-foreground hover:text-primary transition-colors font-medium ${currentPath === item.href ? 'text-primary' : ''}`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Mobile menu button and Admin Actions */}
              <div className="flex items-center space-x-4">
                {/* Mobile hamburger menu button */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>

                {/* Admin tags - hidden on small screens */}
                <div className="hidden lg:flex items-center gap-2 text-sm">
                  {adminConfig.tags.map((tag, index) => (
                    <span key={tag}>
                      {index === 0 ? (
                        <span className={`px-2 py-1 ${adminConfig.tagColor} rounded-md font-medium text-xs`}>{tag}</span>
                      ) : tag === '🔒 Secure' ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md font-medium text-xs">{tag}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{tag}</span>
                      )}
                    </span>
                  ))}
                </div>
                
                <a href="/" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 text-sm">
                  Exit Admin
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Sidebar for Admin */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeMobileMenu}
            />
            
            {/* Sidebar */}
            <div className="fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50 md:hidden transform transition-transform duration-300 ease-in-out">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 ${adminConfig.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                      <div className="w-5 h-5 text-current">
                        {adminConfig.icon}
                      </div>
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Admin Navigation Links */}
                <nav className="space-y-2">
                  {adminNavItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        currentPath === item.href 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </a>
                  ))}
                </nav>

                {/* Divider */}
                <div className="border-t border-border my-6" />

                {/* Main Navigation */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Main Navigation</h3>
                  {mainNavItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </>
    )
  }

  // Default header for non-admin pages
  return (
    <>
      <header className="w-full h-20 bg-background border-b border-border backdrop-blur-sm relative z-50">
        <div className="max-w-7xl mx-auto px-6 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo/Brand section */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">SmartCity</h1>
            </div>

            {/* Desktop Navigation section */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className={`text-muted-foreground hover:text-primary transition-colors font-medium ${currentPath === '/' ? 'text-primary' : ''}`}>
                Home
              </a>
              <a href="/preferences" className={`text-muted-foreground hover:text-primary transition-colors font-medium ${currentPath === '/preferences' ? 'text-primary' : ''}`}>
                Find Spots
              </a>
              <a href="/account" className={`text-muted-foreground hover:text-primary transition-colors font-medium ${currentPath === '/account' ? 'text-primary' : ''}`}>
                My Account
              </a>
            </nav>

            {/* Action buttons and mobile menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile hamburger menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Get Started button - hidden on small screens */}
              <a 
                href="/preferences"
                className="hidden sm:inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sidebar for Main App */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                    <span className="text-primary-foreground font-bold text-lg">S</span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground">SmartCity</h2>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Main Navigation Links */}
              <nav className="space-y-2 mb-8">
                {mainNavItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentPath === item.href 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </a>
                ))}
              </nav>

              {/* Get Started Button */}
              <a 
                href="/preferences"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg"
              >
                <span>Get Started</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* Divider */}
              <div className="border-t border-border my-6" />

              {/* Admin Access */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Admin Access</h3>
                <a
                  href="/admin/pay"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <span className="text-lg">⚙️</span>
                  <span className="font-medium">Admin Panel</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
