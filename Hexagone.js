// Définir la largeur et la hauteur pour le SVG
const largeur = 1000;
const hauteur = 1000;
const MAPSIZE = 13;// Paramètres de grille et de taille de l hexagone

const lignes = 13;
const colonnes = 13;

const rayon = 35; // Rayon pour les hexagones
const largeurHex = Math.sqrt(3) * rayon; // Largeur d'un hexagone
const hauteurHex = 2 * rayon; // Hauteur d'un hexagone
const espacement = 33; // Espace entre les hexagones

//valeur pour le cube
const cudeSize = 30;

// Calculer largeur et hauteur totales de la grille
const largeurTotaleGrille = colonnes * (largeurHex * 0.75) + largeurHex / 4;
const hauteurTotaleGrille = lignes * hauteurHex * 0.75;

// Calculer les décalages initiaux pour centrer la grille
const decalageInitialX = (largeur - largeurTotaleGrille) / 4;
const decalageInitialY = (hauteur - hauteurTotaleGrille) / 4;


var map = [];


// Créer SVG
const svg = d3.select("body").append("svg")
    .attr("width", largeur)
    .attr("height", hauteur);
    

// Fonction pour generer les points pour l'hexagone
function pointsHexagone(rayon, decalageX, decalageY) {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (2 * Math.PI / 6 * i) + Math.PI / 2;
        const x = decalageX + rayon * Math.cos(angle);
        const y = decalageY + rayon * Math.sin(angle);
        points.push([x, y]);
    }
    return points;
}

// Fonction pour dessiner un coeur
function dessinerCoeur(centreX, centreY, taille) {
    const coeurDPath = "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 Z";
    svg.append("path")
        .attr("d", coeurDPath)
        .attr("transform", `translate(${centreX - 25}, ${centreY - 25}) scale(${taille})`)
        .attr("fill", "red");
} 

function dessinerPlayer(centreX, centreY, taille) { //player Temporaire
    const coeurDPath = "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 Z";
    svg.append("path")
        .attr("d", coeurDPath)
        .attr("transform", `translate(${centreX - 25}, ${centreY - 25}) scale(${taille})`)
        .attr("fill", "black");
} 


function estSurLesMilieux(i, j, lignes, colonnes) {
    if(i===6 && j ===0){
        return true;
    }
    if(i === 0 && j === 6){
        return true;
    }
    if(i === lignes-1  && j == 6){
        return true;
    }
    if(i === 6 && j === colonnes-1){
        return true;
    }
}

//Amogus
function dessinerAmogus(centreX, centreY, taille , couleurAmogus) {
    const crewmateBodyColor = couleurAmogus;
    const crewmateVisorColor = "#3f3f3f";
    const crewmateVisorShineColor = "#ffffff";

    // Corps
    svg.append("ellipse")
       .attr("cx", centreX)
       .attr("cy", centreY)
       .attr("rx", 20 * taille)
       .attr("ry", 30 * taille)
       .attr("fill", crewmateBodyColor);

    // Tête
    svg.append("circle")
       .attr("cx", centreX)
       .attr("cy", centreY - 20 * taille)
       .attr("r", 15 * taille)
       .attr("fill", crewmateBodyColor);

    // Jambes
    svg.append("rect")
       .attr("x", centreX - 10 * taille)
       .attr("y", centreY + 20 * taille)
       .attr("width", 8 * taille)
       .attr("height", 15 * taille)
       .attr("fill", crewmateBodyColor);

    svg.append("rect")
       .attr("x", centreX + 2 * taille)
       .attr("y", centreY + 20 * taille)
       .attr("width", 8 * taille)
       .attr("height", 15 * taille)
       .attr("fill", crewmateBodyColor);

    // Visière
    svg.append("ellipse")
       .attr("cx", centreX)
       .attr("cy", centreY - 18 * taille)
       .attr("rx", 10 * taille)
       .attr("ry", 6 * taille)
       .attr("fill", crewmateVisorColor);

    // Reflet sur la visière
    svg.append("ellipse")
       .attr("cx", centreX - 4 * taille)
       .attr("cy", centreY - 19 * taille)
       .attr("rx", 4 * taille)
       .attr("ry", 2 * taille)
       .attr("fill", crewmateVisorShineColor);
}

//Pepe le Frog
function dessinerPepe(centreX, centreY, taille,couleur) {
    const bodyColor = couleur ;

    // Tête
    svg.append("circle")
       .attr("cx", centreX)
       .attr("cy", centreY)
       .attr("r", 20 * taille)
       .attr("fill", bodyColor);

    // Yeux
    svg.append("ellipse")
       .attr("cx", centreX - 10 * taille)
       .attr("cy", centreY - 5 * taille)
       .attr("rx", 8 * taille)
       .attr("ry", 13 * taille)
       .attr("fill", "white");

    svg.append("ellipse")
       .attr("cx", centreX + 10 * taille)
       .attr("cy", centreY - 5 * taille)
       .attr("rx", 8 * taille)
       .attr("ry", 13 * taille)
       .attr("fill", "white");

    // Pupilles
    svg.append("circle")
       .attr("cx", centreX - 10 * taille)
       .attr("cy", centreY - 5 * taille)
       .attr("r", 4 * taille)
       .attr("fill", "black");

    svg.append("circle")
       .attr("cx", centreX + 10 * taille)
       .attr("cy", centreY - 5 * taille)
       .attr("r", 4 * taille)
       .attr("fill", "black");

    // Bouche
    svg.append("ellipse")
       .attr("cx", centreX)
       .attr("cy", centreY + 10 * taille)
       .attr("rx", 10 * taille)
       .attr("ry", 3 * taille)
       .attr("fill", "black");
}

//dessine tete de mort si la créature est morte
function drawThickTinyCross() {
    const svg = d3.select("body").append("svg")
      .attr("width", 50)
      .attr("height", 50);

    // Dessine la croix en forme de "X"
    svg.append("line")
      .attr("x1", 12.5)
      .attr("y1", 12.5)
      .attr("x2", 37.5)
      .attr("y2", 37.5)
      .attr("class", "cross");

    svg.append("line")
      .attr("x1", 37.5)
      .attr("y1", 12.5)
      .attr("x2", 12.5)
      .attr("y2", 37.5)
      .attr("class", "cross");
  }


// Dessiner la grille d'hexagones
function afficheMap(map) {

    var pos = -1; //avoir la position de chaque hexagone le premiere, le 2, le 3.... ca va simplifier la fonction hexagoneAdjacent
    nbCreature = 0;
    listCouleur=['red','red','cyan','cyan','purple','purple','yellow','yellow'];
    counter = 0;

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {

            pos++;
            nbCreature ++;

            let decalageX = decalageInitialX + (largeurHex + espacement) * j * 0.655;
            let decalageY = decalageInitialY + (hauteurHex + espacement) * i * 0.50;
            
            if (i % 2 === 1) {
                decalageX += (largeurHex + espacement) * 0.336;
            }
            
            // Obtenir le type de terrain à partir de la matrice
            const caseType = map[i][j].caseType;


            map[i][j].coordonne = [decalageX, decalageY, pos];


            let couleur;
            switch(caseType) {
                case 'eau':
                    couleur = 'blue';
                    break;
                case 'prairie':
                    couleur = 'green';
                    break;
                case 'roche':
                    couleur = 'gray';
                    break;
                // Ajouter d'autres types de terrain au besoin
                default:
                    couleur = 'white'; // Couleur par défaut pour les types inconnus
                    break;
            }

            const points = pointsHexagone(rayon, decalageX, decalageY);
            
            if(estSurLesMilieux(i, j, lignes, colonnes)){
                // map[i][j].caseType = "seks";
                svg.append("polygon")
                .attr("points", points.map(p => p.join(",")).join(" "))
                .style("fill", 'pink')
                .style("stroke", "black")
                .style("stroke-width", 1);
                
            } else {
                svg.append("polygon")
                .attr("points", points.map(p => p.join(",")).join(" "))
                .style("fill", couleur)
                .style("stroke", "black")
                .style("stroke-width", 1);
                svg.append("text")
                    .attr("x", decalageX)
                    .attr("y", decalageY)
                    .text(pos);
            }

            if (estSurLesMilieux(i, j, lignes, colonnes)) {
                dessinerCoeur(decalageX , decalageY , 0.5);
            }
            
            if(map[i][j].creatures != []){

                for(c of map[i][j].creatures){
                    if(!c.isDead){
                        if(c.isChild){
                            dessinerAmogus(decalageX , decalageY , 0.40, "red");
                        }
                        else{
                            dessinerAmogus(decalageX , decalageY , 0.75, "red");
                        }
                    }
                    else {
                        
                        // dessinerAmogus(decalageX , decalageY , 0.75, "black");
                        drawThickTinyCross();
                    }
                }
            }
        }
    }
}
