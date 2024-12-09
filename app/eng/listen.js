const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
const explanationText = document.getElementById('explanation-text');

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];
let TOTAL_QUESTIONS;
let NUM_LESSONS;
const CORRECT_BONUS = 1;

// Hàm lấy giá trị của tham số URL
function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

let currentLesson = getParameterByName('lesson');
let currentCourse = getParameterByName('course');
if (!currentLesson) {
    currentLesson = 1;  // Nếu không có bài học nào, mặc định là bài học 1
}

let MAX_QUESTIONS;
let paragraph = 1;

async function loadQuestions() {
    if (currentLesson === 'test') {
        await loadQuestionsByLesson(currentRegion); // Tải câu hỏi từ tất cả các bài học
    } else if (currentLesson === 'single' || currentLesson === 'vocal') {
        NUM_LESSONS = 6; // Gán số bài học cần tải
        await loadQuestionAll(currentCourse);
    } else {
        await loadQuestionsFromFile(currentCourse, currentLesson, paragraph); // Tải câu hỏi từ bài học cụ thể
    }
    startGame(); // Bắt đầu trò chơi khi đã tải xong câu hỏi
}


// Hàm trộn mảng
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];  // Hoán đổi vị trí
    }
    return array;
}

// Hàm tải câu hỏi từ một bài học cụ thể
async function loadQuestionsFromFile(course, lesson, paragraph) {
    const jsonFile = `../../courses/${course}/lesson${lesson}/skill/listening/paragraph${paragraph}.json`;
    try {
        const res = await fetch(jsonFile);
        const loadedQuestions = await res.json();
        questions = loadedQuestions;
        MAX_QUESTIONS = questions.length;
    } catch (err) {
        console.error(`Error loading questions from ${jsonFile}:`, err);
    }
}

// Hàm tải câu hỏi từ tất cả bài học và chọn ngẫu nhiên 90 câu theo tỷ lệ
async function loadQuestionsByLesson(region) {
    questions = [];
    let totalQuestionsInLessons = 0;
    let lessonData = [];

    // Bước 1: Tính tổng số câu hỏi trong tất cả các bài học
    for (let lesson = 1; lesson <= NUM_LESSONS; lesson++) {
        const jsonFile = `region/${region}/lesson${lesson}.json`;
        try {
            const res = await fetch(jsonFile);
            const lessonQuestions = await res.json();
            lessonData.push({ lessonQuestions, count: lessonQuestions.length });
            totalQuestionsInLessons += lessonQuestions.length;
        } catch (err) {
            console.error(`Error loading questions from ${jsonFile}:`, err);
        }
    }

    const selectedQuestions = new Set(); // Sử dụng Set để tránh trùng lặp

    // Bước 2: Lấy câu hỏi từ từng bài học theo tỷ lệ
    lessonData.forEach(({ lessonQuestions, count }, lessonIndex) => {
        const questionsToTake = Math.round((count / totalQuestionsInLessons) * TOTAL_QUESTIONS);
        console.log(`Lesson ${lessonIndex + 1}: Taking ${questionsToTake} questions out of ${count}`); // Log số câu đã lấy
        
        shuffle(lessonQuestions);  // Trộn ngẫu nhiên câu hỏi của mỗi bài học
        
        // Lấy câu hỏi không trùng từ từng bài học
        let takenQuestions = 0;
        lessonQuestions.forEach((question) => {
            if (!selectedQuestions.has(question.question) && takenQuestions < questionsToTake) {
                questions.push(question); // Thêm câu hỏi vào danh sách câu hỏi chính
                selectedQuestions.add(question.question); // Đánh dấu câu hỏi đã chọn
                takenQuestions++;
            }
        });
    });

    // Bước 3: Nếu tổng số câu hỏi không đủ, lấy thêm câu hỏi từ các bài học đã chọn
    if (questions.length < TOTAL_QUESTIONS) {
        const remainingQuestions = TOTAL_QUESTIONS - questions.length;
        lessonData.forEach(({ lessonQuestions }) => {
            lessonQuestions.forEach((question) => {
                if (!selectedQuestions.has(question.question) && questions.length < TOTAL_QUESTIONS) {
                    questions.push(question);
                    selectedQuestions.add(question.question);
                }
            });
        });
    }

    shuffle(questions);  // Trộn ngẫu nhiên tất cả câu hỏi đã chọn
    questions = questions.slice(0, TOTAL_QUESTIONS);  // Đảm bảo chỉ lấy đúng 90 câu
    MAX_QUESTIONS = questions.length;
}

function filterSingleCharacterQuestions(questions) {
    // Lọc các câu hỏi chỉ chứa 1 ký tự chữ Hán
    return questions.filter(q => q.question.length === 1);
}

function filterVocabularyQuestions(questions) {
    // Lọc các câu hỏi chứa nhiều hơn 1 ký tự chữ Hán
    return questions.filter(q => q.question.length > 1);
}


// Hàm tải tất cả câu hỏi theo thứ tự
async function loadQuestionAll(course) {
    // alert(NUM_LESSONS);
    questions = [];
    let totalQuestionsInLessons = 0;
    let lessonData = [];

    // Bước 1: Tính tổng số câu hỏi trong tất cả các bài học
    for (let lesson = 1; lesson <= NUM_LESSONS; lesson++) {

        const jsonFile = `../../courses/${course}/lesson${lesson}.json`;
        try {
            const res = await fetch(jsonFile);
            const lessonQuestions = await res.json();
            lessonData.push({ lessonQuestions, count: lessonQuestions.length });
            totalQuestionsInLessons += lessonQuestions.length;
        } catch (err) {
            console.error(`Error loading questions from ${jsonFile}:`, err);
        }
    }

    const selectedQuestions = new Set(); // Sử dụng Set để tránh trùng lặp

    // Bước 2: Lấy câu hỏi
    lessonData.forEach(({ lessonQuestions, count }, lessonIndex) => {
        const questionsToTake = totalQuestionsInLessons;
        console.log(`Lesson ${lessonIndex + 1}: Taking ${questionsToTake} questions out of ${count}`); // Log số câu đã lấy
        
        // Lấy câu hỏi không trùng từ từng bài học
        let takenQuestions = 0;
        lessonQuestions.forEach((question) => {
            if (!selectedQuestions.has(question.question) && takenQuestions < questionsToTake) {
                questions.push(question); // Thêm câu hỏi vào danh sách câu hỏi chính
                selectedQuestions.add(question.question); // Đánh dấu câu hỏi đã chọn
                takenQuestions++;
            }
        });
    });

    if (currentLesson === 'single'){
        questions = filterSingleCharacterQuestions(questions);
        shuffle(questions);  // Trộn ngẫu nhiên tất cả câu hỏi đã chọn
    } else if (currentLesson === 'vocal'){
        questions = filterVocabularyQuestions(questions);
        shuffle(questions);  // Trộn ngẫu nhiên tất cả câu hỏi đã chọn
    }

    console.log(questions)
    MAX_QUESTIONS = questions.length;
}

// Thêm mảng để lưu câu trả lời của người dùng
let userAnswers = [];

// Bắt đầu trò chơi
function startGame() {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    getNewQuestion();
    game.classList.remove('hidden');
    loader.classList.add('hidden');
}

function updateAudioSource(audioUrl) {
    const audioPlayer = document.getElementById('audioPlayer');
    const audioSource = document.getElementById('audioSource');

    audioSource.src = audioUrl; // Cập nhật URL tệp âm thanh
    audioPlayer.load();         // Tải lại tệp âm thanh
}


function getNewQuestion() {
    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score);
        localStorage.setItem('currentLesson', currentLesson);
        localStorage.setItem('currentCourse', currentCourse);
        localStorage.setItem('max_questions', MAX_QUESTIONS);
        setTimeout(() => {
            window.location.assign('end.html');
        }, 100);
        return;
    }

    questionCounter++;
    progressText.innerText = `Câu ${questionCounter}/${MAX_QUESTIONS}`;
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    if (currentLesson === 'test') {
        const questionIndex = Math.floor(Math.random() * availableQuestions.length);
        currentQuestion = availableQuestions[questionIndex];
        availableQuestions.splice(questionIndex, 1); // Loại bỏ câu hỏi đã chọn khỏi danh sách
    } else {
        currentQuestion = availableQuestions[0];
        availableQuestions.splice(0, 1); // Loại bỏ câu hỏi đã chọn khỏi danh sách
    }

    console.log(availableQuestions);

    // Hiển thị tệp âm thanh thay vì văn bản
    if (currentQuestion.audio) {
        updateAudioSource(currentQuestion.audio); // Hàm cập nhật tệp âm thanh
    } else {
        console.error("Audio file not found for this question.");
    }

    acceptingAnswers = true;
}


function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth' // Thêm hiệu ứng cuộn mượt mà
    });
}

// Hàm mở popup
function openPopup() {
    const explanationContent = document.getElementById('explanation-content');
    const explanationText = document.getElementById('explanation-text');

    // Xóa nội dung cũ trong explanationText
    explanationText.innerHTML = "";

    document.getElementById('explanation-popup').style.display = 'block';
    explanationContent.style.display = 'flex';

    expText = currentQuestion.english;

    explanationText.innerText = expText;

    // Tự động cuộn xuống cuối trang khi popup mở
    scrollToBottom();
}

function showExplanation() {
    const explanationText = document.getElementById('explanation-text');
    const showExplanationBtn = document.getElementById('showExplanationBtn');

    // Ẩn nút "Hiện lời giải thích" sau khi nhấn
    showExplanationBtn.style.display = 'none';

    // Kiểm tra nếu câu hỏi hiện tại có chứa video
    if (currentQuestion.videoUrl) {
        const startSeconds = convertToSeconds(currentQuestion.start || "0:0");
        const endSeconds = currentQuestion.end ? convertToSeconds(currentQuestion.end) : null;

        // Sử dụng hàm tạo embed URL
        const embedUrl = createEmbedUrl(currentQuestion.videoUrl, startSeconds, endSeconds);

        // Tạo container chứa iframe
        const videoContainer = document.createElement('div');
        videoContainer.classList.add('video-container');

        // Tạo iframe để hiển thị video
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;

        // Thêm iframe vào container
        videoContainer.appendChild(iframe);

        // Thêm video vào phần giải thích
        explanationText.appendChild(videoContainer);
    } else {
        explanationText.innerText = currentQuestion.explanation || "";
    }
}

let globalClassToApply;
let selectedChoice;


// Hàm đóng popup
function closePopup() {

    document.getElementById('explanation-popup').style.display = 'none';
    document.getElementById('explanation-content').style.display = 'none';
    
    document.getElementById('answer').value = '';

    // Lấy câu hỏi mới
    getNewQuestion();
}



// choices.forEach((choice) => {
//     choice.addEventListener('click', (e) => {
//         if (!acceptingAnswers) return;

//         acceptingAnswers = false;
//         selectedChoice = e.target;
//         const selectedAnswer = selectedChoice.innerText;

//         globalClassToApply =
//             selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';

//         // Lưu câu hỏi và câu trả lời người dùng
//         userAnswers.push({
//             question: currentQuestion.question,
//             selectedAnswer: selectedAnswer,
//             correctAnswer: currentQuestion.answer,
//         });

//         if (globalClassToApply === 'correct') {
//             incrementScore(CORRECT_BONUS);
//             document.getElementById('explanation-content').style.backgroundColor = 'rgb(83, 170, 72)';
//         } else {
//             document.getElementById('explanation-content').style.backgroundColor = 'rgb(218, 96, 93)';
//             // Tìm và tô xanh đáp án đúng
//             choices.forEach((choice) => {
//                 if (choice.innerText === currentQuestion.answer) {
//                     choice.parentElement.classList.add('correct');  // Tô xanh đáp án đúng
//                 }
//             });
//         }

//         selectedChoice.parentElement.classList.add(globalClassToApply);

//         // Hiển thị giải thích
//         openPopup()
//     });
// });

function convertToAsterisks(text) {
    return '*'.repeat(text.length);
}

// Hàm mở hints
function openHints(indexWord) {
    const explanationContent = document.getElementById('explanation-content');
    const explanationText = document.getElementById('explanation-text');

    // Xóa nội dung cũ trong explanationText
    explanationText.innerHTML = "";

    document.getElementById('explanation-popup').style.display = 'block';
    explanationContent.style.display = 'flex';

    let correctAnswer = currentQuestion.english;
    const correctWords = correctAnswer.split(" ");
    let hints = "";

    for (let i = 0; i < correctWords.length; i++) {
        if (i === indexWord) {
            // Tô màu cho từ tại vị trí indexWord
            hints += `<span style="color: rgba(25, 135, 84, 1); font-weight: bold;">${correctWords[i]}</span> `;
        } else if (i < indexWord) {
            // Hiển thị các từ trước indexWord
            hints += `${correctWords[i]} `;
        } else {
            // Che các từ sau indexWord
            hints += `${convertToAsterisks(correctWords[i])} `;
        }
    }

    // Chèn HTML vào explanationText
    explanationText.innerHTML = hints;

    // Tự động cuộn xuống cuối trang khi popup mở
    scrollToBottom();

    // Lắng nghe sự kiện input trên trường answer
    const answerElement = document.getElementById('answer');
    answerElement.addEventListener('input', closeHints);
}

// Hàm đóng popup
function closeHints() {
    document.getElementById('explanation-popup').style.display = 'none';
    document.getElementById('explanation-content').style.display = 'none';

    // Loại bỏ sự kiện input trên trường answer
    const answerElement = document.getElementById('answer');
    answerElement.removeEventListener('input', closeHints);
}


// Hàm loại bỏ dấu câu và chuẩn hóa dấu nháy
function removePunctuation(text) {
    // Thay thế tất cả dấu nháy cong ’ thành dấu nháy thẳng '
    text = text.replace(/’/g, "'");  
    return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"…]/g, "").trim();
}


// Hàm tính indexWord
function calculateIndexWord(userAnswer, correctAnswer) {
    const userWords = userAnswer.split(" ");
    const correctWords = correctAnswer.split(" ");
    let indexWord = 0;

    for (let i = 0; i < userWords.length; i++) {
        if (correctWords[i] && userWords[i].toLowerCase() === correctWords[i].toLowerCase()) {
            indexWord++;
        } else {
            break;
        }
    }
    if (indexWord == correctWords.length) {
        return -1;
    } else {
        return indexWord;
    }
}

function checkAnswer() {
    const answerElement = document.getElementById('answer');
    const userAnswer = answerElement.value;
    const correctAnswer = currentQuestion.english;

    // Loại bỏ dấu câu
    const normalizedUserAnswer = removePunctuation(userAnswer);
    const normalizedCorrectAnswer = removePunctuation(correctAnswer);

    // Tính indexWord
    const indexWord = calculateIndexWord(normalizedUserAnswer, normalizedCorrectAnswer);

    // So sánh đáp án
    if (normalizedUserAnswer.toLowerCase() === normalizedCorrectAnswer.toLowerCase()) {
        incrementScore(CORRECT_BONUS);
        document.getElementById('explanation-content').style.backgroundColor = 'rgb(83, 170, 72)';
    } else {
        document.getElementById('explanation-content').style.backgroundColor = 'rgb(255, 255, 255)';
        document.getElementById('explanation-text').style.color = 'rgb(0, 0, 0)';
    }

    // Hiển thị giá trị indexWord (nếu cần)
    console.log("IndexWord:", indexWord);

    const correctWords = correctAnswer.split(" ");
    const userAnswerSplit = userAnswer.split(" ");
    let textShow = "";

    // Mở popup hoặc gợi ý
    if (indexWord === -1) {
        for (let i = 0; i < correctWords.length; i++) {
            textShow += correctWords[i] + " ";
        }
        // Cập nhật giá trị của trường `answer` với textShow
        answerElement.value = textShow.trim();
        openPopup();
    } else {
        // Thêm các từ đúng liên tiếp từ đầu đến indexWord
        for (let i = 0; i < indexWord; i++) {
            textShow += correctWords[i] + " ";
        }

        // Thêm các từ từ câu trả lời người dùng sau indexWord
        for (let i = indexWord; i < userAnswerSplit.length; i++) {
            textShow += userAnswerSplit[i] + " ";
        }
        // Cập nhật giá trị của trường `answer` với textShow
        answerElement.value = textShow.trim();
        openHints(indexWord);
    }
}





function incrementScore(num) {
    score += num;
    scoreText.innerText = score;
}

// Gọi hàm loadQuestions khi bắt đầu game
loadQuestions();

// Get the answer input field
const answerElement = document.getElementById('answer');

// Add event listener for keydown event
answerElement.addEventListener('keydown', function(event) {
    // Check if the pressed key is "Enter"
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevent form submission (if any)
        checkAnswer();           // Call the checkAnswer function
    }
});
