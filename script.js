/* =========================================================
   ULTIMATE BRAIN LAB
   STABLE BUTTON FIX
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

"use strict";

/* =========================================================
   ELEMENTS
   ========================================================= */

const modal = document.getElementById("gameModal");
const modalTitle = document.getElementById("modalTitle");
const gameArea = document.getElementById("gameArea");
const closeModal = document.getElementById("closeModal");

if (!modal || !modalTitle || !gameArea) {
    console.error("Ultimate Brain Lab: Required HTML elements missing.");
    return;
}

/* =========================================================
   STATE
   ========================================================= */

let timers = [];
let intervals = [];
let cleanupFunction = null;

let stats = {
    games: 0,
    wins: 0,
    bestReaction: null,
    bestMemory: 0,
    bestTyping: null
};

/* =========================================================
   SAFE STORAGE
   ========================================================= */

function loadStats() {
    try {
        const saved = localStorage.getItem("ultimateBrainLabStats");

        if (saved) {
            const data = JSON.parse(saved);

            if (data && typeof data === "object") {
                stats = {
                    ...stats,
                    ...data
                };
            }
        }
    } catch (error) {
        console.warn("Stats could not be loaded.");
    }

    updateStats();
}

function saveStats() {
    try {
        localStorage.setItem(
            "ultimateBrainLabStats",
            JSON.stringify(stats)
        );
    } catch (error) {
        console.warn("Stats could not be saved.");
    }
}

function updateStats() {

    const games =
        document.getElementById("gamesPlayed");

    const wins =
        document.getElementById("wins");

    const reaction =
        document.getElementById("bestReaction");

    const memory =
        document.getElementById("bestMemory");

    if (games) {
        games.textContent = stats.games;
    }

    if (wins) {
        wins.textContent = stats.wins;
    }

    if (reaction) {
        reaction.textContent =
            stats.bestReaction === null
                ? "--"
                : `${stats.bestReaction} ms`;
    }

    if (memory) {
        memory.textContent =
            stats.bestMemory > 0
                ? stats.bestMemory
                : "--";
    }
}

function gamePlayed() {
    stats.games++;
    saveStats();
    updateStats();
}

function gameWon() {
    stats.wins++;
    saveStats();
    updateStats();
}

/* =========================================================
   TIMER CONTROL
   ========================================================= */

function timeout(fn, delay) {

    const id = setTimeout(() => {

        timers = timers.filter(
            x => x !== id
        );

        fn();

    }, delay);

    timers.push(id);

    return id;
}

function interval(fn, delay) {

    const id = setInterval(fn, delay);

    intervals.push(id);

    return id;
}

function clearTimers() {

    timers.forEach(id => {
        clearTimeout(id);
    });

    intervals.forEach(id => {
        clearInterval(id);
    });

    timers = [];
    intervals = [];
}

function cleanupGame() {

    clearTimers();

    if (typeof cleanupFunction === "function") {

        try {
            cleanupFunction();
        } catch (error) {
            console.warn(
                "Game cleanup error:",
                error
            );
        }
    }

    cleanupFunction = null;
}

/* =========================================================
   MODAL
   ========================================================= */

function openGame(title, gameFunction) {

    cleanupGame();

    modalTitle.textContent = title;

    gameArea.innerHTML = "";

    modal.classList.add("show");

    gamePlayed();

    try {
        gameFunction();
    } catch (error) {

        console.error(
            "Game error:",
            error
        );

        gameArea.innerHTML = `
            <div style="
                text-align:center;
                padding:40px;
            ">
                <h2>Game Error</h2>

                <p>
                    This game encountered an error.
                </p>

                <button
                    id="reloadGameButton"
                    class="game-btn">
                    Try Again
                </button>
            </div>
        `;

        const reload =
            document.getElementById(
                "reloadGameButton"
            );

        if (reload) {
            reload.onclick = () => {
                openGame(
                    title,
                    gameFunction
                );
            };
        }
    }
}

function closeGame() {

    cleanupGame();

    modal.classList.remove("show");

    gameArea.innerHTML = "";
}

/* =========================================================
   CLOSE BUTTON
   ========================================================= */

if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeGame
    );
}

/* =========================================================
   CLICK OUTSIDE MODAL
   ========================================================= */

modal.addEventListener(
    "click",
    event => {

        if (event.target === modal) {
            closeGame();
        }

    }
);

/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            modal.classList.contains("show")
        ) {
            closeGame();
        }

    }
);

/* =========================================================
   GAME BUTTON SYSTEM
   ========================================================= */

/*
   IMPORTANT:
   Event delegation means the cards work even if
   their internal structure changes slightly.
*/

const gameFunctions = {

    reaction: [
        "Reaction Time",
        reaction
    ],

    memory: [
        "Memory Match",
        memory
    ],

    sequence: [
        "Sequence Memory",
        sequence
    ],

    number: [
        "Number Memory",
        numberMemory
    ],

    sudoku: [
        "Classic Sudoku",
        sudoku
    ],

    wordSudoku: [
        "Word Sudoku",
        wordSudoku
    ],

    fifteen: [
        "15 Puzzle",
        fifteen
    ],

    lights: [
        "Lights Out",
        lightsOut
    ],

    stroop: [
        "Stroop Focus",
        stroop
    ],

    pattern: [
        "Pattern Challenge",
        pattern
    ],

    odd: [
        "Odd One Out",
        oddOneOut
    ],

    scramble: [
        "Word Scramble",
        scramble
    ],

    aim: [
        "Aim Trainer",
        aimTrainer
    ],

    typing: [
        "Typing Speed",
        typing
    ],

    focus: [
        "Focus Test",
        focusTest
    ],

    math: [
        "Quick Math",
        quickMath
    ],

    anagram: [
        "Anagram",
        anagram
    ],

    wordsearch: [
        "Word Search",
        wordSearch
    ],

    choice: [
        "Choice Reaction",
        choiceReaction
    ]

};

/* =========================================================
   CARD CLICK HANDLER
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-game]"
            );

        if (!button) return;

        const game =
            button.getAttribute(
                "data-game"
            );

        if (!gameFunctions[game]) {

            console.warn(
                "Unknown game:",
                game
            );

            return;
        }

        event.preventDefault();

        const title =
            gameFunctions[game][0];

        const fn =
            gameFunctions[game][1];

        openGame(title, fn);
    }
);

/* =========================================================
   REACTION TIME
   ========================================================= */

function reaction() {

    let waiting = false;
    let ready = false;
    let start = 0;

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Reaction Time</h2>

            <p>
                Click Start, wait for green,
                then click as quickly as possible.
            </p>

            <button
                id="reactionStart"
                class="game-btn">
                Start
            </button>

            <div
                id="reactionBox"
                class="reaction-box">
                READY
            </div>

            <div
                id="reactionResult"
                class="result">
            </div>

        </div>

    `;

    const startButton =
        document.getElementById(
            "reactionStart"
        );

    const box =
        document.getElementById(
            "reactionBox"
        );

    const result =
        document.getElementById(
            "reactionResult"
        );

    startButton.onclick = () => {

        clearTimers();

        waiting = true;
        ready = false;

        box.textContent =
            "WAIT...";

        box.classList.remove(
            "ready"
        );

        timeout(() => {

            ready = true;
            waiting = false;

            start =
                performance.now();

            box.textContent =
                "CLICK!";

            box.classList.add(
                "ready"
            );

        }, 1000 + Math.random() * 2500);
    };

    box.onclick = () => {

        if (!waiting && !ready) {
            return;
        }

        if (waiting) {

            clearTimers();

            waiting = false;

            box.textContent =
                "TOO EARLY!";

            result.textContent =
                "Press Start and try again.";

            return;
        }

        const time =
            Math.round(
                performance.now() - start
            );

        ready = false;

        box.textContent =
            `${time} ms`;

        box.classList.remove(
            "ready"
        );

        result.textContent =
            "🎉 Great reaction!";

        if (
            stats.bestReaction === null ||
            time < stats.bestReaction
        ) {

            stats.bestReaction =
                time;
        }

        gameWon();
    };
}

/* =========================================================
   MEMORY MATCH
   ========================================================= */

function memory() {

    const symbols = [
        "🍎","🍎",
        "🚀","🚀",
        "⭐","⭐",
        "🎯","🎯",
        "🧠","🧠",
        "🔥","🔥",
        "🌎","🌎",
        "⚡","⚡"
    ];

    symbols.sort(
        () => Math.random() - 0.5
    );

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Memory Match</h2>

            <p>
                Find all matching pairs.
            </p>

            <div
                id="memoryGrid"
                class="memory-grid">
            </div>

            <div
                id="memoryStatus"
                class="result">
                Matches: 0 / 8
            </div>

        </div>

    `;

    const grid =
        document.getElementById(
            "memoryGrid"
        );

    const status =
        document.getElementById(
            "memoryStatus"
        );

    let first = null;
    let second = null;
    let locked = false;
    let matches = 0;

    symbols.forEach(symbol => {

        const card =
            document.createElement(
                "button"
            );

        card.type = "button";

        card.className =
            "memory-card";

        card.textContent =
            "?";

        card.dataset.symbol =
            symbol;

        card.onclick = () => {

            if (
                locked ||
                card.classList.contains(
                    "matched"
                )
            ) {
                return;
            }

            card.textContent =
                symbol;

            card.classList.add(
                "flipped"
            );

            if (!first) {

                first = card;

                return;
            }

            second = card;

            locked = true;

            if (
                first.dataset.symbol ===
                second.dataset.symbol
            ) {

                first.classList.add(
                    "matched"
                );

                second.classList.add(
                    "matched"
                );

                matches++;

                status.textContent =
                    `Matches: ${matches} / 8`;

                first = null;
                second = null;
                locked = false;

                if (matches === 8) {

                    status.textContent =
                        "🎉 You found every pair!";

                    gameWon();
                }

            } else {

                timeout(() => {

                    if (!first || !second) {
                        return;
                    }

                    first.textContent =
                        "?";

                    second.textContent =
                        "?";

                    first.classList.remove(
                        "flipped"
                    );

                    second.classList.remove(
                        "flipped"
                    );

                    first = null;
                    second = null;

                    locked = false;

                }, 700);
            }
        };

        grid.appendChild(card);
    });
}

/* =========================================================
   SEQUENCE MEMORY
   ========================================================= */

function sequence() {

    let level = 1;
    let sequence = [];
    let player = 0;
    let accepting = false;
    let playing = false;

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Sequence Memory</h2>

            <p>
                Watch the lights and repeat
                the exact sequence.
            </p>

            <div
                id="sequenceBoard"
                class="sequence-board">
            </div>

            <div
                id="sequenceStatus"
                class="result">
                Press Start
            </div>

            <button
                id="sequenceStart"
                class="game-btn">
                Start
            </button>

        </div>

    `;

    const board =
        document.getElementById(
            "sequenceBoard"
        );

    const status =
        document.getElementById(
            "sequenceStatus"
        );

    const startButton =
        document.getElementById(
            "sequenceStart"
        );

    const cells = [];

    for (let i = 0; i < 9; i++) {

        const cell =
            document.createElement(
                "button"
            );

        cell.type = "button";

        cell.className =
            "sequence-cell";

        cell.dataset.index =
            i;

        cell.onclick = () => {

            if (!accepting) {
                return;
            }

            const clicked =
                Number(
                    cell.dataset.index
                );

            if (
                clicked !==
                sequence[player]
            ) {

                accepting = false;
                playing = false;

                cell.classList.add(
                    "wrong"
                );

                status.textContent =
                    `Game Over — Level ${level}`;

                return;
            }

            cell.classList.add(
                "active"
            );

            timeout(() => {
                cell.classList.remove(
                    "active"
                );
            }, 180);

            player++;

            if (
                player ===
                sequence.length
            ) {

                accepting = false;

                level++;

                stats.bestMemory =
                    Math.max(
                        stats.bestMemory,
                        level - 1
                    );

                saveStats();
                updateStats();

                status.textContent =
                    `Level ${level}`;

                timeout(
                    showSequence,
                    500
                );
            }
        };

        cells.push(cell);

        board.appendChild(cell);
    }

    function showSequence() {

        if (!playing) {
            return;
        }

        accepting = false;

        sequence.push(
            Math.floor(
                Math.random() * 9
            )
        );

        player = 0;

        status.textContent =
            `Watch — Level ${level}`;

        cells.forEach(cell => {

            cell.disabled = true;

            cell.classList.remove(
                "active",
                "wrong"
            );
        });

        sequence.forEach(
            (index, position) => {

                timeout(() => {

                    cells[index]
                        .classList.add(
                            "active"
                        );

                    timeout(() => {

                        cells[index]
                            .classList.remove(
                                "active"
                            );

                    }, 400);

                }, position * 650);
            }
        );

        timeout(() => {

            if (!playing) {
                return;
            }

            cells.forEach(cell => {
                cell.disabled = false;
            });

            accepting = true;

            status.textContent =
                `Your turn — Level ${level}`;

        }, sequence.length * 650 + 400);
    }

    startButton.onclick = () => {

        clearTimers();

        level = 1;
        sequence = [];
        player = 0;
        accepting = false;
        playing = true;

        startButton.disabled = true;

        showSequence();
    };

    cleanupFunction = () => {

        playing = false;
        accepting = false;

    };
}

/* =========================================================
   NUMBER MEMORY
   ========================================================= */

function numberMemory() {

    let level = 1;
    let number = "";

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Number Memory</h2>

            <p>
                Memorize the number.
                It gets longer every round.
            </p>

            <div
                id="numberDisplay"
                style="
                font-size:42px;
                font-weight:900;
                margin:25px;
                letter-spacing:7px;">
                Press Start
            </div>

            <button
                id="numberStart"
                class="game-btn">
                Start
            </button>

            <div
                id="numberInputArea">
            </div>

            <div
                id="numberStatus"
                class="result">
                Level 1
            </div>

        </div>

    `;

    const display =
        document.getElementById(
            "numberDisplay"
        );

    const startButton =
        document.getElementById(
            "numberStart"
        );

    const inputArea =
        document.getElementById(
            "numberInputArea"
        );

    const status =
        document.getElementById(
            "numberStatus"
        );

    startButton.onclick = () => {

        number = "";

        for (
            let i = 0;
            i < level;
            i++
        ) {
            number +=
                Math.floor(
                    Math.random() * 10
                );
        }

        display.textContent =
            number;

        startButton.disabled = true;

        timeout(() => {

            display.textContent =
                "???";

            inputArea.innerHTML = `

                <input
                    id="numberAnswer"
                    class="game-input"
                    inputmode="numeric"
                    autocomplete="off"
                    placeholder="Enter number">

                <button
                    id="numberCheck"
                    class="game-btn">
                    Check
                </button>

            `;

            const input =
                document.getElementById(
                    "numberAnswer"
                );

            const check =
                document.getElementById(
                    "numberCheck"
                );

            input.focus();

            function checkAnswer() {

                if (
                    input.value.trim() ===
                    number
                ) {

                    status.textContent =
                        `✅ Correct! Level ${level} complete.`;

                    stats.bestMemory =
                        Math.max(
                            stats.bestMemory,
                            level
                        );

                    gameWon();

                    level++;

                    timeout(() => {
                        numberMemory();
                    }, 1000);

                } else {

                    status.textContent =
                        `❌ Wrong. The number was ${number}.`;

                    timeout(() => {
                        numberMemory();
                    }, 1200);
                }
            }

            check.onclick =
                checkAnswer;

            input.onkeydown =
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {
                        checkAnswer();
                    }

                };

        }, 1500);
    };
}

/* =========================================================
   CLASSIC SUDOKU
   ========================================================= */

function sudoku() {

    const solution = [
        [5,3,4,6,7,8,9,1,2],
        [6,7,2,1,9,5,3,4,8],
        [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3],
        [4,2,6,8,5,3,7,9,1],
        [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4],
        [2,8,7,4,1,9,6,3,5],
        [3,4,5,2,8,6,1,7,9]
    ];

    let board =
        solution.map(row => [...row]);

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Classic Sudoku</h2>

            <p>
                Complete the Sudoku grid.
            </p>

            <div
                id="sudokuGrid"
                class="sudoku-grid">
            </div>

            <div
                id="sudokuStatus"
                class="result">
                Complete the puzzle.
            </div>

            <button
                id="sudokuNew"
                class="game-btn">
                New Puzzle
            </button>

        </div>

    `;

    const grid =
        document.getElementById(
            "sudokuGrid"
        );

    const status =
        document.getElementById(
            "sudokuStatus"
        );

    const newButton =
        document.getElementById(
            "sudokuNew"
        );

    function generate() {

        board =
            solution.map(
                row => [...row]
            );

        const positions =
            Array.from(
                { length: 81 },
                (_, i) => i
            );

        positions.sort(
            () => Math.random() - 0.5
        );

        for (
            let i = 0;
            i < 45;
            i++
        ) {

            const pos =
                positions[i];

            const row =
                Math.floor(pos / 9);

            const col =
                pos % 9;

            board[row][col] = 0;
        }
    }

    function render() {

        grid.innerHTML = "";

        for (
            let row = 0;
            row < 9;
            row++
        ) {

            for (
                let col = 0;
                col < 9;
                col++
            ) {

                const input =
                    document.createElement(
                        "input"
                    );

                input.className =
                    "sudoku-cell";

                input.type = "text";
                input.maxLength = 1;
                input.inputMode =
                    "numeric";

                if (
                    board[row][col] !== 0
                ) {

                    input.value =
                        board[row][col];

                    input.readOnly =
                        true;

                    input.classList.add(
                        "given"
                    );

                } else {

                    input.value = "";

                    input.oninput = () => {

                        input.value =
                            input.value.replace(
                                /[^1-9]/g,
                                ""
                            );

                        board[row][col] =
                            Number(
                                input.value
                            ) || 0;

                        validate();
                    };
                }

                grid.appendChild(
                    input
                );
            }
        }
    }

    function validate() {

        let complete = true;

        let correct = true;

        for (
            let row = 0;
            row < 9;
            row++
        ) {

            for (
                let col = 0;
                col < 9;
                col++
            ) {

                if (
                    board[row][col] === 0
                ) {
                    complete = false;
                }

                if (
                    board[row][col] !==
                    solution[row][col]
                ) {
                    correct = false;
                }
            }
        }

        if (!complete) {

            status.textContent =
                "Keep going...";

            return;
        }

        if (correct) {

            status.textContent =
                "🎉 Sudoku solved!";

            gameWon();

        } else {

            status.textContent =
                "❌ Some answers are incorrect.";
        }
    }

    newButton.onclick = () => {

        generate();
        render();

        status.textContent =
            "New puzzle created.";

    };

    generate();
    render();
}

/* =========================================================
   WORD SUDOKU
   ========================================================= */

function wordSudoku() {

    const letters = [
        "A","B","C",
        "D","E","F",
        "G","H","I"
    ];

    const solution = [
        ["A","B","C","D","E","F","G","H","I"],
        ["D","E","F","G","H","I","A","B","C"],
        ["G","H","I","A","B","C","D","E","F"],

        ["B","C","D","E","F","G","H","I","A"],
        ["E","F","G","H","I","A","B","C","D"],
        ["H","I","A","B","C","D","E","F","G"],

        ["C","D","E","F","G","H","I","A","B"],
        ["F","G","H","I","A","B","C","D","E"],
        ["I","A","B","C","D","E","F","G","H"]
    ];

    let board =
        solution.map(row => [...row]);

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Word Sudoku</h2>

            <p>
                Use A–I instead of numbers.
            </p>

            <div
                id="wordSudokuGrid"
                class="sudoku-grid">
            </div>

            <div
                id="wordSudokuStatus"
                class="result">
                Complete the puzzle.
            </div>

            <button
                id="wordSudokuNew"
                class="game-btn">
                New Puzzle
            </button>

        </div>

    `;

    const grid =
        document.getElementById(
            "wordSudokuGrid"
        );

    const status =
        document.getElementById(
            "wordSudokuStatus"
        );

    const newButton =
        document.getElementById(
            "wordSudokuNew"
        );

    function generate() {

        board =
            solution.map(
                row => [...row]
            );

        const positions =
            Array.from(
                { length: 81 },
                (_, i) => i
            );

        positions.sort(
            () => Math.random() - 0.5
        );

        for (
            let i = 0;
            i < 45;
            i++
        ) {

            const pos =
                positions[i];

            const row =
                Math.floor(pos / 9);

            const col =
                pos % 9;

            board[row][col] = "";
        }
    }

    function render() {

        grid.innerHTML = "";

        for (
            let row = 0;
            row < 9;
            row++
        ) {

            for (
                let col = 0;
                col < 9;
                col++
            ) {

                const input =
                    document.createElement(
                        "input"
                    );

                input.className =
                    "sudoku-cell";

                input.maxLength = 1;

                if (
                    board[row][col]
                ) {

                    input.value =
                        board[row][col];

                    input.readOnly =
                        true;

                    input.classList.add(
                        "given"
                    );

                } else {

                    input.oninput = () => {

                        let value =
                            input.value
                                .toUpperCase()
                                .replace(
                                    /[^A-I]/g,
                                    ""
                                );

                        input.value =
                            value;

                        board[row][col] =
                            value;

                        validate();
                    };
                }

                grid.appendChild(
                    input
                );
            }
        }
    }

    function validate() {

        let complete = true;
        let correct = true;

        for (
            let row = 0;
            row < 9;
            row++
        ) {

            for (
                let col = 0;
                col < 9;
                col++
            ) {

                if (!board[row][col]) {
                    complete = false;
                }

                if (
                    board[row][col] !==
                    solution[row][col]
                ) {
                    correct = false;
                }
            }
        }

        if (!complete) {

            status.textContent =
                "Keep going...";

            return;
        }

        if (correct) {

            status.textContent =
                "🎉 Word Sudoku solved!";

            gameWon();

        } else {

            status.textContent =
                "❌ Some answers are incorrect.";
        }
    }

    newButton.onclick = () => {

        generate();
        render();

        status.textContent =
            "New puzzle created.";
    };

    generate();
    render();
}

/* =========================================================
   15 PUZZLE
   ========================================================= */

function fifteen() {

    let board = [
        1,2,3,4,
        5,6,7,8,
        9,10,11,12,
        13,14,15,0
    ];

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>15 Puzzle</h2>

            <p>
                Arrange the numbers from 1–15.
            </p>

            <div
                id="fifteenGrid"
                class="fifteen-grid">
            </div>

            <div
                id="fifteenStatus"
                class="result">
            </div>

            <button
                id="fifteenShuffle"
                class="game-btn">
                Shuffle
            </button>

        </div>

    `;

    const grid =
        document.getElementById(
            "fifteenGrid"
        );

    const status =
        document.getElementById(
            "fifteenStatus"
        );

    function render() {

        grid.innerHTML = "";

        board.forEach(
            (value, index) => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type = "button";

                button.className =
                    "puzzle-tile";

                if (value !== 0) {
                    button.textContent =
                        value;
                } else {
                    button.classList.add(
                        "empty"
                    );
                }

                button.onclick = () => {

                    const empty =
                        board.indexOf(0);

                    const r1 =
                        Math.floor(
                            index / 4
                        );

                    const c1 =
                        index % 4;

                    const r2 =
                        Math.floor(
                            empty / 4
                        );

                    const c2 =
                        empty % 4;

                    if (
                        Math.abs(r1-r2) +
                        Math.abs(c1-c2)
                        !== 1
                    ) {
                        return;
                    }

                    [
                        board[index],
                        board[empty]
                    ] =
                    [
                        board[empty],
                        board[index]
                    ];

                    render();

                    if (
                        board.every(
                            (v,i) =>
                                v ===
                                (
                                    i === 15
                                    ? 0
                                    : i + 1
                                )
                        )
                    ) {

                        status.textContent =
                            "🎉 Solved!";

                        gameWon();
                    }
                };

                grid.appendChild(
                    button
                );
            }
        );
    }

    function shuffle() {

        for (
            let i = 0;
            i < 150;
            i++
        ) {

            const empty =
                board.indexOf(0);

            const row =
                Math.floor(
                    empty / 4
                );

            const col =
                empty % 4;

            const moves = [];

            if (row > 0)
                moves.push(empty - 4);

            if (row < 3)
                moves.push(empty + 4);

            if (col > 0)
                moves.push(empty - 1);

            if (col < 3)
                moves.push(empty + 1);

            const move =
                moves[
                    Math.floor(
                        Math.random() *
                        moves.length
                    )
                ];

            [
                board[empty],
                board[move]
            ] =
            [
                board[move],
                board[empty]
            ];
        }

        status.textContent =
            "Arrange the numbers.";

        render();
    }

    document
        .getElementById(
            "fifteenShuffle"
        )
        .onclick = shuffle;

    shuffle();
}

/* =========================================================
   LIGHTS OUT
   ========================================================= */

function lightsOut() {

    let lights =
        Array(25).fill(false);

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Lights Out</h2>

            <p>
                Turn every light off.
            </p>

            <div
                id="lightsGrid"
                class="lights-grid">
            </div>

            <div
                id="lightsStatus"
                class="result">
            </div>

            <button
                id="lightsNew"
                class="game-btn">
                New Puzzle
            </button>

        </div>

    `;

    const grid =
        document.getElementById(
            "lightsGrid"
        );

    const status =
        document.getElementById(
            "lightsStatus"
        );

    function toggle(index) {

        const row =
            Math.floor(index / 5);

        const col =
            index % 5;

        const cells = [
            [row,col],
            [row-1,col],
            [row+1,col],
            [row,col-1],
            [row,col+1]
        ];

        cells.forEach(
            ([r,c]) => {

                if (
                    r >= 0 &&
                    r < 5 &&
                    c >= 0 &&
                    c < 5
                ) {

                    const i =
                        r * 5 + c;

                    lights[i] =
                        !lights[i];
                }

            }
        );
    }

    function render() {

        grid.innerHTML = "";

        lights.forEach(
            (on,index) => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type = "button";

                button.className =
                    "light-cell";

                if (on) {
                    button.classList.add(
                        "on"
                    );
                }

                button.onclick = () => {

                    toggle(index);

                    render();

                    const remaining =
                        lights.filter(
                            Boolean
                        ).length;

                    status.textContent =
                        `Lights remaining: ${remaining}`;

                    if (
                        remaining === 0
                    ) {

                        status.textContent =
                            "🎉 All lights are off!";

                        gameWon();
                    }
                };

                grid.appendChild(
                    button
                );
            }
        );
    }

    function newPuzzle() {

        lights =
            Array(25).fill(false);

        for (
            let i = 0;
            i < 12;
            i++
        ) {

            toggle(
                Math.floor(
                    Math.random() * 25
                )
            );
        }

        render();

        status.textContent =
            "Turn every light off.";
    }

    document
        .getElementById(
            "lightsNew"
        )
        .onclick =
        newPuzzle;

    newPuzzle();
}

/* =========================================================
   STROOP
   ========================================================= */

function stroop() {

    const colors = [
        "RED",
        "BLUE",
        "GREEN",
        "YELLOW"
    ];

    let score = 0;
    let question = 0;

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Stroop Focus</h2>

            <p>
                Choose the COLOR, not the word.
            </p>

            <div
                id="stroopWord"
                style="
                font-size:48px;
                font-weight:900;
                margin:30px;">
            </div>

            <div
                id="stroopButtons"
                class="button-grid">
            </div>

            <div
                id="stroopStatus"
                class="result">
                Score: 0 / 10
            </div>

        </div>

    `;

    const word =
        document.getElementById(
            "stroopWord"
        );

    const buttons =
        document.getElementById(
            "stroopButtons"
        );

    const status =
        document.getElementById(
            "stroopStatus"
        );

    function next() {

        if (question >= 10) {

            gameWon();

            status.textContent =
                `🎉 Finished! ${score}/10`;

            return;
        }

        question++;

        const text =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

        const color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

        word.textContent =
            text;

        word.style.color =
            color.toLowerCase();

        buttons.innerHTML = "";

        colors.forEach(
            value => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.className =
                    "game-btn";

                button.type =
                    "button";

                button.textContent =
                    value;

                button.onclick = () => {

                    if (
                        value === color
                    ) {
                        score++;
                    }

                    status.textContent =
                        `Score: ${score}/10`;

                    next();
                };

                buttons.appendChild(
                    button
                );
            }
        );
    }

    next();
}

/* =========================================================
   PATTERN
   ========================================================= */

function pattern() {

    let pattern =
        [];

    let player =
        [];

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Pattern Challenge</h2>

            <p>
                Remember the pattern.
            </p>

            <div
                id="patternGrid"
                class="pattern-grid">
            </div>

            <div
                id="patternStatus"
                class="result">
                Press Start
            </div>

            <button
                id="patternStart"
                class="game-btn">
                Start
            </button>

        </div>

    `;

    const grid =
        document.getElementById(
            "patternGrid"
        );

    const status =
        document.getElementById(
            "patternStatus"
        );

    const start =
        document.getElementById(
            "patternStart"
        );

    const cells = [];

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const cell =
            document.createElement(
                "button"
            );

        cell.className =
            "pattern-cell";

        cell.onclick = () => {

            if (
                !start.disabled
            ) {
                return;
            }

            player.push(i);

            if (
                player[
                    player.length - 1
                ] !==
                pattern[
                    player.length - 1
                ]
            ) {

                status.textContent =
                    "❌ Wrong pattern.";

                start.disabled =
                    false;

                return;
            }

            if (
                player.length ===
                pattern.length
            ) {

                gameWon();

                status.textContent =
                    "🎉 Correct pattern!";

                start.disabled =
                    false;
            }
        };

        cells.push(cell);

        grid.appendChild(
            cell
        );
    }

    start.onclick = () => {

        pattern = [
            Math.floor(
                Math.random() * 4
            ),
            Math.floor(
                Math.random() * 4
            ),
            Math.floor(
                Math.random() * 4
            ),
            Math.floor(
                Math.random() * 4
            )
        ];

        player = [];

        start.disabled =
            true;

        pattern.forEach(
            (index,position) => {

                timeout(() => {

                    cells[index]
                        .classList.add(
                            "active"
                        );

                    timeout(() => {

                        cells[index]
                            .classList.remove(
                                "active"
                            );

                    },350);

                },position * 500);
            }
        );

        timeout(() => {

            status.textContent =
                "Your turn!";

        },pattern.length * 500);
    };
}

/* =========================================================
   ODD ONE OUT
   ========================================================= */

function oddOneOut() {

    const odd =
        Math.floor(
            Math.random() * 9
        );

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Odd One Out</h2>

            <p>
                Find the different symbol.
            </p>

            <div
                id="oddGrid"
                class="odd-grid">
            </div>

            <div
                id="oddStatus"
                class="result">
            </div>

        </div>

    `;

    const grid =
        document.getElementById(
            "oddGrid"
        );

    const status =
        document.getElementById(
            "oddStatus"
        );

    for (
        let i = 0;
        i < 9;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "odd-cell";

        button.textContent =
            i === odd
                ? "◇"
                : "◆";

        button.onclick = () => {

            if (i === odd) {

                status.textContent =
                    "🎉 Correct!";

                gameWon();

            } else {

                status.textContent =
                    "❌ Try again.";
            }
        };

        grid.appendChild(
            button
        );
    }
}

/* =========================================================
   WORD SCRAMBLE
   ========================================================= */

function scramble() {

    const words = [
        "planet",
        "rocket",
        "science",
        "library",
        "computer",
        "galaxy",
        "puzzle",
        "adventure"
    ];

    const answer =
        words[
            Math.floor(
                Math.random() *
                words.length
            )
        ];

    const scrambled =
        answer
            .split("")
            .sort(
                () => Math.random() - 0.5
            )
            .join("");

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Word Scramble</h2>

            <div
                style="
                font-size:42px;
                font-weight:900;
                margin:25px;">
                ${scrambled}
            </div>

            <input
                id="scrambleInput"
                class="game-input"
                placeholder="Your answer">

            <button
                id="scrambleCheck"
                class="game-btn">
                Check
            </button>

            <div
                id="scrambleStatus"
                class="result">
            </div>

        </div>

    `;

    const input =
        document.getElementById(
            "scrambleInput"
        );

    const button =
        document.getElementById(
            "scrambleCheck"
        );

    const status =
        document.getElementById(
            "scrambleStatus"
        );

    function check() {

        if (
            input.value
                .trim()
                .toLowerCase() ===
            answer
        ) {

            status.textContent =
                "🎉 Correct!";

            gameWon();

        } else {

            status.textContent =
                "❌ Try again.";
        }
    }

    button.onclick =
        check;

    input.onkeydown =
        event => {

            if (
                event.key === "Enter"
            ) {
                check();
            }

        };

    input.focus();
}

/* =========================================================
   AIM TRAINER
   ========================================================= */

function aimTrainer() {

    let score = 0;
    let remaining = 10;

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Aim Trainer</h2>

            <p>
                Click the targets.
            </p>

            <div
                id="aimArea"
                style="
                position:relative;
                height:350px;
                overflow:hidden;
                border-radius:20px;
                background:rgba(255,255,255,.05);">
            </div>

            <div
                id="aimStatus"
                class="result">
                Targets: 10
            </div>

        </div>

    `;

    const area =
        document.getElementById(
            "aimArea"
        );

    const status =
        document.getElementById(
            "aimStatus"
        );

    function spawn() {

        area.innerHTML = "";

        if (remaining <= 0) {

            status.textContent =
                `🎉 Score: ${score}/10`;

            gameWon();

            return;
        }

        const target =
            document.createElement(
                "button"
            );

        target.type =
            "button";

        target.textContent =
            "●";

        target.style.position =
            "absolute";

        target.style.width =
            "55px";

        target.style.height =
            "55px";

        target.style.borderRadius =
            "50%";

        target.style.left =
            `${Math.random()*85}%`;

        target.style.top =
            `${Math.random()*75}%`;

        target.onclick = () => {

            score++;
            remaining--;

            status.textContent =
                `Targets remaining: ${remaining}`;

            spawn();
        };

        area.appendChild(
            target
        );
    }

    spawn();
}

/* =========================================================
   TYPING
   ========================================================= */

function typing() {

    const texts = [
        "The quick brown fox jumps over the lazy dog.",
        "Learning new things makes the brain stronger.",
        "Space exploration teaches us about our universe.",
        "Practice makes people faster and more accurate."
    ];

    const text =
        texts[
            Math.floor(
                Math.random() *
                texts.length
            )
        ];

    const startTime =
        performance.now();

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Typing Speed</h2>

            <p>
                ${text}
            </p>

            <textarea
                id="typingInput"
                class="game-input"
                rows="5"
                placeholder="Start typing...">
            </textarea>

            <div
                id="typingStatus"
                class="result">
                Start typing.
            </div>

        </div>

    `;

    const input =
        document.getElementById(
            "typingInput"
        );

    const status =
        document.getElementById(
            "typingStatus"
        );

    input.focus();

    input.oninput = () => {

        const value =
            input.value;

        if (
            !text.startsWith(value)
        ) {

            status.textContent =
                "⚠️ Check your typing.";

            return;
        }

        if (
            value === text
        ) {

            const seconds =
                (
                    performance.now() -
                    startTime
                ) / 1000;

            const words =
                text.split(/\s+/).length;

            const wpm =
                Math.round(
                    words /
                    seconds *
                    60
                );

            if (
                stats.bestTyping === null ||
                wpm > stats.bestTyping
            ) {
                stats.bestTyping =
                    wpm;
            }

            saveStats();

            status.textContent =
                `🎉 Complete! ${wpm} WPM`;

            gameWon();
        }
    };
}

/* =========================================================
   FOCUS TEST
   ========================================================= */

function focusTest() {

    let waiting = false;
    let ready = false;
    let start = 0;

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Focus Test</h2>

            <p>
                Click when the button says
                CLICK NOW.
            </p>

            <button
                id="focusButton"
                class="game-btn">
                Start
            </button>

            <div
                id="focusStatus"
                class="result">
            </div>

        </div>

    `;

    const button =
        document.getElementById(
            "focusButton"
        );

    const status =
        document.getElementById(
            "focusStatus"
        );

    button.onclick = () => {

        if (!waiting && !ready) {

            waiting = true;

            button.textContent =
                "WAIT...";

            timeout(() => {

                waiting = false;
                ready = true;

                start =
                    performance.now();

                button.textContent =
                    "CLICK NOW!";

                button.classList.add(
                    "ready"
                );

            },1000 + Math.random()*2500);

            return;
        }

        if (waiting) {

            clearTimers();

            waiting = false;

            button.textContent =
                "Start";

            status.textContent =
                "❌ Too early!";

            return;
        }

        if (ready) {

            const time =
                Math.round(
                    performance.now() -
                    start
                );

            ready = false;

            button.textContent =
                "Start";

            button.classList.remove(
                "ready"
            );

            status.textContent =
                `⚡ ${time} ms`;

            gameWon();
        }
    };
}

/* =========================================================
   QUICK MATH
   ========================================================= */

function quickMath() {

    let score = 0;
    let question = 0;
    let answer = 0;

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Quick Math</h2>

            <div
                id="mathQuestion"
                style="
                font-size:40px;
                font-weight:900;
                margin:20px;">
            </div>

            <input
                id="mathInput"
                class="game-input"
                type="number"
                placeholder="Answer">

            <button
                id="mathCheck"
                class="game-btn">
                Check
            </button>

            <div
                id="mathStatus"
                class="result">
                Score: 0 / 10
            </div>

        </div>

    `;

    const questionBox =
        document.getElementById(
            "mathQuestion"
        );

    const input =
        document.getElementById(
            "mathInput"
        );

    const check =
        document.getElementById(
            "mathCheck"
        );

    const status =
        document.getElementById(
            "mathStatus"
        );

    function next() {

        if (question >= 10) {

            status.textContent =
                `🎉 Finished! ${score}/10`;

            check.disabled = true;
            input.disabled = true;

            gameWon();

            return;
        }

        question++;

        const a =
            Math.floor(
                Math.random()*20
            ) + 1;

        const b =
            Math.floor(
                Math.random()*20
            ) + 1;

        answer =
            a + b;

        questionBox.textContent =
            `${a} + ${b} = ?`;

        input.value = "";

        input.focus();
    }

    function submit() {

        if (
            Number(input.value) ===
            answer
        ) {
            score++;
        }

        status.textContent =
            `Score: ${score}/10`;

        next();
    }

    check.onclick =
        submit;

    input.onkeydown =
        event => {

            if (
                event.key === "Enter"
            ) {
                submit();
            }

        };

    next();
}

/* =========================================================
   ANAGRAM
   ========================================================= */

function anagram() {

    const letters =
        "PLANET";

    const validWords = [
        "PLAN",
        "PANEL",
        "PLANE",
        "PLANET"
    ];

    const found =
        new Set();

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Anagram Challenge</h2>

            <p>
                Make words from:
            </p>

            <div
                style="
                font-size:42px;
                font-weight:900;
                letter-spacing:8px;
                margin:20px;">
                ${letters}
            </div>

            <input
                id="anagramInput"
                class="game-input"
                placeholder="Enter a word">

            <button
                id="anagramAdd"
                class="game-btn">
                Add Word
            </button>

            <div
                id="anagramStatus"
                class="result">
                Words found: 0
            </div>

        </div>

    `;

    const input =
        document.getElementById(
            "anagramInput"
        );

    const button =
        document.getElementById(
            "anagramAdd"
        );

    const status =
        document.getElementById(
            "anagramStatus"
        );

    function possible(word) {

        const chars =
            letters
                .toLowerCase()
                .split("");

        for (
            const char of word
                .toLowerCase()
        ) {

            const index =
                chars.indexOf(char);

            if (index === -1) {
                return false;
            }

            chars.splice(
                index,
                1
            );
        }

        return true;
    }

    function addWord() {

        const word =
            input.value
                .trim()
                .toLowerCase();

        if (
            word.length < 2 ||
            !possible(word)
        ) {

            status.textContent =
                "❌ That word cannot be made.";

            return;
        }

        if (
            found.has(word)
        ) {

            status.textContent =
                "⚠️ Already found.";

            return;
        }

        found.add(word);

        status.textContent =
            `Words found: ${[
                ...found
            ].join(", ")}`;

        if (
            validWords.every(
                x =>
                    found.has(
                        x.toLowerCase()
                    )
            )
        ) {

            gameWon();
        }

        input.value = "";
        input.focus();
    }

    button.onclick =
        addWord;

    input.onkeydown =
        event => {

            if (
                event.key === "Enter"
            ) {
                addWord();
            }

        };
}

/* =========================================================
   WORD SEARCH
   ========================================================= */

function wordSearch() {

    const words = [
        "BRAIN",
        "MIND",
        "FOCUS",
        "LOGIC",
        "PUZZLE"
    ];

    const size = 10;

    let grid = [];

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Word Search</h2>

            <p>
                Find the hidden words.
            </p>

            <div
                id="wordSearchGrid"
                class="word-search-grid">
            </div>

            <div
                id="wordSearchWords"
                class="result">
                ${words.join(" • ")}
            </div>

            <button
                id="wordSearchNew"
                class="game-btn">
                New Puzzle
            </button>

        </div>

    `;

    const gridBox =
        document.getElementById(
            "wordSearchGrid"
        );

    const wordBox =
        document.getElementById(
            "wordSearchWords"
        );

    function generate() {

        grid =
            Array.from(
                {length:size},
                () =>
                    Array(size).fill("")
            );

        words.forEach(word => {

            let placed = false;

            for (
                let attempt = 0;
                attempt < 500 &&
                !placed;
                attempt++
            ) {

                const row =
                    Math.floor(
                        Math.random()*size
                    );

                const col =
                    Math.floor(
                        Math.random()*size
                    );

                const directions = [
                    [0,1],
                    [1,0],
                    [1,1],
                    [-1,1]
                ];

                const direction =
                    directions[
                        Math.floor(
                            Math.random() *
                            directions.length
                        )
                    ];

                const dr =
                    direction[0];

                const dc =
                    direction[1];

                let possible =
                    true;

                for (
                    let i=0;
                    i<word.length;
                    i++
                ) {

                    const r =
                        row + dr*i;

                    const c =
                        col + dc*i;

                    if (
                        r<0 ||
                        r>=size ||
                        c<0 ||
                        c>=size
                    ) {

                        possible = false;
                        break;
                    }

                    if (
                        grid[r][c] &&
                        grid[r][c] !==
                        word[i]
                    ) {

                        possible = false;
                        break;
                    }
                }

                if (!possible) {
                    continue;
                }

                for (
                    let i=0;
                    i<word.length;
                    i++
                ) {

                    grid[
                        row+dr*i
                    ][
                        col+dc*i
                    ] =
                        word[i];
                }

                placed = true;
            }
        });

        const alphabet =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (
            let r=0;
            r<size;
            r++
        ) {

            for (
                let c=0;
                c<size;
                c++
            ) {

                if (!grid[r][c]) {

                    grid[r][c] =
                        alphabet[
                            Math.floor(
                                Math.random() *
                                alphabet.length
                            )
                        ];
                }
            }
        }
    }

    function render() {

        gridBox.innerHTML = "";

        grid.forEach(
            row => {

                row.forEach(
                    letter => {

                        const cell =
                            document.createElement(
                                "button"
                            );

                        cell.type =
                            "button";

                        cell.className =
                            "word-search-cell";

                        cell.textContent =
                            letter;

                        cell.onclick = () => {

                            cell.classList.toggle(
                                "selected"
                            );
                        };

                        gridBox.appendChild(
                            cell
                        );
                    }
                );
            }
        );
    }

    document
        .getElementById(
            "wordSearchNew"
        )
        .onclick = () => {

            generate();
            render();

            wordBox.textContent =
                words.join(" • ");
        };

    generate();
    render();
}

/* =========================================================
   CHOICE REACTION
   ========================================================= */

function choiceReaction() {

    let active = false;
    let start = 0;
    let expected = "";

    const keys = [
        "A",
        "S",
        "D",
        "F"
    ];

    gameArea.innerHTML = `

        <div class="game-intro">

            <h2>Choice Reaction</h2>

            <p>
                When a letter appears,
                press the matching key.
            </p>

            <div
                style="
                font-size:60px;
                font-weight:900;
                margin:25px;"
                id="choiceSignal">
                ?
            </div>

            <button
                id="choiceStart"
                class="game-btn">
                Start
            </button>

            <div
                id="choiceStatus"
                class="result">
            </div>

        </div>

    `;

    const signal =
        document.getElementById(
            "choiceSignal"
        );

    const startButton =
        document.getElementById(
            "choiceStart"
        );

    const status =
        document.getElementById(
            "choiceStatus"
        );

    function keyHandler(event) {

        if (!active) {
            return;
        }

        const key =
            event.key.toUpperCase();

        if (!keys.includes(key)) {
            return;
        }

        active = false;

        const time =
            Math.round(
                performance.now() -
                start
            );

        if (
            key === expected
        ) {

            status.textContent =
                `🎉 ${time} ms`;

            if (
                stats.bestReaction === null ||
                time < stats.bestReaction
            ) {

                stats.bestReaction =
                    time;
            }

            gameWon();

        } else {

            status.textContent =
                `❌ Wrong key. Expected ${expected}.`;
        }

        startButton.disabled =
            false;

        startButton.textContent =
            "Try Again";
    }

    document.addEventListener(
        "keydown",
        keyHandler
    );

    cleanupFunction = () => {

        document.removeEventListener(
            "keydown",
            keyHandler
        );

        active = false;
    };

    startButton.onclick = () => {

        clearTimers();

        active = false;

        startButton.disabled =
            true;

        signal.textContent =
            "WAIT";

        timeout(() => {

            expected =
                keys[
                    Math.floor(
                        Math.random() *
                        keys.length
                    )
                ];

            signal.textContent =
                expected;

            start =
                performance.now();

            active = true;

        },1000 + Math.random()*2500);
    };
}

/* =========================================================
   START
   ========================================================= */

loadStats();

console.log(
    "Ultimate Brain Lab loaded successfully."
);

});
