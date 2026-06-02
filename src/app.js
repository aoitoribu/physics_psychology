import { GAME_CONFIG, QUESTIONS } from "./questions.js";
import { CHALLENGE_CONFIG, CHALLENGE_QUESTIONS } from "./challengeQuestions.js";

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
  difficulty: "normal",
  challengeEndedEarly: false,
  challengeEndReason: "",
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
  reflectionText: document.getElementById("reflectionText"),
  trapModal: document.getElementById("trapModal"),
  trapMessage: document.getElementById("trapMessage"),
  trapCloseBtn: document.getElementById("trapCloseBtn")
};

document.getElementById("startBtn").addEventListener("click", initGame);
document.getElementById("challengeStartBtn").addEventListener("click", initGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);
document.getElementById("againBtn").addEventListener("click", resetGame);
document.getElementById("randomBtn").addEventListener("click", autoChoice);
els.confirmBtn.addEventListener("click", confirmChoice);
els.pauseBtn.addEventListener("click", toggleTimerPause);
els.trapCloseBtn.addEventListener("click", hideTrapModal);
els.modeOptions.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});
els.difficultySelect.addEventListener("change", renderDifficultyHint);

initStaticText();

function initStaticText(){
  renderSetupIntro();
  els.scoreRule.textContent = scoreRuleText();
  els.reflectionText.textContent = GAME_CONFIG.reflection;
  renderDifficultyHint();
}

function initGame(){
  const initial = currentInitialStats();
  const count = state.mode === "competition" ? clampNumber(Number(els.teamCount.value || 15), 2, 20) : 1;
  const questions = activeQuestions();
  state.difficulty = els.difficultySelect.value || "normal";
  state.challengeEndedEarly = false;
  state.challengeEndReason = "";
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
  state.roundBatchOrders = state.mode === "competition" ? createRoundBatchOrders(state.batches.length, questions.length) : [];
  state.roundIndex = 0;
  state.selected = null;
  state.hideScoreHints = shouldHideScoreHints();
  state.logLines = [];

  els.setup.classList.add("hidden");
  els.result.classList.add("hidden");
  els.game.classList.remove("hidden");
  document.body.classList.add("is-playing");
  document.body.classList.remove("is-result");

  addLog(`${state.mode === "competition" ? "竞赛模式" : "闯关模式"}开始：欢迎进入期末周。`);
  if(state.mode === "competition") startRound();
  render();
}

function resetGame(){
  clearTurnTimer();
  els.setup.classList.remove("hidden");
  els.game.classList.add("hidden");
  els.result.classList.add("hidden");
  els.trapModal.classList.add("hidden");
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
  if(state.mode === "challenge"){
    renderChallenge();
    return;
  }

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
  els.confirmBtn.classList.remove("hidden");
  els.pauseBtn.classList.remove("hidden");

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

function renderChallenge(){
  const questions = activeQuestions();
  if(state.challengeEndedEarly || state.roundIndex >= questions.length){
    showResult();
    return;
  }

  state.selected = null;
  els.confirmBtn.disabled = true;
  els.confirmBtn.classList.add("hidden");
  els.pauseBtn.classList.add("hidden");
  document.getElementById("randomBtn").classList.remove("hidden");

  const question = questions[state.roundIndex];
  const difficulty = currentChallengeDifficulty();
  els.roundInfo.textContent = `第 ${state.roundIndex + 1} 题 / 共 ${questions.length} 题`;
  els.turnInfo.textContent = `｜${difficulty.label}｜点击选项即结算`;
  els.progressBar.style.width = `${progressPercent()}%`;
  els.questionTitle.textContent = question.title;
  els.questionText.textContent = question.text;
  els.followTip.textContent = CHALLENGE_CONFIG.intro;
  els.teamTitle.textContent = "当前闯关状态";

  renderOptions();
  renderTeams();
  renderLog();
  startTurnTimer();
}

function renderOptions(){
  const question = activeQuestions()[state.roundIndex];
  els.options.innerHTML = "";
  question.options.forEach((option, index) => {
    const settledCount = settledPickCount(index);
    const rate = successRate(settledCount, option);
    const div = document.createElement("div");
    div.className = "option";
    div.addEventListener("click", () => selectOption(index, div));
    if(state.mode === "challenge"){
      const scoreDelta = scaledChallengeScore(option.score);
      div.innerHTML = `
        <div class="option-title">
          <span>${option.name}</span>
        </div>
        <div class="option-desc">${option.desc}</div>
        ${state.hideScoreHints ? "" : `
          <div class="delta">
            <span class="pill">${formatScore("影响", scoreDelta)}</span>
          </div>
        `}
      `;
      els.options.appendChild(div);
      return;
    }
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
  const activeTeamIndex = state.mode === "challenge" ? 0 : currentTeamIndex();
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
  if(state.mode === "challenge"){
    confirmChoice();
  }
}

function autoChoice(){
  chooseRandomOption();
  if(state.mode === "challenge"){
    confirmChoice();
  }
}

function chooseRandomOption(){
  state.selected = Math.floor(Math.random() * activeQuestions()[state.roundIndex].options.length);
  document.querySelectorAll(".option").forEach((option, index) => {
    option.classList.toggle("selected", index === state.selected);
  });
  els.confirmBtn.disabled = false;
}

function confirmChoice(){
  if(state.selected === null) return;
  if(state.mode === "challenge"){
    confirmChallengeChoice();
    return;
  }
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

function confirmChallengeChoice(){
  clearTurnTimer();

  const team = state.teams[0];
  const question = activeQuestions()[state.roundIndex];
  const option = question.options[state.selected];
  const finalScore = scaledChallengeScore(option.score);

  applyScore(team, finalScore);
  team.decisions.push({
    round: state.roundIndex + 1,
    optionIndex: state.selected,
    option: option.name,
    score: { ...option.score },
    finalScore: { ...finalScore },
    difficulty: state.difficulty
  });

  addLog(`${question.title}｜选择「${option.name}」，${formatScore("结算", finalScore)}。`);
  if(maybeTriggerChallengeTrap(team, option)){
    renderTeams();
    renderLog();
    return;
  }

  state.roundIndex += 1;
  render();
}

function maybeTriggerChallengeTrap(team, option){
  if(!option.trap) return false;
  const trapRate = currentChallengeDifficulty().trapRate || 0;
  if(Math.random() * 100 >= trapRate) return false;
  const stat = option.trap.stat === "mood" ? "mood" : "stamina";
  team[stat] = 0;
  const statLabel = stat === "mood" ? "心情" : "体力";
  state.challengeEndedEarly = true;
  state.challengeEndReason = `${option.name}：${option.trap.reason}`;
  addLog(`提前结算：${option.trap.reason}${statLabel}被清零。`);
  showChallengeTrapModal(statLabel, option.trap.reason);
  return true;
}

function setMode(mode){
  state.mode = mode;
  els.modeOptions.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  els.competitionPanel.classList.toggle("active", mode === "competition");
  els.challengePanel.classList.toggle("active", mode === "challenge");
  renderSetupIntro();
  renderDifficultyHint();
}

function renderDifficultyHint(){
  const difficulty = CHALLENGE_CONFIG.difficulties[els.difficultySelect.value] || CHALLENGE_CONFIG.difficulties.normal;
  els.difficultyHint.textContent = `${difficulty.hint} 初始：体力 ${difficulty.initial.stamina} / 心情 ${difficulty.initial.mood} / GPA ${difficulty.initial.gpa}`;
}

function renderSetupIntro(){
  els.setupIntro.textContent = state.mode === "challenge" ? CHALLENGE_CONFIG.intro : GAME_CONFIG.setupIntro;
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
    const rate = successRate(sameBefore, record.option);
    const roll = Math.floor(Math.random() * 100) + 1;
    const success = roll <= rate;
    const debuff = success ? emptyScore() : randomDebuff();
    const finalScore = addScores(record.score, debuff);
    const decision = team.decisions[team.decisions.length - 1];

    applyScore(team, finalScore);
    Object.assign(decision, {
      finalScore: { ...finalScore },
      debuff: { ...debuff },
      successRate: rate,
      roll,
      success
    });
    if(!state.currentRoundSettledPicks[record.optionIndex]){
      state.currentRoundSettledPicks[record.optionIndex] = [];
    }
    state.currentRoundSettledPicks[record.optionIndex].push(record.teamIndex);

    addLog(`${team.name}｜${record.option.name}｜成功率 ${rate}%｜随机数 ${roll}｜${success ? "顺利执行" : `受阻，追加 ${formatScore("debuff", debuff)}`}，${formatScore("结算", finalScore)}。`);
    maybeTriggerTrap(team, record.option);
    updateRestStateForTeam(team);
  });
}

function maybeTriggerTrap(team, option){
  if(!option.trap || team.skip > 0) return;
  const trapRate = option.trap.rate ?? GAME_CONFIG.probability.trapRate ?? 1;
  if(Math.random() * 100 >= trapRate) return;
  const stat = option.trap.stat === "mood" ? "mood" : "stamina";
  team[stat] = 0;
  const statLabel = stat === "mood" ? "心情" : "体力";
  const message = `${team.name} 因为「${option.name}」触发突发状况：${option.trap.reason}`;
  addLog(`${message}${statLabel}被清零，将进入强制休息。`);
  showTrapModal(team.name, statLabel, option.trap.reason);
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
  els.trapModal.classList.add("hidden");
  els.game.classList.add("hidden");
  els.result.classList.remove("hidden");
  document.body.classList.remove("is-playing");
  document.body.classList.add("is-result");
  els.scoreRule.textContent = scoreRuleText();
  els.reflectionText.textContent = state.mode === "challenge" ? CHALLENGE_CONFIG.reflection : GAME_CONFIG.reflection;
  if(state.mode === "challenge"){
    showChallengeResult();
    return;
  }
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

function showChallengeResult(){
  const team = state.teams[0];
  const completed = team.decisions.length;
  const total = activeQuestions().length;
  const status = state.challengeEndedEarly ? "提前结算" : "完成闯关";
  els.resultTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>状态</th><th>完成题数</th><th>体力</th><th>心情</th><th>GPA</th><th>总分</th><th>评价</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${status}</td>
          <td>${completed} / ${total}</td>
          <td>${team.stamina}</td>
          <td>${team.mood}</td>
          <td>${team.gpa}</td>
          <td><b>${score(team).toFixed(1)}</b></td>
          <td>${challengeComment(team, completed, total)}</td>
        </tr>
      </tbody>
    </table>
    ${state.challengeEndReason ? `<p class="small result-note">提前结算原因：${state.challengeEndReason}</p>` : ""}
  `;
}

function showTrapModal(teamName, statLabel, reason){
  els.trapMessage.innerHTML = `
    <p><b>${teamName}</b> 触发了选择风险。</p>
    <p>${reason}</p>
    <p>${statLabel}已清零，本组将被强制休息。</p>
  `;
  els.trapModal.classList.remove("hidden");
}

function showChallengeTrapModal(statLabel, reason){
  els.trapMessage.innerHTML = `
    <p><b>闯关提前结算</b></p>
    <p>${reason}</p>
    <p>${statLabel}已清零，本次期末线到这里提前收束。</p>
  `;
  els.trapModal.classList.remove("hidden");
}

function hideTrapModal(){
  els.trapModal.classList.add("hidden");
  if(state.mode === "challenge" && state.challengeEndedEarly && !els.game.classList.contains("hidden")){
    showResult();
  }
}

function applyScore(team, delta){
  team.stamina = clampStat(team.stamina + (delta.stamina || 0));
  team.mood = clampStat(team.mood + (delta.mood || 0));
  team.gpa = clampStat(team.gpa + (delta.gpa || 0));
}

function startTurnTimer(){
  clearTurnTimer();
  if(state.mode !== "competition" && state.mode !== "challenge"){
    els.countdownTrack.classList.add("hidden");
    els.timerLabel.textContent = "";
    els.pauseBtn.disabled = true;
    return;
  }
  els.countdownTrack.classList.remove("hidden");
  els.pauseBtn.disabled = state.mode === "challenge";
  els.pauseBtn.textContent = "暂停";
  state.timerDuration = state.mode === "challenge"
    ? CHALLENGE_CONFIG.timerMs
    : (state.roundDecisionCount === 0 ? FIRST_COMPETITION_TURN_MS : NEXT_COMPETITION_TURN_MS);
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
  if(!["competition", "challenge"].includes(state.mode) || state.roundIndex >= activeQuestions().length) return;
  if(state.selected === null) chooseRandomOption();
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
  if(state.mode === "challenge") return state.teams[0];
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

function successRate(sameChoicePressure, option = {}){
  const config = GAME_CONFIG.probability;
  return clampNumber(
    config.baseRate + (option.successMod || 0) - sameChoicePressure * config.perSameChoicePenalty,
    config.minRate,
    config.maxRate
  );
}

function randomDebuff(){
  const config = GAME_CONFIG.probability;
  const targets = shuffle(["stamina", "mood", "gpa"]).slice(
    0,
    randomInt(config.debuffTargetsMin, config.debuffTargetsMax)
  );
  return targets.reduce((delta, key) => {
    delta[key] = -randomOneDecimal(config.debuffMin, config.debuffMax);
    return delta;
  }, emptyScore());
}

function emptyScore(){
  return { stamina: 0, mood: 0, gpa: 0 };
}

function addScores(a, b){
  return {
    stamina: roundOneDecimal((a.stamina || 0) + (b.stamina || 0)),
    mood: roundOneDecimal((a.mood || 0) + (b.mood || 0)),
    gpa: roundOneDecimal((a.gpa || 0) + (b.gpa || 0))
  };
}

function score(team){
  const weights = state.mode === "challenge" ? CHALLENGE_CONFIG.scoreWeights : GAME_CONFIG.scoreWeights;
  return team.stamina * weights.stamina + team.mood * weights.mood + team.gpa * weights.gpa;
}

function scoreRuleText(){
  const weights = state.mode === "challenge" ? CHALLENGE_CONFIG.scoreWeights : GAME_CONFIG.scoreWeights;
  if(state.mode === "challenge"){
    const difficulty = currentChallengeDifficulty();
    return `总分 = 体力 x ${weights.stamina} + 心情 x ${weights.mood} + GPA x ${weights.gpa}。当前难度：${difficulty.label}，正向收益 x ${difficulty.scoreScale.positive}，负向代价 x ${difficulty.scoreScale.negative}。`;
  }
  const probability = GAME_CONFIG.probability;
  return `总分 = 体力 x ${weights.stamina} + 心情 x ${weights.mood} + GPA x ${weights.gpa}。结算会按成功率随机判定；前面批次同选项越集中，后续成功率越低，最低 ${probability.minRate}%。未顺利执行时，会在原选项分值上追加轻微 debuff。`;
}

function currentInitialStats(){
  if(state.mode === "challenge"){
    const difficulty = CHALLENGE_CONFIG.difficulties[els.difficultySelect.value] || CHALLENGE_CONFIG.difficulties.normal;
    return { ...difficulty.initial };
  }
  return {
    stamina: clampNumber(Number(els.initialStaminaInput.value || GAME_CONFIG.initial.stamina), MIN_STAT, MAX_STAT),
    mood: clampNumber(Number(els.initialMoodInput.value || GAME_CONFIG.initial.mood), MIN_STAT, MAX_STAT),
    gpa: clampNumber(Number(els.initialGpaInput.value || GAME_CONFIG.initial.gpa), MIN_STAT, MAX_STAT)
  };
}

function activeQuestions(){
  return state.mode === "challenge" ? CHALLENGE_QUESTIONS : QUESTIONS;
}

function currentChallengeDifficulty(){
  return CHALLENGE_CONFIG.difficulties[state.difficulty] || CHALLENGE_CONFIG.difficulties.normal;
}

function shouldHideScoreHints(){
  if(state.mode === "challenge"){
    return Boolean(currentChallengeDifficulty().hideScoreHints);
  }
  return Boolean(els.hideScoreHintsInput?.checked);
}

function scaledChallengeScore(scoreDelta){
  const scale = currentChallengeDifficulty().scoreScale;
  return {
    stamina: scaleChallengeValue(scoreDelta.stamina || 0, scale),
    mood: scaleChallengeValue(scoreDelta.mood || 0, scale),
    gpa: scaleChallengeValue(scoreDelta.gpa || 0, scale)
  };
}

function scaleChallengeValue(value, scale){
  if(value > 0) return roundOneDecimal(value * scale.positive);
  if(value < 0) return roundOneDecimal(value * scale.negative);
  return 0;
}

function challengeComment(team, completed, total){
  if(state.challengeEndedEarly) return "冒进路线触发提前结算，期末系统被迫停机";
  if(completed >= total && team.stamina >= 8 && team.mood >= 8 && team.gpa >= 18) return "稳中有进，完整穿过期末周";
  if(team.gpa >= 22 && (team.stamina <= 4 || team.mood <= 4)) return "成绩冲得很高，但资源几乎见底";
  if(team.mood >= 14 && team.stamina >= 10) return "状态管理优秀，属于可持续通关";
  if(completed >= total) return "顺利走完期末，过程有惊无险";
  return "还有不少路没走完，但已经看见压力如何累积";
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
  const rounded = roundOneDecimal(value);
  return rounded > 0 ? `+${formatNumber(rounded)}` : formatNumber(rounded);
}

function clampStat(value){
  return roundOneDecimal(clampNumber(value, MIN_STAT, MAX_STAT));
}

function clampNumber(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function randomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomOneDecimal(min, max){
  return roundOneDecimal(min + Math.random() * (max - min));
}

function roundOneDecimal(value){
  return Math.round(value * 10) / 10;
}

function formatNumber(value){
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function progressPercent(){
  if(state.mode === "challenge"){
    return (state.roundIndex / activeQuestions().length) * 100;
  }
  const completedRounds = state.roundIndex * state.teams.length;
  const completedInRound = state.batchOrder
    .slice(0, state.batchCursor)
    .reduce((total, batchIndex) => total + (state.batches[batchIndex]?.length || 0), 0) + state.batchTeamCursor;
  return ((completedRounds + completedInRound) / (QUESTIONS.length * state.teams.length)) * 100;
}
