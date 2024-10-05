import { Ship } from '../src/ship';

test('createShip returns an object containing ship length, number of hit, status, position', () => {
    const shipOne = Ship.createShip();
    const shipTwo = Ship.createShip(2);
    expect(shipOne).toEqual({
        length: 0,
        hitCount: 0,
        isSunk: false,
        position: new Set(),
        isPositionLocked: false,
    });
    expect(shipTwo).toEqual({
        length: 2,
        hitCount: 0,
        isSunk: false,
        position: new Set(),
        isPositionLocked: false,
    });
});

describe('hit function', () => {
    const shipThree = Ship.createShip(2);
    let shipThreeHit = Ship.hit(shipThree);
    test('adds one to hitCount in the current ship object', () => {
        expect(shipThreeHit.hitCount).toBe(1);
    });
    test('does not mutate the original ship object', () => {
        expect(shipThree).not.toEqual(shipThreeHit);
    });
});

describe('isSunk function', () => {
    const shipFour = Ship.createShip(1);
    let shipFourUpdated = Ship.hit(shipFour);
    test('checks whether hit counts matches ship length, if so return true else false', () => {
        expect(Ship.isSunk(shipFourUpdated).isSunk).toBe(true);
    });
    test('does not mutate the original ship object', () => {
        expect(shipFour).not.toEqual(shipFourUpdated);
    });
});

describe('confirmPosition function', () => {
    const shipFive = Ship.createShip(2);
    let shipFiveUpdated = Ship.lockPosition(shipFive);
    test('toggles isPositionLocked to true', () => {
        expect(shipFiveUpdated.isPositionLocked).toBe(true);
    });
    test('does not mutate the original ship object', () => {
        expect(shipFive).not.toEqual(shipFiveUpdated);
    });
});
