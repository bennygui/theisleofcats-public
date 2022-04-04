/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * theisleofcatsbennygui implementation : © Guillaume Benny bennygui@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

define(
    [
        'dojo',
        'dojo/_base/declare',
    ],
    (dojo, declare) => {
        return declare(
            'tioc.ShapeControl',
            null, {
                game: null,

                shapeId: null,
                x: null,
                y: null,
                rotation: 0,
                flipH: false,
                flipV: false,
                canPutShapeAnywhere: false,

                constructor(game) {
                    this.game = game;
                },
                attachToShapeId(shapeId, x, y, canPutShapeAnywhere, onConfirmFunction) {
                    this.shapeId = shapeId;
                    this.x = x;
                    this.y = y;
                    this.canPutShapeAnywhere = canPutShapeAnywhere;
                    // Attach to shape only when the shape has finished moving
                    const timer = setInterval(() => {
                        window.tiocWrap('_attachToShapeId_setInterval', () => {
                            const shapeElement = this._shapeElement();
                            if (!shapeElement.classList.contains('tioc-moving')) {
                                clearInterval(timer);
                                this._attach(onConfirmFunction);
                            }
                        });
                    }, 50);
                },
                _attach(onConfirmFunction) {
                    const shapeElement = this._shapeElement();
                    const gridElement = shapeElement.parentNode;
                    const topElement = gridElement.parentNode;
                    shapeElement.remove();
                    dojo.place(this.game.format_block('jstpl_shape_controls', {}), topElement);
                    this._shapeControlShapeElement().appendChild(shapeElement);
                    const controlElement = this._shapeControlElement();
                    controlElement.style.top = gridElement.offsetTop + 'px';
                    controlElement.style.left = gridElement.offsetLeft + 'px';
                    this._applyTransform();
                    const grids = topElement.querySelectorAll('.tioc-grid');
                    for (const grid of grids) {
                        grid.classList.add('tioc-clickable-no-border')
                        this.game.addOnClick(grid, (event) => {
                            event.preventDefault();
                            this._moveToPosIfFar(parseInt(grid.dataset.x), parseInt(grid.dataset.y));
                        });
                    }
                    dojo.query('#tioc-shape-control-arrow-left').connect('onclick', this._buildDirectionClicker({ x: -1, y: 0 }));
                    dojo.query('#tioc-shape-control-arrow-right').connect('onclick', this._buildDirectionClicker({ x: 1, y: 0 }));
                    dojo.query('#tioc-shape-control-arrow-up').connect('onclick', this._buildDirectionClicker({ x: 0, y: -1 }));
                    dojo.query('#tioc-shape-control-arrow-down').connect('onclick', this._buildDirectionClicker({ x: 0, y: 1 }));
                    dojo.query('#tioc-shape-control-arrow-flip-h').connect('onclick', this._buildFlipClicker(true));
                    dojo.query('#tioc-shape-control-arrow-flip-v').connect('onclick', this._buildFlipClicker(false));
                    dojo.query('#tioc-shape-control-arrow-rotate-cw').connect('onclick', this._buildRotateClicker(1));
                    dojo.query('#tioc-shape-control-arrow-rotate-ccw').connect('onclick', this._buildRotateClicker(-1));
                    dojo.query('#tioc-shape-control-button-confirm').connect('onclick', (event) => {
                        window.tiocWrap('ShapeControl_attach_confirm_onclick', () => {
                            event.preventDefault();
                            if (!this._isPositionValid()) {
                                if (this.canPutShapeAnywhere || this.game.boatMgr.isBoatEmpty()) {
                                    this.game.showMessage(_('Shapes must be inside the boat and cannot overlap'), 'error');
                                } else {
                                    this.game.showMessage(_('Shapes must be inside the boat, cannot overlap and must touch existing shapes'), 'error');
                                }
                                return;
                            }
                            const usedGrid = [];
                            this._forEachShapeGrid((x, y) => {
                                usedGrid.push({ x: x, y: y });
                            });
                            onConfirmFunction(
                                this.shapeId,
                                this.x,
                                this.y,
                                this.game.normalizeRotation(this.rotation),
                                this.flipH,
                                this.flipV,
                                usedGrid
                            );
                        });
                    });
                    const confirmButton = document.getElementById('tioc-shape-control-button-confirm');
                    confirmButton.innerText = _('Confirm');
                    confirmButton.style.left = Math.floor(confirmButton.parentNode.offsetWidth / 2 - confirmButton.offsetWidth / 2) + 'px';
                    this.game.boatMgr.updateCurrentPlayerTooltips();
                },
                detach() {
                    const controlElem = this._shapeControlElement();
                    if (controlElem === null) {
                        this.game.boatMgr.updateCurrentPlayerTooltips();
                        this.game.boatMgr.hidePlacementGridOverlay();
                        return;
                    }
                    const shapeElement = this._shapeElement();
                    controlElem.remove();
                    const gridElem = this._gridElement(this.x, this.y);
                    gridElem.appendChild(shapeElement);
                    const topElement = gridElem.parentNode;
                    const grids = topElement.querySelectorAll('.tioc-grid');
                    for (const grid of grids) {
                        this.game.removeClickable(grid);
                    }
                    this.shapeId = null;
                    this.x = null;
                    this.y = null;
                    this.rotation = 0;
                    this.flipH = false;
                    this.flipV = false;
                    this.canPutShapeAnywhere = false;
                    this.game.boatMgr.updateCurrentPlayerTooltips();
                    this.game.boatMgr.hidePlacementGridOverlay();
                },
                _shapeControlElement() {
                    return document.getElementById('tioc-shape-controls');
                },
                _shapeControlShapeElement() {
                    return document.getElementById('tioc-shape-controls-shape');
                },
                _shapeControlContainerElement() {
                    return document.getElementById('tioc-shape-controls-container');
                },
                _shapeControlConfirmButton() {
                    return document.getElementById('tioc-shape-control-button-confirm');
                },
                _shapeElementId() {
                    return 'tioc-shape-id-' + this.shapeId;
                },
                _shapeElement() {
                    return document.getElementById(this._shapeElementId());
                },
                _gridElement(x, y) {
                    return document.querySelector('#tioc-player-boat-' + this.game.player_id + ' .tioc-grid.x_' + x + '_y_' + y);
                },
                _applyTransform() {
                    const shapeElement = this._shapeElement();
                    const maxShapeSize = Math.max(shapeElement.offsetWidth, shapeElement.offsetHeight);
                    this.game.applyTransformToElement(shapeElement, this.rotation, this.flipH, this.flipV);

                    const shapeContainerElement = this._shapeControlContainerElement();
                    shapeContainerElement.style.width = shapeContainerElement.style.height = maxShapeSize + 'px';

                    const button = this._shapeControlConfirmButton();
                    button.classList.remove('bgabutton_blue');
                    button.classList.remove('bgabutton_red');
                    if (this._isPositionValid()) {
                        button.classList.add('bgabutton_blue');
                    } else {
                        button.classList.add('bgabutton_red');
                    }
                },
                _moveTo(x, y) {
                    let moveGridElem = this._gridElement(x, y);
                    if (moveGridElem === null) {
                        return;
                    }
                    this.x = x;
                    this.y = y;
                    const controlElement = this._shapeControlElement();
                    this._applyTransform();
                    if (this.game.isFastMode()) {
                        this.game.changeParent(controlElement, controlElement.parentNode)
                        controlElement.style.top = moveGridElem.offsetTop + 'px';
                        controlElement.style.left = moveGridElem.offsetLeft + 'px';
                    } else {
                        const anim = this.game.slideToObjectPos(controlElement, controlElement.parentNode, moveGridElem.offsetLeft, moveGridElem.offsetTop)
                        anim.play();
                    }
                },
                _moveToPosIfFar(x, y) {
                    window.tiocWrap('_moveToPosIfFar', () => {
                        const shapeSize = this.game.getShapeSizeFromShapeId(this.shapeId);
                        let nearX = false;
                        if (x <= this.x && this.x - x <= 1) {
                            nearX = true;
                        } else if (x > this.x && x - (this.x + shapeSize.width) < 1) {
                            nearX = true;
                        }
                        let nearY = false;
                        if (y <= this.y && this.y - y <= 1) {
                            nearY = true;
                        } else if (y > this.y && y - (this.y + shapeSize.height) < 1) {
                            nearY = true;
                        }
                        if (nearX && nearY) {
                            return;
                        }
                        this._moveTo(x, y);
                    });
                },
                _buildDirectionClicker(movement) {
                    return (event) => {
                        window.tiocWrap('_buildDirectionClicker', () => {
                            event.preventDefault();
                            let x = this.x;
                            let y = this.y;
                            x += movement.x;
                            y += movement.y;
                            if (x < 0) {
                                return;
                            }
                            if (y < 0) {
                                return;
                            }
                            this._moveTo(x, y);
                        });
                    };
                },
                _buildFlipClicker(isFlipH) {
                    return (event) => {
                        window.tiocWrap('_buildFlipClicker', () => {
                            event.preventDefault();
                            let curIsFlipH = isFlipH;
                            const normalizedRot = this.game.normalizeRotation(this.rotation);
                            if (normalizedRot == 90 || normalizedRot == 270) {
                                curIsFlipH = !isFlipH;
                            }
                            const flipH = (curIsFlipH ? !this.flipH : this.flipH);
                            const flipV = (curIsFlipH ? this.flipV : !this.flipV);
                            this.flipH = flipH;
                            this.flipV = flipV;
                            this._applyTransform();
                        });
                    };
                },
                _buildRotateClicker(direction) {
                    return (event) => {
                        window.tiocWrap('_buildRotateClicker', () => {
                            event.preventDefault();
                            let rotation = this._calculateRotation(this.rotation, 90 * direction);
                            this.rotation = rotation;
                            this._applyTransform();
                        });
                    };
                },
                _calculateRotation(baseRotation, rotation) {
                    rotation += baseRotation;
                    return rotation;
                },
                _forEachShapeGrid(gridFunction) {
                    this.game.forEachShapeGrid(this.shapeId, this.x, this.y, this.rotation, this.flipH, this.flipV, gridFunction);
                },
                _isPositionValid() {
                    const boatEmpty = this.game.boatMgr.isBoatEmpty();
                    let positionValid = true;
                    let touchesOtherShapes = false;
                    this._forEachShapeGrid((x, y) => {
                        if (!this.game.boatMgr.isGridValidAndEmpty(x, y)) {
                            positionValid = false;
                            return false;
                        }
                        if (!boatEmpty &&
                            (!this.game.boatMgr.isGridEmpty(x - 1, y) ||
                                !this.game.boatMgr.isGridEmpty(x + 1, y) ||
                                !this.game.boatMgr.isGridEmpty(x, y - 1) ||
                                !this.game.boatMgr.isGridEmpty(x, y + 1))
                        ) {
                            touchesOtherShapes = true;
                        }
                        return true;
                    });
                    if (!positionValid) {
                        return false;
                    }
                    if (boatEmpty || this.canPutShapeAnywhere) {
                        return true;
                    }
                    return touchesOtherShapes;
                },
            }
        );
    }
);