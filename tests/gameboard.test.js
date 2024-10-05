import { Gameboard } from '../src/gameboard.js';

describe('gameboard module', () => {
    let gameboard = Gameboard.createGameboard();
    test('createGameboard returns an object containing occupied, attacked, missed, hit spots and sunk ship count', () => {
        expect(gameboard.occupiedSpots).toBeInstanceOf(Set);
        expect(gameboard.attackedSpots).toBeInstanceOf(Set);
        expect(gameboard.missedSpots).toEqual([]);
        expect(gameboard.survivingShipCount).toBe(5);
    });

    test('createGameboard should contain a ships object containing carrier, battleShip, destroyer, submarine, patrolShip objects', () => {
        expect(gameboard.ships.carrier).toStrictEqual({
            length: 5,
            hitCount: 0,
            isSunk: false,
            position: new Set(),
            isPositionLocked: false,
        });
        expect(gameboard.ships.battleShip).toStrictEqual({
            length: 4,
            hitCount: 0,
            isSunk: false,
            position: new Set(),
            isPositionLocked: false,
        });
        expect(gameboard.ships.destroyer).toStrictEqual({
            length: 3,
            hitCount: 0,
            isSunk: false,
            position: new Set(),
            isPositionLocked: false,
        });
        expect(gameboard.ships.submarine).toStrictEqual({
            length: 3,
            hitCount: 0,
            isSunk: false,
            position: new Set(),
            isPositionLocked: false,
        });
        expect(gameboard.ships.patrolShip).toStrictEqual({
            length: 2,
            hitCount: 0,
            isSunk: false,
            position: new Set(),
            isPositionLocked: false,
        });
    });

    describe('isWithinRange function', () => {
        test('returns true if the passed coordinate is within boundary', () => {
            expect(Gameboard.isWithinRange([1, 10])).toBe(true);
        });
        test('returns false if the passed coordinate is out of boundary', () => {
            expect(Gameboard.isWithinRange([0, 11])).toBe(false);
        })
    })

    describe('setShipPosition function', () => {
        test('adds a new horizontal position coordinates Set to the occupied spots and to the accessed ship position', () => {
            const shipState = {
                shipName: 'patrolShip',
                headPosition: [1, 1],
                isHorizontal: true,
                isPositionConfirmed: true,
            };
            gameboard = Gameboard.setShipPosition(gameboard, shipState);
            expect(gameboard.occupiedSpots.size).toBe(2);
            expect(gameboard.occupiedSpots.has('1,1')).toBe(true);
            expect(gameboard.occupiedSpots.has('2,1')).toBe(true);
            expect(gameboard.ships.patrolShip.position.size).toBe(2);
            expect(gameboard.ships.patrolShip.position.has('1,1')).toBe(true);
            expect(gameboard.ships.patrolShip.position.has('2,1')).toBe(true);
        });

        test('does not add a new position if the ship position is already locked previously', () => {
            const shipState = {
                shipName: 'patrolShip',
                headPosition: [2, 3],
                isHorizontal: true,
                isPositionConfirmed: false,
            };
            gameboard = Gameboard.setShipPosition(gameboard, shipState);
            expect(gameboard.occupiedSpots.size).toBe(2);
            expect(gameboard.ships.patrolShip.position.size).toBe(2);
            expect(gameboard.occupiedSpots.has('2,3')).toBe(false);
        });

        test('keep the previous position if new position exceeds boundary', () => {
            const shipState = {
                shipName: 'patrolShip',
                headPosition: [9, 1],
                isHorizontal: true,
                isPositionConfirmed: false,
            };
            gameboard = Gameboard.setShipPosition(gameboard, shipState);
            expect(gameboard.occupiedSpots.size).toBe(2);
            expect(gameboard.occupiedSpots.has('1,1')).toBe(true);
            expect(gameboard.occupiedSpots.has('2,1')).toBe(true);
            expect(gameboard.ships.patrolShip.position.size).toBe(2);
            expect(gameboard.ships.patrolShip.position.has('1,1')).toBe(true);
            expect(gameboard.ships.patrolShip.position.has('2,1')).toBe(true);
        });

        test('adds a new vertical position coordinates Set to the occupied spots and to the accessed ship position', () => {
            const shipState = {
                shipName: 'submarine',
                headPosition: [2, 3],
                isHorizontal: false,
                isPositionConfirmed: false,
            };
            gameboard = Gameboard.setShipPosition(gameboard, shipState);
            expect(gameboard.occupiedSpots.size).toBe(5);
            expect(gameboard.occupiedSpots.has('2,3')).toBe(true);
            expect(gameboard.occupiedSpots.has('2,4')).toBe(true);
            expect(gameboard.occupiedSpots.has('2,5')).toBe(true);
        });

        test('does not update if position overlaps with existing ship', () => {
            const shipState = {
                shipName: 'destroyer',
                headPosition: [2, 1],
                isHorizontal: true,
                isPositionConfirmed: false,
            };
            gameboard = Gameboard.setShipPosition(gameboard, shipState);
            expect(gameboard.occupiedSpots.size).toBe(5);
            expect(gameboard.ships.destroyer.position.size).toBe(0);
            expect(gameboard.ships.destroyer.position.has('2,1')).toBe(false);
        });

        test('does not update if position exceeds boundaries', () => {
            const shipState = {
                shipName: 'destroyer',
                headPosition: [1, 0],
                isHorizontal: true,
                isPositionConfirmed: false,
            };
            gameboard = Gameboard.setShipPosition(gameboard, shipState);
            expect(gameboard.occupiedSpots.size).toBe(5);
            expect(gameboard.ships.destroyer.position.size).toBe(0);
            expect(gameboard.ships.destroyer.position.has('2,1')).toBe(false);
        });

        test('remove the old coordinates and update with a new coordinates Set from ship position and occupiedSpots if a ship position is updated', () => {
            const shipState = {
                shipName: 'submarine',
                headPosition: [6, 5],
                isHorizontal: true,
                isPositionConfirmed: false,
            };
            gameboard = Gameboard.setShipPosition(gameboard, shipState);
            expect(gameboard.occupiedSpots.has('6,5')).toBe(true);
            expect(gameboard.occupiedSpots.has('2,3')).toBe(false);
            expect(gameboard.occupiedSpots.size).toBe(5);
            expect(gameboard.ships.submarine.position.has('6,5')).toBe(true);
            expect(gameboard.ships.submarine.position.has('2,3')).toBe(false);
            expect(gameboard.ships.submarine.position.size).toBe(3);
        });

        test('deep copies gameboard and does not mutate original gameboard', () => {
            const shipState = {
                shipName: 'battleShip',
                headPosition: [4, 5],
                isHorizontal: false,
                isPositionConfirmed: false,
            };
            const gameboardCopy = Gameboard.setShipPosition(
                gameboard,
                shipState
            );
            expect(gameboardCopy.occupiedSpots).not.toBe(
                gameboard.occupiedSpots
            );
            expect(gameboardCopy.ships.battleShip.position.size).not.toBe(
                gameboard.ships.battleShip.position.size
            );
        });
    });

    describe('clearAllShipPositionSets function ', () => {
        let gameboard2 = Gameboard.createGameboard();
        gameboard2 = Gameboard.setShipPosition(gameboard2, {
            shipName: 'submarine',
            headPosition: [1, 1],
            isHorizontal: true,
            isPositionConfirmed: true,
        });
        gameboard2 = Gameboard.setShipPosition(gameboard2, {
            shipName: 'patrolShip',
            headPosition: [1, 2],
            isHorizontal: true,
            isPositionConfirmed: true,
        });
        const gameboardCleared = Gameboard.clearAllShipPositionSets(gameboard2);

        test('clears occupiedSpots and each ship position Sets', () => {
            expect(gameboardCleared.occupiedSpots.size).toBe(0);
            expect(gameboardCleared.ships.submarine.position.size).toBe(0);
            expect(gameboardCleared.ships.patrolShip.position.size).toBe(0);
            expect(gameboardCleared.ships.submarine.isPositionLocked).toBe(
                false
            );
            expect(gameboardCleared.ships.patrolShip.isPositionLocked).toBe(
                false
            );
        });

        test('deep copies gameboard and does not mutate original gameboard', () => {
            expect(gameboardCleared.occupiedSpots).not.toBe(
                gameboard2.occupiedSpots
            );
            expect(gameboardCleared.ships.submarine.position.size).not.toBe(
                gameboard2.ships.submarine.position.size
            );
        });
    });

    describe('findShipsNotPositioned function', () => {
        test('returns null when all ships are set', () => {
            const gameboardObj = {
                ships: {
                    carrier: {
                        length: 5,
                        hitCount: 0,
                        isSunk: false,
                        position: new Set([
                            [1, 1],
                            [1, 2],
                            [1, 3],
                            [1, 4],
                            [1, 5],
                        ]),
                        isPositionLocked: true,
                    },
                    battleShip: {
                        length: 4,
                        hitCount: 0,
                        isSunk: false,
                        position: new Set([
                            [2, 1],
                            [2, 2],
                            [2, 3],
                            [2, 4],
                        ]),
                        isPositionLocked: true,
                    },
                    destroyer: {
                        length: 3,
                        hitCount: 0,
                        isSunk: false,
                        position: new Set([
                            [3, 1],
                            [3, 2],
                            [3, 3],
                        ]),
                        isPositionLocked: true,
                    },
                    submarine: {
                        length: 3,
                        hitCount: 0,
                        isSunk: false,
                        position: new Set([
                            [4, 1],
                            [4, 2],
                            [4, 3],
                        ]),
                        isPositionLocked: true,
                    },
                    patrolShip: {
                        length: 2,
                        hitCount: 0,
                        isSunk: false,
                        position: new Set([
                            [5, 1],
                            [5, 2],
                        ]),
                        isPositionLocked: true,
                    },
                },
            };
            expect(Gameboard.findShipsNotPositioned(gameboardObj)).toBe(null);
        });

        test('returns array containing ship name when not all ships have positions set', () => {
            const gameboardObj = {
                ships: {
                    carrier: {
                        length: 5,
                        hitCount: 0,
                        isSunk: false,
                        position: new Set([
                            [1, 1],
                            [1, 2],
                            [1, 3],
                            [1, 4],
                            [1, 5],
                        ]),
                        isPositionLocked: true,
                    },
                    battleShip: {
                        length: 4,
                        hitCount: 0,
                        isSunk: false,
                        position: new Set([
                            [2, 1],
                            [2, 2],
                            [2, 3],
                            [2, 4],
                        ]),
                        isPositionLocked: true,
                    },
                    destroyer: {
                        length: 3,
                        hitCount: 0,
                        isSunk: false,
                        position: new Set(),
                        isPositionLocked: false,
                    },
                    submarine: {
                        length: 3,
                        hitCount: 0,
                        isSunk: false,
                        position: new Set([
                            [4, 1],
                            [4, 2],
                            [4, 3],
                        ]),
                        isPositionLocked: true,
                    },
                    patrolShip: {
                        length: 2,
                        hitCount: 0,
                        isSunk: false,
                        position: new Set(),
                        isPositionLocked: false,
                    },
                },
            };
            expect(Gameboard.findShipsNotPositioned(gameboardObj)).toEqual([
                'destroyer',
                'patrolShip',
            ]);
        });
    });

    describe('lockAllShipPositions function', () => {
        const gameboard = Gameboard.createGameboard();
        test('returns all true from isPositionLocked key in each ship', () => {
            const lockedGameboard = Gameboard.lockAllShipPositions(gameboard);
            expect(lockedGameboard.ships.carrier.isPositionLocked).toBe(true);
            expect(lockedGameboard.ships.battleShip.isPositionLocked).toBe(
                true
            );
            expect(lockedGameboard.ships.destroyer.isPositionLocked).toBe(true);
            expect(lockedGameboard.ships.submarine.isPositionLocked).toBe(true);
            expect(lockedGameboard.ships.patrolShip.isPositionLocked).toBe(
                true
            );
        });
    });

    describe('receiveAttack function', () => {
        let gameboardInProgress;
        test('returns whether or not ship is sunk after each hit', () => {
            gameboardInProgress = Gameboard.receiveAttack([1, 1], gameboard);
            expect(gameboardInProgress.gameboard.ships.patrolShip.isSunk).toBe(
                false
            );
            gameboardInProgress = Gameboard.receiveAttack(
                [2, 1],
                gameboardInProgress.gameboard
            );
            expect(gameboardInProgress.gameboard.ships.patrolShip.isSunk).toBe(
                true
            );
        });

        test('only updates attacked ship hitCount', () => {
            expect(
                gameboardInProgress.gameboard.ships.patrolShip.hitCount
            ).toBe(2);
            expect(gameboardInProgress.gameboard.ships.carrier.hitCount).toBe(
                0
            );
        });

        test('tracks the surviving ship count', () => {
            expect(gameboardInProgress.gameboard.survivingShipCount).toBe(4);
        });

        test('adds a new attack coordinate to attackedSpots, and adds it to missedSpots', () => {
            gameboardInProgress = Gameboard.receiveAttack(
                [10, 10],
                gameboardInProgress.gameboard
            );
            expect(gameboardInProgress.gameboard.attackedSpots.size).toBe(3);
            expect(
                gameboardInProgress.gameboard.attackedSpots.has('10,10')
            ).toBe(true);
            expect(
                gameboardInProgress.gameboard.missedSpots.includes('10,10')
            ).toBe(true);
        });

        test('returns boolean and position for UI related data if the attacked position hit a ship or open spot to attack', () => {
            gameboardInProgress = Gameboard.receiveAttack(
                [6, 5],
                gameboardInProgress.gameboard
            );
            expect(gameboardInProgress.uiData.isOnShip).toBe(true);
            expect(gameboardInProgress.uiData.position).toBe('6,5');
            expect(gameboardInProgress.uiData.isValidSpot).toBe(true);
        });

        test('returns false for isValidSpot if the attacked position is already taken from a previous attack', () => {
            gameboardInProgress = Gameboard.receiveAttack(
                [6, 5],
                gameboardInProgress.gameboard
            );
            expect(gameboardInProgress.uiData.isValidSpot).toBe(false);
        });

        test('returns null for UI and false for isValidSpot if the attacked position is out of bound', () => {
            gameboardInProgress = Gameboard.receiveAttack(
                [11, 1],
                gameboardInProgress.gameboard
            );
            expect(gameboardInProgress.uiData.isOnShip).toBe(null);
            expect(gameboardInProgress.uiData.isValidSpot).toBe(false);
        });

        test('deep copies gameboard and does not mutate original gameboard', () => {
            expect(gameboardInProgress.gameboard.attackedSpots.size).not.toBe(
                gameboard.attackedSpots.size
            );
            expect(gameboardInProgress.gameboard.missedSpots).not.toStrictEqual(
                gameboard.missedSpots
            );
            expect(gameboardInProgress.gameboard).not.toStrictEqual(gameboard);
            expect(
                gameboardInProgress.gameboard.ships.patrolShip.isSunk
            ).not.toBe(gameboard.ships.patrolShip.isSunk);
        });
    });

    describe('hasNoShipLeft function', () => {
        test('returns true if all ship are sunk', () => {
            const mockGameboard = {
                occupiedSpots: new Set(),
                attackedSpots: new Set(),
                missedSpots: [],
                survivingShipCount: 0,
                ships: {},
            };
            expect(
                Gameboard.hasNoShipLeft(mockGameboard.survivingShipCount)
            ).toBe(true);
        });
        test('returns false if there is any ship left', () => {
            const mockGameboard = {
                occupiedSpots: new Set(),
                attackedSpots: new Set(),
                missedSpots: [],
                survivingShipCount: 4,
                ships: {},
            };
            expect(
                Gameboard.hasNoShipLeft(mockGameboard.survivingShipCount)
            ).toBe(false);
        });
    });
});
