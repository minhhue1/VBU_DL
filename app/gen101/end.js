const finalScore = document.getElementById('finalScore');
const mostRecentScore = localStorage.getItem('mostRecentScore');
const currentLesson = localStorage.getItem('currentLesson');
const currentRegion = localStorage.getItem('currentRegion');
const max_questions = localStorage.getItem('max_questions');

if (currentRegion) {
    const head = document.querySelector('head');
    
    // Tạo và thêm thẻ link cho app.css
    const appStylesheet = document.createElement('link');
    appStylesheet.rel = 'stylesheet';
    appStylesheet.href = `region/${currentRegion}/app.css`;
    head.appendChild(appStylesheet);

    // Tạo và thêm thẻ link cho game.css
    const endStylesheet = document.createElement('link');
    endStylesheet.rel = 'stylesheet';
    endStylesheet.href = `region/${currentRegion}/end.css`;
    head.appendChild(endStylesheet);
}

// Hiển thị điểm số cuối cùng
finalScore.innerText = mostRecentScore + "/" + max_questions;

// Hiển thị câu sai
const userAnswers = JSON.parse(localStorage.getItem('userAnswers'));
const incorrectAnswersContainer = document.getElementById('incorrectAnswers');

userAnswers.forEach((answer) => {
    if (answer.selectedAnswer !== answer.correctAnswer) {
        const questionElement = document.createElement('div');
        questionElement.classList.add('incorrect-answer');

        // Hiển thị câu hỏi
        const questionText = document.createElement('p');
        questionText.innerText = answer.question;

        // Hiển thị đáp án đã chọn (tô đỏ)
        const selectedAnswer = document.createElement('p');
        selectedAnswer.innerText = `Đáp án đã chọn: ${answer.selectedAnswer}`;
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
const retryBtn = document.querySelector('a[href="game.html"]');
if (currentLesson === 'frequencyDictionary') {
    retryBtn.href = `game.html?lesson=frequencyDictionary`;
} else {
    retryBtn.href = `game.html?region=${currentRegion}&lesson=${currentLesson}`;
}

// Cập nhật link "Trang chủ" với region hiện tại
const homeBtn = document.querySelector('a[href="gen101.html"]');
homeBtn.href = `gen101.html`;

