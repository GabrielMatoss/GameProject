// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");

// let robo = {
//     x: 55,
//     y: 455,
//     img: new Image(),
//     width: 65,
//     heigth: 70,
//     desenha: function(){
//         this.img.src = "./assets/robot-png-defato.png"
//         ctx.beginPath();
//         ctx.drawImage(this.img, this.x - this.width, this.y - this.heigth, this.width, this.heigth);
//         ctx.closePath();
//     }
// }

// function animacao(){
//     ctx.clearRect(0, 0, 700, 450);
//     robo.desenha();
//     requestAnimationFrame(animacao);
// }
// animacao();

// document.addEventListener("keydown", function(evento){
//     let tecla = evento.key;
//     console.log(tecla);
//     let vel = 20
//     if(tecla == "ArrowUp"){
//         robo.y -= vel;
//     }
//     if(tecla == "ArrowDown"){
//         robo.y += vel;
//     }

//     if(tecla == "ArrowLeft"){
//         robo.x -= vel;
//     }

//     if(tecla == "ArrowRight"){
//         robo.x += vel;
//     }

//     robo.x = Math.max(robo.width, Math.min(canvas.width - robo.width, x));
//     robo.y = Math.max(robo.heigth, Math.min(canvas.height - robo.heigth, y));
// })
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let robo = {
    x: 55,
    y: 420, // 🔽 posição mais abaixo
    img: new Image(),
    width: 65,
    heigth: 70,
    desenha: function() {
        this.img.src = "./assets/robot-png-defato.png";
        ctx.drawImage(this.img, this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);
    }
};

// --- Configuração Principal ---
// --- Objeto Chão ---
// Não precisamos de "canvas2" nem "ctx2"

let chao = {
    // Posição x
    x: 0, 
    // O chão começa no topo (y=0) do canvas e desce até a altura total (y=450)
    // Para o chão ficar na PARTE DE BAIXO, seu 'y' deve ser:
    y: canvas.height - 50, // Ex: 450 (altura canvas) - 50 (altura chao) = 400
    
    // Largura e altura do chão
    width: canvas.width,   // Ocupa a largura inteira do canvas
    height: 50,
    
    cor: "#008000", // Uma cor (verde) para o chão

    // A função 'desenha' agora usa o 'ctx' principal
    desenha: function(){
        // Define a cor do preenchimento
        ctx.fillStyle = this.cor;
        
        // Desenha o retângulo do chão
        // ctx.rect(x, y, largura, altura)
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}


// Variáveis de movimento
let movendo = {
    cima: false,
    baixo: false,
    esquerda: false,
    direita: false
};

// Velocidade
let vel = 5;

function atualizarPosicao() {
    if (movendo.cima) robo.y -= vel;
    if (movendo.baixo) robo.y += vel;
    if (movendo.esquerda) robo.x -= vel;
    if (movendo.direita) robo.x += vel;

    // Colisões com as bordas
    if (robo.x < robo.width / 3) robo.x = robo.width / 3; // esquerda
    if (robo.x > canvas.width - robo.width / 3) robo.x = canvas.width - robo.width / 3; // direita
    if (robo.y < robo.heigth / 2) robo.y = robo.heigth / 2; // topo
    if (robo.y > canvas.height - robo.heigth / 2.5) robo.y = canvas.height - robo.heigth / 2.5; // base
}

function animacao() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    atualizarPosicao();
    chao.desenha();
    robo.desenha();
    requestAnimationFrame(animacao);
}
animacao();

// Detecta teclas pressionadas
document.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowUp") movendo.cima = true;
    if (evento.key === "ArrowDown") movendo.baixo = true;
    if (evento.key === "ArrowLeft") movendo.esquerda = true;
    if (evento.key === "ArrowRight") movendo.direita = true;
});

// Detecta quando as teclas são soltas
document.addEventListener("keyup", (evento) => {
    if (evento.key === "ArrowUp") movendo.cima = false;
    if (evento.key === "ArrowDown") movendo.baixo = false;
    if (evento.key === "ArrowLeft") movendo.esquerda = false;
    if (evento.key === "ArrowRight") movendo.direita = false;
});

// Código gerado inteiramente por I.A jagunço, use como parametro, quando adicionarmos imagens de fundo
// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");

// // --- 1. CARREGAR IMAGENS (SÓ UMA VEZ) ---
// // É melhor carregar as imagens aqui, fora das funções,
// // para o navegador não ficar carregando 60x por segundo.
// let roboImg = new Image();
// roboImg.src = "./assets/robot-png-defato.png";

// let chaoImg = new Image();
// // ✅ Troque "sua-imagem-chao.png" pelo nome do seu arquivo de chão
// chaoImg.src = "./assets/sua-imagem-chao.png"; 

// // --- Objeto Robô ---
// let robo = {
//     // ✅ PROBLEMA 2: Mudei o X de 55 para 100 (mais à direita)
//     x: 100, 
//     // ✅ PROBLEMA 1: Mudei o Y para 365.
//     // O chão está em 400. A altura do robô é 70.
//     // 400 - (70 / 2) = 365. Isso coloca o centro dele
//     // exatamente 35 pixels acima do chão.
//     y: 365, 
//     img: roboImg, // Usa a imagem que carregamos lá em cima
//     width: 65,
//     heigth: 70,
//     desenha: function() {
//         // A linha "this.img.src = ..." foi REMOVIDA daqui.
//         ctx.drawImage(this.img, this.x - this.width / 2, this.y - this.heigth / 2, this.width, this.heigth);
//     }
// };

// // --- Objeto Chão ---
// let chao = {
//     x: 0, 
//     y: canvas.height - 50, // Continua sendo 400
//     width: canvas.width,
//     height: 50,
//     img: chaoImg, // Usa a imagem do chão que carregamos
    
//     // ✅ PROBLEMA 3: Mudei o "desenha" para usar a imagem
//     desenha: function(){
//         // Vamos supor que sua imagem de chão (bloco) tenha 50px de largura
//         let larguraDoBloco = 50; 
        
//         // Um loop 'for' que desenha o bloco várias vezes, lado a lado
//         for (let x_bloco = 0; x_bloco < this.width; x_bloco += larguraDoBloco) {
//             // Desenha o bloco de imagem
//             ctx.drawImage(this.img, this.x + x_bloco, this.y, larguraDoBloco, this.height);
//         }
//     }
// }

// // --- Controles (Seu código, sem mudanças) ---
// let movendo = {
//     cima: false,
//     baixo: false,
//     esquerda: false,
//     direita: false
// };
// let vel = 5;

// // --- Loop Principal ---
// function atualizarPosicao() {
//     if (movendo.cima) robo.y -= vel;
//     if (movendo.baixo) robo.y += vel;
//     if (movendo.esquerda) robo.x -= vel;
//     if (movendo.direita) robo.x += vel;

//     // Colisões com as bordas
//     if (robo.x < robo.width / 3) robo.x = robo.width / 3; // esquerda
//     if (robo.x > canvas.width - robo.width / 3) robo.x = canvas.width - robo.width / 3; // direita
//     if (robo.y < robo.heigth / 2) robo.y = robo.heigth / 2; // topo
    
//     // ✅ COLISÃO COM O CHÃO (Corrigida)
//     // Se a base do robô (y + altura/2) passar do topo do chão (chao.y)...
//     if (robo.y + robo.heigth / 2 > chao.y) {
//         // ...trava o robô no lugar certo.
//         robo.y = chao.y - robo.heigth / 2;
//     }
// }

// function animacao() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     atualizarPosicao();
    
//     // Desenha o chão PRIMEIRO
//     chao.desenha();
//     // Desenha o robô DEPOIS (para ele ficar na frente)
//     robo.desenha();
    
//     requestAnimationFrame(animacao);
// }

// // Inicia o jogo
// animacao();

// // Detecta teclas pressionadas (Seu código, sem mudanças)
// document.addEventListener("keydown", (evento) => {
//     if (evento.key === "ArrowUp") movendo.cima = true;
//     if (evento.key === "ArrowDown") movendo.baixo = true;
//     if (evento.key === "ArrowLeft") movendo.esquerda = true;
//     if (evento.key === "ArrowRight") movendo.direita = true;
// });

// // Detecta quando as teclas são soltas (Seu código, sem mudanças)
// document.addEventListener("keyup", (evento) => {
//     if (evento.key === "ArrowUp") movendo.cima = false;
//     if (evento.key === "ArrowDown") movendo.baixo = false;
//     if (evento.key === "ArrowLeft") movendo.esquerda = false;
//     if (evento.key === "ArrowRight") movendo.direita = false;
// });