function novoElemento(tagName, className){
    const element = document.createElement(tagName);
    element.className = className;
    return element;
}

function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira');

    const borda = novoElemento('div', 'borda');
    const corpo = novoElemento('div', 'corpo');
    this.elemento.appendChild(reversa ? corpo : borda);
    this.elemento.appendChild(reversa ? borda : corpo);
    
    this.setAltura = altura => corpo.style.height = `${altura}px`;
}


// const b = new Barreira(true);
// b.setAltura(300);
// document.querySelector('[wm-flappy]').appendChild(b.elemento);

function ParDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras');

    this.superior = new Barreira(true);
    this.inferior = new Barreira(false);

    this.elemento.appendChild(this.superior.elemento);
    this.elemento.appendChild(this.inferior.elemento);


    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura);
        const alturaInferior = altura - abertura - alturaSuperior;
        this.superior.setAltura(alturaSuperior);
        this.inferior.setAltura(alturaInferior);
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth;

    this.sortearAbertura();
    this.setX(x);
}

// const b = new ParDeBarreiras(700, 200, 400);
// document.querySelector('[wm-flappy]').appendChild(b.elemento);

function Barreiras(altura, largura, abertura, espaco, notificarPonto, deslocamento){
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ];

    //const deslocamento = 3;
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento);


            //quando o elenmento sair da ??rea do jogo
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length);
                par.sortearAbertura();
            }

            const meio = largura /2;
            const cruzouOMeio = par.getX() + deslocamento >= meio 
                && par.getX() < meio;
            if(cruzouOMeio) notificarPonto();
        })
    }
}

function Passaro(alturaJogo){
    const audio = new Audio('sounds/swoosh.mp3');

    let voando = false;
    this.elemento = novoElemento('img', 'passaro');
    this.elemento.src = 'img/passaro.png';

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]);
    this.setY = y => this.elemento.style.bottom = `${y}px`;

    window.onkeydown =  e => voando = true;
    window.onkeyup = e => voando = false;

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5);
        const alturaMaxima = alturaJogo - this.elemento.clientWidth;

        //feature futura: bater no teto ou ch??o como colis??o
        if(novoY <= 0){
            this.setY(0);
        }else if(novoY >= alturaMaxima){
            this.setY(alturaMaxima);
        }else{
            this.setY(novoY);
            audio.play();
        }

        

    }

    this.setY(alturaJogo/ 2);

}

function Progresso(){
    const audio = new Audio('sounds/point.mp3');

    this.elemento = novoElemento('span', 'progresso');
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos;
        audio.play();
    }
    this.atualizarPontos(0);
    
}

/**
 * @description fun????o para verificar se dois elementos est??o sobrepostos
 * @param {HTMLElement} elementoA 
 * @param {HTMLElement} elementoB 
 * @returns {boolean} true para sobreposi????o e false para n??o
 */
function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left;
    
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top;

    return horizontal && vertical;

}

function colidiu(passaro, barreiras){
    let colidiu = false;
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu){
            const superior = parDeBarreiras.superior.elemento;
            const inferior = parDeBarreiras.inferior.elemento;
            colidiu = estaoSobrepostos(passaro.elemento, superior) 
                || estaoSobrepostos(passaro.elemento, inferior);
        }
    })
    return colidiu;
}


function FlappyBird(){
    const audioHit = new Audio('sounds/hit.mp3');
    const audioStart = new Audio('sounds/flappy-bird.mp3');
    
    let pontos = 0;

    //dificuldades
    const aberturaEntreParBarreiras = 200;
    const espacoEntreBarreiras = 400;
    const velocidadeJogo = 3;

    const temporizadorStart = 20;
    

    const areaDoJogo = document.querySelector('[wm-flappy]'); 
    const altura = areaDoJogo.clientHeight;
    const largura = areaDoJogo.clientWidth;

    const progresso = new Progresso();
    const barreiras = new Barreiras(
        altura, 
        largura, 
        aberturaEntreParBarreiras, 
        espacoEntreBarreiras, 
        () => progresso.atualizarPontos(++pontos),
        velocidadeJogo
    );
    const passaro = new Passaro(altura);

    areaDoJogo.appendChild(progresso.elemento);
    areaDoJogo.appendChild(passaro.elemento);
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento));
    
    
    this.start = (inicio) => {
        
        const temporizador = setInterval(() =>{
            
            barreiras.animar();
            passaro.animar();

            if(colidiu(passaro, barreiras)){
                audioHit.play();
                clearInterval(temporizador);
            }

        }, temporizadorStart);
        audioStart.play();
    }
    
}


new FlappyBird().start();
























