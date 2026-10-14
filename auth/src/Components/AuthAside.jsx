import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

function AuthAside({ mode = "login" }) {
  let firstLine = "The good stuff.";
  let secondLine = "Right where you left it.";
  let description =
    "Your saved favorites, everyday essentials, and next great find — together again.";
  let bubble = "Welcome back to your favorites.";

  if (mode === "signup") {
    firstLine = "Make room";
    secondLine = "for the good stuff.";
    description =
      "A fresh account. A world of possibilities. Find what makes your everyday feel more like you.";
    bubble = "Your next favorite starts here.";
  }

  return (
    <aside className="auth-story">
      <Link className="shop-brand auth-brand" to="/login">
        <span className="brand-mark">
          <Icon name="bag" />
        </span>
        <span>
          ShopKart<small>EVERYDAY, ELEVATED</small>
        </span>
      </Link>
      <div className="auth-story-copy">
        <span className="eyebrow">
          <Icon name="sparkles" />A LITTLE MORE YOU
        </span>
        <h2>
          {firstLine}
          <br />
          <span>{secondLine}</span>
        </h2>
        <p>{description}</p>
        <div className="auth-illustration" aria-hidden="true">
          <div className="auth-orbit" />
          <span className="auth-spark auth-spark-one">✦</span>
          <span className="auth-spark auth-spark-two">✧</span>
          <div className="auth-product-photo">
            <img src="/products/red-and-black-high-top-sneakers.webp" alt="" />
          </div>
          <div className="auth-secondary-photo">
            <img src="/products/headphones-photo.jpg" alt="" />
          </div>
          <span className="auth-love">
            <Icon name="heart" />
          </span>
          <span className="auth-bubble">{bubble}</span>
        </div>
      </div>
      <p className="auth-story-foot">
        <Icon name="bag" />A world of finds. One simple account.
      </p>
    </aside>
  );
}
// Displays the shared visual panel for login and signup.
export default AuthAside;
