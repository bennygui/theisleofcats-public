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
        'ebg/counter',
        "ebg/zone",
        g_gamethemeurl + "modules/js/ElementSorter.js",
        g_gamethemeurl + "modules/js/Scheduler.js",
    ],
    (dojo, declare) => {
        return declare(
            'tioc.IslandMgr',
            null, {
                game: null,

                COMMON_TREASURE_IDS: [100, 101, 102, 103],

                CAT_PRICE_LEFT_FIELD: 3,
                CAT_PRICE_RIGHT_FIELD: 5,

                playerPanelOrder: {},
                commonTreasureZone: {},
                shapeSorter: null,
                inAllowTryShapes: false,
                topShapeScheduler: null,

                constructor(game) {
                    this.game = game;
                    this.topShapeScheduler = new tioc.Scheduler(() => this.updateTopShapesNow());
                    this.shapeSorter = new tioc.ElementSorter(
                        '.tioc-shape',
                        (e1, e2) => {
                            let so1 = this.game.getShapeSoloOrderFromShapeId(e1.dataset.shapeId);
                            if (so1 === null) {
                                so1 = 0;
                            }
                            let so2 = this.game.getShapeSoloOrderFromShapeId(e2.dataset.shapeId);
                            if (so2 === null) {
                                so2 = 0;
                            }
                            if (so1 - so2 != 0) {
                                return so1 - so2;
                            }
                            const array1 = JSON.stringify(this.game.getShapeArrayFromShapeId(e1.dataset.shapeId));
                            const array2 = JSON.stringify(this.game.getShapeArrayFromShapeId(e2.dataset.shapeId));
                            if (array1 < array2) {
                                return -1;
                            } else if (array1 > array2) {
                                return 1;
                            } else {
                                return e1.dataset.shapeId - e2.dataset.shapeId;
                            }
                        },
                        (id, childSelector) => {
                            if (id == 'tioc-left-field' || id == 'tioc-right-field') {
                                return Array.from(this.shapeSorter.childToRemoveDefault(id, childSelector))
                                    .concat(Array.from(this.shapeSorter.childToRemoveDefault(id + '-bottom', childSelector)));
                            } else {
                                return this.shapeSorter.childToRemoveDefault(id, childSelector);
                            }
                        },
                        (id, childElements) => {
                            for (const c of childElements) {
                                const soloOrder = this.game.getShapeSoloOrderFromShapeId(c.dataset.shapeId);
                                if (soloOrder === null) {
                                    c.dataset.soloOrder = '';
                                } else {
                                    c.dataset.soloOrder = soloOrder;
                                }
                            }
                            if (id == 'tioc-left-field' || id == 'tioc-right-field') {
                                const topElem = document.getElementById(id);
                                const bottomElem = document.getElementById(id + '-bottom');
                                const maxHeight = 20 + document.getElementById('tioc-island-container').offsetHeight;
                                for (const c of childElements) {
                                    topElem.appendChild(c);
                                    if (topElem.offsetHeight > maxHeight) {
                                        topElem.removeChild(c);
                                        bottomElem.appendChild(c);
                                    }
                                }
                            } else {
                                this.shapeSorter.insertChildDefault(id, childElements);
                            }
                        },
                        () => {
                            const shapes = document.querySelectorAll('#tioc-rare-treasure-container .tioc-shape');
                            for (const shape of shapes) {
                                shape.classList.add('tioc-rare-overlap-' + this.game.getRareTreasureTypeFromShapeId(shape.dataset.shapeId));
                            }
                        },
                    );
                },
                setup(gamedatas) {
                    this.shapeSorter.addElementId('tioc-left-field', true);
                    this.shapeSorter.addElementId('tioc-right-field', true);
                    this.shapeSorter.addElementId('tioc-rare-treasure-container');
                    this.shapeSorter.addElementId('tioc-oshax-container');
                    for (const shapeDefId of this.COMMON_TREASURE_IDS) {
                        this.commonTreasureZone[shapeDefId] = new ebg.zone();
                        this.commonTreasureZone[shapeDefId].create(
                            this.game,
                            'tioc-common-treasure-zone-' + shapeDefId,
                            this.game.TILE_SIZE * 3,
                            this.game.TILE_SIZE * 3
                        );
                        this.commonTreasureZone[shapeDefId].setPattern('diagonal');
                    }
                    for (let playerId in gamedatas.players) {
                        let order = gamedatas.players[playerId].player_cat_order;
                        let colorName = gamedatas.players[playerId].player_color_name;
                        dojo.place(this.game.format_block('jstpl_meeple_cat_order', {
                                color_name: colorName,
                                player_id: playerId,
                            }),
                            'tioc-island-player-order-' + order
                        );

                        this.playerPanelOrder[playerId] = new ebg.counter();
                        this.playerPanelOrder[playerId].create('tioc-player-panel-order-' + playerId);
                        this.playerPanelOrder[playerId].setValue(order);
                    }
                    if (this.game.isSoloMode()) {
                        // Place sister cat
                        dojo.place(this.game.format_block('jstpl_meeple_cat_order', {
                                color_name: gamedatas.soloSister.player_color_name,
                                player_id: this.game.SOLO_SISTER_PLAYER_ID,
                            }),
                            'tioc-island-player-order-' + gamedatas.soloSister.player_cat_order
                        );
                    }
                    dojo.place(this.game.format_block('jstpl_meeple_boat', {}),
                        'tioc-island-day-' + gamedatas.dayCounter
                    );
                    for (const shape of gamedatas.shapes) {
                        if (shape.shapeLocationId == this.game.SHAPE_LOCATION_ID_DISCARD) {
                            continue;
                        }
                        this.createAndPlaceShape(shape, false);
                    }
                    this.game.addTooltip(
                        'tioc-island',
                        _("Cats shapes on the left have a cost of 3 fish and cats on the right have a cost of 5 fish. Cats meeple represents the player order, random at start and later based on the speed played with Rescue Cards. At the bottom of the island is the counter of the number of days until the game ends."),
                        ''
                    );
                    this.game.addTooltip(
                        'tioc-vesh-boat',
                        _("Vesh's boat indicates the number of days until the game ends."),
                        ''
                    );

                    this.game.playerPreferenceMgr.registerObserver('IslandMgr', () => {
                        this.updateTopShapes();
                    })
                },
                resizeAll() {
                    if (this.lastOffsetWidth != document.body.offsetWidth) {
                        this.lastOffsetWidth = document.body.offsetWidth;
                        this.shapeSorter.schedule();
                    }
                },
                rescale(scale) {
                    let commonTreasureHeight = 140;
                    switch (this.game.gamedatas.players.length) {
                        case 3:
                            commonTreasureHeight = 155;
                            break;
                        case 4:
                            commonTreasureHeight = 170;
                            break;
                    }
                    for (const shapeDefId of this.COMMON_TREASURE_IDS) {
                        const elem = document.getElementById('tioc-common-treasure-zone-' + shapeDefId);
                        elem.style.height = (commonTreasureHeight * scale / 100) + 'px';
                    }
                    this.shapeSorter.schedule();
                },
                updateShapesPlayedMove(lastSeenMoveNumber) {
                    const newClass = 'tioc-shape-new-drawn';
                    const shapes = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape');
                    for (const shape of shapes) {
                        const shapeMove = this.game.getPlayedMoveNumberFromShapeId(shape.dataset.shapeId);
                        if (!shapeMove || shapeMove < lastSeenMoveNumber) {
                            shape.classList.remove(newClass);
                        } else {
                            shape.classList.add(newClass);
                        }
                    }
                },
                updateSoloOrder(soloOrder) {
                    for (const shapeId in soloOrder) {
                        const order = soloOrder[shapeId];
                        this.game.updateKnownShapeSoloOrder(shapeId, order);
                    }
                    this.shapeSorter.schedule();
                },
                renumberSoloOrder() {
                    const soloOrders = {};
                    const shapes = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-0');
                    for (const shape of shapes) {
                        const shapeId = shape.dataset.shapeId;
                        soloOrders[shapeId] = this.game.getShapeSoloOrderFromShapeId(shapeId);
                    }
                    this.shapeSorter.scheduleNow();
                    const shapesArray = [
                        document.querySelectorAll('#tioc-left-field .tioc-shape.shape-type-0'),
                        document.querySelectorAll('#tioc-left-field-bottom .tioc-shape.shape-type-0'),
                        document.querySelectorAll('#tioc-right-field .tioc-shape.shape-type-0'),
                        document.querySelectorAll('#tioc-right-field-bottom .tioc-shape.shape-type-0')
                    ];
                    let soloOrder = 1;
                    for (const shapesQuery of shapesArray) {
                        for (const shape of shapesQuery) {
                            this.game.updateKnownShapeSoloOrder(shape.dataset.shapeId, soloOrder);
                            ++soloOrder;
                        }
                    }
                    this.shapeSorter.schedule();
                    return soloOrders;
                },
                updateDayCounter(day) {
                    const boatElemId = 'tioc-vesh-boat';
                    let boatElem = document.getElementById(boatElemId);
                    boatElem.classList.add('tioc-moving');
                    boatElem.classList.remove('small');
                    const destinationId = 'tioc-island-day-' + day;
                    this.game.slide(boatElem.id, destinationId).then(() => {
                        window.tiocWrap('updateDayCounter_onEnd', () => {
                            boatElem = document.getElementById(boatElemId);
                            boatElem.classList.add('small');
                            this.game.removeAbsolutePosition(boatElemId);
                        });
                    });
                },
                moveShapeToIsland(shapeId, price = null) {
                    let shapeElem = document.getElementById('tioc-shape-id-' + shapeId);
                    shapeElem.style.transform = '';
                    shapeElem.classList.add('tioc-moving');
                    // Remove cat color
                    shapeElem.innerHTML = '';
                    let destinationId = null;
                    switch (this.game.getShapeTypeIdFromShapeId(shapeId)) {
                        case this.game.SHAPE_TYPE_ID_CAT:
                            if (price == this.CAT_PRICE_LEFT_FIELD) {
                                destinationId = 'tioc-left-field';
                            } else {
                                destinationId = 'tioc-right-field';
                            }
                            break;
                        case this.game.SHAPE_TYPE_ID_OSHAX:
                            destinationId = 'tioc-oshax-container';
                            break;
                        case this.game.SHAPE_TYPE_ID_RARE_TREASURE:
                            destinationId = 'tioc-rare-treasure-container';
                            break;
                        case this.game.SHAPE_TYPE_ID_COMMON_TREASURE:
                            this.commonTreasureZone[this.game.getShapeDefIdFromShapeId(shapeId)].placeInZone(
                                'tioc-shape-id-' + shapeId,
                                shapeId // weigth
                            );
                            this.game.boatMgr.updatePlayerPanelShapeCount();
                            this.game.updateTooltips();
                            break;
                    }
                    if (destinationId !== null) {
                        this.game.slide(shapeElem.id, destinationId).then(() => {
                            window.tiocWrap('moveShapeToIsland_onEnd', () => {
                                this.game.removeAbsolutePosition(shapeElem.id);
                                this.game.boatMgr.updatePlayerPanelShapeCount();
                                this.game.updateTooltips();
                            });
                        });
                    }
                    this.shapeSorter.schedule();
                },
                moveShapeToToPlaceLocation(shapeId) {
                    const shapeElem = document.getElementById('tioc-shape-id-' + shapeId);
                    const destinationId = 'tioc-island-discard';
                    shapeElem.classList.add('tioc-moving');
                    this.game.slide(shapeElem.id, destinationId).then(() => {
                        window.tiocWrap('moveShapeToToPlaceLocation_onEnd', () => {
                            this.game.removeAbsolutePosition(shapeElem.id);
                            this.game.updateTooltips();
                        });
                    });
                    this.shapeSorter.schedule();
                },
                moveCatToOtherField(shapeId) {
                    if (shapeId === null) {
                        return;
                    }
                    const shapeElem = document.getElementById('tioc-shape-id-' + shapeId);
                    let destinationId = null;
                    if (shapeElem.closest('#tioc-left-field') !== null || shapeElem.closest('#tioc-left-field-bottom') !== null) {
                        destinationId = 'tioc-right-field';
                    } else {
                        destinationId = 'tioc-left-field';
                    }
                    shapeElem.classList.add('tioc-moving');
                    this.game.slide(shapeElem.id, destinationId).then(() => {
                        window.tiocWrap('moveCatToOtherField_onEnd', () => {
                            this.game.removeAbsolutePosition(shapeElem.id);
                            this.game.updateTooltips();
                        });
                    });
                    this.shapeSorter.schedule();
                },
                discardShapeId(shapeId) {
                    const shapeElem = document.getElementById('tioc-shape-id-' + shapeId);
                    shapeElem.style.transform = '';
                    shapeElem.classList.add('tioc-moving');
                    shapeElem.classList.add('tioc-animate-to-hidden-start');
                    // Remove cat color
                    shapeElem.innerHTML = '';
                    const destinationId = 'tioc-island-discard';
                    this.game.slide(shapeElem.id, destinationId).then(() => {
                        window.tiocWrap('discardShapeId_onEnd', () => {
                            this.game.tiocFadeOutAndDestroy(shapeElem.id, 1000);
                            this.updateTopShapes();
                        });
                    });
                    this.shapeSorter.schedule();
                },
                unlockShapeId(shapeId) {
                    if (this.game.getShapeTypeIdFromShapeId(shapeId) == this.game.SHAPE_TYPE_ID_COMMON_TREASURE) {
                        this.commonTreasureZone[this.game.getShapeDefIdFromShapeId(shapeId)].removeFromZone(
                            'tioc-shape-id-' + shapeId,
                            false /*destroy*/ ,
                            null /*destination*/
                        );
                    }
                },
                createAndPlaceShape(shape, animateFromIsland = true) {
                    this.game.addKnownShape(shape);
                    const islandCreateId = 'tioc-island-discard';
                    switch (shape.shapeLocationId) {
                        case this.game.SHAPE_LOCATION_ID_TABLE:
                            switch (shape.shapeTypeId) {
                                case this.game.SHAPE_TYPE_ID_COMMON_TREASURE:
                                    let shapeElem = this.game.createShapeElement('tioc-common-treasure-container', shape.shapeId, shape.shapeTypeId, shape.shapeDefId);
                                    this.commonTreasureZone[shape.shapeDefId].placeInZone(
                                        shapeElem.id,
                                        shape.shapeId // weigth
                                    );
                                    break;
                                case this.game.SHAPE_TYPE_ID_RARE_TREASURE:
                                    const destinationId = (animateFromIsland ? islandCreateId : 'tioc-rare-treasure-container');
                                    this.game.createShapeElement(destinationId, shape.shapeId, shape.shapeTypeId, shape.shapeDefId);
                                    if (animateFromIsland) {
                                        const shapeElem = document.getElementById('tioc-shape-id-' + shape.shapeId);
                                        shapeElem.classList.add('tioc-moving');
                                        this.moveShapeToIsland(shape.shapeId);
                                    }
                                    break;
                                case this.game.SHAPE_TYPE_ID_OSHAX:
                                    this.game.createShapeElement('tioc-oshax-container', shape.shapeId, shape.shapeTypeId, shape.shapeDefId);
                                    break;
                            }
                            break;
                        case this.game.SHAPE_LOCATION_ID_FIELD_LEFT:
                        case this.game.SHAPE_LOCATION_ID_FIELD_RIGHT:
                            let field = 'tioc-left-field';
                            let price = this.CAT_PRICE_LEFT_FIELD;
                            if (shape.shapeLocationId == this.game.SHAPE_LOCATION_ID_FIELD_RIGHT) {
                                field = 'tioc-right-field';
                                price = this.CAT_PRICE_RIGHT_FIELD;
                            }
                            const destinationId = (animateFromIsland ? islandCreateId : field);
                            this.game.createShapeElement(destinationId, shape.shapeId, shape.shapeTypeId, shape.shapeDefId, shape.colorId);
                            if (animateFromIsland) {
                                const shapeElem = document.getElementById('tioc-shape-id-' + shape.shapeId);
                                shapeElem.classList.add('tioc-moving');
                                this.moveShapeToIsland(shape.shapeId, price);
                            }
                            break;
                        case this.game.SHAPE_LOCATION_ID_DISCARD:
                        case this.game.SHAPE_LOCATION_ID_TO_PLACE:
                            this.game.createShapeElement('tioc-island-discard', shape.shapeId, shape.shapeTypeId, shape.shapeDefId, shape.colorId);
                            break;
                    }
                    this.shapeSorter.schedule();
                },
                adjustCatOrder(playerIdArray) {
                    for (let i = 0; i < playerIdArray.length; ++i) {
                        const playerId = playerIdArray[i];
                        if (playerId != this.game.SOLO_SISTER_PLAYER_ID) {
                            this.playerPanelOrder[playerId].toValue(i + 1);
                        }

                        const catElemId = 'tioc-meeple-cat-order-' + playerId;
                        const destinationElemId = 'tioc-island-player-order-' + (i + 1);
                        this.game.slide(catElemId, destinationElemId).then(() => {
                            window.tiocWrap('adjustCatOrder_onEnd', () => {
                                this.game.removeAbsolutePosition(catElemId);
                            });
                        });
                    }
                },
                allowRescueCat(rescueFunction) {
                    const cats = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-0');
                    for (const cat of cats) {
                        this.game.addOnClick(cat, () => {
                            let price = this.CAT_PRICE_RIGHT_FIELD;
                            if (cat.closest('#tioc-left-field') !== null || cat.closest('#tioc-left-field-bottom') !== null) {
                                price = this.CAT_PRICE_LEFT_FIELD;
                            }
                            if (price > this.game.fishMgr.currentPlayerFishCount()) {
                                this.game.showMessage(_('You do not have enough fish to rescue this cat.'), 'error');
                                return;
                            }
                            cat.classList.add('tioc-selected');
                            this.removeAllIslandClickableClickOnly();
                            rescueFunction(cat.dataset.shapeId, price);
                        });
                    }
                    this.updateTopShapes();
                },
                allowFamilyRescueCat() {
                    const cats = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-0');
                    for (const cat of cats) {
                        this.game.addOnClick(cat, () => {
                            let price = this.CAT_PRICE_RIGHT_FIELD;
                            if (cat.closest('#tioc-left-field') !== null || cat.closest('#tioc-left-field-bottom') !== null) {
                                price = this.CAT_PRICE_LEFT_FIELD;
                            }
                            cat.classList.add('tioc-selected');
                            this.removeAllIslandClickableClickOnly();
                            this.game.actionMgr.familyRescueCat(cat.dataset.shapeId, price);
                        });
                    }
                    this.updateTopShapes();
                },
                allowTakeToPlaceShape() {
                    const shapes = document.querySelectorAll('#tioc-island-and-field-container #tioc-island-discard .tioc-shape');
                    for (const shape of shapes) {
                        this.game.addOnClick(shape, () => {
                            shape.classList.add('tioc-selected');
                            this.removeAllIslandClickableClickOnly();
                            this.game.anytimeActionMgr.takeToPlaceShape(shape.dataset.shapeId);
                        });
                    }
                    this.updateTopShapes();
                },
                allowTakeCommonTreasure(doTakeFct = null, undoTakeFct = null) {
                    const shapes = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-2');
                    const shapeForShapeDefId = {};
                    for (const shape of shapes) {
                        const shapeId = shape.dataset.shapeId;
                        const shapeDefId = this.game.getShapeDefIdFromShapeId(shapeId);
                        shapeForShapeDefId[shapeDefId] = shape;
                    }
                    for (const shapeDefId in shapeForShapeDefId) {
                        const shape = shapeForShapeDefId[shapeDefId];
                        this.game.addOnClick(shape, () => {
                            shape.classList.add('tioc-selected');
                            this.removeAllIslandClickableClickOnly();
                            this.game.actionMgr.takeCommonTreasure(shape.dataset.shapeId, doTakeFct, undoTakeFct);
                        });
                    }
                    this.updateTopShapes();
                },
                allowTakeSmallTreasure() {
                    const shapes = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-2');
                    const shapeForShapeDefId = {};
                    for (const shape of shapes) {
                        const shapeId = shape.dataset.shapeId;
                        if (!this.game.getIsSmallTreasureFromShapeId(shapeId)) {
                            continue;
                        }
                        const shapeDefId = this.game.getShapeDefIdFromShapeId(shapeId);
                        shapeForShapeDefId[shapeDefId] = shape;
                    }
                    for (const shapeDefId in shapeForShapeDefId) {
                        const shape = shapeForShapeDefId[shapeDefId];
                        this.game.addOnClick(shape, () => {
                            shape.classList.add('tioc-selected');
                            this.removeAllIslandClickableClickOnly();
                            this.game.actionMgr.takeSmallTreasure(shape.dataset.shapeId);
                        });
                    }
                    this.updateTopShapes();
                },
                disallowTakeTreasure() {
                    let shapes = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-2');
                    for (const shape of shapes) {
                        if (shape.closest('#tioc-island-discard') !== null) {
                            continue;
                        }
                        this.game.removeClickableId(shape.id, false);
                    }
                    shapes = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-3');
                    for (const shape of shapes) {
                        if (shape.closest('#tioc-island-discard') !== null) {
                            continue;
                        }
                        this.game.removeClickableId(shape.id, false);
                    }
                    this.updateTopShapes();
                },
                allowRescueOshax(rescueFunction) {
                    const cats = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-1');
                    for (const cat of cats) {
                        this.game.addOnClick(cat, () => {
                            cat.classList.add('tioc-selected');
                            this.removeAllIslandClickableClickOnly();
                            rescueFunction(cat.dataset.shapeId);
                        });
                    }
                    this.updateTopShapes();
                },
                allowTakeRareTreasure() {
                    const shapes = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-3');
                    const shapeForShapeDefId = {};
                    for (const shape of shapes) {
                        this.game.addOnClick(shape, () => {
                            shape.classList.add('tioc-selected');
                            this.removeAllIslandClickableClickOnly();
                            this.game.actionMgr.takeRareTreasure(shape.dataset.shapeId);
                        });
                    }
                    this.updateTopShapes();
                },
                allowMoveCats(confirmFct) {
                    const cats = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-0');
                    for (const cat of cats) {
                        this.game.allowSelect(cat);
                    }
                    const buttonElemId = 'tioc-move-cat-button-confirm';
                    dojo.place(this.game.format_block('jstpl_button', { id: buttonElemId }), 'generalactions', 'first');
                    const buttonElem = document.getElementById(buttonElemId);
                    buttonElem.innerText = _('Move cats');
                    this.game.clickConnect(buttonElem, (event) => {
                        window.tiocWrap('allowMoveCats_onclick', () => {
                            dojo.stopEvent(event);
                            const selectedCats = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-0.tioc-selected');
                            if (selectedCats.length <= 0) {
                                this.game.showMessage(_('You must select at least 1 cat'), 'error');
                                return;
                            }
                            if (selectedCats.length > 3) {
                                this.game.showMessage(_('You can select at most 3 cats'), 'error');
                                return;
                            }
                            this.removeAllIslandClickable();
                            confirmFct(Array.from(selectedCats).map((cat) => cat.dataset.shapeId));
                        });
                    });
                },
                disallowTryShapes() {
                    this.inAllowTryShapes = false;
                },
                allowTryShapes() {
                    if (this.inAllowTryShapes) {
                        return;
                    }
                    const onClick = (shape) => {
                        this.inAllowTryShapes = true;
                        this.removeAllIslandClickable();
                        const shapeId = shape.dataset.shapeId + '-try-shapes';
                        const shapeClone = shape.cloneNode();
                        shapeClone.id += '-try-shapes';
                        shapeClone.classList.add('tioc-try-shapes');
                        shapeClone.classList.add('tioc-selected');
                        shape.parentElement.insertBefore(shapeClone, shape);
                        shape.classList.add('tioc-try-shapes-hidden');
                        this.game.boatMgr.allowPlaceShape((x, y) => {
                            this.game.boatMgr.moveShapeToBoat(this.game.player_id, shapeId, x, y);
                            this.game.shapeControl.attachToShapeId(
                                shapeId,
                                x,
                                y,
                                true /*canPutNextShapeAnywhere*/ ,
                                (shapeId, x, y, rotation, flipH, flipV, usedGrid) => {
                                    this.game.commandMgr.currentCommandStateValue().shapeList.push({
                                        shapeId: shape.dataset.shapeId,
                                        x: x,
                                        y: y,
                                        rotation: rotation,
                                        flipH: flipH,
                                        flipV: flipV,
                                        usedGrid: usedGrid
                                    });
                                    for (const grid of usedGrid) {
                                        this.game.boatMgr.markGridUsed(shape.dataset.shapeId, grid.x, grid.y, true);
                                    }
                                    this.game.boatMgr.updateGridOverlay();
                                    this.game.shapeControl.detach();
                                    this.disallowTryShapes();
                                    this.allowTryShapes();
                                    this.game.tryShapesMgr.updateButton();
                                }
                            );
                        });
                    };
                    const shapes = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape');
                    const shapeForShapeDefId = {};
                    for (const shape of shapes) {
                        if (shape.classList.contains('tioc-try-shapes-hidden')) {
                            continue;
                        }
                        const shapeId = shape.dataset.shapeId;
                        const shapeDefId = this.game.getShapeDefIdFromShapeId(shapeId);
                        if (this.game.getShapeTypeIdFromShapeId(shapeId) == this.game.SHAPE_TYPE_ID_COMMON_TREASURE) {
                            shapeForShapeDefId[shapeDefId] = shape;
                        } else {
                            this.game.addOnClick(shape, () => onClick(shape));
                        }
                    }
                    for (const shapeDefId in shapeForShapeDefId) {
                        const shape = shapeForShapeDefId[shapeDefId];
                        this.game.addOnClick(shape, () => onClick(shape));
                    }
                    this.updateTopShapes();
                },
                removeAllIslandClickable() {
                    const clickable = document.querySelectorAll('#tioc-island-and-field-container .tioc-clickable');
                    for (const c of clickable) {
                        this.game.removeClickableId(c.id);
                    }
                    const selected = document.querySelectorAll('#tioc-island-and-field-container .tioc-selected');
                    for (const c of selected) {
                        this.game.removeClickableId(c.id);
                    }
                    this.updateTopShapes();
                },
                removeAllIslandClickableClickOnly() {
                    const clickable = document.querySelectorAll('#tioc-island-and-field-container .tioc-clickable');
                    for (const c of clickable) {
                        this.game.removeClickableClickOnlyId(c.id);
                    }
                    this.updateTopShapes();
                },
                hasCommonTreasure() {
                    return (document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-2').length > 0);
                },
                hasRareTreasure() {
                    return (document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-3').length > 0);
                },
                hasOshax() {
                    return (document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-1').length > 0);
                },
                hasSmallTreasure() {
                    const shapes = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.shape-type-2');
                    for (const shape of shapes) {
                        if (this.game.getIsSmallTreasureFromShapeId(shape.dataset.shapeId)) {
                            return true;
                        }
                    }
                    return false;
                },
                updateTopShapes() {
                    this.topShapeScheduler.schedule();
                },
                updateTopShapesNow() {
                    this.clearTopShapes();
                    if (this.game.isSpectator) {
                        return;
                    }
                    const showPref = this.game.playerPreferenceMgr.getShowSmallShapesPref();
                    if (showPref == this.game.playerPreferenceMgr.USER_PREF_SHOW_SMALL_SHAPES_VALUE_ALWAYS_HIDE) {
                        return;
                    }
                    const commonTreasureShapeDefIdSet = new Set();
                    let shapes = null;
                    if (showPref == this.game.playerPreferenceMgr.USER_PREF_SHOW_SMALL_SHAPES_VALUE_ALWAYS_SHOW) {
                        shapes = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape');
                    } else {
                        shapes = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.tioc-clickable');
                    }
                    const clickableCommonTreasure = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.tioc-clickable.shape-type-2');
                    const selectedCommonTreasure = document.querySelectorAll('#tioc-island-and-field-container .tioc-shape.tioc-selected.shape-type-2');
                    for (const shape of shapes) {
                        if (shape.classList.contains('tioc-animate-to-hidden-start') ||
                            shape.classList.contains('tioc-try-shapes-hidden')) {
                            continue;
                        }
                        let topShapesPosition = 'middle';
                        if (shape.closest('#tioc-left-field') !== null || shape.closest('#tioc-left-field-bottom') !== null) {
                            topShapesPosition = 'left';
                        } else if (shape.closest('#tioc-right-field') !== null || shape.closest('#tioc-right-field-bottom') !== null) {
                            topShapesPosition = 'right';
                        }
                        const shapeId = shape.dataset.shapeId;
                        // Show only one common treasure per shape type
                        if (this.game.getShapeTypeIdFromShapeId(shapeId) == this.game.SHAPE_TYPE_ID_COMMON_TREASURE) {
                            const shapeDefId = this.game.getShapeDefIdFromShapeId(shapeId);
                            if (commonTreasureShapeDefIdSet.has(shapeDefId)) {
                                continue;
                            }
                            if (!shape.classList.contains('tioc-clickable') && !shape.classList.contains('tioc-selected')) {
                                let hasClickable = false;
                                for (const common of clickableCommonTreasure) {
                                    if (this.game.getShapeDefIdFromShapeId(common.dataset.shapeId) == shapeDefId) {
                                        hasClickable = true;
                                        break;
                                    }
                                }
                                for (const common of selectedCommonTreasure) {
                                    if (this.game.getShapeDefIdFromShapeId(common.dataset.shapeId) == shapeDefId) {
                                        hasClickable = true;
                                        break;
                                    }
                                }
                                if (hasClickable) {
                                    continue;
                                }
                            }
                            commonTreasureShapeDefIdSet.add(shapeDefId);
                        }
                        const topShape = this.addTopShapes(shapeId, topShapesPosition);
                        this.game.updateShapeElementTooltip(shape, topShape.id);
                        this.game.addOnClick(topShape, () => shape.click());
                        if (shape.classList.contains('tioc-clickable-no-border')) {
                            topShape.classList.add('tioc-clickable-no-border');
                        }
                        if (!shape.classList.contains('tioc-clickable')) {
                            topShape.classList.remove('tioc-clickable');
                        }
                        if (shape.classList.contains('tioc-selected')) {
                            topShape.classList.add('tioc-selected');
                        }
                    }
                },
                clearTopShapes() {
                    if (this.game.isSpectator) {
                        return;
                    }
                    const topShapesElem = document.getElementById('tioc-top-shapes-' + this.game.player_id);
                    const topShapes = topShapesElem.querySelectorAll('.tioc-top-shapes-parent');
                    for (const topShape of topShapes) {
                        this.game.removeClickable(topShape);
                    }
                    topShapesElem.classList.add('tioc-hidden');

                    const topShapesLeftElem = document.getElementById('tioc-top-shapes-left-' + this.game.player_id);
                    topShapesLeftElem.innerHTML = '';

                    const topShapesMiddleElem = document.getElementById('tioc-top-shapes-middle-' + this.game.player_id);
                    topShapesMiddleElem.innerHTML = '';

                    const topShapesRightElem = document.getElementById('tioc-top-shapes-right-' + this.game.player_id);
                    topShapesRightElem.innerHTML = '';
                },
                addTopShapes(shapeId, position) {
                    const topShapesElem = document.getElementById('tioc-top-shapes-' + this.game.player_id);
                    topShapesElem.classList.remove('tioc-hidden');

                    const shapeArray = this.game.getShapeArrayFromShapeId(shapeId);
                    let colorName = this.game.getShapeColorFromShapeId(shapeId);
                    const shapeTypeId = this.game.getShapeTypeIdFromShapeId(shapeId);
                    if (shapeTypeId == this.game.SHAPE_TYPE_ID_OSHAX) {
                        colorName = 'oshax';
                    } else if (shapeTypeId == this.game.SHAPE_TYPE_ID_RARE_TREASURE) {
                        colorName = 'rare';
                    }
                    const h = shapeArray.length;
                    const w = shapeArray[0].length;

                    let html = '';
                    for (let j = 0; j < h; ++j) {
                        for (let i = 0; i < w; ++i) {
                            if (shapeArray[j][i] != 0) {
                                html += this.game.format_block('jstpl_top_shapes_grid_filled', {
                                    color: colorName,
                                });
                            } else {
                                html += this.game.format_block('jstpl_top_shapes_grid_empty', {});
                            }
                        }
                    }
                    const parentElemId = 'tioc-top-shapes-' + position + '-' + this.game.player_id;
                    dojo.place(
                        this.game.format_block('jstpl_top_shapes_grid_parent', {
                            shape_id: shapeId,
                            nb_columns: w,
                            html: html,
                        }),
                        parentElemId
                    );
                    const insertElemId = 'tioc-top-shapes-shape-id-' + shapeId;
                    return document.getElementById(insertElemId);
                }
            }
        );
    }
);