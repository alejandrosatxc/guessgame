var startBtn = document.querySelector("#start-btn")
var resetBtn = document.querySelector("#reset-btn")
var resultEl = document.querySelector("#result")
var statsEl = document.querySelector("#stats")
var winsEl = document.querySelector("#wins")
var lossesEl = document.querySelector("#losses")
var timeRemaining = document.querySelector("#time-remaining")
var challangeEl = document.querySelector('#challenge')
var gameTimer = null //used for setInterval and clearInterval to start and stop game

startBtn.addEventListener("click", startGame)
resetBtn.addEventListener("click", resetScore)

//Load users highscores
loadGame()

function loadGame() {
    //Read game stats from localStorage
    var gameStats = localStorage.getItem("guessGameStats")
    //If there are no previous gameStats, 
    if(!gameStats) {
        //set wins and losses to 0
        statsEl.dataset.wins = 0;
        statsEl.dataset.losses = 0;
    } else { //Otherwise set wins and losses to previous gameStats
        var stats = JSON.parse(gameStats)
        statsEl.dataset.wins = stats.wins;
        statsEl.dataset.losses = stats.losses;
    }
    winsEl.textContent = statsEl.dataset.wins
    lossesEl.textContent = statsEl.dataset.losses
}

function startGame(e) {
    //Prevent default button behavior, this might be unecessary
    e.preventDefault()

    //Stop/clear previous game if any
    //Lose Condition: If user starts a new game before the current one is over.
    if(gameTimer !== null) {
        endGame('Loss')
    }

    //Clear previous results if any
    resultEl.textContent = ''
    //Start a timer
    var secondsLeft = 10
    timeRemaining.textContent = secondsLeft
    secondsLeft--;
    //gameTimer is a global variable
    gameTimer = setInterval(function () {
        timeRemaining.textContent = secondsLeft
        secondsLeft--;
        //Lose Condition: If time runs out, game over
        if(secondsLeft === -1) {
            endGame('Loss')
        }
    }, 1000)

    //Generate a challange string
    let challenge = generateChallenge()

    //Display challenge string to user
    challangeEl.textContent = challenge.word
    console.log(challenge.missing_chars)


    //Begin Listening for key inputs
    //Note: Since we are adding this event listener everytime user clicks start button,
    //It may seem like we are adding multiple event listeners, however, according to
    //documentation, adding multiple duplicate event listeners will discard the old one,
    //eliminating the need manually removing new ones. 
    window.addEventListener("keyup", function (e) {
        //If a correct key is pressed
        if(challenge.missing_chars.includes(e.key)) {

            //Remove correct char from array of missing chars 
            challenge.missing_chars = challenge.missing_chars.filter((missing) => missing !== e.key)
            console.log(challenge.missing_chars)

            //Update the challenge string
            var update = ''

            //For loop essentially builds a new string with the correct key replacing 
            //the "_"s where ever necessary
            for(var i = 0; i < challenge.random_word.length; i++) {
                if(challenge.word[i] === '_' && challenge.random_word[i] === e.key) {
                    update += challenge.random_word[i]
                } else {
                    update += challenge.word[i]
                }
            }

            //Update the challenge string that is displayed to the user
            challenge.word = update
            challangeEl.textContent = challenge.word

            //Win Condition: When there are no more characters in missing_chars
            if(challenge.missing_chars.length === 0) {
                endGame('Win')
            }
        }
    })
}

function generateChallenge() {
    var wordbank = ['JavaScript', 'Coding', 'Python', 'HyperText', 'MarkUp', 'jquery']
    var random_word = wordbank[Math.floor(Math.random() * wordbank.length)]
    var challenge = {
        random_word : random_word,
        word: '',
        missing_chars: []
    }

    //Pick random chars from the random_word
    for(var i = 0; i < random_word.length / 2; i++) {
        challenge.missing_chars.push(random_word.charAt(Math.floor(Math.random() * random_word.length)))
    }

    //Create a new string with missing characters (represented by _)
    for(var i = 0; i < random_word.length; i++) {
        if(challenge.missing_chars.includes(random_word[i])) {
            challenge.word += '_'
        } else {
            challenge.word += random_word[i]
        }
    }

    //Return the challenge object
    return challenge
}

function endGame(result) {
    //Stop the gameTimer and set it to null
    clearInterval(gameTimer)
    gameTimer = null
    //Update user score
    if(result === "Win") {
        statsEl.dataset.wins++
        winsEl.textContent = statsEl.dataset.wins
    } else if(result === "Loss") {
        statsEl.dataset.losses++
        lossesEl.textContent = statsEl.dataset.losses
    }

    //Return result to user
    resultEl.textContent = result

    //Write game result to localStorage
    var gameStats = {
        wins: statsEl.dataset.wins,
        losses: statsEl.dataset.losses
    }

    var data = JSON.stringify(gameStats)
    localStorage.setItem("guessGameStats", data)
}

function resetScore() {
    localStorage.clear()
    statsEl.dataset.wins = 0;
    statsEl.dataset.losses = 0;
    winsEl.textContent = statsEl.dataset.wins
    lossesEl.textContent = statsEl.dataset.losses
}