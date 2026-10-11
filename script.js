const questionCount = document.querySelector("#question-count");
const scoreDisplay = document.querySelector("#score");
const progress = document.querySelector("#game-progress");
const questionHeading = document.querySelector("#question-heading");
const questionPrompt = document.querySelector("#question-prompt");
const answerOptions = document.querySelector("#answer-options");
const answerFeedback = document.querySelector("#answer-feedback");
const nextButton = document.querySelector("#next-button");
const restartButton = document.querySelector("#restart-button");

let quizQuestions = [];
let questions = [];
let currentQuestion = 0;
let score = 0;

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

function showResults() {
  questionCount.textContent = "Game complete";
  progress.value = questions.length;
  questionHeading.textContent = `You got ${score} out of ${questions.length}!`;
  questionPrompt.textContent = "Want to see if you can get a perfect score?";
  answerOptions.replaceChildren();
  answerFeedback.textContent = "";
  nextButton.hidden = true;
  restartButton.hidden = false;
}

function selectAnswer(selectedAnswer, buttons) {
  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;

  if (isCorrect) {
    score += 1;
    answerFeedback.textContent = "Correct! Nice guess.";
    answerFeedback.className = "answer-feedback is-correct";
  } else {
    answerFeedback.textContent = `Not quite — the correct answer is ${question.correctAnswer}.`;
    answerFeedback.className = "answer-feedback is-incorrect";
  }

  updateScore();
  for (const button of buttons) {
    button.disabled = true;
    if (button.textContent === question.correctAnswer) {
      button.classList.add("is-answer");
    }
  }

  nextButton.textContent = currentQuestion === questions.length - 1
    ? "See my results"
    : "Next question";
  nextButton.hidden = false;
  nextButton.focus();
}

function renderQuestion() {
  const question = questions[currentQuestion];
  const choices = shuffle(question.answers);
  answerOptions.replaceChildren();
  const buttons = choices.map((answer) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.textContent = answer;
    answerOptions.append(button);
    return button;
  });

  questionCount.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  progress.max = questions.length;
  progress.value = currentQuestion;
  questionHeading.textContent = "Choose the correct answer";
  questionPrompt.textContent = question.question;
  answerFeedback.textContent = "";
  answerFeedback.className = "answer-feedback";
  nextButton.hidden = true;

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => selectAnswer(choices[index], buttons));
  });
}

function startGame() {
  questions = shuffle(quizQuestions);
  currentQuestion = 0;
  score = 0;
  updateScore();
  restartButton.hidden = true;
  renderQuestion();
}

async function loadQuestions() {
  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    quizQuestions = await response.json();
    if (
      !Array.isArray(quizQuestions)
      || quizQuestions.length < 2
      || quizQuestions.some((question) => (
        typeof question !== "object"
        || question === null
        || typeof question.question !== "string"
        || !Array.isArray(question.answers)
        || question.answers.length < 2
        || question.answers.some((answer) => typeof answer !== "string")
        || typeof question.correctAnswer !== "string"
        || !question.answers.includes(question.correctAnswer)
      ))
    ) {
      throw new Error("Quiz data must contain at least two questions with answer choices and a correct answer.");
    }

    startGame();
    nextButton.addEventListener("click", () => {
      currentQuestion += 1;
      if (currentQuestion === questions.length) {
        showResults();
        return;
      }
      renderQuestion();
    });
    restartButton.addEventListener("click", startGame);
  } catch (error) {
    console.error("Could not start the One Piece trivia game.", error);
    questionCount.textContent = "Game unavailable";
    questionHeading.textContent = "Could not load the game.";
    questionPrompt.textContent = "Please try refreshing the page.";
  }
}

loadQuestions();
