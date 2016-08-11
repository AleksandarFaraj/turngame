'use strict'
class DataStore {
    constructor() {
        this.characters = {};
    }

    addCharacter(id, team, x, y) {
        this.characters[id] = new Character(id, team, x, y);
    }
    _getCharacter(id) {
        return this.characters[id];
    }
    getCharacters(){
        return this.characters;
    }
}
class World {
    constructor(store) {
        this._store = store;
        this.init();
    }

    addCharacter(id, team, x, y) {
        this._store.addCharacter(id, team, x, y);
    }
    getCharacters(){
        return this._store.getCharacters();
    }
    init() {
        this.addCharacter("Alex", "team1", 0, 0);
        this.addCharacter("Jonas", "team1", 0, 1);
        this.addCharacter("Johannes", "team1", 0, 2);
        this.addCharacter("Sweden", "team2", 10, 10);
        this.addCharacter("Germany", "team2", 10, 9);
        this.addCharacter("Finland", "team2", 10, 8);
    };

    move(id, to) {
        var character = this._store._getCharacter(id);
        to.x = Math.floor(to.x);
        to.y = Math.floor(to.y);
        var from = character.pos;
        var distance = getDistance(from, to);
        if (distance <= character.speed) {
            character.move(to);
        } else {
            throw new Error("move - Moving to far");
        }
        return {operation: "move", character, from, distance}
    }
}
class Turn {
    queueCommand(world, command,characters) {
        if (!this.isPlayable(world, command.id,characters)) {
            throw new Error("queueCommand - Non-playable character");
        }
        if (!this.isTurn(command.id,characters)) {
            throw new Error("queueCommand - Not this players turn");
        }
        this.command = command;
    }

    exec(world, command,characters) {
        var outcome;
        switch (command.operation) {
            case "move":
                outcome = world.move(this.command.id, this.command.pos);
                break;
            default:
                throw new Error("exec - Invalid command", command.operation);
                break;
        }
        if (!outcome) {
            throw new Error("Not acceptable");
        }
        this.lastEvent = outcome;
        this.nextTurn(characters);
    }
    isPlayable(world, id,characters) {
        return (id in characters);
    }

    isTurn(id) {
        return (id === this.turn.id);
    }
    nextTurn(characters) {
        var a = Object.keys(characters).sort((a, b)=> {
            return characters[a].turn - characters[b].turn;
        });
        this.turn = characters[a[0]];
        console.log("Next turn is", this.turn);
    }
    execute(world,command){
        var characters = world.getCharacters();
        this.queueCommand(world, command, characters);
        this.exec(world, command,characters);
    }

}
class GameEngine {
    constructor(world) {
        if (!world) {
            throw new Error("GameEngine - World object not supplied")
        }
        this.turn = new Turn();
        this.turn.nextTurn(world.getCharacters());
    }

    execCommand(world, command) {
        this.turn.execute(world,command);
    }
}
function getDistance(pos1, pos2) {
    return Math.ceil(Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)));
}
class Character {
    constructor(id, team, x, y) {
        this.id = id;
        this.team = team;
        this.pos = {};
        this.pos.x = x;
        this.pos.y = y;
        this.speed = 1;
        this.recover = 0;
        this.turn = 0;
        this.attack = 1;
        this.health = 10;
    }

    move(pos) {
        this.pos = pos;
        this.turn += 5 - (this.recover);
        console.log("Moving x: " + this.pos.x + " y: " + this.pos.y);
    }
}
var store = new DataStore();
var world = new World(store);
var game = new GameEngine(world);

game.execCommand(world, {operation: "move", id: "Alex", team: "team1", pos: {x: 0, y: 1}});
game.execCommand(world, {operation: "move", id: "Jonas", team: "team1", pos: {x: 0, y: 1}});
game.execCommand(world, {operation: "move", id: "Johannes", team: "team1", pos: {x: 0, y: 1}});
game.execCommand(world, {operation: "move", id: "Sweden", team: "team1", pos: {x: 10, y: 9}});
game.execCommand(world, {operation: "move", id: "Germany", team: "team1", pos: {x: 10, y: 8}});
game.execCommand(world, {operation: "move", id: "Finland", team: "team1", pos: {x: 10, y: 7}});