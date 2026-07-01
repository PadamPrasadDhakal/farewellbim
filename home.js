const quizModal = document.getElementById("quizModal");
const quizIntro = document.getElementById("quizIntro");
const quizPlay = document.getElementById("quizPlay");
const quizResult = document.getElementById("quizResult");
const quizName = document.getElementById("quizName");
const quizQuestion = document.getElementById("quizQuestion");
const quizAnswer = document.getElementById("quizAnswer");
const quizStepLabel = document.getElementById("quizStepLabel");
const quizResultTitle = document.getElementById("quizResultTitle");
const quizResultText = document.getElementById("quizResultText");
const quizSummary = document.getElementById("quizSummary");
const startQuizButton = document.getElementById("startQuizButton");
const quizNextButton = document.getElementById("quizNextButton");
const quizSkipButton = document.getElementById("quizSkipButton");
const quizAgainButton = document.getElementById("quizAgainButton");
const openQuizButtons = document.querySelectorAll("[data-open-quiz]");
const closeQuizButtons = document.querySelectorAll("[data-close-quiz]");

const quizQuestions = [
  "Who is your best friend from the batch?",
  "Who is your favorite teacher?",
  "What is your favorite moment from campus?",
  "Who is your favorite junior?",
  "Which celeb would you want to adore?",
  "Who do you think will win the world cup?",
];

let quizState = {
  name: "",
  answers: [],
  index: 0,
};

function openQuiz() {
  quizModal.classList.remove("hidden");
  quizModal.setAttribute("aria-hidden", "false");
  showIntro();
  quizName.focus();
}

function closeQuiz() {
  quizModal.classList.add("hidden");
  quizModal.setAttribute("aria-hidden", "true");
}

function showIntro() {
  quizIntro.classList.remove("hidden");
  quizPlay.classList.add("hidden");
  quizResult.classList.add("hidden");
  quizState = { name: "", answers: [], index: 0 };
  quizName.value = "";
}

function startQuiz() {
  const name = quizName.value.trim();

  if (!name) {
    quizName.focus();
    return;
  }

  quizState.name = name;
  quizState.answers = [];
  quizState.index = 0;

  track("quiz_start", { player: name });

  quizIntro.classList.add("hidden");
  quizPlay.classList.remove("hidden");
  renderQuestion();
  quizAnswer.focus();
}

function renderQuestion() {
  const question = quizQuestions[quizState.index];
  quizStepLabel.textContent = `Question ${quizState.index + 1} of ${quizQuestions.length}`;
  quizQuestion.textContent = question;
  quizAnswer.value = quizState.answers[quizState.index] || "";
  quizNextButton.textContent = quizState.index === quizQuestions.length - 1 ? "Finish" : "Next";
}

function advanceQuestion(skip = false) {
  const answer = skip ? "Skipped" : quizAnswer.value.trim();
  quizState.answers[quizState.index] = answer || "Skipped";

  if (quizState.index < quizQuestions.length - 1) {
    quizState.index += 1;
    renderQuestion();
    quizAnswer.focus();
    return;
  }

  showResult();
}

function showResult() {
  quizPlay.classList.add("hidden");
  quizResult.classList.remove("hidden");
  quizResultTitle.textContent = `Thanks, ${quizState.name}`;
  quizResultText.textContent = "Here is your little farewell memory board.";
  quizSummary.innerHTML = quizQuestions
    .map((question, index) => `
      <div class="summary-chip">
        <strong>${question}</strong>
        <span>${quizState.answers[index] || "Skipped"}</span>
      </div>
    `)
    .join("");

  const answers = {};
  quizQuestions.forEach((q, i) => { answers[q] = quizState.answers[i] || "Skipped"; });
  track("quiz_complete", { player: quizState.name, answers });
}

openQuizButtons.forEach((button) => button.addEventListener("click", openQuiz));
closeQuizButtons.forEach((button) => button.addEventListener("click", closeQuiz));

startQuizButton.addEventListener("click", startQuiz);
quizNextButton.addEventListener("click", () => advanceQuestion(false));
quizSkipButton.addEventListener("click", () => advanceQuestion(true));
quizAgainButton.addEventListener("click", showIntro);

quizAnswer.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    advanceQuestion(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !quizModal.classList.contains("hidden")) {
    closeQuiz();
  }
});