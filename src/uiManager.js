import { GameManager } from './gameStateManager.js';
import { Gameboard } from './gameboard.js';
import { ComputerPlayer } from './computerPlayerManager.js';

// Utility
function _showContent(selector) {
    document.querySelector(selector).classList.remove('hidden');
}

// Utility
function _hideContent(selector) {
    document.querySelector(selector).classList.add('hidden');
}

// Utility
function _displayMessage(messageString) {
    const messageBox = document.querySelector('.message-container p');
    messageBox.textContent = `'${messageString}'`;
    messageBox.classList.add('highlight');
}

// Utility
function _removeMessage() {
    const messageBox = document.querySelector('.message-container p');
    messageBox.textContent = '';
    if (messageBox.classList.contains('highlight')) {
        messageBox.classList.remove('highlight');
    }
}

// Attached to buttons to choose vs computer or vs other player
function _toggleStartModalByGameType(e) {
    const buttonId = e.target.id;
    switch (buttonId) {
        case 'one-player':
            _hideContent('.modal-start2');
            _showContent('.modal-start1');
            break;
        case 'two-players':
            _hideContent('.modal-start1');
            _showContent('.modal-start2');
            break;
        default:
            return;
    }
}

// Add alphabet index to x direction of the gameboard
function _indexXAxis(parentSelector) {
    // Exclude the first corner div from indexing
    const xAxisDivs = document.querySelectorAll(
        `${parentSelector} .index-label[data-y="0"]:not([data-y="0"][data-x="0"])`
    );
    const alphabetLabel = 'ABCDEFGHIJ';
    for (let i = 0; i < xAxisDivs.length; i++) {
        xAxisDivs[i].textContent = alphabetLabel[i];
    }
}

// Add numeric index to y direction of the gameboard
function _indexYAxis(parentSelector) {
    // Exclude the first corner div from indexing
    const yAxisDivs = document.querySelectorAll(
        `${parentSelector} .index-label[data-x="0"]:not([data-y="0"][data-x="0"])`
    );
    for (let i = 0; i < yAxisDivs.length; i++) {
        yAxisDivs[i].textContent = i + 1;
    }
}

// Show modal in the initial / replay loads
function _displayEntryModal() {
    _handleElementClick('#one-player', _toggleStartModalByGameType);
    // _handleElementClick('#two-players', _toggleStartModalByGameType);
}

// Dynamically create gameboards with index
function _displayGameboardGrid(parentSelector) {
    const parentDiv = document.querySelector(parentSelector);
    const fragment = document.createDocumentFragment();
    for (let y = 0; y < 11; y++) {
        for (let x = 0; x < 11; x++) {
            let div = document.createElement('div');

            // First y column and x row are used for index label
            if (y === 0 || x === 0) {
                div.classList.add('index-label');
            } else {
                div.classList.add('square');
            }
            div.dataset.y = y;
            div.dataset.x = x;
            fragment.appendChild(div);
        }
    }

    parentDiv.appendChild(fragment);
    _indexXAxis(parentSelector);
    _indexYAxis(parentSelector);
    return parentDiv;
}

// Clean up the previous gameboard for replay
function _refreshGameboardGrid(parentSelector) {
    const parentDiv = document.querySelector(parentSelector);

    while (parentDiv.firstChild) {
        parentDiv.removeChild(parentDiv.firstChild);
    }
}

// Used for adding style in the square
function _convertPositionToSelector(positionString) {
    const [x, y] = positionString.split(',');
    return `.square[data-x='${x}'][data-y='${y}']`;
}

// Used for adding style to the button to indicate the ships not positioned
function _highlightUnSetShipButton(unSetShipArray) {
    const shipButtons = document.querySelectorAll('.ship-buttons button');
    shipButtons.forEach((button) => {
        const shipName = button.getAttribute('data-ship');
        if (unSetShipArray === null || !unSetShipArray.includes(shipName)) {
            button.classList.remove('unset');
        } else {
            button.classList.add('unset');
        }
    });
}

// Add style to the positioned ship on the gameboard
function _displayShipPosition(gameboardId, shipPositions, shipDataKey) {
    const gameboard = document.querySelector(gameboardId);
    shipPositions.forEach((position) => {
        const square = gameboard.querySelector(
            _convertPositionToSelector(position)
        );
        if (square) {
            square.classList.add('ship-position');
            square.dataset.ship = shipDataKey;
            square.textContent = shipDataKey[0];
        }
    });
}

// Clear the all positioned ships from gameboard on reset
function _removeShipPositionsFromDisplay(gameboardId, shipDataKey = null) {
    const gameboard = document.querySelector(gameboardId);

    // if all ships need to be removed
    let shipPositions = gameboard.querySelectorAll('.ship-position');

    // if one specific ship needs to be removed
    if (shipDataKey) {
        shipPositions = gameboard.querySelectorAll(
            `[data-ship="${shipDataKey}"]`
        );
    }
    shipPositions.forEach((position) => {
        position.classList.remove('ship-position');
        delete position.dataset.ship;
        position.textContent = null;
    });
}

// Show a new ship's position on the grid after positioned
function _updateGameboardDisplay(shipPosStateObj, gameboardObj) {
    // Clear the ship position from the old position if already displayed
    _removeShipPositionsFromDisplay('#gameboard1', shipPosStateObj.shipName);

    // Display the new ship position on the grid
    _displayShipPosition(
        '#gameboard1',
        gameboardObj.ships[shipPosStateObj.shipName].position,
        shipPosStateObj.shipName
    );

    // Remove highlight from current ship button to indicate the ship is positioned
    _highlightUnSetShipButton(Gameboard.findShipsNotPositioned(gameboardObj));
}

// Update the gameboard data of player1 with new ship position
function _handleShipPositionUpdate(
    shipPosStateObj,
    gameboardObj,
    playerKey = 'player1'
) {
    // Update the new ship's position of the gameboard obj
    gameboardObj = Gameboard.setShipPosition(gameboardObj, shipPosStateObj);

    // Update the display with the new gameboard data
    _updateGameboardDisplay(shipPosStateObj, gameboardObj);

    // Update the states of ship position and gameboard
    GameManager.updateShipPositioningState(shipPosStateObj);
    GameManager.updateInitialStateByPlayerKey(playerKey, gameboardObj);
}

// Attached to ship buttons
function _getShipButtonData(e) {
    const shipData = e.target.dataset.ship;
    if (shipData) {
        return shipData;
    }
}

// Attached to each square on the gameboard
function _getSquarePositionData(e) {
    const { x, y } = e.target.dataset;
    if (x && y) {
        return [Number.parseInt(x), Number.parseInt(y)];
    }
}

// Utility that attaches onclick eventListener
function _handleElementClick(elementSelector, callback) {
    const element = document.querySelector(elementSelector);
    element.addEventListener('click', callback);
}

// Callback for ship button click event
function _handleShipButtonClick(e) {
    if (e.target.tagName === 'BUTTON') {
        // Get the new ship name
        const newShipName = _getShipButtonData(e);

        // Get the current status data
        let currentPositioningData = GameManager.getShipPositioningState();

        // Clear the positioning data if it is the same ship name
        // or the initial positioning of one of the ships
        if (
            currentPositioningData.shipName === null ||
            currentPositioningData.shipName === newShipName
        ) {
            GameManager.resetShipPositioningState();
            currentPositioningData = GameManager.getShipPositioningState();
        }

        // Update with new ship info
        currentPositioningData.shipName = newShipName;
        currentPositioningData.isHorizontal = true;
        GameManager.updateShipPositioningState(currentPositioningData);

        // Display message
        _displayMessage('Click Start to begin after all ships are positioned.');
    }
}

// Attached to rotate button
function _toggleHorizontalVertical(shipPosStateObj) {
    return !shipPosStateObj.isHorizontal;
}

// Callback for rotate button click event
function _handleRotateButtonClick() {
    let positioningData = GameManager.getShipPositioningState();
    let gameboardObj = GameManager.getInitialState('player1').gameboard;

    // Assign isHorizontal boolean to positioningData
    positioningData.isHorizontal = _toggleHorizontalVertical(positioningData);

    _handleShipPositionUpdate(positioningData, gameboardObj, 'player1');
}

// Attached to the gameboard squares, deactivated after start button click
function _enablePositioningModeOnOwnGrid(e) {
    const square = e.target.classList.contains('square');
    if (square) {
        let positioningData = GameManager.getShipPositioningState();
        let gameboardObj = GameManager.getInitialState('player1').gameboard;

        // Assign head position to positioningData
        positioningData.headPosition = _getSquarePositionData(e);

        _handleShipPositionUpdate(positioningData, gameboardObj, 'player1');
        _displayMessage(
            'Click Rotate button to change orientation of the ship.'
        );
    }
}

// Callback for start button click event
function _removeShipPositioningEventListeners() {
    document
        .querySelector('#gameboard1')
        .removeEventListener('click', _enablePositioningModeOnOwnGrid);
    document
        .querySelector('#rotate-btn')
        .removeEventListener('click', _handleRotateButtonClick);
    document
        .querySelector('#reset-btn')
        .removeEventListener('click', _handleResetButtonClick);
}

// Callback attached to start button click event to deactivates further ship positioning on the gameboard
function _disablePositioningModeOnOwnGrid(gameboardObj) {
    // Remove the entire eventListeners related to ship positioning
    _removeShipPositioningEventListeners();

    // Lock all the positions and update the gameboard state management
    GameManager.updateInitialStateByPlayerKey(
        'player1',
        Gameboard.lockAllShipPositions(gameboardObj)
    );
}

// Attached to the gameboard square, activated after start button click
function _displayAttackedPosition(gameboardId, uiObj) {
    const gameboard = document.querySelector(gameboardId);
    const square = gameboard.querySelector(
        _convertPositionToSelector(uiObj.position)
    );
    const squareColoring = document.createElement('div');
    if (uiObj.isOnShip === null) {
        return;
    }
    if (uiObj.isOnShip) {
        squareColoring.classList.add('hit-position');
        square.appendChild(squareColoring);
    }
    if (!uiObj.isOnShip) {
        squareColoring.classList.add('miss-position');
        square.appendChild(squareColoring);
    }
}

// Attached to the opponents's gameboard squares, activated after start button click
function _enableAttackModeOnAttackGrid(e, opponentGameboardObj) {
    const square = e.target.classList.contains('square');
    _removeMessage();
    // If it is not the turn, return
    if (GameManager.getCurrentTurn() !== 'player1') {
        _displayMessage('It is not your turn.');
        return;
    }
    const coordinate = _getSquarePositionData(e);
    if (square && coordinate.length === 2) {
        const result = Gameboard.receiveAttack(
            coordinate,
            opponentGameboardObj
        );

        // If the attacked position is already used in a previous attack, keep the turn to retry a new position
        if (!result.uiData.isValidSpot) {
            _displayMessage(
                'The spot is already attacked. Retry another spot.'
            );
            GameManager.setTurn('player1');
            return;
        }
        _displayAttackedPosition('#gameboard2', result.uiData);
        GameManager.updateGameInProgressState(result.gameboard, 'player2');
        GameManager.setTurn('player2');
    }
}

// Attached to the own gameboard squares, activated after start button click
function _enableReceiveAttackModeOnOwnGrid(opponentGameboardObj) {
    _removeMessage();
    // If it is not the turn, return
    if (GameManager.getCurrentTurn() !== 'player2') {
        return;
    }
    const result = ComputerPlayer.attackOpponent(opponentGameboardObj);
    _displayAttackedPosition('#gameboard1', result.uiData);
    GameManager.updateGameInProgressState(result.gameboard, 'player1');
    GameManager.setTurn('player1');
}

// Check if either win and display message
function _isGameOver(ownGameboardObj, computerGameboardObj) {
    const isPlayerWin = Gameboard.hasNoShipLeft(
        computerGameboardObj.survivingShipCount
    );
    const isComputerWin = Gameboard.hasNoShipLeft(
        ownGameboardObj.survivingShipCount
    );
    if (isPlayerWin && isComputerWin) {
        _displayMessage('It is a Tie!');
        return true;
    } else if (isPlayerWin) {
        _displayMessage('You Win!');
        return true;
    } else if (isComputerWin) {
        _displayMessage('Computer Win!');
        return true;
    } else {
        return false;
    }
}

// Consolidate attack related functions of both
function _addAttackHandlerToBothGrids(e) {
    const ownGameboard = GameManager.getGameInProgressState().player1.gameboard;
    const computerGameboard =
        GameManager.getGameInProgressState().player2.gameboard;

    // Player attacks a position
    _enableAttackModeOnAttackGrid(e, computerGameboard);

    // After half a second, computer attacks a position
    setTimeout(() => {
        _enableReceiveAttackModeOnOwnGrid(ownGameboard);

        // Check the game status
        const isGameOver = _isGameOver(ownGameboard, computerGameboard);
        console.log('Game over check:', isGameOver);

        // If the game is over,
        if (isGameOver) {
            // terminate the game
            document
                .querySelector('#gameboard2')
                .removeEventListener('click', _addAttackHandlerToBothGrids);

            // and 3 seconds later, show replay button
            setTimeout(() => {
                _showContent('.ending-overlay');
            }, 3000);
        }
    }, 500);
}

// Attached to reset button
function _handleResetButtonClick() {
    const resetGameboard = Gameboard.clearAllShipPositionSets(
        GameManager.getInitialState('player1').gameboard
    );
    GameManager.updateInitialStateByPlayerKey('player1', resetGameboard);
    GameManager.resetShipPositioningState();
    _removeShipPositionsFromDisplay('#gameboard1');
    _highlightUnSetShipButton(
        Gameboard.findShipsNotPositioned(
            GameManager.getInitialState('player1').gameboard
        )
    );
    _displayMessage('Ship positions were reset.');
}

// Attached to start button
function _handleStartButtonClick() {
    // Find if there is any ships not positioned yet
    const gameboardObj = GameManager.getInitialState('player1').gameboard;
    const shipsNotPositioned = Gameboard.findShipsNotPositioned(gameboardObj);

    // If there is, display message
    if (shipsNotPositioned) {
        _displayMessage('Please position all the ships to start the game.');
        return;
    } else {
        // Set up the game to start
        _disablePositioningModeOnOwnGrid(gameboardObj);
        _displayMessage('Game Started.');

        // Assign the entire copy of the initialState obj to gameInProgressState
        GameManager.updateGameInProgressState(GameManager.getInitialState());

        // Add attack related eventListener to all grids
        document
            .querySelector('#gameboard2')
            .addEventListener('click', _addAttackHandlerToBothGrids);

        // Disable further start button click
        document.getElementById('start-btn').disabled = true;

        // Hide the buttons
        _hideContent('.buttons-container');
    }
}

function renderInitialPage() {
    _displayEntryModal();
    _displayGameboardGrid('#gameboard1');
    _displayGameboardGrid('#gameboard2');
    GameManager.setInitialGameState();
    GameManager.resetShipPositioningState();
    // Add the entire computer ship positions to gameboard2.gameboard
    ComputerPlayer.setComputerInitialState();
    _displayMessage(
        'Click a ship button. Then pick a square of Own Grid to place it!'
    );
}

function addEventListenerToEnterButton() {
    _handleElementClick('#enter-btn', () => _hideContent('.initial-overlay'));
}

function addEventListenerToShipButtons() {
    _handleElementClick('.ship-buttons', _handleShipButtonClick);
}

function addEventListenerToRotateButton() {
    _handleElementClick('#rotate-btn', _handleRotateButtonClick);
}

function addEventListenerToResetButton() {
    _handleElementClick('#reset-btn', _handleResetButtonClick);
}

function addEventListenerToStartButton() {
    _handleElementClick('#start-btn', _handleStartButtonClick);
}

function addEventListenerToOwnGridSquares() {
    _handleElementClick('#gameboard1', _enablePositioningModeOnOwnGrid);
}

// Reconstruct the game back the initial state
function _restoreGame() {
    _refreshGameboardGrid('#gameboard1');
    _refreshGameboardGrid('#gameboard2');
    renderInitialPage();
    addEventListenerToOwnGridSquares();
    addEventListenerToRotateButton();
    addEventListenerToResetButton();
    addEventListenerToStartButton();
    document.querySelectorAll('.ship-buttons button').forEach((button) => {
        button.classList.add('unset');
    });
    document.getElementById('start-btn').disabled = false;
    _showContent('.buttons-container');
    _displayMessage('Click a ship button. Then pick a square to place it!');
}

function addEventListenerToReplayButton() {
    _handleElementClick('#replay-btn', () => {
        _hideContent('.ending-overlay');
        _restoreGame();
    });
}

// Wrap all public functions in an object (namespacing);
const UIManager = {
    renderInitialPage,
    addEventListenerToEnterButton,
    addEventListenerToShipButtons,
    addEventListenerToRotateButton,
    addEventListenerToResetButton,
    addEventListenerToStartButton,
    addEventListenerToOwnGridSquares,
    addEventListenerToReplayButton,
};

export { UIManager };
