// ===== INICIALIZAÇÃO DO CANVAS =====
// Obtém o elemento canvas do HTML onde o jogo será desenhado
let canvas = document.getElementById("canvas");
// Cria um contexto 2D que nos permite desenhar no canvas
let ctx = canvas.getContext("2d");

// ===== ELEMENTOS DO MENU INICIAL =====
// Botão que inicia o jogo
const btnStart = document.getElementById("btnStart");
// Mensagem de boas-vindas do jogo
const msgStart = document.getElementById("msgStart");
// Controla se o jogo foi iniciado (para evitar iniciar múltiplas vezes)
let jogoIniciado = false;

// ===== CONFIGURAÇÃO DE ÁUDIO =====
// Cria um objeto de áudio para a música de fundo
let musicaFundo = new Audio("./assets/dancing_robots.mp3");
// Faz a música repetir infinitamente
musicaFundo.loop = true;
// Define o volume para 50% (varia de 0 a 1)
musicaFundo.volume = 0.5;

// Função para iniciar a música de fundo
function iniciarMusica() {
    // Toca a música. O catch evita erros se o navegador bloquear autoplay
    musicaFundo.play().catch(() => {});
}

// ===== EVENTO DO BOTÃO START =====
// Quando o jogador clica no botão START:
btnStart.addEventListener("click", () => {
    btnStart.style.display = "none";     // Esconde o botão START
    msgStart.style.display = "none";     // Esconde a mensagem inicial
    jogoIniciado = true;                 // Marca que o jogo foi iniciado
    jogoAtivo = true;                    // Ativa a lógica do jogo
    iniciarMusica();                     // Toca a música de fundo
    animacao();                          // Inicia o loop principal do jogo
});

// ===== BOTÃO DE MUTAR =====
// Objeto que representa o botão de mute na tela
let botaoMute = {
    x: 240,         // Posição X do botão (à direita da barra de vida)
    y: 15,          // Posição Y do botão
    largura: 30,    // Largura da área clicável
    altura: 30,     // Altura da área clicável
    mutado: false,  // Estado atual (muted ou não)

    // Função para desenhar o botão na tela
    desenha: function () {
        ctx.fillStyle = "white";                    // Cor do texto
        ctx.font = "24px Arial";                   // Fonte do texto
        // Mostra ícone de mudo ou som alto dependendo do estado
        ctx.fillText(this.mutado ? "🔇" : "🔊", this.x, this.y + 25);
    },

    // Função que verifica se o botão foi clicado
    clicar: function (x, y) {
        // Verifica se as coordenadas do clique estão dentro do botão
        if (x >= this.x && x <= this.x + this.largura &&
            y >= this.y && y <= this.y + this.altura) {
            // Inverte o estado de mudo
            this.mutado = !this.mutado;
            // Aplica o mute na música de fundo
            musicaFundo.muted = this.mutado;
        }
    },
};

// ===== CONFIGURAÇÕES GERAIS DO JOGO =====
let gravidade = 1.2;        // Força da gravidade (aceleração para baixo)
let forcaPulo = -18;        // Força do pulo (negativa porque Y cresce para baixo)
let noChao = false;         // Controla se o robô está no chão
let vel = 6;                // Velocidade horizontal do robô
let pontuacao = 0;          // Pontuação do jogador
let jogoAtivo = true;       // Controla se o jogo está rodando
// Objeto que controla as teclas de movimento pressionadas
let movendo = { esquerda: false, direita: false };
let podeAtirar = true;      // Controla se o robô pode atirar

// O que essa linha do Robo faz:



// ===== PERSONAGEM PRINCIPAL (ROBÔ) =====
let robo = {
    // Posição e física
    x: 100,     // Posição horizontal inicial
    y: 650,     // Posição vertical inicial
    vy: 0,      // Velocidade vertical (para pulos e gravidade)
    vida: 100,  // Vida atual do robô (0-100)
    
    // Dimensões
    width: 80,  // Largura do sprite
    heigth: 90, // Altura do sprite
    
    // Sistema de dano visual
    danoTimer: 0,   // Timer para efeito visual de dano
    
    // Hitbox para colisões (área menor que o sprite)
    hitbox: { 
        xOffset: 20,    // Menos largura nas laterais
        yOffset: 40,    // Começa mais abaixo no sprite
        width: 40,      // Hitbox mais estreita
        height: 40      // Hitbox mais baixa
    },
    
    // Sprites do robô
    imgParado: new Image(),     // Imagem quando parado
    imgCorrendo: new Image(),   // Imagem quando correndo
    imgMorto: new Image(),      // Imagem quando morto
    imgAtirando: new Image(),   // Imagem quando atirando
    imagemAtual: null,          // Imagem sendo exibida atualmente
    
    // Direção do robô
    viradoEsquerda: false,      // true = virado pra esquerda, false = direita

    // Função para desenhar o robô na tela
    desenha: function () {
        // Salva o estado atual do canvas (para restaurar depois)
        ctx.save();
        
        // Se o robô está virado para esquerda, espelha a imagem
        if (this.viradoEsquerda) ctx.scale(-1, 1);

        let img = this.imagemAtual;
        
        // Desenha o robô na posição correta (considerando se está espelhado)
        if (this.viradoEsquerda)
            ctx.drawImage(img, -this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);
        else
            ctx.drawImage(img, this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);

        // Efeito visual de dano (vermelho piscando)
        if (this.danoTimer > 0) {
            // Modo de composição para sobrepor cor vermelha
            ctx.globalCompositeOperation = "source-atop";
            ctx.fillStyle = "rgba(255,0,0,0.35)";  // Vermelho semi-transparente
            
            // Preenche a área do robô com vermelho
            if (this.viradoEsquerda)
                ctx.fillRect(-this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);
            else
                ctx.fillRect(this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);
            
            // Volta ao modo de composição normal
            ctx.globalCompositeOperation = "source-over";
            // Reduz o timer do efeito de dano
            this.danoTimer--;
        }

        // Restaura o estado original do canvas
        ctx.restore();
    },

    // Função que retorna a hitbox atual do robô para colisões
    getHitbox: function () {
        return {
            left: this.x - this.width / 2 + this.hitbox.xOffset,
            right: this.x - this.width / 2 + this.hitbox.xOffset + this.hitbox.width,
            top: this.y - this.heigth / 2 + this.hitbox.yOffset,
            bottom: this.y - this.heigth / 2 + this.hitbox.yOffset + this.hitbox.height,
        };
    }
};

// ===== CARREGAMENTO DOS SPRITES DO ROBÔ =====
robo.imgParado.src = "./assets/robot-idle.png";
robo.imgCorrendo.src = "./assets/robot-run-png-defato.png";
robo.imgMorto.src = "./assets/robo_dano.png";
robo.imgAtirando.src = "./assets/robozinho_tuc.png";
robo.imagemAtual = robo.imgParado;  // Começa com a imagem parado

// ===== PLATAFORMA (CHÃO) =====
let plataforma = { 
    x: 0, 
    y: canvas.height - 120,  // Posição Y (120 pixels acima do fundo)
    width: canvas.width,     // Largura igual à tela
    height: 40               // Altura da plataforma
};

// Função para desenhar a plataforma
function desenharPlataforma() {
    ctx.fillStyle = "#00000000";  // Cor transparente (plataforma invisível)
    ctx.fillRect(plataforma.x, plataforma.y, plataforma.width, plataforma.height);
}

//henrik
//luigi
// ===== SISTEMA DE RAIOS (ATAQUES DAS NUVENS) =====
const raioImg = new Image();  // Imagem do raio
raioImg.src = "./assets/raio.png";
let raios = [];  // Array que armazena todos os raios ativos

// Função para criar um novo raio
function criarRaio(xInicial, yInicial) {
    return {
        x: xInicial,        // Posição X inicial
        y: yInicial,        // Posição Y inicial
        largura: 75,        // Largura do raio
        altura: 75,         // Altura do raio
        velocidade: 7,      // Velocidade de queda
        ativo: true,        // Se o raio está ativo

        // Função para mover o raio
        mover: function () {
            if (!jogoAtivo) return;  // Não move se jogo não está ativo
            
            // Move o raio para baixo
            this.y += this.velocidade;

            // Remove raio se atingir a plataforma
            if (this.y + this.altura >= plataforma.y) {
                this.ativo = false;
                return;
            }
            let raioLeft = this.x - this.largura / 2;
            let raioRight = this.x + this.largura / 2;
            let raioTop = this.y;
            let raioBottom = this.y + this.altura;
            // Verifica colisão com o robô
            let hb = robo.getHitbox();  // Pega a hitbox do robô
            if (raioLeft < hb.right && raioRight > hb.left && 
               raioTop < hb.bottom && raioBottom > hb.top) {
                this.ativo = false;     // Remove o raio
                robo.vida -= 20;        // Tira 20 de vida do robô
                robo.danoTimer = 10;    // Ativa efeito visual de dano
                // Se vida chegar a zero, chama função de morte
                if (robo.vida <= 0 && jogoAtivo) morrerRobo();
            }
        },
        
        // Função para desenhar o raio
        desenha: function () {
            ctx.drawImage(raioImg, this.x - this.largura / 2, this.y, this.largura, this.altura);
        }
    };
}

// ===== SISTEMA DE NUVENS (INIMIGOS) =====
// Função para criar uma nova nuvem inimiga
function criarNuvem(xInicial, yInicial, velocidade, sprite, direcao) {
    let nuvem = {
        x: xInicial,        // Posição X inicial
        y: yInicial,        // Posição Y inicial
        largura: 250,       // Largura da nuvem
        altura: 175,        // Altura da nuvem
        img: new Image(),   // Imagem da nuvem
        velocidadeX: velocidade,  // Velocidade horizontal
        direcao: direcao,   // Direção do movimento ("esquerda" ou "direita")
        vida: 4,            // Vida da nuvem (quantos tiros leva para morrer)
        ativa: true,        // Se a nuvem está ativa
        danoTimer: 0,       // Timer para efeito visual de dano
        tempoProximoRaio: Math.random() * 200 + 150,  // Tempo até próximo raio
        
        // NOVO: Propriedade para movimento vertical simples
        velocidadeVertical: 0.4,    // Velocidade do movimento para cima/baixo
        indoParaCima: true,         // Direção do movimento vertical

        // Função para mover a nuvem - AGORA SIMPLIFICADA
        mover: function () {
            if (!this.ativa || !jogoAtivo) return;  // Só move se ativa e jogo ativo
            
            // Move na direção horizontal definida
            this.x += this.direcao === "esquerda" ? -this.velocidadeX : this.velocidadeX;
            
            // MOVIMENTO VERTICAL SIMPLES: Alterna entre subir e descer
            if (this.indoParaCima) {
                this.y -= this.velocidadeVertical;  // Move para cima
            } else {
                this.y += this.velocidadeVertical;  // Move para baixo
            }
            
            // Inverte a direção quando chega nos limites
            if (this.y <= 30) {
                this.indoParaCima = false;  // Chegou no topo, começa a descer
            } else if (this.y >= 90) {
                this.indoParaCima = true;   // Chegou embaixo, começa a subir
            }

            // Se saiu da tela, reseta a posição
            if ((this.direcao === "esquerda" && this.x + this.largura < 0) ||
                (this.direcao === "direita" && this.x > canvas.width + this.largura))
                this.resetarPosicao();

            // Contador para lançar raios
            this.tempoProximoRaio--;
            if (this.tempoProximoRaio <= 0) {
                // Cria novo raio no centro da nuvem
                raios.push(criarRaio(this.x + this.largura / 2, this.y + this.altura / 2));
                // Define tempo aleatório para próximo raio
                this.tempoProximoRaio = Math.random() * 100 + 50;
            }

            // Atualiza timer de efeito de dano
            if (this.danoTimer > 0) this.danoTimer--;
        },

        // Função para resetar a posição da nuvem
        resetarPosicao: function () {
            // Reposiciona fora da tela, na direção oposta
            this.x = this.direcao === "esquerda"
                ? canvas.width + Math.random() * 400
                : -this.largura - Math.random() * 400;
            this.y = 30 + Math.random() * 60;  // Posição Y aleatória
            this.vida = 4;                     // Restaura vida
            this.ativa = true;                 // Reativa a nuvem
            this.danoTimer = 0;                // Reseta efeito de dano
            
            // NOVO: Reseta o movimento vertical também
            this.indoParaCima = Math.random() > 0.5;  // Direção aleatória ao resetar
        },

        // Função para desenhar a nuvem (inalterada)
        desenha: function () {
            if (!this.ativa) return;  // Só desenha se estiver ativa
            
            ctx.save();
            // Desenha a imagem da nuvem
            ctx.drawImage(this.img, this.x, this.y, this.largura, this.altura);
            
            // Efeito visual de dano (vermelho piscando)
            if (this.danoTimer > 0) {
                ctx.globalCompositeOperation = "source-atop";
                ctx.fillStyle = "rgba(255,0,0,0.35)";
                ctx.fillRect(this.x, this.y, this.largura, this.altura);
                ctx.globalCompositeOperation = "source-over";
            }
            ctx.restore();
        },

        // Função chamada quando a nuvem leva dano (inalterada)
        receberDano: function () {
            this.vida--;            // Reduz vida
            this.danoTimer = 10;    // Ativa efeito visual
            // Se vida chegar a zero, morre
            if (this.vida <= 0) this.morrer();
        },

        // Função chamada quando a nuvem morre (inalterada)
        morrer: function () {
            this.ativa = false;     // Desativa a nuvem
            pontuacao += 5;         // Adiciona pontos
            
            // Cria partículas de explosão
            for (let i = 0; i < 20; i++) {
                particulas.push({
                    x: this.x + this.largura / 2,
                    y: this.y + this.altura / 2,
                    vx: (Math.random() - 0.5) * 6,  // Velocidade X aleatória
                    vy: (Math.random() - 0.5) * 6,  // Velocidade Y aleatória
                    vida: 30,                       // Tempo de vida da partícula
                    cor: "rgba(255,200,0,1)"        // Cor amarela
                });
            }
            
            // Reseta a nuvem após 1.5 segundos
            setTimeout(() => this.resetarPosicao(), 1500);
        }
    };
    nuvem.img.src = sprite;  // Define a imagem da nuvem
    return nuvem;
}
// Arrays para gerenciar todas as nuvens
let todasNuvens = [];    // Todas as nuvens criadas
let nuvensAtivas = [];   // Nuvens que estão ativas no momento

// Função para gerar as nuvens iniciais do jogo
function gerarNuvensIniciais() {
    todasNuvens = [];
    // Cria 8 nuvens
    for (let i = 0; i < 8; i++) {
        // Alterna entre os dois sprites de nuvem
        let sprite = i % 2 === 0 ? "./assets/nuvem1.png" : "./assets/nuvem2.png";
        // Direção aleatória
        let direcao = Math.random() > 0.5 ? "esquerda" : "direita";
        // Posição inicial fora da tela
        let xInicial = direcao === "esquerda" 
            ? canvas.width + Math.random() * 400 
            : -220 - Math.random() * 400;
        // Cria nuvem com velocidade aleatória
        todasNuvens.push(criarNuvem(
            xInicial, 
            40 + Math.random() * 60, 
            1.2 + Math.random() * 0.6, 
            sprite, 
            direcao
        ));
    }
    // Começa com 6 nuvens ativas
    nuvensAtivas = todasNuvens.slice(0, 7);
}
// Chama a função para gerar nuvens quando o jogo inicia
gerarNuvensIniciais();
//luigi

//eu
//////////////////////////////////////////
// ===== SISTEMA DE DIFICULDADE PROGRESSIVA =====
let tempoDecorrido = 0;              // Contador de frames
let intervaloDificuldade = 600;      // A cada ~10 segundos (60 FPS * 10)
let maxNuvensAtivas = 8;             // Número máximo de nuvens ativas

// Função que aumenta a dificuldade com o tempo
function atualizarDificuldade() {
    if (!jogoAtivo) return;  // Só atualiza se jogo está ativo
    
    tempoDecorrido++;  // Incrementa o contador de tempo

    // A cada intervalo de dificuldade:
    if (tempoDecorrido % intervaloDificuldade === 0) {
        // Aumenta número máximo de nuvens ativas
        if (maxNuvensAtivas < todasNuvens.length) {
            maxNuvensAtivas++;
            nuvensAtivas = todasNuvens.slice(0, maxNuvensAtivas);
        }

        // Aumenta velocidade de todas as nuvens
        todasNuvens.forEach(n => n.velocidadeX += 0.2);
    }
}

// ===== SISTEMA DE TIROS DO ROBÔ =====
const imgTiro = new Image();  // Imagem do tiro
imgTiro.src = "./assets/bola_energia.png";
let tiros = [];  // Array que armazena todos os tiros ativos


// Função para criar um novo tiro
function criarTiro() {
    return {
        x: robo.x,                              // Posição X (mesma do robô)
        y: robo.y - robo.heigth / 2 - 10,      // Posição Y (acima do robô)
        largura: 20,                            // Largura do tiro
        altura: 20,                             // Altura do tiro
        velocidade: -10,                        // Velocidade (negativa = pra cima)
        ativo: true,                            // Se o tiro está ativo

        // Função para mover o tiro
        mover: function () {
            if (!jogoAtivo) return;  // Só move se jogo ativo
            
            this.y += this.velocidade;  // Move o tiro para cima
            
            // Remove tiro se sair da tela (pelo topo)
            if (this.y + this.altura < 0) this.ativo = false;

            // Verifica colisão com nuvens
            nuvensAtivas.forEach((nuvem) => {
                if (!nuvem.ativa) return;  // Só verifica nuvens ativas
                
                // Define hitbox da nuvem (área de colisão)
                let hb = {
                    x: nuvem.x + nuvem.largura * 0.2,
                    y: nuvem.y + nuvem.altura * 0.2,
                    largura: nuvem.largura * 0.8,
                    altura: nuvem.altura * 0.3
                };

                // Calcula bordas do tiro
                let tiroLeft = this.x - this.largura / 2;
                let tiroRight = this.x + this.largura / 2;
                let tiroTop = this.y;
                let tiroBottom = this.y + this.altura;

                // Verifica se tiro colidiu com nuvem
                if (tiroLeft < hb.x + hb.largura && tiroRight > hb.x &&
                    tiroTop < hb.y + hb.altura && tiroBottom > hb.y) {
                    this.ativo = false;      // Remove o tiro
                    nuvem.receberDano();     // Aplica dano na nuvem
                }
            });
        },
        
        // Função para desenhar o tiro
        desenha: function () {
            ctx.drawImage(imgTiro, this.x - this.largura / 2, this.y, this.largura, this.altura);
        }
    };
}

// ===== SISTEMA DE PARTÍCULAS (EFEITOS VISUAIS) =====
let particulas = [];  // Array que armazena todas as partículas

// Função para limitar o número de partículas (evitar lentidão)
function limitarParticulas() {
    const limite = 800;  // Número máximo de partículas
    
    // Se excedeu o limite, remove as partículas mais antigas
    if (particulas.length > limite) 
        particulas.splice(0, particulas.length - limite);
}

// ===== SISTEMA DE MORTE E REINÍCIO =====

// Função chamada quando o robô morre
function morrerRobo() {
    jogoAtivo = false;                // Para o jogo
    robo.vida = 0;                    // Define vida como zero
    robo.imagemAtual = robo.imgMorto; // Muda sprite para morto
    raios = [];                       // Limpa todos os raios
    tiros = [];                       // Limpa todos os tiros
    particulas = [];                  // Limpa todas as partículas
    nuvensAtivas = [];                // Remove todas as nuvens
}

// Função para reiniciar o jogo completamente
function reiniciarJogo() {
    robo.vida = 100;                  // Restaura vida
    robo.imagemAtual = robo.imgParado; // Volta para sprite parado
    robo.x = 100;                     // Posição X inicial
    robo.y = 605;                     // Posição Y inicial
    pontuacao = 0;                    // Zera pontuação
    gerarNuvensIniciais();            // Recria as nuvens
    raios = [];                       // Limpa raios
    tiros = [];                       // Limpa tiros
    particulas = [];                  // Limpa partículas
    tempoDecorrido = 0;               // Reseta timer de dificuldade
    maxNuvensAtivas = 5;              // Volta dificuldade inicial
    jogoAtivo = true;                 // Reativa o jogo
}

// ===== SISTEMA DE FÍSICA DO ROBÔ =====
function atualizarPosicao() {
    if (!jogoAtivo) return;  // Só atualiza se jogo ativo
    
    // MOVIMENTO HORIZONTAL
    if (movendo.esquerda) {
        robo.x -= vel;                   // Move para esquerda
        robo.viradoEsquerda = true;      // Vira robô para esquerda
    }
    if (movendo.direita) {
        robo.x += vel;                   // Move para direita
        robo.viradoEsquerda = false;     // Vira robô para direita
    }

    // FÍSICA VERTICAL (GRAVIDADE)
    robo.vy += gravidade;  // Aplica gravidade (aumenta velocidade pra baixo)
    robo.y += robo.vy;     // Atualiza posição vertical
    
    noChao = false;  // Assume que não está no chão

    // VERIFICA COLISÃO COM O CHÃO
    if (robo.y + robo.heigth / 2 >= plataforma.y && robo.vy >= 0) {
        robo.y = plataforma.y - robo.heigth / 2;  // Coloca em cima da plataforma
        robo.vy = 0;                              // Para a velocidade vertical
        noChao = true;                            // Marca que está no chão
    }

    // LIMITES DA TELA (impede que robô saia pelos lados)
    if (robo.x < robo.width / 2) robo.x = robo.width / 2;  // Limite esquerdo
    if (robo.x > canvas.width - robo.width / 2) 
        robo.x = canvas.width - robo.width / 2;            // Limite direito
}
//eu
////////////////////////////////////////////////

//luigi
// ===== LOOP PRINCIPAL DO JOGO =====
function animacao() {
    // LIMPA A TELA (prepara para novo frame)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // ATUALIZA DIFICULDADE (aumenta com o tempo)
    atualizarDificuldade();
    
    // DESENHA PLATAFORMA
    desenharPlataforma();

    // ATUALIZA E DESENHA NUVENS
    nuvensAtivas.forEach((n) => { 
        n.mover();    // Move cada nuvem
        n.desenha();  // Desenha cada nuvem
    });

    // ATUALIZA E DESENHA RAIOS (apenas os ativos)
    raios.forEach((r) => r.ativo && (r.mover(), r.desenha()));
    // Remove raios inativos do array
    raios = raios.filter((r) => r.ativo);

    // ATUALIZA E DESENHA TIROS (apenas os ativos)
    tiros.forEach((t) => t.ativo && (t.mover(), t.desenha()));
    // Remove tiros inativos do array
    tiros = tiros.filter((t) => t.ativo);

    // ATUALIZA E DESENHA PARTÍCULAS
    particulas.forEach((p) => {
        p.x += p.vx;        // Move horizontalmente
        p.y += p.vy;        // Move verticalmente
        p.vida--;           // Reduz tempo de vida
        
        // Cor da partícula (fica mais transparente conforme morre)
        ctx.fillStyle = p.cor || "rgba(255,255,0," + Math.max(0, p.vida / 30) + ")";
        ctx.fillRect(p.x, p.y, 4, 4);  // Desenha partícula quadrada
    });
    // Remove partículas mortas
    particulas = particulas.filter((p) => p.vida > 0);
    // Limita número de partículas (performance)
    limitarParticulas();

    // ATUALIZA ROBÔ (se jogo ativo)
    if (jogoAtivo) {
        atualizarPosicao();  // Atualiza posição e física
        
        // ANIMAÇÕES DO ROBÔ
        if (movendo.esquerda || movendo.direita) 
            robo.imagemAtual = robo.imgCorrendo;    // Se movendo: correndo
        else if (robo.imagemAtual !== robo.imgAtirando) 
            robo.imagemAtual = robo.imgParado;      // Se parado: parado
    }

    // DESENHA O ROBÔ
    robo.desenha();

    // ===== INTERFACE DO USUÁRIO (HUD) =====

    // BARRA DE VIDA
    let larguraMax = 200;  // Largura máxima da barra
    let vidaPerc = Math.max(0, Math.min(1, robo.vida / 100));  // Porcentagem de vida (0-1)
    
    // Define cor baseada na vida
    let cor = vidaPerc > 0.6 ? "lime" : vidaPerc > 0.3 ? "yellow" : "red";
    
    // Fundo da barra (cinza)
    ctx.fillStyle = "gray";
    ctx.fillRect(30, 20, larguraMax, 20);
    
    // Vida atual (cor que muda)
    ctx.fillStyle = cor;
    ctx.fillRect(30, 20, larguraMax * vidaPerc, 20);
    
    // Borda da barra
    ctx.strokeStyle = "black";
    ctx.strokeRect(30, 20, larguraMax, 20);

    // BOTÃO DE MUTE
    botaoMute.desenha();

    // PONTUAÇÃO
    ctx.font = "bold 24px 'Press Start 2P', cursive";
    ctx.fillStyle = "#00d9ffff";
    ctx.shadowColor = "#006effff";  // Cor da sombra
    ctx.shadowBlur = 8;             // Intensidade da sombra
    ctx.textAlign = "right";        // Alinha texto à direita
    ctx.fillText("PONTOS: " + pontuacao, canvas.width - 40, 45);
    ctx.shadowBlur = 0;             // Remove sombra
    ctx.textAlign = "left";         // Volta alinhamento padrão

    // TELA DE GAME OVER
    if (!jogoAtivo) {
        // FUNDO ESCURO SEMI-TRANSPARENTE
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // TEXTO "GAME OVER"
        ctx.fillStyle = "white";
        ctx.font = "bold 60px Arial";
        let textoGameOver = "GAME OVER";
        // Calcula largura do texto para centralizar
        let larguraTextoGO = ctx.measureText(textoGameOver).width;
        ctx.fillText(textoGameOver, (canvas.width - larguraTextoGO) / 2, canvas.height / 2 - 80);

        // PONTUAÇÃO FINAL
        ctx.fillStyle = "#00ffff";
        ctx.font = "bold 36px Arial";
        let textoPontuacao = `SUA PONTUAÇÃO: ${pontuacao}`;
        let larguraPontuacao = ctx.measureText(textoPontuacao).width;
        ctx.fillText(textoPontuacao, (canvas.width - larguraPontuacao) / 2, canvas.height / 2 - 20);

        // INSTRUÇÃO PARA REINICIAR
        ctx.fillStyle = "yellow";
        ctx.font = "30px Arial";
        let textoReiniciar = "Pressione R para reiniciar";
        let larguraTextoReiniciar = ctx.measureText(textoReiniciar).width;
        ctx.fillText(textoReiniciar, (canvas.width - larguraTextoReiniciar) / 2, canvas.height / 2 + 50);
    }

    // CHAMA PRÓXIMO FRAME (cria o loop de animação)
    requestAnimationFrame(animacao);
}

// ===== SISTEMA DE CONTROLES =====
let espacoPressionado = false;  // Controla se espaço está pressionado

// EVENTO QUANDO TECLA É PRESSIONADA
document.addEventListener("keydown", (e) => {
    // REINICIAR JOGO (funciona mesmo com jogo inativo)
    if (!jogoAtivo && e.key.toLowerCase() === "r") {
        reiniciarJogo();
        return;
    }
    
    // Ignora outras teclas se jogo não está ativo
    if (!jogoAtivo) return;

    // CONTROLES DE MOVIMENTO
    if (e.key === "ArrowLeft") movendo.esquerda = true;
    if (e.key === "ArrowRight") movendo.direita = true;
    
    // PULAR (só funciona se estiver no chão)
    if (e.key === "ArrowUp" && noChao) { 
        robo.vy = forcaPulo;  // Aplica força do pulo
        noChao = false;       // Marca que não está mais no chão
    }

    // ATIRAR 
    if (e.code === "Space" && !espacoPressionado) {
        espacoPressionado = true;  // Marca que espaço está pressionado
        
        // CRIA NOVO TIRO
        tiros.push(criarTiro());

        // CRIA PARTÍCULAS DO TIRO (efeito visual)
        for (let i = 0; i < 10; i++) {
            particulas.push({
                x: robo.x,
                y: robo.y - robo.heigth / 2,
                vx: (Math.random() - 0.5) * 4,  // Velocidade X aleatória
                vy: -Math.random() * 4 - 1,      // Velocidade Y (pra cima)
                vida: 20,                        // Tempo de vida
                cor: "rgba(250, 253, 40, 1)"     // Cor amarela
            });
        }

        // MUDA ANIMAÇÃO PARA ATIRANDO
        robo.imagemAtual = robo.imgAtirando;
        
        // VOLTA PARA ANIMAÇÃO NORMAL APÓS 120ms
        setTimeout(() => {
            if (jogoAtivo && robo.imagemAtual === robo.imgAtirando)
                robo.imagemAtual = movendo.esquerda || movendo.direita 
                    ? robo.imgCorrendo 
                    : robo.imgParado;
        }, 120);
    }
});

// EVENTO QUANDO TECLA É SOLTA
document.addEventListener("keyup", (e) => {
    // PARA MOVIMENTO QUANDO SOLTA AS TECLAS
    if (e.key === "ArrowLeft") movendo.esquerda = false;
    if (e.key === "ArrowRight") movendo.direita = false;

    // LIBERA O CONTROLE DE TIRO QUANDO SOLTA ESPAÇO
    if (e.code === "Space") espacoPressionado = false;
});

// ===== CONTROLE DO BOTÃO MUTE =====
canvas.addEventListener("click", (e) => {
    // Converte coordenadas do mouse para coordenadas do canvas
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    // Verifica se clicou no botão de mute
    botaoMute.clicar(x, y);
});

// O jogo inicia quando o botão START é clicado
// A função animacao() será chamada pelo evento do botão START