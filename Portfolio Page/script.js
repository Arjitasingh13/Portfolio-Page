const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const yearEl = document.querySelector("#year");
const copyLinkBtn = document.querySelector("#copy-link-btn");
const shareLinkBtn = document.querySelector("#share-link-btn");
const shareStatus = document.querySelector("#share-status");

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function setStatus(message) {
  if (!formStatus) return;
  formStatus.textContent = message;
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? String(el.value || "").trim() : "";
}

function setShareStatus(message) {
  if (shareStatus) shareStatus.textContent = message;
}

function notifyNewContact(formData) {
  const title = "New Contact Submission";
  const body = `${formData.name} (${formData.email}) sent a message.`;

  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(title, { body });
    return;
  }

  if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
}

if (copyLinkBtn) {
  copyLinkBtn.addEventListener("click", async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("Website link copied.");
    } catch {
      setShareStatus("Could not copy automatically. Copy this link: " + url);
    }
  });
}

if (shareLinkBtn) {
  shareLinkBtn.addEventListener("click", async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Arjita Singh Portfolio",
          text: "Check out my portfolio website.",
          url,
        });
        setShareStatus("Website link shared.");
      } catch {
        setShareStatus("Sharing was cancelled.");
      }
      return;
    }
    setShareStatus("Share API not available. Use Copy Website Link.");
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      name: getValue("name"),
      email: getValue("email"),
      message: getValue("message"),
      submittedAt: new Date().toISOString(),
    };

    if (!formData.name || !formData.email || !formData.message) {
      setStatus("Please fill out Name, Email, and Message.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setStatus("Please enter a valid email address.");
      return;
    }

    console.log("Form Submitted Successfully:", formData);

    try {
      const key = "portfolio_contact_submissions";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(formData);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {
      // localStorage may be blocked in private windows.
    }

    try {
      const emailPayload = new URLSearchParams({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        _subject: "New message from portfolio contact form",
        _captcha: "false",
        _template: "table",
      });

      await fetch("https://formsubmit.co/ajax/arjitasingh606@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: emailPayload.toString(),
      });
    } catch {
      // If network/email service fails, data remains stored in localStorage.
    }

    notifyNewContact(formData);
    alert(`Thanks for reaching out, ${formData.name}!`);
    setStatus("Success! Your contact details have been saved.");
    contactForm.reset();
  });
}

