const startReviewButton = document.querySelector("#start-review-button");
const reviewStatus = document.querySelector("#review-status");
const reviewSession = document.querySelector("#review-session");
const revealAnswerButton = document.querySelector("#reveal-answer-button");
const reviewAnswer = document.querySelector("#review-answer");
const reviewActions = document.querySelector("#review-actions");
const ratingButtons = document.querySelectorAll("[data-rating]");
const reviewFeedback = document.querySelector("#review-feedback");
const reviewCounter = document.querySelector("#review-counter");
const reviewQuestion = document.querySelector("#review-question");
const nextReviewButton = document.querySelector("#next-review-button");
const reviewCount = document.querySelector("#review-count");
const reviewQueue = [
  {
    id: 1,
    subject: "Networks",
    question: "What is TCP?",
    answer:
      "TCP is a connection-oriented protocol that provides reliable data transfer."
  },
  {
    id: 2,
    subject: "Databases",
    question: "What is a primary key?",
    answer:
      "A primary key uniquely identifies each record in a database table."
  },
  {
    id: 3,
    subject: "Algorithms",
    question: "What is binary search?",
    answer:
      "Binary search finds an item in a sorted list by repeatedly dividing the search range in half."
  }
];

function createReview(review) {
  return {
    ...review,
    rating: null,
    reviewedAt: null,
    nextReviewAt: null
  };
}

let currentReviewIndex = 0;

let currentReview = createReview(
  reviewQueue[currentReviewIndex]
);

const reviewHistory = [];

function saveReviewHistory() {
  localStorage.setItem(
    "reviewHistory",
    JSON.stringify(reviewHistory)
  );
}
updateReviewCount();

function getNextReviewDate(rating) {
  const daysByRating = {
    Forgot: 1,
    Hard: 2,
    Good: 4,
    Easy: 7
  };

  const nextReviewDate = new Date();

  nextReviewDate.setDate(
    nextReviewDate.getDate() + daysByRating[rating]
  );

  return nextReviewDate.toISOString();
}

function renderReview() {
  reviewCounter.textContent =`Review ${currentReviewIndex + 1} of ${reviewQueue.length}`;

  reviewQuestion.textContent = currentReview.question;
  reviewAnswer.textContent = currentReview.answer;

  reviewAnswer.classList.add("hidden");
  reviewActions.classList.add("hidden");
  reviewFeedback.classList.add("hidden");
  nextReviewButton.classList.add("hidden");

  revealAnswerButton.textContent = "Reveal answer";
  revealAnswerButton.disabled = false;

  ratingButtons.forEach((ratingButton) => {
    ratingButton.disabled = false;
  });
}

startReviewButton.addEventListener("click", () => {

  currentReviewIndex = 0;
  currentReview = createReview(reviewQueue[currentReviewIndex]);

  renderReview();
  reviewSession.classList.remove("hidden");
  reviewStatus.textContent = "Your review session has started.";
});

revealAnswerButton.addEventListener("click", () => {
  reviewAnswer.classList.remove("hidden");
  reviewActions.classList.remove("hidden");
  revealAnswerButton.textContent = "Answer revealed";
  revealAnswerButton.disabled = true;
});

function updateReviewCount(params) {
  const remainingReviews = reviewQueue.length - reviewHistory.length;

  reviewCount.textContent = Math.max(remainingReviews,0);
}

ratingButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const rating = button.dataset.rating;
    currentReview.rating = rating;

    currentReview.reviewedAt = new Date().toISOString();
    let nextR = currentReview.nextReviewAt = getNextReviewDate(rating);
    const formattedNextReview = new Date(nextR)
        .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
        });

        reviewHistory.push({ ...currentReview });
        saveReviewHistory();
        updateReviewCount();
        ratingButtons.forEach((ratingButton) => {
        ratingButton.disabled = true;
        });
    console.log(reviewHistory);
    
    
    reviewFeedback.textContent = `You chose: ${rating}. Next review : ${formattedNextReview}`;
    reviewFeedback.classList.remove("hidden");
    nextReviewButton.classList.remove("hidden");

    currentReview.nextReviewAt = getNextReviewDate(rating);

    console.log(currentReview);
    
  });
});

nextReviewButton.addEventListener("click", () => {
  currentReviewIndex += 1;

  if (currentReviewIndex >= reviewQueue.length) {
    reviewSession.classList.add("hidden");
    reviewStatus.textContent =
      "Great work! You completed all reviews for today.";
    return;
  }

  currentReview = createReview(
    reviewQueue[currentReviewIndex]
  );

  renderReview();
});