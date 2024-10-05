import { initiatePlayer } from './players.js';

let GameState = {
    // State manager variables for ship positioning
    initialState: null,
    shipPositioningState: {
        shipName: null,
        headPosition: null,
        isHorizontal: true,
        isPositionConfirmed: false,
    },

    // State manager for the game to proceed
    gameInProgressState: null,
    currentTurn: 'player1',

    // Computer's attack state manager for Human vs Computer
    // Use adjacent positions of a hit position for make computer smart
    computerAttackState: {
        adjacentPositions: [],
    },
};

// Return the initial state object containing both gameboards
function setInitialGameState(namePlayer1, namePlayer2) {
    GameState.initialState = {
        player1: initiatePlayer(namePlayer1),
        player2: initiatePlayer(namePlayer2),
    };
    console.log('initialState: ', GameState.initialState);
}

// Get players data
function getInitialState(playerKey = null) {
    if (!playerKey) {
        return structuredClone(GameState.initialState);
    } else {
        return structuredClone(GameState.initialState[playerKey]);
    }
}

// Update initialState with the player's gameboard object containing new data
function updateInitialStateByPlayerKey(playerKey, gameboardObj) {
    if (GameState.initialState[playerKey].gameboard) {
        GameState.initialState[playerKey].gameboard = gameboardObj;
    }
    console.log('initialState after update: ', GameState.initialState);
}

// Reset the ship positioning state object for a new ship positioning
function resetShipPositioningState() {
    GameState.shipPositioningState = {
        shipName: null,
        headPosition: null,
        isHorizontal: true,
        isPositionConfirmed: false,
    };
}

// Retrieve a copy of the ship positioning state object
function getShipPositioningState() {
    return { ...GameState.shipPositioningState };
}

// Update ship positioning state with a new ship positioning data
function updateShipPositioningState(positioningObj) {
    GameState.shipPositioningState = positioningObj;
}

// Update either entire game object or by player's gameboard with progressed game data
function updateGameInProgressState(gameObj, playerKey = null) {
    if (!playerKey) {
        GameState.gameInProgressState = gameObj;
    } else {
        GameState.gameInProgressState[playerKey].gameboard = gameObj;
    }
}

// Retrieve a copy of the entire game object
function getGameInProgressState() {
    return structuredClone(GameState.gameInProgressState);
}

// Retrieve a copy of the computer's attack state object
function getComputerAttackState() {
    return { ...GameState.computerAttackState };
}

// Update the computer's attack state with new data
function updateComputerAttackState(stateObj) {
    GameState.computerAttackState = stateObj;
}

// Manage the turn
function setTurn(playerKey) {
    GameState.currentTurn = playerKey;
}

// Track the turn
function getCurrentTurn() {
    return GameState.currentTurn;
}

// Wrap all public functions in an object (namespacing);
const GameManager = {
    setInitialGameState,
    getInitialState,
    updateInitialStateByPlayerKey,
    resetShipPositioningState,
    getShipPositioningState,
    updateShipPositioningState,
    getGameInProgressState,
    updateGameInProgressState,
    getComputerAttackState,
    updateComputerAttackState,
    setTurn,
    getCurrentTurn,
};

export { GameManager };
