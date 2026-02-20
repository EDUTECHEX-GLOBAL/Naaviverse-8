import React, { Fragment, useRef, useEffect, useState } from "react";

const testimonials = [
  {
    name: "Ananya R",
    role: "Engineering Aspirant",
    text: "Naavi helped me choose the right stream and build a clear roadmap for IIT preparation.",
  },
  {
    name: "Rahul K",
    role: "Student",
    text: "The career recommendations were accurate and saved months of confusion.",
  },
  {
    name: "Sneha P",
    role: "Career Explorer",
    text: "I finally understand what to study and where to apply. Amazing platform.",
  },
  {
    name: "Priya M",
    role: "Engineering Aspirant",
    text: "The roadmap feature made my preparation simple and structured.",
  },
  {
    name: "Arjun T",
    role: "Student",
    text: "Naavi gave me clarity and confidence for my future career decisions.",
  },
];

const TestimonialThree = () => {
  const sliderRef = useRef(null);
  const containerRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
const isDown = useRef(false);
const startX = useRef(0);
const scrollLeft = useRef(0);
const handleMouseDown = (e) => {
  isDown.current = true;
  startX.current = e.pageX - sliderRef.current.offsetLeft;
  scrollLeft.current = sliderRef.current.scrollLeft;
};

const handleMouseLeave = () => {
  isDown.current = false;
};

const handleMouseUp = () => {
  isDown.current = false;
};

const handleMouseMove = (e) => {
  if (!isDown.current) return;
  e.preventDefault();
  const x = e.pageX - sliderRef.current.offsetLeft;
  const walk = (x - startX.current) * 1.5;
  sliderRef.current.scrollLeft = scrollLeft.current - walk;
};

  // ⭐ yellow stars
  const renderStars = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ color: "#FFD700" }}>★</span>
    ));

  // 👁 detect section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // 🔁 auto scroll when visible
  useEffect(() => {
    if (!isVisible) return;

    const slider = sliderRef.current;
    if (!slider) return;

    const interval = setInterval(() => {
      if (!isHovering) {
        slider.scrollLeft += 1.5;

        // infinite loop
        if (slider.scrollLeft >= slider.scrollWidth / 2) {
          slider.scrollLeft = 0;
        }
      }
    }, 16);

    return () => clearInterval(interval);

  }, [isVisible, isHovering]);

  // 🎨 styles
  const styles = `
    .success-section {
      overflow: hidden;
      padding: 50px 0;
      position: relative;
    }

    .success-slider {
      display: flex;
      gap: 20px;
      overflow-x: scroll;
      scroll-behavior: smooth;
      scrollbar-width: none;
      cursor: grab;
    }

    .success-slider:active {
      cursor: grabbing;
    }

    .success-slider::-webkit-scrollbar {
      display: none;
    }

    .success-card {
      min-width: 320px;
      max-width: 320px;
      background: white;
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      flex-shrink: 0;
      transition: transform 0.3s;
    }

    .success-card:hover {
      transform: translateY(-5px);
    }

    .success-text {
      font-size: 0.9rem;
      color: #555;
      margin-bottom: 12px;
      line-height: 1.5;
    }

    .success-name {
      font-weight: 600;
      font-size: 1rem;
    }

    .success-role {
      font-size: 0.8rem;
      color: #777;
    }
  `;

  return (
    <Fragment>

      <style>{styles}</style>

      <div className="success-section" ref={containerRef}>

        <div
  className="success-slider"
  ref={sliderRef}
  onMouseEnter={() => setIsHovering(true)}
  onMouseLeave={(e) => {
    setIsHovering(false);
    handleMouseLeave(e);
  }}
  onMouseDown={handleMouseDown}
  onMouseUp={handleMouseUp}
  onMouseMove={handleMouseMove}
>


          {/* duplicate for infinite scroll */}
          {[...testimonials, ...testimonials].map((item, index) => (

            <div key={index} className="success-card">

              <div>{renderStars()}</div>

              <p className="success-text">
                {item.text}
              </p>

              <div className="success-name">
                {item.name}
              </div>

              <div className="success-role">
                {item.role}
              </div>

            </div>

          ))}

        </div>

      </div>

    </Fragment>
  );
};

export default TestimonialThree;
