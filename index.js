const API =
  "https://proxy.corsfix.com/?https://exoplanetarchive.ipac.caltech.edu/workspace/Cache/ps.csv";

let planets = [],
  filtered = [],
  page = 1,
  perPage = 10,
  sortField = "",
  sortAsc = true;

const tbody = document.querySelector("tbody");
const search = document.querySelector(".search");
const pageInfo = document.querySelector(".page-info");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const detail = document.querySelector(".detail");
const detailContent = document.querySelector(".detail-content");

axios.get(API).then((res) => {
  const parsed = Papa.parse(res.data, { header: true });
  planets = parsed.data;
  filtered = [...planets];
  if (localStorage.getItem("dark") === "true")
    document.body.classList.add("dark");
  render();
}).catch((err) => {
  console.error(err);
  tbody.innerHTML = '<tr><td colspan="9">Error loading data</td></tr>';
});

document.querySelector(".dark-toggle").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark", document.body.classList.contains("dark"));
};

document.querySelector(".close-detail").onclick = () =>
  detail.classList.add("hidden");

search.oninput = () => {
  const term = search.value.toLowerCase();
  filtered = planets.filter(
    (p) =>
      (p.pl_name || "").toLowerCase().includes(term) ||
      (p.hostname || "").toLowerCase().includes(term)
  );
  page = 1;
  render();
};

prevBtn.onclick = () => {
  if (page > 1) {
    page--;
    render();
  }
};
nextBtn.onclick = () => {
  if (page * perPage < filtered.length) {
    page++;
    render();
  }
};

function render() {
  if (sortField) {
    filtered.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortAsc ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortAsc ? 1 : -1;
      return 0;
    });
  }
  const start = (page - 1) * perPage;
  tbody.innerHTML = filtered
    .slice(start, start + perPage)
    .map(
      (p) =>
        `<tr>
      <td class="name">${p.pl_name ?? ""}</td>
      <td>${p.hostname ?? ""}</td>
      <td>${p.disc_year ?? ""}</td>
      <td>${p.discoverymethod ?? ""}</td>
      <td>${p.pl_rade ?? ""}</td>
      <td>${p.pl_bmasse ?? ""}</td>
      <td>${p.pl_orbper ?? ""}</td>
      <td>${p.st_teff ?? ""}</td>
      <td>${p.sy_dist ?? ""}</td>
    </tr>`
    )
    .join("");

  document.querySelectorAll(".name").forEach((td) => {
    td.onclick = () => {
      const planet = planets.find((x) => x.pl_name === td.textContent);
      detailContent.innerHTML = Object.entries(planet)
        .map(([k, v]) => `<p><b>${k}</b>: ${v}</p>`)
        .join("");
      detail.classList.remove("hidden");
    };
  });

  pageInfo.textContent = `Page ${page} / ${Math.ceil(
    filtered.length / perPage
  )}`;
}
