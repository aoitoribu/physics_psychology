import { GAME_CONFIG, QUESTIONS } from "./questions.js";

const MAX_STAT = 30;
const MIN_STAT = -20;

const state = {
  teams: [],
  roundIndex: 0,
  teamIndex: 0,
  selected: null,
  currentRoundPicks: {},
  logLines: []
};

const els = {
  setup: document.getElementById("setup"),
  game: document.getElementById("game"),
  result: document.getElementById("result"),
  setupIntro: document.getElementById("setupIntro"),
  teamCount: document.getElementById("teamCount"),
  initialStamina: document.getElementById("initialStamina"),
  initialMood: document.getElementById("initialMood"),
  initialGpa: document.getElementById("initialGpa"),
  roundInfo: document.getElementById("roundInfo"),
  turnInfo: document.getElementById("turnInfo"),
  progressBar: document.getElementById("progressBar"),
  questionTitle: document.getElementById("questionTitle"),
  questionText: document.getElementById("questionText"),
  followTip: document.getElementById("followTip"),
  options: document.getElementById("options"),
  teams: document.getElementById("teams"),
  log: document.getElementById("log"),
  confirmBtn: document.getElementById("confirmBtn"),
  resultTable: document.getElementById("resultTable"),
  scoreRule: document.getElementById("scoreRule"),
  reflectionText: document.getElementById("reflectionText")
};

document.getElementById("startBtn").addEventListener("click", initGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);
document.getElementById("againBtn").addEventListener("click", resetGame);
document.getElementById("randomBtn").addEventListener("click", autoChoice);
els.confirmBtn.addEventListener("click", confirmChoice);

initStaticText();

function initStaticText(){
  const initial = GAME_CONFIG.initial;
  els.setupIntro.textContent = GAME_CONFIG.setupIntro;
  els.initialStamina.textContent = `体力 ${initial.stamina}`;
  els.initialMood.textContent = `心情 ${initial.mood}`;
  els.initialGpa.textContent = `GPA ${initial.gpa}`;
  els.scoreRule.textContent = scoreRuleText();
  els.reflectionText.textContent = GAME_CONFIG.reflection;
}

function initGame(){
  const count = clampNumber(Number(els.teamCount.value || 6), 2, 12);
  state.teams = Array.from({ length: count }, (_, i) => ({
    name: `第 ${i + 1} 组`,
    stamina: GAME_CONFIG.initial.stamina,
    mood: GAME_CONFIG.initial.mood,
    gpa: GAME_CONFIG.initial.gpa,
    skip: 0,
    decisions: []
  }));
  state.roundIndex = 0;
  state.teamIndex = 0;
  state.selected = null;
  state.currentRoundPicks = {};
  state.logLines = [];

  els.setup.classList.add("hidden");
  els.result.classList.add("hidden");
  els.game.classList.remove("hidden");
  addLog("游戏开始：欢迎进入期末周。请各组珍惜体力，也珍惜心情。");
  render();
}

function resetGame(){
  els.setup.classList.remove("hidden");
  els.game.classList.add("hidden");
  els.result.classList.add("hidden");
}

function render(){
  if(state.roundIndex >= QUESTIONS.length){
    showResult();
    return;
  }
  advanceSkippedTeamsIfNeeded();
  if(state.roundIndex >= QUESTIONS.length){
    showResult();
    return;
  }

  state.selected = null;
  els.confirmBtn.disabled = true;

  const question = QUESTIONS[state.roundIndex];
  els.roundInfo.textContent = `第 ${state.roundIndex + 1} 轮 / 共 ${QUESTIONS.length} 轮`;
  els.turnInfo.textContent = `｜当前决策：${state.teams[state.teamIndex].name}`;
  els.progressBar.style.width = `${progressPercent()}%`;
  els.questionTitle.textContent = question.title;
  els.questionText.textContent = question.text;
  els.followTip.textContent = GAME_CONFIG.followTip;

  renderOptions();
  renderTeams();
  renderLog();
}

function renderOptions(){
  const question = QUESTIONS[state.roundIndex];
  els.options.innerHTML = "";
  question.options.forEach((option, index) => {
    const used = state.currentRoundPicks[index] || 0;
    const finalScore = scoreWithDuplicatePenalty(option.score, used);
    const div = document.createElement("div");
    div.className = "option";
    div.addEventListener("click", () => selectOption(index, div));
    div.innerHTML = `
      <div class="option-title">
        <span>${option.name}</span>
        <span class="badge">${used ? `跟风折损 x${used}` : "独立选择"}</span>
      </div>
      <div class="option-desc">${option.desc}</div>
      <div class="delta">
        <span class="pill">${formatScore("基础分值", option.score)}</span>
        ${used ? `<span class="pill warn">${formatScore("本次结算", finalScore)}</span>` : ""}
      </div>
    `;
    els.options.appendChild(div);
  });
}

function renderTeams(){
  els.teams.innerHTML = "";
  state.teams.forEach((team, index) => {
    const div = document.createElement("div");
    div.className = `team${index === state.teamIndex ? " active" : ""}${team.skip > 0 ? " skip" : ""}`;
    div.innerHTML = `
      <h3>${team.name}<span class="badge">${team.skip > 0 ? `休息中 ${team.skip} 轮` : `总分 ${score(team).toFixed(1)}`}</span></h3>
      <div class="stats">
        <div class="stat">体力<b>${team.stamina}</b></div>
        <div class="stat">心情<b>${team.mood}</b></div>
        <div class="stat">GPA<b>${team.gpa}</b></div>
        <div class="stat">决策<b>${team.decisions.length}</b></div>
      </div>
    `;
    els.teams.appendChild(div);
  });
}

function renderLog(){
  els.log.innerHTML = state.logLines.map((line) => `<p>${line}</p>`).join("");
  els.log.scrollTop = els.log.scrollHeight;
}

function selectOption(index, element){
  state.selected = index;
  document.querySelectorAll(".option").forEach((option) => option.classList.remove("selected"));
  element.classList.add("selected");
  els.confirmBtn.disabled = false;
}

function autoChoice(){
  state.selected = Math.floor(Math.random() * QUESTIONS[state.roundIndex].options.length);
  document.querySelectorAll(".option").forEach((option, index) => {
    option.classList.toggle("selected", index === state.selected);
  });
  els.confirmBtn.disabled = false;
}

function confirmChoice(){
  if(state.selected === null) return;

  const team = state.teams[state.teamIndex];
  const question = QUESTIONS[state.roundIndex];
  const option = question.options[state.selected];
  const used = state.currentRoundPicks[state.selected] || 0;
  const finalScore = scoreWithDuplicatePenalty(option.score, used);

  applyScore(team, finalScore);
  team.decisions.push({
    round: state.roundIndex + 1,
    option: option.name,
    score: finalScore,
    duplicateCount: used
  });

  state.currentRoundPicks[state.selected] = used + 1;
  addLog(`${question.title}｜${team.name} 选择「${option.name}」。${formatScore("变化", finalScore)}${used ? `，已计入跟风折损 x${used}` : ""}。`);

  if(team.stamina <= 0){
    team.skip = GAME_CONFIG.restRoundsWhenStaminaEmpty;
    addLog(`⚠ ${team.name} 体力值已为 ${team.stamina}，进入强制休息：接下来停止决策 ${GAME_CONFIG.restRoundsWhenStaminaEmpty} 轮。`);
  }

  nextTurn();
}

function nextTurn(){
  state.teamIndex += 1;
  if(state.teamIndex >= state.teams.length){
    startNextRound();
  }
  render();
}

function startNextRound(){
  state.roundIndex += 1;
  state.teamIndex = 0;
  state.currentRoundPicks = {};
  if(state.roundIndex < QUESTIONS.length){
    addLog(`-- 进入第 ${state.roundIndex + 1} 轮。所有组重新面对新的期末事件。`);
    state.teams.forEach((team) => {
      if(team.skip > 0) team.skip -= 1;
    });
  }
}

function advanceSkippedTeamsIfNeeded(){
  let guard = 0;
  const maxSteps = state.teams.length * QUESTIONS.length + 5;
  while(
    state.roundIndex < QUESTIONS.length &&
    state.teams[state.teamIndex] &&
    state.teams[state.teamIndex].skip > 0 &&
    guard < maxSteps
  ){
    addLog(`${QUESTIONS[state.roundIndex].title}｜${state.teams[state.teamIndex].name} 正在强制休息，本轮无法决策。`);
    state.teamIndex += 1;
    if(state.teamIndex >= state.teams.length){
      startNextRound();
    }
    guard += 1;
  }
}

function showResult(){
  els.game.classList.add("hidden");
  els.result.classList.remove("hidden");
  const ranked = [...state.teams].sort((a, b) => score(b) - score(a));
  const rows = ranked.map((team, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${team.name}</td>
      <td>${team.stamina}</td>
      <td>${team.mood}</td>
      <td>${team.gpa}</td>
      <td><b>${score(team).toFixed(1)}</b></td>
      <td>${comment(team)}</td>
    </tr>
  `).join("");
  els.resultTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>排名</th><th>小组</th><th>体力</th><th>心情</th><th>GPA</th><th>总分</th><th>状态评价</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function applyScore(team, delta){
  team.stamina = clampStat(team.stamina + (delta.stamina || 0));
  team.mood = clampStat(team.mood + (delta.mood || 0));
  team.gpa = clampStat(team.gpa + (delta.gpa || 0));
}

function scoreWithDuplicatePenalty(scoreDelta, duplicateCount){
  const penalty = GAME_CONFIG.duplicateChoicePenalty;
  return {
    stamina: (scoreDelta.stamina || 0) + (penalty.stamina || 0) * duplicateCount,
    mood: (scoreDelta.mood || 0) + (penalty.mood || 0) * duplicateCount,
    gpa: (scoreDelta.gpa || 0) + (penalty.gpa || 0) * duplicateCount
  };
}

function score(team){
  const weights = GAME_CONFIG.scoreWeights;
  return team.stamina * weights.stamina + team.mood * weights.mood + team.gpa * weights.gpa;
}

function scoreRuleText(){
  const weights = GAME_CONFIG.scoreWeights;
  return `总分 = 体力 x ${weights.stamina} + 心情 x ${weights.mood} + GPA x ${weights.gpa}。每个选项都只有分值取舍，没有绝对对错。`;
}

function comment(team){
  if(team.stamina <= 0) return "学业还在，但人已经需要充电";
  if(team.mood >= 14 && team.gpa >= 12) return "平衡大师，值得全班学习";
  if(team.gpa >= 16 && team.stamina <= 4) return "卷赢了，但代价不小";
  if(team.mood <= 4) return "建议马上启动同伴支持系统";
  if(team.stamina >= 12 && team.gpa < 9) return "身体保住了，复习还要补";
  return "基本活过期末周";
}

function addLog(text){
  state.logLines.push(text);
  if(state.logLines.length > 80) state.logLines.shift();
}

function formatScore(label, delta){
  return `${label}：体力 ${signed(delta.stamina || 0)}｜心情 ${signed(delta.mood || 0)}｜GPA ${signed(delta.gpa || 0)}`;
}

function signed(value){
  return value > 0 ? `+${value}` : String(value);
}

function clampStat(value){
  return clampNumber(value, MIN_STAT, MAX_STAT);
}

function clampNumber(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function progressPercent(){
  return ((state.roundIndex * state.teams.length + state.teamIndex) / (QUESTIONS.length * state.teams.length)) * 100;
}
