let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// ----- CONFIGURAÇÕES GERAIS -----
let gravidade = 1.2;
let forcaPulo = -18;
let noChao = false;
let vel = 6;
let pontuacao = 0;
let jogoAtivo = true;
let movendo = { esquerda: false, direita: false };
let podeAtirar = true; // só atira uma vez por pressionamento

// ----- CONTROLE DE ANIMAÇÃO -----
let frameContador = 0;
let tempoTrocaFrame = 10;

// ----- ROBO -----
let robo = {
    x: 100,
    y: 605,
    vy: 0,
    vida: 100,
    width: 80,
    heigth: 90,
    danoTimer: 0, // tempo piscando vermelho
    // hitbox realista (offsets em relação ao centro)
    hitbox: { xOffset: 15, yOffset: 30, width: 50, height: 50 },
    imgParado: new Image(),
    imgCorrendo1: new Image(),
    imgCorrendo2: new Image(),
    imgCorrendo3: new Image(),
    imgMorto: new Image(),
    imgAtirando: new Image(),
    imagemAtual: null,
    viradoEsquerda: false,

    desenha: function () {
        ctx.save();
        if (this.viradoEsquerda) ctx.scale(-1, 1);

        // desenha a imagem (após escala, tudo relativo)
        let img = this.imagemAtual;
        if (this.viradoEsquerda)
            ctx.drawImage(img, -this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);
        else
            ctx.drawImage(img, this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);

        // se tomou dano, desenha overlay vermelho (pisca) sobre o sprite usando compositing correto
        if (this.danoTimer > 0) {
            // pintamos somente sobre os pixels já desenhados (source-atop)
            ctx.globalCompositeOperation = "source-atop";
            ctx.fillStyle = "rgba(255,0,0,0.35)";
            // desenha o retângulo na área do sprite (mesma posição)
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
        // retorna coordenadas absolutas do hitbox
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
robo.imgCorrendo1.src = "./assets/robo1.png";
robo.imgCorrendo2.src = "./assets/robo2.png";
robo.imgCorrendo3.src = "./assets/robo3.png";
robo.imgMorto.src = "./assets/robo_dano.png";
robo.imgAtirando.src = "./assets/robozinho_tuc.png";
robo.imagemAtual = robo.imgParado;

// ----- PLATAFORMA -----
let plataforma = { x: 0, y: canvas.height - 120, width: canvas.width, height: 40 };
function desenharPlataforma() {
    ctx.fillStyle = "#00000000";
    ctx.fillRect(plataforma.x, plataforma.y, plataforma.width, plataforma.height);
}

// ----- RAIOS (inimigo) -----
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

            // 🔹 Desativa o raio quando encostar na plataforma (evita sumiço além da tela)
            if (this.y + this.altura >= plataforma.y) {
                this.ativo = false;
                return;
            }

            // colisão com hitbox do robô
            let hb = robo.getHitbox();
            if (this.x < hb.right && this.x + this.largura > hb.left && this.y < hb.bottom && this.y + this.altura > hb.top) {
                this.ativo = false;
                robo.vida -= 10;
                robo.danoTimer = 10; // piscar
                if (robo.vida <= 0 && jogoAtivo) morrerRobo();
            }
        },
        desenha: function () {
            ctx.drawImage(raioImg, this.x - this.largura / 2, this.y, this.largura, this.altura);
        }
    };
}

// ----- NUVENS (inimigos) -----
// substituímos para usar receberDano() e efeito de tint vermelho suave
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
        danoTimer: 0, // piscar quando levar dano
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

            // diminui o tempo do flash de dano
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
            // desenha a nuvem normalmente
            ctx.drawImage(this.img, this.x, this.y, this.largura, this.altura);

            // se está no timer de dano, aplica um tint vermelho suave sobre a própria imagem
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
            this.danoTimer = 10; // frames que vai piscar
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
    // inicializa primeiras ativas
    nuvensAtivas = todasNuvens.slice(0, 5);
}
gerarNuvensIniciais();

// ----- TIROS (do player) -----
let tiros = [];
function criarTiro() {
    // tiro sobe (y decresce) — mantive seu comportamento original
    return {
        x: robo.x,
        y: robo.y - robo.heigth / 2 - 10,
        largura: 10,
        altura: 20,
        velocidade: -10,
        ativo: true,
        mover: function () {
            if (!jogoAtivo) return;
            this.y += this.velocidade;
            if (this.y + this.altura < 0) this.ativo = false;

            // colisão com nuvens usando hitbox reduzido
            nuvensAtivas.forEach((nuvem) => {
                if (!nuvem.ativa) return;
                let hitbox = {
                    x: nuvem.x + 20,
                    y: nuvem.y + 20,
                    largura: nuvem.largura - 40,
                    altura: nuvem.altura - 40
                };
                if (
                    this.x < hitbox.x + hitbox.largura &&
                    this.x + this.largura > hitbox.x &&
                    this.y < hitbox.y + hitbox.altura &&
                    this.y + this.altura > hitbox.y
                ) {
                    this.ativo = false;
                    // usa o método receberDano para aplicar o efeito suave
                    if (typeof nuvem.receberDano === "function") {
                        nuvem.receberDano();
                    } else {
                        // fallback (caso use versão antiga)
                        nuvem.vida--;
                        nuvem.danoTimer = 8;
                        if (nuvem.vida <= 0 && nuvem.morrer) nuvem.morrer();
                    }
                }
            });
        },
        desenha: function () {
            ctx.fillStyle = "yellow";
            ctx.fillRect(this.x - this.largura / 2, this.y, this.largura, this.altura);
        }
    };
}

// ----- PARTÍCULAS -----
let particulas = [];

// proteção para não acumular partículas infinitas
function limitarParticulas() {
    const LIMITE = 800;
    if (particulas.length > LIMITE) particulas.splice(0, particulas.length - LIMITE);
}

// ----- MORTE / REINÍCIO -----
function morrerRobo() {
    jogoAtivo = false;
    robo.vida = 0;
    robo.imagemAtual = robo.imgMorto;
    // limpa arrays pesados
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
    desenharPlataforma();

    // atualiza/desenha nuvens e raios (inimigos)
    nuvensAtivas.forEach((n) => { n.mover(); n.desenha(); });

    raios.forEach((r) => r.ativo && (r.mover(), r.desenha()));
    raios = raios.filter((r) => r.ativo);

    // tiros do player
    tiros.forEach((t) => t.ativo && (t.mover(), t.desenha()));
    tiros = tiros.filter((t) => t.ativo);

    // partículas (energia/explosão)
    particulas.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vida--;
        // cor opcional
        ctx.fillStyle = p.cor || "rgba(255,255,0," + Math.max(0, p.vida / 30) + ")";
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    particulas = particulas.filter((p) => p.vida > 0);
    limitarParticulas(); // protege performance

    if (jogoAtivo) {
        atualizarPosicao();

        // animação de corrida
        if (movendo.esquerda || movendo.direita) {
            frameContador++;
            let ciclo = frameContador % (tempoTrocaFrame * 3);
            robo.imagemAtual = ciclo < tempoTrocaFrame
                ? robo.imgCorrendo1
                : ciclo < tempoTrocaFrame * 2
                    ? robo.imgCorrendo2
                    : robo.imgCorrendo3;
        } else {
            robo.imagemAtual = robo.imgParado;
            frameContador = 0;
        }
    }

    robo.desenha();

    // ----- BARRA DE VIDA -----
    let larguraMax = 200;
    let vidaPerc = Math.max(0, Math.min(1, robo.vida / 100));
    let cor = vidaPerc > 0.6 ? "lime" : vidaPerc > 0.3 ? "yellow" : "red";
    ctx.fillStyle = "gray";
    ctx.fillRect(30, 20, larguraMax, 20);
    ctx.fillStyle = cor;
    ctx.fillRect(30, 20, larguraMax * vidaPerc, 20);
    ctx.strokeStyle = "black";
    ctx.strokeRect(30, 20, larguraMax, 20);

    // HUD texto
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Pontos: " + pontuacao, canvas.width - 160, 35);

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

// ----- CONTROLES -----
// keydown: movimento e tiro (atira apenas se podeAtirar === true)
// keyup: libera o tiro quando soltar espaço
document.addEventListener("keydown", (e) => {
    if (!jogoAtivo && e.key.toLowerCase() === "r") {
        reiniciarJogo();
        return;
    }
    if (!jogoAtivo) return;

    if (e.key === "ArrowLeft") movendo.esquerda = true;
    if (e.key === "ArrowRight") movendo.direita = true;
    if (e.key === "ArrowUp" && noChao) { robo.vy = forcaPulo; noChao = false; }

    // atira somente uma vez por pressionamento (keypress hold não dispara repetidamente)
    if (e.code === "Space" && podeAtirar) {
        podeAtirar = false;                // evita repetir enquanto a tecla estiver pressionada
        tiros.push(criarTiro());

        // partículas saindo da cabeça do robo (efeito)
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

        // animação de tiro (curta)
        robo.imagemAtual = robo.imgAtirando;
        setTimeout(() => { if (jogoAtivo) robo.imagemAtual = robo.imgParado; }, 120);
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") movendo.esquerda = false;
    if (e.key === "ArrowRight") movendo.direita = false;

    // somente ao soltar espaço liberamos para próximo tiro
    if (e.code === "Space") {
        podeAtirar = true;
    }
});

window.onload = animacao;
