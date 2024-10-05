import { Ship } from './ship.js';

// Base of the gameboard
function createGameboard() {
    return {
        occupiedSpots: new Set(),
        attackedSpots: new Set(),
        missedSpots: [],
        survivingShipCount: 5,
        ships: {
            carrier: Ship.createShip(5),
            battleShip: Ship.createShip(4),
            destroyer: Ship.createShip(3),
            submarine: Ship.createShip(3),
            patrolShip: Ship.createShip(2),
        },
    };
}

// Ensure the position with within the bound of gameboard
function isWithinRange([x, y]) {
    return x >= 1 && y >= 1 && x <= 10 && y <= 10;
}

// Reset the ship position Set for repositioning
function _clearCurrentShipPosition(shipObj) {
    let updatedShipObj = structuredClone(shipObj);
    updatedShipObj.position.clear();
    return updatedShipObj;
}

// Remove the ship position from occupied spots Set upon repositioning
function _deleteShipPositionFromOccupiedSpots(gameboardObj, shipObj) {
    let updatedGameboardObj = structuredClone(gameboardObj);
    shipObj.position.forEach((coordinate) => {
        if (updatedGameboardObj.occupiedSpots.has(coordinate)) {
            updatedGameboardObj.occupiedSpots.delete(coordinate);
        }
    });
    return updatedGameboardObj;
}

// Ensure the ship position does not overwrap the other ship position
function _checkShipPositionAvailability(
    occupiedSpots,
    shipLength,
    shipPosStateObj
) {
    let shipPosStateObjCopy = { ...shipPosStateObj };
    let currentHeadPosition = shipPosStateObjCopy.headPosition;
    let squaresToOccupy = [];

    for (let i = 0; i < shipLength; i++) {
        // Transform the array of coordinate to string(primitive)
        let positionConvertedToString = currentHeadPosition.toString();

        // If a ship coordinate is already taken OR exceeds gameboard boundary, return null
        if (
            occupiedSpots.has(positionConvertedToString) ||
            !isWithinRange(currentHeadPosition)
        ) {
            return null;
        }

        // Otherwise, add the current head position to occupiedSquares
        squaresToOccupy.push(positionConvertedToString);
        if (shipPosStateObjCopy.isHorizontal) {
            currentHeadPosition = [
                currentHeadPosition[0] + 1,
                currentHeadPosition[1],
            ];
        } else {
            currentHeadPosition = [
                currentHeadPosition[0],
                currentHeadPosition[1] + 1,
            ];
        }
    }
    return squaresToOccupy;
}

// Manage the ship positioning data in the gameboard
function setShipPosition(gameboardObj, shipPosStateObj) {
    let gameboardCopy = structuredClone(gameboardObj);
    const targetShip = gameboardCopy.ships[shipPosStateObj.shipName];

    // If position is already assigned to the ship, remove the currently stored coordinate from occupiedPosition and the ship position
    if (targetShip.position.size === targetShip.length) {
        if (!targetShip.isPositionLocked) {
            gameboardCopy = _deleteShipPositionFromOccupiedSpots(
                gameboardCopy,
                targetShip
            );
            gameboardCopy.ships[shipPosStateObj.shipName] =
                _clearCurrentShipPosition(targetShip);

            // if position set is full and locked return the current object
        } else {
            return gameboardObj;
        }
    }

    const newShipPosition = _checkShipPositionAvailability(
        gameboardCopy.occupiedSpots,
        targetShip.length,
        shipPosStateObj
    );

    // If newShipPosition gets null, return gameboardObj;
    if (!newShipPosition) {
        return gameboardObj;
    }

    // If new ship position are open, fill the squares with the current ship
    newShipPosition.forEach((position) => {
        gameboardCopy.occupiedSpots.add(position);
        gameboardCopy.ships[shipPosStateObj.shipName].position.add(position);
    });

    // If this is the confirmed position, lock the ship position
    if (shipPosStateObj.isPositionConfirmed) {
        gameboardCopy.ships[shipPosStateObj.shipName] =
            Ship.lockPosition(targetShip);
    }
    return gameboardCopy;
}

// Check if all ships are positioned before starting game
function findShipsNotPositioned(gameboardObj) {
    const shipsObj = gameboardObj.ships;
    let result = [];
    for (let shipName in shipsObj) {
        const ship = shipsObj[shipName];
        if (ship.position.size !== ship.length) {
            result.push(shipName);
        }
    }
    if (result.length === 0) {
        return null;
    } else {
        return result;
    }
}

// Reset all ship positions if player wants to change locked ship positions before starting game
function clearAllShipPositionSets(gameboardObj) {
    const gameboardCopy = structuredClone(gameboardObj);
    gameboardCopy.occupiedSpots.clear();
    for (let shipKey in gameboardCopy.ships) {
        gameboardCopy.ships[shipKey].position.clear();
        gameboardCopy.ships[shipKey].isPositionLocked = false;
    }
    return gameboardCopy;
}

// Lock all ship positions on start
function lockAllShipPositions(gameboardObj) {
    const gameboardCopy = structuredClone(gameboardObj);
    Object.keys(gameboardCopy.ships).forEach((shipName) => {
        gameboardCopy.ships[shipName].isPositionLocked = true;
    });
    return gameboardCopy;
}

// Find the ship key by position
function _findShipByAttackPosition(position, shipObj) {
    for (let shipKey in shipObj) {
        if (shipObj[shipKey].position.has(position)) {
            return shipKey;
        }
    }
}

// Manage the attacked position data in the gameboard
function receiveAttack([targetX, targetY], gameboardObj) {
    let gameboardCopy = structuredClone(gameboardObj);
    const positionConvertedToString = [targetX, targetY].toString();
    let result = false;

    // If the target coordinate is already used OR exceeds gameboard boundary, exit with unchanged gameboardCopy
    if (
        gameboardCopy.attackedSpots.has(positionConvertedToString) ||
        !isWithinRange([targetX, targetY])
    ) {
        return {
            gameboard: gameboardCopy,
            uiData: {
                isOnShip: null,
                position: positionConvertedToString,
                isValidSpot: false,
            },
        };
    }

    // Update gameboardCopy.attackedSpots with new target coordinate
    [positionConvertedToString].forEach((position) => {
        gameboardCopy.attackedSpots.add(position);
    });

    // If the position of a ship contains the the target coordinate,
    if (gameboardCopy.occupiedSpots.has(positionConvertedToString)) {
        const attackedShipKey = _findShipByAttackPosition(
            positionConvertedToString,
            gameboardCopy.ships
        );

        // add hit to the ship's hit count, update isSunk
        if (attackedShipKey) {
            gameboardCopy.ships[attackedShipKey] = Ship.hit(
                gameboardCopy.ships[attackedShipKey]
            );
            gameboardCopy.ships[attackedShipKey] = Ship.isSunk(
                gameboardCopy.ships[attackedShipKey]
            );

            // If the ship is sunk, reduce the surviving ship count
            if (gameboardCopy.ships[attackedShipKey].isSunk) {
                gameboardCopy.survivingShipCount -= 1;
            }
            result = true;
        }

        // Otherwise, record the position in missedSpots
    } else {
        gameboardCopy.missedSpots.push(positionConvertedToString);
    }
    return {
        gameboard: gameboardCopy,
        uiData: {
            isOnShip: result,
            position: positionConvertedToString,
            isValidSpot: true,
        },
    };
}

// Check if either player win
function hasNoShipLeft(survivingShipCount) {
    return survivingShipCount === 0;
}

// Wrap all public functions in an object (namespacing);
const Gameboard = {
    createGameboard,
    setShipPosition,
    isWithinRange,
    findShipsNotPositioned,
    lockAllShipPositions,
    clearAllShipPositionSets,
    receiveAttack,
    hasNoShipLeft,
};

export { Gameboard };
