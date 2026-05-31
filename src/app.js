import { GAME_CONFIG, QUESTIONS } from "./questions.js";

const MAX_STAT = 30;
const MIN_STAT = -20;
const FIRST_COMPETITION_TURN_MS = 120000;
const NEXT_COMPETITION_TURN_MS = 30000;
const TIMER_TICK_MS = 100;

const state = {
  mode: "competition",
  teams: [],
  batches: [],
  roundBatchOrders: [],
  batchOrder: [],
  batchCursor: 0,
  batchTurnOrder: [],
  batchTeamCursor: 0,
  roundDecisionCount: 0,
  timerId: null,
  timerEndsAt: 0,
  timerDuration: 0,
  timerRemaining: 0,
  timerPaused: false,
  roundIndex: 0,
  selected: null,
  currentRoundSettledPicks: {},
  currentBatchRecords: [],
  hideScoreHints: false,
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
  hideScoreHintsInput: document.getElementById("hideScoreHintsInput"),
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
  timerLabel: document.getElementById("timerLabel"),
  pauseBtn: document.getElementById("pauseBtn"),
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
els.pauseBtn.addEventListener("click", toggleTimerPause);
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
  const count = state.mode === "competition" ? clampNumber(Number(els.teamCount.value || 15), 2, 20) : 1;
  state.teams = Array.from({ length: count }, (_, i) => ({
    name: state.mode === "competition" ? `第 ${i + 1} 组` : "当前状态",
    stamina: initial.stamina,
    mood: initial.mood,
    gpa: initial.gpa,
    skip: 0,
    restCount: 0,
    decisions: []
  }));
  state.batches = createBatches(count, GAME_CONFIG.batchSize || 5);
  state.roundBatchOrders = createRoundBatchOrders(state.batches.length, QUESTIONS.length);
  state.roundIndex = 0;
  state.selected = null;
  state.hideScoreHints = Boolean(els.hideScoreHintsInput?.checked);
  state.logLines = [];

  els.setup.classList.add("hidden");
  els.result.classList.add("hidden");
  els.game.classList.remove("hidden");
  document.body.classList.add("is-playing");
  document.body.classList.remove("is-result");

  addLog(`${state.mode === "competition" ? "竞赛模式" : "闯关模式"}开始：欢迎进入期末周。`);
  startRound();
  render();
}

function resetGame(){
  clearTurnTimer();
  els.setup.classList.remove("hidden");
  els.game.classList.add("hidden");
  els.result.classList.add("hidden");
  document.body.classList.remove("is-playing", "is-result");
}

function startRound(){
  state.batchOrder = state.roundBatchOrders[state.roundIndex] || createBatchOrder(state.batches.length);
  state.batchCursor = 0;
  state.roundDecisionCount = 0;
  state.currentRoundSettledPicks = {};
  startBatch();
  addRoundOrderLog();
}

function startBatch(){
  const teamIndexes = currentBatchTeamIndexes();
  state.batchTurnOrder = state.mode === "competition" ? shuffle([...teamIndexes]) : [...teamIndexes];
  state.batchTeamCursor = 0;
  state.currentBatchRecords = [];
  if(state.roundIndex < QUESTIONS.length && teamIndexes.length){
    addLog(`${QUESTIONS[state.roundIndex].title}｜${currentBatchLabel()}开始，出场顺序：${state.batchTurnOrder.map(teamName).join(" -> ")}。`);
  }
}

function render(){
  if(state.roundIndex >= QUESTIONS.length){
    showResult();
    return;
  }

  advanceUnavailableTeamsIfNeeded();
  if(state.roundIndex >= QUESTIONS.length){
    showResult();
    return;
  }

  state.selected = null;
  els.confirmBtn.disabled = true;

  const question = QUESTIONS[state.roundIndex];
  const activeTeam = currentTeam();
  els.roundInfo.textContent = `第 ${state.roundIndex + 1} 轮 / 共 ${QUESTIONS.length} 轮｜${currentBatchLabel()}`;
  els.turnInfo.textContent = activeTeam
    ? `｜当前记录：${activeTeam.name}｜批次顺序：${batchOrderText()}`
    : `｜批次结算中`;
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
    const settledCount = settledPickCount(index);
    const rate = successRate(settledCount);
    const div = document.createElement("div");
    div.className = "option";
    div.addEventListener("click", () => selectOption(index, div));
    div.innerHTML = `
      <div class="option-title">
        <span>${option.name}</span>
        <span class="badge">${settledCount ? `已选 ${settledCount} 组` : "尚无人结算"}｜成功率 ${rate}%</span>
      </div>
      <div class="option-desc">${option.desc}</div>
      ${state.hideScoreHints ? "" : `
        <div class="delta">
          <span class="pill">${formatScore("基础分值", option.score)}</span>
          <span class="pill ${settledCount ? "warn" : "good"}">当前预计成功率 ${rate}%</span>
        </div>
      `}
    `;
    els.options.appendChild(div);
  });
}

function renderTeams(){
  els.teams.innerHTML = "";
  const activeTeamIndex = currentTeamIndex();
  const batchSet = new Set(currentBatchTeamIndexes());
  state.teams.forEach((team, index) => {
    const div = document.createElement("div");
    div.className = [
      "team",
      index === activeTeamIndex ? "active" : "",
      batchSet.has(index) ? "in-batch" : "",
      team.skip > 0 ? "skip" : ""
    ].filter(Boolean).join(" ");
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
  state.currentBatchRecords.push({
    teamIndex: activeTeamIndex,
    optionIndex: state.selected,
    option,
    score: { ...option.score }
  });
  team.decisions.push({
    round: state.roundIndex + 1,
    optionIndex: state.selected,
    option: option.name,
    score: { ...option.score },
    finalScore: null,
    successRate: null,
    roll: null,
    success: null,
    batch: currentBatchLabel()
  });

  addLog(`${question.title}｜${team.name} 已记录「${option.name}」，等待${currentBatchLabel()}统一结算。`);
  state.roundDecisionCount += 1;
  state.batchTeamCursor += 1;

  finishBatchIfNeeded();
  render();
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

function finishBatchIfNeeded(){
  while(state.roundIndex < QUESTIONS.length && state.batchTeamCursor >= state.batchTurnOrder.length){
    settleCurrentBatch();
    state.batchCursor += 1;
    if(state.batchCursor >= state.batchOrder.length){
      startNextRound();
      return;
    }
    startBatch();
    advanceUnavailableTeamsIfNeeded();
  }
}

function startNextRound(){
  state.roundIndex += 1;
  if(state.roundIndex < QUESTIONS.length){
    addLog(`-- 进入第 ${state.roundIndex + 1} 轮。所有组重新面对新的期末事件。`);
    startRound();
  }
}

function advanceUnavailableTeamsIfNeeded(){
  let guard = 0;
  const maxSteps = Math.max(10, state.teams.length * QUESTIONS.length * 2);
  while(state.roundIndex < QUESTIONS.length && guard < maxSteps){
    const team = currentTeam();
    if(!team){
      finishBatchIfNeeded();
      guard += 1;
      continue;
    }
    if(team.skip <= 0) return;
    processForcedRest(team);
    state.batchTeamCursor += 1;
    finishBatchIfNeeded();
    guard += 1;
  }
}

function processForcedRest(team){
  addLog(`${QUESTIONS[state.roundIndex].title}｜${team.name} 正在强制休息，本次无法主动选择。`);
  team.skip -= 1;
  team.restCount += 1;
  if(team.skip <= 0){
    const recovered = [];
    if(team.stamina <= 0){
      team.stamina = 1;
      recovered.push("体力");
    }
    if(team.mood <= 0){
      team.mood = 1;
      recovered.push("心情");
    }
    if(recovered.length){
      addLog(`${team.name} 休息结束，${recovered.join("、")}恢复到 1，可以再次作答。`);
    }
  }
}

function settleCurrentBatch(){
  if(!state.currentBatchRecords.length){
    addLog(`${currentBatchLabel()}没有可结算的主动选择。`);
    return;
  }

  const records = state.currentBatchRecords;
  const question = QUESTIONS[state.roundIndex];
  const settledCountsBeforeBatch = snapshotSettledCounts();
  addLog(`${question.title}｜${currentBatchLabel()}开始统一结算。`);

  records.forEach((record) => {
    const team = state.teams[record.teamIndex];
    const sameBefore = settledCountsBeforeBatch[record.optionIndex] || 0;
    const rate = successRate(sameBefore);
    const roll = Math.floor(Math.random() * 100) + 1;
    const success = roll <= rate;
    const finalScore = success ? { ...record.score } : failedScore(record.score);
    const decision = team.decisions[team.decisions.length - 1];

    applyScore(team, finalScore);
    Object.assign(decision, {
      finalScore: { ...finalScore },
      successRate: rate,
      roll,
      success
    });
    if(!state.currentRoundSettledPicks[record.optionIndex]){
      state.currentRoundSettledPicks[record.optionIndex] = [];
    }
    state.currentRoundSettledPicks[record.optionIndex].push(record.teamIndex);

    addLog(`${team.name}｜${record.option.name}｜成功率 ${rate}%｜随机数 ${roll}｜${success ? "成功" : "受阻"}，${formatScore("结算", finalScore)}。`);
    updateRestStateForTeam(team);
  });
}

function updateRestStateForTeam(team){
  if(team.skip > 0) return;
  const staminaEmpty = team.stamina <= 0;
  const moodEmpty = team.mood <= 0;
  if(!staminaEmpty && !moodEmpty) return;
  team.skip = staminaEmpty && moodEmpty ? 2 : 1;
  const reason = [
    staminaEmpty ? "体力" : "",
    moodEmpty ? "心情" : ""
  ].filter(Boolean).join("、");
  addLog(`${team.name} 的${reason}已耗尽，进入强制休息 ${team.skip} 轮。`);
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
    els.timerLabel.textContent = "";
    els.pauseBtn.disabled = true;
    return;
  }
  els.countdownTrack.classList.remove("hidden");
  els.pauseBtn.disabled = false;
  els.pauseBtn.textContent = "暂停";
  state.timerDuration = state.roundDecisionCount === 0 ? FIRST_COMPETITION_TURN_MS : NEXT_COMPETITION_TURN_MS;
  state.timerRemaining = state.timerDuration;
  state.timerEndsAt = Date.now() + state.timerDuration;
  state.timerPaused = false;
  updateTurnTimer();
  state.timerId = window.setInterval(updateTurnTimer, TIMER_TICK_MS);
}

function updateTurnTimer(){
  const remaining = Math.max(0, state.timerEndsAt - Date.now());
  state.timerRemaining = remaining;
  const ratio = state.timerDuration ? remaining / state.timerDuration : 0;
  els.countdownBar.style.width = `${ratio * 100}%`;
  els.timerLabel.textContent = `倒计时 ${formatTime(remaining)}`;
  if(remaining > 0) return;
  clearTurnTimer();
  if(state.mode !== "competition" || state.roundIndex >= QUESTIONS.length) return;
  if(state.selected === null) autoChoice();
  addLog(`${currentTeam().name} 倒计时结束，系统随机记录本组选择。`);
  confirmChoice();
}

function toggleTimerPause(){
  if(state.mode !== "competition" || state.roundIndex >= QUESTIONS.length) return;
  if(state.timerPaused){
    state.timerEndsAt = Date.now() + state.timerRemaining;
    state.timerPaused = false;
    els.pauseBtn.textContent = "暂停";
    state.timerId = window.setInterval(updateTurnTimer, TIMER_TICK_MS);
    updateTurnTimer();
    return;
  }
  state.timerRemaining = Math.max(0, state.timerEndsAt - Date.now());
  if(state.timerId !== null){
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
  state.timerPaused = true;
  els.pauseBtn.textContent = "继续";
  els.timerLabel.textContent = `已暂停 ${formatTime(state.timerRemaining)}`;
}

function clearTurnTimer(){
  if(state.timerId !== null){
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
  state.timerPaused = false;
}

function currentBatchIndex(){
  return state.batchOrder[state.batchCursor];
}

function currentBatchTeamIndexes(){
  return state.batches[currentBatchIndex()] || [];
}

function currentTeamIndex(){
  return state.batchTurnOrder[state.batchTeamCursor];
}

function currentTeam(){
  return state.teams[currentTeamIndex()];
}

function currentBatchLabel(){
  const batchIndex = currentBatchIndex();
  if(batchIndex === undefined) return "当前批次";
  return `第 ${batchIndex + 1} 批`;
}

function batchOrderText(){
  return state.batchOrder.map((batchIndex) => `第${batchIndex + 1}批`).join(" -> ");
}

function teamName(teamIndex){
  return state.teams[teamIndex]?.name || `第 ${teamIndex + 1} 组`;
}

function createBatches(count, size){
  const indexes = Array.from({ length: count }, (_, index) => index);
  const batches = [];
  for(let i = 0; i < indexes.length; i += size){
    batches.push(indexes.slice(i, i + size));
  }
  return batches;
}

function createRoundBatchOrders(batchCount, roundCount){
  if(batchCount <= 1){
    return Array.from({ length: roundCount }, () => [0]);
  }
  const source = allPermutations(Array.from({ length: batchCount }, (_, index) => index));
  const shuffled = shuffle(source);
  const orders = [];
  for(let i = 0; i < roundCount; i += 1){
    if(i < shuffled.length){
      orders.push([...shuffled[i]]);
      continue;
    }
    let next = createBatchOrder(batchCount);
    if(orders.length && sameOrder(next, orders[orders.length - 1])){
      next = createBatchOrder(batchCount);
    }
    orders.push(next);
  }
  return orders;
}

function createBatchOrder(batchCount){
  return shuffle(Array.from({ length: batchCount }, (_, index) => index));
}

function allPermutations(items){
  if(items.length <= 1) return [items];
  const result = [];
  items.forEach((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    allPermutations(rest).forEach((permutation) => {
      result.push([item, ...permutation]);
    });
  });
  return result;
}

function sameOrder(a, b){
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function shuffle(items){
  const copy = [...items];
  for(let i = copy.length - 1; i > 0; i -= 1){
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function addRoundOrderLog(){
  if(state.mode !== "competition") return;
  addLog(`本轮批次顺序：${batchOrderText()}。`);
}

function settledPickCount(optionIndex){
  return state.currentRoundSettledPicks[optionIndex]?.length || 0;
}

function snapshotSettledCounts(){
  return Object.fromEntries(
    Object.entries(state.currentRoundSettledPicks).map(([optionIndex, records]) => [optionIndex, records.length])
  );
}

function successRate(sameChoicePressure){
  const config = GAME_CONFIG.probability;
  return clampNumber(
    config.baseRate - sameChoicePressure * config.perSameChoicePenalty,
    config.minRate,
    config.maxRate
  );
}

function failedScore(delta){
  const multiplier = GAME_CONFIG.failedPositiveMultiplier ?? 0.4;
  return {
    stamina: failedStat(delta.stamina || 0, multiplier),
    mood: failedStat(delta.mood || 0, multiplier),
    gpa: failedStat(delta.gpa || 0, multiplier)
  };
}

function failedStat(value, multiplier){
  if(value <= 0) return value;
  return Math.floor(value * multiplier);
}

function score(team){
  const weights = GAME_CONFIG.scoreWeights;
  return team.stamina * weights.stamina + team.mood * weights.mood + team.gpa * weights.gpa;
}

function scoreRuleText(){
  const weights = GAME_CONFIG.scoreWeights;
  const probability = GAME_CONFIG.probability;
  return `总分 = 体力 x ${weights.stamina} + 心情 x ${weights.mood} + GPA x ${weights.gpa}。结算会按成功率随机判定；同轮同选项越集中，成功率越低，最低 ${probability.minRate}%。`;
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

function comment(team){
  if(team.restCount > 0) return `中途强制休息型，休息 ${team.restCount} 次后继续前进`;
  if(team.stamina <= 3 && team.gpa >= 15) return "高 GPA 低体力型，卷赢了但代价不小";
  if(team.mood >= 15 && team.gpa >= 12) return "心情稳定型，长期效率很亮眼";
  if(team.stamina >= 10 && team.mood >= 10 && team.gpa >= 10) return "整体均衡型，系统运行稳定";
  if(team.mood <= 4) return "情绪资源偏低，建议启动支持系统";
  if(team.stamina >= 12 && team.gpa < 9) return "身体保住了，复习还要补";
  return "基本活过期末周";
}

function addLog(text){
  state.logLines.push(text);
  if(state.logLines.length > 100) state.logLines.shift();
}

function formatScore(label, delta){
  return `${label}：体力 ${signed(delta.stamina || 0)}｜心情 ${signed(delta.mood || 0)}｜GPA ${signed(delta.gpa || 0)}`;
}

function formatTime(ms){
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
  const completedRounds = state.roundIndex * state.teams.length;
  const completedInRound = state.batchOrder
    .slice(0, state.batchCursor)
    .reduce((total, batchIndex) => total + (state.batches[batchIndex]?.length || 0), 0) + state.batchTeamCursor;
  return ((completedRounds + completedInRound) / (QUESTIONS.length * state.teams.length)) * 100;
}
