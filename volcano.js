// Interactive volcano plot built from the published DESeq2 result table.
(() => {
  const canvas = document.getElementById("volcano-canvas");
  const fallback = document.getElementById("volcano-fallback");
  const padjInput = document.getElementById("padj-cutoff");
  const lfcInput = document.getElementById("lfc-cutoff");
  if (!canvas || !padjInput || !lfcInput) return;

  const PADJ_STEPS = [0.0001, 0.001, 0.01, 0.05, 0.1, 0.2];
  const REPORT = { padj: "3", lfc: "1" };
  const X_LIMIT = 8;
  const output = {
    padj: document.getElementById("padj-value"),
    lfc: document.getElementById("lfc-value"),
    total: document.getElementById("deg-total"),
    up: document.getElementById("deg-up"),
    down: document.getElementById("deg-down"),
  };
  const colors = { rest: "#c3cdd2", pass: "#0d7480", axis: "#5d6b72", ink: "#1f3038" };
  let data = null;
  let yLimit = 1;

  function cutoffs() {
    return { padj: PADJ_STEPS[Number(padjInput.value)], lfc: Number(lfcInput.value) };
  }

  function draw() {
    const { padj, lfc } = cutoffs();
    const yCut = -Math.log10(padj);
    const passes = (x, y) => y > yCut && Math.abs(x) >= lfc;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, width, height);

    const margin = { top: 16, right: 12, bottom: 44, left: 46 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;
    const toX = (x) => margin.left + ((Math.max(-X_LIMIT, Math.min(X_LIMIT, x)) + X_LIMIT) / (2 * X_LIMIT)) * plotW;
    const toY = (y) => margin.top + plotH - (y / yLimit) * plotH;

    ctx.fillStyle = colors.rest;
    data.points.forEach(([x, y]) => {
      if (!passes(x, y)) ctx.fillRect(toX(x) - 1, toY(y) - 1, 2, 2);
    });
    ctx.fillStyle = colors.pass;
    let up = 0;
    let down = 0;
    data.points.forEach(([x, y]) => {
      if (passes(x, y)) {
        ctx.fillRect(toX(x) - 1.5, toY(y) - 1.5, 3, 3);
        if (x > 0) up += 1;
        else down += 1;
      }
    });

    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(toX(-lfc), margin.top);
    ctx.lineTo(toX(-lfc), margin.top + plotH);
    ctx.moveTo(toX(lfc), margin.top);
    ctx.lineTo(toX(lfc), margin.top + plotH);
    ctx.moveTo(margin.left, toY(yCut));
    ctx.lineTo(margin.left + plotW, toY(yCut));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = colors.axis;
    ctx.font = "13px 'Hanken Grotesk', sans-serif";
    ctx.textAlign = "center";
    [-8, -4, 0, 4, 8].forEach((tick) => ctx.fillText(String(tick), toX(tick), margin.top + plotH + 18));
    ctx.fillText("log2 fold change", margin.left + plotW / 2, height - 6);
    ctx.textAlign = "right";
    [0, 50, 100].forEach((tick) => ctx.fillText(String(tick), margin.left - 8, toY(tick) + 4));
    ctx.save();
    ctx.translate(14, margin.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("-log10 adjusted p", 0, 0);
    ctx.restore();

    ctx.fillStyle = colors.ink;
    ctx.textAlign = "left";
    if (width > 480) {
      data.labels.slice(0, 5).forEach(([x, y, name], index) => {
        ctx.fillText(name, toX(x) + 6, toY(y) + 4 + (index % 2 ? 12 : 0));
      });
    }

    output.total.textContent = (up + down).toLocaleString("en-US");
    output.up.textContent = up.toLocaleString("en-US");
    output.down.textContent = down.toLocaleString("en-US");
  }

  function update() {
    const { padj, lfc } = cutoffs();
    output.padj.textContent = String(padj);
    output.lfc.textContent = lfc.toFixed(1);
    if (data) draw();
  }

  padjInput.addEventListener("input", update);
  lfcInput.addEventListener("input", update);
  document.getElementById("cutoff-reset")?.addEventListener("click", () => {
    padjInput.value = REPORT.padj;
    lfcInput.value = REPORT.lfc;
    update();
  });
  window.addEventListener("resize", () => {
    if (data) draw();
  });

  fetch("assets/airway-deg.json")
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error("no data"))))
    .then((json) => {
      data = json;
      yLimit = Math.max(...data.points.map((point) => point[1])) * 1.05;
      canvas.hidden = false;
      fallback.hidden = true;
      update();
    })
    .catch(() => {
      // The static figure and the report's counts stay visible.
      padjInput.disabled = true;
      lfcInput.disabled = true;
    });
})();
