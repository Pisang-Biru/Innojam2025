import { useLocation } from '@tanstack/react-router'

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
  }
}

export default function Header() {
  const location = useLocation()
  const currentPath = location.pathname
  const isAdminPage = currentPath.startsWith('/admin/')
  const adminConfig = adminPageConfig[currentPath as keyof typeof adminPageConfig]

  if (isAdminPage && adminConfig) {
    return (
      <header className="w-full h-20 bg-background border-b border-border backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Admin Logo/Brand section */}
            <div className="flex items-center">
              <div className={`w-8 h-8 ${adminConfig.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                <div className="w-5 h-5 text-current">
                  {adminConfig.icon}
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{adminConfig.title}</h1>
                <p className="text-xs text-muted-foreground">{adminConfig.description}</p>
              </div>
            </div>

            {/* Admin Navigation section */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/admin/pay" className={`text-muted-foreground hover:text-primary transition-colors font-medium ${currentPath === '/admin/pay' ? 'text-primary' : ''}`}>
                POS System
              </a>
              <a href="/admin/read-item" className={`text-muted-foreground hover:text-primary transition-colors font-medium ${currentPath === '/admin/read-item' ? 'text-primary' : ''}`}>
                Read Items
              </a>
              <a href="/admin/create-item" className={`text-muted-foreground hover:text-primary transition-colors font-medium ${currentPath === '/admin/create-item' ? 'text-primary' : ''}`}>
                Create Items
              </a>
              <a href="/admin/create-card" className={`text-muted-foreground hover:text-primary transition-colors font-medium ${currentPath === '/admin/create-card' ? 'text-primary' : ''}`}>
                Create Cards
              </a>
            </nav>

            {/* Admin Action buttons section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2 text-sm">
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
    )
  }

  // Default header for non-admin pages
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
            <a href="/account" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              My Account
            </a>
          </nav>

          {/* Action buttons section */}
          <div className="flex items-center space-x-4">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
