const $ = (id) => document.getElementById(id);
let carePlans = [];
let activePlan = null;
function safe(v) { return (v ?? "").toString().trim(); }

function renderPlans() {
  const el = $("plans");
  el.innerHTML = "";
  carePlans.forEach((p) => {
    const b = document.createElement("button");
    b.className = "chip" + (activePlan?.plan_id === p.plan_id ? " active" : "");
    b.textContent = p.name;
    b.onclick = () => { activePlan = p; renderPlans(); renderObs(); };
    el.appendChild(b);
  });
}

function renderObs() {
  const el = $("obs");
  el.innerHTML = "";
  if (!activePlan) return;

  activePlan.observations.forEach((o) => {
    const row = document.createElement("div");
    row.className = "row";

    const lab = document.createElement("div");
    lab.className = "label";
    lab.textContent = o.label;
    row.appendChild(lab);

    let input;
    if (o.type === "number") {
      input = document.createElement("input");
      input.type = "number";
      input.className = "input";
    } else if (o.type === "select") {
      input = document.createElement("select");
      input.className = "input";
      (o.options ?? []).forEach(opt => {
        const op = document.createElement("option");
        op.value = opt;
        op.textContent = opt;
        input.appendChild(op);
      });
    } else if (o.type === "textarea_exception") {
      input = document.createElement("textarea");
      input.className = "textarea";
      input.placeholder = "例外が必要な理由を書いてください（必須）";
      input.style.minHeight = "120px";
    } else {
      input = document.createElement("input");
      input.className = "input";
    }

    input.dataset.key = o.key;
    row.appendChild(input);
    el.appendChild(row);
  });
}

function collectObs() {
  const inputs = $("obs").querySelectorAll("input, select, textarea");
  const m = {};
  inputs.forEach((i) => { m[i.dataset.key] = safe(i.value); });
  return m;
}

function generateText() {
  const patient = safe($("patientName").value);
  const author = safe($("authorName").value);
  const visitAt = safe($("visitAt").value);
  if (!activePlan) return "看護計画を選択してください。";

  const obs = collectObs();
  const ex = obs["notes_exception"];
  if (ex !== undefined && safe(ex) !== "" && safe(ex).length < 5) {
    return "例外ログは理由が短すぎます。5文字以上で具体的に。";
  }

  const lines = [];
  lines.push(`【利用者】${patient || "（未入力）"}`);
  lines.push(`【訪問日時】${visitAt || "（未入力）"}`);
  lines.push(`【記録者】${author || "（未入力）"}`);
  lines.push(`【看護計画】${activePlan.name}`);
  lines.push("");
  lines.push("■ 観察（固定）");
  activePlan.observations.forEach((o) => {
    const v = safe(obs[o.key]);
    if (o.type === "textarea_exception") {
      if (v) lines.push(`- 例外ログ（理由）: ${v}`);
    } else {
      lines.push(`- ${o.label}: ${v || "（未入力）"}`);
    }
  });
  return lines.join("\n");
}

async function boot() {
  const res = await fetch("./assets/care_plans.json");
  const json = await res.json();
  carePlans = json.care_plans ?? [];
  renderPlans();
}

$("btnGen").onclick = () => { $("out").value = generateText(); };
$("btnCopy").onclick = async () => {
  const t = $("out").value;
  if (!t) return;
  await navigator.clipboard.writeText(t);
  alert("コピーしました");
};

boot();
