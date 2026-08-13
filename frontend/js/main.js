const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("main-nav");
if (menuToggle) menuToggle.addEventListener("click", () => nav.classList.toggle("open"));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: .12 });

document.querySelectorAll(".reveal").forEach(el => {
  el.style.opacity = "0"; el.style.transform = "translateY(18px)";
  el.style.transition = "opacity .7s ease, transform .7s ease";
  observer.observe(el);
});

const style = document.createElement("style");
style.textContent = ".reveal.visible{opacity:1!important;transform:none!important}";
document.head.appendChild(style);

document.querySelectorAll("[data-count]").forEach(el => {
  const target = Number(el.dataset.count);
  let done = false;
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || done) return;
    done = true;
    const start = performance.now(), duration = 1300;
    const tick = now => {
      const p = Math.min(1, (now - start) / duration);
      el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  io.observe(el);
});
