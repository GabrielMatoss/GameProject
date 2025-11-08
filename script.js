// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");

// // ----- CONFIGURAÇÕES -----
// let gravidade = 1.2;
// let forcaPulo = -18;
// let noChao = false;
// let vel = 6;
// let pontuacao = 0; //contador de pontos

// // ----- MOVIMENTO -----
// let movendo = {
//     esquerda: false,
//     direita: false
// };

// // ----- ROBO -----
// // Personagem principal: posição, física básica, sprites e desenho
// let robo = {
//     x: 100,                 // posição X (centro)
//     y: 605,                 // posição Y (centro)
//     vy: 0,                  // velocidade vertical
//     vida: 100,              // pontos de vida
//     width: 80,              // largura do sprite
//     heigth: 90,             // altura do sprite (nota: escrito "heigth" no projeto)
//     imgParado: new Image(), // imagem de idle
//     imgCorrendo: new Image(),// imagem de corrida
//     imagemAtual: null,  // referência para a imagem a desenhar // imagem de atirar
//     imgAtirando: new Image(), // já dentro do robo
//     atirando: false,
//     viradoEsquerda: false,  // flag para inverter horizontalmente

//     // Desenha o robô no canvas, centralizando em (x,y) e espelhando se necessário
//     desenha: function () {
//         let img = this.imagemAtual;
//         ctx.save(); // preserva estado do contexto (transformações / alpha)
//         if (this.viradoEsquerda) {
//             // inverte eixo X para espelhar o sprite e compensa a posição
//             ctx.scale(-1, 1);
//             ctx.drawImage(
//                 img,
//                 -this.x - this.width / 2,        // compensa o scale negativo
//                 this.y - this.heigth / 2,       // centraliza verticalmente
//                 this.width,
//                 this.heigth
//             );
//         } else {
//             // desenho normal, centrado em (x,y)
//             ctx.drawImage(
//                 img,
//                 this.x - this.width / 2,
//                 this.y - this.heigth / 2,
//                 this.width,
//                 this.heigth
//             );
//         }
//         ctx.restore(); // restaura o contexto para não afetar outros desenhos
//     }
// };
// robo.imgParado.src = "./assets/robot-idle.png";
// robo.imgCorrendo.src = "./assets/robot-run.png";
// robo.imgAtirando.src = "./assets/robozinho_tuc.png";
// robo.imagemAtual = robo.imgParado;


// // ----- PLATAFORMA -----
// let plataforma = {
//     x: 0,
//     y: canvas.height - 120,
//     width: canvas.width,
//     height: 40
// };

// function desenharPlataforma() {
//     ctx.fillStyle = "#00000000";
//     ctx.fillRect(plataforma.x, plataforma.y, plataforma.width, plataforma.height);
// }

// // ----- CRIA NUVEM -----
// function criarNuvem(xInicial, yInicial, velocidade, sprite, direcao) {
//     let nuvem = {
//         x: xInicial,
//         y: yInicial,
//         largura: 220,
//         altura: 220,
//         img: new Image(),
//         velocidadeX: velocidade,
//         direcao: direcao,
//         contadorFlutuar: 0,
//         vida: 4,
//         ativa: true,

//         mover: function () {
//             if (!this.ativa) return;

//             if (this.direcao === "esquerda") {
//                 this.x -= this.velocidadeX;
//                 if (this.x + this.largura < 0) {
//                     this.x = canvas.width + Math.random() * 300;
//                     this.y = 50 + Math.random() * 150;
//                 }
//             } else {
//                 this.x += this.velocidadeX;
//                 if (this.x > canvas.width + this.largura) {
//                     this.x = -this.largura - Math.random() * 300;
//                     this.y = 50 + Math.random() * 150;
//                 }
//             }

//             // movimento de flutuação (suave)
//             this.contadorFlutuar += 0.05;
//             this.y += Math.sin(this.contadorFlutuar) * 0.8;
//         },

//         desenha: function () {
//             if (!this.ativa) return;
//             ctx.drawImage(this.img, this.x, this.y, this.largura, this.altura);
//         },

//         morrer: function () {
//             this.ativa = false;
//             pontuacao += 5;
//             for (let i = 0; i < 20; i++) {
//                 particulas.push({
//                     x: this.x + this.largura / 2,
//                     y: this.y + this.altura / 2,
//                     vx: (Math.random() - 0.5) * 6,
//                     vy: (Math.random() - 0.5) * 6,
//                     vida: 30,
//                 });
//             }
//             setTimeout(() => {
//                 this.x = this.direcao === "esquerda"
//                     ? canvas.width + Math.random() * 300
//                     : -this.largura - Math.random() * 300;
//                 this.y = 50 + Math.random() * 150;
//                 this.vida = 4;
//                 this.ativa = true;
//             }, 4000);
//         }
//     };

//     nuvem.img.src = sprite;
//     return nuvem;
// }


// // ----- LISTA DE NUVENS -----
// let todasNuvens = [];
// for (let i = 0; i < 10; i++) {
//     let sprite = i % 2 === 0 ? "./assets/nuvem.png" : "./assets/nuvem.png";
//     let direcao = Math.random() > 0.5 ? "esquerda" : "direita";
//     let xInicial = direcao === "esquerda" ? 200 * i : canvas.width - 200 * i;
//     todasNuvens.push(criarNuvem(xInicial, 80 + Math.random() * 100, 0.8 + Math.random() * 0.6, sprite, direcao));
// }

// let nuvensAtivas = todasNuvens.slice(0, 5);

// // ----- RAIO -----
// // imagem do raio usado para desenhar
// const raioImg = new Image();
// raioImg.src = "./assets/raio.png";
// let raios = [];

// function criarRaio(xInicial, yInicial) {
//     return {
//         x: xInicial,        // posição X (centro usado ao desenhar)
//         y: yInicial,        // posição Y (topo do raio)
//         largura: 250,
//         altura: 150,
//         velocidade: 1.2,
//         ativo: true,        // flag para remover quando falso
//         opacidade: 1,       // alpha ao desenhar

//         // atualiza posição e checa colisão com o robô/plataforma
//         mover: function () {
//             this.y += this.velocidade;
//             // desativa se atingir a plataforma
//             if (this.y + this.altura > plataforma.y + 40) this.ativo = false;

//             // limites do robô
//             let roboLeft = robo.x - robo.width / 2;
//             let roboRight = robo.x + robo.width / 2;
//             let roboTop = robo.y - robo.heigth / 2;
//             let roboBottom = robo.y + robo.heigth / 2;

//             // teste de sobreposição AABB (X e Y)
//             if (
//                 this.x < roboRight &&
//                 this.x + this.largura > roboLeft &&
//                 this.y < roboBottom &&
//                 this.y + this.altura > roboTop
//             ) {
//                 // acerta o robô: desativa e reduz vida
//                 this.ativo = false;
//                 robo.vida -= 10;
//                 if (robo.vida < 0) robo.vida = 0;
//             }
//         },

//         // desenha com opacidade, centrando horizontalmente em this.x
//         desenha: function () {
//             ctx.save();
//             ctx.globalAlpha = this.opacidade;
//             ctx.drawImage(raioImg, this.x - this.largura / 2, this.y, this.largura, this.altura);
//             ctx.restore();
//         }    

//     };
// }

// // ----- TIROS DAS NUVENS -----
// // cria raios periodicamente a partir das nuvens ativas
// setInterval(() => {
//     nuvensAtivas.forEach((nuvem) => {
//         if (nuvem.ativa && Math.random() < 0.6) {
//             let raio = criarRaio(nuvem.x + nuvem.largura / 2, nuvem.y + nuvem.altura / 2);
//             raios.push(raio);
//         }
//     });
// }, 2500);

// // ----- DIFICULDADE -----
// setInterval(() => {
//     if (nuvensAtivas.length < todasNuvens.length) {
//         nuvensAtivas.push(todasNuvens[nuvensAtivas.length]);
//     }
// }, 10000);

// // ----- TIROS DO ROBO -----
// let tiros = [];

// function criarTiro() {
//     return {
//         x: robo.x - 5,
//         y: robo.y - robo.heigth / 2 - 10,
//         largura: 10,
//         altura: 20,
//         velocidade: -10,
//         ativo: true,

//         mover: function () {
//             this.y += this.velocidade;
//             if (this.y + this.altura < 0) this.ativo = false;
//             //colisão AABB (Axis-Aligned Bounding Box)
//             // dentro do mover() do tiro
//             nuvensAtivas.forEach((nuvem) => {
//             if (!nuvem.ativa) return;
//             // cria uma hitbox reduzida (menor que o frame visual)
//             const margem = 55; // ajuste fino — 50px em cada lado
//             const hitbox = {
//                 x: nuvem.x + margem,
//                 y: nuvem.y + margem,
//                 largura: nuvem.largura - margem * 2,
//                 altura: nuvem.altura - margem * 2
//             };

//             if (
//                 this.x < hitbox.x + hitbox.largura &&
//                 this.x + this.largura > hitbox.x &&
//                 this.y < hitbox.y + hitbox.altura &&
//                 this.y + this.altura > hitbox.y
//             ) {
//                 this.ativo = false;
//                 nuvem.vida--;
//                 if (nuvem.vida <= 0) nuvem.morrer();
//             }
//             });

//         },
//         desenha: function () {
//             ctx.fillStyle = "cyan";
//             ctx.fillRect(this.x, this.y, this.largura, this.altura);
//         }
//     };
// }

// // ----- PARTÍCULAS -----
// let particulas = [];

// // ----- FÍSICA -----
// function atualizarPosicao() {
//     if (movendo.esquerda) {
//         robo.x -= vel;
//         robo.viradoEsquerda = true;
//     }
//     if (movendo.direita) {
//         robo.x += vel;
//         robo.viradoEsquerda = false;
//     }

//     robo.vy += gravidade;
//     robo.y += robo.vy;
//     noChao = false;

//     if (
//         robo.y + robo.heigth / 2 >= plataforma.y &&
//         robo.y + robo.heigth / 2 <= plataforma.y + plataforma.height &&
//         robo.vy >= 0
//     ) {
//         robo.y = plataforma.y - robo.heigth / 2;
//         robo.vy = 0;
//         noChao = true;
//     }

//     if (robo.x < robo.width / 2) robo.x = robo.width / 2;
//     if (robo.x > canvas.width - robo.width / 2) robo.x = canvas.width - robo.width / 2;
// }

// // ----- LOOP PRINCIPAL -----
// function animacao() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     atualizarPosicao();
//     desenharPlataforma();

//     nuvensAtivas.forEach((n) => {
//         n.mover();
//         n.desenha();
//     });

//     raios.forEach((r) => r.ativo && (r.mover(), r.desenha()));
//     raios = raios.filter((r) => r.ativo);

//     tiros.forEach((t) => t.ativo && (t.mover(), t.desenha()));
//     tiros = tiros.filter((t) => t.ativo);

//     particulas.forEach((p) => {
//         p.x += p.vx;
//         p.y += p.vy;
//         p.vida--;
//         ctx.fillStyle = "rgba(255,255,0," + p.vida / 30 + ")";
//         ctx.fillRect(p.x, p.y, 4, 4);
//     });
//     particulas = particulas.filter((p) => p.vida > 0);

//     //alterei
//     // if (movendo.esquerda || movendo.direita) robo.imagemAtual = robo.imgCorrendo;
//     // else robo.imagemAtual = robo.imgParado;
//     // robo.desenha();
//     // só troca por corrida/parado se NÃO estiver atirando
//     if (!robo.atirando) {
//         if (movendo.esquerda || movendo.direita) robo.imagemAtual = robo.imgCorrendo;
//         else robo.imagemAtual = robo.imgParado;
//     }
//     robo.desenha();


//     // VIDA
//     ctx.fillStyle = "red";
//     ctx.font = "24px Arial";
//     ctx.fillText("Vida: " + robo.vida, 30, 50);

//     // PONTOS
//     ctx.fillStyle = "yellow";
//     ctx.font = "24px Arial";
//     ctx.fillText("Pontos: " + pontuacao, canvas.width - 180, 50);
//     requestAnimationFrame(animacao);
//     //cada vez que é chamada, animação é atualizada, apagando com ctx.clearRect
//     //atualizando posições com n.mover() e redesenhando com n.desenha()
// }

// window.onload = () => animacao();
// // ----- CONTROLES -----
// let podeAtirar = true; //impede spam de tiro segurando espaço

// document.addEventListener("keydown", (e) => {
//     if (e.key === "ArrowLeft") movendo.esquerda = true;
//     if (e.key === "ArrowRight") movendo.direita = true;

//     if (e.key === "ArrowUp" && noChao) {
//         robo.vy = forcaPulo;
//         noChao = false;
//     }

//     // ---- TIRO ----
//     if (e.code === "Space" && podeAtirar) { // só atira se puder
//         podeAtirar = false; // trava até soltar espaço
//         tiros.push(criarTiro());
//         robo.atirando = true;
//         robo.imagemAtual = robo.imgAtirando;

//         // animação rápida do tiro
//         setTimeout(() => {
//             robo.atirando = false;
//             if (movendo.esquerda || movendo.direita)
//                 robo.imagemAtual = robo.imgCorrendo;
//             else
//                 robo.imagemAtual = robo.imgParado;
//         }, 100); // duração do frame de tiro
//     }
// });

// // libera o tiro ao soltar espaço
// document.addEventListener("keyup", (e) => {
//     if (e.key === "ArrowLeft") movendo.esquerda = false;
//     if (e.key === "ArrowRight") movendo.direita = false;
//     if (e.code === "Space") podeAtirar = true; // pode atirar novamente
// });

//codigo luigi
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// ----- CONFIGURAÇÕES -----
let gravidade = 1.2;
let forcaPulo = -18;
let noChao = false;
let vel = 6;
let pontuacao = 0;
let jogoAtivo = true;
let movendo = { esquerda: false, direita: false };

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
    imgParado: new Image(),
    imgCorrendo1: new Image(),
    imgCorrendo2: new Image(),
    imgCorrendo3: new Image(),
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

// Caminhos das imagens
robo.imgParado.src = "./assets/robot-idle.png";
robo.imgCorrendo1.src = "./assets/robo1.png";
robo.imgCorrendo2.src = "./assets/robo2.png";
robo.imgCorrendo3.src = "./assets/robo3.png";
robo.imgMorto.src = "./assets/robo_dano.png";
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
            if (this.y > canvas.height) this.ativo = false;

            // colisão com o robô
            let roboLeft = robo.x - robo.width / 2;
            let roboRight = robo.x + robo.width / 2;
            let roboTop = robo.y - robo.heigth / 2;
            let roboBottom = robo.y + robo.heigth / 2;

            if (this.x < roboRight && this.x + this.largura > roboLeft && this.y < roboBottom && this.y + this.altura > roboTop) {
                this.ativo = false;
                robo.vida -= 10;
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

            if (this.direcao === "esquerda") {
                this.x -= this.velocidadeX;
                if (this.x + this.largura < 0) this.resetarPosicao();
            } else {
                this.x += this.velocidadeX;
                if (this.x > canvas.width + this.largura) this.resetarPosicao();
            }

            this.y += Math.sin(Date.now() / 500) * 0.4;

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

// ----- TIROS -----
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

// ----- PARTÍCULAS -----
let particulas = [];

// ----- MORTE E REINÍCIO -----
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

    nuvensAtivas.forEach((n) => { n.mover(); n.desenha(); });
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

    if (jogoAtivo) {
        atualizarPosicao();

        // Animação de caminhada com 3 frames
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
    if (e.code === "Space") tiros.push(criarTiro());
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") movendo.esquerda = false;
    if (e.key === "ArrowRight") movendo.direita = false;
});

window.onload = animacao;

window.onload = animacao;