const COLORS = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"];
const COLOR_HEX = {Red:"#ff647c",Blue:"#54a8ff",Green:"#54d6a0",Yellow:"#ffd166",Purple:"#b69cff",Orange:"#ff9f5a"};
const charts = {};
let activePath = [], activeStep = 0, playTimer = null, graphTimer = null, graphData = null, graphStep = 0;


function stateKey(state) { return state.join("|"); }
function renderSearchGraph(data) {
  graphData = data.graph || null;
  const panel = document.getElementById("searchGraphPanel");
  if (!graphData || !graphData.nodes.length) { panel.classList.add("hidden"); return; }
  panel.classList.remove("hidden");
  const slider = document.getElementById("graphSlider");
  slider.max = Math.max(0, graphData.exploration_order.length - 1);
  graphStep = 0;
  drawSearchGraph();
}
function drawSearchGraph() {
  if (!graphData) return;
  const order = graphData.exploration_order || [];
  const active = order[graphStep];
  const visited = new Set(order.slice(0, graphStep));
  const levels = new Map();
  graphData.nodes.forEach(node => {
    if (!levels.has(node.depth)) levels.set(node.depth, []);
    levels.get(node.depth).push(node);
  });
  const maxDepth = Math.max(...levels.keys(), 0);
  const maxRows = Math.max(...[...levels.values()].map(a => a.length), 1);
  const width = Math.max(760, 180 + (maxDepth + 1) * 190);
  const height = Math.max(360, maxRows * 76 + 100);
  const positions = new Map();
  levels.forEach((nodes, depth) => nodes.forEach((node, index) => {
    positions.set(stateKey(node.state), {x: 90 + depth * 185, y: 55 + (index + 0.5) * (height - 100) / nodes.length});
  }));
  const edges = graphData.edges.map(edge => {
    const a = positions.get(stateKey(edge.from)), b = positions.get(stateKey(edge.to));
    if (!a || !b) return "";
    const isActiveEdge = active && stateKey(edge.to) === stateKey(active);
    return `<path class="graph-edge ${isActiveEdge ? "edge-active" : ""}" d="M ${a.x+23} ${a.y} C ${a.x+85} ${a.y}, ${b.x-85} ${b.y}, ${b.x-23} ${b.y}"/>`;
  }).join("");
  const nodes = graphData.nodes.map(node => {
    const key = stateKey(node.state), pos = positions.get(key);
    const isActive = active && key === stateKey(active);
    const isVisited = visited.has(key);
    const isStart = node.depth === 0;
    const isGoal = node.status === "goal";
    const isPath = node.status === "path";
    const cls = isActive ? "node-active" : isGoal ? "node-goal" : isPath ? "node-path" : isVisited ? "node-explored" : "node-frontier";
    const short = node.state.map(c => c[0]).join("");
    const balls = node.state.map((c,i)=>`<circle cx="${-12+i*12}" cy="0" r="4.5" fill="${COLOR_HEX[c]}"/>`).join("");
    const score = node.h === null ? "" : `h=${node.h} · g=${node.g}`;
    return `<g class="graph-node ${cls}" transform="translate(${pos.x},${pos.y})">
      <circle class="node-halo" r="27"/><circle class="node-ring" r="21"/>
      <g>${balls}</g><text class="node-code" y="39">${short}</text>
      <title>${node.state.join(" · ")}${score ? " | "+score : ""}</title>
    </g>`;
  }).join("");
  const svg = document.getElementById("searchGraph");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.width = `${width}px`; svg.style.height = `${height}px`;
  svg.innerHTML = `<defs><pattern id="graphGrid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#293957"/></pattern></defs>
    <rect width="100%" height="100%" fill="url(#graphGrid)"/>${edges}${nodes}`;
  document.getElementById("graphSlider").value = graphStep;
  document.getElementById("graphStepTitle").textContent = active ? `Exploration ${graphStep+1} of ${order.length}` : "Search begins";
  const currentNode = graphData.nodes.find(n => active && stateKey(n.state) === stateKey(active));
  document.getElementById("graphStepDescription").textContent = currentNode
    ? `${currentNode.state.join(" · ")} — ${currentNode.status === "goal" ? "Goal discovered!" : `distance estimate h = ${currentNode.h}`}`
    : "Move through the search to see how states are discovered.";
  document.getElementById("graphPrev").disabled = graphStep === 0;
  document.getElementById("graphNext").disabled = graphStep >= order.length-1;
}
function stopGraphPlayback() {
  if (graphTimer) clearInterval(graphTimer);
  graphTimer = null;
  const btn = document.getElementById("graphPlay");
  if (btn) btn.textContent = "▶ Play search";
}

function createSlots(containerId, initial) {
  const container = document.getElementById(containerId); container.innerHTML = "";
  initial.forEach((color, i) => {
    const select = document.createElement("select"); select.className = "slot"; select.setAttribute("aria-label", `Slot ${i + 1}`);
    COLORS.forEach(name => { const option = document.createElement("option"); option.value = name; option.textContent = name; select.appendChild(option); });
    select.value = color; paintSlot(select); select.addEventListener("change", () => paintSlot(select)); container.appendChild(select);
  });
}
function paintSlot(select) { select.style.setProperty("--slot-color", COLOR_HEX[select.value]); }
function readSlots(id) { return [...document.querySelectorAll(`#${id} select`)].map(x => x.value); }
function randomState() { return Array.from({length:3}, () => COLORS[Math.floor(Math.random()*COLORS.length)]); }
function stateMarkup(state, compact=false) { return `<div class="state-balls ${compact?'compact':''}">${state.map(c=>`<span class="ball" title="${c}" style="--ball:${COLOR_HEX[c]}"></span>`).join("")}</div><span class="state-name">${state.join(" · ")}</span>`; }
function stopPlayback() { if (playTimer) clearInterval(playTimer); playTimer = null; document.getElementById("playBtn").textContent = "▶ Play"; }
function renderStep(index) {
  if (!activePath.length) return; activeStep = Math.max(0, Math.min(index, activePath.length-1));
  document.getElementById("currentState").innerHTML = stateMarkup(activePath[activeStep]);
  document.getElementById("stepCounter").textContent = `Step ${activeStep+1} / ${activePath.length}`;
  document.getElementById("stepHint").textContent = activeStep === 0 ? "Initial state" : activeStep === activePath.length-1 ? "Goal reached!" : `Move ${activeStep}: one slot changed`;
  document.getElementById("stepSlider").value = activeStep;
  document.getElementById("prevBtn").disabled = activeStep === 0; document.getElementById("nextBtn").disabled = activeStep === activePath.length-1;
}
function showSingle(data) {
  document.getElementById("singleDetails").classList.remove("hidden"); document.getElementById("comparisonPanel").classList.add("hidden");
  document.getElementById("resultHeading").textContent = `${data.algorithm} search`; document.getElementById("resultBadge").textContent = data.found ? "Solution found" : "No solution";
  document.getElementById("metrics").innerHTML = [["Execution time",`${data.execution_time} ms`],["Explored states",data.explored_count],["Generated states",data.generated_count],["Path cost",data.path_cost ?? "—"],["Max frontier",data.max_frontier_size]].map(([k,v])=>`<div class="metric"><small>${k}</small><strong>${v}</strong></div>`).join("");
  activePath = data.path || []; activeStep = 0; stopPlayback(); stopGraphPlayback(); renderSearchGraph(data);
  document.getElementById("pathLength").textContent = activePath.length ? `${activePath.length} states · ${Math.max(0,activePath.length-1)} moves` : "No path";
  document.getElementById("pathView").innerHTML = activePath.length ? activePath.map((s,i)=>`<div class="path-node"><b>${i}</b>${stateMarkup(s,true)}</div>`).join("") : "No path found.";
  document.getElementById("exploredView").innerHTML = (data.explored||[]).slice(0,36).map((s,i)=>`<span class="explored-chip"><b>${i+1}</b>${stateMarkup(s,true)}</span>`).join("") + (data.explored_count>36?`<span class="muted-note">Showing first 36 of ${data.explored_count} explored states.</span>`:"");
  document.getElementById("stepSlider").max = Math.max(0,activePath.length-1); renderStep(0);
  drawCharts([data]);
}
function showComparison(results) {
  document.getElementById("singleDetails").classList.add("hidden"); document.getElementById("comparisonPanel").classList.remove("hidden");
  document.getElementById("resultHeading").textContent = "All algorithms compared"; document.getElementById("resultBadge").textContent = "4 strategies tested";
  document.getElementById("metrics").innerHTML = [["Algorithms tested",results.length],["Best path cost",Math.min(...results.filter(r=>r.path_cost!==null).map(r=>r.path_cost))],["Fewest explored",Math.min(...results.map(r=>r.explored_count))],["Fastest time (ms)",Math.min(...results.map(r=>r.execution_time))]].map(([k,v])=>`<div class="metric"><small>${k}</small><strong>${Number.isFinite(v)?v:"—"}</strong></div>`).join("");
  document.getElementById("comparisonBody").innerHTML = results.map(r=>`<tr><td><strong>${r.algorithm}</strong></td><td>${r.execution_time}</td><td>${r.explored_count}</td><td>${r.generated_count}</td><td>${r.path_cost??"—"}</td><td>${r.max_frontier_size}</td></tr>`).join("");
  drawCharts(results);
}
function drawCharts(results) {
  Object.values(charts).forEach(chart=>chart.destroy());
  const labels=results.map(r=>r.algorithm), common={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:"#dce5ff",usePointStyle:true,boxWidth:8}},tooltip:{backgroundColor:"#101a30",titleColor:"#fff",bodyColor:"#dce5ff",padding:12}},scales:{x:{ticks:{color:"#aab8d4"},grid:{color:"#263653"}},y:{beginAtZero:true,ticks:{color:"#aab8d4"},grid:{color:"#263653"}}}};
  const make=(id,type,datasets)=>{charts[id]=new Chart(document.getElementById(id),{type,data:{labels,datasets},options:structuredClone(common)});};
  make("statesChart","bar",[{label:"Explored",data:results.map(r=>r.explored_count),backgroundColor:"#7895ff",borderRadius:7},{label:"Generated",data:results.map(r=>r.generated_count),backgroundColor:"#4fd1a5",borderRadius:7}]);
  make("timeChart","bar",[{label:"Execution time (ms)",data:results.map(r=>r.execution_time),backgroundColor:"#b69cff",borderRadius:7}]);
  make("pathChart","bar",[{label:"Path cost (moves)",data:results.map(r=>r.path_cost??0),backgroundColor:"#ffbd69",borderRadius:7}]);
  make("frontierChart","bar",[{label:"Maximum frontier",data:results.map(r=>r.max_frontier_size),backgroundColor:"#55b8ef",borderRadius:7}]);
}
document.getElementById("graphPrev").addEventListener("click",()=>{stopGraphPlayback();graphStep=Math.max(0,graphStep-1);drawSearchGraph();});
document.getElementById("graphNext").addEventListener("click",()=>{stopGraphPlayback();graphStep=Math.min(graphData.exploration_order.length-1,graphStep+1);drawSearchGraph();});
document.getElementById("graphSlider").addEventListener("input",e=>{stopGraphPlayback();graphStep=Number(e.target.value);drawSearchGraph();});
document.getElementById("graphPlay").addEventListener("click",()=>{if(graphTimer){stopGraphPlayback();return;}if(graphStep>=graphData.exploration_order.length-1){graphStep=0;drawSearchGraph();}document.getElementById("graphPlay").textContent="Ⅱ Pause";graphTimer=setInterval(()=>{if(graphStep>=graphData.exploration_order.length-1){stopGraphPlayback();return;}graphStep++;drawSearchGraph();},650);});
document.getElementById("randomBtn").addEventListener("click",()=>{createSlots("startSlots",randomState());createSlots("goalSlots",randomState());document.getElementById("status").textContent="A new challenge is ready. Run a search when you are ready.";});
document.getElementById("runBtn").addEventListener("click",async()=>{
  const button=document.getElementById("runBtn"),status=document.getElementById("status"); button.disabled=true; stopPlayback(); status.textContent="Exploring the state space...";
  try { const response=await fetch("/api/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({start:readSlots("startSlots"),goal:readSlots("goalSlots"),algorithm:document.getElementById("algorithm").value})}); const data=await response.json(); if(!response.ok) throw new Error(data.error||"Search failed."); document.getElementById("results").classList.remove("hidden"); if(data.results) showComparison(data.results); else showSingle(data); status.textContent="Search completed. Explore the graphs and solution playback below."; document.getElementById("results").scrollIntoView({behavior:"smooth",block:"start"}); }
  catch(error){status.textContent=error.message;} finally{button.disabled=false;}
});
document.getElementById("prevBtn").addEventListener("click",()=>{stopPlayback();renderStep(activeStep-1);});
document.getElementById("nextBtn").addEventListener("click",()=>{stopPlayback();renderStep(activeStep+1);});
document.getElementById("stepSlider").addEventListener("input",e=>{stopPlayback();renderStep(Number(e.target.value));});
document.getElementById("playBtn").addEventListener("click",()=>{if(playTimer){stopPlayback();return;} if(activeStep>=activePath.length-1)renderStep(0); document.getElementById("playBtn").textContent="Ⅱ Pause"; playTimer=setInterval(()=>{if(activeStep>=activePath.length-1){stopPlayback();return;}renderStep(activeStep+1);},850);});
createSlots("startSlots",["Red","Blue","Green"]); createSlots("goalSlots",["Yellow","Purple","Orange"]);
