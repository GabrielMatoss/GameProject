let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let gravidade = 1.2;
let forcaPulo = -18;
let noChao = false;
let vel = 6;
let pontuacao = 0;
let jogoAtivo = true;

// MOVIMENTO
let movendo = { esquerda: false, direita: false };

// CONTROLE DE ANIMAÇÃO
let frameContador = 0;
let tempoTrocaFrame = 10; // quanto menor, mais rápida a troca

// ROBO
let robo = {
    x: 100,
    y: 605,
    vy: 0,
    vida: 100,
    width: 80,
    heigth: 90,
    imgParado: new Image(),
    imgCorrendo1: new Image(),
    imgCorrendo2: new Image(),
    imgCorrendo3: new Image(), // 🔹 nova imagem adicionada
    imgMorto: new Image(),
    imagemAtual: null,
    viradoEsquerda: false,
    desenha: function () {
        let img = this.imagemAtual;
        ctx.save();
        if (this.viradoEsquerda) {
            ctx.scale(-1, 1);
            ctx.drawImage(img, -this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);
        } else {
            ctx.drawImage(img, this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);
        }
        ctx.restore();
    }
};

// 🔹 Caminhos atualizados das imagens
robo.imgParado.src = "./assets/robot-idle.png";
robo.imgCorrendo1.src = "./assets/robo1.png";
robo.imgCorrendo2.src = "./assets/robo2.png";
robo.imgCorrendo3.src = "./assets/robo3.png";
robo.imgMorto.src = "./assets/robo_dano.png";
robo.imagemAtual = robo.imgParado;

// PLATAFORMA
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

// RAIOS
const raioImg = new Image();
raioImg.src = "./assets/raio.png";
let raios = [];

function criarRaio(xInicial, yInicial) {
    return {
        x: xInicial,
        y: yInicial,
        largura: 75,
        altura: 75,
        velocidade: 7,
        ativo: true,
        mover: function () {
            if (!jogoAtivo) return;
            this.y += this.velocidade;
            if (this.y > canvas.height) this.ativo = false;

            // Colisão com o robô
            let roboLeft = robo.x - robo.width / 2;
            let roboRight = robo.x + robo.width / 2;
            let roboTop = robo.y - robo.heigth / 2;
            let roboBottom = robo.y + robo.heigth / 2;

            if (this.x < roboRight && this.x + this.largura > roboLeft && this.y < roboBottom && this.y + this.altura > roboTop) {
                this.ativo = false;
                robo.vida -= 10;
                if (robo.vida <= 0 && jogoAtivo) {
                    morrerRobo();
                }
            }
        },
        desenha: function () {
            ctx.drawImage(raioImg, this.x - this.largura / 2, this.y, this.largura, this.altura);
        }
    };
}

// CRIAR NUVENS
function criarNuvem(xInicial, yInicial, velocidade, sprite, direcao) {
    let nuvem = {
        x: xInicial,
        y: yInicial,
        largura: 220,
        altura: 220,
        img: new Image(),
        velocidadeX: velocidade,
        direcao: direcao,
        vida: 4,
        ativa: true,
        tempoProximoRaio: Math.random() * 400 + 300,

        mover: function () {
            if (!this.ativa || !jogoAtivo) return;

            // Movimento horizontal
            if (this.direcao === "esquerda") {
                this.x -= this.velocidadeX;
                if (this.x + this.largura < 0) this.resetarPosicao();
            } else {
                this.x += this.velocidadeX;
                if (this.x > canvas.width + this.largura) this.resetarPosicao();
            }

            // Movimento leve flutuante
            this.y += Math.sin(Date.now() / 500) * 0.4;

            // Disparo de raio aleatório
            this.tempoProximoRaio--;
            if (this.tempoProximoRaio <= 0) {
                raios.push(criarRaio(this.x + this.largura / 2, this.y + this.altura / 2));
                this.tempoProximoRaio = Math.random() * 400 + 300;
            }
        },

        resetarPosicao: function () {
            if (this.direcao === "esquerda") {
                this.x = canvas.width + Math.random() * 400 + 200;
            } else {
                this.x = -this.largura - Math.random() * 400 - 200;
            }
            this.y = 30 + Math.random() * 60;
            this.vida = 4;
            this.ativa = true;
            this.tempoProximoRaio = Math.random() * 400 + 300;
        },

        desenha: function () {
            if (!this.ativa) return;
            ctx.drawImage(this.img, this.x, this.y, this.largura, this.altura);
        },

        morrer: function () {
            this.ativa = false;
            pontuacao += 5;
            for (let i = 0; i < 20; i++) {
                particulas.push({
                    x: this.x + this.largura / 2,
                    y: this.y + this.altura / 2,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    vida: 30,
                });
            }
            setTimeout(() => this.resetarPosicao(), 4000);
        }
    };
    nuvem.img.src = sprite;
    return nuvem;
}

let todasNuvens = [];
let nuvensAtivas = [];

function gerarNuvensIniciais() {
    todasNuvens = [];
    for (let i = 0; i < 8; i++) {
        let sprite = i % 2 === 0 ? "./assets/nuvem1.png" : "./assets/nuvem2.png";
        let direcao = Math.random() > 0.5 ? "esquerda" : "direita";
        let xInicial = direcao === "esquerda" ? canvas.width + Math.random() * 400 : -220 - Math.random() * 400;
        todasNuvens.push(criarNuvem(xInicial, 40 + Math.random() * 60, 0.8 + Math.random() * 0.6, sprite, direcao));
    }
    nuvensAtivas = todasNuvens.slice(0, 5);
}
gerarNuvensIniciais();

// TIROS
let tiros = [];
function criarTiro() {
    return {
        x: robo.x,
        y: robo.y - robo.heigth / 2,
        largura: 10,
        altura: 20,
        velocidade: -10,
        ativo: true,
        mover: function () {
            if (!jogoAtivo) return;
            this.y += this.velocidade;
            if (this.y + this.altura < 0) this.ativo = false;
            nuvensAtivas.forEach((nuvem) => {
                if (
                    nuvem.ativa &&
                    this.x < nuvem.x + nuvem.largura &&
                    this.x + this.largura > nuvem.x &&
                    this.y < nuvem.y + nuvem.altura &&
                    this.y + this.altura > nuvem.y
                ) {
                    this.ativo = false;
                    nuvem.vida--;
                    if (nuvem.vida <= 0) nuvem.morrer();
                }
            });
        },
        desenha: function () {
            ctx.fillStyle = "yellow";
            ctx.fillRect(this.x - this.largura / 2, this.y, this.largura, this.altura);
        }
    };
}

// PARTÍCULAS
let particulas = [];

// MORTE
function morrerRobo() {
    jogoAtivo = false;
    robo.vida = 0;
    robo.imagemAtual = robo.imgMorto;
    pontuacao = 0;
    nuvensAtivas = [];
    todasNuvens = [];
    raios = [];
    tiros = [];
    particulas = [];
}

// REINICIAR
function reiniciarJogo() {
    robo.vida = 100;
    robo.imagemAtual = robo.imgParado;
    robo.x = 100;
    robo.y = 605;
    pontuacao = 0;
    gerarNuvensIniciais();
    raios = [];
    tiros = [];
    particulas = [];
    jogoAtivo = true;
}

// FÍSICA
function atualizarPosicao() {
    if (!jogoAtivo) return;
    if (movendo.esquerda) { robo.x -= vel; robo.viradoEsquerda = true; }
    if (movendo.direita) { robo.x += vel; robo.viradoEsquerda = false; }

    robo.vy += gravidade;
    robo.y += robo.vy;
    noChao = false;

    if (robo.y + robo.heigth / 2 >= plataforma.y && robo.vy >= 0) {
        robo.y = plataforma.y - robo.heigth / 2;
        robo.vy = 0;
        noChao = true;
    }

    if (robo.x < robo.width / 2) robo.x = robo.width / 2;
    if (robo.x > canvas.width - robo.width / 2) robo.x = canvas.width - robo.width / 2;
}

// LOOP PRINCIPAL
function animacao() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharPlataforma();

    nuvensAtivas.forEach((n) => { n.mover(); n.desenha(); });
    raios.forEach((r) => r.ativo && (r.mover(), r.desenha()));
    raios = raios.filter((r) => r.ativo);
    tiros.forEach((t) => t.ativo && (t.mover(), t.desenha()));
    tiros = tiros.filter((t) => t.ativo);

    particulas.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vida--;
        ctx.fillStyle = "rgba(255,255,0," + p.vida / 30 + ")";
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    particulas = particulas.filter((p) => p.vida > 0);

    if (jogoAtivo) {
        atualizarPosicao();

        // 🔹 Animação de caminhada com 3 imagens
        if (movendo.esquerda || movendo.direita) {
            frameContador++;
            let ciclo = frameContador % (tempoTrocaFrame * 3);

            if (ciclo < tempoTrocaFrame) {
                robo.imagemAtual = robo.imgCorrendo1;
            } else if (ciclo < tempoTrocaFrame * 2) {
                robo.imagemAtual = robo.imgCorrendo2;
            } else {
                robo.imagemAtual = robo.imgCorrendo3;
            }
        } else {
            robo.imagemAtual = robo.imgParado;
            frameContador = 0;
        }
    }

    robo.desenha();

    ctx.fillStyle = "red";
    ctx.font = "24px Arial";
    ctx.fillText("Vida: " + robo.vida, 30, 50);

    ctx.fillStyle = "white";
    ctx.fillText("Pontos: " + pontuacao, canvas.width - 180, 50);

    if (!jogoAtivo) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "bold 60px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 180, canvas.height / 2 - 40);
        ctx.fillStyle = "yellow";
        ctx.font = "30px Arial";
        ctx.fillText("Pressione R para reiniciar", canvas.width / 2 - 200, canvas.height / 2 + 40);
    }

    requestAnimationFrame(animacao);
}

// CONTROLES
document.addEventListener("keydown", (e) => {
    if (!jogoAtivo && e.key.toLowerCase() === "r") {
        reiniciarJogo();
        return;
    }
    if (!jogoAtivo) return;
    if (e.key === "ArrowLeft") movendo.esquerda = true;
    if (e.key === "ArrowRight") movendo.direita = true;
    if (e.key === "ArrowUp" && noChao) { robo.vy = forcaPulo; noChao = false; }
    if (e.code === "Space") tiros.push(criarTiro());
});
document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") movendo.esquerda = false;
    if (e.key === "ArrowRight") movendo.direita = false;
});

window.onload = animacao;
