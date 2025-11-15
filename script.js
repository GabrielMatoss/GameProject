let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const btnStart = document.getElementById("btnStart");
const msgStart = document.getElementById("msgStart");
let jogoIniciado = false;

let musicaFundo = new Audio("./assets/dancing_robots.mp3");
musicaFundo.loop = true;
musicaFundo.volume = 0.5;

function iniciarMusica() {
    musicaFundo.play().catch(() => {});
}

btnStart.addEventListener("click", () => {
    btnStart.style.display = "none";
    msgStart.style.display = "none";
    jogoIniciado = true;
    jogoAtivo = true;
    iniciarMusica();
    animacao();
});

let botaoMute = {
    x: 240,
    y: 15,
    largura: 30,
    altura: 30,
    mutado: false,

    desenha: function () {
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText(this.mutado ? "🔇" : "🔊", this.x, this.y + 25);
    },

    clicar: function (x, y) {
        if (x >= this.x && x <= this.x + this.largura &&
            y >= this.y && y <= this.y + this.altura) {
            this.mutado = !this.mutado;
            musicaFundo.muted = this.mutado;
        }
    },
};

let gravidade = 1.2;
let forcaPulo = -18;
let noChao = false;
let vel = 6;
let pontuacao = 0;
let jogoAtivo = true;
let movendo = { esquerda: false, direita: false };
let podeAtirar = true;

let robo = {
    x: 100,
    y: 650,
    vy: 0,
    vida: 100,
    
    width: 80,
    heigth: 90,
    
    danoTimer: 0,
    
    hitbox: { 
        xOffset: 20,
        yOffset: 40,
        width: 40,
        height: 40
    },
    
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

robo.imgParado.src = "./assets/robot_stay.png";
robo.imgCorrendo.src = "./assets/robot_run.png";
robo.imgMorto.src = "./assets/robo_damage.png";
robo.imgAtirando.src = "./assets/robot_gun.png";
robo.imagemAtual = robo.imgParado;

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
            let raioLeft = this.x - this.largura / 2;
            let raioRight = this.x + this.largura / 2;
            let raioTop = this.y;
            let raioBottom = this.y + this.altura;
            let hb = robo.getHitbox();
            if (raioLeft < hb.right && raioRight > hb.left && 
               raioTop < hb.bottom && raioBottom > hb.top) {
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
        tempoProximoRaio: Math.random() * 200 + 150,
        
        velocidadeVertical: 0.4,
        indoParaCima: true,

        mover: function () {
            if (!this.ativa || !jogoAtivo) return;
            
            this.x += this.direcao === "esquerda" ? -this.velocidadeX : this.velocidadeX;
            
            if (this.indoParaCima) {
                this.y -= this.velocidadeVertical;
            } else {
                this.y += this.velocidadeVertical;
            }
            
            if (this.y <= 30) {
                this.indoParaCima = false;
            } else if (this.y >= 90) {
                this.indoParaCima = true;
            }

            if ((this.direcao === "esquerda" && this.x + this.largura < 0) ||
                (this.direcao === "direita" && this.x > canvas.width + this.largura))
                this.resetarPosicao();

            this.tempoProximoRaio--;
            if (this.tempoProximoRaio <= 0) {
                raios.push(criarRaio(this.x + this.largura / 2, this.y + this.altura / 2));
                this.tempoProximoRaio = Math.random() * 100 + 50;
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
            this.indoParaCima = Math.random() > 0.5;  
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

function gerarNuvensIniciais() {
    todasNuvens = [];
    for (let i = 0; i < 8; i++) {
        let sprite = i % 2 === 0 ? "./assets/nuvem1.png" : "./assets/nuvem2.png";
        let direcao = Math.random() > 0.5 ? "esquerda" : "direita";
        let xInicial = direcao === "esquerda" 
            ? canvas.width + Math.random() * 400 
            : -220 - Math.random() * 400;
        todasNuvens.push(criarNuvem(
            xInicial, 
            40 + Math.random() * 60, 
            1.2 + Math.random() * 0.6, 
            sprite, 
            direcao
        ));
    }
    nuvensAtivas = todasNuvens.slice(0, 7);
}

let todasNuvens = [];
let nuvensAtivas = [];


gerarNuvensIniciais();

/// Dificuldade Progressiva
let tempoDecorrido = 0;
let intervaloDificuldade = 600;
let maxNuvensAtivas = 8;

function atualizarDificuldade() {
    if (!jogoAtivo) return;
    
    tempoDecorrido++;

    if (tempoDecorrido % intervaloDificuldade === 0) {
        if (maxNuvensAtivas < todasNuvens.length) {
            maxNuvensAtivas++;
            nuvensAtivas = todasNuvens.slice(0, maxNuvensAtivas);
        }

        todasNuvens.forEach(n => n.velocidadeX += 0.2);
    }
}

const imgTiro = new Image();
imgTiro.src = "./assets/bola_energia.png";
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
                    largura: nuvem.largura * 0.8,
                    altura: nuvem.altura * 0.3
                };

                let tiroLeft = this.x - this.largura / 2;
                let tiroRight = this.x + this.largura / 2;
                let tiroTop = this.y;
                let tiroBottom = this.y + this.altura;

                if (tiroLeft < hb.x + hb.largura && tiroRight > hb.x &&
                    tiroTop < hb.y + hb.altura && tiroBottom > hb.y) {
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

let particulas = [];

function limitarParticulas() {
    const limite = 800;
    
    if (particulas.length > limite) 
        particulas.splice(0, particulas.length - limite);
}

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
    maxNuvensAtivas = 6;
    jogoAtivo = true;
}

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
    if (robo.x > canvas.width - robo.width / 2) 
        robo.x = canvas.width - robo.width / 2;
}
//
function animacao() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    atualizarDificuldade();
    
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
        
        ctx.fillStyle = p.cor || "rgba(255,255,0," + Math.max(0, p.vida / 30) + ")";
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    particulas = particulas.filter((p) => p.vida > 0);
    limitarParticulas();

    if (jogoAtivo) {
        atualizarPosicao();
        
        if (movendo.esquerda || movendo.direita) 
            robo.imagemAtual = robo.imgCorrendo;
        else if (robo.imagemAtual !== robo.imgAtirando) 
            robo.imagemAtual = robo.imgParado;
    }

    robo.desenha();

    let larguraMax = 200;
    let vidaPerc = Math.max(0, Math.min(1, robo.vida / 100));
    
    let cor = vidaPerc > 0.6 ? "lime" : vidaPerc > 0.3 ? "yellow" : "red";
    
    ctx.fillStyle = "gray";
    ctx.fillRect(30, 20, larguraMax, 20);
    
    ctx.fillStyle = cor;
    ctx.fillRect(30, 20, larguraMax * vidaPerc, 20);
    
    ctx.strokeStyle = "black";
    ctx.strokeRect(30, 20, larguraMax, 20);

    botaoMute.desenha();

    ctx.font = "bold 24px 'Press Start 2P', cursive";
    ctx.fillStyle = "#00d9ffff";
    ctx.shadowColor = "#006effff";
    ctx.shadowBlur = 8;
    ctx.textAlign = "right";
    ctx.fillText("PONTOS: " + pontuacao, canvas.width - 40, 45);
    ctx.shadowBlur = 0;
    ctx.textAlign = "left";

    if (!jogoAtivo) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "bold 60px Arial";
        let textoGameOver = "GAME OVER";
        let larguraTextoGO = ctx.measureText(textoGameOver).width;
        ctx.fillText(textoGameOver, (canvas.width - larguraTextoGO) / 2, canvas.height / 2 - 80);

        ctx.fillStyle = "#00ffff";
        ctx.font = "bold 36px Arial";
        let textoPontuacao = `SUA PONTUAÇÃO: ${pontuacao}`;
        let larguraPontuacao = ctx.measureText(textoPontuacao).width;
        ctx.fillText(textoPontuacao, (canvas.width - larguraPontuacao) / 2, canvas.height / 2 - 20);

        ctx.fillStyle = "yellow";
        ctx.font = "30px Arial";
        let textoReiniciar = "Pressione R para reiniciar";
        let larguraTextoReiniciar = ctx.measureText(textoReiniciar).width;
        ctx.fillText(textoReiniciar, (canvas.width - larguraTextoReiniciar) / 2, canvas.height / 2 + 50);
    }

    requestAnimationFrame(animacao);
}

let espacoPressionado = false;

document.addEventListener("keydown", (e) => {
    if (!jogoAtivo && e.key.toLowerCase() === "r") {
        reiniciarJogo();
        return;
    }
    
    if (!jogoAtivo) return;

    if (e.key === "ArrowLeft") movendo.esquerda = true;
    if (e.key === "ArrowRight") movendo.direita = true;
    
    if (e.key === "ArrowUp" && noChao) { 
        robo.vy = forcaPulo;
        noChao = false;
    }

    if (e.code === "Space" && !espacoPressionado) {
        espacoPressionado = true;
        
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
                robo.imagemAtual = movendo.esquerda || movendo.direita 
                    ? robo.imgCorrendo 
                    : robo.imgParado;
        }, 120);
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") movendo.esquerda = false;
    if (e.key === "ArrowRight") movendo.direita = false;

    if (e.code === "Space") espacoPressionado = false;
});

canvas.addEventListener("click", (e) => {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    botaoMute.clicar(x, y);
});