import { Link } from 'react-router-dom';

function Logo() {
  return (
    <Link to="/dashboard" className="logo-link flex items-center gap-2">
      {/* Logo Icon */}
      <img
        src="/images/haegl.png"
        alt="Trigo Logo"
        style={{ height: '35px', width: '50px' }}
      />

      {/* Text Section */}
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-bold text-white">GetEducate Admin</span>
      </div>
    </Link>
  );
}

export default Logo;
