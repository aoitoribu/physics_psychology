import { GAME_CONFIG, QUESTIONS } from "./questions.js";

const MAX_STAT = 30;
const MIN_STAT = -20;
const FIRST_COMPETITION_TURN_MS = 120000;
const NEXT_COMPETITION_TURN_MS = 30000;
const TIMER_TICK_MS = 100;

const state = {
  mode: "competition",
  teams: [],
  turnOrder: [],
  roundAnsweredCount: 0,
  timerId: null,
  timerStartedAt: 0,
  timerDuration: 0,
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
  modeOptions: document.querySelectorAll(".mode-option"),
  competitionPanel: document.getElementById("competitionPanel"),
  challengePanel: document.getElementById("challengePanel"),
  teamCount: document.getElementById("teamCount"),
  initialStaminaInput: document.getElementById("initialStaminaInput"),
  initialMoodInput: document.getElementById("initialMoodInput"),
  initialGpaInput: document.getElementById("initialGpaInput"),
  difficultySelect: document.getElementById("difficultySelect"),
  difficultyHint: document.getElementById("difficultyHint"),
  roundInfo: document.getElementById("roundInfo"),
  turnInfo: document.getElementById("turnInfo"),
  progressBar: document.getElementById("progressBar"),
  questionTitle: document.getElementById("questionTitle"),
  questionText: document.getElementById("questionText"),
  followTip: document.getElementById("followTip"),
  countdownTrack: document.getElementById("countdownTrack"),
  countdownBar: document.getElementById("countdownBar"),
  teamTitle: document.getElementById("teamTitle"),
  options: document.getElementById("options"),
  teams: document.getElementById("teams"),
  log: document.getElementById("log"),
  confirmBtn: document.getElementById("confirmBtn"),
  resultTable: document.getElementById("resultTable"),
  scoreRule: document.getElementById("scoreRule"),
  reflectionText: document.getElementById("reflectionText")
};

document.getElementById("startBtn").addEventListener("click", initGame);
document.getElementById("challengeStartBtn").addEventListener("click", initGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);
document.getElementById("againBtn").addEventListener("click", resetGame);
document.getElementById("randomBtn").addEventListener("click", autoChoice);
els.confirmBtn.addEventListener("click", confirmChoice);
els.modeOptions.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});
els.difficultySelect.addEventListener("change", renderDifficultyHint);

initStaticText();

function initStaticText(){
  els.setupIntro.textContent = GAME_CONFIG.setupIntro;
  els.scoreRule.textContent = scoreRuleText();
  els.reflectionText.textContent = GAME_CONFIG.reflection;
  renderDifficultyHint();
}

function initGame(){
  const initial = currentInitialStats();
  const count = state.mode === "competition" ? clampNumber(Number(els.teamCount.value || 6), 2, 12) : 1;
  state.teams = Array.from({ length: count }, (_, i) => ({
    name: state.mode === "competition" ? `第 ${i + 1} 组` : "当前状态",
    stamina: initial.stamina,
    mood: initial.mood,
    gpa: initial.gpa,
    skip: 0,
    decisions: []
  }));
  state.roundIndex = 0;
  state.teamIndex = 0;
  state.roundAnsweredCount = 0;
  state.turnOrder = createTurnOrder(count);
  state.selected = null;
  state.currentRoundPicks = {};
  state.logLines = [];

  els.setup.classList.add("hidden");
  els.result.classList.add("hidden");
  els.game.classList.remove("hidden");
  document.body.classList.add("is-playing");
  document.body.classList.remove("is-result");
  addLog(`${state.mode === "competition" ? "竞赛模式" : "闯关模式"}开始：欢迎进入期末周。请珍惜体力，也珍惜心情。`);
  addRoundOrderLog();
  render();
}

function resetGame(){
  clearTurnTimer();
  els.setup.classList.remove("hidden");
  els.game.classList.add("hidden");
  els.result.classList.add("hidden");
  document.body.classList.remove("is-playing", "is-result");
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
  const activeTeam = currentTeam();
  els.roundInfo.textContent = `第 ${state.roundIndex + 1} 轮 / 共 ${QUESTIONS.length} 轮`;
  els.turnInfo.textContent = `｜当前决策：${activeTeam.name}`;
  els.progressBar.style.width = `${progressPercent()}%`;
  els.questionTitle.textContent = question.title;
  els.questionText.textContent = question.text;
  els.followTip.textContent = GAME_CONFIG.followTip;
  els.teamTitle.textContent = state.mode === "competition" ? "当前各组状态" : "当前闯关状态";

  renderOptions();
  renderTeams();
  renderLog();
  startTurnTimer();
}

function renderOptions(){
  const question = QUESTIONS[state.roundIndex];
  els.options.innerHTML = "";
  question.options.forEach((option, index) => {
    const picked = state.currentRoundPicks[index]?.length || 0;
    const previewScore = scoreWithDuplicatePenalty(option.score, picked);
    const div = document.createElement("div");
    div.className = "option";
    div.addEventListener("click", () => selectOption(index, div));
    div.innerHTML = `
      <div class="option-title">
        <span>${option.name}</span>
        <span class="badge">${picked ? `共同折损 x${picked}` : "独立选择"}</span>
      </div>
      <div class="option-desc">${option.desc}</div>
      <div class="delta">
        <span class="pill">${formatScore("基础分值", option.score)}</span>
        ${picked ? `<span class="pill warn">${formatScore("若选择后", previewScore)}</span>` : ""}
      </div>
    `;
    els.options.appendChild(div);
  });
}

function renderTeams(){
  els.teams.innerHTML = "";
  const activeTeamIndex = currentTeamIndex();
  state.teams.forEach((team, index) => {
    const div = document.createElement("div");
    div.className = `team${index === activeTeamIndex ? " active" : ""}${team.skip > 0 ? " skip" : ""}`;
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
  clearTurnTimer();

  const activeTeamIndex = currentTeamIndex();
  const team = state.teams[activeTeamIndex];
  const question = QUESTIONS[state.roundIndex];
  const option = question.options[state.selected];
  const baseScore = { ...option.score };

  applyScore(team, baseScore);
  const decision = {
    round: state.roundIndex + 1,
    optionIndex: state.selected,
    option: option.name,
    score: { ...baseScore },
    finalScore: { ...baseScore },
    duplicatePenaltyCount: 0
  };
  team.decisions.push(decision);

  if(!state.currentRoundPicks[state.selected]) state.currentRoundPicks[state.selected] = [];
  state.currentRoundPicks[state.selected].push({ teamIndex: activeTeamIndex, decision });
  rebalanceSharedPenalty(state.selected);

  addLog(`${question.title}｜${team.name} 选择「${option.name}」。${formatScore("当前结算", decision.finalScore)}${decision.duplicatePenaltyCount ? `，该选项所有队伍共同折损 x${decision.duplicatePenaltyCount}` : ""}。`);

  updateRestStateForRoundPick(state.selected);
  state.roundAnsweredCount += 1;

  nextTurn();
}

function setMode(mode){
  state.mode = mode;
  els.modeOptions.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  els.competitionPanel.classList.toggle("active", mode === "competition");
  els.challengePanel.classList.toggle("active", mode === "challenge");
}

function renderDifficultyHint(){
  const difficulty = GAME_CONFIG.difficulties[els.difficultySelect.value] || GAME_CONFIG.difficulties.normal;
  els.difficultyHint.textContent = `${difficulty.hint} 初始：体力 ${difficulty.initial.stamina} / 心情 ${difficulty.initial.mood} / GPA ${difficulty.initial.gpa}`;
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
  state.roundAnsweredCount = 0;
  state.turnOrder = createTurnOrder(state.teams.length);
  state.currentRoundPicks = {};
  if(state.roundIndex < QUESTIONS.length){
    addLog(`-- 进入第 ${state.roundIndex + 1} 轮。所有组重新面对新的期末事件。`);
    addRoundOrderLog();
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
    currentTeam() &&
    currentTeam().skip > 0 &&
    guard < maxSteps
  ){
    addLog(`${QUESTIONS[state.roundIndex].title}｜${currentTeam().name} 正在强制休息，本轮无法决策。`);
    state.teamIndex += 1;
    if(state.teamIndex >= state.teams.length){
      startNextRound();
    }
    guard += 1;
  }
}

function showResult(){
  clearTurnTimer();
  els.game.classList.add("hidden");
  els.result.classList.remove("hidden");
  document.body.classList.remove("is-playing");
  document.body.classList.add("is-result");
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

function startTurnTimer(){
  clearTurnTimer();
  if(state.mode !== "competition"){
    els.countdownTrack.classList.add("hidden");
    return;
  }
  els.countdownTrack.classList.remove("hidden");
  state.timerDuration = state.roundAnsweredCount === 0 ? FIRST_COMPETITION_TURN_MS : NEXT_COMPETITION_TURN_MS;
  state.timerStartedAt = Date.now();
  els.countdownBar.style.width = "100%";
  state.timerId = window.setInterval(updateTurnTimer, TIMER_TICK_MS);
}

function updateTurnTimer(){
  const elapsed = Date.now() - state.timerStartedAt;
  const ratio = Math.max(0, 1 - elapsed / state.timerDuration);
  els.countdownBar.style.width = `${ratio * 100}%`;
  if(ratio > 0) return;
  clearTurnTimer();
  if(state.mode !== "competition" || state.roundIndex >= QUESTIONS.length) return;
  if(state.selected === null) autoChoice();
  addLog(`${currentTeam().name} 倒计时结束，系统随机提交本组选择。`);
  confirmChoice();
}

function clearTurnTimer(){
  if(state.timerId !== null){
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function currentTeamIndex(){
  return state.turnOrder[state.teamIndex] ?? state.teamIndex;
}

function currentTeam(){
  return state.teams[currentTeamIndex()];
}

function createTurnOrder(count){
  const order = Array.from({ length: count }, (_, index) => index);
  if(state.mode !== "competition") return order;
  for(let i = order.length - 1; i > 0; i -= 1){
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function addRoundOrderLog(){
  if(state.mode !== "competition") return;
  const names = state.turnOrder.map((teamIndex) => state.teams[teamIndex].name).join(" -> ");
  addLog(`本轮答题顺序：${names}。`);
}

function rebalanceSharedPenalty(optionIndex){
  const records = state.currentRoundPicks[optionIndex] || [];
  const targetPenaltyCount = Math.max(0, records.length - 1);
  const penalty = GAME_CONFIG.duplicateChoicePenalty;
  records.forEach((record) => {
    const diff = targetPenaltyCount - record.decision.duplicatePenaltyCount;
    if(diff <= 0) return;
    const delta = multiplyScore(penalty, diff);
    applyScore(state.teams[record.teamIndex], delta);
    record.decision.duplicatePenaltyCount = targetPenaltyCount;
    record.decision.finalScore = addScores(record.decision.score, multiplyScore(penalty, targetPenaltyCount));
  });
  if(records.length > 1){
    const names = records.map((record) => state.teams[record.teamIndex].name).join("、");
    addLog(`跟风折损更新：${names} 都选择了同一选项，当前共同折损 x${targetPenaltyCount}。`);
  }
}

function updateRestStateForRoundPick(optionIndex){
  const records = state.currentRoundPicks[optionIndex] || [];
  records.forEach((record) => {
    const team = state.teams[record.teamIndex];
    if(team.stamina <= 0 && team.skip <= 0){
      team.skip = GAME_CONFIG.restRoundsWhenStaminaEmpty;
      addLog(`⚠ ${team.name} 体力值已为 ${team.stamina}，进入强制休息：接下来停止决策 ${GAME_CONFIG.restRoundsWhenStaminaEmpty} 轮。`);
    }
  });
}

function scoreWithDuplicatePenalty(scoreDelta, duplicateCount){
  const penalty = GAME_CONFIG.duplicateChoicePenalty;
  return addScores(scoreDelta, multiplyScore(penalty, duplicateCount));
}

function score(team){
  const weights = GAME_CONFIG.scoreWeights;
  return team.stamina * weights.stamina + team.mood * weights.mood + team.gpa * weights.gpa;
}

function scoreRuleText(){
  const weights = GAME_CONFIG.scoreWeights;
  return `总分 = 体力 x ${weights.stamina} + 心情 x ${weights.mood} + GPA x ${weights.gpa}。每个选项都只有分值取舍，没有绝对对错。`;
}

function currentInitialStats(){
  if(state.mode === "challenge"){
    const difficulty = GAME_CONFIG.difficulties[els.difficultySelect.value] || GAME_CONFIG.difficulties.normal;
    return { ...difficulty.initial };
  }
  return {
    stamina: clampNumber(Number(els.initialStaminaInput.value || GAME_CONFIG.initial.stamina), MIN_STAT, MAX_STAT),
    mood: clampNumber(Number(els.initialMoodInput.value || GAME_CONFIG.initial.mood), MIN_STAT, MAX_STAT),
    gpa: clampNumber(Number(els.initialGpaInput.value || GAME_CONFIG.initial.gpa), MIN_STAT, MAX_STAT)
  };
}

function addScores(a, b){
  return {
    stamina: (a.stamina || 0) + (b.stamina || 0),
    mood: (a.mood || 0) + (b.mood || 0),
    gpa: (a.gpa || 0) + (b.gpa || 0)
  };
}

function multiplyScore(delta, count){
  return {
    stamina: (delta.stamina || 0) * count,
    mood: (delta.mood || 0) * count,
    gpa: (delta.gpa || 0) * count
  };
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
