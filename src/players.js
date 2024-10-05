import { Gameboard } from './gameboard.js';

function initiatePlayer(nameString = 'anonymous') {
    return {
        name: nameString,
        gameboard: Gameboard.createGameboard(),
    };
}

export { initiatePlayer };
