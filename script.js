//** INICIALIZACION **//

var time = new Date();
var deltaTime = 0;
var soundtrack;

if(document.readyState === "complete" || document.readyState === "interactive"){
    setTimeout(Init,1);
}else{
    document.addEventListener("DOMContentLoaded",Init);
}

function Init(){
    time = new Date();
    Start();
    Loop();
}

function Loop(){
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update()
    requestAnimationFrame(Loop);
}

//** JUEGO **//

var sueloY = 22;
var velY = 0;
var impulso = 900;
var gravedad = 2500;

var dinoPosX = 42;
var dinoPosY = sueloY;

var sueloX = 0;
var velEscenario = 1280/3;
var gameVel = 1;
var score = 0;

var parado = false;
var saltando = false;

var tiempoHastaObstaculo = 2;
var tiempoObstaculoMin = 0.7;
var tiempoObstaculoMax = 1.8;
var obstaculoPosY = 16;
var obstaculos = [];
var nubes = [];

var tiempoHastaNube = 1;
var tiempoNubeMin = 1;
var tiempoNubeMax = 3;

var contenedor;
var dino;
var textoScore;
var suelo;
var gameOver;
var sonidoSalto;
var primerSalto = true;


function Start(){
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    sonidoSalto = document.getElementById('jump');
    document.addEventListener("keydown", HandleKeyDown);
    soundtrack = document.getElementById('soundtrack');
}

function HandleKeyDown(ev){
    if(ev.keyCode == 32){
        Saltar();
    }
    if(ev.keyCode == 13){
        
    }
}

function Saltar(){
    if(dinoPosY == sueloY){
        if(primerSalto){
            soundtrack.innerHTML = '<audio src="sounds/soundtrack.mp3" autoplay></audio>';
            primerSalto = false;
        }
        sonidoSalto.innerHTML = '<audio src="sounds/jump.mp3" autoplay></audio>';
        saltando = true;
        velY = impulso;
        dino.classList.remove("dino-corriendo");
    }
}

function Update(){
    
    if(parado) return;
    MoverSuelo();
    MoverDinosaurio();
    CrearObstaculos();
    CrearNubes();
    MoverNubes();
    MoverObstaculos();
    DetectarColision(); 
    velY -= gravedad * deltaTime;
}

function MoverSuelo(){
    sueloX += CalcularDesplazamiento();
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function CalcularDesplazamiento(){
    return velEscenario * deltaTime * gameVel;
}

function MoverDinosaurio(){
    dinoPosY += velY * deltaTime;
    if(dinoPosY < sueloY){
        TocarSuelo();
    }
    dino.style.bottom = dinoPosY+"px";
}

function TocarSuelo(){
    dinoPosY = sueloY;
    velY = 0;
    if(saltando){
        dino.classList.add("dino-corriendo");
    }
    saltando = false;
}

function CrearObstaculos(){
    tiempoHastaObstaculo -= deltaTime;
    if(tiempoHastaObstaculo <= 0){
        CrearObstaculo();
    }
}

function CrearObstaculo(){
    var obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth+"px";
    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax-tiempoObstaculoMin) / gameVel;
}

function MoverObstaculos(){
    for (var i = obstaculos.length - 1; i >=0; i--){
        if(obstaculos[i].posX < -obstaculos[i].clientWidth){
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i,1);
            GanarPuntos();
        }else{
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX+"px";
        }
    }
}

function GanarPuntos(){
    score++;
    textoScore.innerText = score;
    if (score == 9){
        SubirNivel("linear-gradient(#437bd0, #c7aa5f)", 1.30);
    }
    if (score == 23){
        SubirNivel("linear-gradient(#1f4ad9, #5d3d92)", 1.55);
    }
}

function SubirNivel(fondo, vel){
    contenedor.style.background = fondo;
    gameVel = vel;
}

function CrearNubes(){
    tiempoHastaNube -= deltaTime;
    if(tiempoHastaNube <= 0){
        CrearNube();
    }
}

function CrearNube(){
    var nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.style.top = 10 + Math.random() * 50 +"px"
    nube.posX = contenedor.clientWidth;
    nube.style.left = contenedor.clientWidth+"px";
    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax-tiempoNubeMin) / gameVel;
}

function MoverNubes(){
    for (var i = nubes.length - 1; i >=0; i--){
        if(nubes[i].posX < -nubes[i].clientWidth){
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i,1);
        }else{
            nubes[i].posX -= CalcularDesplazamiento();
            nubes[i].style.left = nubes[i].posX+"px";
        }
    }
}

function DetectarColision(){
    for(var i = 0; i < obstaculos.length; i++){
        if(obstaculos[i].posX > dinoPosX + dino.clientWidth){
            //EVADE;
            break; 
        }else{
            if(IsCollision(dino, obstaculos[i], 10, 30, 15, 20)){
                GameOver();
            }
        }
    }
}

function IsCollision(a,b, paddingTop, paddingRight, paddingBottom, paddingLeft){
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}

function GameOver(){
    var boton = document.createElement("button");
    boton.onclick = function reset() {window.location.reload()};
    contenedor.appendChild(boton);
    boton.classList.add("boton");
    
    /*var imagen = document.createElement("img");
    boton.appendChild(imagen);
    imagen.src = "img/reset.png";*/

    
    var mensaje = document.createElement("div");
    var contenido = document.createTextNode("Game Over")
    mensaje.appendChild(contenido);
    contenedor.appendChild(mensaje);
    mensaje.classList.add("gameOver");
    Estrellarse();
    gameOver.style.display = "block";
    
}

function Estrellarse(){
    dino.classList.remove("dino-corriendo");
    dino.classList.add("dino-estrellado");
    parado = true;
}