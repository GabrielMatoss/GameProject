let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// ----- CONFIGURAÇÕES -----
let gravidade = 1.2;
let forcaPulo = -18;
let noChao = false;
let vel = 6;
let pontuacao = 0; // 🧮 contador de pontos

// ----- MOVIMENTO -----
let movendo = {
    esquerda: false,
    direita: false
};

// ----- ROBO -----
let robo = {
    x: 100,
    y: 605,
    vy: 0,
    vida: 100,
    width: 80,
    heigth: 90,
    imgParado: new Image(),
    imgCorrendo: new Image(),
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

robo.imgParado.src = "./assets/robot-idle.png";
robo.imgCorrendo.src = "./assets/robot-run.png";
robo.imagemAtual = robo.imgParado;

// ----- PLATAFORMA -----
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

// ----- CRIA NUVEM -----
function criarNuvem(xInicial, yInicial, velocidade, sprite, direcao) {
    let nuvem = {
        x: xInicial,
        y: yInicial,
        largura: 220,
        altura: 220,
        img: new Image(),
        velocidadeX: velocidade,
        direcao: direcao, // "direita" ou "esquerda"
        contadorFlutuar: 0,
        cols: 4,
        rows: 4,
        totalFrames: 16,
        frameAtual: 0,
        contadorFrame: 0,
        tempoPorFrame: 6,
        vida: 4,
        ativa: true,

        mover: function () {
            if (!this.ativa) return;

            if (this.direcao === "esquerda") {
                this.x -= this.velocidadeX;
                if (this.x + this.largura < 0) {
                    this.x = canvas.width + Math.random() * 300;
                    this.y = 50 + Math.random() * 150;
                }
            } else {
                this.x += this.velocidadeX;
                if (this.x > canvas.width + this.largura) {
                    this.x = -this.largura - Math.random() * 300;
                    this.y = 50 + Math.random() * 150;
                }
            }

            this.contadorFlutuar += 0.05;
            this.y += Math.sin(this.contadorFlutuar) * 0.8;

            this.contadorFrame++;
            if (this.contadorFrame >= this.tempoPorFrame) {
                this.contadorFrame = 0;
                this.frameAtual = (this.frameAtual + 1) % this.totalFrames;
            }
        },

        desenha: function () {
            if (!this.ativa) return;
            let frameW = this.img.width / this.cols;
            let frameH = this.img.height / this.rows;
            let coluna = this.frameAtual % this.cols;
            let linha = Math.floor(this.frameAtual / this.cols);

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
        },

        morrer: function () {
            this.ativa = false;
            pontuacao += 5; // 🎯 +5 pontos
            for (let i = 0; i < 20; i++) {
                particulas.push({
                    x: this.x + this.largura / 2,
                    y: this.y + this.altura / 2,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    vida: 30,
                });
            }
            setTimeout(() => {
                this.x = this.direcao === "esquerda"
                    ? canvas.width + Math.random() * 300
                    : -this.largura - Math.random() * 300;
                this.y = 50 + Math.random() * 150;
                this.vida = 4;
                this.ativa = true;
            }, 4000);
        }
    };

    nuvem.img.src = sprite;
    return nuvem;
}

// ----- LISTA DE NUVENS -----
let todasNuvens = [];
for (let i = 0; i < 10; i++) {
    let sprite = i % 2 === 0 ? "./assets/Pasted image.png" : "./assets/verdesprite-256px-16.png";
    let direcao = Math.random() > 0.5 ? "esquerda" : "direita";
    let xInicial = direcao === "esquerda" ? 200 * i : canvas.width - 200 * i;
    todasNuvens.push(criarNuvem(xInicial, 80 + Math.random() * 100, 0.8 + Math.random() * 0.6, sprite, direcao));
}

let nuvensAtivas = todasNuvens.slice(0, 5);

// ----- RAIO -----
const raioImg = new Image();
raioImg.src = "./assets/raio.png";
let raios = [];

function criarRaio(xInicial, yInicial) {
    return {
        x: xInicial,
        y: yInicial,
        largura: 250,
        altura: 100,
        velocidade: 1.2,
        ativo: true,
        opacidade: 1,

        mover: function () {
            this.y += this.velocidade;
            if (this.y + this.altura > plataforma.y + 40) this.ativo = false;

            let roboLeft = robo.x - robo.width / 2;
            let roboRight = robo.x + robo.width / 2;
            let roboTop = robo.y - robo.heigth / 2;
            let roboBottom = robo.y + robo.heigth / 2;

            if (
                this.x < roboRight &&
                this.x + this.largura > roboLeft &&
                this.y < roboBottom &&
                this.y + this.altura > roboTop
            ) {
                this.ativo = false;
                robo.vida -= 10;
                if (robo.vida < 0) robo.vida = 0;
            }
        },

        desenha: function () {
            ctx.save();
            ctx.globalAlpha = this.opacidade;
            ctx.drawImage(raioImg, this.x - this.largura / 2, this.y, this.largura, this.altura);
            ctx.restore();
        }
    };
}

// ----- TIROS DAS NUVENS -----
setInterval(() => {
    nuvensAtivas.forEach((nuvem) => {
        if (nuvem.ativa && Math.random() < 0.6) {
            let raio = criarRaio(nuvem.x + nuvem.largura / 2, nuvem.y + nuvem.altura / 2);
            raios.push(raio);
        }
    });
}, 2500);

// ----- DIFICULDADE -----
setInterval(() => {
    if (nuvensAtivas.length < todasNuvens.length) {
        nuvensAtivas.push(todasNuvens[nuvensAtivas.length]);
    }
}, 10000);

// ----- TIROS DO ROBO -----
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
            ctx.fillStyle = "cyan";
            ctx.fillRect(this.x, this.y, this.largura, this.altura);
        }
    };
}

// ----- PARTÍCULAS -----
let particulas = [];

// ----- FÍSICA -----
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

// ----- LOOP PRINCIPAL -----
function animacao() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    atualizarPosicao();
    desenharPlataforma();

    nuvensAtivas.forEach((n) => {
        n.mover();
        n.desenha();
    });

    raios.forEach((r) => r.ativo && (r.mover(), r.desenha()));
    raios = raios.filter((r) => r.ativo);

    tiros.forEach((t) => t.ativo && (t.mover(), t.desenha()));
    tiros = tiros.filter((t) => t.ativo);

    particulas.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vida--;
        ctx.fillStyle = "rgba(255,255,0," + p.vida / 30 + ")";
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    particulas = particulas.filter((p) => p.vida > 0);

    if (movendo.esquerda || movendo.direita) robo.imagemAtual = robo.imgCorrendo;
    else robo.imagemAtual = robo.imgParado;
    robo.desenha();

    // 🩸 VIDA
    ctx.fillStyle = "red";
    ctx.font = "24px Arial";
    ctx.fillText("Vida: " + robo.vida, 30, 50);

    // 🧮 PONTOS
    ctx.fillStyle = "yellow";
    ctx.font = "24px Arial";
    ctx.fillText("Pontos: " + pontuacao, canvas.width - 180, 50);

    requestAnimationFrame(animacao);
}

window.onload = () => animacao();

// ----- CONTROLES -----
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") movendo.esquerda = true;
    if (e.key === "ArrowRight") movendo.direita = true;
    if (e.key === "ArrowUp" && noChao) {
        robo.vy = forcaPulo;
        noChao = false;
    }
    if (e.code === "Space") tiros.push(criarTiro());
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") movendo.esquerda = false;
    if (e.key === "ArrowRight") movendo.direita = false;
});
