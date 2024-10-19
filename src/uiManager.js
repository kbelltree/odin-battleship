import { GameManager } from './gameStateManager.js';
import { Gameboard } from './gameboard.js';
import { ComputerPlayer } from './computerPlayerManager.js';

const DisplayManager = {
    Utilities: {
        _showContent: function (selector) {
            document.querySelector(selector).classList.remove('hidden');
        },

        _hideContent: function (selector) {
            document.querySelector(selector).classList.add('hidden');
        },

        _displayMessage: function (messageString) {
            const messageBox = document.querySelector('.message-container p');
            messageBox.textContent = `'${messageString}'`;
            messageBox.classList.add('highlight');
        },

        _removeMessage: function () {
            const messageBox = document.querySelector('.message-container p');
            messageBox.textContent = '';
            if (messageBox.classList.contains('highlight')) {
                messageBox.classList.remove('highlight');
            }
        },

        // Add alphabet index to x direction of the gameboard
        _indexXAxis: function (parentSelector) {
            // Exclude the first corner div from indexing
            const xAxisDivs = document.querySelectorAll(
                `${parentSelector} .index-label[data-y="0"]:not([data-y="0"][data-x="0"])`
            );
            const alphabetLabel = 'ABCDEFGHIJ';
            for (let i = 0; i < xAxisDivs.length; i++) {
                xAxisDivs[i].textContent = alphabetLabel[i];
            }
        },

        // Add numeric index to y direction of the gameboard
        _indexYAxis: function (parentSelector) {
            // Exclude the first corner div from indexing
            const yAxisDivs = document.querySelectorAll(
                `${parentSelector} .index-label[data-x="0"]:not([data-y="0"][data-x="0"])`
            );
            for (let i = 0; i < yAxisDivs.length; i++) {
                yAxisDivs[i].textContent = i + 1;
            }
        },

        // Used for adding style in the square
        _convertPositionToSelector: function (positionString) {
            const [x, y] = positionString.split(',');
            return `.square[data-x='${x}'][data-y='${y}']`;
        },

        // Capitalize player's name in the message
        _capitalizeName(string) {
            return string[0].toUpperCase() + string.substring(1);
        },
    },

    // Attached to buttons to choose vs computer or vs other player
    _toggleEntryModalByGameType: function (e) {
        const buttonId = e.target.id;
        switch (buttonId) {
            case 'one-player':
                DisplayManager.Utilities._hideContent('.modal-start2');
                DisplayManager.Utilities._showContent('.modal-start1');
                break;
            case 'two-players':
                DisplayManager.Utilities._hideContent('.modal-start1');
                DisplayManager.Utilities._showContent('.modal-start2');
                break;
            default:
                return;
        }
    },

    // Show modal in the initial / replay loads
    _displayEntryModal: function () {
        EventListeners.Utilities._handleElementClick(
            '#one-player',
            DisplayManager._toggleEntryModalByGameType
        );
        EventListeners.Utilities._handleElementClick(
            '#two-players',
            DisplayManager._toggleEntryModalByGameType
        );
    },

    // Dynamically create gameboards with index
    _displayGameboardGrid: function (parentSelector) {
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
        DisplayManager.Utilities._indexXAxis(parentSelector);
        DisplayManager.Utilities._indexYAxis(parentSelector);
        return parentDiv;
    },

    // Clean up the previous gameboard for replay
    _refreshGameboardGrid: function (parentSelector) {
        const parentDiv = document.querySelector(parentSelector);
        while (parentDiv.firstChild) {
            parentDiv.removeChild(parentDiv.firstChild);
        }
    },

    // Used for adding style to the button to indicate the ships not positioned
    _highlightUnSetShipButton: function (unSetShipArray) {
        const shipButtons = document.querySelectorAll('.ship-buttons button');
        shipButtons.forEach((button) => {
            const shipName = button.getAttribute('data-ship');
            if (unSetShipArray === null || !unSetShipArray.includes(shipName)) {
                button.classList.remove('unset');
            } else {
                button.classList.add('unset');
            }
        });
    },

    // Clear the all positioned ships from gameboard on reset
    _removeShipPositionsFromDisplay: function (
        gameboardId,
        shipDataKey = null
    ) {
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
    },

    // Show a new ship's position on the grid after positioned
    _updateGameboardDisplay: function (shipPosStateObj, gameboardObj) {
        // Clear the ship position from the old position if already displayed
        DisplayManager._removeShipPositionsFromDisplay(
            '#gameboard1',
            shipPosStateObj.shipName
        );

        // Display the new ship position on the grid
        DisplayManager._displayShipPosition(
            '#gameboard1',
            gameboardObj.ships[shipPosStateObj.shipName].position,
            shipPosStateObj.shipName
        );

        // Remove highlight from current ship button to indicate the ship is positioned
        DisplayManager._highlightUnSetShipButton(
            Gameboard.findShipsNotPositioned(gameboardObj)
        );
    },

    // Add style to the positioned ship on the gameboard
    _displayShipPosition: function (gameboardId, shipPositions, shipDataKey) {
        const gameboard = document.querySelector(gameboardId);
        shipPositions.forEach((position) => {
            const square = gameboard.querySelector(
                DisplayManager.Utilities._convertPositionToSelector(position)
            );
            if (square) {
                square.classList.add('ship-position');
                square.dataset.ship = shipDataKey;
                square.textContent = shipDataKey[0];
            }
        });
    },

    // Display the all of the ships, hit, miss positions at the end of the game
    _displayFinalPositions(gameboardObj, gameboardId) {
        const { occupiedSpots } = gameboardObj;
        const gameboard = document.querySelector(gameboardId);
        occupiedSpots.forEach((position) => {
            const square = gameboard.querySelector(
                DisplayManager.Utilities._convertPositionToSelector(position)
            );
            const shipColor = document.createElement('div');
            if (square) {
                shipColor.classList.add('ship-color');
                square.appendChild(shipColor);
            }
        });
    },

    // Attached to rotate button
    _toggleHorizontalVertical: function (shipPosStateObj) {
        return !shipPosStateObj.isHorizontal;
    },

    // Reset ship buttons highlight
    _removeHighlightFromShipButtons: function (selector) {
        document.querySelectorAll(selector).forEach((button) => {
            button.classList.add('unset');
        });
    },

    // Highlight the title of current turn gameboard for duo ver.
    _highLightCurrentTurnGrid: function (currentTurn) {
        const gameboard1 = document.getElementById('gameboard1');
        const gameboard2 = document.getElementById('gameboard2');

        // Remove 'active' class from both parent containers first
        gameboard1.parentElement.classList.remove('active');
        gameboard2.parentElement.classList.remove('active');

        // Add 'active' class to the relevant parent container
        if (currentTurn === 'player1') {
            gameboard1.parentElement.classList.add('active');
        } else {
            gameboard2.parentElement.classList.add('active');
        }
    },

    // Highlight the title of current turn gameboard for duo ver.
    _highLightCurrentTurnTitle: function (currentTurn) {
        const player1 = document.querySelector('.gb1-title');
        const player2 = document.querySelector('.gb2-title');

        // Remove 'active' class from both parent containers first
        player1.classList.remove('active');
        player2.classList.remove('active');

        // Add 'active' class to the relevant parent container
        if (currentTurn === 'player1') {
            player1.classList.add('active');
        } else {
            player2.classList.add('active');
        }
    },

    // Remove highligh from title
    _removeHighlightFromTitle: function () {
        document.querySelector('.gb1-title').classList.remove('active');
        document.querySelector('.gb2-title').classList.remove('active');
    },

    // Attached to the gameboard square, activated after start button click
    _displayAttackedPosition: function (gameboardId, uiObj) {
        const gameboard = document.querySelector(gameboardId);
        const square = gameboard.querySelector(
            DisplayManager.Utilities._convertPositionToSelector(uiObj.position)
        );
        const squareColoring = document.createElement('div');
        if (uiObj.isOnShip === null) {
            return;
        }
        if (uiObj.isOnShip) {
            squareColoring.classList.add('hit-position');
            square.appendChild(squareColoring);
            DisplayManager.Utilities._displayMessage('It is a hit💥');
        }
        if (!uiObj.isOnShip) {
            squareColoring.classList.add('miss-position');
            square.appendChild(squareColoring);
        }
    },

    _displayWinnerAnnouncement(gameResultObj) {
        if (gameResultObj.winner === 'tie') {
            DisplayManager.Utilities._displayMessage('It is a Tie 🤝');
        } else {
            DisplayManager.Utilities._displayMessage(
                `${DisplayManager.Utilities._capitalizeName(gameResultObj.winner)} Win 🎉`
            );
        }
    },
};

const DOMInteractions = {
    Utilities: {
        // Attached to each square on the gameboard
        _getSquarePositionData: function (e) {
            const { x, y } = e.target.dataset;
            if (x && y) {
                return [Number.parseInt(x), Number.parseInt(y)];
            }
        },

        // Attached to ship buttons
        _getShipButtonData: function (e) {
            const shipData = e.target.dataset.ship;
            if (shipData) {
                return shipData;
            }
        },

        // Clear form entry
        _clearFormEntry: function (formId) {
            document.getElementById(formId).reset();
        },
    },

    // Update the gameboard data player by key with new ship position
    _handleShipPositionUpdate: function (
        shipPosStateObj,
        gameboardObj,
        playerKey = 'player1'
    ) {
        // Update the new ship's position of the gameboard obj
        gameboardObj = Gameboard.setShipPosition(gameboardObj, shipPosStateObj);

        // Update the display with the new gameboard data
        DisplayManager._updateGameboardDisplay(shipPosStateObj, gameboardObj);

        // Update the states of ship position and gameboard
        GameManager.updateShipPositioningState(shipPosStateObj);
        GameManager.updateInitialStateByPlayerKey(playerKey, gameboardObj);
    },

    _handleRotateButtonClick: function (
        positioningData,
        gameboardObj,
        playerKey
    ) {
        // Assign isHorizontal boolean to positioningData
        positioningData.isHorizontal =
            DisplayManager._toggleHorizontalVertical(positioningData);

        DOMInteractions._handleShipPositionUpdate(
            positioningData,
            gameboardObj,
            playerKey
        );
    },

    // Attached to ship button on click event
    _handleShipButtonClick: function (e) {
        if (e.target.tagName === 'BUTTON') {
            // Get the new ship name
            const newShipName = DOMInteractions.Utilities._getShipButtonData(e);

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
            DisplayManager.Utilities._displayMessage(
                `Click Start or Confirm after all ships are positioned.`
            );
        }
    },

    // Attached to grids on load
    _enablePositioningModeOnGrid: function (
        e,
        positioningData,
        gameboardObj,
        playerKey
    ) {
        const square = e.target.classList.contains('square');
        if (square) {
            // Assign head position to positioningData
            positioningData.headPosition =
                DOMInteractions.Utilities._getSquarePositionData(e);
            DOMInteractions._handleShipPositionUpdate(
                positioningData,
                gameboardObj,
                playerKey
            );
            DisplayManager.Utilities._displayMessage(
                'Click Rotate button to change orientation of the ship.'
            );
        }
    },

    // For both solo ver. and duo ver. attached to reset button
    _handleResetButtonClick: function (playerKey) {
        const resetGameboard = Gameboard.clearAllShipPositionSets(
            GameManager.getInitialState(playerKey).gameboard
        );
        GameManager.updateInitialStateByPlayerKey(playerKey, resetGameboard);
        GameManager.resetShipPositioningState();
        DisplayManager._removeShipPositionsFromDisplay('#gameboard1');
        DisplayManager._highlightUnSetShipButton(
            Gameboard.findShipsNotPositioned(
                GameManager.getInitialState(playerKey).gameboard
            )
        );
        DisplayManager.Utilities._displayMessage('Ship positions were reset.');
    },

    // Reconstruct the game back the initial state
    _restoreGame: function () {
        DOMInteractions.Utilities._clearFormEntry('form');
        DisplayManager._removeHighlightFromTitle();
        DisplayManager._refreshGameboardGrid('#gameboard1');
        DisplayManager._refreshGameboardGrid('#gameboard2');
        EventListeners.renderInitialPage();
        DisplayManager.Utilities._hideContent('.gb1-title');
        DisplayManager.Utilities._hideContent('.gb2-title');
        document.getElementById('start-btn').disabled = false;
        DisplayManager.Utilities._showContent('.buttons-container');
    },
};

const SoloGame = {
    Handlers: {
        // For solo ver. and player one in duo ver.
        _rotateP1: function () {
            DOMInteractions._handleRotateButtonClick(
                GameManager.getShipPositioningState(),
                GameManager.getInitialState('player1').gameboard,
                'player1'
            );
        },

        // For solo ver. and player one in duo ver.
        _resetP1: function () {
            DOMInteractions._handleResetButtonClick('player1');
        },

        // For solo ver. and player one in duo ver.
        _enablePositioningP1: function (e) {
            DOMInteractions._enablePositioningModeOnGrid(
                e,
                GameManager.getShipPositioningState(),
                GameManager.getInitialState('player1').gameboard,
                'player1'
            );
        },

        // Attached to start button
        _start: function () {
            // Find if there is any ships not positioned yet
            const gameboardObj =
                GameManager.getInitialState('player1').gameboard;
            const shipsNotPositioned =
                Gameboard.findShipsNotPositioned(gameboardObj);

            // If there is, display message
            if (shipsNotPositioned) {
                DisplayManager.Utilities._displayMessage(
                    'Please position all the ships to start the game.'
                );
                return;
            } else {
                // Set up the game to start
                SoloGame._disablePositioningMode(gameboardObj);
                DisplayManager.Utilities._displayMessage(
                    'Game Started. Click on a square on Attack Grid to attack the enemy!'
                );

                // Assign the entire copy of the initialState obj to gameInProgressState
                GameManager.updateGameInProgressState(
                    GameManager.getInitialState()
                );

                // Add attack related eventListener to all grids
                document
                    .querySelector('#gameboard2')
                    .addEventListener('click', SoloGame._enableAttackMode);

                // Reset ship buttons display
                DisplayManager._removeHighlightFromShipButtons(
                    '.ship-buttons button'
                );

                // Disable further start button click
                document.getElementById('start-btn').disabled = true;

                // Hide the buttons
                DisplayManager.Utilities._hideContent('.buttons-container');
            }
        },

        // Attach to enter button
        _enter: function (e) {
            const gameType = e.target.dataset.game;
            console.log(
                '_handleGameTypeClickOnEntryModal invoked on entry button click, dataset-game: ',
                gameType
            );
            SoloGame._setUpInitialGamePage();

            // Activate positioning mode on #gameboard1
            EventListeners.Utilities._handleElementClick(
                '#gameboard1',
                SoloGame.Handlers._enablePositioningP1
            );
        },
    },

    _displayGameboardTitles: function () {
        const titleSpot1 = document.querySelector('.gb1-title');
        const titleSpot2 = document.querySelector('.gb2-title');
        titleSpot1.textContent = 'Own Grid';
        titleSpot2.textContent = 'Attack Grid';
        DisplayManager.Utilities._showContent('.gb1-title');
        DisplayManager.Utilities._showContent('.gb2-title');
    },

    _activatePositioningHandlers: function () {
        // Add solo game eventListeners to buttons
        EventListeners.Utilities._handleElementClick(
            '#rotate-btn',
            SoloGame.Handlers._rotateP1
        );
        EventListeners.Utilities._handleElementClick(
            '#reset-btn',
            SoloGame.Handlers._resetP1
        );
        EventListeners.Utilities._handleElementClick(
            '#start-btn',
            SoloGame.Handlers._start
        );

        // Activate positioning mode on #gameboard1
        EventListeners.Utilities._handleElementClick(
            '#gameboard1',
            SoloGame.Handlers._enablePositioningP1
        );
    },

    _deactivatePositioningHandlers: function () {
        EventListeners.Utilities._removeClickHandler(
            '#gameboard1',
            SoloGame.Handlers._enablePositioningP1
        );
        EventListeners.Utilities._removeClickHandler(
            '#rotate-btn',
            SoloGame.Handlers._rotateP1
        );
        EventListeners.Utilities._removeClickHandler(
            '#reset-btn',
            SoloGame.Handlers._resetP1
        );
    },

    _setUpInitialGamePage: function () {
        // Set up initial game state
        GameManager.setInitialGameState();

        // Display titles
        SoloGame._displayGameboardTitles();

        // Display both grid
        DisplayManager._displayGameboardGrid('#gameboard1');
        DisplayManager._displayGameboardGrid('#gameboard2');

        // Add ship positioning eventListeners
        SoloGame._activatePositioningHandlers();

        // Add the entire computer ship positions to gameboard2.gameboard
        ComputerPlayer.setComputerInitialState();

        DisplayManager.Utilities._displayMessage(
            'Click a ship button. Then pick a square of Own Grid to place it!'
        );
    },

    // Callback attached to start
    _disablePositioningMode: function (gameboardObj) {
        // Remove the entire eventListeners related to ship positioning
        SoloGame._deactivatePositioningHandlers();

        // Lock all the positions and update the gameboard state management
        GameManager.updateInitialStateByPlayerKey(
            'player1',
            Gameboard.lockAllShipPositions(gameboardObj)
        );
    },

    // Game over check
    _checkGameIsOver: function (playerGameboardObj, computerGameboardObj) {
        const isPlayerWin = Gameboard.hasNoShipLeft(
            computerGameboardObj.survivingShipCount
        );
        const isComputerWin = Gameboard.hasNoShipLeft(
            playerGameboardObj.survivingShipCount
        );

        // If there is no winner, continue the play
        if (!isPlayerWin && !isComputerWin) {
            return { isGameOver: false, winner: null };

            // Otherwise, announce the winner and end the game
        } else if (isPlayerWin && !isComputerWin) {
            return { isGameOver: true, winner: 'you' };
        } else if (!isPlayerWin && isComputerWin) {
            return { isGameOver: true, winner: 'computer' };
        } else {
            return { isGameOver: true, winner: 'tie' };
        }
    },

    // Terminate the game
    _handleGameOver() {
        EventListeners.Utilities._removeClickHandler(
            '#gameboard2',
            SoloGame._enableAttackMode
        );

        // Show replay button
        setTimeout(() => {
            DisplayManager.Utilities._showContent('.ending-overlay');
            DisplayManager.Utilities._removeMessage(); // TODO: remove if it is not needed.
        }, 5000);
    },

    // Attached to the opponent's gameboard squares, activated after start button click
    _enableAttackModeOnAttackGrid: function (e, opponentGameboardObj) {
        const square = e.target.classList.contains('square');
        DisplayManager.Utilities._removeMessage();

        // If it is not the turn, return
        if (GameManager.getCurrentTurn() !== 'player1') {
            DisplayManager.Utilities._displayMessage('It is not your turn.');
            return;
        }
        const coordinate = DOMInteractions.Utilities._getSquarePositionData(e);
        if (square && coordinate.length === 2) {
            const result = Gameboard.receiveAttack(
                coordinate,
                opponentGameboardObj
            );

            // If the attacked position is already used in a previous attack, keep the turn to retry a new position
            if (!result.uiData.isValidSpot) {
                DisplayManager.Utilities._displayMessage(
                    'The spot is already attacked. Retry another spot.'
                );
                GameManager.setTurn('player1');
                return;
            }
            DisplayManager._displayAttackedPosition(
                '#gameboard2',
                result.uiData
            );
            GameManager.updateGameInProgressState(result.gameboard, 'player2');
            GameManager.setTurn('player2');
        }
    },

    // Attached to the own gameboard squares, activated after start button click
    _enableReceiveAttackModeOnOwnGrid: function (opponentGameboardObj) {
        DisplayManager.Utilities._removeMessage();
        // If it is not the turn, return
        if (GameManager.getCurrentTurn() !== 'player2') {
            return;
        }
        const result = ComputerPlayer.attackOpponent(opponentGameboardObj);
        DisplayManager._displayAttackedPosition('#gameboard1', result.uiData);
        GameManager.updateGameInProgressState(result.gameboard, 'player1');
        GameManager.setTurn('player1');
    },

    // Enable attack modes on player and computer
    _enableAttackMode(e) {
        const gameData = GameManager.getGameInProgressState();
        const ownGameboard = gameData.player1.gameboard;
        const computerGameboard = gameData.player2.gameboard;

        // Player attacks a position
        SoloGame._enableAttackModeOnAttackGrid(e, computerGameboard);

        // After half a second, computer attacks a position
        setTimeout(() => {
            SoloGame._enableReceiveAttackModeOnOwnGrid(ownGameboard);

            // Check the game status
            const gameResult = SoloGame._checkGameIsOver(
                ownGameboard,
                computerGameboard
            );

            // If the game is over,
            if (gameResult.isGameOver) {
                // Display ships overlay at the end
                DisplayManager._displayFinalPositions(
                    ownGameboard,
                    '#gameboard1'
                );
                DisplayManager._displayFinalPositions(
                    computerGameboard,
                    '#gameboard2'
                );

                // Announce the winner
                DisplayManager._displayWinnerAnnouncement(gameResult);

                // End the game
                SoloGame._handleGameOver();
            }
        }, 600);
    },
};

const DuoGame = {
    Handlers: {
        // For entry modal form submit(entry)
        _submit: function (e) {
            const nameObj = DuoGame._handleFormSubmit(e);
            DuoGame._setUpInitialGamePage(nameObj);
        },

        // For player 2
        _enablePositioningP2: function (e) {
            DOMInteractions._enablePositioningModeOnGrid(
                e,
                GameManager.getShipPositioningState(),
                GameManager.getInitialState('player2').gameboard,
                'player2'
            );
        },

        // For player 2
        _rotateP2: function () {
            DOMInteractions._handleRotateButtonClick(
                GameManager.getShipPositioningState(),
                GameManager.getInitialState('player2').gameboard,
                'player2'
            );
        },

        // For player 2
        _resetP2: function () {
            DOMInteractions._handleResetButtonClick('player2');
        },

        // Attached to confirm button
        _confirm: function () {
            // Find if there is any ships not positioned yet
            const gameData = GameManager.getInitialState();
            const { player1, player2 } = gameData;
            const shipsNotPositioned = Gameboard.findShipsNotPositioned(
                player1.gameboard
            );

            // If there is, display message
            if (shipsNotPositioned) {
                DisplayManager.Utilities._displayMessage(
                    'Please position all the ships, then click Confirm.'
                );
                return;
            } else {
                // Lock all the positions and update the gameboard state management
                GameManager.updateInitialStateByPlayerKey(
                    'player1',
                    Gameboard.lockAllShipPositions(player1.gameboard)
                );

                // Retrieve name of Player 2 and use it in the title and the message.
                DuoGame._displayGameboardTitlesByState({
                    stateCategory: 2,
                    player2Name: player2.name,
                });
                DisplayManager.Utilities._displayMessage(
                    `Positions are all set. It is ${DisplayManager.Utilities._capitalizeName(player2.name)}'s turn to position the ships.`
                );

                // Assign the  entire copy of the initialState obj to gameInProgressState
                GameManager.updateGameInProgressState(gameData);

                // Clear the positions and attach positioning mode for player 2
                GameManager.resetShipPositioningState();
                DisplayManager._removeShipPositionsFromDisplay('#gameboard1');

                // Switch Confirm button to Start button
                DisplayManager.Utilities._hideContent('#confirm-btn');
                DisplayManager.Utilities._showContent('#start-btn');

                // Switch Rotate and Reset listeners for player2
                DuoGame._deactivatePositioningHandlersP1();
                DuoGame._activatePositioningHandlersP2();

                // Remove highlight from ship buttons
                DisplayManager._removeHighlightFromShipButtons(
                    '.ship-buttons button'
                );
            }
        },

        // Attached to start button
        _start: function () {
            // Find if there is any ships not positioned yet
            const gameData = GameManager.getInitialState();
            const { player1, player2 } = gameData;
            const shipsNotPositioned = Gameboard.findShipsNotPositioned(
                player2.gameboard
            );

            // If there is, display message
            if (shipsNotPositioned) {
                DisplayManager.Utilities._displayMessage(
                    'Please position all the ships to start the game.'
                );
                return;
            } else {
                // Disable positioning for player2
                DuoGame._disablePositioningModeP2(player2.gameboard);

                // Assign the entire copy of the initialState obj to gameInProgressState
                GameManager.updateGameInProgressState(gameData);

                // Clear player 2's ship positions
                GameManager.resetShipPositioningState();
                DisplayManager._removeShipPositionsFromDisplay('#gameboard1');

                // Display another grid
                DisplayManager._displayGameboardGrid('#gameboard2');
                DuoGame._toggleGameboard2Display(false);

                // Display titles and message
                DuoGame._displayGameboardTitlesByState({
                    stateCategory: 3,
                    player1Name: player1.name,
                    player2Name: player2.name,
                });
                DisplayManager.Utilities._displayMessage(
                    `Game Started. The player's name will be highlighted during their turn.`
                );

                // Add attack related eventListener to all grids
                document
                    .querySelector('#gameboard1')
                    .addEventListener('click', DuoGame._enableAttackModeP1);
                document
                    .querySelector('#gameboard2')
                    .addEventListener('click', DuoGame._enableAttackModeP2);

                // Set the current turn to player 1
                GameManager.setTurn('player1');

                // Highlight the title of the current turn
                DisplayManager._highLightCurrentTurnTitle(
                    GameManager.getCurrentTurn()
                );
            }
        },
    },

    // Retrieve names entered in the form
    _getPlayerNameFromForm: function (inputId) {
        const name = document.querySelector(`#${inputId}`).value;
        if (name) {
            return name;
        } else {
            if (inputId === 'name1') {
                return 'Player One';
            } else if (inputId === 'name2') {
                return 'Player Two';
            }
        }
    },

    // Return the players names on submit
    _handleFormSubmit: function (e) {
        e.preventDefault();
        return {
            player1Name: DuoGame._getPlayerNameFromForm('name1'),
            player2Name: DuoGame._getPlayerNameFromForm('name2'),
        };
    },

    // Show and hide gameboard 2 by game status
    _toggleGameboard2Display: function (shouldHide) {
        const mainContainer = document.querySelector('.main-container');
        const gb2Container = document.getElementsByClassName('gameboard')[1];
        if (shouldHide) {
            gb2Container.classList.add('hidden');
            mainContainer.classList.add('one-gameboard');
        } else {
            gb2Container.classList.remove('hidden');
            mainContainer.classList.remove('one-gameboard');
        }
    },

    // Display title
    _displayGameboardTitlesByState: function ({
        stateCategory,
        player1Name,
        player2Name,
    }) {
        const titleSpot1 = document.querySelector('.gb1-title');
        const titleSpot2 = document.querySelector('.gb2-title');
        switch (stateCategory) {
            // Player1 enters ship positions
            case 1:
                titleSpot1.textContent = `${player1Name}'s Positioning Grid`;
                DisplayManager.Utilities._showContent('.gb1-title');
                break;

            // Player2 enters ship positions
            case 2:
                titleSpot1.textContent = `${player2Name}'s Positioning Grid`;
                DisplayManager.Utilities._showContent('.gb1-title');
                break;

            // Game started
            case 3:
                titleSpot1.textContent = `${player1Name}'s Grid`;
                titleSpot2.textContent = `${player2Name}'s Grid`;
                DisplayManager.Utilities._showContent('.gb1-title');
                DisplayManager.Utilities._showContent('.gb2-title');
                break;
            default:
                return;
        }
    },

    // Add player 1's positioning eventListeners
    _activatePositioningHandlersP1: function () {
        EventListeners.Utilities._handleElementClick(
            '#rotate-btn',
            SoloGame.Handlers._rotateP1
        );
        EventListeners.Utilities._handleElementClick(
            '#reset-btn',
            SoloGame.Handlers._resetP1
        );
        EventListeners.Utilities._handleElementClick(
            '#confirm-btn',
            DuoGame.Handlers._confirm
        );

        // Activate positioning mode on #gameboard1 for player1
        EventListeners.Utilities._handleElementClick(
            '#gameboard1',
            SoloGame.Handlers._enablePositioningP1
        );
    },

    // Add player 2's positioning eventListeners
    _activatePositioningHandlersP2: function () {
        EventListeners.Utilities._handleElementClick(
            '#rotate-btn',
            DuoGame.Handlers._rotateP2
        );
        EventListeners.Utilities._handleElementClick(
            '#reset-btn',
            DuoGame.Handlers._resetP2
        );
        EventListeners.Utilities._handleElementClick(
            '#start-btn',
            DuoGame.Handlers._start
        );

        // Add positioning eventListener for player 2
        EventListeners.Utilities._handleElementClick(
            '#gameboard1',
            DuoGame.Handlers._enablePositioningP2
        );
    },

    // Remove player 1's positioning eventListeners
    _deactivatePositioningHandlersP1: function () {
        EventListeners.Utilities._removeClickHandler(
            '#gameboard1',
            SoloGame.Handlers._enablePositioningP1
        );
        EventListeners.Utilities._removeClickHandler(
            '#rotate-btn',
            SoloGame.Handlers._rotateP1
        );
        EventListeners.Utilities._removeClickHandler(
            '#reset-btn',
            SoloGame.Handlers._resetP1
        );
    },

    // Remove player 2's positioning eventListeners
    _deactivatePositioningHandlersP2: function () {
        EventListeners.Utilities._removeClickHandler(
            '#gameboard1',
            DuoGame.Handlers._enablePositioningP2
        );
        EventListeners.Utilities._removeClickHandler(
            '#rotate-btn',
            DuoGame.Handlers._rotateP2
        );
        EventListeners.Utilities._removeClickHandler(
            '#reset-btn',
            DuoGame.Handlers._resetP2
        );
        EventListeners.Utilities._removeClickHandler(
            '#start-btn',
            DuoGame.Handlers._start
        );
    },

    // Callback attached to start
    _disablePositioningModeP2: function (gameboardObj) {
        // Remove the entire eventListeners related to ship positioning
        DuoGame._deactivatePositioningHandlersP2();

        // Reset ship buttons display
        DisplayManager._removeHighlightFromShipButtons('.ship-buttons button');

        // Disable further start button click
        document.getElementById('start-btn').disabled = true;

        // Hide the buttons
        DisplayManager.Utilities._hideContent('.buttons-container');

        // Lock all the positions and update the gameboard state management
        GameManager.updateInitialStateByPlayerKey(
            'player2',
            Gameboard.lockAllShipPositions(gameboardObj)
        );
    },

    // First game setting
    _setUpInitialGamePage: function (playerNameObj) {
        const { player1Name, player2Name } = playerNameObj;

        // Set up initial game state
        GameManager.setInitialGameState(player1Name, player2Name);

        // Display only one grid
        DisplayManager._displayGameboardGrid('#gameboard1');
        DuoGame._toggleGameboard2Display(true);

        // Show Confirm button instead of Start
        DisplayManager.Utilities._hideContent('#start-btn');
        DisplayManager.Utilities._showContent('#confirm-btn');

        // Add ship positioning event listeners for player 1
        DuoGame._activatePositioningHandlersP1();

        // Display player1's name
        DuoGame._displayGameboardTitlesByState({
            stateCategory: 1,
            player1Name: player1Name,
        });

        DisplayManager.Utilities._displayMessage(
            `It is ${DisplayManager.Utilities._capitalizeName(player1Name)}'s turn. Click a ship button. Then pick a gameboard square to place the ship!`
        );
    },

    // Attach to both gameboard1 and gameboard2
    _enableAttackModeOnGrids: function (
        e,
        opponentGameboardObj,
        currentTurn,
        gameboardId
    ) {
        const square = e.target.classList.contains('square');
        DisplayManager.Utilities._removeMessage();

        // If it is not the turn, return
        if (GameManager.getCurrentTurn() !== currentTurn) {
            DisplayManager.Utilities._displayMessage(`It is not your turn.`);
            return;
        }

        const coordinate = DOMInteractions.Utilities._getSquarePositionData(e);
        if (square && coordinate.length === 2) {
            const result = Gameboard.receiveAttack(
                coordinate,
                opponentGameboardObj
            );

            // If the attacked position is already used in a previous attack, keep the turn to retry a new position
            if (!result.uiData.isValidSpot) {
                DisplayManager.Utilities._displayMessage(
                    'The spot is already attacked. Retry another spot.'
                );
                GameManager.setTurn(currentTurn);
                return;
            }
            DisplayManager._displayAttackedPosition(gameboardId, result.uiData);
            return result;
        }
    },

    // Gameover check
    _checkGameIsOver: function (gameData) {
        const { player1, player2 } = gameData;
        const isPlayer1Win = Gameboard.hasNoShipLeft(
            player2.gameboard.survivingShipCount
        );
        const isPlayer2Win = Gameboard.hasNoShipLeft(
            player1.gameboard.survivingShipCount
        );

        // If there is no winner, continue the play
        if (!isPlayer1Win && !isPlayer2Win) {
            return { isGameOver: false, winner: null };

            // Otherwise, announce the winner and end the game
        } else if (isPlayer1Win && !isPlayer2Win) {
            return { isGameOver: true, winner: player1.name };
        } else if (!isPlayer1Win && isPlayer2Win) {
            return { isGameOver: true, winner: player2.name };
        } else {
            return { isGameOver: true, winner: 'tie' };
        }
    },

    // Terminate the game
    _handleGameOver() {
        // disable further attack on both grids
        EventListeners.Utilities._removeClickHandler(
            '#gameboard1',
            DuoGame._enableAttackModeP1
        );
        EventListeners.Utilities._removeClickHandler(
            '#gameboard2',
            DuoGame._enableAttackModeP2
        );

        // Show replay button
        setTimeout(() => {
            DisplayManager.Utilities._showContent('.ending-overlay');
            DisplayManager.Utilities._removeMessage(); // TODO: remove if it is not needed.
        }, 5000);
    },

    // Attach to #gameboard1 to activate player 1 attack
    _enableAttackModeP1: function (e) {
        const result = DuoGame._enableAttackModeOnGrids(
            e,
            GameManager.getGameInProgressState().player2.gameboard,
            'player1',
            '#gameboard1'
        );
        GameManager.updateGameInProgressState(result.gameboard, 'player2');
        GameManager.setTurn('player2');
        DisplayManager._highLightCurrentTurnTitle(GameManager.getCurrentTurn());
    },

    // Attach to #gameboard2 to activate player2 attack
    _enableAttackModeP2: function (e) {
        const result = DuoGame._enableAttackModeOnGrids(
            e,
            GameManager.getGameInProgressState().player1.gameboard,
            'player2',
            '#gameboard2'
        );
        GameManager.updateGameInProgressState(result.gameboard, 'player1');
        const gameData = GameManager.getGameInProgressState();
        const { player1, player2 } = gameData;

        // After player 2 attacked, check if the game is over
        const gameResult = DuoGame._checkGameIsOver(gameData);

        // If game is over,
        if (gameResult.isGameOver) {
            // Display all ships at the end
            DisplayManager._displayFinalPositions(
                player2.gameboard,
                '#gameboard1'
            );
            DisplayManager._displayFinalPositions(
                player1.gameboard,
                '#gameboard2'
            );

            // Announce the winner
            DisplayManager._displayWinnerAnnouncement(gameResult);

            // End the game
            DuoGame._handleGameOver();
        }

        // Otherwise, continue to next turn
        GameManager.setTurn('player1');
        DisplayManager._highLightCurrentTurnTitle(GameManager.getCurrentTurn());
    },
};

const EventListeners = {
    Utilities: {
        // Attach onclick eventListener
        _handleElementClick(elementSelector, callback) {
            const element = document.querySelector(elementSelector);
            element.addEventListener('click', callback);
        },

        // Remove onclick eventListener
        _removeClickHandler(elementSelector, callback) {
            const element = document.querySelector(elementSelector);
            element.removeEventListener('click', callback);
        },
    },

    renderInitialPage: function () {
        DisplayManager.Utilities._showContent('.initial-overlay');
        DisplayManager._displayEntryModal();
        GameManager.resetShipPositioningState();
    },

    soloGameEnterButton: function () {
        EventListeners.Utilities._handleElementClick('#enter-btn', (e) => {
            DisplayManager.Utilities._hideContent('.initial-overlay');
            SoloGame.Handlers._enter(e);
        });
    },

    duoGameEnterButton: function () {
        document.getElementById('form').addEventListener('submit', (e) => {
            DisplayManager.Utilities._hideContent('.initial-overlay');
            DuoGame.Handlers._submit(e);
        });
    },

    duoGameClearButton: function () {
        EventListeners.Utilities._handleElementClick('#clear-btn', () => {
            DOMInteractions.Utilities._clearFormEntry('form');
        });
    },

    shipButtons: function () {
        EventListeners.Utilities._handleElementClick(
            '.ship-buttons',
            DOMInteractions._handleShipButtonClick
        );
    },

    replayButton: function () {
        EventListeners.Utilities._handleElementClick('#replay-btn', () => {
            DisplayManager.Utilities._hideContent('.ending-overlay');
            DOMInteractions._restoreGame();
        });
    },
};

export { EventListeners };
