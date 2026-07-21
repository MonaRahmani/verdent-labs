(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!finePointer.matches || reducedMotion.matches) {
    return;
  }

  const logos = document.querySelectorAll(".logo");
  const effectRadius = 280;
  let pointerX = Number.POSITIVE_INFINITY;
  let pointerY = Number.POSITIVE_INFINITY;
  let animationFrame = null;

  const setLogoIntensity = (logo, intensity) => {
    const easedIntensity = intensity * intensity;

    logo.style.setProperty(
      "--logo-brightness",
      (1 + easedIntensity * 0.68).toFixed(3),
    );
    logo.style.setProperty(
      "--logo-glow-alpha",
      (easedIntensity * 0.72).toFixed(3),
    );
    logo.style.setProperty(
      "--logo-glow-size",
      `${(easedIntensity * 22).toFixed(1)}px`,
    );
  };

  const updateGlow = () => {
    logos.forEach((logo) => {
      const bounds = logo.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const distance = Math.hypot(pointerX - centerX, pointerY - centerY);
      const intensity = Math.max(0, 1 - distance / effectRadius);

      setLogoIntensity(logo, intensity);
    });

    animationFrame = null;
  };

  const requestGlowUpdate = () => {
    if (animationFrame === null) {
      animationFrame = window.requestAnimationFrame(updateGlow);
    }
  };

  const resetGlow = () => {
    pointerX = Number.POSITIVE_INFINITY;
    pointerY = Number.POSITIVE_INFINITY;
    logos.forEach((logo) => setLogoIntensity(logo, 0));
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      requestGlowUpdate();
    },
    { passive: true },
  );
  window.addEventListener("resize", requestGlowUpdate, { passive: true });
  document.addEventListener("mouseleave", resetGlow);
  window.addEventListener("blur", resetGlow);
})();
