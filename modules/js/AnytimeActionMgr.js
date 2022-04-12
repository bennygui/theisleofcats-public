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
            'tioc.AnytimeActionMgr',
            null, {
                game: null,

                ACTION_TYPE_ID_ANYTIME_CARD: 6,
                ACTION_TYPE_ID_TO_PLACE_SHAPE: 8,

                CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_OSHAX: 0,
                CARD_ANYTIME_TYPE_ID_NEXT_SHAPE_ANYWHERE: 1,
                CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2: 2,
                CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3: 3,
                CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE: 4,
                CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET: 5,
                CARD_ANYTIME_TYPE_ID_MOVE_CATS_FROM_FIELDS: 6,
                CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_LESSONS: 7,
                CARD_ANYTIME_TYPE_ID_RESCUE_MORE_CATS: 8,
                CARD_ANYTIME_TYPE_ID_DRAW_AND_FIELD_SHAPE: 9,
                CARD_ANYTIME_TYPE_ID_GAIN_BASKET: 10,
                CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_LESSON: 11,
                CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_TREASURE: 12,
                CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COLOR: 13,
                CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_RARE_TREASURE: 14,
                CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE: 15,
                CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_CAT_OF_COLOR: 16,

                constructor(game) {
                    this.game = game;
                },
                cmdOnlyHasAnytimeCards() {
                    const actions = this.game.commandMgr.commandGroupsStateValues();
                    for (const action of actions) {
                        if (action.actionTypeId != this.ACTION_TYPE_ID_ANYTIME_CARD) {
                            return false;
                        }
                    }
                    return true;
                },
                isGainFishCard(cardId) {
                    const typeId = this.game.cardMgr.getCardAnytimeTypeIdFromCardId(cardId);
                    switch (typeId) {
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_OSHAX:
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET:
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_LESSONS:
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COLOR:
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_RARE_TREASURE:
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE:
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_CAT_OF_COLOR:
                            return true;
                    }
                    return false;
                },
                isNextShapeAnywhereCard(cardId) {
                    const typeId = this.game.cardMgr.getCardAnytimeTypeIdFromCardId(cardId);
                    return (typeId == this.CARD_ANYTIME_TYPE_ID_NEXT_SHAPE_ANYWHERE);
                },
                takeToPlaceShape(shapeId) {
                    // Note: This can be a cat, a common treasure or a rare treasure. It cannot be an oshax (they are not in the bag)
                    const cmd = this.game.commandMgr;
                    if (cmd.isInCommand()) {
                        this.game.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error');
                        return;
                    }
                    let cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_TO_PLACE_SHAPE,
                        shapeId: shapeId,
                        x: null,
                        y: null,
                        rotation: null,
                        flipH: null,
                        flipV: null,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple(
                        () => {
                            this.game.islandMgr.removeAllIslandClickable();
                        },
                        () => {
                            this.game.boatMgr.removeAllBoatClickable();
                            this.game.islandMgr.allowTakeToPlaceShape();
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must select where to put the shape on your boat'));
                            this.game.boatMgr.allowPlaceShape((x, y) => {
                                cmdStateValue.x = x;
                                cmdStateValue.y = y;
                                this.game.boatMgr.moveShapeToBoat(this.game.player_id, shapeId, x, y);
                                onContinue();
                            });
                        },
                        () => {
                            this.game.boatMgr.moveShapeToBoat(this.game.player_id, cmdStateValue.shapeId, cmdStateValue.x, cmdStateValue.y);
                        },
                        () => {
                            this.game.shapeControl.detach();
                            this.game.islandMgr.moveShapeToToPlaceLocation(cmdStateValue.shapeId);
                        }
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must confirm the position of the shape on your boat'));
                            const canPutNextShapeAnywhere = this.game.phase45Mgr.canPutNextShapeAnywhere();
                            this.game.shapeControl.attachToShapeId(
                                cmdStateValue.shapeId,
                                cmdStateValue.x,
                                cmdStateValue.y,
                                canPutNextShapeAnywhere,
                                (shapeId, x, y, rotation, flipH, flipV, usedGrid) => {
                                    cmdStateValue.shapeId = shapeId;
                                    cmdStateValue.x = x;
                                    cmdStateValue.y = y;
                                    cmdStateValue.rotation = rotation;
                                    cmdStateValue.flipH = flipH;
                                    cmdStateValue.flipV = flipV;
                                    this.game.shapeControl.detach();
                                    let canTakeCommonTreasure = false;
                                    const shapeColor = this.game.getShapeColorFromShapeId(shapeId);
                                    for (const grid of usedGrid) {
                                        this.game.boatMgr.markGridUsed(cmdStateValue.shapeId, grid.x, grid.y);
                                        if (this.game.boatMgr.gridMapMatchesColor(grid.x, grid.y, shapeColor)) {
                                            canTakeCommonTreasure = true;
                                        }
                                    }
                                    this.game.boatMgr.updateGridOverlay();
                                    if (canTakeCommonTreasure) {
                                        this.game.phase45Mgr.allowTakeCommonTreasure();
                                    }
                                    if (canPutNextShapeAnywhere) {
                                        this.game.phase45Mgr.takeNextShapeAnywhere();
                                    }
                                    onContinue({
                                        usedGrid: usedGrid,
                                        canTakeCommonTreasure: canTakeCommonTreasure,
                                        canPutNextShapeAnywhere: canPutNextShapeAnywhere,
                                    });
                                }
                            );
                        },
                        (info) => {
                            this.game.boatMgr.applyTransformToShapeId(cmdStateValue.shapeId, cmdStateValue.rotation, cmdStateValue.flipH, cmdStateValue.flipV);
                            for (const grid of info.usedGrid) {
                                this.game.boatMgr.markGridUsed(cmdStateValue.shapeId, grid.x, grid.y);
                            }
                            this.game.boatMgr.updateGridOverlay();
                            if (info.canTakeCommonTreasure) {
                                this.game.phase45Mgr.allowTakeCommonTreasure();
                            }
                            if (info.canPutNextShapeAnywhere) {
                                this.game.phase45Mgr.takeNextShapeAnywhere();
                            }
                        },
                        (info) => {
                            this.game.boatMgr.markGridUnused(cmdStateValue.shapeId);
                            this.game.boatMgr.updateGridOverlay();
                            if (info.canTakeCommonTreasure) {
                                this.game.phase45Mgr.undoAllowTakeCommonTreasure();
                            }
                            if (info.canPutNextShapeAnywhere) {
                                this.game.phase45Mgr.undoTakeNextShapeAnywhere();
                            }
                        },
                    );
                    cmd.addSimple(
                        () => {
                            this.game.islandMgr.removeAllIslandClickable();
                        },
                        () => {},
                    );
                    cmd.endCommand();
                },
                playAnytimeCard(cardId, canPlayCardFct = null) {
                    const cmd = this.game.commandMgr;
                    if (cmd.isInCommand()) {
                        this.game.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error');
                        return;
                    }
                    if (canPlayCardFct !== null) {
                        if (!canPlayCardFct()) {
                            return;
                        }
                    }
                    if (this.game.cardMgr.isCardAnytimeServerSideFromCardId(cardId)) {
                        if (this.game.phase45Mgr.canTakeCommonTreasure() ||
                            this.game.phase45Mgr.canTakeRareTreasure() ||
                            this.game.phase45Mgr.canTakeSmallTreasure()) {
                            this.game.showMessage(_('You must place the allowed treasures first'), 'error');
                            return;
                        }
                        this.game.confirmationDialog(_('This card reveals information and cannot be undone.'), () => {
                            this.game.ajaxAction('playAnytimeCard', {
                                    cardId: cardId,
                                    actions: JSON.stringify(cmd.commandGroupsStateValues()),
                                },
                                () => {
                                    // Remove any Redo
                                    cmd.clearCommandGroup();
                                }
                            );
                        });
                        return;
                    }
                    switch (this.game.cardMgr.getCardAnytimeTypeIdFromCardId(cardId)) {
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_OSHAX:
                            this._gainFishForAny(cardId, () => 2 * this.game.boatMgr.countOshax());
                            break;
                        case this.CARD_ANYTIME_TYPE_ID_NEXT_SHAPE_ANYWHERE:
                            this._nextShapeAnywhere(cardId);
                            break;
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET:
                            this._gainFishForBasket(cardId);
                            break;
                        case this.CARD_ANYTIME_TYPE_ID_MOVE_CATS_FROM_FIELDS:
                            this._moveCatsFromFields(cardId);
                            break;
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_LESSONS:
                            this._gainFishForAny(cardId, () => this.game.cardMgr.countPrivateLessons());
                            break;
                        case this.CARD_ANYTIME_TYPE_ID_RESCUE_MORE_CATS:
                            this._rescueMoreCats(cardId);
                            break;
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_BASKET:
                            this._gainBasket(cardId);
                            break;
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_LESSON:
                            this._gainBasketForLesson(cardId);
                            break;
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_TREASURE:
                            this._gainBasketForTreasure(cardId);
                            break;
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COLOR:
                            this._gainFishForAny(cardId, () => this.game.boatMgr.countUniqueColorNoOshax());
                            break;
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_RARE_TREASURE:
                            this._gainFishForAny(cardId, () => 2 * this.game.boatMgr.countRareTreasure());
                            break;
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE:
                            this._gainFishForAny(cardId, () => this.game.boatMgr.countCommonTreasure());
                            break;
                        case this.CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_CAT_OF_COLOR:
                            if (this.game.isSoloMode()) {
                                this._gainFishForCatOfColor(cardId);
                            } else {
                                this._gainFishForAny(cardId, () => this.game.boatMgr.countMostCommonColor());
                            }
                            break;
                    }
                },
                _gainFishForAny(cardId, fishGainFct) {
                    const cmd = this.game.commandMgr;
                    const cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_ANYTIME_CARD,
                        cardId: cardId,
                    };
                    const fishGain = fishGainFct();
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                            this.game.fishMgr.gainCurrentPlayerFish(fishGain, 'tioc-card-id-' + cardId);
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.fishMgr.gainCurrentPlayerFish(-1 * fishGain);
                        },
                    );
                    cmd.endCommand();
                },
                _gainFishForCatOfColor(cardId) {
                    const cmd = this.game.commandMgr;
                    const cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_ANYTIME_CARD,
                        cardId: cardId,
                        colorId: null,
                        fishGain: null,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must choose a cat color to gain fish'));
                            this.game.actionMgr.showColorDialog((colorId) => {
                                if (colorId === null) {
                                    onError();
                                    return;
                                }
                                cmdStateValue.colorId = colorId;
                                cmdStateValue.fishGain = this.game.boatMgr.countCatColor(colorId);
                                onContinue();
                            },
                            {
                                'blue': '+' + this.game.boatMgr.countCatColor(this.game.CAT_COLOR_ID_BLUE),
                                'green': '+' + this.game.boatMgr.countCatColor(this.game.CAT_COLOR_ID_GREEN),
                                'red': '+' + this.game.boatMgr.countCatColor(this.game.CAT_COLOR_ID_RED),
                                'purple': '+' + this.game.boatMgr.countCatColor(this.game.CAT_COLOR_ID_PURPLE),
                                'orange': '+' + this.game.boatMgr.countCatColor(this.game.CAT_COLOR_ID_ORANGE),
                            });
                        },
                        () => {},
                        () => {}
                    );
                    cmd.addSimple(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                            this.game.fishMgr.gainCurrentPlayerFish(cmdStateValue.fishGain, 'tioc-card-id-' + cardId);
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.fishMgr.gainCurrentPlayerFish(-1 * cmdStateValue.fishGain);
                        },
                    );
                    cmd.endCommand();
                },
                _gainFishForBasket(cardId) {
                    const cmd = this.game.commandMgr;
                    const cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_ANYTIME_CARD,
                        cardId: cardId,
                        basketId: null,
                    };
                    const fishGain = 5;
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.basketMgr.disallowSelectAllBaskets();
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must select a basket to discard'));
                            this.game.basketMgr.allowSelectAllBaskets((basketId) => {
                                cmdStateValue.basketId = basketId;
                                this.game.fishMgr.gainCurrentPlayerFish(fishGain, 'tioc-basket-id-' + cmdStateValue.basketId);
                                this.game.basketMgr.discardBasket(cmdStateValue.basketId);
                                onContinue();
                            });
                        },
                        () => {
                            this.game.fishMgr.gainCurrentPlayerFish(fishGain);
                            this.game.basketMgr.discardBasket(cmdStateValue.basketId);
                        },
                        () => {
                            this.game.fishMgr.gainCurrentPlayerFish(-1 * fishGain);
                            this.game.basketMgr.undoDiscardBasket(cmdStateValue.basketId);
                        },
                    );
                    cmd.endCommand();
                },
                _gainBasket(cardId) {
                    const cmd = this.game.commandMgr;
                    const cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_ANYTIME_CARD,
                        cardId: cardId,
                        newBasketId: null,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple3(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                            cmdStateValue.newBasketId = this.game.basketMgr.createNewBasket();
                        },
                        () => {
                            this.game.cardMgr.useCard(cardId);
                            this.game.basketMgr.createNewBasket(cmdStateValue.newBasketId);
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.basketMgr.destroyBasket(cmdStateValue.newBasketId);
                        },
                    );
                    cmd.endCommand();
                },
                _gainBasketForLesson(cardId) {
                    const cmd = this.game.commandMgr;
                    const cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_ANYTIME_CARD,
                        cardId: cardId,
                        newBasketId: null,
                        firstLessonCardId: null,
                        secondLessonCardId: null,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.cardMgr.unuseCard(cmdStateValue.firstLessonCardId);
                            this.game.cardMgr.unuseCard(cmdStateValue.secondLessonCardId);
                            this.game.cardMgr.disallowSelectPrivateLesson();
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must select 2 of your private lessons to discard'));
                            this.game.cardMgr.allowSelectPrivateLesson((cardId) => {
                                cmdStateValue.firstLessonCardId = cardId;
                                this.game.cardMgr.useCard(cmdStateValue.firstLessonCardId);
                                cmd.changeTitle(_('${you} must select another of your private lessons to discard'));
                                this.game.cardMgr.allowSelectPrivateLesson((cardId) => {
                                    cmdStateValue.secondLessonCardId = cardId;
                                    this.game.cardMgr.useCard(cmdStateValue.secondLessonCardId);
                                    this.game.cardMgr.disallowSelectPrivateLesson();
                                    onContinue();
                                });
                            });
                        },
                        () => {
                            this.game.cardMgr.useCard(cmdStateValue.firstLessonCardId);
                            this.game.cardMgr.useCard(cmdStateValue.secondLessonCardId);
                        },
                        () => {},
                    );
                    cmd.addSimple3(
                        () => {
                            cmdStateValue.newBasketId = this.game.basketMgr.createNewBasket();
                        },
                        () => {
                            this.game.basketMgr.createNewBasket(cmdStateValue.newBasketId);
                        },
                        () => {
                            this.game.basketMgr.destroyBasket(cmdStateValue.newBasketId);
                        },
                    );
                    cmd.endCommand();
                },
                _gainBasketForTreasure(cardId) {
                    const cmd = this.game.commandMgr;
                    const cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_ANYTIME_CARD,
                        cardId: cardId,
                        newBasketId: null,
                        firstShapeId: null,
                        secondShapeId: null,
                    };
                    const shapeUsedGrid = {
                        firstShapeGrid: null,
                        secondShapeGrid: null,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.boatMgr.unuseShape(cmdStateValue.firstShapeId, shapeUsedGrid.firstShapeGrid);
                            this.game.boatMgr.unuseShape(cmdStateValue.secondShapeId, shapeUsedGrid.secondShapeGrid);
                            this.game.boatMgr.removeAllBoatClickable();
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must select 2 of the treasures on your boat to discard'));
                            this.game.boatMgr.allowSelectTreasure((shapeId) => {
                                cmdStateValue.firstShapeId = shapeId;
                                shapeUsedGrid.firstShapeGrid = this.game.boatMgr.useShape(cmdStateValue.firstShapeId);
                                cmd.changeTitle(_('${you} must select another of the treasures on your boat to discard'));
                                this.game.boatMgr.allowSelectTreasure((shapeId) => {
                                    cmdStateValue.secondShapeId = shapeId;
                                    shapeUsedGrid.secondShapeGrid = this.game.boatMgr.useShape(cmdStateValue.secondShapeId);
                                    onContinue();
                                });
                            });
                        },
                        () => {
                            shapeUsedGrid.firstShapeGrid = this.game.boatMgr.useShape(cmdStateValue.firstShapeId);
                            shapeUsedGrid.secondShapeGrid = this.game.boatMgr.useShape(cmdStateValue.secondShapeId);
                        },
                        () => {},
                    );
                    cmd.addSimple3(
                        () => {
                            cmdStateValue.newBasketId = this.game.basketMgr.createNewBasket();
                        },
                        () => {
                            this.game.basketMgr.createNewBasket(cmdStateValue.newBasketId);
                        },
                        () => {
                            this.game.basketMgr.destroyBasket(cmdStateValue.newBasketId);
                        },
                    );
                    cmd.endCommand();
                },
                _nextShapeAnywhere(cardId) {
                    const cmd = this.game.commandMgr;
                    const cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_ANYTIME_CARD,
                        cardId: cardId,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.addValidation(
                        _('You can already place the next shape anywhere'),
                        () => !this.game.phase45Mgr.canPutNextShapeAnywhere(),
                    );
                    cmd.addSimple(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                            this.game.phase45Mgr.allowNextShapeAnywhere();
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.phase45Mgr.undoAllowNextShapeAnywhere();
                        },
                    );
                    cmd.endCommand();
                },
                _rescueMoreCats(cardId) {
                    const cmd = this.game.commandMgr;
                    const cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_ANYTIME_CARD,
                        cardId: cardId,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                            this.game.phase45Mgr.allowRescueExtraCat();
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.phase45Mgr.undoAllowRescueExtraCat();
                        },
                    );
                    cmd.endCommand();
                },
                _moveCatsFromFields(cardId) {
                    const cmd = this.game.commandMgr;
                    const cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_ANYTIME_CARD,
                        cardId: cardId,
                        shapeId1: null,
                        shapeId2: null,
                        shapeId3: null,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.islandMgr.removeAllIslandClickable();
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} can select up to 3 cats to move to the opposite field'));
                            this.game.islandMgr.allowMoveCats((shapeIdArray) => {
                                for (let i = 0; i < shapeIdArray.length; ++i) {
                                    cmdStateValue['shapeId' + (i + 1)] = shapeIdArray[i];
                                    this.game.islandMgr.moveCatToOtherField(shapeIdArray[i]);
                                }
                                let soloOrders = null;
                                if (this.game.isSoloMode()) {
                                    soloOrders = this.game.islandMgr.renumberSoloOrder();
                                }
                                onContinue(soloOrders);
                            });
                        },
                        () => {
                            for (let i = 1; i <= 3; ++i) {
                                this.game.islandMgr.moveCatToOtherField(cmdStateValue['shapeId' + i]);
                            }
                            if (this.game.isSoloMode()) {
                                this.game.islandMgr.renumberSoloOrder();
                            }
                        },
                        (soloOrders) => {
                            for (let i = 1; i <= 3; ++i) {
                                this.game.islandMgr.moveCatToOtherField(cmdStateValue['shapeId' + i]);
                            }
                            if (this.game.isSoloMode()) {
                                this.game.islandMgr.updateSoloOrder(soloOrders);
                            }
                        },
                    );
                    cmd.endCommand();
                },
            }
        );
    }
);