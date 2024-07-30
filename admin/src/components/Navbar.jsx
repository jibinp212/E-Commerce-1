import logo from "../assets/logo.jpg";
import profileImg from "../assets/profile.png";

const Navbar = () => {
  return (
    <nav className="max_padd_container flexBetween bg-white py-2 ring-slate-900/5">
      <div to="/">
        <img src={logo} width="100" height="50" alt="" />
      </div>
      <div className="uppercase bold-22 text-white bg-pink-800 px-3 rounded-md tracking-widest line-clamp-1 max-xs:bold-18 max-xs:px-1 ">
        Admin Panel
      </div>
      <div>
        <img src={profileImg} alt="" className="h-12 w-12 rounded-full" />
      </div>
    </nav>
  );
};
export default Navbar;
