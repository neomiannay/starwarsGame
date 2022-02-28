"use strict";
let svg = d3.select("#svg1"); // on défini la balise SVG dans une variable pour que quand on l'appel, l'écrire soit plus court
// balise svg n°2 pour les vies du joueur
let svg2 = d3.select("#svg2");

function entierAlea(n) {
    return Math.floor(Math.random() * n);
}
// initialisation des variables
let compteur_vie = 4;
let score = 0;
let position = [];
let pause = false;
let loose = false;
let coordEnnemi = [];
let lazer_position = -9;
let lazer_coordEnnemis_green = [];
let lazer_enemi = -2;
let lazer_coordEnnemis_enemi = [];
let joueur_x = 0;
let joueur_y = 0;

// on met ces éléments avec le paramètre .hidden en true pour pouvoir les afficher plus tard
document.querySelector(".blur").hidden = true;
document.querySelector(".pause").hidden = true;
document.querySelector(".loose").hidden = true;

// création de la variable bestscore
let bestscore = parseInt(localStorage.getItem('Xwing'));
if (isNaN(bestscore)) {
    bestscore = 0;
}
// on appel la fonction de création du joueur
vaisseau_joueur();

// création des variables pour les afficher plus tard dans la page HTML
let scoreTEXT = d3.select(".score")
let finscore = d3.select(".fin-scoretxt")
let bestscoreTEXT = d3.select(".meilleurSCORE")

bestscoreTEXT.text(bestscore);
scoreTEXT.html("Score : " + score);
finscore.html(score)

// algo pour suppression d'éléments
function suppressionDansTableau(tableau, critere) {
    let suppression = false;
    for (let i = tableau.length - 1; i >= 0; i--) {
        if (critere(tableau[i])) {
            tableau.splice(i, 1);
            suppression = true;
        }
    }
    return suppression;
}
// algo pour calculer la distance entre 2 éléments
function distance(a, b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);

}
// variable correspondant à l'élément de mon vaisseau
let joueur = d3.select("#x-wing")

// fonction de création de mon joueur
function vaisseau_joueur() {
    svg.select('#jeu')
        .append("use")
        .attr("href", "#x-wing")
        .attr("class", "xwing")
    position_joueur();
}
//
// SUIVI DU VAISSEAU
function position_joueur() {
    d3.select(".xwing")
        .attr("x", position[0] - 3)
        .attr("y", position[1] + 5);
    joueur_x = position[0]
    joueur_y = position[1]
}
//
// BLOQUER LE VAISSEAU À 30px
svg.on("mousemove", function () {
    if (loose != true) {
        if (pause != true) {
            position = d3.pointer(event);

            if (position[0] > 30) {
                position[0] = 30
            }
            position_joueur();
            joueur = [{
                x: joueur_x,
                y: joueur_y
            }]
        }
    }
})

// pour mettre le jeu en pause et afficher des éléments
function JeuEnPause() {
    pause = true
    document.querySelector(".blur").hidden = false;
    document.querySelector(".pause").hidden = false;
}

function JeuPasEnPause() {}
window.addEventListener('blur', JeuEnPause);
window.addEventListener('focus', JeuPasEnPause);
//
//
//
// ON VÉRIFIE SI LA TOUCHE ESPACE À ÉTÉ PRESSÉE ET ON MONTRE DES ÉLÉMENTS OU NON
document.addEventListener('keyup', function (event) {

    if (event.keyCode == 32) {
        if (pause == true) {
            pause = false
            document.querySelector(".blur").hidden = true;
            document.querySelector(".pause").hidden = true;
        } else {
            pause = true
            document.querySelector(".blur").hidden = false;
            document.querySelector(".pause").hidden = false;
        }
    }
})
//
//
//
//
//
//
//
//
//
//
//
//
// PARTIE VAISSEAUX ENNEMIS
//
//
//
function update_ennemi() {

    let update =
        svg.select('#jeu')
        .selectAll(".actif")
        .data(coordEnnemi, d => d);
    update.exit() //transition de sortie
        .attr("class", "inactif")
        .remove();

    update.enter()
        .append("use")
        .attr("z-index", "2")
        .attr("href", "#tie_fighter")
        .attr("class", "actif");
    // .style("height", "10")
    // .style("width", "10")
    update_coordEnnemis_ennemi();
}
// fonction pour attribuer des coordEnnemionnées aux ennemis
function update_coordEnnemis_ennemi() {
    svg.select('#jeu')
        .selectAll(".actif")
        .attr("x", d => d.x)
        .attr("y", d => d.y);
}
// test pour savoir si un énemi atteint le vaisseau du joueur
function chute_en_cours(d) {
    return d.x > 40;
}
// initialement: update complète
update_ennemi();
//toutes les 10ms: les énemis se déplace un peu vers la droite
setInterval(function () {
    if (loose != true) {
        if (pause != true) {
            if (coordEnnemi.length == 0) return;
            coordEnnemi.forEach(function (d) {
                // d.vitesse+=2; //la vitesse augmente (accélération pendant la chute)
                if (score >= 700 && vit_ennemi == 900) {
                    d.x -= 0.6; //y augmente en fonction de la vitesse
                } else if (score >= 1500 ) {
                    d.x -= 0.7;
                } else if (score >= 3000){
                    d.x -= 1;
                } else {
                    d.x -= 0.4;
                }
            });

            // condition pour enlever une vie si un ennemi arrive sur le bord de la zone du joueur
            if (coordEnnemi.every(chute_en_cours))
                update_coordEnnemis_ennemi();
            else {
                coordEnnemi = coordEnnemi.filter(chute_en_cours);
                compteur_vie--
                update_ennemi()
                enleveVIE()
            }

            // pour augmenter la vitesse d'apparition des ennemis en fonction du score du joeur
            if (score >= 300 && vit_ennemi == 900) {
                stopinTennemi()
                vitesseDesEnnemi(700)
            }
            // if (score >= 1500 && vit_ennemi == 700) {
            //     stopinTennemi()
            //     vitesseDesEnnemi(400)
            // }

            // pour arreter le jeu quand le joueur n'a plus de vie
            if (compteur_vie <= 0) {
                loose = true
                document.querySelector(".blur").hidden = false;
                document.querySelector(".loose").hidden = false;
                finscore.html(score)
            } else {
                loose = false
                document.querySelector(".blur").hidden = true;
                document.querySelector(".loose").hidden = true;
            }
            update_coordEnnemis_ennemi();
        }
    }
}, 10);

//toutes les 900ms: un nouveau énemi est ajouté à droite
let inTennemi;
let vit_ennemi = 900;
//
function vitesseDesEnnemi(vitesse_ennemi) {
    vit_ennemi = vitesse_ennemi;
    inTennemi = setInterval(function () {
        if (loose != true) {
            if (pause != true) {
                // compteur++;
                coordEnnemi.push({
                    x: 150,
                    y: entierAlea(55) + 5,
                    vitesse: entierAlea(10) + 20
                }); // vitesse pour donner une distance de déplacement à x 
                // id:compteur
                update_ennemi();
            }
        }
    }, vitesse_ennemi);
}
//
vitesseDesEnnemi(900);
//
function stopinTennemi() {
    clearInterval(inTennemi)
}
//
//
//
//
//
//
//
//
//
//
//
//
// LAZER TIRÉS PAR LE JOUEUR
//
//
//
//
//
//
function update_lazergreen() {

    let update =
        svg.select('#jeu')
        .selectAll(".oui")
        .data(lazer_coordEnnemis_green, d => d)
    update.exit() //transition de sortie
        .attr("class", "non")
        .remove();
    update.enter()
        .append("use")
        .attr("z-index", "2")
        .attr("href", "#greenlazer")
        .attr("class", "oui");
    // .style("height", "10")
    // .style("width", "10")
    update_lazergreen_coordEnnemis();
}

function update_lazergreen_coordEnnemis() {
    svg.select('#jeu')
        .selectAll(".oui")
        .attr("x", d => d.x)
        .attr("y", d => d.y);
}

function chute(d) {
    return d.x < 150;
}

if (bestscore == NaN) {
    localStorage.setItem('Xwing', score)
}

setInterval(function () {
    if (loose != true) {
        if (pause != true) {
            if (lazer_coordEnnemis_green.length == 0) return;
            lazer_coordEnnemis_green.forEach(function (d) {
                d.x += 3;
            });

            // si contact avec ennemi alors le score augmente
            if (suppressionDansTableau(lazer_coordEnnemis_green, oui =>
                    suppressionDansTableau(coordEnnemi, actif => distance(oui, actif) < 10))) {

                score += 100
                scoreTEXT.html("Score : " + score)


                update_lazergreen()
                update_ennemi()
            } else {
                update_lazergreen_coordEnnemis()
            }


            mort()

            if (score > bestscore) {
                bestscore = score
                localStorage.setItem('Xwing', score)
            }

            if (lazer_coordEnnemis_green.every(chute))
                update_lazergreen_coordEnnemis();
            else {
                lazer_coordEnnemis_green = lazer_coordEnnemis_green.filter(chute);
                update_lazergreen();
            }
            update_lazergreen_coordEnnemis();
        }
    }
}, 10);
//
//
//
//
// MAGASIN
//
//
let compteurLvl = 0;
document.querySelector('.lazerLvlUp span').innerHTML = `Level : ${compteurLvl}`;

function notAvailable(e) {
    document.querySelector(e).style.border = '2px solid red';
    document.querySelector(e).style.color = 'red';
}

function Available(e) {
    document.querySelector(e).style.border = '2px solid greenyellow';
    document.querySelector(e).style.color = 'white';
}


if (score < 700) {
    document.querySelector('.lazerLvlUp p').style.border = '2px dotted white';
    document.querySelector('.lazerLvlUp p').style.color = 'white';
} else {
    document.querySelector('.lazerLvlUp p').classList.remove('hide');
}

if (score < 1500) {
    document.querySelector('.bomb p').style.border = '2px dotted white';
    document.querySelector('.bomb p').style.color = 'white';
} else {
    document.querySelector('.bomb p').classList.remove('hide');
}

document.addEventListener('keyup', function (event) {
    if (event.keyCode == 77) {
        if (score < 700) {
            notAvailable(`.lazerLvlUp p`);
        } else if (score >= 700 && vit_tir == 500 && compteurLvl == 0) {
            stopinTtir()
            vitesseDesTirs(400)
            document.querySelector('.lazerLvlUp p').classList.remove('hide');
            Available(`.lazerLvlUp p`);
            compteurLvl++;
            score -= 700;
            document.querySelector('.lazerLvlUp span').innerHTML = `Level : ${compteurLvl}`;
            document.querySelector('.lazerLvl').innerHTML = '1500 points';
        } else if (score >= 1500 && vit_tir == 400 && compteurLvl == 1) {
            stopinTtir()
            vitesseDesTirs(300)
            Available(`.lazerLvlUp p`);
            compteurLvl++;
            score -= 1500;
            document.querySelector('.lazerLvlUp span').innerHTML = `Level : ${compteurLvl}`;
            document.querySelector('.lazerLvl').innerHTML = '3000 points';
        }
            else if (score >= 3000 && vit_tir == 300 && compteurLvl == 2) {
                stopinTtir()
                vitesseDesTirs(200)
                Available(`.lazerLvlUp p`);
                compteurLvl++;
                score -= 3000;
                document.querySelector('.lazerLvlUp span').innerHTML = `Level : ${compteurLvl}`;
                document.querySelector('.lazerLvl').innerHTML = 'max level';
        }}

    if (event.keyCode == 80) {
        if ( score < 2000){
            notAvailable(`.bomb p`);
        } else{
            document.querySelector('.bomb p').classList.remove('hide');
            coordEnnemi = [];
            score -= 2000;
        }
    }
})
//
//
//
//
//
//
//
let inTtir;
let vit_tir = 500;
//
function vitesseDesTirs(vitesse_tir) {
    vit_tir = vitesse_tir;
    inTtir = setInterval(function () {
        if (loose != true) {
            if (pause != true) {
                lazer_coordEnnemis_green.push({
                    x: position[0] + 3,
                    y: position[1] + lazer_position,
                    vitesse: entierAlea(10) + 20
                }); // vitesse pour donner une distance de déplacement à x

                if (lazer_position == -9) {
                    lazer_position = 0
                } else {
                    lazer_position = -9
                }
                update_lazergreen();

            }
        }
    }, vitesse_tir);
}
//
vitesseDesTirs(500);
//
function stopinTtir() {
    clearInterval(inTtir)
}




























function update_lazer_ennemi() {

    let update =
        svg.select('#jeu')
        .selectAll(".purple")
        .data(lazer_coordEnnemis_enemi, d => d)
    update.exit() //transition de sortie
        .attr("class", "end")
        .remove();
    update.enter()
        .append("use")
        .attr("z-index", "2")
        .attr("href", "#purpleennemi")
        .attr("class", "purple");
    // .style("height", "10")
    // .style("width", "10")
    update_lazerennemi_coordEnnemis();
}

function update_lazerennemi_coordEnnemis() {
    svg.select('#jeu')
        .selectAll(".purple")
        .attr("x", d => d.x)
        .attr("y", d => d.y);
}


function fin(d) {
    return d.x < 150;
}

function mort() {
    if (compteur_vie <= 0) {
        loose = true
        document.querySelector(".blur").hidden = false;
        document.querySelector(".loose").hidden = false;
        finscore.html(score)

        // if (bestscore == null) {
        //     localStorage.setItem("Xwing", score)
        // } else {
        //     if (score > bestscore) {
        //         localStorage.setItem("Xwing", score)
        //     }
        // }


    } else {
        loose = false
        document.querySelector(".blur").hidden = true;
        document.querySelector(".loose").hidden = true;
    }
}

// enlever un vaisseau à chaque perte de vie
function enleveVIE() {
    if (compteur_vie == 3) {
        svg2.select("#vie4").style("display", "none")
    }

    if (compteur_vie == 2) {
        svg2.select("#vie3").style("display", "none")
    }

    if (compteur_vie == 1) {
        svg2.select("#vie2").style("display", "none")
    }

    if (compteur_vie == 0) {
        svg2.select("#vie1").style("display", "none")
    }
}

setInterval(function () {
    if (loose != true) {
        if (pause != true) {
            if (lazer_coordEnnemis_enemi.length == 0) return;
            lazer_coordEnnemis_enemi.forEach(function (d) {
                d.x -= 1; //vitesse du tir ennemi
            });

            if (suppressionDansTableau(lazer_coordEnnemis_enemi, element1 =>
                    suppressionDansTableau(joueur, element2 => distance(element1, element2) < 6))) {

                compteur_vie--
                // vieTEXT.html("Life : " + compteur_vie)
                enleveVIE()
                update_lazer_ennemi()

                // on appel la fonction mort pour vérifier l'état de la partie du joueur
                mort()

            } else {
                update_lazerennemi_coordEnnemis()
            }

            if (lazer_coordEnnemis_enemi.every(fin))
                update_lazerennemi_coordEnnemis();
            else {
                lazer_coordEnnemis_enemi = lazer_coordEnnemis_enemi.filter(fin);

                update_lazer_ennemi();
            }
            update_lazerennemi_coordEnnemis();
        }
    }
}, 10);

// on ajoute suivant un interval précis des lazers
setInterval(function () {
    if (loose != true) {
        if (pause != true) {
            coordEnnemi.forEach(element => {
                lazer_coordEnnemis_enemi.push({
                    x: element.x - 12,
                    y: element.y + lazer_enemi,
                    vitesse: element.vitesse + 3
                });
                if (lazer_enemi == -2) {
                    lazer_enemi = 2
                } else {
                    lazer_enemi = -2
                }
            })

            update_lazer_ennemi();
        }
    }
}, 1300);
//
//
//
//
//
//
//
//
//
//
//
//
// CODE JQUERY POUR L'ICONE SON POUR POUVOIR ACTIVER ET DESACTIVER L'AUDIO DU JEU
//
//
//
$(document).ready(function () {
    $('.sound').on('click', function (e) {
        e.preventDefault();
        if ($('audio')[0].paused) {
            $('audio')[0].play();
            $(this).css("background-image", "url(medias/volume.png)")
        } else {
            $('audio')[0].pause();
            $(this).css("background-image", "url(medias/volumemute.png)")
        }
    })
})