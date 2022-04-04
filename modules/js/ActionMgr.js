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
            'tioc.ActionMgr',
            null, {
                game: null,

                ACTION_TYPE_ID_RESCUE_CARD: 0,
                ACTION_TYPE_ID_RESCUE_BASKET: 1,
                ACTION_TYPE_ID_COMMON_TREASURE: 2,
                ACTION_TYPE_ID_OSHAX: 3,
                ACTION_TYPE_ID_TREASURE_CARD: 4,
                ACTION_TYPE_ID_RARE_TREASURE: 5,
                ACTION_TYPE_ID_ANYTIME_CARD: 6,
                ACTION_TYPE_ID_BUY_CARD: 7,
                ACTION_TYPE_ID_TO_PLACE_SHAPE: 8,
                ACTION_TYPE_ID_UNBUY_CARD: 9,
                ACTION_TYPE_ID_RESCUE_FAMILY: 11,

                rescueCardHalfBasketFct: null,

                constructor(game) {
                    this.game = game;
                },
                showColorDialog(choiceFunction) {
                    this.game.closeAllTooltips();
                    let colorDialog = new ebg.popindialog();
                    colorDialog.create('tioc-color-choice-dialog');
                    colorDialog.setTitle(_("Choose a color:"));
                    colorDialog.setContent(
                        '<div class="tioc-color-choice-list">' +
                        '   <div class="tioc-clickable tioc-clickable-no-border tioc-meeple cat blue" data-color-id="0"></div>' +
                        '   <div class="tioc-clickable tioc-clickable-no-border tioc-meeple cat green" data-color-id="1"></div>' +
                        '   <div class="tioc-clickable tioc-clickable-no-border tioc-meeple cat red" data-color-id="2"></div>' +
                        '   <div class="tioc-clickable tioc-clickable-no-border tioc-meeple cat purple" data-color-id="3"></div>' +
                        '   <div class="tioc-clickable tioc-clickable-no-border tioc-meeple cat orange" data-color-id="4"></div>' +
                        '</div>');
                    colorDialog.replaceCloseCallback(() => {
                        colorDialog.destroy();
                        choiceFunction(null);
                    });
                    colorDialog.show();
                    const meeples = document.querySelectorAll('.tioc-color-choice-list .tioc-clickable');
                    for (const meeple of meeples) {
                        const colorId = meeple.dataset.colorId;
                        this.game.addOnClick(meeple, (event) => {
                            event.preventDefault();
                            colorDialog.destroy();
                            choiceFunction(colorId);
                        });
                    }
                },
                showSmallTreasureDialog(choiceFunction) {
                    this.game.closeAllTooltips();
                    let dialog = new ebg.popindialog();
                    dialog.create('tioc-small-treasure-dialog');
                    dialog.setTitle(_("Small or any common treasure:"));
                    dialog.setContent(
                        '<div class="tioc-small-treasure-list">' +
                        '   <div class="tioc-clickable tioc-small-treasure-list-choice" data-is-small="true">' +
                        '      <div class="tioc-shape shape-type-2 shape-def-100"></div>' +
                        '      <div class="tioc-shape shape-type-2 shape-def-101"></div>' +
                        '   </div>' +
                        '   <div class="tioc-clickable tioc-small-treasure-list-choice" data-is-small="false">' +
                        '      <div class="tioc-pay-fish"></div>' +
                        '      <div class="tioc-shape shape-type-2 shape-def-100"></div>' +
                        '      <div class="tioc-shape shape-type-2 shape-def-101"></div>' +
                        '      <div class="tioc-shape shape-type-2 shape-def-102"></div>' +
                        '      <div class="tioc-shape shape-type-2 shape-def-103"></div>' +
                        '   </div>' +
                        '</div>');
                    dialog.replaceCloseCallback(() => {
                        dialog.destroy();
                        choiceFunction(null);
                    });
                    dialog.show();
                    dojo.query('.tioc-small-treasure-list .tioc-clickable').connect('onclick', (event) => {
                        window.tiocWrap('showSmallTreasureDialog_onclick', () => {
                            event.preventDefault();
                            dialog.destroy();
                            choiceFunction(event.currentTarget.dataset.isSmall == 'true');
                        });
                    });
                },
                buyCard(cardId) {
                    const cmd = this.game.commandMgr;
                    if (cmd.isInCommand()) {
                        this.game.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error');
                        return;
                    }
                    const price = this.game.cardMgr.getCardPriceFromCardId(cardId);
                    const cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_BUY_CARD,
                        cardId: cardId,
                        colorId: null,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.addValidation(
                        _('You do not have enough fish to buy this card'),
                        () => this.game.fishMgr.currentPlayerFishCount() >= price,
                    );
                    cmd.addSimple(
                        () => {
                            this.game.fishMgr.useCurrentPlayerFish(price);
                            this.game.cardMgr.moveCurrentPlayerCardToHand(cardId);
                            this.game.cardMgr.allowBuyCards();
                            this.game.cardMgr.allowUnbuyCards();
                        },
                        () => {
                            this.game.fishMgr.useCurrentPlayerFish(-1 * price);
                            this.game.cardMgr.moveCurrentPlayerCardToBuy(cardId);
                            this.game.cardMgr.allowBuyCards();
                            this.game.cardMgr.allowUnbuyCards();
                        },
                    );
                    if (this.game.cardMgr.cardNeedsBuyColorFromCardId(cardId)) {
                        cmd.add(
                            (onContinue, onError) => {
                                cmd.changeTitle(_('${you} must select a color for the card'));
                                this.showColorDialog((colorId) => {
                                    if (colorId === null) {
                                        onError();
                                    } else {
                                        cmdStateValue.colorId = colorId;
                                        this.game.cardMgr.addColorToCardId(cardId, colorId);
                                        onContinue(colorId);
                                    }
                                });
                            },
                            (colorId) => {
                                this.game.cardMgr.addColorToCardId(cardId, colorId);
                            },
                            (colorId) => {
                                this.game.cardMgr.removeColorFromCardId(cardId);
                            },
                        );
                    }
                    cmd.endCommand();
                },
                unbuyCard(cardId) {
                    const cmd = this.game.commandMgr;
                    if (cmd.isInCommand()) {
                        this.game.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error');
                        return;
                    }
                    const price = this.game.cardMgr.getCardPriceFromCardId(cardId);
                    const cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_UNBUY_CARD,
                        cardId: cardId,
                    };
                    const colorId = this.game.cardMgr.getCurrentColorIdFromCardId(cardId);
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple(
                        () => {
                            this.game.fishMgr.useCurrentPlayerFish(-1 * price);
                            this.game.cardMgr.removeColorFromCardId(cardId);
                            this.game.cardMgr.moveCurrentPlayerCardToBuy(cardId);
                            this.game.cardMgr.allowBuyCards();
                            this.game.cardMgr.allowUnbuyCards();
                        },
                        () => {
                            this.game.fishMgr.useCurrentPlayerFish(price);
                            this.game.cardMgr.moveCurrentPlayerCardToHand(cardId);
                            this.game.cardMgr.addColorToCardId(cardId, colorId);
                            this.game.cardMgr.allowBuyCards();
                            this.game.cardMgr.allowUnbuyCards();
                        },
                    );
                    cmd.endCommand();
                },
                playRescueCard(cardId) {
                    if (this.game.cardMgr.isCardUsed(cardId)) {
                        // Clicking too fast, do not display anything
                        return;
                    }
                    if (this.game.phase45Mgr.canTakeCommonTreasure() ||
                        this.game.phase45Mgr.canTakeRareTreasure() ||
                        this.game.phase45Mgr.canTakeSmallTreasure()) {
                        this.game.showMessage(_('You must place the allowed treasures first'), 'error');
                        return;
                    }
                    const cardBasketTypeId = this.game.cardMgr.getCardBasketTypeIdFromCardId(cardId);
                    const cmd = this.game.commandMgr;
                    if (cmd.isInCommand()) {
                        if (this.rescueCardHalfBasketFct !== null && cardBasketTypeId === this.game.cardMgr.CARD_BASKET_TYPE_ID_HALF) {
                            this.rescueCardHalfBasketFct(cardId);
                            return;
                        }
                        this.game.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error');
                        return;
                    }
                    if (cardBasketTypeId === null) {
                        this.game.showMessage(_('You cannot rescue cats with this card'), 'error');
                        return;
                    }
                    if (!this.game.phase45Mgr.canRescueCat()) {
                        this.game.showMessage(_('You have already rescued all allowed cats on your turn'), 'error');
                        return;
                    }
                    let cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_RESCUE_CARD,
                        firstCardId: cardId,
                        secondCardId: null,
                        shapeId: null,
                        x: null,
                        y: null,
                        rotation: null,
                        flipH: null,
                        flipV: null,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.islandMgr.removeAllIslandClickable();
                            this.game.boatMgr.removeAllBoatClickable();
                        },
                    );
                    if (cardBasketTypeId == this.game.cardMgr.CARD_BASKET_TYPE_ID_HALF) {
                        cmd.add(
                            (onContinue, onError) => {
                                cmd.changeTitle(_('${you} must select another half basket card'));
                                this.rescueCardHalfBasketFct = ((secondCardId) => {
                                    this.rescueCardHalfBasketFct = null;
                                    cmdStateValue.secondCardId = secondCardId;
                                    this.game.cardMgr.useCard(secondCardId);
                                    onContinue();
                                });
                            },
                            () => {
                                this.game.cardMgr.useCard(cmdStateValue.secondCardId);
                            },
                            () => {
                                this.game.cardMgr.unuseCard(cmdStateValue.secondCardId);
                                this.rescueCardHalfBasketFct = null;
                            },
                        );
                    }
                    this._rescueCatEndCommand(cmd, cmdStateValue);
                },
                playBasket(basketId) {
                    const cmd = this.game.commandMgr;
                    if (cmd.isInCommand()) {
                        this.game.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error');
                        return;
                    }
                    if (this.game.basketMgr.isBasketUsed(basketId)) {
                        this.game.showMessage(_('This basket was already used'), 'error');
                        return;
                    }
                    if (!this.game.phase45Mgr.canRescueCat()) {
                        this.game.showMessage(_('You have already rescued all allowed cats on your turn'), 'error');
                        return;
                    }
                    if (this.game.phase45Mgr.canTakeCommonTreasure() ||
                        this.game.phase45Mgr.canTakeRareTreasure() ||
                        this.game.phase45Mgr.canTakeSmallTreasure()) {
                        this.game.showMessage(_('You must place the allowed treasures first'), 'error');
                        return;
                    }
                    let cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_RESCUE_BASKET,
                        basketId: basketId,
                        shapeId: null,
                        x: null,
                        y: null,
                        rotation: null,
                        flipH: null,
                        flipV: null,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple(
                        () => {
                            this.game.basketMgr.useBasket(basketId);
                        },
                        () => {
                            this.game.basketMgr.unuseBasket(basketId);
                            this.game.islandMgr.removeAllIslandClickable();
                            this.game.boatMgr.removeAllBoatClickable();
                        },
                    );
                    this._rescueCatEndCommand(cmd, cmdStateValue);
                },
                _rescueCatEndCommand(cmd, cmdStateValue) {
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must select a cat in one of the fields of the island'));
                            this.game.islandMgr.allowRescueCat((shapeId, price) => {
                                cmd.changeTitle(_('${you} must select where to put the cat on your boat'));
                                this.game.boatMgr.allowPlaceShape((x, y) => {
                                    cmdStateValue.shapeId = shapeId;
                                    cmdStateValue.x = x;
                                    cmdStateValue.y = y;
                                    this.game.fishMgr.useCurrentPlayerFish(price);
                                    this.game.boatMgr.moveShapeToBoat(this.game.player_id, shapeId, x, y);
                                    onContinue(price);
                                });
                            });
                        },
                        (price) => {
                            this.game.fishMgr.useCurrentPlayerFish(price);
                            this.game.boatMgr.moveShapeToBoat(this.game.player_id, cmdStateValue.shapeId, cmdStateValue.x, cmdStateValue.y);
                        },
                        (price) => {
                            this.game.fishMgr.useCurrentPlayerFish(-1 * price);
                            this.game.shapeControl.detach();
                            this.game.islandMgr.moveShapeToIsland(cmdStateValue.shapeId, price);
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must confirm the position of the cat on your boat'));
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
                                    this.game.phase45Mgr.catRescued();
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
                            this.game.phase45Mgr.catRescued();
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
                            this.game.phase45Mgr.undoCatRescued();
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
                takeCommonTreasure(shapeId, doTakeFct = null, undoTakeFct = null) {
                    if (!this.game.phase45Mgr.canTakeCommonTreasure()) {
                        this.game.showMessage(_('You cannot take a common treasure now'), 'error');
                        return;
                    }
                    this._takeTreasure(
                        shapeId,
                        this.ACTION_TYPE_ID_COMMON_TREASURE,
                        doTakeFct !== null ? doTakeFct : () => this.game.phase45Mgr.takeCommonTreasure(),
                        undoTakeFct !== null ? undoTakeFct : () => this.game.phase45Mgr.undoTakeCommonTreasure(),
                    );
                },
                takeSmallTreasure(shapeId) {
                    if (!this.game.phase45Mgr.canTakeSmallTreasure()) {
                        this.game.showMessage(_('You cannot take a small treasure now'), 'error');
                        return;
                    }
                    this._takeTreasure(
                        shapeId,
                        this.ACTION_TYPE_ID_COMMON_TREASURE,
                        () => this.game.phase45Mgr.takeSmallTreasure(),
                        () => this.game.phase45Mgr.undoTakeSmallTreasure(),
                    );
                },
                takeRareTreasure(shapeId) {
                    if (!this.game.phase45Mgr.canTakeRareTreasure()) {
                        this.game.showMessage(_('You cannot take a rare treasure now'), 'error');
                        return;
                    }
                    this._takeTreasure(
                        shapeId,
                        this.ACTION_TYPE_ID_RARE_TREASURE,
                        () => {
                            this.game.phase45Mgr.takeRareTreasure()
                            this.game.phase45Mgr.undoAllowTakeCommonTreasure();
                            this.game.phase45Mgr.undoAllowTakeCommonTreasure();
                        },
                        () => {
                            this.game.phase45Mgr.undoTakeRareTreasure()
                            this.game.phase45Mgr.allowTakeCommonTreasure();
                            this.game.phase45Mgr.allowTakeCommonTreasure();
                        },
                    );
                },
                _takeTreasure(shapeId, actionTypeId, doTakeFct, undoTakeFct) {
                    const cmd = this.game.commandMgr;
                    if (cmd.isInCommand()) {
                        this.game.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error');
                        return;
                    }
                    let cmdStateValue = {
                        actionTypeId: actionTypeId,
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
                            doTakeFct();
                        },
                        () => {
                            undoTakeFct();
                        },
                    );
                    cmd.addSimple(
                        () => {},
                        () => {
                            this.game.islandMgr.removeAllIslandClickable();
                            this.game.boatMgr.removeAllBoatClickable();
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must select where to put the treasure on your boat'));
                            this.game.boatMgr.allowPlaceShape((x, y) => {
                                cmdStateValue.x = x;
                                cmdStateValue.y = y;
                                this.game.boatMgr.moveShapeToBoat(this.game.player_id, shapeId, x, y);
                                onContinue();
                            });
                        },
                        (price) => {
                            this.game.boatMgr.moveShapeToBoat(this.game.player_id, cmdStateValue.shapeId, cmdStateValue.x, cmdStateValue.y);
                        },
                        (price) => {
                            this.game.shapeControl.detach();
                            this.game.islandMgr.moveShapeToIsland(cmdStateValue.shapeId);
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must confirm the position of the treasure on your boat'));
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
                                    for (const grid of usedGrid) {
                                        this.game.boatMgr.markGridUsed(cmdStateValue.shapeId, grid.x, grid.y);
                                    }
                                    this.game.boatMgr.updateGridOverlay();
                                    if (canPutNextShapeAnywhere) {
                                        this.game.phase45Mgr.takeNextShapeAnywhere();
                                    }
                                    onContinue({
                                        usedGrid: usedGrid,
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
                            if (info.canPutNextShapeAnywhere) {
                                this.game.phase45Mgr.takeNextShapeAnywhere();
                            }
                        },
                        (info) => {
                            this.game.boatMgr.markGridUnused(cmdStateValue.shapeId);
                            this.game.boatMgr.updateGridOverlay();
                            if (info.canPutNextShapeAnywhere) {
                                this.game.phase45Mgr.undoTakeNextShapeAnywhere();
                            }
                        },
                    );
                    cmd.endCommand();
                },
                playOshaxCard(cardId) {
                    if (this.game.cardMgr.isCardUsed(cardId)) {
                        // Clicking too fast, do not display anything
                        return;
                    }
                    const cmd = this.game.commandMgr;
                    if (cmd.isInCommand()) {
                        this.game.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error');
                        return;
                    }
                    if (this.game.phase45Mgr.hasRareFinds()) {
                        this.game.showMessage(_('You have already played a rare find on your turn'), 'error');
                        return;
                    }
                    if (this.game.phase45Mgr.canTakeCommonTreasure() ||
                        this.game.phase45Mgr.canTakeRareTreasure() ||
                        this.game.phase45Mgr.canTakeSmallTreasure()) {
                        this.game.showMessage(_('You must place the allowed treasures first'), 'error');
                        return;
                    }
                    let cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_OSHAX,
                        cardId: cardId,
                        colorId: null,
                        shapeId: null,
                        x: null,
                        y: null,
                        rotation: null,
                        flipH: null,
                        flipV: null,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.addValidation(
                        _('There are no oshax left'),
                        () => this.game.islandMgr.hasOshax(),
                    );
                    cmd.addSimple(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                            this.game.phase45Mgr.playRareFinds();
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.phase45Mgr.undoPlayRareFinds();
                            this.game.islandMgr.removeAllIslandClickable();
                            this.game.boatMgr.removeAllBoatClickable();
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must select an oshax to rescue'));
                            this.game.islandMgr.allowRescueOshax((shapeId) => {
                                cmd.changeTitle(_('${you} must select where to put the oshax on your boat'));
                                this.game.boatMgr.allowPlaceShape((x, y) => {
                                    cmdStateValue.shapeId = shapeId;
                                    cmdStateValue.x = x;
                                    cmdStateValue.y = y;
                                    this.game.boatMgr.moveShapeToBoat(this.game.player_id, shapeId, x, y);
                                    onContinue();
                                });
                            });
                        },
                        () => {
                            this.game.boatMgr.moveShapeToBoat(this.game.player_id, cmdStateValue.shapeId, cmdStateValue.x, cmdStateValue.y);
                        },
                        () => {
                            this.game.shapeControl.detach();
                            this.game.islandMgr.moveShapeToIsland(cmdStateValue.shapeId);
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must confirm the placement of the oshax on your boat'));
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
                                    cmd.changeTitle(_('${you} must choose the color of the oshax'));
                                    this.showColorDialog((colorId) => {
                                        if (colorId === null) {
                                            onError();
                                        } else {
                                            cmdStateValue.colorId = colorId;
                                            this.game.boatMgr.placeColorIdOnShapeId(cmdStateValue.shapeId, cmdStateValue.colorId);
                                            let canTakeCommonTreasure = false;
                                            for (const grid of usedGrid) {
                                                this.game.boatMgr.markGridUsed(cmdStateValue.shapeId, grid.x, grid.y);
                                                if (this.game.boatMgr.gridMapMatchesColor(grid.x, grid.y, this.game.CAT_COLOR_NAMES[colorId])) {
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
                                    });
                                }
                            );
                        },
                        (info) => {
                            this.game.boatMgr.applyTransformToShapeId(cmdStateValue.shapeId, cmdStateValue.rotation, cmdStateValue.flipH, cmdStateValue.flipV);
                            this.game.boatMgr.placeColorIdOnShapeId(cmdStateValue.shapeId, cmdStateValue.colorId);
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
                playTreasureCard(cardId) {
                    if (this.game.cardMgr.isCardUsed(cardId)) {
                        // Clicking too fast, do not display anything
                        return;
                    }
                    const cmd = this.game.commandMgr;
                    if (cmd.isInCommand()) {
                        this.game.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error');
                        return;
                    }
                    if (this.game.phase45Mgr.hasRareFinds()) {
                        this.game.showMessage(_('You have already played a rare find on your turn'), 'error');
                        return;
                    }
                    if (this.game.phase45Mgr.canTakeCommonTreasure() ||
                        this.game.phase45Mgr.canTakeRareTreasure() ||
                        this.game.phase45Mgr.canTakeSmallTreasure()) {
                        this.game.showMessage(_('You must place the allowed treasures first'), 'error');
                        return;
                    }
                    const cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_TREASURE_CARD,
                        cardId: cardId,
                        isSmallTreasure: null,
                    };
                    switch (this.game.cardMgr.getCardTreasureTypeIdFromCardId(cardId)) {
                        case this.game.cardMgr.CARD_TREASURE_TYPE_ID_ONE_RARE_TWO_COMMON:
                            this._playTreasureCardOneRareTwoCommon(cardId, cmdStateValue);
                            break;
                        case this.game.cardMgr.CARD_TREASURE_TYPE_ID_TWO_SMALL_TWO_COMMON:
                            this._playTreasureCardTwoSmallTwoCommon(cardId, cmdStateValue);
                            break;
                        default:
                            this.game.showMessage(_('Invalid card'), 'error');
                            break;
                    }
                },
                _playTreasureCardOneRareTwoCommon(cardId, cmdStateValue) {
                    const cmd = this.game.commandMgr;
                    cmd.startCommand(cmdStateValue);
                    cmd.addValidation(
                        _('There are no treasures left'),
                        () => this.game.islandMgr.hasCommonTreasure() || this.game.islandMgr.hasRareTreasure(),
                    );
                    cmd.addSimple(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                            this.game.phase45Mgr.playRareFinds();
                            this.game.phase45Mgr.allowTakeRareTreasure();
                            this.game.phase45Mgr.allowTakeCommonTreasure();
                            this.game.phase45Mgr.allowTakeCommonTreasure();
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.phase45Mgr.undoPlayRareFinds();
                            this.game.phase45Mgr.undoAllowTakeRareTreasure();
                            this.game.phase45Mgr.undoAllowTakeCommonTreasure();
                            this.game.phase45Mgr.undoAllowTakeCommonTreasure();
                        },
                    );
                    cmd.endCommand();
                },
                _playTreasureCardTwoSmallTwoCommon(cardId, cmdStateValue) {
                    const cmd = this.game.commandMgr;
                    cmd.startCommand(cmdStateValue);
                    cmd.addValidation(
                        _('There are no common treasures left'),
                        () => this.game.islandMgr.hasCommonTreasure(),
                    );
                    cmd.addSimple(
                        () => {
                            this.game.cardMgr.useCard(cardId);
                            this.game.phase45Mgr.playRareFinds();
                        },
                        () => {
                            this.game.cardMgr.unuseCard(cardId);
                            this.game.phase45Mgr.undoPlayRareFinds();
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must choose to take small or common treasures'));
                            this.showSmallTreasureDialog((isSmallTreasure) => {
                                if (isSmallTreasure === null) {
                                    onError();
                                    return;
                                }
                                cmdStateValue.isSmallTreasure = isSmallTreasure;
                                if (cmdStateValue.isSmallTreasure) {
                                    this.game.phase45Mgr.allowTakeSmallTreasure();
                                    this.game.phase45Mgr.allowTakeSmallTreasure();
                                } else {
                                    this.game.phase45Mgr.allowTakeCommonTreasure();
                                    this.game.phase45Mgr.allowTakeCommonTreasure();
                                    this.game.fishMgr.useCurrentPlayerFish(1);
                                }
                                onContinue();
                            });
                        },
                        () => {
                            if (cmdStateValue.isSmallTreasure) {
                                this.game.phase45Mgr.allowTakeSmallTreasure();
                                this.game.phase45Mgr.allowTakeSmallTreasure();
                            } else {
                                this.game.phase45Mgr.allowTakeCommonTreasure();
                                this.game.phase45Mgr.allowTakeCommonTreasure();
                                this.game.fishMgr.useCurrentPlayerFish(1);
                            }
                        },
                        () => {
                            if (cmdStateValue.isSmallTreasure) {
                                this.game.phase45Mgr.undoAllowTakeSmallTreasure();
                                this.game.phase45Mgr.undoAllowTakeSmallTreasure();
                            } else {
                                this.game.phase45Mgr.undoAllowTakeCommonTreasure();
                                this.game.phase45Mgr.undoAllowTakeCommonTreasure();
                                this.game.fishMgr.useCurrentPlayerFish(-1);
                            }
                        }
                    );
                    cmd.addValidation(
                        _('You do not have enough fish to take common treasures'),
                        () => this.game.fishMgr.currentPlayerFishCount() >= 0,
                    );
                    cmd.endCommand();
                },
                familyRescueCat(shapeId, price) {
                    const cmd = this.game.commandMgr;
                    if (cmd.isInCommand()) {
                        this.game.showMessage(_('You must finish your current action (or undo) before you can do this'), 'error');
                        return;
                    }
                    if (!this.game.phase45Mgr.canRescueCat()) {
                        this.game.showMessage(_('You have already rescued all allowed cats on your turn'), 'error');
                        return;
                    }
                    let cmdStateValue = {
                        actionTypeId: this.ACTION_TYPE_ID_RESCUE_FAMILY,
                        shapeId: shapeId,
                        x: null,
                        y: null,
                        rotation: null,
                        flipH: null,
                        flipV: null,
                    };
                    cmd.startCommand(cmdStateValue);
                    cmd.addSimple(
                        () => {},
                        () => {
                            this.game.islandMgr.removeAllIslandClickable();
                            this.game.islandMgr.allowFamilyRescueCat();
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must select where to put the cat on your boat'));
                            this.game.boatMgr.allowPlaceShape((x, y) => {
                                cmdStateValue.shapeId = shapeId;
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
                            this.game.islandMgr.moveShapeToIsland(cmdStateValue.shapeId, price);
                        },
                    );
                    cmd.add(
                        (onContinue, onError) => {
                            cmd.changeTitle(_('${you} must confirm the position of the cat on your boat'));
                            const canPutNextShapeAnywhere = false;
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
                                    let canTakeTreasure = false;
                                    const shapeColor = this.game.getShapeColorFromShapeId(shapeId);
                                    for (const grid of usedGrid) {
                                        this.game.boatMgr.markGridUsed(cmdStateValue.shapeId, grid.x, grid.y);
                                        if (this.game.boatMgr.gridMapMatchesColor(grid.x, grid.y, shapeColor)) {
                                            canTakeTreasure = true;
                                        }
                                    }
                                    this.game.boatMgr.updateGridOverlay();
                                    this.game.phase45Mgr.catRescued();
                                    if (canTakeTreasure) {
                                        this.game.phase45Mgr.allowTakeCommonTreasure();
                                        this.game.phase45Mgr.allowTakeRareTreasure();
                                    }
                                    onContinue({
                                        usedGrid: usedGrid,
                                        canTakeTreasure: canTakeTreasure,
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
                            this.game.phase45Mgr.catRescued();
                            if (info.canTakeTreasure) {
                                this.game.phase45Mgr.allowTakeCommonTreasure();
                                this.game.phase45Mgr.allowTakeRareTreasure();
                            }
                        },
                        (info) => {
                            this.game.boatMgr.markGridUnused(cmdStateValue.shapeId);
                            this.game.boatMgr.updateGridOverlay();
                            this.game.phase45Mgr.undoCatRescued();
                            if (info.canTakeTreasure) {
                                this.game.phase45Mgr.undoAllowTakeCommonTreasure();
                                this.game.phase45Mgr.undoAllowTakeRareTreasure();
                            }
                        },
                    );
                    cmd.addSimple(
                        () => {
                            this.game.phase45Mgr.catRescued();
                            this.game.islandMgr.removeAllIslandClickable();
                        },
                        () => {
                            this.game.phase45Mgr.undoCatRescued();
                        },
                    );
                    cmd.endCommand();
                },
            }
        );
    }
);