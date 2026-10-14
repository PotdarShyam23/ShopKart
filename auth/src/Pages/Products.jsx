import Reveal from "../Components/Reveal.jsx";
import Icon from "../Components/Icon.jsx";
import "./Products.css";
import { useState, useEffect } from "react";
import api from "../Services/api.js";
import Navbar from "../Components/Navbar.jsx";
import { Link } from "react-router-dom";
import ProductCard from "../Components/ProductCart.jsx";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/product", {
          params: {
            search: search || undefined,
            category: category || undefined,
          },
        });
        console.log("Backend response:", response.data);
        // axios has a data response -> data -> products
        setProducts(response.data.products);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to fetch data ");
      } finally {
        setLoading(false);
      }
    }
    // Loads products using the current search and category filters.
    fetchProducts();
  }, [search, category]);
  return (
    <div className="catalogue-page">
      <Navbar />
      <main className="catalogue-shell">
        <section className="catalogue-hero">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow">
              <Icon name="sparkles" />
              THE EVERYDAY EDIT
            </span>
            <h1>
              Everyday finds.
              <br />
              <span>Extraordinary vibes.</span>
            </h1>
            <p>
              From your workspace to your wardrobe. Find the things that make
              your everyday a little more you.
            </p>
            <a className="button-link" href="#collection">
              Explore the collection <Icon name="arrow" />
            </a>
            <div className="hero-tags">
              <span>
                <Icon name="grid" />
                One place. More possibilities.
              </span>
              <span>
                <Icon name="heart" />
                Find it. Love it.
              </span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-photo hero-laptop">
              <img src="/products/macbook-pro-14-inch.webp" alt="" />
            </div>
            <div className="hero-photo hero-shoe">
              <img
                src="/products/red-and-black-high-top-sneakers.webp"
                alt=""
              />
            </div>
            <div className="hero-photo hero-headphones">
              <img src="/products/headphones-photo.jpg" alt="" />
            </div>
            <span className="hero-floating-tag">
              <Icon name="sparkles" />A little upgrade
            </span>
            <span className="hero-spark hero-spark-one">✦</span>
            <span className="hero-spark hero-spark-two">✦</span>
          </div>
        </section>
        <Reveal className="category-discovery">
          <div className="discovery-heading">
            <p className="eyebrow">WHAT’S YOUR VIBE?</p>
            <h2>
              A little of everything.
              <br />A lot to love.
            </h2>
            <p>Pick a world. Find your thing.</p>
          </div>
          <div className="discovery-grid">
            {[
              {
                category: "Electronics",
                label: "Tech that clicks",
                image: "/products/headphones-photo.jpg",
                icon: "grid",
                className: "discovery-tech",
              },
              {
                category: "Fashion",
                label: "Wear your mood",
                image: "/products/red-and-black-high-top-sneakers.webp",
                icon: "heart",
                className: "discovery-fashion",
              },
              {
                category: "Home",
                label: "Make yourself at home",
                image: "/products/colombo-accent-sofa.webp",
                icon: "home",
                className: "discovery-home",
              },
              {
                category: "Books",
                label: "Turn a new page",
                image: "/products/books-photo.jpg",
                icon: "sparkles",
                className: "discovery-books",
              },
            ].map((item) => (
              <button
                className={"discovery-card " + item.className}
                type="button"
                key={item.category}
                onClick={() => {
                  setCategory(item.category);
                  document.getElementById("collection")?.scrollIntoView();
                }}
              >
                <img src={item.image} alt="" loading="lazy" />
                <span className="discovery-card-copy">
                  <span>
                    <Icon name={item.icon} />
                    {item.category}
                  </span>
                  <strong>{item.label}</strong>
                </span>
                <span className="discovery-arrow">
                  <Icon name="arrow" />
                </span>
              </button>
            ))}
          </div>
        </Reveal>
        <section
          className="collection-section"
          id="collection"
          aria-labelledby="collection-heading"
        >
          <header className="collection-heading">
            <div>
              <p className="eyebrow">PICK YOUR NEXT FAVORITE</p>
              <h2 id="collection-heading">
                The collection
                <span className="collection-count">{products.length}</span>
              </h2>
            </div>
            <Link className="subtle-link" to="/wishlist">
              Your saved finds <Icon name="heart" />
            </Link>
          </header>
          <div className="catalogue-toolbar">
            <div className="search-field">
              <Icon name="search" />
              <input
                aria-label="Search products"
                type="search"
                placeholder="Search your next favorite…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="category-field">
              <Icon name="filter" />
              <select
                aria-label="Filter by category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">All categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Books">Books</option>
                <option value="Home">Home & living</option>
              </select>
            </div>
          </div>
          <div className="category-chips" aria-label="Product categories">
            {["", "Electronics", "Fashion", "Books", "Home"].map((item) => (
              <button
                type="button"
                className="category-chip"
                aria-pressed={category === item}
                key={item || "all"}
                onClick={() => setCategory(item)}
              >
                {item || "All finds"}
              </button>
            ))}
          </div>
          {loading && (
            <div
              className="catalogue-loading"
              role="status"
              aria-label="Loading products"
            >
              <span className="sr-only">Finding your next favorites…</span>
              <div className="skeleton-grid" aria-hidden="true">
                {Array.from({ length: 6 }, (_, index) => (
                  <div className="skeleton-card" key={index}>
                    <div className="skeleton-image" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-short" />
                    <div className="skeleton-button" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && (
            <div className="catalogue-state state-error" role="alert">
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && products.length === 0 && (
            <div className="catalogue-state">
              <Icon name="search" />
              <h3>No finds this time</h3>
              <p>Try another search or explore a different category.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
          {!loading && !error && (
            <div className="product-grid">
              {products.map((product) => (
                <Reveal key={product._id}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
// Displays the searchable product collection.
export default Products;
