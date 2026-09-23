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
let reviewQueue = [
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
const reviewCount = document.querySelector("#review-count");
const noteForm = document.querySelector("#note-form");
const noteTitleInput = document.querySelector("#note-title");
const noteSubjectInput = document.querySelector("#note-subject");
const noteContentInput = document.querySelector("#note-content");
const noteMessage = document.querySelector("#note-message");
const savedNotes = localStorage.getItem("notes");
const notes = savedNotes ? JSON.parse(savedNotes) : [];

const notesList = document.querySelector("#notes-list");

function saveNotes() {
  localStorage.setItem(
    "notes",
    JSON.stringify(notes)
  );
}

function getDueNotes() {
  const now = new Date();

  return notes.filter((note) => {
    return new Date(note.nextReviewAt) <= now;
  });
}

function createReviewQueueFromNotes() {
  return getDueNotes().map((note) => {
    return {
      id: note.id,
      subject: note.subject,
      question: note.title,
      answer: note.content
    };
  });
}

function getMasteryLabel(mastery) {
  if (mastery === 0) {
    return "Needs review";
  }

  if (mastery <= 25) {
    return "Learning";
  }

  if (mastery <= 60) {
    return "Good progress";
  }

  return "Strong";
}

function renderNotes() {
  notesList.innerHTML = "";
  const deleteButton = document.createElement("button");

  deleteButton.className = "delete-note-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";

  deleteButton.addEventListener("click", () => {
    deleteNote(note.id);
  });

  if (notes.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "empty-notes";
    emptyMessage.textContent =
      "No notes yet. Add your first note above.";

    notesList.append(emptyMessage);
    return;
  }

  notes.forEach((note) => {
  const noteCard = document.createElement("article");
  const subject = document.createElement("span");
  const title = document.createElement("h3");
  const content = document.createElement("p");
  const deleteButton = document.createElement("button");
  const meta = document.createElement("p");

const formattedDate = new Date(
  note.nextReviewAt
).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short"
});

meta.className = "note-meta";
meta.textContent =
  `${getMasteryLabel(note.mastery)} · Next review: ${formattedDate}`;

  noteCard.className = "note-card";
  subject.className = "note-subject";
  deleteButton.className = "delete-note-button";

  subject.textContent = note.subject;
  title.textContent = note.title;
  content.textContent = note.content;

  deleteButton.type = "button";
  deleteButton.textContent = "Delete";

  deleteButton.addEventListener("click", () => {
    deleteNote(note.id);
  });

  noteCard.append(subject, title, content,meta, deleteButton);
  notesList.append(noteCard);
});
}



renderNotes();
console.log(getDueNotes);


function deleteNote(noteId) {
  const noteIndex = notes.findIndex((note) => {
    return note.id === noteId;
  });

  if (noteIndex === -1) {
    return;
  }

  notes.splice(noteIndex, 1);

  saveNotes();
  renderNotes();
}

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
  reviewQueue = createReviewQueueFromNotes();
  if (reviewQueue.length === 0) {
    reviewStatus.textContent = "You have no notes ready for review today .";
    return;
  }
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

function updateReviewCount() {
  reviewCount.textContent = getDueNotes().length;
}

ratingButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const rating = button.dataset.rating;
    currentReview.rating = rating;

    currentReview.reviewedAt = new Date().toISOString();
    let nextR = currentReview.nextReviewAt = getNextReviewDate(rating);
    const noteIndex = notes.findIndex((note) => {
      return note.id === currentReview.id;
    });

    const masteryByRating = {
      Forgot: 0,
      Hard: 25,
      Good: 60,
      Easy: 90
    };

    if (noteIndex !== -1) {
      notes[noteIndex].nextReviewAt =
        currentReview.nextReviewAt;

      notes[noteIndex].mastery =
        masteryByRating[rating];

      saveNotes();
      renderNotes();
    }
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

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const note = {
    id: crypto.randomUUID(),
    title: noteTitleInput.value.trim(),
    subject: noteSubjectInput.value,
    content: noteContentInput.value.trim(),
    createdAt: new Date().toISOString(),
    nextReviewAt: new Date().toISOString(),
    mastery: 0
  };

  notes.push(note);
  saveNotes();
  renderNotes();

  noteMessage.textContent =
    `"${note.title}" was added successfully.`;

  noteForm.reset();

  console.log(notes);
});