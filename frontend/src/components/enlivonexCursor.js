import { useEffect, useRef, useState } from "react";
import "./enlivonexCursor.css";

function EnlivonexCursor() {
  const cursorRef = useRef(null);
  const lettersRef = useRef([]);
  const trailRef = useRef([]);

  const mouseRef = useRef({
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    speed: 0,
    active: false,
    initialized: false
  });

  const animationRef = useRef(null);
  const idleTimerRef = useRef(null);

  const [isDesktop, setIsDesktop] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isFast, setIsFast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    const updateDevice = () => {
      setIsDesktop(mediaQuery.matches);
    };

    updateDevice();

    mediaQuery.addEventListener("change", updateDevice);

    return () => {
      mediaQuery.removeEventListener("change", updateDevice);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) return undefined;

    const cursor = cursorRef.current;

    if (!cursor) return undefined;

    const handleMouseMove = (event) => {
      const mouse = mouseRef.current;

      if (!mouse.initialized) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.lastX = event.clientX;
        mouse.lastY = event.clientY;
        mouse.initialized = true;
      }

      mouse.x = event.clientX;
      mouse.y = event.clientY;

      const deltaX = mouse.x - mouse.lastX;
      const deltaY = mouse.y - mouse.lastY;

      const distance = Math.sqrt(
        deltaX * deltaX + deltaY * deltaY
      );

      mouse.speed = Math.min(distance, 90);

      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.active = true;

      setIsMoving(true);
      setIsFast(mouse.speed > 28);

      clearTimeout(idleTimerRef.current);

      idleTimerRef.current = setTimeout(() => {
        mouse.active = false;
        mouse.speed = 0;

        setIsMoving(false);
        setIsFast(false);
      }, 130);

      cursor.style.setProperty("--cursor-x", `${mouse.x}px`);
      cursor.style.setProperty("--cursor-y", `${mouse.y}px`);
      cursor.style.setProperty(
        "--cursor-speed",
        `${mouse.speed}`
      );
    };

    const handleMouseDown = () => {
      cursor.classList.add("is-clicking");
    };

    const handleMouseUp = () => {
      cursor.classList.remove("is-clicking");
    };

    const handleMouseLeave = () => {
      cursor.classList.add("is-hidden");
    };

    const handleMouseEnter = () => {
      cursor.classList.remove("is-hidden");
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    const animate = () => {
      const mouse = mouseRef.current;

      if (cursorRef.current && mouse.initialized) {
        cursorRef.current.style.transform = `
          translate3d(
            ${mouse.x}px,
            ${mouse.y}px,
            0
          )
          translate3d(-50%, -50%, 0)
        `;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);

      clearTimeout(idleTimerRef.current);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDesktop]);

  if (!isDesktop) {
    return null;
  }

  const brandLetters = "ENLIVONEX".split("");

  return (
    <div
      ref={cursorRef}
      className={`enlivonex-cursor ${
        isMoving ? "is-moving" : "is-idle"
      } ${isFast ? "is-fast" : ""}`}
      aria-hidden="true"
    >
      <div className="enlivonex-cursor-core">
        <span className="cursor-e">E</span>

        <div className="cursor-brand">
          {brandLetters.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              ref={(element) => {
                lettersRef.current[index] = element;
              }}
              className="cursor-letter"
              style={{
                "--letter-index": index
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      <div className="cursor-ring" />

      <div className="cursor-energy">
        <span />
        <span />
        <span />
      </div>

      <div className="cursor-trail">
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

export default EnlivonexCursor;