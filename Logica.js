let jugadores = [];
let palabras = ["Cubarsi", "Mbappé", "Messi", "Barcelona", "Real Madrid", "Pedri", "Raphinha"];
let palabraActual = "";
let impostorIndex = 0;
let currentPlayer = 0;

let timer = 180; 
let timerInterval;
let paused = false;
let selectedIndex = null;

const card = document.getElementById("card");
const nextBtn = document.getElementById("nextBtn");
const rondaInfo = document.getElementById("rondaInfo");
const timerSection = document.getElementById("timerSection");
const timerDisplay = document.getElementById("timer");
const pauseBtnText = document.getElementById("pauseBtnText");
const playersList = document.getElementById("playersList");
const eliminarBtn = document.getElementById("eliminarBtn");
const endModal = document.getElementById("endModal");
const modalText = document.getElementById("modalText");
const startModal = document.getElementById("startModal");
const startModalText = document.getElementById("startModalText");


function iniciarRonda() {
    const num = parseInt(document.getElementById("numPlayers").value);

    if(!num || num < 3){
        alert("Ingresa al menos 3 jugadores");
        return;
    } else if (num > 10) {
        alert("El juego no está permitido mayor a 10 jugadores");
        return;
    }

    // Mostrar inputs de nombres
    const container = document.getElementById("nombresContainer");
    const inputs = document.getElementById("inputsNombres");
    inputs.innerHTML = ''; 
    container.style.display = "block";

    // Crear inputs según el número de jugadores
    for(let i = 0; i < num; i++){
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Nombre del jugador ${i+1}`;
        input.id = `nombreJugador${i}`;
        input.style.display = "block";
        input.style.margin = "5px 0";
        inputs.appendChild(input);
    }
}

function confirmarNombres() {
    const num = parseInt(document.getElementById("numPlayers").value);
    jugadores = [];

    for(let i = 0; i < num; i++){
        const nombre = document.getElementById(`nombreJugador${i}`).value.trim();
        if(nombre === ""){
            alert("Todos los jugadores deben tener nombre");
            return;
        }
        jugadores.push({ name: nombre, role: "tripulante", eliminated: false });
    }

    // Ocultar inputs de nombres
    document.getElementById("nombresContainer").style.display = "none";

    // Asignar palabra e impostor
    palabraActual = palabras[Math.floor(Math.random() * palabras.length)];
    impostorIndex = Math.floor(Math.random() * jugadores.length);
    jugadores[impostorIndex].role = "impostor";

    currentPlayer = 0;
    card.style.display = "block";
    card.textContent = `${jugadores[currentPlayer].name}`;
    card.classList.remove("revealed");
    nextBtn.style.display = "none";
    card.onclick = mostrarCarta;
    
    rondaInfo.innerHTML = "";
    endModal.style.display = "none";
}

function mostrarCarta(){
    if(currentPlayer === impostorIndex){
        card.textContent = `${jugadores[currentPlayer].name}: ¡Eres el IMPOSTOR! 😈`;
    } else {
        card.textContent = `${jugadores[currentPlayer].name}: ${palabraActual}`;
    }
    card.classList.add("revealed");
    nextBtn.style.display = "inline-block";
    card.onclick = null;
}

function siguienteJugador() {
    currentPlayer++;
    if(currentPlayer >= jugadores.length){
        card.style.display = "none";
        nextBtn.style.display = "none";
        iniciarTemporizador();
        return;
    }
    card.textContent = `${jugadores[currentPlayer].name}`;
    card.classList.remove("revealed");
    nextBtn.style.display = "none";
    card.onclick = mostrarCarta;
}

function siguienteJugador() {
    currentPlayer++;

    // ✔ Cuando TODOS ya vieron su carta → mostrar modal y elegir jugador
    if (currentPlayer >= jugadores.length) {
        card.style.display = "none";
        nextBtn.style.display = "none";
        elegirJugadorInicial();   // <-- NUEVO
        return;
    }

    // Mostrar siguiente jugador normalmente
    card.textContent = `${jugadores[currentPlayer].name}`;
    card.classList.remove("revealed");
    nextBtn.style.display = "none";
    card.onclick = mostrarCarta;
}

function elegirJugadorInicial() {
    // Ignorar jugadores eliminados (por si acaso)
    let vivos = jugadores.filter(j => !j.eliminated);

    // IA elige un jugador al azar
    let elegido = vivos[Math.floor(Math.random() * vivos.length)];

    startModalText.textContent = `🎮 Empieza hablando: ${elegido.name}`;
    startModal.style.display = "block";
}

function cerrarStartModal() {
    startModal.style.display = "none";
    iniciarTemporizador();
}


function iniciarTemporizador(){
    timer = 180;
    paused = false;
    selectedIndex = null;
    updateTimerDisplay();
    timerSection.style.display = "block";
    playersList.style.display = "none";
    eliminarBtn.style.display = "none";
    timerInterval = setInterval(() => {
        if(!paused){
            timer--;
            if(timer <=0){
                clearInterval(timerInterval);
                mostrarFin("Tiempo terminado. El impostor sobrevivió.", false);
            }
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay(){
    const min = Math.floor(timer/60).toString().padStart(2,'0');
    const sec = (timer%60).toString().padStart(2,'0');
    timerDisplay.textContent = `${min}:${sec}`;
}

function togglePause(){
    paused = !paused;
    pauseBtnText.textContent = paused ? "Reanudar" : "Pausar";

    if(paused){
        mostrarJugadoresParaEliminar();
    } else {
        playersList.style.display = "none";
        eliminarBtn.style.display = "none";
        selectedIndex = null;
    }
}

function mostrarJugadoresParaEliminar(){
    playersList.innerHTML = '';
    jugadores.forEach((jug, index)=>{
        if(!jug.eliminated){
            const btn = document.createElement('button');
            btn.textContent = jug.name;
            btn.onclick = ()=>{
                if(selectedIndex !== null){
                    playersList.children[selectedIndex].classList.remove('selected');
                }
                selectedIndex = index;
                btn.classList.add('selected');
                eliminarBtn.style.display = "inline-block";
            };
            playersList.appendChild(btn);
        }
    });
    playersList.style.display = "block";
}

function eliminarJugador(){
    if(selectedIndex === null) return;
    const jug = jugadores[selectedIndex];
    jug.eliminated = true;
    playersList.style.display = "none";
    eliminarBtn.style.display = "none";
    paused = false;
    pauseBtnText.textContent = "Pausar";
    selectedIndex = null;

    if(jug.role === "impostor"){
        clearInterval(timerInterval);
        mostrarFin(`El impostor ${jug.name} fue eliminado. ¡Juego terminado!`, false);
    } else {
        rondaInfo.textContent = `${jug.name} no era el impostor. La ronda continúa.`;
        checkFinRonda();
    }
}

function checkFinRonda(){
    const tripulantesVivos = jugadores.filter(j => !j.eliminated && j.role === "tripulante").length;
    if(tripulantesVivos === 1){
        clearInterval(timerInterval);
        mostrarFin("¡El impostor sobrevivio gano el juego.", true);
    }
}

function mostrarFin(mensaje, impostorGana){
    modalText.textContent = mensaje;
    endModal.style.display = "block";
    mostrarTodosJugadores(impostorGana);
}

function mostrarTodosJugadores(impostorGana){
    let info = "<h3>Todos los jugadores:</h3><ul>";
    jugadores.forEach(jug=>{
        let color = jug.eliminated ? "red" : jug.role==="impostor" ? "yellow" : "green";
        info += `<li style="color:${color}">${jug.name} - ${jug.role}${jug.eliminated ? " (Eliminado)" : ""}</li>`;
    });
    info += "</ul>";
    rondaInfo.innerHTML = info;
}

function reiniciarJuego(){
    location.reload();
}

