/* =========================================================
   PROJETO INTEGRADOR
   JavaScript de acessibilidade e interação
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const body = document.body;

const botaoTema = document.getElementById("tema");

const botaoFonteMaior = document.getElementById("fonteMaior");

const botaoFonteNormal = document.getElementById("fonteNormal");

const botaoLer = document.getElementById("ler");

const botaoPausar = document.getElementById("pausar");

const botaoContinuar = document.getElementById("continuar");

const botaoParar = document.getElementById("parar");

const statusLeitor = document.getElementById("statusLeitor");

const botaoTopo = document.getElementById("voltarTopo");


/* =========================================================
   TEMA CLARO / ESCURO
========================================================= */

const temaSalvo = localStorage.getItem("tema");


function atualizarBotaoTema() {

    if (body.classList.contains("dark")) {

        botaoTema.textContent = "☀️ Modo Claro";

        botaoTema.setAttribute(
            "aria-label",
            "Ativar modo claro"
        );

    } else {

        botaoTema.textContent = "🌙 Modo Escuro";

        botaoTema.setAttribute(
            "aria-label",
            "Ativar modo escuro"
        );

    }

}


if (temaSalvo === "escuro") {

    body.classList.add("dark");

}


atualizarBotaoTema();


botaoTema.addEventListener("click", function () {

    body.classList.toggle("dark");

    const modoEscuroAtivo =
        body.classList.contains("dark");


    localStorage.setItem(
        "tema",
        modoEscuroAtivo ? "escuro" : "claro"
    );


    atualizarBotaoTema();

});


/* =========================================================
   TAMANHO DA FONTE
========================================================= */

let tamanhoFonte =
    Number(localStorage.getItem("fonte")) || 20;


const TAMANHO_MINIMO = 16;

const TAMANHO_MAXIMO = 32;

const TAMANHO_PADRAO = 20;


function atualizarFonte() {

    tamanhoFonte = Math.max(
        TAMANHO_MINIMO,
        Math.min(TAMANHO_MAXIMO, tamanhoFonte)
    );


    document.documentElement.style.setProperty(
        "--tamanho-texto",
        `${tamanhoFonte}px`
    );


    localStorage.setItem(
        "fonte",
        tamanhoFonte
    );


    atualizarBotoesFonte();

}


function atualizarBotoesFonte() {

    botaoFonteMaior.disabled =
        tamanhoFonte >= TAMANHO_MAXIMO;


    botaoFonteNormal.disabled =
        tamanhoFonte === TAMANHO_PADRAO;


    botaoFonteMaior.setAttribute(
        "aria-label",
        `Aumentar fonte. Tamanho atual: ${tamanhoFonte} pixels`
    );


    botaoFonteNormal.setAttribute(
        "aria-label",
        `Restaurar fonte para ${TAMANHO_PADRAO} pixels`
    );

}


atualizarFonte();


botaoFonteMaior.addEventListener("click", function () {

    if (tamanhoFonte < TAMANHO_MAXIMO) {

        tamanhoFonte += 2;

        atualizarFonte();

    }

});


botaoFonteNormal.addEventListener("click", function () {

    tamanhoFonte = TAMANHO_PADRAO;

    atualizarFonte();

});


/* =========================================================
   LEITOR DE VOZ
========================================================= */

let indiceAtual = 0;

let falando = false;

let pausado = false;

let falaAtual = null;


/*
    Selecionamos apenas os elementos que realmente
    possuem conteúdo textual importante para a leitura.
*/

const elementosLeitura = document.querySelectorAll(
    ".materia h3, " +
    ".materia h4, " +
    ".materia h5, " +
    ".materia p.texto, " +
    ".materia .tecnologia-card p, " +
    ".materia .lista-destaque li, " +
    ".materia .lista-prompts li, " +
    ".materia .lista-numerada li, " +
    ".materia .referencias li"
);


function limparDestaque() {

    elementosLeitura.forEach(function (elemento) {

        elemento.classList.remove("lendo");

    });

}


function atualizarStatus(mensagem) {

    if (statusLeitor) {

        statusLeitor.textContent = mensagem;

    }

}


function verificarSuporteVoz() {

    if (!("speechSynthesis" in window)) {

        atualizarStatus(
            "O leitor de voz não é compatível com este navegador."
        );

        botaoLer.disabled = true;

        botaoPausar.disabled = true;

        botaoContinuar.disabled = true;

        botaoParar.disabled = true;

        return false;

    }

    return true;

}


function rolarParaElemento(elemento) {

    if (!elemento) {
        return;
    }


    elemento.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function lerProximoElemento() {

    if (!falando) {

        return;

    }


    if (indiceAtual >= elementosLeitura.length) {

        limparDestaque();

        falando = false;

        pausado = false;

        indiceAtual = 0;

        falaAtual = null;

        atualizarStatus(
            "Leitura concluída. Clique em Ler para começar novamente."
        );

        return;

    }


    limparDestaque();


    const elemento =
        elementosLeitura[indiceAtual];


    elemento.classList.add("lendo");


    rolarParaElemento(elemento);


    const texto =
        elemento.innerText.trim();


    if (!texto) {

        indiceAtual++;

        lerProximoElemento();

        return;

    }


    falaAtual =
        new SpeechSynthesisUtterance(texto);


    falaAtual.lang = "pt-BR";

    falaAtual.rate = 0.95;

    falaAtual.pitch = 1;

    falaAtual.volume = 1;


    falaAtual.onstart = function () {

        atualizarStatus(
            `Lendo ${indiceAtual + 1} de ${elementosLeitura.length}...`
        );

    };


    falaAtual.onend = function () {

        indiceAtual++;

        if (falando) {

            lerProximoElemento();

        }

    };


    falaAtual.onerror = function (evento) {

        if (evento.error === "canceled") {

            return;

        }


        falando = false;

        pausado = false;

        limparDestaque();

        atualizarStatus(
            "Ocorreu um problema durante a leitura."
        );

    };


    window.speechSynthesis.speak(falaAtual);

}


/* =========================================================
   BOTÃO LER
========================================================= */

botaoLer.addEventListener("click", function () {

    if (!verificarSuporteVoz()) {

        return;

    }


    window.speechSynthesis.cancel();


    limparDestaque();


    indiceAtual = 0;

    falando = true;

    pausado = false;


    atualizarStatus(
        "Iniciando leitura..."
    );


    lerProximoElemento();

});


/* =========================================================
   BOTÃO PAUSAR
========================================================= */

botaoPausar.addEventListener("click", function () {

    if (
        !("speechSynthesis" in window) ||
        !window.speechSynthesis.speaking
    ) {

        atualizarStatus(
            "Não há uma leitura em andamento."
        );

        return;

    }


    window.speechSynthesis.pause();

    pausado = true;


    atualizarStatus(
        "Leitura pausada."
    );

});


/* =========================================================
   BOTÃO CONTINUAR
========================================================= */

botaoContinuar.addEventListener("click", function () {

    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    if (pausado) {

        window.speechSynthesis.resume();

        pausado = false;


        atualizarStatus(
            "Leitura continuada."
        );

        return;

    }


    atualizarStatus(
        "A leitura não está pausada."
    );

});


/* =========================================================
   BOTÃO PARAR
========================================================= */

botaoParar.addEventListener("click", function () {

    if ("speechSynthesis" in window) {

        window.speechSynthesis.cancel();

    }


    falando = false;

    pausado = false;

    indiceAtual = 0;

    falaAtual = null;


    limparDestaque();


    atualizarStatus(
        "Leitura interrompida."
    );

});


/* =========================================================
   NAVEGAÇÃO POR TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    function (evento) {

        /*
            Alt + 1 = Robótica
        */

        if (
            evento.altKey &&
            evento.key === "1"
        ) {

            evento.preventDefault();

            document
                .getElementById("robotica")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }


        /*
            Alt + 2 = Física
        */

        if (
            evento.altKey &&
            evento.key === "2"
        ) {

            evento.preventDefault();

            document
                .getElementById("fisica")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }


        /*
            Alt + M = Modo escuro
        */

        if (
            evento.altKey &&
            evento.key.toLowerCase() === "m"
        ) {

            evento.preventDefault();

            botaoTema.click();

        }


        /*
            Alt + L = Leitor
        */

        if (
            evento.altKey &&
            evento.key.toLowerCase() === "l"
        ) {

            evento.preventDefault();

            botaoLer.click();

        }


        /*
            Alt + P = Pausar
        */

        if (
            evento.altKey &&
            evento.key.toLowerCase() === "p"
        ) {

            evento.preventDefault();

            botaoPausar.click();

        }


        /*
            Esc = parar leitor
        */

        if (
            evento.key === "Escape" &&
            falando
        ) {

            botaoParar.click();

        }

    }
);


/* =========================================================
   BOTÃO VOLTAR AO TOPO
========================================================= */

function controlarBotaoTopo() {

    if (window.scrollY > 500) {

        botaoTopo.classList.add("visivel");

    } else {

        botaoTopo.classList.remove("visivel");

    }

}


window.addEventListener(
    "scroll",
    controlarBotaoTopo,
    {
        passive: true
    }
);


botaoTopo.addEventListener(
    "click",
    function () {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================================================
   INDICADOR DE SEÇÃO ATUAL
========================================================= */

const secoesMateria =
    document.querySelectorAll(".materia");


const botoesNavegacao =
    document.querySelectorAll(".botao-nav");


const observador =
    new IntersectionObserver(
        function (entradas) {

            entradas.forEach(
                function (entrada) {

                    if (!entrada.isIntersecting) {

                        return;

                    }


                    botoesNavegacao.forEach(
                        function (botao) {

                            botao.removeAttribute(
                                "aria-current"
                            );

                        }
                    );


                    const id =
                        entrada.target.id;


                    const botaoAtual =
                        document.querySelector(
                            `.botao-nav[href="#${id}"]`
                        );


                    if (botaoAtual) {

                        botaoAtual.setAttribute(
                            "aria-current",
                            "page"
                        );

                    }

                }
            );

        },
        {
            threshold: 0.25
        }
    );


secoesMateria.forEach(
    function (secao) {

        observador.observe(secao);

    }
);


/* =========================================================
   VERIFICAÇÃO DO LEITOR
========================================================= */

verificarSuporteVoz();


/* =========================================================
   MENSAGEM INICIAL
========================================================= */

console.log(
    "Projeto Integrador carregado com sucesso!"
);
