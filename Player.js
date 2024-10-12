class Player {
    constructor(position, playerId, creatureList){
        this.position = position;
        this.playerId = playerId
        this.creatureList = creatureList
    }

    getPosition() {
        return this.position;
    }

    getPlayerId(){
        return this.playerId;
    }

    getCreature(){
        return {c1:this.creature1, c2:this.creature2};
    }
}

module.exports = Player;
