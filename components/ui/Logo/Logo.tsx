const Logo = ({ className = '', ...props }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect width="8" height="8" y='12' x="2" fill="#ed5f4b" />
    <rect width="8" height="8" y='12' x="12" fill="#a7a7a4" />
    <rect width="8" height="8" y='12' x="22" fill="#f9bd5b" />
  </svg>
)

export default Logo
