import { useState } from "react";
import { motion } from "framer-motion";
import "./App.css";
import { questionBank } from "./data/questions";

function App() {
  const [questions, setQuestions] = useState([]);
  const [review, setReview] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showContinents, setShowContinents] = useState(false);

  const [difficulty, setDifficulty] = useState("mixed");
  const [questionCount, setQuestionCount] = useState(10);
  const [quizTitle, setQuizTitle] = useState("");

  const categories = [
    { name: "🌐 Worldwide GK", type: "custom", key: "worldwide" },
    { name: "🗺️ Map Quiz", type: "custom", key: "mapQuiz" },
    { name: "🌍 Continents", type: "continents" },
    { name: "🧪 Global Science", type: "custom", key: "globalScience" },
    { name: "📚 Books", type: "api", id: 10 },
    { name: "🎬 Films", type: "api", id: 11 },
    { name: "🎵 Music", type: "api", id: 12 },
    { name: "🎮 Video Games", type: "api", id: 15 },
    { name: "💻 Computers", type: "api", id: 18 },
    { name: "➗ Mathematics", type: "api", id: 19 },
    { name: "🏀 Sports", type: "api", id: 21 },
    { name: "📜 World History", type: "api", id: 23 },
    { name: "🗺️ World Geography", type: "api", id: 22 },
    { name: "🐾 Animals", type: "api", id: 27 },
  ];

  const continents = [
    { name: "🌏 Asia", key: "asia" },
    { name: "🌍 Africa", key: "africa" },
    { name: "🇪🇺 Europe", key: "europe" },
    { name: "🌎 North America", key: "northAmerica" },
    { name: "🌎 South America", key: "southAmerica" },
    { name: "🌊 Oceania", key: "oceania" },
  ];

  const decodeHTML = (text) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
  };

  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  const resetQuiz = () => {
    setQuizStarted(false);
    setShowContinents(false);
    setQuestions([]);
    setReview([]);
    setCurrent(0);
    setSelected("");
    setScore(0);
    setShowResult(false);
    setLoadingQuiz(false);
  };

  const startCustomQuiz = (category) => {
    setQuizStarted(true);
    setShowContinents(false);
    setLoadingQuiz(true);
    setQuizTitle(category.name);

    let filtered = questionBank;

    if (category.key === "worldwide") {
      filtered = questionBank;
    } else if (category.key === "mapQuiz") {
      filtered = questionBank.filter((q) => q.category === "map");
    } else if (category.key === "globalScience") {
      filtered = questionBank.filter((q) => q.category === "science");
    } else {
      filtered = questionBank.filter(
        (q) => q.continent === category.key
      );
    }

    if (difficulty !== "mixed") {
      filtered = filtered.filter(
        (q) => q.difficulty === difficulty
      );
    }

    const selectedQuestions = shuffle(filtered).slice(
      0,
      questionCount
    );

    const formatted = selectedQuestions.map((q) => ({
      question: q.question,
      correctAnswer: q.correctAnswer,
      answers: shuffle(q.answers),
    }));

    setQuestions(formatted);
    setReview([]);
    setCurrent(0);
    setScore(0);
    setSelected("");
    setShowResult(false);
    setLoadingQuiz(false);
  };

  const startApiQuiz = async (category) => {
    setLoadingQuiz(true);
    setQuizStarted(true);
    setShowContinents(false);

    const difficultyParam =
      difficulty === "mixed"
        ? ""
        : `&difficulty=${difficulty}`;

    setQuizTitle(category.name);

    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=${questionCount}&category=${category.id}${difficultyParam}&type=multiple`
      );

      const data = await response.json();

      const formatted = data.results.map((q) => ({
        question: decodeHTML(q.question),
        correctAnswer: decodeHTML(q.correct_answer),
        answers: shuffle([
          decodeHTML(q.correct_answer),
          ...q.incorrect_answers.map(decodeHTML),
        ]),
      }));

      setQuestions(formatted);
      setReview([]);
      setCurrent(0);
      setScore(0);
      setSelected("");
      setShowResult(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const startQuiz = (category) => {
    if (category.type === "continents") {
      setShowContinents(true);
      return;
    }

    if (category.type === "custom") {
      startCustomQuiz(category);
    } else {
      startApiQuiz(category);
    }
  };

  const startDailyChallenge = () => {
    setQuizStarted(true);
    setShowContinents(false);
    setLoadingQuiz(true);
    setQuizTitle("🌟 Daily Global Challenge");

    const selectedQuestions = shuffle(questionBank).slice(
      0,
      10
    );

    const formatted = selectedQuestions.map((q) => ({
      question: q.question,
      correctAnswer: q.correctAnswer,
      answers: shuffle(q.answers),
    }));

    setQuestions(formatted);
    setReview([]);
    setCurrent(0);
    setScore(0);
    setSelected("");
    setShowResult(false);
    setLoadingQuiz(false);
  };

  const chooseAnswer = (answer) => {
    if (selected) return;

    setSelected(answer);

    const isCorrect =
      answer === questions[current].correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setReview((prev) => [
      ...prev,
      {
        question: questions[current].question,
        selectedAnswer: answer,
        correctAnswer:
          questions[current].correctAnswer,
        isCorrect,
      },
    ]);
  };

  const nextQuestion = () => {
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      setSelected("");
    } else {
      setShowResult(true);
    }
  };

  const copyScore = () => {
    const text = `I scored ${score}/${questions.length} on TRIVIA FOR YOU 🎯 Can you beat me?`;

    navigator.clipboard.writeText(text);

    alert("Score copied!");
  };

  const currentQuestion = questions[current];

  return (
    <div className="page">
      <motion.div
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1>TRIVIA FOR YOU</h1>

        <p>
          Play worldwide quizzes by continent,
          map, science, history, and more ✨
        </p>
      </motion.div>

      <motion.section
        className="panel quiz"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {(quizStarted || showContinents) && (
          <button
            className="back-btn"
            onClick={resetQuiz}
          >
            ← Back to Categories
          </button>
        )}

        {!quizStarted && !showContinents && (
          <>
            <button
              className="daily-btn"
              onClick={startDailyChallenge}
            >
              🌟 Start Daily Global Challenge
            </button>

            <h2>Choose Quiz Settings 🎯</h2>

            <div className="settings">
              <div>
                <label>Difficulty</label>

                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value)
                  }
                >
                  <option value="mixed">Mixed</option>
                  <option value="easy">Easy</option>
                  <option value="medium">
                    Medium
                  </option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label>Questions</label>

                <select
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(
                      Number(e.target.value)
                    )
                  }
                >
                  <option value={5}>Quick 5</option>
                  <option value={10}>
                    10 Questions
                  </option>
                  <option value={20}>
                    20 Questions
                  </option>
                </select>
              </div>
            </div>

            <h2>Choose Category</h2>

            <div className="category-grid">
              {categories.map((cat) => (
                <motion.button
                  key={cat.name}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startQuiz(cat)}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>
          </>
        )}

        {!quizStarted && showContinents && (
          <>
            <h2>Choose a Continent 🌍</h2>

            <div className="category-grid">
              {continents.map((continent) => (
                <motion.button
                  key={continent.key}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    startCustomQuiz({
                      name: continent.name,
                      key: continent.key,
                    })
                  }
                >
                  {continent.name}
                </motion.button>
              ))}
            </div>
          </>
        )}

        {loadingQuiz && (
          <p className="loading-text">
            Loading quiz...
          </p>
        )}

        {!loadingQuiz &&
          quizStarted &&
          !showResult &&
          currentQuestion && (
            <>
              <h2>{quizTitle}</h2>

              <div className="quiz-top">
                <span>
                  Question {current + 1} /{" "}
                  {questions.length}
                </span>

                <span>⭐ Score: {score}</span>
              </div>

              <div className="progress">
                <div
                  style={{
                    width: `${
                      ((current + 1) /
                        questions.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>

              <motion.h3
                key={currentQuestion.question}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {currentQuestion.question}
              </motion.h3>

              <div className="answers">
                {currentQuestion.answers.map(
                  (answer) => {
                    let className = "";

                    if (selected) {
                      if (
                        answer ===
                        currentQuestion.correctAnswer
                      ) {
                        className = "correct";
                      } else if (
                        answer === selected
                      ) {
                        className = "wrong";
                      }
                    }

                    return (
                      <motion.button
                        key={answer}
                        className={className}
                        onClick={() =>
                          chooseAnswer(answer)
                        }
                        whileHover={{
                          scale: selected
                            ? 1
                            : 1.03,
                        }}
                      >
                        {answer}
                      </motion.button>
                    );
                  }
                )}
              </div>

              {selected && (
                <motion.div
                  className="explanation"
                  initial={{
                    opacity: 0,
                    scale: 0.92,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                >
                  {selected ===
                  currentQuestion.correctAnswer ? (
                    <h4 className="correct-text">
                      ✅ Correct!
                    </h4>
                  ) : (
                    <h4 className="wrong-text">
                      ❌ Correct Answer:{" "}
                      {
                        currentQuestion.correctAnswer
                      }
                    </h4>
                  )}

                  <button
                    className="next"
                    onClick={nextQuestion}
                  >
                    {current + 1 ===
                    questions.length
                      ? "Show Final Score 🏆"
                      : "Next Question ✨"}
                  </button>
                </motion.div>
              )}
            </>
          )}

        {!loadingQuiz && showResult && (
          <motion.div
            className="result"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>Your Final Score 🏆</h2>

            <motion.div
              className="score-circle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 120,
              }}
            >
              {score}/{questions.length}
            </motion.div>

            <div className="result-actions">
              <button onClick={copyScore}>
                Share / Copy Score 🔗
              </button>

              <button onClick={resetQuiz}>
                Play Another Quiz 🎮
              </button>
            </div>

            <h2 className="review-title">
              Review Answers
            </h2>

            <div className="review-list">
              {review.map((item, index) => (
                <div
                  className="review-card"
                  key={index}
                >
                  <h4>
                    {item.isCorrect ? "✅" : "❌"}{" "}
                    Question {index + 1}
                  </h4>

                  <p>{item.question}</p>

                  <p>
                    Your answer:{" "}
                    <strong>
                      {item.selectedAnswer}
                    </strong>
                  </p>

                  <p>
                    Correct answer:{" "}
                    <strong>
                      {item.correctAnswer}
                    </strong>
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}

export default App;