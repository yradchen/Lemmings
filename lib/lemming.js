// import walkingLemmings from './sprites';
const walkingLemmings = require("./sprites/lemming_sprites");
class Lemming {
  constructor(startX, startY, stage, lastStaticObject, index) {
    this.index = index;
    this.stage = stage;
    this.lastStaticObject = lastStaticObject;
    this.setupLemmingVisual(startX, startY);
    this.setupInitialValues();
    stage.addChild(this.lemming);
  }

  setupInitialValues() {
    this.height = 20;
    this.width = 12;
    this.move = 1;
    this.direction = "right";
    this.dig = false;
    this.setLemmingPosition();
  }

  setupLemmingVisual(startX, startY) {
    this.lemming = walkingLemmings();
    this.lemming.x = startX;
    this.lemming.y = startY;
    this.setSize(2.0, 2.0);
  }

  setSize(scaleX, scaleY) {
    this.lemming.scaleX = scaleX;
    this.lemming.scaleY = scaleY;
  }

  setLemmingPosition() {
    this.leftSide = this.lemming.x;
    this.rightSide = this.lemming.x + this.width;
    this.top = this.lemming.y;
    this.bottom = this.lemming.y + this.height;
    this.x = this.lemming.x;
  }

  handleDigging(floor, timeOut) {
    this.dig = true;
    this.setSize(1.3, 1.5);
    this.floor = floor;
    this.lemming.gotoAndPlay("digging");
    this.startdigInterval(floor, timeOut);
  }
  
  startdigInterval(floor, timeOut) {
    const digInterval = setInterval(() => {
        if (this.bottom < floor.bottom) {
          this.continueDigging();
        } else {
          this.stopDigging(digInterval);
        }
    }, timeOut);
  }

  continueDigging() {
    this.lemming.y += this.move;
    const hole = new createjs.Shape();
    hole.graphics.beginFill("black").drawRect(this.lemming.x, this.bottom, 12, 1 );
    this.stage.addChildAt(hole, this.lastStaticObject);
  }

  stopDigging(interval) {
    this.dig = false;
    this.setSize(2.0, 2.0);
    clearInterval(interval);
  }

  moveLemming(floors, walls) {
    if (this.dig) {
    } else if (this.inHole) {
      this.handleHoleFalling();
    }
    else {
      this.handleMoving(floors, walls);
    }
    this.setLemmingPosition();
  }
  handleMoving(floors, walls) {
    this.checkFallingAnimation();
    this.handleFloors(floors);
    if (this.verticalDirection) {
      this.lemming.y += this.move;
    } else {
      this.handleWalls(walls);
    }
  }

  handleHoleFalling(hole, floorStart, floor) {
    if (hole) {
      this.inHole = true;
      this.checkFallingAnimation();
      this.floor = floor;
    } else if (this.bottom >= this.floor.bottom) {
      this.inHole = false;
    }
    this.continueFalling();
  }

  continueFalling() {
    const holeDepth = this.floor.holes[this.lemming.x] + this.floor.startY;
    if (holeDepth > this.bottom ) {
      this.lemming.y += this.move;
    } else {
      this.checkFallingAnimation();
    }
  }

  handleFloors(floors) {
    this.verticalDirection = true;
    for (let i = 0; i < floors.length; i++) {
      const floor = floors[i];
      if (this.notOnFloor(floor)) continue;
      const floorHole = floor.holes[this.lemming.x];
      if (floorHole) {
        this.handleHoleFalling(floorHole, floor.startY, floor);
      }
      this.verticalDirection = false;

      break;
    }
  }

  notOnFloor(floor) {
    if (this.bottom < floor.startY) return true;
    if (this.bottom >= floor.bottom) return true;
    if (this.lemming.x > floor.rightEdge) return true;
    if (this.rightSide < floor.startX) return true;
    return false;
  }

  checkFallingAnimation() {
    if (this.verticalDirection & this.lemming.currentAnimation !== "falling") {
      this.lemming.gotoAndPlay("falling");
    } else if (!this.verticalDirection & this.lemming.currentAnimation === "falling") {
      if (this.direction === "right") {
        this.lemming.gotoAndPlay("walkRight");
       } else {
        this.lemming.gotoAndPlay("walkLeft");
       }
    }
  }

  handleTurning(leftEdge, rightEdge) {
    if (this.lemming.x + this.width === leftEdge & this.direction === 'right') {
      this.direction = "left";
      this.lemming.gotoAndPlay("walkLeft");
    } else if (this.direction === 'left' & rightEdge === this.lemming.x) {
      this.direction = "right";
      this.lemming.gotoAndPlay("walkRight");
    }
  }

  handleWalls(walls) {
    if (this.inHole) {
      return;
    } else {
      for (let i = 0; i < walls.length; i++) {
        const wall = walls[i];
        if (this.lemming.y >= wall.bottom || this.bottom < wall.top) {
           continue;
        }
        this.handleTurning(wall.leftEdge, wall.rightEdge);
      }
      this.moveDirection();
    }
  }

  moveDirection() {
    if (this.direction === "right") {
      this.lemming.x += this.move;
    } else {
      this.lemming.x -= this.move;
    }
  }
}

module.exports = Lemming;
