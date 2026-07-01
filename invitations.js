const UI = {
  list: document.getElementById("invitationList"),
  empty: document.getElementById("emptyState"),
  search: document.getElementById("searchInput"),

  modal: document.getElementById("invitationModal"),
  title: document.getElementById("modalTitle"),
  message: document.getElementById("cardMessage"),
  download: document.getElementById("downloadButton"),
  card: document.getElementById("exportCard")
};

const MESSAGE =
  "With hearts full of gratitude, we invite you to a farewell that carries the memories you helped create. You guided us through campus life with patience, kindness, and care, and you made Mechi Campus feel like home. Please join us as we celebrate your journey, our memories, and the bond we will always treasure.";

const App = {
  seniors: [],
  selected: null,
  downloadURL: null
};

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function splitCSV(line) {
  const result = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];

    if (c === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i++;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (c === "," && !quoted) {
      result.push(value);
      value = "";
      continue;
    }

    value += c;
  }

  result.push(value);
  return result;
}

function parseCSV(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);

  if (!lines.length) return [];

  const headers = splitCSV(lines.shift()).map(h => h.trim().toLowerCase());

  return lines.map(line => {
    const values = splitCSV(line);
    const row = {};

    headers.forEach((header, i) => {
      row[header] = (values[i] || "").trim();
    });

    return {
      name: row.name || values[0]?.trim()
    };
  }).filter(item => item.name);
}

function render(filter = "") {

  const keyword = filter.toLowerCase().trim();

  const data = App.seniors.filter(s =>
    s.name.toLowerCase().includes(keyword)
  );

  UI.list.innerHTML = "";

  if (!data.length) {

    UI.empty.classList.remove("hidden");

    UI.empty.innerHTML = App.seniors.length
      ? `
      <h3>No matching seniors</h3>
      <p>Try another search.</p>
      `
      : `
      <h3>No names found</h3>
      <p>Add seniors.csv then refresh.</p>
      `;

    return;
  }

  UI.empty.classList.add("hidden");

  data.forEach(senior => {

    UI.list.insertAdjacentHTML(
      "beforeend",
      `
      <article class="invite-item">

          <div>
              <p>Senior</p>
              <h3>${escapeHTML(senior.name)}</h3>
          </div>

          <button
              class="mini-button"
              data-name="${escapeHTML(senior.name)}">
              View Invitation
          </button>

      </article>
      `
    );

  });

}

async function generateJPEG() {

  UI.download.disabled = true;
  UI.download.textContent = "Preparing...";

  const canvas = await html2canvas(UI.card, {
    backgroundColor: null,
    scale: 2,
    useCORS: true
  });

  const blob = await new Promise(resolve =>
    canvas.toBlob(resolve, "image/jpeg", 0.95)
  );

  if (!blob) return;

  if (App.downloadURL) {
    URL.revokeObjectURL(App.downloadURL);
  }

  App.downloadURL = URL.createObjectURL(blob);

  UI.download.disabled = false;
  UI.download.textContent = "Download JPEG";

}

async function openInvitation(name) {

  App.selected = name;

  UI.title.textContent = name;

  UI.message.textContent =
    `Dear ${name}, ${MESSAGE}`;

  UI.modal.classList.remove("hidden");
  UI.modal.setAttribute("aria-hidden", "false");

  track("invitation_view", { senior: name });

  await generateJPEG();

}

function closeInvitation() {

  UI.modal.classList.add("hidden");
  UI.modal.setAttribute("aria-hidden", "true");

  App.selected = null;

  if (App.downloadURL) {
    URL.revokeObjectURL(App.downloadURL);
    App.downloadURL = null;
  }

}

async function loadCSV() {

  try {

    const response = await fetch("seniors.csv", {
      cache: "no-store"
    });

    if (!response.ok) throw Error();

    const csv = await response.text();

    App.seniors = parseCSV(csv);

    render();

  } catch {

    UI.empty.classList.remove("hidden");

    UI.empty.innerHTML = `
      <h3>Unable to load seniors.csv</h3>
      <p>Place the CSV beside this page and refresh.</p>
    `;

  }

}

UI.list.addEventListener("click", e => {

  const btn = e.target.closest("[data-name]");

  if (!btn) return;

  openInvitation(btn.dataset.name);

});

UI.search.addEventListener("input", e => {
  render(e.target.value);
});

UI.modal.addEventListener("click", e => {

  if (e.target.hasAttribute("data-close-modal")) {
    closeInvitation();
  }

});

document.addEventListener("keydown", e => {

  if (e.key === "Escape") {
    closeInvitation();
  }

});

UI.download.addEventListener("click", () => {

  if (!App.selected || !App.downloadURL) return;

  track("invitation_download", { senior: App.selected });

  const link = document.createElement("a");

  link.href = App.downloadURL;

  link.download =
    `Farewell-BIM-2021-${App.selected.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.jpeg`;

  link.click();

});

loadCSV();