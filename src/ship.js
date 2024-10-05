function createShip(shipLength = 0) {
    return {
        length: shipLength,
        hitCount: 0,
        isSunk: false,
        position: new Set(),
        isPositionLocked: false,
    };
}

// Return a cloned ship object with updated hitCount
function hit(shipObj) {
    return {
        ...shipObj,
        hitCount: shipObj.hitCount + 1,
    };
}

// Return a cloned ship object with updated isSunk status
function isSunk(shipObj) {
    return {
        ...shipObj,
        isSunk: shipObj.length - shipObj.hitCount === 0,
    };
}

// Return a cloned ship object with update isPositionLocked status
function lockPosition(shipObj) {
    return {
        ...shipObj,
        isPositionLocked: true,
    };
}

// Wrap all public functions in an object (namespacing);
const Ship = {
    createShip,
    hit,
    isSunk,
    lockPosition,
};

export { Ship };
