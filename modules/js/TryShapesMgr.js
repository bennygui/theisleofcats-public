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
            'tioc.TryShapesMgr',
            null, {
                game: null,
                isInCmd: false,

                constructor(game) {
                    this.game = game;
                },
                setup(gamedatas) {
                    this.game.commandMgr.registerObserver('tioc.TryShapesMgr', () => {
                        this.updateButton();
                    });
                },
                onEnteringState(stateName, args) {
                    this.updateButton();
                },
                onLeavingState(stateName) {
                    this.updateButton();
                },
                onUpdateActionButtons(stateName, args) {
                    if (this.game.isSpectator) {
                        return;
                    }
                    this.game.addActionButton(
                        'button_try_shapes',
                        _('Try shapes'),
                        () => this.onTryShapes(),
                        null, // unused
                        false, // blinking
                        'gray'
                    );
                    this.updateButton();
                },
                isTryingShapes() {
                    return this.isInCmd;
                },
                updateButton() {
                    const tryButton = document.getElementById('button_try_shapes');
                    if (tryButton === null) {
                        return;
                    }
                    const undoButton = document.getElementById('button_undo_try_shapes');
                    const cmd = this.game.commandMgr;
                    if (this.isInCmd) {
                        tryButton.innerText = _('Exit "Try shapes" mode');
                        if (undoButton === null) {
                            this.game.addActionButton('button_undo_try_shapes', _('Undo (Try shapes)'), () => this.undoLastTryShapes());
                        }
                        if (cmd.currentCommandStateValue() && cmd.currentCommandStateValue().shapeList && cmd.currentCommandStateValue().shapeList.length > 0) {
                            dojo.removeClass('button_undo_try_shapes', 'disabled');
                        } else {
                            dojo.addClass('button_undo_try_shapes', 'disabled');
                        }
                        cmd.disableButtons();
                        this.game.islandMgr.allowTryShapes();
                    } else {
                        tryButton.innerText = _('Try shapes');
                        if (undoButton !== null) {
                            undoButton.remove();
                        }
                        cmd.enableButtons();
                        this.game.islandMgr.disallowTryShapes();
                        if (this.game.isCurrentPlayerActive()) {
                            switch (this.game.gamedatas.gamestate.name) {
                                case 'STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE':
                                    this.game.islandMgr.allowTakeToPlaceShape();
                                    break;
                                case 'STATE_FAMILY_RESCUE_CAT':
                                    if (!this.game.phase45Mgr.hasRescuedCat()) {
                                        this.game.islandMgr.allowFamilyRescueCat();
                                    }
                                    break;
                            }
                        }
                    }
                },
                onTryShapes(initialShapeList = null) {
                    const cmd = this.game.commandMgr;
                    if (this.isInCmd) {
                        this.isInCmd = false;
                        this.updateButton();
                        cmd.undo();
                        this.game.boatMgr.clearTryShapes();
                        return;
                    }
                    if (cmd.isInCommand()) {
                        this.game.showMessage(_('You must finish your current action (or undo) before you can enable the "Try shapes" mode'), 'error');
                        return;
                    }
                    this.isInCmd = true;
                    this.updateButton();
                    const cmdStateValue = {
                        shapeList: [],
                    };
                    if (initialShapeList !== null) {
                        debugger;
                        for (const shapeInfo of initialShapeList) {
                            const gridElem = document.querySelector('#tioc-player-boat-' + this.game.player_id + ' .tioc-grid.x_' + shapeInfo.x + '_y_' + shapeInfo.y);
                            this.game.createShapeElement(
                                gridElem.id,
                                shapeInfo.shapeId + '-try-shapes',
                                this.game.getShapeTypeIdFromShapeId(shapeInfo.shapeId),
                                this.game.getShapeDefIdFromShapeId(shapeInfo.shapeId),
                                this.game.getShapeColorIdFromShapeId(shapeInfo.shapeId)
                            );
                            this.game.boatMgr.applyTransformToShapeId(
                                shapeInfo.shapeId + '-try-shapes',
                                shapeInfo.rotation,
                                shapeInfo.flipH,
                                shapeInfo.flipV
                            );
                            for (const grid of shapeInfo.usedGrid) {
                                this.game.boatMgr.markGridUsed(shapeInfo.shapeId, grid.x, grid.y, true);
                            }
                            const shapeClone = document.getElementById('tioc-shape-id-' + shapeInfo.shapeId + '-try-shapes');
                            shapeClone.classList.add('tioc-try-shapes');
                            const shape = document.getElementById('tioc-shape-id-' + shapeInfo.shapeId);
                            shape.classList.add('tioc-try-shapes-hidden');
                            cmdStateValue.shapeList.push(shapeInfo);
                        }
                    }
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple(
                        () => {},
                        () => {
                            this.game.islandMgr.removeAllIslandClickable();
                            this.game.shapeControl.detach();
                            const tryShapes = document.querySelectorAll('.tioc-try-shapes');
                            for (const shape of tryShapes) {
                                shape.remove();
                            }
                            const shapes = document.querySelectorAll('.tioc-try-shapes-hidden');
                            for (const shape of shapes) {
                                shape.classList.remove('tioc-try-shapes-hidden');
                            }
                            for (let i = 0; i < cmdStateValue.shapeList.length; ++i) {
                                this.game.boatMgr.markGridUnused(cmdStateValue.shapeList[i].shapeId, true);
                            }
                            this.game.boatMgr.updateGridOverlay();
                            this.game.boatMgr.updatePlayerPanelShapeCount();
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            this.game.islandMgr.allowTryShapes();
                        },
                        () => {},
                        () => {},
                    );
                    cmd.endCommand();
                },
                undoLastTryShapes() {
                    if (!this.isTryingShapes()) {
                        return;
                    }
                    const cmd = this.game.commandMgr;
                    const shapeList = dojo.clone(cmd.currentCommandStateValue().shapeList);
                    if (shapeList.length > 0) {
                        shapeList.pop();
                    }
                    this.onTryShapes();
                    this.onTryShapes(shapeList);
                },
            }
        );
    }
);