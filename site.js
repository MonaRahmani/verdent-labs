(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!finePointer.matches || reducedMotion.matches) {
    return;
  }

  const logoEffects = document.querySelectorAll(".logo-effect");
  const effectRadius = 360;
  let pointerX = Number.POSITIVE_INFINITY;
  let pointerY = Number.POSITIVE_INFINITY;
  let animationFrame = null;

  const setLogoIntensity = (logoEffect, intensity) => {
    const easedIntensity = Math.pow(intensity, 1.25);

    logoEffect.style.setProperty(
      "--logo-brightness",
      (1 + easedIntensity * 1.05).toFixed(3),
    );
    logoEffect.style.setProperty(
      "--logo-glow-alpha",
      (easedIntensity * 0.92).toFixed(3),
    );
    logoEffect.style.setProperty(
      "--logo-glow-size",
      `${(easedIntensity * 32).toFixed(1)}px`,
    );
    logoEffect.style.setProperty(
      "--logo-halo-opacity",
      (easedIntensity * 0.9).toFixed(3),
    );
    logoEffect.style.setProperty(
      "--logo-halo-scale",
      (0.78 + easedIntensity * 0.28).toFixed(3),
    );
  };

  const updateGlow = () => {
    logoEffects.forEach((logoEffect) => {
      const bounds = logoEffect.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const distance = Math.hypot(pointerX - centerX, pointerY - centerY);
      const intensity = Math.max(0, 1 - distance / effectRadius);

      setLogoIntensity(logoEffect, intensity);
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
    logoEffects.forEach((logoEffect) => setLogoIntensity(logoEffect, 0));
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

(() => {
  const form = document.querySelector("[data-contact-form]");

  if (!form) {
    return;
  }

  const status = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector("[data-submit-button]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    status.dataset.state = "pending";
    status.textContent = "Sending your inquiry…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = result.errors
          ?.map((error) => error.message)
          .filter(Boolean)
          .join(" ");

        throw new Error(message || "Formspree could not accept the submission.");
      }

      form.reset();
      status.dataset.state = "success";
      status.textContent =
        "Thanks — your inquiry was sent. We’ll be in touch soon.";
    } catch (error) {
      status.dataset.state = "error";
      status.textContent =
        "We couldn’t send your inquiry. Please try again in a moment.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send inquiry";
    }
  });
})();
