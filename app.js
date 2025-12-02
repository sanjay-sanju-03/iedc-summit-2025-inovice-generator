function qs(sel, ctx = document) {
  return ctx.querySelector(sel);
}
function qsa(sel, ctx = document) {
  return Array.from(ctx.querySelectorAll(sel));
}

const itemsBody = qs("#itemsBody");
const addItemBtn = qs("#addItem");
const subtotalEl = qs("#subtotal");
const taxAmountEl = qs("#taxAmount");
const totalAmountEl = qs("#totalAmount");
const taxRateEl = qs("#taxRate");
const renderBtn = qs("#render");
const preview = qs("#preview");
const printBtn = qs("#print");

// Preload logos to ensure fast printing
const preloadLogos = [
  "iedc-summit-25-logo",
  "ksum-logo-black",
  "iedc-logo-color",
  "lbscek-logo-black",
  "cuk-logo",
];
preloadLogos.forEach((l) => {
  const img = new Image();
  img.src = `logos/${l}.png`;
});

function newRow(item = { name: "", desc: "", qty: 1, price: 0 }) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input class="item-name" value="${escapeHtml(item.name)}"></td>
    <td><input class="item-desc" value="${escapeHtml(item.desc)}"></td>
    <td><input class="item-qty" type="number" min="0" value="${item.qty}"></td>
    <td><input class="item-price" type="number" min="0" step="0.01" value="${
      item.price
    }"></td>
    <td class="item-amount">0.00</td>
    <td><button class="remove">✕</button></td>
  `;
  itemsBody.appendChild(tr);

  function update() {
    const qty = Number(tr.querySelector(".item-qty").value) || 0;
    const price = Number(tr.querySelector(".item-price").value) || 0;
    const amt = qty * price;
    tr.querySelector(".item-amount").textContent = amt.toFixed(2);
    calcTotals();
  }

  qsa("input", tr).forEach((i) => i.addEventListener("input", update));
  tr.querySelector(".remove").addEventListener("click", () => {
    tr.remove();
    calcTotals();
  });
  update();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function calcTotals() {
  const rows = qsa("#itemsBody tr");
  let subtotal = 0;
  rows.forEach((r) => {
    const qty = Number(r.querySelector(".item-qty").value) || 0;
    const price = Number(r.querySelector(".item-price").value) || 0;
    subtotal += qty * price;
  });
  const taxRate = Number(taxRateEl.value) || 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  subtotalEl.textContent = subtotal.toFixed(2);
  taxAmountEl.textContent = tax.toFixed(2);
  totalAmountEl.textContent = total.toFixed(2);
}

addItemBtn.addEventListener("click", () => newRow());
taxRateEl.addEventListener("input", calcTotals);

function renderPreview() {
  const invoiceNumber =
    qs("#invoiceNumber").value || `IEDC-${Date.now().toString().slice(-6)}`;
  const date =
    qs("#invoiceDate").value || new Date().toISOString().slice(0, 10);
  const from = qs("#from").value || "IEDC Summit 2025";
  const to = qs("#to").value || "";

  // Hardcoded logos as requested
  const logos = [
    "iedc-summit-25-logo",
    "ksum-logo-black",
    "iedc-logo-color",
    "lbscek-logo-black",
    "cuk-logo",
  ];

  const summitKey = "iedc-summit-25-logo";
  const hasSummit = logos.includes(summitKey);
  const otherLogos = logos.filter((l) => l !== summitKey);

  let html = "";
  html += `<div class="invoice-head">`;

  html += `<div class="head-left">`;
  if (hasSummit) {
    html += `<img src="logos/${summitKey}.png" class="summit-logo" alt="Summit Logo">`;
  }
  html += `</div>`;

  html += `<div class="head-right">`;

  if (otherLogos.length > 0) {
    html += `<div class="logo-row">`;
    otherLogos.forEach((l) => {
      const path = `logos/${l}.png`;
      html += `<img src="${path}" alt="${l}">`;
    });
    html += `</div>`;
  }

  html += `<div class="meta"><div><strong>Invoice</strong></div><div>#${escapeHtml(
    invoiceNumber
  )}</div><div>${escapeHtml(date)}</div></div>`;
  html += `</div></div>`;

  html += `<div class="bill-info">
    <div class="bill-from">
      <div class="label">From:</div>
      <div class="value">${escapeHtml(from).replace(/\n/g, "<br>")}</div>
    </div>
    <div class="bill-to">
      <div class="label">Bill To:</div>
      <div class="value">${escapeHtml(to).replace(/\n/g, "<br>")}</div>
    </div>
  </div>`;

  html += `<table class="items-preview">
    <thead>
      <tr>
        <th class="th-item">Item</th>
        <th class="th-desc">Description</th>
        <th class="th-qty">Qty</th>
        <th class="th-price">Price</th>
        <th class="th-amount">Amount</th>
      </tr>
    </thead>
    <tbody>`;
  qsa("#itemsBody tr").forEach((r) => {
    const name = r.querySelector(".item-name").value;
    const desc = r.querySelector(".item-desc").value;
    const qty = Number(r.querySelector(".item-qty").value) || 0;
    const price = Number(r.querySelector(".item-price").value) || 0;
    const amount = (qty * price).toFixed(2);
    html += `<tr><td><strong>${escapeHtml(name)}</strong></td><td>${escapeHtml(
      desc
    )}</td><td>${qty}</td><td>${price.toFixed(2)}</td><td>${amount}</td></tr>`;
  });
  html += `</tbody></table>`;

  html += `<div class="invoice-footer">
    <div class="totals-box">
      <div class="row">
        <span class="label">Subtotal:</span>
        <span class="value">${subtotalEl.textContent}</span>
      </div>
      <div class="row">
        <span class="label">Tax:</span>
        <span class="value">${taxAmountEl.textContent}</span>
      </div>
      <div class="row total">
        <span class="label">Total:</span>
        <span class="value">${totalAmountEl.textContent}</span>
      </div>
    </div>
  </div>`;

  preview.innerHTML = html;
}

renderBtn.addEventListener("click", () => {
  calcTotals();
  renderPreview();
});

printBtn.addEventListener("click", () => {
  calcTotals();
  renderPreview();
  // Use requestAnimationFrame to wait for the render to complete, then print immediately
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
    });
  });
});

// init
qs("#invoiceDate").value = new Date().toISOString().slice(0, 10);
qs("#invoiceNumber").value = `IEDC-${new Date().getFullYear()}-001`;
newRow({
  name: "Registration Fee",
  desc: "IEDC Summit 2025 participation",
  qty: 1,
  price: 100,
});
calcTotals();
