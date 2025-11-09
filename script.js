let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// ----- MÚSICA DE FUNDO -----
let musicaFundo = new Audio("./assets/dancing_robots.mp3");
musicaFundo.loop = true;
musicaFundo.volume = 0.5;

function iniciarMusica() {
    musicaFundo.play().catch(() => {});
    document.removeEventListener("keydown", iniciarMusica);
    document.removeEventListener("click", iniciarMusica);
}

document.addEventListener("keydown", iniciarMusica);
document.addEventListener("click", iniciarMusica);

// ----- CONFIGURAÇÕES GERAIS -----
let gravidade = 1.2;
let forcaPulo = -18;
let noChao = false;
let vel = 6;
let pontuacao = 0;
let jogoAtivo = true;
let movendo = { esquerda: false, direita: false };
let podeAtirar = true;

// ----- ROBO -----
let robo = {
    x: 100,
    y: 605,
    vy: 0,
    vida: 100,
    width: 80,
    heigth: 90,
    danoTimer: 0,
    hitbox: { xOffset: 15, yOffset: 30, width: 50, height: 50 },
    imgParado: new Image(),
    imgCorrendo: new Image(),
    imgMorto: new Image(),
    imgAtirando: new Image(),
    imagemAtual: null,
    viradoEsquerda: false,

    desenha: function () {
        ctx.save();
        if (this.viradoEsquerda) ctx.scale(-1, 1);

        let img = this.imagemAtual;
        if (this.viradoEsquerda)
            ctx.drawImage(img, -this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);
        else
            ctx.drawImage(img, this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);

        if (this.danoTimer > 0) {
            ctx.globalCompositeOperation = "source-atop";
            ctx.fillStyle = "rgba(255,0,0,0.35)";
            if (this.viradoEsquerda)
                ctx.fillRect(-this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);
            else
                ctx.fillRect(this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);
            ctx.globalCompositeOperation = "source-over";
            this.danoTimer--;
        }

        ctx.restore();
    },

    getHitbox: function () {
        return {
            left: this.x - this.width / 2 + this.hitbox.xOffset,
            right: this.x - this.width / 2 + this.hitbox.xOffset + this.hitbox.width,
            top: this.y - this.heigth / 2 + this.hitbox.yOffset,
            bottom: this.y - this.heigth / 2 + this.hitbox.yOffset + this.hitbox.height,
        };
    }
};

// ----- SPRITES -----
robo.imgParado.src = "./assets/robot-idle.png";
robo.imgCorrendo.src = "./assets/robot-run-png-defato.png";
robo.imgMorto.src = "./assets/robo_dano.png";
robo.imgAtirando.src = "./assets/robozinho_tuc.png";
robo.imagemAtual = robo.imgParado;

// ----- PLATAFORMA -----
let plataforma = { x: 0, y: canvas.height - 120, width: canvas.width, height: 40 };
function desenharPlataforma() {
    ctx.fillStyle = "#00000000";
    ctx.fillRect(plataforma.x, plataforma.y, plataforma.width, plataforma.height);
}

// ----- RAIOS -----
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

            if (this.y + this.altura >= plataforma.y) {
                this.ativo = false;
                return;
            }

            let hb = robo.getHitbox();
            if (this.x < hb.right && this.x + this.largura > hb.left && this.y < hb.bottom && this.y + this.altura > hb.top) {
                this.ativo = false;
                robo.vida -= 20;
                robo.danoTimer = 10;
                if (robo.vida <= 0 && jogoAtivo) morrerRobo();
            }
        },
        desenha: function () {
            ctx.drawImage(raioImg, this.x - this.largura / 2, this.y, this.largura, this.altura);
        }
    };
}

// ----- NUVENS -----
function criarNuvem(xInicial, yInicial, velocidade, sprite, direcao) {
    let nuvem = {
        x: xInicial,
        y: yInicial,
        largura: 250,
        altura: 175,
        img: new Image(),
        velocidadeX: velocidade,
        direcao: direcao,
        vida: 4,
        ativa: true,
        danoTimer: 0,
        tempoProximoRaio: Math.random() * 400 + 300,

        mover: function () {
            if (!this.ativa || !jogoAtivo) return;
            this.x += this.direcao === "esquerda" ? -this.velocidadeX : this.velocidadeX;
            this.y += Math.sin(Date.now() / 500) * 0.4;

            if ((this.direcao === "esquerda" && this.x + this.largura < 0) ||
                (this.direcao === "direita" && this.x > canvas.width + this.largura))
                this.resetarPosicao();

            this.tempoProximoRaio--;
            if (this.tempoProximoRaio <= 0) {
                raios.push(criarRaio(this.x + this.largura / 2, this.y + this.altura / 2));
                this.tempoProximoRaio = Math.random() * 400 + 300;
            }

            if (this.danoTimer > 0) this.danoTimer--;
        },

        resetarPosicao: function () {
            this.x = this.direcao === "esquerda"
                ? canvas.width + Math.random() * 400
                : -this.largura - Math.random() * 400;
            this.y = 30 + Math.random() * 60;
            this.vida = 4;
            this.ativa = true;
            this.danoTimer = 0;
        },

        desenha: function () {
            if (!this.ativa) return;
            ctx.save();
            ctx.drawImage(this.img, this.x, this.y, this.largura, this.altura);
            if (this.danoTimer > 0) {
                ctx.globalCompositeOperation = "source-atop";
                ctx.fillStyle = "rgba(255,0,0,0.35)";
                ctx.fillRect(this.x, this.y, this.largura, this.altura);
                ctx.globalCompositeOperation = "source-over";
            }
            ctx.restore();
        },

        receberDano: function () {
            this.vida--;
            this.danoTimer = 10;
            if (this.vida <= 0) this.morrer();
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
                    cor: "rgba(255,200,0,1)"
                });
            }
            setTimeout(() => this.resetarPosicao(), 1500);
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

// ----- DIFICULDADE DINÂMICA -----
let tempoDecorrido = 0;
let intervaloDificuldade = 600; // a cada ~10 segundos (60 FPS)
let maxNuvensAtivas = 8;

function atualizarDificuldade() {
    if (!jogoAtivo) return;
    tempoDecorrido++;

    if (tempoDecorrido % intervaloDificuldade === 0) {
        if (maxNuvensAtivas < todasNuvens.length) {
            maxNuvensAtivas++;
            nuvensAtivas = todasNuvens.slice(0, maxNuvensAtivas);
        }

        // também acelera um pouco as nuvens
        todasNuvens.forEach(n => n.velocidadeX += 0.1);
    }
}

// ----- TIROS -----
const imgTiro = new Image();
imgTiro.src = "./assets/boleba_energia.png";

let tiros = [];
function criarTiro() {
    return {
        x: robo.x,
        y: robo.y - robo.heigth / 2 - 10,
        largura: 20,
        altura: 20,
        velocidade: -10,
        ativo: true,
        mover: function () {
            if (!jogoAtivo) return;
            this.y += this.velocidade;
            if (this.y + this.altura < 0) this.ativo = false;

            nuvensAtivas.forEach((nuvem) => {
                if (!nuvem.ativa) return;
                let hb = {
                    x: nuvem.x + nuvem.largura * 0.2,
                    y: nuvem.y + nuvem.altura * 0.2,
                    largura: nuvem.largura * 0.6,
                    altura: nuvem.altura * 0.6
                };

                let tiroLeft = this.x - this.largura / 2;
                let tiroRight = this.x + this.largura / 2;
                let tiroTop = this.y;
                let tiroBottom = this.y + this.altura;

                if (tiroLeft < hb.x + hb.largura && tiroRight > hb.x && tiroTop < hb.y + hb.altura && tiroBottom > hb.y) {
                    this.ativo = false;
                    nuvem.receberDano();
                }
            });
        },
        desenha: function () {
            ctx.drawImage(imgTiro, this.x - this.largura / 2, this.y, this.largura, this.altura);
        }
    };
}

// ----- PARTÍCULAS -----
let particulas = [];
function limitarParticulas() {
    const LIMITE = 800;
    if (particulas.length > LIMITE) particulas.splice(0, particulas.length - LIMITE);
}

// ----- MORTE / REINÍCIO -----
function morrerRobo() {
    jogoAtivo = false;
    robo.vida = 0;
    robo.imagemAtual = robo.imgMorto;
    raios = [];
    tiros = [];
    particulas = [];
    nuvensAtivas = [];
}

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
    tempoDecorrido = 0;
    maxNuvensAtivas = 5;
    jogoAtivo = true;
}

// ----- FÍSICA -----
function atualizarPosicao() {
    if (!jogoAtivo) return;
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

    if (robo.y + robo.heigth / 2 >= plataforma.y && robo.vy >= 0) {
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
    atualizarDificuldade();
    desenharPlataforma();

    nuvensAtivas.forEach((n) => { n.mover(); n.desenha(); });

    raios.forEach((r) => r.ativo && (r.mover(), r.desenha()));
    raios = raios.filter((r) => r.ativo);

    tiros.forEach((t) => t.ativo && (t.mover(), t.desenha()));
    tiros = tiros.filter((t) => t.ativo);

    particulas.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vida--;
        ctx.fillStyle = p.cor || "rgba(255,255,0," + Math.max(0, p.vida / 30) + ")";
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    particulas = particulas.filter((p) => p.vida > 0);
    limitarParticulas();

    if (jogoAtivo) {
        atualizarPosicao();
        if (movendo.esquerda || movendo.direita) robo.imagemAtual = robo.imgCorrendo;
        else if (robo.imagemAtual !== robo.imgAtirando) robo.imagemAtual = robo.imgParado;
    }

    robo.desenha();

    // ----- VIDA -----
    let larguraMax = 200;
    let vidaPerc = Math.max(0, Math.min(1, robo.vida / 100));
    let cor = vidaPerc > 0.6 ? "lime" : vidaPerc > 0.3 ? "yellow" : "red";
    ctx.fillStyle = "gray";
    ctx.fillRect(30, 20, larguraMax, 20);
    ctx.fillStyle = cor;
    ctx.fillRect(30, 20, larguraMax * vidaPerc, 20);
    ctx.strokeStyle = "black";
    ctx.strokeRect(30, 20, larguraMax, 20);

    // ----- PONTOS -----
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Pontos: " + pontuacao, canvas.width - 160, 35);

    // ----- GAME OVER -----
   
    if (!jogoAtivo) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Texto principal (GAME OVER)
        ctx.fillStyle = "white";
        ctx.font = "bold 60px Arial";
        let textoGameOver = "GAME OVER";
        let larguraTextoGO = ctx.measureText(textoGameOver).width;
        ctx.fillText(textoGameOver, (canvas.width - larguraTextoGO) / 2, canvas.height / 2 - 40);

        // Texto secundário (Pressione R para reiniciar)
        ctx.fillStyle = "yellow";
        ctx.font = "30px Arial";
        let textoReiniciar = "Pressione R para reiniciar";
        let larguraTextoReiniciar = ctx.measureText(textoReiniciar).width;
        ctx.fillText(textoReiniciar, (canvas.width - larguraTextoReiniciar) / 2, canvas.height / 2 + 40);
}

    requestAnimationFrame(animacao);
}

// ----- CONTROLES -----
document.addEventListener("keydown", (e) => {
    if (!jogoAtivo && e.key.toLowerCase() === "r") {
        reiniciarJogo();
        return;
    }
    if (!jogoAtivo) return;

    if (e.key === "ArrowLeft") movendo.esquerda = true;
    if (e.key === "ArrowRight") movendo.direita = true;
    if (e.key === "ArrowUp" && noChao) { robo.vy = forcaPulo; noChao = false; }

    if (e.code === "Space" && podeAtirar) {
        podeAtirar = false;
        tiros.push(criarTiro());

        for (let i = 0; i < 10; i++) {
            particulas.push({
                x: robo.x,
                y: robo.y - robo.heigth / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 4 - 1,
                vida: 20,
                cor: "rgba(250, 253, 40, 1)"
            });
        }

        robo.imagemAtual = robo.imgAtirando;
        setTimeout(() => {
            if (jogoAtivo && robo.imagemAtual === robo.imgAtirando)
                robo.imagemAtual = movendo.esquerda || movendo.direita ? robo.imgCorrendo : robo.imgParado;
        }, 120);
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") movendo.esquerda = false;
    if (e.key === "ArrowRight") movendo.direita = false;
    if (e.code === "Space") podeAtirar = true;
});

animacao();
