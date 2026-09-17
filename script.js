/* =========================================================
   ULTIMATE BRAIN LAB
   Corrected QA Version
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

const gameArea = document.getElementById("gameArea");
const modal = document.getElementById("gameModal");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModal");

let activeTimers = [];
let activeIntervals = [];
let activeCleanup = null;

let stats = {
    games: 0,
    wins: 0,
    bestReaction: null,
    bestTyping: null,
    bestMemory: 0
};

/* =========================================================
   SAFE STORAGE
   ========================================================= */

function loadStats() {
    try {
        const saved = localStorage.getItem("ultimateBrainLabStats");

        if (saved) {
            const parsed = JSON.parse(saved);

            if (parsed && typeof parsed === "object") {
                stats = {
                    ...stats,
                    ...parsed
                };
            }
        }
    } catch (error) {
        console.warn("Could not load saved stats.", error);
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
        console.warn("Could not save stats.", error);
    }
}

function updateStats() {
    const gamesEl = document.getElementById("gamesPlayed");
    const winsEl = document.getElementById("wins");
    const reactionEl = document.getElementById("bestReaction");
    const memoryEl = document.getElementById("bestMemory");

    if (gamesEl) gamesEl.textContent = stats.games;
    if (winsEl) winsEl.textContent = stats.wins;

    if (reactionEl) {
        reactionEl.textContent =
            stats.bestReaction === null
                ? "--"
                : `${stats.bestReaction} ms`;
    }

    if (memoryEl) {
        memoryEl.textContent =
            stats.bestMemory > 0
                ? stats.bestMemory
                : "--";
    }
}

function recordGame() {
    stats.games++;
    saveStats();
    updateStats();
}

function recordWin() {
    stats.wins++;
    saveStats();
    updateStats();
}

/* =========================================================
   TIMER MANAGEMENT
   ========================================================= */

function safeTimeout(fn, delay) {
    const id = setTimeout(() => {
        activeTimers = activeTimers.filter(timer => timer !== id);
        fn();
    }, delay);

    activeTimers.push(id);
    return id;
}

function safeInterval(fn, delay) {
    const id = setInterval(fn, delay);
    activeIntervals.push(id);
    return id;
}

function clearAllTimers() {
    activeTimers.forEach(id => clearTimeout(id));
    activeIntervals.forEach(id => clearInterval(id));

    activeTimers = [];
    activeIntervals = [];
}

function cleanupCurrentGame() {
    clearAllTimers();

    if (typeof activeCleanup === "function") {
        try {
            activeCleanup();
        } catch (error) {
            console.warn("Game cleanup error:", error);
        }
    }

    activeCleanup = null;
}

/* =========================================================
   MODAL
   ========================================================= */

function openGame(title, gameFunction) {
    cleanupCurrentGame();

    if (modalTitle) {
        modalTitle.textContent = title;
    }

    if (gameArea) {
        gameArea.innerHTML = "";
    }

    modal.classList.add("show");

    recordGame();

    gameFunction();
}

function closeGame() {
    cleanupCurrentGame();

    if (modal) {
        modal.classList.remove("show");
    }

    if (gameArea) {
        gameArea.innerHTML = "";
    }
}

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeGame);
}

if (modal) {
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeGame();
        }
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
        closeGame();
    }
});

/* =========================================================
   GAME CARD BUTTONS
   ========================================================= */

document.querySelectorAll("[data-game]").forEach(button => {
    button.addEventListener("click", () => {
        const game = button.dataset.game;

        const games = {
            reaction: ["Reaction Time", reaction],
            memory: ["Memory Match", memory],
            sequence: ["Sequence Memory", sequence],
            number: ["Number Memory", numberMemory],
            sudoku: ["Classic Sudoku", sudoku],
            wordSudoku: ["Word Sudoku", wordSudoku],
            fifteen: ["15 Puzzle", fifteen],
            lights: ["Lights Out", lightsOut],
            stroop: ["Stroop Focus", stroop],
            pattern: ["Pattern Challenge", pattern],
            odd: ["Odd One Out", oddOneOut],
            scramble: ["Word Scramble", scramble],
            aim: ["Aim Trainer", aimTrainer],
            typing: ["Typing Speed", typing],
            focus: ["Focus Test", focusTest],
            math: ["Quick Math", quickMath],
            anagram: ["Anagram", anagram],
            wordsearch: ["Word Search", wordSearch],
            choice: ["Choice Reaction", choiceReaction]
        };

        if (games[game]) {
            openGame(games[game][0], games[game][1]);
        }
    });
});

/* =========================================================
   1. REACTION TIME
   ========================================================= */

function reaction() {
    let startTime = 0;
    let waiting = true;
    let finished = false;

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Reaction Time</h2>
            <p>Wait for the box to turn green, then click as quickly as possible.</p>
            <button id="reactionStart" class="game-btn">Start</button>
            <div id="reactionBox" class="reaction-box">WAIT</div>
            <div id="reactionResult" class="result"></div>
        </div>
    `;

    const startBtn = document.getElementById("reactionStart");
    const box = document.getElementById("reactionBox");
    const result = document.getElementById("reactionResult");

    startBtn.addEventListener("click", () => {
        if (!waiting) return;

        waiting = false;
        finished = false;

        box.textContent = "WAIT...";
        box.classList.remove("ready");

        const delay = 1200 + Math.random() * 3000;

        safeTimeout(() => {
            startTime = performance.now();

            box.textContent = "CLICK!";
            box.classList.add("ready");
        }, delay);
    });

    box.addEventListener("click", () => {
        if (waiting || finished) return;

        if (!box.classList.contains("ready")) {
            clearAllTimers();

            box.textContent = "TOO EARLY!";
            result.textContent = "Press Start and try again.";

            waiting = true;
            return;
        }

        const reactionTime = Math.round(performance.now() - startTime);

        finished = true;
        waiting = true;

        box.textContent = `${reactionTime} ms`;

        if (
            stats.bestReaction === null ||
            reactionTime < stats.bestReaction
        ) {
            stats.bestReaction = reactionTime;
        }

        recordWin();
        saveStats();
        updateStats();

        result.textContent = "Great reaction!";
    });
}

/* =========================================================
   2. MEMORY MATCH
   ========================================================= */

function memory() {
    const symbols = [
        "🍎", "🍎",
        "🚀", "🚀",
        "⭐", "⭐",
        "🎯", "🎯",
        "🧠", "🧠",
        "🔥", "🔥",
        "🌎", "🌎",
        "⚡", "⚡"
    ];

    symbols.sort(() => Math.random() - 0.5);

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Memory Match</h2>
            <p>Find all matching pairs.</p>

            <div id="memoryGrid" class="memory-grid"></div>

            <div id="memoryStatus" class="result">
                Matches: 0 / 8
            </div>
        </div>
    `;

    const grid = document.getElementById("memoryGrid");
    const status = document.getElementById("memoryStatus");

    let first = null;
    let second = null;
    let locked = false;
    let matches = 0;

    symbols.forEach((symbol, index) => {
        const card = document.createElement("button");

        card.className = "memory-card";
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        card.textContent = "?";

        card.addEventListener("click", () => {
            if (locked || card.classList.contains("matched")) return;

            card.textContent = symbol;
            card.classList.add("flipped");

            if (!first) {
                first = card;
                return;
            }

            second = card;
            locked = true;

            if (first.dataset.symbol === second.dataset.symbol) {
                first.classList.add("matched");
                second.classList.add("matched");

                matches++;

                status.textContent = `Matches: ${matches} / 8`;

                first = null;
                second = null;
                locked = false;

                if (matches === 8) {
                    recordWin();
                    status.textContent = "🎉 All pairs matched!";
                }
            } else {
                safeTimeout(() => {
                    first.textContent = "?";
                    second.textContent = "?";

                    first.classList.remove("flipped");
                    second.classList.remove("flipped");

                    first = null;
                    second = null;
                    locked = false;
                }, 700);
            }
        });

        grid.appendChild(card);
    });
}

/* =========================================================
   3. SEQUENCE MEMORY
   ========================================================= */

function sequence() {
    let level = 1;
    let sequenceList = [];
    let playerIndex = 0;
    let acceptingInput = false;
    let gameRunning = false;
    let generation = 0;

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Sequence Memory</h2>
            <p>Watch the sequence, then repeat it.</p>

            <div id="sequenceBoard" class="sequence-board"></div>

            <div id="sequenceStatus" class="result">
                Level 1
            </div>

            <button id="sequenceStart" class="game-btn">
                Start
            </button>
        </div>
    `;

    const board = document.getElementById("sequenceBoard");
    const status = document.getElementById("sequenceStatus");
    const startBtn = document.getElementById("sequenceStart");

    const cells = [];

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("button");

        cell.className = "sequence-cell";
        cell.dataset.index = i;

        cell.addEventListener("click", () => {
            if (!acceptingInput) return;

            const selected = Number(cell.dataset.index);

            if (selected !== sequenceList[playerIndex]) {
                acceptingInput = false;
                gameRunning = false;

                cell.classList.add("wrong");

                status.textContent =
                    `Game Over — You reached level ${level}`;

                if (level - 1 > stats.bestMemory) {
                    stats.bestMemory = level - 1;
                    saveStats();
                    updateStats();
                }

                return;
            }

            cell.classList.add("active");

            safeTimeout(() => {
                cell.classList.remove("active");
            }, 180);

            playerIndex++;

            if (playerIndex === sequenceList.length) {
                acceptingInput = false;

                level++;

                if (level - 1 > stats.bestMemory) {
                    stats.bestMemory = level - 1;
                    saveStats();
                    updateStats();
                }

                status.textContent = `Level ${level}`;

                safeTimeout(() => {
                    if (gameRunning) {
                        nextRound();
                    }
                }, 450);
            }
        });

        cells.push(cell);
        board.appendChild(cell);
    }

    function nextRound() {
        generation++;

        const currentGeneration = generation;

        playerIndex = 0;
        acceptingInput = false;

        const newIndex = Math.floor(Math.random() * 9);

        sequenceList.push(newIndex);

        status.textContent =
            `Watch carefully — Level ${level}`;

        cells.forEach(cell => {
            cell.disabled = true;
            cell.classList.remove("active", "wrong");
        });

        sequenceList.forEach((index, position) => {
            safeTimeout(() => {
                if (currentGeneration !== generation) return;

                const cell = cells[index];

                cell.classList.add("active");

                safeTimeout(() => {
                    cell.classList.remove("active");
                }, 400);
            }, position * 650);
        });

        safeTimeout(() => {
            if (currentGeneration !== generation) return;

            acceptingInput = true;

            cells.forEach(cell => {
                cell.disabled = false;
            });

            status.textContent =
                `Your turn — Level ${level}`;
        }, sequenceList.length * 650 + 250);
    }

    startBtn.addEventListener("click", () => {
        clearAllTimers();

        generation++;

        level = 1;
        sequenceList = [];
        playerIndex = 0;
        acceptingInput = false;
        gameRunning = true;

        startBtn.disabled = true;

        nextRound();
    });

    activeCleanup = () => {
        generation++;
        gameRunning = false;
        acceptingInput = false;
    };
}

/* =========================================================
   4. NUMBER MEMORY
   ========================================================= */

function numberMemory() {
    let level = 1;
    let number = "";
    let active = false;

    function render() {
        gameArea.innerHTML = `
            <div class="game-intro">
                <h2>Number Memory</h2>

                <p>
                    Memorize the number before it disappears.
                </p>

                <div id="numberDisplay"
                     style="
                     font-size:42px;
                     font-weight:800;
                     letter-spacing:8px;
                     margin:25px 0;
                     ">
                    ${number}
                </div>

                <div id="numberInputArea"></div>

                <div id="numberStatus" class="result">
                    Level ${level}
                </div>
            </div>
        `;

        const inputArea =
            document.getElementById("numberInputArea");

        if (!active) {
            inputArea.innerHTML = `
                <button id="numberStart"
                        class="game-btn">
                    Start Level ${level}
                </button>
            `;

            document
                .getElementById("numberStart")
                .addEventListener("click", startRound);
        }
    }

    function startRound() {
        active = true;

        number = "";

        for (let i = 0; i < level; i++) {
            number += Math.floor(Math.random() * 10);
        }

        render();

        safeTimeout(() => {
            if (!modal.classList.contains("show")) return;

            const display =
                document.getElementById("numberDisplay");

            const inputArea =
                document.getElementById("numberInputArea");

            if (display) {
                display.textContent = "???";
            }

            if (inputArea) {
                inputArea.innerHTML = `
                    <input
                        id="numberAnswer"
                        type="text"
                        inputmode="numeric"
                        autocomplete="off"
                        placeholder="Enter the number"
                        class="game-input"
                    >

                    <button id="numberSubmit"
                            class="game-btn">
                        Check
                    </button>
                `;

                const input =
                    document.getElementById("numberAnswer");

                const submit =
                    document.getElementById("numberSubmit");

                input.focus();

                submit.addEventListener("click", checkAnswer);

                input.addEventListener("keydown", event => {
                    if (event.key === "Enter") {
                        checkAnswer();
                    }
                });
            }
        }, Math.max(1200, 1800 - level * 40));
    }

    function checkAnswer() {
        const input =
            document.getElementById("numberAnswer");

        const status =
            document.getElementById("numberStatus");

        if (!input || !status) return;

        const answer = input.value.trim();

        if (answer === number) {
            recordWin();

            stats.bestMemory =
                Math.max(stats.bestMemory, level);

            saveStats();
            updateStats();

            status.textContent =
                `✅ Correct! Level ${level} complete.`;

            level++;
            active = false;

            safeTimeout(() => {
                if (modal.classList.contains("show")) {
                    render();
                }
            }, 900);
        } else {
            status.textContent =
                `❌ Incorrect. The number was ${number}.`;

            active = false;

            safeTimeout(() => {
                if (modal.classList.contains("show")) {
                    render();
                }
            }, 1200);
        }
    }

    render();
}

/* =========================================================
   5. CLASSIC SUDOKU
   REAL VALID GENERATOR
   ========================================================= */

function sudoku() {
    const SIZE = 9;

    let solution = [];
    let puzzle = [];
    let selectedCell = null;

    gameArea.innerHTML = `
        <div class="game-intro sudoku-game">
            <h2>Classic Sudoku</h2>

            <p>
                Fill every empty square so each row,
                column and 3×3 box contains 1–9 exactly once.
            </p>

            <div id="sudokuGrid" class="sudoku-grid"></div>

            <div id="sudokuStatus" class="result">
                Complete the puzzle.
            </div>

            <button id="sudokuNew"
                    class="game-btn">
                New Puzzle
            </button>
        </div>
    `;

    const grid = document.getElementById("sudokuGrid");
    const status = document.getElementById("sudokuStatus");
    const newBtn = document.getElementById("sudokuNew");

    function createEmptyBoard() {
        return Array.from(
            { length: SIZE },
            () => Array(SIZE).fill(0)
        );
    }

    function shuffle(array) {
        const copy = [...array];

        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [copy[i], copy[j]] =
                [copy[j], copy[i]];
        }

        return copy;
    }

    function isSafe(board, row, col, value) {
        for (let c = 0; c < SIZE; c++) {
            if (board[row][c] === value) {
                return false;
            }
        }

        for (let r = 0; r < SIZE; r++) {
            if (board[r][col] === value) {
                return false;
            }
        }

        const boxRow =
            Math.floor(row / 3) * 3;

        const boxCol =
            Math.floor(col / 3) * 3;

        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (board[r][c] === value) {
                    return false;
                }
            }
        }

        return true;
    }

    function solve(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) {
                    const numbers = shuffle(
                        [1, 2, 3, 4, 5, 6, 7, 8, 9]
                    );

                    for (const value of numbers) {
                        if (isSafe(board, row, col, value)) {
                            board[row][col] = value;

                            if (solve(board)) {
                                return true;
                            }

                            board[row][col] = 0;
                        }
                    }

                    return false;
                }
            }
        }

        return true;
    }

    function countSolutions(board, limit = 2) {
        let count = 0;

        function search() {
            if (count >= limit) return;

            let bestRow = -1;
            let bestCol = -1;
            let bestCandidates = null;

            for (let row = 0; row < SIZE; row++) {
                for (let col = 0; col < SIZE; col++) {
                    if (board[row][col] !== 0) continue;

                    const candidates = [];

                    for (let value = 1; value <= 9; value++) {
                        if (isSafe(board, row, col, value)) {
                            candidates.push(value);
                        }
                    }

                    if (candidates.length === 0) {
                        return;
                    }

                    if (
                        bestCandidates === null ||
                        candidates.length <
                            bestCandidates.length
                    ) {
                        bestCandidates = candidates;
                        bestRow = row;
                        bestCol = col;

                        if (candidates.length === 1) {
                            break;
                        }
                    }
                }

                if (
                    bestCandidates &&
                    bestCandidates.length === 1
                ) {
                    break;
                }
            }

            if (bestCandidates === null) {
                count++;
                return;
            }

            for (const value of bestCandidates) {
                board[bestRow][bestCol] = value;

                search();

                board[bestRow][bestCol] = 0;

                if (count >= limit) {
                    return;
                }
            }
        }

        search();

        return count;
    }

    function generatePuzzle() {
        const board = createEmptyBoard();

        solve(board);

        solution = board.map(row => [...row]);

        puzzle = board.map(row => [...row]);

        /*
         * Remove numbers while keeping a unique solution.
         * We don't remove too many cells so the puzzle
         * remains reasonable for a normal player.
         */

        const positions = shuffle(
            Array.from({ length: 81 }, (_, i) => i)
        );

        let removed = 0;
        const target = 46;

        for (const position of positions) {
            if (removed >= target) break;

            const row = Math.floor(position / 9);
            const col = position % 9;

            const backup = puzzle[row][col];

            puzzle[row][col] = 0;

            const testBoard =
                puzzle.map(r => [...r]);

            const solutions =
                countSolutions(testBoard, 2);

            if (solutions === 1) {
                removed++;
            } else {
                puzzle[row][col] = backup;
            }
        }
    }

    function render() {
        grid.innerHTML = "";

        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const cell = document.createElement("input");

                cell.className = "sudoku-cell";

                cell.type = "text";
                cell.inputMode = "numeric";
                cell.maxLength = 1;

                cell.dataset.row = row;
                cell.dataset.col = col;

                if (puzzle[row][col] !== 0) {
                    cell.value = puzzle[row][col];
                    cell.readOnly = true;
                    cell.classList.add("given");
                }

                cell.addEventListener("input", () => {
                    if (cell.readOnly) return;

                    cell.value =
                        cell.value.replace(/[^1-9]/g, "");

                    if (cell.value) {
                        puzzle[row][col] =
                            Number(cell.value);
                    } else {
                        puzzle[row][col] = 0;
                    }

                    selectedCell = cell;

                    validateBoard();
                });

                cell.addEventListener("focus", () => {
                    selectedCell = cell;
                    highlightRelated(row, col);
                });

                grid.appendChild(cell);
            }
        }
    }

    function highlightRelated(row, col) {
        const cells =
            grid.querySelectorAll(".sudoku-cell");

        cells.forEach(cell => {
            cell.classList.remove("related");
        });

        cells.forEach(cell => {
            const r = Number(cell.dataset.row);
            const c = Number(cell.dataset.col);

            if (
                r === row ||
                c === col ||
                (
                    Math.floor(r / 3) === Math.floor(row / 3) &&
                    Math.floor(c / 3) === Math.floor(col / 3)
                )
            ) {
                cell.classList.add("related");
            }
        });
    }

    function validateBoard() {
        let empty = false;
        let invalid = false;

        const cells =
            grid.querySelectorAll(".sudoku-cell");

        cells.forEach(cell => {
            cell.classList.remove("invalid");
        });

        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (puzzle[row][col] === 0) {
                    empty = true;
                    continue;
                }

                const value = puzzle[row][col];

                puzzle[row][col] = 0;

                if (!isSafe(puzzle, row, col, value)) {
                    invalid = true;

                    const cell = grid.querySelector(
                        `[data-row="${row}"][data-col="${col}"]`
                    );

                    if (cell) {
                        cell.classList.add("invalid");
                    }
                }

                puzzle[row][col] = value;
            }
        }

        if (invalid) {
            status.textContent =
                "⚠️ Some numbers conflict.";
            return;
        }

        if (empty) {
            status.textContent =
                "Keep going — the board is valid so far.";
            return;
        }

        if (isSolved()) {
            recordWin();

            status.textContent =
                "🎉 Sudoku solved correctly!";
        }
    }

    function isSolved() {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (puzzle[row][col] !== solution[row][col]) {
                    return false;
                }
            }
        }

        return true;
    }

    function newPuzzle() {
        generatePuzzle();
        render();

        status.textContent =
            "Complete the puzzle.";
    }

    newBtn.addEventListener("click", newPuzzle);

    newPuzzle();
}

/* =========================================================
   6. WORD SUDOKU
   ========================================================= */

function wordSudoku() {
    const symbols = [
        "A", "B", "C",
        "D", "E", "F",
        "G", "H", "I"
    ];

    let solution = [];
    let puzzle = [];

    gameArea.innerHTML = `
        <div class="game-intro sudoku-game">
            <h2>Word Sudoku</h2>

            <p>
                Use A–I instead of numbers.
                Each row, column and 3×3 box must contain
                A–I exactly once.
            </p>

            <div id="wordSudokuGrid"
                 class="sudoku-grid"></div>

            <div id="wordSudokuStatus"
                 class="result">
                Fill the empty cells.
            </div>

            <button id="wordSudokuNew"
                    class="game-btn">
                New Puzzle
            </button>
        </div>
    `;

    const grid =
        document.getElementById("wordSudokuGrid");

    const status =
        document.getElementById("wordSudokuStatus");

    const newBtn =
        document.getElementById("wordSudokuNew");

    function shuffle(array) {
        const copy = [...array];

        for (let i = copy.length - 1; i > 0; i--) {
            const j =
                Math.floor(Math.random() * (i + 1));

            [copy[i], copy[j]] =
                [copy[j], copy[i]];
        }

        return copy;
    }

    function createBoard() {
        return Array.from(
            { length: 9 },
            () => Array(9).fill("")
        );
    }

    function isSafe(board, row, col, value) {
        for (let c = 0; c < 9; c++) {
            if (board[row][c] === value) {
                return false;
            }
        }

        for (let r = 0; r < 9; r++) {
            if (board[r][col] === value) {
                return false;
            }
        }

        const boxRow =
            Math.floor(row / 3) * 3;

        const boxCol =
            Math.floor(col / 3) * 3;

        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (board[r][c] === value) {
                    return false;
                }
            }
        }

        return true;
    }

    function solve(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (!board[row][col]) {
                    for (const value of shuffle(symbols)) {
                        if (isSafe(board, row, col, value)) {
                            board[row][col] = value;

                            if (solve(board)) {
                                return true;
                            }

                            board[row][col] = "";
                        }
                    }

                    return false;
                }
            }
        }

        return true;
    }

    function generate() {
        const board = createBoard();

        solve(board);

        solution =
            board.map(row => [...row]);

        puzzle =
            board.map(row => [...row]);

        const positions = shuffle(
            Array.from({ length: 81 }, (_, i) => i)
        );

        let removed = 0;

        for (const position of positions) {
            if (removed >= 48) break;

            const row =
                Math.floor(position / 9);

            const col =
                position % 9;

            puzzle[row][col] = "";

            removed++;
        }
    }

    function render() {
        grid.innerHTML = "";

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell =
                    document.createElement("input");

                cell.className = "sudoku-cell";

                cell.type = "text";
                cell.maxLength = 1;

                cell.dataset.row = row;
                cell.dataset.col = col;

                if (puzzle[row][col]) {
                    cell.value =
                        puzzle[row][col];

                    cell.readOnly = true;
                    cell.classList.add("given");
                }

                cell.addEventListener("input", () => {
                    if (cell.readOnly) return;

                    let value =
                        cell.value
                            .toUpperCase()
                            .replace(/[^A-I]/g, "");

                    cell.value = value;

                    puzzle[row][col] =
                        value || "";

                    validateBoard();
                });

                cell.addEventListener("focus", () => {
                    highlightRelated(row, col);
                });

                grid.appendChild(cell);
            }
        }
    }

    function highlightRelated(row, col) {
        grid.querySelectorAll(".sudoku-cell")
            .forEach(cell => {
                cell.classList.remove("related");
            });

        grid.querySelectorAll(".sudoku-cell")
            .forEach(cell => {
                const r =
                    Number(cell.dataset.row);

                const c =
                    Number(cell.dataset.col);

                if (
                    r === row ||
                    c === col ||
                    (
                        Math.floor(r / 3) === Math.floor(row / 3) &&
                        Math.floor(c / 3) === Math.floor(col / 3)
                    )
                ) {
                    cell.classList.add("related");
                }
            });
    }

    function validateBoard() {
        let empty = false;
        let invalid = false;

        grid.querySelectorAll(".sudoku-cell")
            .forEach(cell => {
                cell.classList.remove("invalid");
            });

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value =
                    puzzle[row][col];

                if (!value) {
                    empty = true;
                    continue;
                }

                puzzle[row][col] = "";

                if (!isSafe(puzzle, row, col, value)) {
                    invalid = true;

                    const cell =
                        grid.querySelector(
                            `[data-row="${row}"][data-col="${col}"]`
                        );

                    if (cell) {
                        cell.classList.add("invalid");
                    }
                }

                puzzle[row][col] = value;
            }
        }

        if (invalid) {
            status.textContent =
                "⚠️ There is a duplicate in the row, column or box.";
            return;
        }

        if (empty) {
            status.textContent =
                "✅ No conflicts so far.";
            return;
        }

        if (isComplete()) {
            recordWin();

            status.textContent =
                "🎉 Word Sudoku solved correctly!";
        }
    }

    function isComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (
                    puzzle[row][col] !==
                    solution[row][col]
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    function newPuzzle() {
        generate();
        render();

        status.textContent =
            "Fill the empty cells.";
    }

    newBtn.addEventListener("click", newPuzzle);

    newPuzzle();
}

/* =========================================================
   7. 15 PUZZLE
   ========================================================= */

function fifteen() {
    let board = [
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 0
    ];

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>15 Puzzle</h2>
            <p>Arrange the numbers in order.</p>

            <div id="fifteenGrid"
                 class="fifteen-grid"></div>

            <div id="fifteenStatus"
                 class="result"></div>

            <button id="fifteenNew"
                    class="game-btn">
                Shuffle
            </button>
        </div>
    `;

    const grid =
        document.getElementById("fifteenGrid");

    const status =
        document.getElementById("fifteenStatus");

    function render() {
        grid.innerHTML = "";

        board.forEach((value, index) => {
            const button =
                document.createElement("button");

            button.className = "puzzle-tile";

            if (value === 0) {
                button.classList.add("empty");
            } else {
                button.textContent = value;
            }

            button.addEventListener("click", () => {
                move(index);
            });

            grid.appendChild(button);
        });
    }

    function move(index) {
        const empty =
            board.indexOf(0);

        const row =
            Math.floor(index / 4);

        const col =
            index % 4;

        const emptyRow =
            Math.floor(empty / 4);

        const emptyCol =
            empty % 4;

        const distance =
            Math.abs(row - emptyRow) +
            Math.abs(col - emptyCol);

        if (distance !== 1) return;

        [board[index], board[empty]] =
            [board[empty], board[index]];

        render();

        if (
            board.every(
                (value, i) =>
                    value === i + 1 ||
                    (i === 15 && value === 0)
            )
        ) {
            status.textContent =
                "🎉 Puzzle solved!";

            recordWin();
        }
    }

    function shuffleBoard() {
        for (let i = 0; i < 250; i++) {
            const empty =
                board.indexOf(0);

            const row =
                Math.floor(empty / 4);

            const col =
                empty % 4;

            const possible = [];

            if (row > 0) possible.push(empty - 4);
            if (row < 3) possible.push(empty + 4);
            if (col > 0) possible.push(empty - 1);
            if (col < 3) possible.push(empty + 1);

            const index =
                possible[
                    Math.floor(
                        Math.random() *
                        possible.length
                    )
                ];

            [board[index], board[empty]] =
                [board[empty], board[index]];
        }

        status.textContent =
            "Arrange the numbers.";

        render();
    }

    document
        .getElementById("fifteenNew")
        .addEventListener("click", shuffleBoard);

    shuffleBoard();
}

/* =========================================================
   8. LIGHTS OUT
   ========================================================= */

function lightsOut() {
    let board = Array(25)
        .fill(false);

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Lights Out</h2>
            <p>Turn every light off.</p>

            <div id="lightsGrid"
                 class="lights-grid"></div>

            <div id="lightsStatus"
                 class="result">
                Lights remaining: 0
            </div>

            <button id="lightsNew"
                    class="game-btn">
                New Puzzle
            </button>
        </div>
    `;

    const grid =
        document.getElementById("lightsGrid");

    const status =
        document.getElementById("lightsStatus");

    function toggle(index) {
        const row =
            Math.floor(index / 5);

        const col =
            index % 5;

        const positions = [
            [row, col],
            [row - 1, col],
            [row + 1, col],
            [row, col - 1],
            [row, col + 1]
        ];

        positions.forEach(([r, c]) => {
            if (
                r >= 0 &&
                r < 5 &&
                c >= 0 &&
                c < 5
            ) {
                board[r * 5 + c] =
                    !board[r * 5 + c];
            }
        });
    }

    function render() {
        grid.innerHTML = "";

        board.forEach((on, index) => {
            const button =
                document.createElement("button");

            button.className =
                `light-cell ${on ? "on" : ""}`;

            button.addEventListener("click", () => {
                toggle(index);
                render();

                const remaining =
                    board.filter(Boolean).length;

                status.textContent =
                    `Lights remaining: ${remaining}`;

                if (remaining === 0) {
                    status.textContent =
                        "🎉 All lights are off!";

                    recordWin();
                }
            });

            grid.appendChild(button);
        });
    }

    function newPuzzle() {
        board = Array(25).fill(false);

        for (let i = 0; i < 12; i++) {
            toggle(
                Math.floor(Math.random() * 25)
            );
        }

        status.textContent =
            `Lights remaining: ${board.filter(Boolean).length}`;

        render();
    }

    document
        .getElementById("lightsNew")
        .addEventListener("click", newPuzzle);

    newPuzzle();
}

/* =========================================================
   9. STROOP FOCUS
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
            <p>Choose the color of the text, not the word.</p>

            <div id="stroopWord"
                 style="font-size:48px;font-weight:900;margin:30px;">
            </div>

            <div id="stroopButtons"
                 class="button-grid"></div>

            <div id="stroopStatus"
                 class="result">
                Score: 0 / 10
            </div>
        </div>
    `;

    const word =
        document.getElementById("stroopWord");

    const buttons =
        document.getElementById("stroopButtons");

    const status =
        document.getElementById("stroopStatus");

    function next() {
        if (question >= 10) {
            recordWin();

            status.textContent =
                `🎉 Finished! Score: ${score}/10`;

            return;
        }

        question++;

        const text =
            colors[
                Math.floor(Math.random() * colors.length)
            ];

        const actualColor =
            colors[
                Math.floor(Math.random() * colors.length)
            ];

        word.textContent = text;
        word.style.color = actualColor.toLowerCase();

        buttons.innerHTML = "";

        colors.forEach(color => {
            const button =
                document.createElement("button");

            button.className = "game-btn";
            button.textContent = color;

            button.addEventListener("click", () => {
                if (color === actualColor) {
                    score++;
                }

                status.textContent =
                    `Score: ${score} / 10`;

                next();
            });

            buttons.appendChild(button);
        });
    }

    next();
}

/* =========================================================
   10. PATTERN CHALLENGE
   ========================================================= */

function pattern() {
    const sequence =
        Array.from(
            { length: 4 },
            () => Math.floor(Math.random() * 4)
        );

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Pattern Challenge</h2>
            <p>Remember the highlighted pattern.</p>

            <div id="patternGrid"
                 class="pattern-grid"></div>

            <div id="patternStatus"
                 class="result">
                Watch...
            </div>

            <button id="patternStart"
                    class="game-btn">
                Start
            </button>
        </div>
    `;

    const grid =
        document.getElementById("patternGrid");

    const status =
        document.getElementById("patternStatus");

    const start =
        document.getElementById("patternStart");

    const cells = [];

    for (let i = 0; i < 4; i++) {
        const cell =
            document.createElement("button");

        cell.className = "pattern-cell";

        cells.push(cell);
        grid.appendChild(cell);
    }

    start.addEventListener("click", () => {
        start.disabled = true;

        sequence.forEach((index, position) => {
            safeTimeout(() => {
                cells[index].classList.add("active");

                safeTimeout(() => {
                    cells[index].classList.remove("active");
                }, 350);
            }, position * 500);
        });

        safeTimeout(() => {
            status.textContent =
                "Pattern complete!";

            start.disabled = false;
        }, sequence.length * 500 + 500);
    });
}

/* =========================================================
   11. ODD ONE OUT
   ========================================================= */

function oddOneOut() {
    const symbols = [
        "◆", "◆", "◆",
        "◆", "◆", "◇",
        "◆", "◆", "◆"
    ];

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Odd One Out</h2>
            <p>Find the different symbol.</p>

            <div id="oddGrid"
                 class="odd-grid"></div>

            <div id="oddStatus"
                 class="result">
                Find it!
            </div>
        </div>
    `;

    const grid =
        document.getElementById("oddGrid");

    const status =
        document.getElementById("oddStatus");

    const correct = 5;

    symbols.forEach((symbol, index) => {
        const button =
            document.createElement("button");

        button.className = "odd-cell";
        button.textContent = symbol;

        button.addEventListener("click", () => {
            if (index === correct) {
                status.textContent =
                    "🎉 Correct!";

                recordWin();
            } else {
                status.textContent =
                    "❌ Try again.";
            }
        });

        grid.appendChild(button);
    });
}

/* =========================================================
   12. WORD SCRAMBLE
   ========================================================= */

function scramble() {
    const words = [
        "planet",
        "rocket",
        "science",
        "library",
        "computer",
        "galaxy",
        "adventure",
        "keyboard",
        "puzzle",
        "elephant"
    ];

    const answer =
        words[Math.floor(Math.random() * words.length)];

    const scrambled =
        answer
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("");

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Word Scramble</h2>

            <div style="
                font-size:42px;
                font-weight:900;
                margin:25px;
                letter-spacing:5px;
            ">
                ${scrambled}
            </div>

            <input
                id="scrambleInput"
                class="game-input"
                placeholder="Unscramble the word"
                autocomplete="off"
            >

            <button id="scrambleCheck"
                    class="game-btn">
                Check
            </button>

            <div id="scrambleStatus"
                 class="result">
            </div>
        </div>
    `;

    const input =
        document.getElementById("scrambleInput");

    const check =
        document.getElementById("scrambleCheck");

    const status =
        document.getElementById("scrambleStatus");

    function submit() {
        if (
            input.value
                .trim()
                .toLowerCase() === answer
        ) {
            status.textContent =
                "🎉 Correct!";

            recordWin();
        } else {
            status.textContent =
                "❌ Try again.";
        }
    }

    check.addEventListener("click", submit);

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            submit();
        }
    });
}

/* =========================================================
   13. AIM TRAINER
   ========================================================= */

function aimTrainer() {
    let score = 0;
    let remaining = 10;

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Aim Trainer</h2>
            <p>Click the targets as quickly as possible.</p>

            <div id="aimArea"
                 style="
                 position:relative;
                 height:350px;
                 border-radius:20px;
                 overflow:hidden;
                 background:rgba(255,255,255,.05);
                 ">
            </div>

            <div id="aimStatus"
                 class="result">
                Targets: 10
            </div>
        </div>
    `;

    const area =
        document.getElementById("aimArea");

    const status =
        document.getElementById("aimStatus");

    function spawn() {
        if (remaining <= 0) {
            recordWin();

            status.textContent =
                `🎉 Score: ${score}/10`;

            return;
        }

        area.innerHTML = "";

        const target =
            document.createElement("button");

        target.textContent = "●";

        target.style.position = "absolute";
        target.style.width = "55px";
        target.style.height = "55px";
        target.style.borderRadius = "50%";
        target.style.border = "0";
        target.style.cursor = "pointer";
        target.style.left =
            `${Math.random() * 85}%`;
        target.style.top =
            `${Math.random() * 75}%`;

        target.addEventListener("click", () => {
            score++;
            remaining--;

            status.textContent =
                `Targets remaining: ${remaining}`;

            spawn();
        });

        area.appendChild(target);
    }

    spawn();
}

/* =========================================================
   14. TYPING SPEED
   ========================================================= */

function typing() {
    const texts = [
        "The quick brown fox jumps over the lazy dog.",
        "Learning new things makes the brain stronger.",
        "Space exploration teaches us about our universe.",
        "Practice helps people become faster and more accurate."
    ];

    const text =
        texts[Math.floor(Math.random() * texts.length)];

    const startTime = performance.now();

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Typing Speed</h2>

            <p id="typingText">
                ${text}
            </p>

            <textarea
                id="typingInput"
                class="game-input"
                rows="5"
                placeholder="Start typing..."
            ></textarea>

            <div id="typingStatus"
                 class="result">
                Start typing.
            </div>
        </div>
    `;

    const input =
        document.getElementById("typingInput");

    const status =
        document.getElementById("typingStatus");

    input.focus();

    input.addEventListener("input", () => {
        const typed = input.value;

        if (text.startsWith(typed)) {
            input.style.borderColor = "";

            if (typed === text) {
                const seconds =
                    (performance.now() - startTime) / 1000;

                const words =
                    text.trim().split(/\s+/).length;

                const wpm =
                    Math.round(
                        (words / seconds) * 60
                    );

                if (
                    stats.bestTyping === null ||
                    stats.bestTyping === undefined ||
                    wpm > stats.bestTyping
                ) {
                    stats.bestTyping = wpm;
                }

                recordWin();
                saveStats();

                status.textContent =
                    `🎉 Complete! ${wpm} WPM`;
            }
        } else {
            status.textContent =
                "⚠️ Check your typing.";
        }
    });
}

/* =========================================================
   15. FOCUS TEST
   ========================================================= */

function focusTest() {
    let active = false;
    let startTime = 0;

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Focus Test</h2>
            <p>
                Wait for the screen to change,
                then click immediately.
            </p>

            <button id="focusButton"
                    class="game-btn">
                Start
            </button>

            <div id="focusStatus"
                 class="result">
            </div>
        </div>
    `;

    const button =
        document.getElementById("focusButton");

    const status =
        document.getElementById("focusStatus");

    button.addEventListener("click", () => {
        if (!active) {
            active = true;

            button.textContent = "WAIT...";

            safeTimeout(() => {
                startTime = performance.now();

                button.textContent =
                    "CLICK NOW!";

                button.classList.add("ready");
            }, 1500 + Math.random() * 2500);

            return;
        }

        if (!button.classList.contains("ready")) {
            clearAllTimers();

            status.textContent =
                "Too early!";

            active = false;
            button.textContent = "Start";

            return;
        }

        const time =
            Math.round(
                performance.now() - startTime
            );

        status.textContent =
            `Reaction: ${time} ms`;

        recordWin();

        active = false;
        button.classList.remove("ready");
        button.textContent = "Start";
    });
}

/* =========================================================
   16. QUICK MATH
   ========================================================= */

function quickMath() {
    let score = 0;
    let question = 0;
    let answer = 0;

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Quick Math</h2>

            <div id="mathQuestion"
                 style="font-size:40px;font-weight:900;">
            </div>

            <input
                id="mathInput"
                class="game-input"
                type="number"
                placeholder="Answer"
            >

            <button id="mathCheck"
                    class="game-btn">
                Check
            </button>

            <div id="mathStatus"
                 class="result">
                Score: 0 / 10
            </div>
        </div>
    `;

    const questionEl =
        document.getElementById("mathQuestion");

    const input =
        document.getElementById("mathInput");

    const check =
        document.getElementById("mathCheck");

    const status =
        document.getElementById("mathStatus");

    function nextQuestion() {
        if (question >= 10) {
            recordWin();

            status.textContent =
                `🎉 Finished! Score: ${score}/10`;

            check.disabled = true;
            input.disabled = true;

            return;
        }

        question++;

        const a =
            Math.floor(Math.random() * 20) + 1;

        const b =
            Math.floor(Math.random() * 20) + 1;

        answer = a + b;

        questionEl.textContent =
            `${a} + ${b} = ?`;

        input.value = "";
        input.focus();

        status.textContent =
            `Score: ${score} / 10`;
    }

    function submit() {
        if (Number(input.value) === answer) {
            score++;
        }

        nextQuestion();
    }

    check.addEventListener("click", submit);

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            submit();
        }
    });

    nextQuestion();
}

/* =========================================================
   17. ANAGRAM
   ========================================================= */

function anagram() {
    const letters =
        "PLANET";

    const possibleWords = [
        "PLAN",
        "PANEL",
        "PLANE",
        "PLANET"
    ];

    const found = new Set();

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Anagram Challenge</h2>

            <p>
                Make as many words as possible
                from these letters:
            </p>

            <div style="
                font-size:42px;
                font-weight:900;
                letter-spacing:8px;
                margin:25px;
            ">
                ${letters}
            </div>

            <input
                id="anagramInput"
                class="game-input"
                placeholder="Enter a word"
                autocomplete="off"
            >

            <button id="anagramAdd"
                    class="game-btn">
                Add Word
            </button>

            <div id="anagramList"
                 class="result">
                Words found: 0
            </div>
        `;

    const input =
        document.getElementById("anagramInput");

    const button =
        document.getElementById("anagramAdd");

    const list =
        document.getElementById("anagramList");

    function canMakeWord(word) {
        const available =
            letters.toLowerCase().split("");

        for (const char of word.toLowerCase()) {
            const index =
                available.indexOf(char);

            if (index === -1) {
                return false;
            }

            available.splice(index, 1);
        }

        return true;
    }

    function submit() {
        const word =
            input.value
                .trim()
                .toLowerCase();

        if (
            word.length < 2 ||
            !canMakeWord(word)
        ) {
            list.textContent =
                "❌ That word cannot be made from the letters.";
            return;
        }

        if (found.has(word)) {
            list.textContent =
                "⚠️ You already found that word.";
            return;
        }

        found.add(word);

        list.textContent =
            `Words found: ${found.size} — ${[
                ...found
            ].join(", ")}`;

        if (
            possibleWords.every(
                word => found.has(word.toLowerCase())
            )
        ) {
            recordWin();
        }

        input.value = "";
        input.focus();
    }

    button.addEventListener("click", submit);

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            submit();
        }
    });
}

/* =========================================================
   18. WORD SEARCH
   FULL 8-DIRECTION GENERATOR
   ========================================================= */

function wordSearch() {
    const SIZE = 10;

    const words = [
        "BRAIN",
        "MIND",
        "FOCUS",
        "LOGIC",
        "PUZZLE"
    ];

    let grid = [];

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Word Search</h2>

            <p>
                Find the hidden words horizontally,
                vertically and diagonally.
            </p>

            <div id="wordSearchGrid"
                 class="word-search-grid"></div>

            <div id="wordSearchWords"
                 class="result">
            </div>

            <div id="wordSearchStatus"
                 class="result">
                Find all the words.
            </div>

            <button id="wordSearchNew"
                    class="game-btn">
                New Puzzle
            </button>
        </div>
    `;

    const gridEl =
        document.getElementById("wordSearchGrid");

    const wordsEl =
        document.getElementById("wordSearchWords");

    const status =
        document.getElementById("wordSearchStatus");

    const newBtn =
        document.getElementById("wordSearchNew");

    const directions = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
    ];

    function createGrid() {
        return Array.from(
            { length: SIZE },
            () =>
                Array(SIZE).fill("")
        );
    }

    function canPlace(
        word,
        row,
        col,
        dr,
        dc
    ) {
        for (let i = 0; i < word.length; i++) {
            const r = row + dr * i;
            const c = col + dc * i;

            if (
                r < 0 ||
                r >= SIZE ||
                c < 0 ||
                c >= SIZE
            ) {
                return false;
            }

            if (
                grid[r][c] &&
                grid[r][c] !== word[i]
            ) {
                return false;
            }
        }

        return true;
    }

    function placeWord(word) {
        const shuffledDirections =
            directions
                .map(x => [...x])
                .sort(() => Math.random() - 0.5);

        for (let attempt = 0; attempt < 300; attempt++) {
            const row =
                Math.floor(Math.random() * SIZE);

            const col =
                Math.floor(Math.random() * SIZE);

            const [dr, dc] =
                shuffledDirections[
                    Math.floor(
                        Math.random() *
                        shuffledDirections.length
                    )
                ];

            if (
                canPlace(
                    word,
                    row,
                    col,
                    dr,
                    dc
                )
            ) {
                for (
                    let i = 0;
                    i < word.length;
                    i++
                ) {
                    grid[row + dr * i][
                        col + dc * i
                    ] = word[i];
                }

                return true;
            }
        }

        return false;
    }

    function generate() {
        grid = createGrid();

        words.forEach(word => {
            placeWord(word);
        });

        const alphabet =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (!grid[row][col]) {
                    grid[row][col] =
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
        gridEl.innerHTML = "";

        grid.forEach((row, r) => {
            row.forEach((letter, c) => {
                const cell =
                    document.createElement("button");

                cell.className =
                    "word-search-cell";

                cell.textContent = letter;

                cell.dataset.row = r;
                cell.dataset.col = c;

                cell.addEventListener("click", () => {
                    cell.classList.toggle("selected");

                    checkSelected();
                });

                gridEl.appendChild(cell);
            });
        });

        wordsEl.textContent =
            `Words: ${words.join(" • ")}`;
    }

    function checkSelected() {
        const selected =
            [...gridEl.querySelectorAll(
                ".word-search-cell.selected"
            )];

        if (selected.length < 2) return;

        const letters =
            selected
                .map(cell => cell.textContent)
                .join("");

        const reverse =
            letters
                .split("")
                .reverse()
                .join("");

        if (
            words.includes(letters) ||
            words.includes(reverse)
        ) {
            const foundWord =
                words.includes(letters)
                    ? letters
                    : reverse;

            selected.forEach(cell => {
                cell.classList.add("found");
                cell.classList.remove("selected");
            });

            wordsEl.textContent =
                wordsEl.textContent
                    .replace(
                        foundWord,
                        `✓ ${foundWord}`
                    );

            const found =
                gridEl.querySelectorAll(
                    ".word-search-cell.found"
                );

            if (found.length >= words.length * 2) {
                status.textContent =
                    "🎉 Puzzle complete!";

                recordWin();
            }
        }
    }

    function newPuzzle() {
        generate();
        render();

        status.textContent =
            "Find all the hidden words.";
    }

    newBtn.addEventListener("click", newPuzzle);

    newPuzzle();
}

/* =========================================================
   19. CHOICE REACTION
   ========================================================= */

function choiceReaction() {
    let startTime = 0;
    let active = false;
    let finished = false;

    gameArea.innerHTML = `
        <div class="game-intro">
            <h2>Choice Reaction</h2>

            <p>
                When the signal appears,
                press the matching key:
            </p>

            <h3>
                A &nbsp; S &nbsp; D &nbsp; F
            </h3>

            <div id="choiceSignal"
                 style="
                 font-size:70px;
                 font-weight:900;
                 margin:30px;
                 ">
                WAIT
            </div>

            <button id="choiceStart"
                    class="game-btn">
                Start
            </button>

            <div id="choiceStatus"
                 class="result">
            </div>
        </div>
    `;

    const signal =
        document.getElementById("choiceSignal");

    const startBtn =
        document.getElementById("choiceStart");

    const status =
        document.getElementById("choiceStatus");

    const keys = ["A", "S", "D", "F"];

    let expectedKey = "";

    function cleanupKeyboard() {
        document.removeEventListener(
            "keydown",
            handleKey
        );
    }

    function handleKey(event) {
        if (!active || finished) return;

        const key =
            event.key.toUpperCase();

        if (!keys.includes(key)) return;

        if (key !== expectedKey) {
            status.textContent =
                `❌ Wrong key. Expected ${expectedKey}.`;

            active = false;
            finished = true;

            cleanupKeyboard();

            startBtn.disabled = false;
            startBtn.textContent = "Try Again";

            return;
        }

        const reactionTime =
            Math.round(
                performance.now() - startTime
            );

        status.textContent =
            `⚡ ${reactionTime} ms`;

        recordWin();

        if (
            stats.bestReaction === null ||
            reactionTime < stats.bestReaction
        ) {
            stats.bestReaction = reactionTime;
        }

        saveStats();
        updateStats();

        active = false;
        finished = true;

        cleanupKeyboard();

        startBtn.disabled = false;
        startBtn.textContent = "Try Again";
    }

    startBtn.addEventListener("click", () => {
        cleanupCurrentGame();

        active = false;
        finished = false;

        startBtn.disabled = true;

        expectedKey =
            keys[
                Math.floor(
                    Math.random() * keys.length
                )
            ];

        signal.textContent = "WAIT";

        safeTimeout(() => {
            expectedKey =
                keys[
                    Math.floor(
                        Math.random() *
                        keys.length
                    )
                ];

            signal.textContent =
                expectedKey;

            startTime = performance.now();
            active = true;

            document.addEventListener(
                "keydown",
                handleKey
            );
        }, 1000 + Math.random() * 2500);
    });

    activeCleanup = () => {
        active = false;
        finished = true;
        cleanupKeyboard();
    };
}

/* =========================================================
   START
   ========================================================= */

loadStats();
