// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");

// let robo = {
//     x: 55,
//     y: 455,
//     img: new Image(),
//     width: 65,
//     heigth: 70,
//     desenha: function(){
//         this.img.src = "./assets/robot-png-defato.png"
//         ctx.beginPath();
//         ctx.drawImage(this.img, this.x - this.width, this.y - this.heigth, this.width, this.heigth);
//         ctx.closePath();
//     }
// }

// function animacao(){
//     ctx.clearRect(0, 0, 700, 450);
//     robo.desenha();
//     requestAnimationFrame(animacao);
// }
// animacao();

// document.addEventListener("keydown", function(evento){
//     let tecla = evento.key;
//     console.log(tecla);
//     let vel = 20
//     if(tecla == "ArrowUp"){
//         robo.y -= vel;
//     }
//     if(tecla == "ArrowDown"){
//         robo.y += vel;
//     }

//     if(tecla == "ArrowLeft"){
//         robo.x -= vel;
//     }

//     if(tecla == "ArrowRight"){
//         robo.x += vel;
//     }

//     robo.x = Math.max(robo.width, Math.min(canvas.width - robo.width, x));
//     robo.y = Math.max(robo.heigth, Math.min(canvas.height - robo.heigth, y));
// })
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let robo = {
    x: 55,
    y: 420, // 🔽 posição mais abaixo
    img: new Image(),
    width: 65,
    heigth: 70,
    desenha: function() {
        this.img.src = "./assets/robot-png-defato.png";
        ctx.drawImage(this.img, this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);
    }
};

// Variáveis de movimento
let movendo = {
    cima: false,
    baixo: false,
    esquerda: false,
    direita: false
};

// Velocidade
let vel = 5;

function atualizarPosicao() {
    if (movendo.cima) robo.y -= vel;
    if (movendo.baixo) robo.y += vel;
    if (movendo.esquerda) robo.x -= vel;
    if (movendo.direita) robo.x += vel;

    // Colisões com as bordas
    if (robo.x < robo.width / 3) robo.x = robo.width / 3; // esquerda
    if (robo.x > canvas.width - robo.width / 3) robo.x = canvas.width - robo.width / 3; // direita
    if (robo.y < robo.heigth / 2) robo.y = robo.heigth / 2; // topo
    if (robo.y > canvas.height - robo.heigth / 2.5) robo.y = canvas.height - robo.heigth / 2.5; // base
}

function animacao() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    atualizarPosicao();
    robo.desenha();
    requestAnimationFrame(animacao);
}
animacao();

// Detecta teclas pressionadas
document.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowUp") movendo.cima = true;
    if (evento.key === "ArrowDown") movendo.baixo = true;
    if (evento.key === "ArrowLeft") movendo.esquerda = true;
    if (evento.key === "ArrowRight") movendo.direita = true;
});

// Detecta quando as teclas são soltas
document.addEventListener("keyup", (evento) => {
    if (evento.key === "ArrowUp") movendo.cima = false;
    if (evento.key === "ArrowDown") movendo.baixo = false;
    if (evento.key === "ArrowLeft") movendo.esquerda = false;
    if (evento.key === "ArrowRight") movendo.direita = false;
});
