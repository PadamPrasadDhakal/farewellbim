const SUPABASE_URL = "https://cldsvijsoippqzxzdvrk.supabase.co";
const SUPABASE_KEY = "sb_publishable_722ZBNZSU1EOC1hW0ZQsvw_BnvFoG-O";

async function track(type, data = {}) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        type,
        page: location.pathname.split("/").pop() || "index.html",
        data,
        ts: new Date().toISOString()
      })
    });
  } catch {}
}

// Page view
track("page_view", { title: document.title });

// Click tracking — records tag, id, text, href
document.addEventListener("click", e => {
  const el = e.target.closest("a, button, [data-name]");
  if (!el) return;
  track("click", {
    tag: el.tagName.toLowerCase(),
    id: el.id || null,
    text: (el.textContent || "").trim().slice(0, 80),
    href: el.href || null,
    dataset: el.dataset ? Object.assign({}, el.dataset) : {}
  });
}, true);
