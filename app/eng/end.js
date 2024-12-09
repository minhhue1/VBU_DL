const finalScore = document.getElementById('finalScore');
const mostRecentScore = localStorage.getItem('mostRecentScore');
const currentLesson = localStorage.getItem('currentLesson');
const currentCourse = localStorage.getItem('currentCourse');
const max_questions = localStorage.getItem('max_questions');

// Hiển thị điểm số cuối cùng
finalScore.innerText = mostRecentScore + "/" + max_questions;

// Hiển thị câu sai
const userAnswers = JSON.parse(localStorage.getItem('userAnswers'));
const incorrectAnswersContainer = document.getElementById('incorrectAnswers');

userAnswers.forEach((answer) => {
    if (answer.selectedAnswer.trim().toLowerCase() !== answer.correctAnswer.toLowerCase()) {
        const questionElement = document.createElement('div');
        questionElement.classList.add('incorrect-answer');

        // Hiển thị câu hỏi
        const questionText = document.createElement('p');
        questionText.innerText = answer.question;

        // Hiển thị đáp án đã chọn (tô đỏ)
        const selectedAnswer = document.createElement('p');
        selectedAnswer.innerText = `Đáp án đã điền: ${answer.selectedAnswer}`;
        selectedAnswer.classList.add('incorrect');

        // Hiển thị đáp án đúng (tô xanh lá)
        const correctAnswer = document.createElement('p');
        correctAnswer.innerText = `Đáp án đúng: ${answer.correctAnswer}`;
        correctAnswer.classList.add('correct');

        // Thêm các phần tử vào questionElement
        questionElement.appendChild(questionText);
        questionElement.appendChild(selectedAnswer);
        questionElement.appendChild(correctAnswer);

        // Thêm questionElement vào container
        incorrectAnswersContainer.appendChild(questionElement);
    }
});

// Cập nhật link "Làm lại" với lesson hiện tại
const retryBtn = document.querySelector('a[href="chin.html"]');
retryBtn.href = `chin.html?course=${currentCourse}&lesson=${currentLesson}`;

let index = `${currentCourse}`;
index = index.toLowerCase();

// Cập nhật link "Trang chủ" với region hiện tại
const homeBtn = document.querySelector('a[href="index.html"]');
homeBtn.href = `${index}.html`;