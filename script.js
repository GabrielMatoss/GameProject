let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// ----- CONFIGURAÇÕES DE FÍSICA -----
let gravidade = 0.8;
let forcaPulo = -18;
let noChao = false;

// ----- MOVIMENTO -----
let movendo = {
    esquerda: false,
    direita: false
};

let vel = 6;

// ----- OBJETO DO ROBÔ -----
let robo = {
    x: 100,
    y: 0,
    vy: 0,
    width: 80,
    heigth: 90,
    imgParado: new Image(),
    imgCorrendo: new Image(),
    imagemAtual: null,
    viradoEsquerda: false,

    desenha: function() {
        let img = this.imagemAtual;

        ctx.save();
        if (this.viradoEsquerda) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                img,
                -this.x - this.width / 2,
                this.y - this.heigth / 2,
                this.width,
                this.heigth
            );
        } else {
            ctx.drawImage(
                img,
                this.x - this.width / 2,
                this.y - this.heigth / 2,
                this.width,
                this.heigth
            );
        }
        ctx.restore();
    }
};

// ----- CARREGA AS IMAGENS -----
robo.imgParado.src = "./assets/robot-idle.png";
robo.imgCorrendo.src = "./assets/robot-run.png";
robo.imagemAtual = robo.imgParado;

// ----- PLATAFORMA ÚNICA (chão total) -----
let plataforma = {
    x: 0,
    y: canvas.height - 120, // fica bem no final do canvas
    width: canvas.width,
    height: 40
};

// ----- DESENHAR PLATAFORMA -----
function desenharPlataforma() {
    ctx.fillStyle = "#00000000";
    ctx.fillRect(plataforma.x, plataforma.y, plataforma.width, plataforma.height);
}

// ----- ATUALIZAR POSIÇÃO DO ROBÔ -----
function atualizarPosicao() {
    if (movendo.esquerda) {
        robo.x -= vel;
        robo.viradoEsquerda = true;
    }
    if (movendo.direita) {
        robo.x += vel;
        robo.viradoEsquerda = false;
    }

    // Aplica gravidade
    robo.vy += gravidade;
    robo.y += robo.vy;
    noChao = false;

    // Colisão com a plataforma
    if (
        robo.y + robo.heigth / 2 >= plataforma.y &&
        robo.y + robo.heigth / 2 <= plataforma.y + plataforma.height &&
        robo.vy >= 0
    ) {
        robo.y = plataforma.y - robo.heigth / 2;
        robo.vy = 0;
        noChao = true;
    }

    // Impede sair das bordas
    if (robo.x < robo.width / 2) robo.x = robo.width / 2;
    if (robo.x > canvas.width - robo.width / 2) robo.x = canvas.width - robo.width / 2;
}

// ----- LOOP DE ANIMAÇÃO -----
function animacao() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    atualizarPosicao();
    desenharPlataforma();

    if (movendo.esquerda || movendo.direita) {
        robo.imagemAtual = robo.imgCorrendo;
    } else {
        robo.imagemAtual = robo.imgParado;
    }

    robo.desenha();
    requestAnimationFrame(animacao);
}
animacao();

// ----- CONTROLES -----
document.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowLeft") movendo.esquerda = true;
    if (evento.key === "ArrowRight") movendo.direita = true;

    if (evento.key === "ArrowUp" && noChao) {
        robo.vy = forcaPulo;
        noChao = false;
    }
});

document.addEventListener("keyup", (evento) => {
    if (evento.key === "ArrowLeft") movendo.esquerda = false;
    if (evento.key === "ArrowRight") movendo.direita = false;
});
