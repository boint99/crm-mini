import { useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

  .cyber-wrap {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 0;
    z-index: 9999;
    gap: 16px;
  }

  .cyber-spinner {
    position: relative;
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .cyber-ring {
    position: absolute;
    border-radius: 50%;
    border-style: solid;
    border-color: transparent;
  }

  .cyber-r1 {
    width: 72px; height: 72px;
    border-top-color: rgba(99,102,241,0.9);
    border-right-color: rgba(99,102,241,0.9);
    border-width: 2px;
    animation: cyberSpin 1.6s linear infinite;
  }
  .cyber-r2 {
    width: 54px; height: 54px;
    border-bottom-color: rgba(139,92,246,0.7);
    border-left-color: rgba(139,92,246,0.7);
    border-width: 1.5px;
    animation: cyberSpin 2.4s linear infinite reverse;
  }
  .cyber-r3 {
    width: 38px; height: 38px;
    border-top-color: rgba(99,102,241,0.5);
    border-right-color: rgba(99,102,241,0.5);
    border-width: 1px;
    animation: cyberSpin 1s linear infinite;
  }

  @keyframes cyberSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .cyber-orbit-dot {
    position: absolute;
    border-radius: 50%;
  }
  .cyber-dot-outer {
    width: 5px; height: 5px;
    background: rgba(99,102,241,0.9);
    top: -2.5px;
    left: calc(50% - 2.5px);
    animation: cyberOrbit1 1.6s linear infinite;
  }
  .cyber-dot-mid {
    width: 4px; height: 4px;
    background: rgba(139,92,246,0.8);
    top: -2px;
    left: calc(50% - 2px);
    animation: cyberOrbit2 2.4s linear infinite reverse;
  }

  @keyframes cyberOrbit1 {
    from { transform: rotate(0deg) translateY(-36px); }
    to   { transform: rotate(360deg) translateY(-36px); }
  }
  @keyframes cyberOrbit2 {
    from { transform: rotate(0deg) translateY(-27px); }
    to   { transform: rotate(360deg) translateY(-27px); }
  }

  .cyber-core {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgba(99,102,241,0.85);
    animation: cyberPulse 1.8s ease-in-out infinite;
    z-index: 5;
  }

  @keyframes cyberPulse {
    0%, 100% { transform: scale(1); opacity: 0.85; }
    50%       { transform: scale(1.2); opacity: 1; }
  }

  .cyber-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    letter-spacing: 3px;
    color: rgba(99,102,241,0.7);
    text-transform: uppercase;
    animation: cyberBlink 1.6s step-end infinite;
  }

  @keyframes cyberBlink {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
`;

export default function Loading({ label = "loading..." }) {
  const styleRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("cyber-spinner-styles")) {
      const tag = document.createElement("style");
      tag.id = "cyber-spinner-styles";
      tag.textContent = styles;
      document.head.appendChild(tag);
      styleRef.current = tag;
    }
    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="cyber-wrap">
      <div className="cyber-spinner">
        <div className="cyber-ring cyber-r1" />
        <div className="cyber-ring cyber-r2" />
        <div className="cyber-ring cyber-r3" />
        <div className="cyber-orbit-dot cyber-dot-outer" />
        <div className="cyber-orbit-dot cyber-dot-mid" />
        <div className="cyber-core" />
      </div>

      {label && <div className="cyber-label">{label}</div>}
    </div>
  );
}
