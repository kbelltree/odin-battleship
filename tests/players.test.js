import { initiatePlayer } from '../src/players';
import { Gameboard } from '../src/gameboard';

describe('player module', () => {
    const anonymous = initiatePlayer();
    const player1 = initiatePlayer('player1');
    test('initiatePlayer returns an object containing player name', () => {
        expect(anonymous.name).toBe('anonymous');
        expect(player1.name).toBe('player1');
    });

    test('initiatePlayer contains a initial state of gameboard object', () => {
        expect(player1.gameboard).toStrictEqual(Gameboard.createGameboard());
    });
});
