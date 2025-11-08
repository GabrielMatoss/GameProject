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
// Personagem principal: posição, física básica, sprites e desenho
let robo = {
    x: 100,                 // posição X (centro)
    y: 605,                 // posição Y (centro)
    vy: 0,                  // velocidade vertical
    vida: 100,              // pontos de vida
    width: 80,              // largura do sprite
    heigth: 90,             // altura do sprite (nota: escrito "heigth" no projeto)
    imgParado: new Image(), // imagem de idle
    imgCorrendo: new Image(),// imagem de corrida
    imagemAtual: null,  // referência para a imagem a desenhar // imagem de atirar
    imgAtirando: new Image(), // já dentro do robo
    atirando: false,
    viradoEsquerda: false,  // flag para inverter horizontalmente

    // Desenha o robô no canvas, centralizando em (x,y) e espelhando se necessário
    desenha: function () {
        let img = this.imagemAtual;
        ctx.save(); // preserva estado do contexto (transformações / alpha)
        if (this.viradoEsquerda) {
            // inverte eixo X para espelhar o sprite e compensa a posição
            ctx.scale(-1, 1);
            ctx.drawImage(
                img,
                -this.x - this.width / 2,        // compensa o scale negativo
                this.y - this.heigth / 2,       // centraliza verticalmente
                this.width,
                this.heigth
            );
        } else {
            // desenho normal, centrado em (x,y)
            ctx.drawImage(
                img,
                this.x - this.width / 2,
                this.y - this.heigth / 2,
                this.width,
                this.heigth
            );
        }
        ctx.restore(); // restaura o contexto para não afetar outros desenhos
    }
};
robo.imgParado.src = "./assets/robot-idle.png";
robo.imgCorrendo.src = "./assets/robot-run.png";
robo.imgAtirando.src = "./assets/robozinho_tuc.png";
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
        direcao: direcao,
        contadorFlutuar: 0,
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

            // movimento de flutuação (suave)
            this.contadorFlutuar += 0.05;
            this.y += Math.sin(this.contadorFlutuar) * 0.8;
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
    let sprite = i % 2 === 0 ? "./assets/nuvem.png" : "./assets/nuvem.png";
    let direcao = Math.random() > 0.5 ? "esquerda" : "direita";
    let xInicial = direcao === "esquerda" ? 200 * i : canvas.width - 200 * i;
    todasNuvens.push(criarNuvem(xInicial, 80 + Math.random() * 100, 0.8 + Math.random() * 0.6, sprite, direcao));
}

let nuvensAtivas = todasNuvens.slice(0, 5);

// ----- RAIO -----
// imagem do raio usado para desenhar
const raioImg = new Image();
raioImg.src = "./assets/raio.png";
let raios = [];

function criarRaio(xInicial, yInicial) {
    return {
        x: xInicial,        // posição X (centro usado ao desenhar)
        y: yInicial,        // posição Y (topo do raio)
        largura: 250,
        altura: 150,
        velocidade: 1.2,
        ativo: true,        // flag para remover quando falso
        opacidade: 1,       // alpha ao desenhar

        // atualiza posição e checa colisão com o robô/plataforma
        mover: function () {
            this.y += this.velocidade;
            // desativa se atingir a plataforma
            if (this.y + this.altura > plataforma.y + 40) this.ativo = false;

            // limites do robô
            let roboLeft = robo.x - robo.width / 2;
            let roboRight = robo.x + robo.width / 2;
            let roboTop = robo.y - robo.heigth / 2;
            let roboBottom = robo.y + robo.heigth / 2;

            // teste de sobreposição AABB (X e Y)
            if (
                this.x < roboRight &&
                this.x + this.largura > roboLeft &&
                this.y < roboBottom &&
                this.y + this.altura > roboTop
            ) {
                // acerta o robô: desativa e reduz vida
                this.ativo = false;
                robo.vida -= 10;
                if (robo.vida < 0) robo.vida = 0;
            }
        },

        // desenha com opacidade, centrando horizontalmente em this.x
        desenha: function () {
            ctx.save();
            ctx.globalAlpha = this.opacidade;
            ctx.drawImage(raioImg, this.x - this.largura / 2, this.y, this.largura, this.altura);
            ctx.restore();
        }    

    };
}

// ----- TIROS DAS NUVENS -----
// cria raios periodicamente a partir das nuvens ativas
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
        x: robo.x - 5,
        y: robo.y - robo.heigth / 2 - 10,
        largura: 10,
        altura: 20,
        velocidade: -10,
        ativo: true,

        mover: function () {
            this.y += this.velocidade;
            if (this.y + this.altura < 0) this.ativo = false;
            //colisão AABB (Axis-Aligned Bounding Box)
            // dentro do mover() do tiro
            nuvensAtivas.forEach((nuvem) => {
            if (!nuvem.ativa) return;
            // cria uma hitbox reduzida (menor que o frame visual)
            const margem = 55; // ajuste fino — 50px em cada lado
            const hitbox = {
                x: nuvem.x + margem,
                y: nuvem.y + margem,
                largura: nuvem.largura - margem * 2,
                altura: nuvem.altura - margem * 2
            };

            if (
                this.x < hitbox.x + hitbox.largura &&
                this.x + this.largura > hitbox.x &&
                this.y < hitbox.y + hitbox.altura &&
                this.y + this.altura > hitbox.y
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

    //alterei
    // if (movendo.esquerda || movendo.direita) robo.imagemAtual = robo.imgCorrendo;
    // else robo.imagemAtual = robo.imgParado;
    // robo.desenha();
    // só troca por corrida/parado se NÃO estiver atirando
    if (!robo.atirando) {
        if (movendo.esquerda || movendo.direita) robo.imagemAtual = robo.imgCorrendo;
        else robo.imagemAtual = robo.imgParado;
    }
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
    //cada vez que é chamada, animação é atualizada, apagando com ctx.clearRect
    //atualizando posições com n.mover() e redesenhando com n.desenha()
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
    if (e.code === "Space") {
        tiros.push(criarTiro());
        robo.atirando = true;
        robo.imagemAtual = robo.imgAtirando;

    // tempo do "flash" de tiro (ajuste entre 100-400ms)
    setTimeout(() => {
        robo.atirando = false;
        // restaura conforme movimento atual
        if (movendo.esquerda || movendo.direita) robo.imagemAtual = robo.imgCorrendo;
        else robo.imagemAtual = robo.imgParado;
    }, 200);
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") movendo.esquerda = false;
    if (e.key === "ArrowRight") movendo.direita = false;
});
