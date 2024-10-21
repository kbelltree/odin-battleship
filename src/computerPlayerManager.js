import { Gameboard } from './gameboard.js';
import { GameManager } from './gameStateManager.js';

// Generate a random integer within the specific range inclusively
function _randomIntegerGenerator(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get a head position by ship
function _generateRandomShipHeadPosition(shipLength, isHorizontal) {
    const boundary = 10 - shipLength + 1;

    // If horizontal, ensure x coordinate can accommodate the entire ship length within the grid
    if (isHorizontal) {
        return [
            _randomIntegerGenerator(1, boundary),
            _randomIntegerGenerator(1, 10),
        ];
        // If vertical, ensure y coordinate can accommodate the entire ship length within the grid
    } else {
        return [
            _randomIntegerGenerator(1, 10),
            _randomIntegerGenerator(1, boundary),
        ];
    }
}

// Generate a random orientation for a ship position
function _getBooleanForShipOrientation() {
    const number = _randomIntegerGenerator(0, 1);
    if (number === 1) {
        return true;
    } else {
        return false;
    }
}

// Assemble all generated ship positioning data for computer
function _generateShipPositioningData(shipName, shipLength, isHorizontal) {
    return {
        shipName: shipName,
        isHorizontal: isHorizontal,
        headPosition: _generateRandomShipHeadPosition(shipLength, isHorizontal),
        isPositionConfirmed: false,
    };
}

// Ensure the generated position is not taken by other ship position to avoid overwrap
function _setValidShipPosition(shipName, gameboardObj) {
    // Get the ship's length
    const shipLength = gameboardObj.ships[shipName].length;

    // Check if a position is assigned to the ship
    let shipPositionSize = gameboardObj.ships[shipName].position.size;

    // Repeat positioning until the valid position is assigned to the ship
    while (shipPositionSize <= 0) {
        const shipPositioningData = _generateShipPositioningData(
            shipName,
            shipLength,
            _getBooleanForShipOrientation()
        );
        gameboardObj = Gameboard.setShipPosition(
            gameboardObj,
            shipPositioningData
        );
        shipPositionSize = gameboardObj.ships[shipName].position.size;
    }
    return gameboardObj;
}

// Assign the gameboard fulfilled with all necessary data to start the game to player2 gameboard
function setComputerInitialState() {
    let gameboard = GameManager.getInitialState('player2').gameboard;

    // Loop through each ship object to assign initial state
    for (let shipName in gameboard.ships) {
        gameboard = _setValidShipPosition(shipName, gameboard);
    }

    // Lock the position
    const updatedGameboardObj = Gameboard.lockAllShipPositions(gameboard);

    // Update the state management obj
    GameManager.updateInitialStateByPlayerKey('player2', updatedGameboardObj);
}

// Generate attack position for computer
function _generateAttackCoordinate() {
    return [_randomIntegerGenerator(1, 10), _randomIntegerGenerator(1, 10)];
}

// Create the attack function that keeps running the positions is valid one
function attackOpponent(gameboardObj) {
    let result = null;
    let attackStateCopy = GameManager.getComputerAttackState();

    // If there is any adjacent positions to try after hit position found, use one of them to attack
    do {
        if (attackStateCopy.adjacentPositions.length > 0) {
            result = Gameboard.receiveAttack(
                attackStateCopy.adjacentPositions.pop(),
                gameboardObj
            );

            // Otherwise, attack random position
        } else {
            result = Gameboard.receiveAttack(
                _generateAttackCoordinate(),
                gameboardObj
            );
        }
    } while (!result.uiData.isValidSpot);

    // If the attack is a hit, generate adjacent positions
    if (result.uiData.isOnShip) {
        const newAdjacentPositions = _generateAdjacentPositions(
            _convertPositionToNumber(result.uiData.position)
        );
        attackStateCopy.adjacentPositions = _mergeAllAdjacentPositions(
            attackStateCopy.adjacentPositions,
            newAdjacentPositions
        );

        // Then add the new adjacent positions to the state manager queue
        GameManager.updateComputerAttackState(attackStateCopy);
    }
    return result;
}

// Transform string of x, y position to a set of number array [x, y];
function _convertPositionToNumber(string) {
    return string.split(',').map(Number);
}

// Generate adjacent xy positions of the attacked coordinate
function _generateAdjacentPositions([x, y]) {
    const positions = [
        [x + 1, y],
        [x - 1, y],
        [x, y - 1],
        [x, y + 1],
    ];

    // Filter out any out of bound coordinates
    return positions.filter(Gameboard.isWithinRange);
}

// Merge current adjacentPositions and new adjacentPositions into an array excluding empty arrays
function _mergeAllAdjacentPositions(currentArray, newArray) {
    // To make LIFO to use pop() instead of unshift(), add new array to front of the existing one
    return [...newArray, ...currentArray].filter((array) => array.length > 0);
}

// Wrap all public functions in an object (namespacing);
const ComputerPlayer = {
    setComputerInitialState,
    attackOpponent,
};

export { ComputerPlayer };
