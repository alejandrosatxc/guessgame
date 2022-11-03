var statsEl = $("#stats")
var gameTimer = null //used for setInterval and clearInterval to start and stop game

$("#start-btn").on("click", startGame)
$("#reset-btn").on("click", resetScore)

//Load users highscores
loadGame()

function loadGame() {
    //Read game stats from localStorage
    var gameStats = localStorage.getItem("guessGameStats")
    //If there are no previous gameStats, 
    if(!gameStats) {
        //set highscore, wins and losses to 0
        statsEl.data('highscore', 0)
        statsEl.data('wins', 0)
        statsEl.data('losses', 0)
    } else { //Otherwise set highscore, wins and losses to previous gameStats
        var stats = JSON.parse(gameStats)
        statsEl.data('highscore', stats.highscore)
        statsEl.data('wins', stats.wins)
        statsEl.data('losses', stats.losses)
    }
    $('#highscore').text(statsEl.data('highscore'))
    $('#wins').text(statsEl.data('wins'))
    $('#losses').text(statsEl.data('losses'))
}

function startGame() {

    //Stop/clear previous game if any
    //Lose Condition: If user starts a new game before the current one is over.
    if(gameTimer !== null) {
        endGame('Loss')
    }

    //Clear previous results if any
    $('#result').text('')
    //Start a timer
    var secondsLeft = 10
    $('#time-remaining').text(secondsLeft)
    secondsLeft--
    //gameTimer is a global variable
    gameTimer = setInterval(function () {
        $('#time-remaining').text(secondsLeft)
        secondsLeft--
        //Lose Condition: If time runs out, game over
        if(secondsLeft === -1) {
            endGame('Loss')
        }
    }, 1000)

    //Generate a challange string
    let challenge = generateChallenge()

    //Display challenge string to user
    $('#challenge').text(challenge.word)
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
            $('#challenge').text(challenge.word)

            //Win Condition: When there are no more characters in missing_chars
            if(challenge.missing_chars.length === 0) {
                endGame('Win', secondsLeft + 1) //plus 1 to fix a bug i dont wanna deal with
            }
        }
    })
}

function generateChallenge() {
    //Create array continaing possible words to guess
    var wordbank = ['JavaScript', 'Coding', 'Python', 'HyperText', 'MarkUp', 'jquery']
    //Get a random word from the wordbank
    var random_word = wordbank[Math.floor(Math.random() * wordbank.length)]
    //Create an object to hold everything for the challenge
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

function endGame(result, highscore=0) {
    //Stop the gameTimer and set it to null
    clearInterval(gameTimer)
    gameTimer = null
    //Update user score
    if(result === "Win") {
        statsEl.data().wins++
        if(highscore > statsEl.data().highscore) {
            statsEl.data().highscore = highscore
            $('#highscore').text(highscore)
        }
        $('#wins').text(statsEl.data().wins)
    } else if(result === "Loss") {
        statsEl.data().losses++
        $('#losses').text(statsEl.data().losses)
    }

    //Return result to user
    $('#result').text(result)

    //Write game result to localStorage
    var gameStats = {
        highscore: statsEl.data().highscore,
        wins: statsEl.data().wins,
        losses: statsEl.data().losses
    }

    var data = JSON.stringify(gameStats)
    localStorage.setItem("guessGameStats", data)
}

function resetScore() {
    localStorage.clear()
    statsEl.data().wins = 0
    statsEl.data().losses = 0
    statsEl.data().highscore = 0
    $('#highscore').text(statsEl.data().highscore)
    $('#wins').text(statsEl.data().wins)
    $('#losses').text(statsEl.data().losses)
}