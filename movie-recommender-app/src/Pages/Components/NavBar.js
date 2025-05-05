import { Link } from "react-router-dom";
import "./styles/NavBarStyles.css";
import Logo from "./images/Logo2.png";

const NavBar = ({ isHome }) => {
    return (
        <div className="container header">
            <Link to="/">
                <img src={Logo} className="logo" alt="EngageFlix Logo" />
            </Link>
            {isHome ? (
                <Link to="/" className="header-btn1 bouncy">
                    <i className="fas fa-home"></i> Home
                </Link>
            ) : null}
        </div>
    );
};

export default NavBar;