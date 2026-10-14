import { useEffect, useRef } from "react";
import "./Reveal.css";

function Reveal({ children, className = "" }) {
  const element = useRef(null);

  useEffect(() => {
    const target = element.current;
    if (!target) {
      return;
    }
    if (
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      target.classList.add("is-revealed");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          target.classList.add("is-revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  // Reveals the content once it enters the viewport without changing layout styles.

  return (
    <div ref={element} className={"reveal " + className}>
      {children}
    </div>
  );
}
export default Reveal;
