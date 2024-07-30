import { NavLink } from "react-router-dom"
import { BsPersonStanding } from "react-icons/bs";
import { BsPersonStandingDress } from "react-icons/bs";
import { FaBaby } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";

const Navbar = ({containerStyles}) => {
  return (
     <nav  className={`${containerStyles}`}> 
     <NavLink to={'/'}  className={({isActive})=> isActive ? "active_link" : ""}> <div className="flexCenter gap-x-1"> <AiFillHome />     Home </div></NavLink>
     <NavLink to={'/mens'}  className={({isActive})=> isActive ? "active_link" : ""}> <div className="flexCenter gap-x-1">  <BsPersonStanding /> Mens</div></NavLink>
     <NavLink to={'/womens'}  className={({isActive})=> isActive ? "active_link" : ""}> <div className="flexCenter gap-x-1"> <BsPersonStandingDress /> Womens </div></NavLink>
     <NavLink to={'/kids'}  className={({isActive})=> isActive ? "active_link" : ""}> <div className="flexCenter gap-x-1"> <FaBaby /> Kids</div></NavLink>
     </nav>
  )
}

export default Navbar
