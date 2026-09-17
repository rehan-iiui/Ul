const modal=document.getElementById("modal");
const game=document.getElementById("game");

let timers=[];
let played=Number(localStorage.getItem("brainPlayed")||0);

function openGame(title,html){
    clearTimers();

    game.innerHTML=
        `<h2>${title}</h2>
         <div class="instructions">${html}</div>`;

    modal.classList.add("show");
}

function closeGame(){
    clearTimers();
    modal.classList.remove("show");
}

function clearTimers(){
    timers.forEach(clearTimeout);
    timers=[];
}

function addPlayed(){
    played++;

    localStorage.setItem("brainPlayed",played);

    document.getElementById("played").textContent=played;
}

function result(text){
    game.innerHTML+=`<div class="result">${text}</div>`;
}

function rand(a,b){
    return Math.floor(Math.random()*(b-a+1))+a;
}

document.getElementById("played").textContent=played;

document.getElementById("bestReaction").textContent=
    localStorage.getItem("reactionBest")||"—";

document.getElementById("bestMemory").textContent=
    localStorage.getItem("memoryBest")||"0";

document.getElementById("bestTyping").textContent=
    localStorage.getItem("typingBest")||"0";


function quickTest(){
    reaction();
}


/* REACTION TIME */

function reaction(){

    openGame(
        "⚡ Reaction Time",
        "Click START, wait for the panel to turn green, then click immediately."
    );

    game.innerHTML+=`
        <button class="primary control" id="reactStart">START</button>
        <div class="reactionbox" id="reactionBox">READY</div>
        <div id="reactResult"></div>
    `;

    let box=document.getElementById("reactionBox");
    let startTime=0;
    let waiting=false;

    document.getElementById("reactStart").onclick=()=>{

        box.classList.remove("go");
        box.textContent="WAIT...";
        waiting=true;

        let delay=rand(1500,4500);

        timers.push(setTimeout(()=>{

            box.classList.add("go");
            box.textContent="GO!";
            startTime=performance.now();

        },delay));
    };

    box.onclick=()=>{

        if(!waiting)return;

        if(!box.classList.contains("go")){

            clearTimers();
            box.textContent="TOO EARLY!";
            return;
        }

        let ms=Math.round(performance.now()-startTime);

        waiting=false;

        addPlayed();

        let best=Number(
            localStorage.getItem("reactionBest")||99999
        );

        if(ms<best){

            localStorage.setItem("reactionBest",ms);

            document.getElementById("bestReaction").textContent=ms;
        }

        document.getElementById("reactResult").innerHTML=
            `<div class="result">
                <strong>${ms} ms</strong>
                Your reaction time
            </div>`;
    };
}


/* MEMORY MATCH */

function memory(){

    openGame(
        "🃏 Memory Match",
        "Find all matching pairs."
    );

    const icons=[
        "🚀","🌎","⭐","🌙",
        "🪐","☄️","👽","🛰️"
    ];

    let cards=[...icons,...icons]
        .sort(()=>Math.random()-.5);

    game.innerHTML=`
        <div class="grid memorygrid" id="memoryGrid"></div>
        <p id="memoryInfo" class="instructions">
            Moves: 0
        </p>
    `;

    const grid=document.getElementById("memoryGrid");

    let first=null;
    let second=null;
    let lock=false;
    let moves=0;
    let matched=0;

    cards.forEach((x,i)=>{

        let b=document.createElement("button");

        b.className="mem";
        b.textContent="?";

        b.onclick=()=>{

            if(
                lock ||
                b.classList.contains("matched") ||
                b===first
            )return;

            b.textContent=x;
            b.classList.add("open");

            if(!first){

                first=b;
                return;
            }

            second=b;
            moves++;
            lock=true;

            if(first.dataset.x===undefined)
                first.dataset.x=
                    cards[Array.from(grid.children).indexOf(first)];

            if(second.dataset.x===undefined)
                second.dataset.x=
                    cards[Array.from(grid.children).indexOf(second)];

            let i1=Number(first.dataset.x);
            let i2=Number(second.dataset.x);

            if(cards[i1]===cards[i2]){

                first.classList.add("matched");
                second.classList.add("matched");

                matched+=2;

                lock=false;
                first=null;
                second=null;

                if(matched===cards.length){

                    addPlayed();

                    result(`
                        <strong>🎉 Complete!</strong>
                        ${moves} moves
                    `);
                }

            }else{

                timers.push(setTimeout(()=>{

                    first.textContent="?";
                    second.textContent="?";

                    first.classList.remove("open");
                    second.classList.remove("open");

                    first=null;
                    second=null;
                    lock=false;

                },700));
            }

            document.getElementById("memoryInfo")
                .textContent=`Moves: ${moves}`;
        };

        grid.appendChild(b);
    });
}


/* SEQUENCE MEMORY */

function sequence(){

    openGame(
        "🔵 Sequence Memory",
        "Watch the highlighted tiles and repeat them in the same order."
    );

    game.innerHTML=`
        <div class="seqgrid" id="seq"></div>
        <p id="seqInfo" class="instructions">
            Level 1
        </p>
    `;

    const grid=document.getElementById("seq");

    let level=1;
    let sequence=[];
    let user=[];
    let accept=false;

    for(let i=0;i<9;i++){

        let b=document.createElement("button");

        b.className="seqcell";

        b.onclick=()=>{

            if(!accept)return;

            let pos=user.length;

            if(i!==sequence[pos]){

                accept=false;

                let best=Math.max(0,level-1);

                let old=Number(
                    localStorage.getItem("memoryBest")||0
                );

                if(best>old){

                    localStorage.setItem("memoryBest",best);

                    document.getElementById("bestMemory")
                        .textContent=best;
                }

                result(`
                    <strong>Level ${best}</strong>
                    Sequence ended
                `);

                return;
            }

            user.push(i);

            if(user.length===sequence.length){

                accept=false;

                level++;

                startRound();
            }
        };

        grid.appendChild(b);
    }

    function startRound(){

        document.getElementById("seqInfo")
            .textContent=`Level ${level}`;

        user=[];

        sequence.push(rand(0,8));

        let n=0;

        let play=()=>{

            grid.children[sequence[n]]
                .classList.add("active");

            timers.push(setTimeout(()=>{

                grid.children[sequence[n]]
                    .classList.remove("active");

                n++;

                if(n<sequence.length)
                    play();
                else
                    accept=true;

            },350));
        };

        play();
    }

    startRound();
}


/* NUMBER MEMORY */

function numberMemory(){

    openGame(
        "🔢 Number Memory",
        "Memorize the number before it disappears."
    );

    let level=3;

    function round(){

        let num="";

        for(let i=0;i<level;i++)
            num+=rand(0,9);

        game.innerHTML+=`
            <div class="bigtext" id="number">
                ${num}
            </div>

            <input
                class="control"
                id="numInput"
                placeholder="Type the number"
            >

            <button
                class="primary control"
                id="numCheck"
            >
                CHECK
            </button>

            <p id="numInfo" class="instructions">
                Remember it...
            </p>
        `;

        let n=document.getElementById("number");
        let input=document.getElementById("numInput");

        timers.push(setTimeout(()=>{

            n.textContent="????????";

            document.getElementById("numInfo")
                .textContent="Enter what you remember.";

            input.focus();

        },Math.max(1000,level*450)));

        document.getElementById("numCheck").onclick=()=>{

            if(input.value===num){

                level++;

                document.getElementById("numInfo")
                    .textContent="Correct! Next level...";

                timers.push(setTimeout(()=>{

                    game.innerHTML=`
                        <h2>🔢 Number Memory</h2>
                        <div class="instructions">
                            Level ${level}
                        </div>
                    `;

                    round();

                },500));

            }else{

                let best=level-1;

                let old=Number(
                    localStorage.getItem("memoryBest")||0
                );

                if(best>old){

                    localStorage.setItem("memoryBest",best);

                    document.getElementById("bestMemory")
                        .textContent=best;
                }

                result(`
                    <strong>${best} digits</strong>
                    Challenge complete
                `);
            }
        };
    }

    round();
}


/* SUDOKU */

function sudoku(){

    openGame(
        "🔢 Classic Sudoku",
        "Fill every empty cell so each row, column and 3×3 box contains 1–9."
    );

    const solution=[
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

    let puzzle=solution.map(r=>r.slice());

    for(let k=0;k<48;k++){

        let r=rand(0,8);
        let c=rand(0,8);

        puzzle[r][c]=0;
    }

    game.innerHTML+=`
        <div class="sudoku" id="sdk"></div>

        <button class="primary control" id="checkSudoku">
            CHECK SUDOKU
        </button>

        <button class="secondary control" id="solveSudoku">
            SHOW SOLUTION
        </button>
    `;

    const sdk=document.getElementById("sdk");
    let inputs=[];

    puzzle.forEach((row,r)=>{

        row.forEach((v,c)=>{

            let x=document.createElement("input");

            x.maxLength=1;
            x.inputMode="numeric";

            if(v){

                x.value=v;
                x.disabled=true;
            }

            x.dataset.answer=solution[r][c];

            sdk.appendChild(x);
            inputs.push(x);
        });
    });

    document.getElementById("checkSudoku").onclick=()=>{

        let good=inputs.every(
            x=>Number(x.value)===Number(x.dataset.answer)
        );

        addPlayed();

        result(
            good
            ?
            `<strong>🎉 Solved!</strong>Perfect Sudoku!`
            :
            `<strong>Not yet!</strong>Some cells are incorrect or empty.`
        );
    };

    document.getElementById("solveSudoku").onclick=()=>{

        inputs.forEach(
            x=>x.value=x.dataset.answer
        );
    };
}


/* WORD SUDOKU */

function wordSudoku(){

    openGame(
        "🔤 Word Sudoku",
        "Use A, B, C and D. Each row, column and 2×2 box must contain every letter once."
    );

    const sol=[
        ["A","B","C","D"],
        ["C","D","A","B"],
        ["B","A","D","C"],
        ["D","C","B","A"]
    ];

    let p=sol.map(r=>r.slice());

    for(let i=0;i<7;i++)
        p[rand(0,3)][rand(0,3)]="";

    game.innerHTML+=`
        <div class="wordgrid" id="wg"></div>
        <div class="letters" id="letters"></div>
        <button class="primary control" id="checkWord">
            CHECK
        </button>
    `;

    const wg=document.getElementById("wg");

    let cells=[];

    p.forEach((row,r)=>{

        row.forEach((v,c)=>{

            let b=document.createElement("button");

            b.className="wordcell";
            b.textContent=v;

            b.dataset.r=r;
            b.dataset.c=c;

            b.onclick=()=>{

                if(v)return;

                cells.forEach(
                    x=>x.classList.remove("selected")
                );

                b.classList.add("selected");
            };

            wg.appendChild(b);
            cells.push(b);
        });
    });

    ["A","B","C","D"].forEach(l=>{

        let b=document.createElement("button");

        b.className="letter";
        b.textContent=l;

        b.onclick=()=>{

            let s=cells.find(
                x=>x.classList.contains("selected")
            );

            if(s){

                s.textContent=l;

                s.classList.remove("selected");
                s.classList.add("filled");
            }
        };

        document.getElementById("letters")
            .appendChild(b);
    });

    document.getElementById("checkWord").onclick=()=>{

        let good=true;

        cells.forEach(x=>{

            if(
                x.textContent!==
                sol[x.dataset.r][x.dataset.c]
            )
                good=false;
        });

        addPlayed();

        result(
            good
            ?
            `<strong>🎉 Solved!</strong>Word Sudoku complete!`
            :
            `<strong>Keep going!</strong>Check the letters.`
        );
    };
}


/* 15 PUZZLE */

function fifteen(){

    openGame(
        "🧩 15 Puzzle",
        "Move tiles into numerical order."
    );

    game.innerHTML+=`
        <div class="fifteen" id="fif"></div>
        <p id="moves" class="instructions">
            Moves: 0
        </p>
    `;

    let arr=[
        1,2,3,4,
        5,6,7,8,
        9,10,11,12,
        13,14,15,0
    ];

    for(let i=0;i<100;i++){

        let a=arr.indexOf(0);
        let neighbors=[];

        if(a>=4)neighbors.push(a-4);
        if(a<12)neighbors.push(a+4);
        if(a%4)neighbors.push(a-1);
        if(a%4<3)neighbors.push(a+1);

        let n=neighbors[
            rand(0,neighbors.length-1)
        ];

        [arr[a],arr[n]]=[
            arr[n],arr[a]
        ];
    }

    let moves=0;

    function draw(){

        const f=document.getElementById("fif");

        f.innerHTML="";

        arr.forEach((v,i)=>{

            let b=document.createElement("button");

            b.className="tile"+(!v?" empty":"");
            b.textContent=v||"";

            b.onclick=()=>{

                let z=arr.indexOf(0);

                if(
                    Math.abs(z-i)===4 ||
                    (
                        Math.floor(z/4)===
                        Math.floor(i/4) &&
                        Math.abs(z-i)===1
                    )
                ){

                    [arr[z],arr[i]]=[
                        arr[i],arr[z]
                    ];

                    moves++;

                    document.getElementById("moves")
                        .textContent=`Moves: ${moves}`;

                    draw();

                    if(
                        arr.every(
                            (x,j)=>x===j+1||j===15
                        )
                    ){

                        addPlayed();

                        result(`
                            <strong>🎉 Solved!</strong>
                            ${moves} moves
                        `);
                    }
                }
            };

            f.appendChild(b);
        });
    }

    draw();
}


/* LIGHTS OUT */

function lightsOut(){

    openGame(
        "💡 Lights Out",
        "Click lights to turn them and their neighbors on/off. Turn everything off."
    );

    game.innerHTML=`
        <div class="lights" id="lights"></div>
        <p id="lightMoves" class="instructions">
            Moves: 0
        </p>
    `;

    let arr=Array(25).fill(true);

    for(let i=0;i<25;i++)
        if(Math.random()>.45)
            arr[i]=false;

    let moves=0;

    function draw(){

        const box=document.getElementById("lights");

        box.innerHTML="";

        arr.forEach((on,i)=>{

            let b=document.createElement("button");

            b.className="light"+(on?" on":"");

            b.onclick=()=>{

                [
                    i,
                    i-1,
                    i+1,
                    i-5,
                    i+5
                ].forEach(x=>{

                    if(
                        x>=0 &&
                        x<25 &&
                        !(x===i-1&&i%5===0) &&
                        !(x===i+1&&i%5===4)
                    )
                        arr[x]=!arr[x];
                });

                moves++;

                draw();

                if(arr.every(x=>!x)){

                    addPlayed();

                    result(`
                        <strong>🎉 Lights Out!</strong>
                        ${moves} moves
                    `);
                }
            };

            box.appendChild(b);
        });

        document.getElementById("lightMoves")
            .textContent=`Moves: ${moves}`;
    }

    draw();
}


/* STROOP */

function stroop(){

    openGame(
        "🎨 Stroop Focus",
        "Click the COLOR of the text, not the word."
    );

    const colors=[
        ["RED","#ef4444"],
        ["BLUE","#3b82f6"],
        ["GREEN","#22c55e"],
        ["YELLOW","#facc15"],
        ["PURPLE","#a855f7"],
        ["ORANGE","#f97316"]
    ];

    let score=0;
    let total=0;

    function round(){

        let word=colors[rand(0,5)];
        let ink=colors[rand(0,5)];

        game.innerHTML+=`
            <div
                class="colorword"
                style="color:${ink[1]}"
            >
                ${word[0]}
            </div>

            <div class="choicegrid" id="choices"></div>
        `;

        const ch=document.getElementById("choices");

        colors.forEach(c=>{

            let b=document.createElement("button");

            b.className="choice";
            b.textContent=c[0];

            b.onclick=()=>{

                total++;

                if(c[1]===ink[1])
                    score++;

                if(total>=15){

                    addPlayed();

                    result(`
                        <strong>${score}/15</strong>
                        Accuracy: ${Math.round(score/15*100)}%
                    `);

                }else{

                    game.innerHTML=`
                        <h2>🎨 Stroop Focus</h2>
                        <div class="instructions">
                            Round ${total+1} of 15
                        </div>
                    `;

                    round();
                }
            };

            ch.appendChild(b);
        });
    }

    round();
}


/* PATTERN */

function pattern(){

    openGame(
        "🔺 Pattern Challenge",
        "Find the missing number."
    );

    let a=rand(2,9);
    let step=rand(2,7);

    let arr=[
        a,
        a+step,
        a+step*2,
        a+step*3
    ];

    let answer=a+step*4;

    let opts=[
        answer,
        answer+step,
        answer-1,
        answer+rand(8,15)
    ].sort(()=>Math.random()-.5);

    game.innerHTML+=`
        <div class="bigtext">
            ${arr.join(" , ")} , ?
        </div>

        <div class="choicegrid" id="pc"></div>
    `;

    opts.forEach(x=>{

        let b=document.createElement("button");

        b.className="choice";
        b.textContent=x;

        b.onclick=()=>{

            addPlayed();

            result(
                x===answer
                ?
                `<strong>Correct!</strong>The answer is ${answer}.`
                :
                `<strong>Incorrect</strong>The answer was ${answer}.`
            );
        };

        document.getElementById("pc")
            .appendChild(b);
    });
}


/* ODD ONE */

function oddOne(){

    openGame(
        "👀 Odd One Out",
        "Find the different symbol as quickly as possible."
    );

    let symbols=[
        "◆","◆","◆","◆",
        "◇",
        "◆","◆","◆","◆"
    ];

    symbols.sort(()=>Math.random()-.5);

    game.innerHTML+=`
        <div class="wordgrid" id="odd"></div>
    `;

    let target=symbols.indexOf("◇");

    symbols.forEach((s,i)=>{

        let b=document.createElement("button");

        b.className="wordcell";
        b.textContent=s;

        b.onclick=()=>{

            addPlayed();

            result(
                i===target
                ?
                `<strong>Correct!</strong>Great observation.`
                :
                `<strong>Wrong!</strong>Look carefully next time.`
            );
        };

        document.getElementById("odd")
            .appendChild(b);
    });
}


/* SCRAMBLE */

function scramble(){

    openGame(
        "🔀 Word Scramble",
        "Unscramble the letters."
    );

    const words=[
        "PLANET",
        "GALAXY",
        "ROCKET",
        "MEMORY",
        "PUZZLE",
        "COMPUTER",
        "OCEAN",
        "SCIENCE",
        "ASTRONAUT",
        "MYSTERY"
    ];

    let answer=words[rand(0,words.length-1)];

    let shuffled=answer
        .split("")
        .sort(()=>Math.random()-.5)
        .join("");

    game.innerHTML+=`
        <div class="bigtext">${shuffled}</div>

        <input
            class="control"
            id="scrInput"
            placeholder="Your answer"
        >

        <button
            class="primary control"
            id="scrCheck"
        >
            CHECK
        </button>
    `;

    document.getElementById("scrCheck").onclick=()=>{

        let x=document
            .getElementById("scrInput")
            .value
            .toUpperCase()
            .trim();

        addPlayed();

        result(
            x===answer
            ?
            `<strong>Correct!</strong>${answer}`
            :
            `<strong>Answer: ${answer}</strong>`
        );
    };
}


/* ANAGRAM */

function anagram(){
    scramble();
}


/* AIM */

function aim(){

    openGame(
        "🎯 Aim Trainer",
        "Hit 10 targets. Your time and accuracy will be measured."
    );

    game.innerHTML=`
        <div class="targetarea" id="targetarea"></div>

        <p id="aimInfo" class="instructions">
            Targets: 0 / 10
        </p>
    `;

    let area=document.getElementById("targetarea");

    let count=0;
    let start=performance.now();

    function target(){

        let b=document.createElement("button");

        b.className="target";

        b.style.left=rand(5,90)+"%";
        b.style.top=rand(5,85)+"%";

        b.onclick=()=>{

            b.remove();

            count++;

            document.getElementById("aimInfo")
                .textContent=`Targets: ${count} / 10`;

            if(count>=10){

                let time=(
                    (performance.now()-start)/1000
                ).toFixed(2);

                addPlayed();

                result(`
                    <strong>${time}s</strong>
                    10 targets completed
                `);

            }else{

                target();
            }
        };

        area.appendChild(b);
    }

    target();
}


/* TYPING */

function typing(){

    openGame(
        "⌨️ Typing Speed",
        "Type the passage as accurately and quickly as possible."
    );

    const text=
        "The universe is full of stars planets galaxies and mysterious worlds waiting to be explored.";

    game.innerHTML+=`
        <div class="typetext">
            ${text}
        </div>

        <input
            class="control typinginput"
            id="typingInput"
            placeholder="Start typing here..."
            autofocus
        >

        <p id="typingInfo" class="instructions">
            Timer starts with your first key.
        </p>
    `;

    let input=document.getElementById("typingInput");

    let started=false;
    let start;

    input.oninput=()=>{

        if(!started){

            started=true;
            start=performance.now();
        }

        if(input.value.length>=text.length){

            let seconds=
                (performance.now()-start)/1000;

            let correct=0;

            for(let i=0;i<text.length;i++)
                if(input.value[i]===text[i])
                    correct++;

            let wpm=Math.round(
                (correct/5)/(seconds/60)
            );

            let old=Number(
                localStorage.getItem("typingBest")||0
            );

            if(wpm>old){

                localStorage.setItem(
                    "typingBest",
                    wpm
                );

                document.getElementById("bestTyping")
                    .textContent=wpm;
            }

            addPlayed();

            result(`
                <strong>${wpm} WPM</strong>
                Accuracy: ${Math.round(correct/text.length*100)}%
            `);
        }
    };
}


/* FOCUS */

function focusTest(){

    openGame(
        "🎯 Focus Test",
        "Find the unique ★ among the other symbols."
    );

    let arr=Array(24).fill("◆");

    let target=rand(0,23);

    arr[target]="★";

    game.innerHTML+=`
        <div class="wordgrid" id="focusGrid"></div>
    `;

    arr.forEach((x,i)=>{

        let b=document.createElement("button");

        b.className="wordcell";
        b.textContent=x;

        b.onclick=()=>{

            addPlayed();

            result(
                i===target
                ?
                `<strong>Excellent!</strong>You found it.`
                :
                `<strong>Missed!</strong>Try again.`
            );
        };

        document.getElementById("focusGrid")
            .appendChild(b);
    });
}


/* QUICK MATH */

function mathGame(){

    openGame(
        "🧮 Quick Math",
        "Solve 10 calculations as quickly as possible."
    );

    let score=0;
    let start=performance.now();

    function next(){

        let a=rand(2,20);
        let b=rand(2,20);
        let op=rand(0,1);

        let ans=op?a*b:a+b;

        game.innerHTML+=`
            <div class="bigtext">
                ${a} ${op?"×":"+"} ${b} = ?
            </div>

            <input
                class="control"
                id="mathInput"
                type="number"
                autofocus
            >

            <button
                class="primary control"
                id="mathCheck"
            >
                CHECK
            </button>

            <p class="instructions">
                Score: ${score}/10
            </p>
        `;

        document.getElementById("mathCheck")
            .onclick=()=>{

                if(
                    Number(
                        document.getElementById("mathInput").value
                    )===ans
                )
                    score++;

                if(score>=10){

                    let sec=(
                        (performance.now()-start)/1000
                    ).toFixed(2);

                    addPlayed();

                    result(`
                        <strong>10/10</strong>
                        Completed in ${sec} seconds
                    `);

                }else{

                    game.innerHTML=`
                        <h2>🧮 Quick Math</h2>
                    `;

                    next();
                }
            };
    }

    next();
}


/* WORD SEARCH */

function wordSearch(){

    openGame(
        "🔎 Word Search",
        "Find the hidden word. Click letters in order."
    );

    const words=[
        "STAR",
        "MOON",
        "MARS",
        "SUN"
    ];

    let answer=
        words[rand(0,words.length-1)];

    let letters=[];

    for(let i=0;i<16;i++)
        letters.push(
            String.fromCharCode(
                65+rand(0,25)
            )
        );

    let start=rand(
        0,
        16-answer.length
    );

    for(let i=0;i<answer.length;i++)
        letters[start+i]=answer[i];

    game.innerHTML+=`
        <p class="instructions">
            Find: <strong>${answer}</strong>
        </p>

        <div class="wordgrid" id="searchGrid"></div>
    `;

    let selected="";

    letters.forEach((l,i)=>{

        let b=document.createElement("button");

        b.className="wordcell";
        b.textContent=l;

        b.onclick=()=>{

            selected+=l;

            b.classList.add("selected");

            if(selected.length===answer.length){

                addPlayed();

                result(`
                    <strong>
                        ${selected===answer?"🎉 Correct!":"❌ Wrong!"}
                    </strong>
                `);
            }
        };

        document.getElementById("searchGrid")
            .appendChild(b);
    });
}


/* CHOICE REACTION */

function choiceReaction(){

    openGame(
        "🎯 Choice Reaction",
        "Press the matching key: A, S, D or F."
    );

    game.innerHTML=`
        <div class="bigtext" id="choiceSignal">
            READY
        </div>

        <button
            class="primary control"
            id="choiceStart"
        >
            START
        </button>
    `;

    let key;
    let started=false;
    let start;

    document.getElementById("choiceStart")
        .onclick=()=>{

            key=[
                "A",
                "S",
                "D",
                "F"
            ][rand(0,3)];

            document.getElementById("choiceSignal")
                .textContent=key;

            started=true;

            start=performance.now();
        };

    function handler(e){

        if(!started)return;

        if(
            ["A","S","D","F"]
            .includes(e.key.toUpperCase())
        ){

            let ms=Math.round(
                performance.now()-start
            );

            started=false;

            document.removeEventListener(
                "keydown",
                handler
            );

            addPlayed();

            result(`
                <strong>${ms} ms</strong>
                You pressed ${e.key.toUpperCase()}.
            `);
        }
    }

    document.addEventListener(
        "keydown",
        handler
    );
}


/* ESCAPE */

document.addEventListener("keydown",e=>{

    if(e.key==="Escape")
        closeGame();
});
