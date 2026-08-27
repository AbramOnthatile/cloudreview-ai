export function Header({ authenticated, onNavigate, onLogout }: { authenticated: boolean; onNavigate: (path: string) => void; onLogout: () => void }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="CloudReview AI home"><span className="brand-mark">CR</span><span>CloudReview <em>AI</em></span></a>
      <nav className="main-nav" aria-label="Main navigation"><a href="#top">Home</a><a href="#products">Products</a>{authenticated ? <><a href="#favorites">Favorites</a><a href="#profile">Profile</a><button className="nav-button" type="button" onClick={onLogout}>Logout</button></> : <><a href="#login">Login</a><a href="#register">Register</a></>}</nav>
      <button className="header-action" type="button" onClick={() => onNavigate(authenticated ? '#profile' : '#register')}>{authenticated ? 'View profile' : 'Get started'} <span aria-hidden="true">↗</span></button>
    </header>
  )
}