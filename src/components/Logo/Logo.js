import { Link } from 'react-router-dom';

function Logo() {
  return (
    <Link to="/" className="logo-link flex items-center gap-2">
      {/* Logo Icon */}
      <img 
        src="/images/favicon1.png" 
        alt="Trigo Logo" 
        className="h-10 w-10"  // size like NioBoard
      />

      {/* Text Section */}
      <div className="flex flex-col leading-tight">
        <span className="text-xl font-bold text-white ">TRIGO</span>
        {/* <span className="text-xs text-blue-400 tracking-widest">REACT</span> */}
      </div>
    </Link>
  );
}

export default Logo;
