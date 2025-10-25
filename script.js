let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let robo = {
    x: 0,
    y: 150,
    img: new Image(),
    width: 65,
    heigth: 70,
    desenha: function(){
        this.img.src = "./assets/robot-png-defato.png"
        ctx.beginPath();
        ctx.drawImage(this.img, this.x - this.width, this.y - this.heigth, this.width, this.heigth);
        ctx.closePath();
    }
}

function animacao(){
    ctx.clearRect(0, 0, 700, 450);
    robo.desenha();
    requestAnimationFrame(animacao);
}
animacao();

document.addEventListener("keydown", function(evento){
    let tecla = evento.key;
    console.log(tecla);
    let vel = 20
    if(tecla == "ArrowUp"){
        robo.y -= vel;
    }
    if(tecla == "ArrowDown"){
        robo.y += vel;
    }

    if(tecla == "ArrowLeft"){
        robo.x -= vel;
    }

    if(tecla == "ArrowRight"){
        robo.x += vel;
    }

    robo.x = Math.max(robo.width, Math.min(canvas.width - robo.width, x));
    robo.y = Math.max(robo.heigth, Math.min(canvas.height - robo.heigth, y));
})
