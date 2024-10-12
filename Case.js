class Case {
    constructor(creatures, caseType, coordonne){
        this.creatures = creatures;
        this.caseType = caseType;
        this.coordonne = coordonne;
    }

    getPos(){
        return this.coordonne[2];
    }

    getPlayer(){
        return this.creatures;
    }

    setCreaturePos(pos){
        this.creatures.setPos = pos;
    }

    setCaseType(type){
        this.caseType = type;
    }
}

module.exports = Case;
