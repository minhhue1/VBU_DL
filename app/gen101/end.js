const finalScore = document.getElementById('finalScore');
const mostRecentScore = localStorage.getItem('mostRecentScore');
const currentLesson = localStorage.getItem('currentLesson');
const currentRegion = localStorage.getItem('currentRegion');
const max_questions = localStorage.getItem('max_questions');

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

// // Cập nhật link "Làm lại" với lesson hiện tại
// const retryBtn = document.querySelector('a[href="game.html"]');
// if (currentLesson === 'frequencyDictionary') {
//     retryBtn.href = `game.html?lesson=frequencyDictionary`;
// } else {
//     retryBtn.href = `game.html?region=${currentRegion}&lesson=${currentLesson}`;
// }

// Lưu danh sách câu sai vào localStorage
const incorrectQuestions = [];
userAnswers.forEach((answer) => {
    if (answer.selectedAnswer !== answer.correctAnswer) {
        incorrectQuestions.push({
            question: answer.question,
            answer: answer.correctAnswer,
            explanation: answer.explanation,
            choice1: answer.choice1,
            choice2: answer.choice2,
            choice3: answer.choice3,
            choice4: answer.choice4,
        });
    }
});
localStorage.setItem('incorrectQuestions', JSON.stringify(incorrectQuestions));


if (incorrectQuestions.length === 0) {
    const message = document.createElement('p');
    message.innerText = 'Bạn đã trả lời đúng tất cả các câu hỏi!';
    incorrectAnswersContainer.appendChild(message);
}


// Cập nhật link "Làm lại" với danh sách câu sai
const retryBtn = document.querySelector('a[href="game.html"]');
retryBtn.href = `game.html?retry=incorrect`;


// Cập nhật link "Trang chủ" với region hiện tại
const homeBtn = document.querySelector('a[href="gen101.html"]');
homeBtn.href = `gen101.html`;

