import { Link, useLocation } from "react-router-dom";
import Icon from "./Icon.jsx";
import "./Footer.css";

function Footer() {
  const { pathname } = useLocation();
  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    return null;
  }
  return (
    <footer className="site-footer">
      <div>
        <span className="footer-brand">
          <Icon name="bag" />
          ShopKart
        </span>
        <p>A little more you, every day.</p>
      </div>
      <div className="footer-links">
        <Link to="/product">Discover</Link>
        <Link to="/wishlist">Saved finds</Link>
        <Link to="/orders">My orders</Link>
      </div>
      <p className="footer-note">
        Made for your everyday <Icon name="heart" />
      </p>
    </footer>
  );
}
// Displays shared shopping navigation outside authentication pages.
export default Footer;
