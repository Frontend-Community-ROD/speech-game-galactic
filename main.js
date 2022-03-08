// SPEECH RECOGNITION
let voiceInfo = document.getElementById("voice-info");
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var controls = ['arriba', 'abajo' ];
var grammar = '#JSGF V1.0; grammar controls; public <control> = ' + controls.join(' | ') + ' ;';

const speechControlsHandlers = {
  'abajo': () => moverPlayerAbajo(),
  'arriba': () => moverPlayerArriba()
}

let recognitionstarted = false;

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();

speechRecognitionList.addFromString(grammar, 1);

recognition.grammars = speechRecognitionList;
recognition.continuous = false;
recognition.lang = 'es';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

document.body.onclick = function() {

  if (recognitionstarted) {
    console.log('Already capturing...');
    return;
  }

  recognition.start();
  recognitionstarted = true;
  console.log('Ready to receive a commands.');
}

recognition.onstart = function() {
  console.log('Capturing started...');
  voiceInfo.classList.add("hidden");
}

recognition.onresult = function(event) {
  const speech = event.results[0][0].transcript;
  console.log("results", event.results);
  console.log('Confidence: ' + event.results[0][0].confidence);

  const speechControls = speech.split(' ').filter(said => controls.includes(said));
  console.log('speech', speechControls);
  speechControls.forEach(cont => speechControlsHandlers[cont]());
}

recognition.onend = function() {
  console.log('Capturing ended...');
  recognition.start();
}


// GAME

//****** GAME loop ********//

let time = new Date();
let deltaTime = 0;

if(document.readyState === "complete" || document.readyState === "interactive"){
    setTimeout(init, 1);
}else{
    document.addEventListener("DOMContentLoaded", init); 
}

function init() {
    time = new Date();
    start();
    loop();
}

function loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    update();
    requestAnimationFrame(loop);
}

//****** GAME LOGIC ********//

let backgroundY = 22;
let velY = 0;
let impulso = 900;
let gravedad = 2500;

let playerPosX = 42;
let playerPosY = backgroundY; 

let backgroundX = 0;
let velEscenario = 950/3;
let gameVel = 1;
let score = 0;

let parado = false;

let tiempoHastaObstaculo = 2;
let tiempoObstaculoMin = 1.9;
let tiempoObstaculoMax = 2.9;
let obstaculoPosY = 16;
let obstaculos = [];

let container;
let player;
let textoScore;
let background;
let gameOver;
let randomTopNumber;
let restartButton;

function start() {
    gameOver = document.querySelector(".game-over");
    background = document.querySelector(".background");
    container = document.querySelector(".container");
    textoScore = document.querySelector(".score");
    player = document.querySelector(".player");
    document.addEventListener("keydown", handleKeyDown);
}

function update() {
    if(parado) return;
    
    moverBackground();
    decidirCrearObstaculos();
    moverObstaculos();
    detectarColision();
    ganarPuntos();

    velY -= gravedad * deltaTime;

}

function handleKeyDown(ev){

    if(ev.keyCode == 33){
        moverPlayerArriba();
    }
    if (ev.keyCode == 34){
        moverPlayerAbajo();
    }
}

function moverPlayerArriba() {
    player.classList.remove("moveDown");
    player.classList.add("moveUp");    
}

function moverPlayerAbajo(){
    player.classList.remove("moveUp"); 
    player.classList.add("moveDown");
}

function moverBackground() {
    backgroundX += calcularDesplazamiento();
    background.style.left = -(backgroundX % container.clientWidth) + "px";
}

function calcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}

function estrellarse() {
    parado = true;
}

function decidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if(tiempoHastaObstaculo <= 0) {
        crearObstaculo();
    }
}

function crearObstaculo() {
    randomTopNumber = Math.random() * 4;
    let obstaculo = document.createElement("div");
    container.appendChild(obstaculo);
    obstaculo.classList.add("rock");
    obstaculo.posX = container.clientWidth;
    obstaculo.style.left = container.clientWidth+"px";
    if (randomTopNumber >= 2){
        obstaculo.style.bottom = "180px"
    }

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax-tiempoObstaculoMin) / gameVel;
}

function moverObstaculos() {
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
        }else{
            obstaculos[i].posX -= calcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX+"px";
        }
    }
}

function ganarPuntos() {
    score++;
    textoScore.innerText = score;
    if(score == 1500){
        gameVel = 1.1;
    } else if(score == 2500){
        gameVel = 1.3;
    } else if(score == 5000){
        gameVel = 1.6;
    }
    background.style.animationDuration = (3/gameVel)+"s";
}

function GameOver() {
    estrellarse();
    gameOver.style.display = "block";
}

function detectarColision() {
    for (let i = 0; i < obstaculos.length; i++) {
        if(obstaculos[i].posX > playerPosX + player.clientWidth) {
            //EVADE
            break; //al estar en orden, no puede chocar con más
        }else{
            if(isCollision(player, obstaculos[i], 10, 30, 15, 20)) {
                GameOver();
            }
        }
    }
}

function isCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}

function reiniciarNivel(){
    location.reload();
}
