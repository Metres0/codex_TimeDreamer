const lenses = ["全景", "皇权", "宗室", "武将", "士人", "百姓"];

const nodes = {
  汉武帝: {
    id: "汉武帝",
    type: "皇权",
    description: "强化中央集权并推动对外扩张，是帝国叙事的核心引擎。",
    links: [
      { target: "卫青", relation: "人物" },
      { target: "霍去病", relation: "人物" },
      { target: "推恩令", relation: "事件" },
      { target: "盐铁官营", relation: "影响" },
      { target: "司马迁", relation: "人物" },
      { target: "边民迁徙", relation: "百姓" },
    ],
  },
  卫青: {
    id: "卫青",
    type: "武将",
    description: "北击匈奴的主将之一，军事胜利抬升皇权威望。",
    links: [
      { target: "汉武帝", relation: "皇权" },
      { target: "霍去病", relation: "人物" },
      { target: "漠北之战", relation: "事件" },
      { target: "军功爵制", relation: "影响" },
    ],
  },
  霍去病: {
    id: "霍去病",
    type: "武将",
    description: "青年名将，以快速远征重塑帝国边疆安全格局。",
    links: [
      { target: "汉武帝", relation: "皇权" },
      { target: "卫青", relation: "人物" },
      { target: "河西之战", relation: "事件" },
      { target: "河西走廊开拓", relation: "影响" },
    ],
  },
  司马迁: {
    id: "司马迁",
    type: "士人",
    description: "以《史记》建立纪传史范式，为时代留下多视角叙事。",
    links: [
      { target: "汉武帝", relation: "皇权" },
      { target: "李陵之祸", relation: "事件" },
      { target: "史记成书", relation: "影响" },
      { target: "士人风骨", relation: "影响" },
    ],
  },
  推恩令: {
    id: "推恩令",
    type: "宗室",
    description: "通过分封细化削弱诸侯王，重塑宗室政治结构。",
    links: [
      { target: "汉武帝", relation: "皇权" },
      { target: "宗室权力再平衡", relation: "影响" },
      { target: "地方治理改革", relation: "事件" },
    ],
  },
  盐铁官营: {
    id: "盐铁官营",
    type: "百姓",
    description: "国家财政与民间生计相互拉扯的关键政策。",
    links: [
      { target: "汉武帝", relation: "皇权" },
      { target: "财政强化", relation: "影响" },
      { target: "民生负担", relation: "影响" },
      { target: "盐铁会议", relation: "事件" },
    ],
  },
};

function ensureNode(id, type = "全景") {
  if (!nodes[id]) {
    nodes[id] = { id, type, description: `${id}：关联节点`, links: [] };
  }
}

for (const source of Object.values(nodes)) {
  for (const link of source.links) {
    ensureNode(link.target, link.relation === "人物" ? "全景" : link.relation);
    const targetNode = nodes[link.target];
    if (!targetNode.links.some((item) => item.target === source.id)) {
      targetNode.links.push({ target: source.id, relation: source.type });
    }
  }
}

const state = {
  center: "汉武帝",
  lens: "全景",
};

const svg = document.getElementById("starSvg");
const lensButtons = document.getElementById("lensButtons");
const centerTitle = document.getElementById("centerTitle");
const centerDesc = document.getElementById("centerDesc");

function nodeColor(type) {
  switch (type) {
    case "皇权":
      return "#ffd86b";
    case "宗室":
      return "#c9a7ff";
    case "武将":
      return "#ff8f8f";
    case "士人":
      return "#85d8ff";
    case "百姓":
      return "#98f0b1";
    default:
      return "#a6bfff";
  }
}

function setupLensButtons() {
  lensButtons.innerHTML = "";
  lenses.forEach((lens) => {
    const btn = document.createElement("button");
    btn.className = `lens-btn ${state.lens === lens ? "active" : ""}`;
    btn.textContent = lens;
    btn.addEventListener("click", () => {
      state.lens = lens;
      setupLensButtons();
      render();
    });
    lensButtons.appendChild(btn);
  });
}

function render() {
  const width = svg.clientWidth;
  const height = svg.clientHeight;
  svg.innerHTML = "";

  const centerNode = nodes[state.center];
  const neighbors = centerNode.links
    .map((l) => ({ ...nodes[l.target], relation: l.relation }))
    .filter((n) => state.lens === "全景" || n.type === state.lens || n.relation === state.lens);

  centerTitle.textContent = `${centerNode.id} · ${state.lens}视角`;
  centerDesc.textContent = centerNode.description;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.32;

  neighbors.forEach((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(neighbors.length, 1) - Math.PI / 2;
    node.x = centerX + Math.cos(angle) * radius;
    node.y = centerY + Math.sin(angle) * radius;
  });

  const ns = "http://www.w3.org/2000/svg";

  neighbors.forEach((node) => {
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", centerX);
    line.setAttribute("y1", centerY);
    line.setAttribute("x2", node.x);
    line.setAttribute("y2", node.y);
    line.setAttribute("stroke", "rgba(170,191,255,0.45)");
    line.setAttribute("stroke-width", "1.2");
    svg.appendChild(line);
  });

  function drawNode(node, isCenter = false) {
    const group = document.createElementNS(ns, "g");
    group.setAttribute("class", `node ${isCenter ? "center-node" : ""}`);

    const circle = document.createElementNS(ns, "circle");
    circle.setAttribute("cx", isCenter ? centerX : node.x);
    circle.setAttribute("cy", isCenter ? centerY : node.y);
    circle.setAttribute("r", isCenter ? 34 : 24);
    circle.setAttribute("fill", isCenter ? "#ffd86b" : nodeColor(node.type));
    circle.setAttribute("stroke", "rgba(255,255,255,0.88)");
    circle.setAttribute("stroke-width", "1.5");

    const text = document.createElementNS(ns, "text");
    text.setAttribute("x", isCenter ? centerX : node.x);
    text.setAttribute("y", (isCenter ? centerY : node.y) + 4);
    text.setAttribute("fill", "#09102a");
    text.setAttribute("font-size", isCenter ? "14" : "12");
    text.setAttribute("font-weight", "700");
    text.setAttribute("text-anchor", "middle");
    text.textContent = node.id;

    group.appendChild(circle);
    group.appendChild(text);

    if (!isCenter) {
      group.addEventListener("click", () => {
        state.center = node.id;
        render();
      });
    }

    svg.appendChild(group);
  }

  drawNode(centerNode, true);
  neighbors.forEach((node) => drawNode(node, false));
}

window.addEventListener("resize", render);
setupLensButtons();
render();
