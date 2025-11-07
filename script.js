let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// ----- CONFIGURAÇÕES DE FÍSICA -----
let gravidade = 1.2;
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
    y: 605,
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

// ----- PLATAFORMA ÚNICA (CHÃO) -----
let plataforma = {
    x: 0,
    y: canvas.height - 120,
    width: canvas.width,
    height: 40
};

function desenharPlataforma() {
    ctx.fillStyle = "#00000000";
    ctx.fillRect(plataforma.x, plataforma.y, plataforma.width, plataforma.height);
}

// ----- FUNÇÃO GERADORA DE NUVENS -----
function criarNuvem(xInicial, yInicial, velocidade, sprite) {
    return {
        x: xInicial,
        y: yInicial,
        largura: 220,
        altura: 220,
        img: new Image(),
        velocidadeX: velocidade,
        direcao: 1,
        contadorFlutuar: 0,
        cols: 4,
        rows: 4,
        totalFrames: 16,
        frameAtual: 0,
        contadorFrame: 0,
        tempoPorFrame: 6,

        mover: function() {
            this.x += this.velocidadeX * this.direcao;
            if (this.x + this.largura > canvas.width || this.x < 0) {
                this.direcao *= -1;
            }

            this.contadorFlutuar += 0.05;
            this.y += Math.sin(this.contadorFlutuar) * 0.8;

            this.contadorFrame++;
            if (this.contadorFrame >= this.tempoPorFrame) {
                this.contadorFrame = 0;
                this.frameAtual = (this.frameAtual + 1) % this.totalFrames;
            }
        },

        desenha: function() {
            let frameW = this.img.width / this.cols;
            let frameH = this.img.height / this.rows;
            let coluna = this.frameAtual % this.cols;
            let linha = Math.floor(this.frameAtual / this.cols);

            ctx.save();
            if (this.direcao === -1) {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    this.img,
                    coluna * frameW,
                    linha * frameH,
                    frameW,
                    frameH,
                    -this.x - this.largura,
                    this.y,
                    this.largura,
                    this.altura
                );
            } else {
                ctx.drawImage(
                    this.img,
                    coluna * frameW,
                    linha * frameH,
                    frameW,
                    frameH,
                    this.x,
                    this.y,
                    this.largura,
                    this.altura
                );
            }
            ctx.restore();
        }
    };
}

// ----- DUAS NUVENS (agora três!) -----
let nuvem1 = criarNuvem(100, 140, 2, "./assets/Pasted image.png");
nuvem1.largura = 200;
nuvem1.altura = 200;

let nuvem2 = criarNuvem(500, 20, 1.5, "./assets/verdesprite-256px-16.png");
nuvem2.largura = 600;
nuvem2.altura = 600;

// 🌥️ terceira nuvem (corrigida)
let nuvem3 = criarNuvem(100, 140, 1, "./assets/Pasted image.png");
nuvem3.largura = 180;
nuvem3.altura = 180;

nuvem1.img.src = "./assets/Pasted image.png";
nuvem2.img.src = "./assets/verdesprite-256px-16.png";
nuvem3.img.src = "./assets/Pasted image.png";

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

    robo.vy += gravidade;
    robo.y += robo.vy;
    noChao = false;

    if (
        robo.y + robo.heigth / 2 >= plataforma.y &&
        robo.y + robo.heigth / 2 <= plataforma.y + plataforma.height &&
        robo.vy >= 0
    ) {
        robo.y = plataforma.y - robo.heigth / 2;
        robo.vy = 0;
        noChao = true;
    }

    if (robo.x < robo.width / 2) robo.x = robo.width / 2;
    if (robo.x > canvas.width - robo.width / 2) robo.x = canvas.width - robo.width / 2;
}

// ----- LOOP DE ANIMAÇÃO -----
function animacao() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    atualizarPosicao();
    desenharPlataforma();

    // desenha nuvens de trás pra frente
    nuvem2.mover();
    nuvem2.desenha();

    nuvem3.mover();
    nuvem3.desenha();

    nuvem1.mover();
    nuvem1.desenha();

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
