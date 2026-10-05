const header = document.querySelector(".site-header");
const mobileMenuButton = document.querySelector(".mobile-menu-button");
const navGroups = document.querySelectorAll(".nav-group");
const modal = document.querySelector(".image-modal");
const modalImage = modal?.querySelector("img");
const modalTitle = modal?.querySelector("#modal-title");
const scopeInputs = document.querySelectorAll(".builder-options input");
const scopeLevel = document.querySelector("[data-scope-level]");
const scopeSummary = document.querySelector("[data-scope-summary]");
const deliverablesList = document.querySelector("[data-deliverables]");
const outputCount = document.querySelector("[data-output-count]");
const reviewDepth = document.querySelector("[data-review-depth]");
const copyBriefButton = document.querySelector(".brief-copy");
const copyStatus = document.querySelector(".copy-status");
const explorerTabs = document.querySelectorAll("[data-explorer-tab]");
const explorerKicker = document.querySelector("[data-explorer-kicker]");
const explorerTitle = document.querySelector("[data-explorer-title]");
const explorerCopy = document.querySelector("[data-explorer-copy]");
const explorerArtifacts = document.querySelector("[data-explorer-artifacts]");
const explorerChecks = document.querySelector("[data-explorer-checks]");

const scopeMap = {
  rna: {
    label: "RNA-seq DEG workflow",
    deliverables: ["DEG table", "normalized count matrix", "QC-aware analysis notes"],
  },
  figures: {
    label: "publication figures",
    deliverables: ["PCA plot", "heatmap", "volcano plot", "export-ready figures"],
  },
  splicing: {
    label: "alternative splicing review",
    deliverables: ["event summary table", "selected gene/event review", "sashimi-ready targets"],
  },
  pathway: {
    label: "pathway or GSEA review",
    deliverables: ["enrichment table", "ranked-list summary", "pathway interpretation notes"],
  },
  automation: {
    label: "reusable scripting support",
    deliverables: ["Python/Bash helper scripts", "cleaned output folders", "reproducibility notes"],
  },
};

const explorerData = {
  rna: {
    kicker: "DESeq2-style workflow",
    title: "RNA-seq differential expression package",
    copy: "A focused comparison workflow with count filtering, metadata-aware design, differential expression tables, and publication-ready plots.",
    artifacts: [
      ["results_DEG_table.csv", "ranked genes, log2FC, adjusted p-values"],
      ["normalized_counts.csv", "clean matrix for downstream review"],
      ["pca_samples.png", "sample structure and outlier review"],
      ["volcano_plot.png", "differential expression overview"],
      ["heatmap_top_genes.png", "selected gene-level expression pattern"],
      ["analysis_summary.pdf", "methods and result notes"],
    ],
    checks: ["metadata and contrast are explicit", "low-count filtering is documented", "figures export cleanly for manuscript use"],
  },
  splicing: {
    kicker: "rMATS / SUPPA2-ready review",
    title: "Alternative splicing event handoff",
    copy: "A targeted splicing review that turns event tables into filtered candidates, selected gene views, and review-ready summaries.",
    artifacts: [
      ["filtered_events.tsv", "event type, FDR, delta inclusion"],
      ["selected_gene_events.csv", "gene-level candidate shortlist"],
      ["sashimi_targets.txt", "plot-ready events for selected genes"],
      ["splicing_notes.md", "event interpretation and caveats"],
    ],
    checks: ["event thresholds are stated", "sample groups match RNA-seq design", "selected genes are traceable to event IDs"],
  },
  pathway: {
    kicker: "GSEA / pathway summary",
    title: "Functional interpretation package",
    copy: "A pathway-level review that converts ranked genes or DEG sets into enrichment tables, pathway plots, and concise biological notes.",
    artifacts: [
      ["ranked_gene_list.rnk", "input-ready ranked statistics"],
      ["enrichment_results.csv", "pathway names, scores, adjusted p-values"],
      ["pathway_summary.png", "selected pathway visualization"],
      ["interpretation_notes.pdf", "plain-language pathway summary"],
    ],
    checks: ["gene identifiers are consistent", "background set is documented", "top pathways are separated from exploratory notes"],
  },
  automation: {
    kicker: "Python / Bash support",
    title: "Reusable analysis helper package",
    copy: "Small scripts that reduce repetitive wet-lab data handling, table cleanup, file organization, and reproducible output generation.",
    artifacts: [
      ["clean_tables.py", "repeatable table formatting helper"],
      ["batch_rename.sh", "safe file organization utility"],
      ["README_usage.md", "inputs, outputs, and example commands"],
      ["example_output/", "small test output folder"],
    ],
    checks: ["inputs and outputs are named clearly", "scripts include usage notes", "test example can be rerun"],
  },
};

if (header) {
  window.addEventListener("scroll", () => {
    const hasScrolled = window.scrollY > 12;
    header.style.boxShadow = hasScrolled ? "0 10px 30px rgba(24, 32, 31, 0.08)" : "none";
  });
}

function setNavigationOpen(isOpen) {
  if (!header) return;

  header.classList.toggle("nav-open", isOpen);
  mobileMenuButton?.setAttribute("aria-expanded", String(isOpen));
}

mobileMenuButton?.addEventListener("click", () => {
  setNavigationOpen(!header?.classList.contains("nav-open"));
});

navGroups.forEach((group) => {
  const trigger = group.querySelector(".nav-trigger");

  trigger?.addEventListener("click", () => {
    const isOpen = group.classList.toggle("open");
    trigger.setAttribute("aria-expanded", String(isOpen));

    navGroups.forEach((otherGroup) => {
      if (otherGroup === group) return;
      otherGroup.classList.remove("open");
      otherGroup.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false");
    });
  });
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  if (!target.closest(".site-header")) {
    navGroups.forEach((group) => {
      group.classList.remove("open");
      group.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false");
    });
  }
});

document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    setNavigationOpen(false);
    navGroups.forEach((group) => {
      group.classList.remove("open");
      group.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false");
    });
  });
});

document.querySelectorAll(".result-image-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (!modal || !modalImage || !modalTitle) return;

    modalImage.src = button.dataset.image || "";
    modalImage.alt = button.querySelector("img")?.alt || "";
    modalTitle.textContent = button.dataset.title || "Result preview";
    modal.hidden = false;
    document.body.classList.add("modal-open");
  });
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!modal || !modalImage) return;

    modal.hidden = true;
    modalImage.src = "";
    document.body.classList.remove("modal-open");
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !modal || modal.hidden) return;

  modal.hidden = true;
  if (modalImage) modalImage.src = "";
  document.body.classList.remove("modal-open");
});

function getSelectedScopes() {
  return [...scopeInputs].filter((input) => input.checked).map((input) => input.value);
}

function updateScopeBrief() {
  if (!scopeLevel || !scopeSummary || !deliverablesList || !outputCount || !reviewDepth) return;

  const selected = getSelectedScopes();
  const activeScopes = selected.length ? selected : ["rna"];
  const labels = activeScopes.map((key) => scopeMap[key].label);
  const deliverables = [...new Set(activeScopes.flatMap((key) => scopeMap[key].deliverables))];
  const depth = activeScopes.length >= 4 ? "Deep" : activeScopes.length >= 3 ? "Expanded" : "Standard";
  const level = activeScopes.length >= 4 ? "Multi-layer analysis" : activeScopes.length >= 3 ? "Expanded project" : "Focused analysis";

  scopeLevel.textContent = level;
  scopeSummary.textContent = `${labels.join(", ")} with structured handoff and research-support reporting.`;
  deliverablesList.innerHTML = deliverables.map((item) => `<li>${item}</li>`).join("");
  outputCount.textContent = String(deliverables.length);
  reviewDepth.textContent = depth;
}

scopeInputs.forEach((input) => {
  input.addEventListener("change", updateScopeBrief);
});

copyBriefButton?.addEventListener("click", async () => {
  if (!scopeLevel || !scopeSummary || !deliverablesList || !copyStatus) return;

  const deliverables = [...deliverablesList.querySelectorAll("li")].map((item) => `- ${item.textContent}`).join("\n");
  const text = `${scopeLevel.textContent}\n${scopeSummary.textContent}\n\nExpected deliverables:\n${deliverables}`;

  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = "Brief copied.";
  } catch {
    copyStatus.textContent = "Brief ready to copy from the page.";
  }
});

updateScopeBrief();

function updateExplorer(tabName) {
  const data = explorerData[tabName];
  if (!data || !explorerKicker || !explorerTitle || !explorerCopy || !explorerArtifacts || !explorerChecks) return;

  explorerKicker.textContent = data.kicker;
  explorerTitle.textContent = data.title;
  explorerCopy.textContent = data.copy;
  explorerArtifacts.innerHTML = data.artifacts
    .map(([name, detail]) => `<div class="artifact-item"><strong>${name}</strong><span>${detail}</span></div>`)
    .join("");
  explorerChecks.innerHTML = data.checks.map((check) => `<li>${check}</li>`).join("");

  explorerTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.explorerTab === tabName);
  });
}

explorerTabs.forEach((tab) => {
  tab.addEventListener("click", () => updateExplorer(tab.dataset.explorerTab));
});

updateExplorer("rna");
