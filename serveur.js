const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);
const Player = require('./Player.js');
const Creature = require('./Creature.js');
const CaseType = require('./CaseType.js');
const Case = require('./Case.js');
const { lstat } = require('fs');
const MAPSIZE = 13;
const positionList = [0,MAPSIZE - 1, (MAPSIZE * (MAPSIZE -1)) - 1,(MAPSIZE * MAPSIZE) -1]; 
const speciesList = ["monkey", "snake", "turtle", "dunkey"]

var roomName = '';

var isGameStarted = false
var isServerInCreation = false;
var isGameCreated = false;
var isMapGenerate = false;
var nbPlayerInGame = 0;
var nbPlayerMax = 0;
var nbTurns = 0;
var playerIdList = [];
var playerList = []; //type Player[]
var map = [];
var creatureName1 = null
var creatureName2 = null
var currentPlayer = null;


app.use(express.static(__dirname + '/public'));

app.get('/', (request, response) => {
    response.sendFile('waitingScreen.html', {root:__dirname});
})


const listener = 8088
server.listen(listener, () => {
    console.log("Le servuer écoute sur le port " + listener );
})

io.on('connection', (socket) => {

    console.log('Nouvelle connection : ' + socket.id);

    socket.on('joinRoom', room => {
        roomName = room;
        socket.join(room)
        console.log("new player just joined");
    })


    socket.on('newPlayer', () => {

        const creature1 = new Creature(false, false,null, creatureName1, speciesList[nbPlayerInGame] , 0,0,0,5,5);
        const creature2 = new Creature(false, false,null, creatureName2, speciesList[nbPlayerInGame] , 0,0,0,5,5);

        const player = new Player(nbPlayerInGame, generateUniqueId(), [creature1, creature2]);
        const playerJson = JSON.stringify(player);

        player.creatureList[0].position = positionList[nbPlayerInGame];
        player.creatureList[1].position = positionList[nbPlayerInGame];
        playerList.push(player);
        
        nbPlayerInGame ++;
        console.log(player);
        pushPlayerInTheMap(player);
        
        io.to(roomName).emit('loadNewMap', JSON.stringify(map));
        socket.emit('player', playerJson);

        isGameCreated = true;

    })

    socket.on('joinGame', (data) =>{

        isGameCreated = true;
        
        nbPlayerMax = data.nbP;
        nbTurns = data.nbT;

        console.log(`(from client); num player = ${data.nbP}`);
        console.log(`(from client); num turns = ${data.nbT}`);
        socket.emit('joinGameAdmin');

    })


    socket.on('createServer', (data)=>{
        if(isServerInCreation == false){
            isServerInCreation = true;
            socket.emit("serverPage");
            console.log("you re the admin");
            creatureName1 = data.c1;
            creatureName2 = data.c2;

            console.log(creatureName1,creatureName2);
        }

        if(nbPlayerMax != 0){
            console.log(`nbPlayerMax = ${nbPlayerMax}`);
            console.log(`nbPlayerInGame = ${nbPlayerInGame}`);
            console.log(`isGameCreated = ${isGameCreated}`)
            if(nbPlayerMax > nbPlayerInGame) {
                if(isGameCreated == true){
                    console.log("youre gonna be redirected");
                    socket.emit('joinGamePlayer');
                    creatureName1 = data.c1;
                    creatureName2 = data.c2;
                }

                else {
                    console.log('tast failed on isGameCreated = '+ isGameCreated);
                }
            }
            else {
                console.log(`task failed on ${nbPlayerMax} < ${nbPlayerInGame}`);
            }
        }

        else {
            console.log('please wait the server is in creation');
            console.log(`nbPlayer = ${nbPlayerMax}`);
        }
    })

    socket.on('leaveRoom',(roomName)=>{
        socket.leave(roomName);
        isServerInCreation = false;
    })

    socket.on('disconnect', () => {
        console.log(`${socket.id} s'est déconnecté`);
        socket.emit('leaveRoom');
    });

    socket.on("playerFromClient" , (player) => {
        console.log("player : "+ player);
    });


    socket.on('serverPleaseRedirectMe', (map) => {
        console.log("JE SUIS LAAAAA");
        socket.emit("gamePageRedirect", map);
    })


    socket.on('giveMeMap' , () => {
        console.log("ger");
        if(isMapGenerate == false){

            map = generateMap();
            isMapGenerate = true;
        }
        const mapJson = JSON.stringify(map);
        socket.emit("takeTheMap", mapJson);
    }) 

    socket.on('playerNewCreature', (player) => {
        console.log(playerList[player.getPosition -1])
        player = convertJSONToClass(player);
        playerList[player.getPosition -1] = player;
        // console.log(player);
    })

    socket.on('newMap', JSONmap => {
        const parsedMap = JSON.parse(JSONmap)
        map = parsedMap;
    })
    
    socket.on('startGame', () => {
        if(!isGameStarted){
            game(playerList)
        }
    })

    // socket.on("giveMeAttribut", ()=> {

    //     const jsonCurrentPlayer = JSON.stringify(jsonCurrentPlayer)
    //     socket.emit("getAttirbutFromServ", jsonCurrentPlayer)
    // })


});




function getRandom(max, min){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUniqueId(){
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function wait(milliseconds) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
}
  

async function game(listOfPlayer){

    var indexPlayerList = 0;

    for(let i = 0; i < nbTurns; i ++){

        // console.log(indexPlayerList);

            // console.log("le joueur courrant est ");console.log(listOfPlayer[indexPlayerList]);

            for(var c of listOfPlayer[indexPlayerList].creatureList){
                currentPlayer = listOfPlayer[indexPlayerList];
                if(!c.isDead){

                    await wait(500);
                    // const nextCase = caseAdjByPerception(c, c.perception);
                    const nextCase = randomFromHexagoneAdjacent(hexagoneAdjacent(c.position));
                    // console.log("la créature qui joue est ");console.log(c);
                    moovAdjacent(c, nextCase);
                    var jsonMap = JSON.stringify(map);
                    io.to(roomName).emit("loadNewMap", jsonMap);

                }
            }

            if(indexPlayerList < nbPlayerInGame - 1){
                indexPlayerList ++;
            }
            else {
                indexPlayerList = 0;
            }
    }
}


Number.prototype.between = function(a, b) {
    var min = Math.min.apply(Math, [a, b]),
       max = Math.max.apply(Math, [a, b]);
     return this > min && this < max;
};


function hexagoneAdjacent(pos){

    // console.log("pos : ");console.log(pos);
    if(pos  == 0){ // top left
        return [caseByPosition(pos + 1),caseByPosition(pos + MAPSIZE)];
    }
    else if(pos == 12){ // top right
        return [caseByPosition(pos- 1),caseByPosition(pos+ (MAPSIZE - 1)),caseByPosition(pos + MAPSIZE)];
    }
    else if(pos == 156){ // bot left
        return [caseByPosition(pos - MAPSIZE),caseByPosition(pos + 1)];
    }
    else if(pos == 168){ // bot right
        return [caseByPosition(pos - 1),caseByPosition(pos - MAPSIZE),caseByPosition(pos - (MAPSIZE -1))];
    }
    else if(pos> 0 && pos < 12){ //top
        return [caseByPosition(pos-1),caseByPosition(pos+1),caseByPosition(pos+(MAPSIZE-1)),caseByPosition(pos+MAPSIZE)];
    }

    else if (pos > 156 && pos < 168){ // bot
        return [caseByPosition(pos-1),caseByPosition(pos+1),caseByPosition(pos-(MAPSIZE - 1)),caseByPosition(pos-MAPSIZE)]

    }
    else if(pos % 13 == 0) { // left pair / impaire
        if(pos % 2 ==0){
            //pair
            return [caseByPosition(pos -MAPSIZE),caseByPosition(pos+MAPSIZE),caseByPosition(pos+1)];
        }//impaire
        else if(pos %2 == 1){
            return [caseByPosition(pos - (MAPSIZE )),caseByPosition(pos-(MAPSIZE-1)),caseByPosition(pos+MAPSIZE),caseByPosition(pos+(MAPSIZE+1)), caseByPosition(pos+1)];
        }
    }
    else if (pos  % 13 == 12 ){ //  right pari / imapire
        if(pos  % 2 ==0){
            //pair
            return [caseByPosition(pos -MAPSIZE),caseByPosition(pos+MAPSIZE),caseByPosition(pos-1)];
        }
        else if(pos %2 == 1){
            //impaire
            return [caseByPosition(pos -(MAPSIZE )),caseByPosition(pos - (MAPSIZE+ 1)),caseByPosition(pos - 1),caseByPosition(pos + (MAPSIZE-1)), caseByPosition(pos + MAPSIZE)];
        }
    }
    else {  //middle
        if(pos.between(26,38) || pos.between(52,64) || pos.between(78,90) || pos.between(104,116) || pos.between(130,142)){
            return[caseByPosition(pos -(MAPSIZE)),caseByPosition(pos -(MAPSIZE+1)),caseByPosition( pos-1),caseByPosition(pos +1),caseByPosition(pos +MAPSIZE),caseByPosition(pos +(MAPSIZE-1))];
        } 
        else {
            return[caseByPosition(pos -(MAPSIZE)),caseByPosition(pos -(MAPSIZE-1)),caseByPosition( pos-1),caseByPosition(pos +1),caseByPosition(pos +MAPSIZE),caseByPosition(pos +(MAPSIZE-1))];
        }
    }
    return null;
}
//on récupere l'indexe de la créature dans la liste des créatures présente dans la case


function getCreatureIndexInList(currentCase, creature){
    // console.log("current Case : ");console.log(currentCase);
    // console.log("creature");console.log(creature);

    
    var index = 0;
    for(let i = 0; i < currentCase.creatures.length; i++){
        if(currentCase.creatures[i].name == creature.name){
            return index;
        }
        index ++;
    }
    // console.log(currentCase, creature);
    throw console.error('aucune creature trouvé')
}


function moovAdjacent(creature, nextCase){

    // console.log("C'ESTL LA CREATURE");console.log(creature);

    
    const currentCase = caseByPosition(creature.position);
    
    const currentCaseCoordonne = iAndJByPosition(creature.position);
    var nextCaseCoordonne = iAndJByPosition(nextCase.position);
    const indexCreature = getCreatureIndexInList(currentCase, creature);
    

    if(creature.satiete >= 6  && creature.hydratation >= 6 && !creature.isChild){
        if(currentCase.caseType != "seks"){
            console.log("GO REPRODUCTION")
            nextCase = caseByPosition(findPath(caseReproductionBySpecies(creature), creature.position));
            nextCaseCoordonne = iAndJByPosition(nextCase.position)
        }
        else {
            creature.hydratation -= 0.5;
            creature.satiete -= 0.25;
            return;
        }
    }

    if(JSON.stringify(nextCase.creatures) == "[]" ){

        map[currentCaseCoordonne[0]][currentCaseCoordonne[1]].creatures[indexCreature] = null;

        map[nextCaseCoordonne[0]][nextCaseCoordonne[1]].creatures = [creature];

        cleanCase(currentCase);
        confere(creature)
        creature.position = nextCase.position;     

        return;

    }

    else {
        const c2 = nextCase.creatures[0]; //on simplifie en faisant le combat sur la premiere créature de la case

        if(creature.species == nextCase.creatures[0].species){
            if(nextCase.caseType == "seks" && !creature.isChild){

                const player = getPlayerBySpecies(creature.species)

                const bebeCreature = new Creature(false,true, nextCase.position, "bebe" + creature.name + c2.name + getRandom(1000,0), creature.species,
                (creature.tauxReproduction + c2.tauxReproduction) / 2,(creature.perception + c2.perception) / 2
                ,(creature.force + c2.force) / 2 , 5, 5);

                map[currentCaseCoordonne[0]][currentCaseCoordonne[1]].creatures[indexCreature] = null;
                map[nextCaseCoordonne[0]][nextCaseCoordonne[1]].creatures.push(creature);
                map[nextCaseCoordonne[0]][nextCaseCoordonne[1]].creatures.push(bebeCreature);
                player.creatureList.push(bebeCreature);

                creature.satiete -= 2;
                creature.hydratation -= 2;

                c2.satiete -= 2;
                c2.hydratation -= 2;

                // console.log("le bebe ce trouve sur la case : ");console.log(nextCase) 
                confere(creature)
                cleanCase(currentCase);

                creature.position = nextCase.position; 
                return;
            }

            else {
                
                map[currentCaseCoordonne[0]][currentCaseCoordonne[1]].creatures[indexCreature] = null;
                map[nextCaseCoordonne[0]][nextCaseCoordonne[1]].creatures.push(creature);
                creature.position = nextCase.position;     
                confere(creature)
                cleanCase(currentCase);
                return; 
            }

        }


       
        if(creature.force > c2.force){
            const newCaseForC2 = randomFromHexagoneAdjacent(hexagoneAdjacent(c2.position));
            map[currentCaseCoordonne[0]][currentCaseCoordonne[1]].creatures[indexCreature] = null;

            moovAdjacent(c2, newCaseForC2,);
            map[nextCaseCoordonne[0]][nextCaseCoordonne[1]].creatures = [creature];
            confere(creature)
            creature.position = nextCase.position;  
            return;
        }

        else if(c2.force > creature.force) {
            
            const newCaseForC1 = randomFromHexagoneAdjacent(hexagoneAdjacent(creature.position));
            confere(creature)
            return moovAdjacent(creature, newCaseForC1);

        }

        else {

            const random = getRandom(2,1);

            if(random == 2){
                const newCaseForC2 = randomFromHexagoneAdjacent(hexagoneAdjacent(c2.position));
                map[currentCaseCoordonne[0]][currentCaseCoordonne[1]].creatures[indexCreature] = null;
    
                moovAdjacent(c2, newCaseForC2,)
                map[nextCaseCoordonne[0]][nextCaseCoordonne[1]].creatures = [creature];
                return;
            }

            else {
                const newCaseForC1 = randomFromHexagoneAdjacent(hexagoneAdjacent(c2.position));
                map[currentCaseCoordonne[0]][currentCaseCoordonne[1]].creatures[indexCreature] = null;
    
                moovAdjacent(creature, newCaseForC1,)
                map[nextCaseCoordonne[0]][nextCaseCoordonne[1]].creatures = [c2];
                return;
            }  
        }
    }
}



function findPath(positionStart,positionFinish){
    return _findPath(positionStart, positionFinish, [positionStart]);

}

function _findPath(positionStart, positionFinish, listPositionToExplore = [positionStart], index = 0){

    var hexaAdj = hexagoneAdjacent(positionStart);

    hexaAdj = hexaAdj.filter(element => !listPositionToExplore.includes(element));  

    for(h of hexaAdj){

        if(!listPositionToExplore.includes(h.position)){
            listPositionToExplore.push(h.position);
        }

        if(h.position == positionFinish && index != 0){ 
            return listPositionToExplore[index]; 
        }
        
        if(listPositionToExplore.includes(positionFinish) && index == 0){
            // console.log("j'ai finis derniere position est "); console.log(positionStart)
            return positionStart;
        }
    }
    index ++
    // console.log("listPositionToExplore : "); console.log(listPositionToExplore);
    return _findPath(listPositionToExplore[index], positionFinish, listPositionToExplore, index);
}


function bestCaseFromTheList(listPos, caseTypeISearch){
    for(p of listPos){
        const maCase = caseByPosition(p);
        if(maCase.caseType == caseTypeISearch){
            return maCase;
        }
    }
    return null;
}

function meilleurCase(creature, listPosAdj){
    if(creature.hydratation< creature.satiete){
        return bestCaseFromTheList(listPosAdj, "eau")
    }

    else {
        return bestCaseFromTheList(listPosAdj, "prairie");
    }

}


function caseAdjByPerception(creature, perception, listPositionToExplore = [creature.pos], index= 0){
    const pos = creature.pos;
    var hexaAdj = hexagoneAdjacent(pos);
    
    for(h of hexaAdj){

        if(!listPositionToExplore.includes(h.position)){
            listPositionToExplore.push(h.position);
        }

        var bestCase = meilleurCase(creature, listPositionToExplore);

        if(bestCase != null){
           console.log(bestCase);console.log(bestCase);
            return findPath(bestCase.position, pos);
        }

        if(perception == 0){
            console.log('random');
            return randomFromHexagoneAdjacent(hexaAdj);
        }
    }
    index ++
    return caseAdjByPerception(listPositionToExplore[index], perception--, listPositionToExplore);
}

function caseReproductionBySpecies(creature){

    const species = creature.species;
    switch(species){
        case "monkey" :
            return 6;
        case "snake":
            return 78;
        case "turtle":
            return 90;
        case "dunkey":
            return 162;
        default:
            throw console.error("this spicies did no exist");
    }
}

function getPlayerBySpecies(species){
    for(p of playerList){
        for(c of p.creatureList){
            if(c.species == species){
                return p
            };
        }
    }    
    throw console.error("cette species n'existe pas");
}


function cleanCase(currentCase){
    for(let i=0; i<currentCase.creatures.length; i++){
        const c = currentCase.creatures[i];
        if(c == null){
            currentCase.creatures = currentCase.creatures.filter(function(element) {
                return element !== null;
            });

            if(currentCase.creatures == []){
                currentCase.creatures = null;
            }
        }
    }
}


function confere(creature){
    const caseTypeOn = caseByPosition(creature.position).caseType;

    if(!isDeado(creature)){
        if(caseTypeOn == 'eau'){
            creature.hydratation += 4;
        }
        else if(caseTypeOn == 'prairie'){
            creature.satiete += 2;
        }
        creature.hydratation -= 1;
        creature.satiete -= 0.5;


    }
}

function isDeado(creature){
    if (creature.hydratation <= 0 || creature.satiete <= 0){
        creature.isDead = true
        return true;
    }
    return false;
}




function randomFromHexagoneAdjacent(listCase){
    return listCase[getRandom(0, listCase.length -1 )];

}


function caseByPosition(pos){          //renvoie la case sur laquelle est la créature;
    for(let i = 0; i < map.length ; i ++){
        for(let j = 0; j < map[i].length ; j ++){
            if(map[i][j].position == pos){
                return map[i][j];
            }
        }
    }
    throw console.error("position de merde");
}

function positionByCase(maCase){
    for(let i = 0; i < map.length ; i ++){
        for(let j = 0; j < map[i].length ; j ++){
            if(map[i][j] == maCase){
                return map[i][j].position;
            }
        }
    }
    return null;   
}


function iAndJByPosition(pos){
    for(let i = 0; i < map.length ; i ++){
        for(let j = 0; j < map[i].length ; j ++){
            if(map[i][j].position == pos){
                return [i,j];
            }
        }
    }
    throw console.error("don't find any");
}


function estSurLesMilieux(i,j){
    if(i === 6 && j === 0){
        return true;
    }
    if(i === 0 && j === 6){
        return true;
    }
    if(i === 12  && j == 6){
        return true;
    }
    if(i === 6 && j === 12){
        return true;
    }
}


function pushPlayerInTheMap(player){ //ajoute le player a la bonne position dans la map
    switch(nbPlayerInGame){
        case 1:
            break;
        case 2:
            console.log("here");
            map[0][MAPSIZE-1].creatures.push( player.creatureList[0],player.creatureList[1])
            break;
        case 3:
            map[MAPSIZE - 1][0].creatures.push( player.creatureList[0], player.creatureList[1])
            break;
        case 4:
            map[MAPSIZE - 1][MAPSIZE - 2].creatures.push( player.creatureList[0], player.creatureList[1])
            break;
        default:
            throw console.error('too many player');
    }
} 


function generateMap(){
    
    var map = [];
    var pos = -1;
    var idListPlayer = -1;
    for(let i = 0; i < MAPSIZE; i ++){
        map.push([]);
        for(let j = 0; j < MAPSIZE; j ++){

            if(idListPlayer < playerList.length - 1){
                idListPlayer ++;
            }
            pos ++;
            if(i == 0 && j == 0){

                const c = new Case([playerList[idListPlayer].creatureList[0],playerList[idListPlayer].creatureList[1]], randomCaseType(), null, null,null);
                map[i].push(c);  

            }
            else if(estSurLesMilieux(i,j)){
                const c = new Case([], "seks", null,null, null);
                map[i].push(c);
            }

            else {
                const c = new Case([], randomCaseType(), null,null,null);
                map[i].push(c);
            }
        }
    }
    return map;
}


function randomCaseType(){

    stat = getRandom(0, 100);
    if(stat < 15){
        return CaseType.EAU;
    }
    else if(stat < 65){
        return CaseType.ROCHE;
    }
    else {
        return CaseType.PRAIRIE;
    }
}
