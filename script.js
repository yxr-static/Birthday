(() => {
  "use strict";

  const defaults = window.CARTA_CONFIG || {
    destinataria: "PARA TI, CON CARIÑO",
    titulo: "¡Feliz cumpleaños!",
    mensaje: "Espero que hoy tengas un día genial.",
    despedida: "¡Disfruta muchísimo! ♡",
    firma: "Con cariño ♡"
  };

  const $ = (id) => document.getElementById(id);
  const elements = {
    scene: $("scene"),
    letterCard: $("letterCard"),
    openEnvelope: $("openEnvelope"),
    afterActions: $("afterActions"),
    replayButton: $("replayButton")
  };

  let isOpen = false;

  function renderLetter() {
    $("recipientTag").textContent = defaults.destinataria || "PARA TI, CON CARIÑO";
    $("letterTitle").textContent = defaults.titulo || "¡Feliz cumpleaños!";
    $("letterMessage").textContent = defaults.mensaje || "";
    $("letterGoodbye").textContent = defaults.despedida || "";
    $("letterSignature").textContent = defaults.firma || "";
    fitWhenReady();
  }

  // Reduce poco a poco el texto para que encaje sin desbordarse de la tarjeta.
  function fitOneText(node, maxSize, minSize, step) {
    if (!node) return;
    let size = maxSize;
    node.style.fontSize = `${size}px`;
    while (size > minSize && (node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1)) {
      size -= step;
      node.style.fontSize = `${size}px`;
    }
  }

  function fitLetterText() {
    const isSmallScreen = window.matchMedia("(max-width: 600px)").matches;
    fitOneText($("letterMessage"), isSmallScreen ? 15.5 : 17, 11.5, 0.25);
    fitOneText($("letterTitle"), isSmallScreen ? 28 : 36, 20, 0.5);
    fitOneText($("letterGoodbye"), isSmallScreen ? 14 : 16, 11, 0.25);
    fitOneText($("letterSignature"), isSmallScreen ? 12 : 14, 9, 0.25);
  }

  // Espera a que terminen de cargar las fuentes antes de calcular tamaños.
  // Así evitamos que el cambio de tipografía provoque saltos en el texto.
  function fitWhenReady() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => requestAnimationFrame(fitLetterText));
    } else {
      requestAnimationFrame(fitLetterText);
    }
  }

  function openLetter() {
    if (isOpen) return;
    isOpen = true;
    elements.scene.classList.add("is-open");
    elements.openEnvelope.setAttribute("aria-label", "La carta está abierta");
    elements.afterActions.hidden = false;

    // El sobre empieza a desvanecerse y la tarjeta aparece después para no tapar la lectura.
    window.setTimeout(() => {
      elements.letterCard.classList.add("is-visible");
      launchConfetti();
    }, 260);
  }

  function closeLetter() {
    if (!isOpen) return;
    isOpen = false;
    elements.letterCard.classList.remove("is-visible");
    elements.scene.classList.remove("is-open");
    elements.openEnvelope.setAttribute("aria-label", "Abrir la carta de cumpleaños de Tamara");
    elements.afterActions.hidden = true;
  }

  function launchConfetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#f28eae", "#f7c1d0", "#d989b1", "#f7d88b", "#ffffff", "#bd83b5"];
    for (let i = 0; i < 38; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.setProperty("--x", `${Math.random() * 100}vw`);
      piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 180}px`);
      piece.style.setProperty("--spin", `${Math.random() * 850 + 350}deg`);
      piece.style.setProperty("--duration", `${Math.random() * 1.7 + 2.1}s`);
      piece.style.setProperty("--delay", `${Math.random() * 0.35}s`);
      piece.style.setProperty("--color", colors[i % colors.length]);
      piece.style.setProperty("--shape", i % 3 === 0 ? "50%" : "2px");
      document.body.appendChild(piece);
      window.setTimeout(() => piece.remove(), 4600);
    }
  }

  elements.openEnvelope.addEventListener("click", openLetter);
  elements.replayButton.addEventListener("click", closeLetter);

  // Recalcula solo al cambiar el tamaño de pantalla. No observa el propio párrafo:
  // observarlo mientras se cambia su fuente puede crear un ciclo de reajustes.
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      fitLetterText();
    });
  });

  renderLetter();
})();
