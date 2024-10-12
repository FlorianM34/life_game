class Creature {
    constructor(isDead,isChild,position,name,species, tauxReproduction, perception,force, hydratation, satiete){
        this.name = name; 
        this.isChild = isChild;
        this.species = species;
        this.tauxReproduction = tauxReproduction;
        this.perception = perception;
        this.force = force;
        this.hydratation = hydratation;
        this.satiete = satiete
        this.position = position;
        this.isDead = isDead
    }

    setCoordonne(pos) {
        this.position = pos;
    }
}

module.exports = Creature;
