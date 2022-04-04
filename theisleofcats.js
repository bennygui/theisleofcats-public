/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * theisleofcats implementation : © Guillaume Benny bennygui@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * theisleofcats.js
 *
 * theisleofcats user interface script
 *
 */

define([
        "dojo",
        "dojo/_base/declare",
        "ebg/core/gamegui",
        "ebg/counter",
        g_gamethemeurl + "modules/js/FishMgr.js",
        g_gamethemeurl + "modules/js/BoatMgr.js",
        g_gamethemeurl + "modules/js/IslandMgr.js",
        g_gamethemeurl + "modules/js/CardMgr.js",
        g_gamethemeurl + "modules/js/BasketMgr.js",
        g_gamethemeurl + "modules/js/ShapeControl.js",
        g_gamethemeurl + "modules/js/CommandMgr.js",
        g_gamethemeurl + "modules/js/TitleMgr.js",
        g_gamethemeurl + "modules/js/ActionMgr.js",
        g_gamethemeurl + "modules/js/CardTitleWrap.js",
        g_gamethemeurl + "modules/js/AnytimeActionMgr.js",
        g_gamethemeurl + "modules/js/Phase2Mgr.js",
        g_gamethemeurl + "modules/js/Phase45Mgr.js",
        g_gamethemeurl + "modules/js/PlayerPreferenceMgr.js",
        g_gamethemeurl + "modules/js/TryShapesMgr.js",
        g_gamethemeurl + "modules/js/Scheduler.js",
    ],
    function(dojo, declare) {
        return declare("bgagame.theisleofcats", ebg.core.gamegui, {

            TILE_SIZE: 40,
            SMALL_TILE_SIZE: 7,
            CAT_COLOR_NAMES: ['blue', 'green', 'red', 'purple', 'orange'],
            CAT_COLOR_ID_BLUE: 0,
            CAT_COLOR_ID_GREEN: 1,
            CAT_COLOR_ID_RED: 2,
            CAT_COLOR_ID_PURPLE: 3,
            CAT_COLOR_ID_ORANGE: 4,

            FIELD_LEFT: 'FIELD_LEFT',
            FIELD_RIGHT: 'FIELD_RIGHT',

            SHAPE_LOCATION_ID_BAG: 0,
            SHAPE_LOCATION_ID_TABLE: 1,
            SHAPE_LOCATION_ID_FIELD_LEFT: 2,
            SHAPE_LOCATION_ID_FIELD_RIGHT: 3,
            SHAPE_LOCATION_ID_BOAT: 4,
            SHAPE_LOCATION_ID_DISCARD: 5,
            SHAPE_LOCATION_ID_TO_PLACE: 6,

            SHAPE_TYPE_ID_CAT: 0,
            SHAPE_TYPE_ID_OSHAX: 1,
            SHAPE_TYPE_ID_COMMON_TREASURE: 2,
            SHAPE_TYPE_ID_RARE_TREASURE: 3,

            STATE_PHASE_0_FILL_THE_FIELDS_ID: 100,
            STATE_PHASE_2_BUY_CARDS_ID: 104,
            STATE_PHASE_2_EXPLORE_DEAL_CARDS_ID: 102,
            STATE_PHASE_3_READ_LESSONS_ID: 106,
            STATE_PHASE_4_RESCUE_CAT_ID: 109,
            STATE_PHASE_4_BEFORE_RESCUE_CAT_ID: 121,
            STATE_PHASE_4_CHOOSE_RESCUE_CARDS_ID: 107,
            STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID: 131,
            STATE_PHASE_5_RARE_FINDS_ID: 111,

            SOLO_SISTER_PLAYER_ID: 1,

            shapesCreationInfo: {},
            playerScoreCounter: {},
            playerColor: {},
            playerName: {},
            tooltipScheduler: null,

            constructor() {
                document.getElementById('tioc-onerror-text').innerText = ''
                window.tiocAddActionLog = (type, action) => {
                    //if (this.isSpectator || !this.isCurrentPlayerActive()) {
                    //    return;
                    //}
                    //try {
                    //    this.ajaxAction('addActionLog', {
                    //        type: type,
                    //        action_log: JSON.stringify(action),
                    //        lock: false,
                    //    });
                    //} catch (e) {
                    //    console.error('Exception thrown by tiocAddActionLog: ' + e.stack);
                    //}
                };
                window.tiocLogError = (error) => {
                    //if (!error) {
                    //    return;
                    //}
                    //const pre = document.getElementById('tioc-onerror-text');
                    //if (!pre) {
                    //    return;
                    //}
                    //pre.classList.remove('tioc-hidden');
                    //if (pre.innerText.length == 0) {
                    //    pre.innerText += 'Hello there Alpha Testers!\n';
                    //    pre.innerText += 'There might be a bug!\n';
                    //    pre.innerText += 'If you have problems with the game (not related to your internet connection), please include the following text in your bug report:\n\n\n';
                    //    if (navigator && navigator.userAgent) {
                    //        pre.innerText += navigator.userAgent + '\n\n';
                    //    }
                    //}
                    //pre.innerText += '===============================\n'
                    //pre.innerText += error + '\n';
                    //if (error.stack) {
                    //    pre.innerText += error.stack + '\n';
                    //}
                    //pre.innerText += '===============================\n'
                    //if (navigator && navigator.userAgent && error.stack && window.tiocAddActionLog) {
                    //    window.tiocAddActionLog('js', {
                    //        userAgent: navigator.userAgent,
                    //        stack: error.stack.replace(/http[^\s]*\//g, '/'),
                    //    });
                    //}
                };
                window.tiocWrap = (name, wrapFct) => {
                    try {
                        const wrapName = 'tiocWrap___' + name;
                        const o = {};
                        o[wrapName] = wrapFct;
                        return o[wrapName]();
                    } catch (error) {
                        if (error && window.tiocLogError) {
                            window.tiocLogError(error);
                            throw error;
                        }
                    }
                };

                window.tiocWrap('constructor', () => {
                    this.tooltipScheduler = new tioc.Scheduler(() => this.updateTooltipsNow());
                    this.cardTitleWrap = new tioc.CardTitleWrap(this);
                    this.fishMgr = new tioc.FishMgr(this);
                    this.boatMgr = new tioc.BoatMgr(this);
                    this.islandMgr = new tioc.IslandMgr(this);
                    this.cardMgr = new tioc.CardMgr(this);
                    this.basketMgr = new tioc.BasketMgr(this);
                    this.shapeControl = new tioc.ShapeControl(this);
                    this.commandMgr = new tioc.CommandMgr(this);
                    this.titleMgr = new tioc.TitleMgr(this);
                    this.actionMgr = new tioc.ActionMgr(this);
                    this.anytimeActionMgr = new tioc.AnytimeActionMgr(this);
                    this.phase2Mgr = new tioc.Phase2Mgr(this);
                    this.phase45Mgr = new tioc.Phase45Mgr(this);
                    this.playerPreferenceMgr = new tioc.PlayerPreferenceMgr(this);
                    this.tryShapesMgr = new tioc.TryShapesMgr(this);
                    dojo.connect(window, "onresize", this, dojo.hitch(this, "resizeAll"));
                });
            },

            setup(gamedatas) {
                window.tiocWrap('setup', () => {
                    this.gamedatas = gamedatas;
                    if (this.isFamilyMode()) {
                        document.body.classList.add('tioc-family');
                    }
                    // Add know shapes now in case updateTooltips is called early
                    for (const shape of gamedatas.shapes) {
                        this.addKnownShape(shape);
                    }

                    // Setting up player boards
                    for (const playerId in gamedatas.players) {
                        const player = gamedatas.players[playerId];

                        dojo.place(
                            this.format_block('jstpl_player_panel', {
                                player_id: playerId,
                                color_name: player.player_color_name,
                                next_player_color_name: gamedatas.players[player.next_draft_player_id].player_color_name,
                            }),
                            'player_board_' + playerId
                        );

                        this.playerColor[playerId] = player.player_color;
                        this.playerName[playerId] = player.player_name;

                        this.playerScoreCounter[playerId] = new ebg.counter();
                        this.playerScoreCounter[playerId].create('player_score_' + playerId);
                        this.playerScoreCounter[playerId].setValue(player.score);

                        this.addTooltip(
                            'tioc-player-panel-order-' + playerId,
                            _('Player order, random at start and later based on the speed played with Rescue Cards.'),
                            ''
                        );
                        this.addTooltip(
                            'tioc-player-panel-cat-' + playerId,
                            _('Player color.'),
                            ''
                        );
                        this.addTooltip(
                            'tioc-player-panel-next-player-cat-' + playerId,
                            _('Color of the player you will pass cards in the Explore Phase for this day.'),
                            ''
                        );
                    }
                    this.addTooltipToClass(
                        'tioc-player-panel-draft',
                        _('On the left is your player color and on the right is the color of the player you will pass cards in the Explore Phase for this day.'),
                        ''
                    );
                    this.addTooltipToClass(
                        'tioc-player-panel-fish',
                        _('Number of fish for this player.'),
                        ''
                    );
                    this.addTooltipToClass(
                        'tioc-player-panel-card',
                        _('Number of cards in the hand of this player'),
                        ''
                    );
                    this.addTooltipToClass(
                        'tioc-player-panel-card-table',
                        _('Number of rescue cards on the table for this player'),
                        ''
                    );
                    this.addTooltipToClass(
                        'tioc-player-panel-basket-remain',
                        _('Number usable baskets for this player, counting permanent baskets and full and half baskets on Rescue Cards.'),
                        ''
                    );
                    this.addTooltipToClass(
                        'tioc-player-panel-basket-permanent',
                        _('Number permanent baskets for this player.'),
                        ''
                    );
                    this.addTooltipToClass(
                        'tioc-player-panel-private-lesson',
                        _('Number Private Lesson Cards on the table for this player.'),
                        ''
                    );
                    this.addTooltipToClass(
                        'tioc-player-panel-boat-container',
                        _("Overview of this player's boat, with cats represented with colored squares and treasures with gray squares."),
                        ''
                    );
                    this.addTooltip(
                        'tioc-color-ref-cat',
                        _('If you find it difficult to tell the colour of a cat, you can use their unique body shapes, especially their tail, to help identify the family.'),
                        ''
                    );
                    this.addTooltip(
                        'tioc-color-ref-map',
                        _('If you find it difficult to tell the colour of a map, you can use the unique icon on each map to help identify the family.'),
                        ''
                    );
                    this.addTooltipToClass('tioc-player-panel-shape-face-blue', _("Number of cats with the Blue color on this player's boat"), '');
                    this.addTooltipToClass('tioc-player-panel-shape-face-green', _("Number of cats with the Green color on this player's boat"), '');
                    this.addTooltipToClass('tioc-player-panel-shape-face-orange', _("Number of cats with the Orange color on this player's boat"), '');
                    this.addTooltipToClass('tioc-player-panel-shape-face-purple', _("Number of cats with the Purple color on this player's boat"), '');
                    this.addTooltipToClass('tioc-player-panel-shape-face-red', _("Number of cats with the Red color on this player's boat"), '');
                    this.addTooltipToClass('tioc-player-panel-shape-face-common', _("Number of Common Treasure on this player's boat"), '');
                    this.addTooltipToClass('tioc-player-panel-shape-face-rare', _("Number of Rare Treasure on this player's boat"), '');
                    this.addTooltipToClass('tioc-player-panel-shape-face-oshax', _("Number of Oshax on this player's boat"), '');

                    this.fishMgr.setup(gamedatas);
                    this.boatMgr.setup(gamedatas);
                    this.islandMgr.setup(gamedatas);
                    this.cardMgr.setup(gamedatas);
                    this.basketMgr.setup(gamedatas);
                    this.commandMgr.setup(gamedatas);
                    this.titleMgr.setup(gamedatas);
                    this.phase2Mgr.setup(gamedatas);
                    this.phase45Mgr.setup(gamedatas);
                    this.playerPreferenceMgr.setup(gamedatas);
                    this.tryShapesMgr.setup(gamedatas);
                    this.updatePassPerPlayerId(gamedatas.passPerPlayerId);
                    if ('scoreTable' in gamedatas) {
                        this.buildScoreTable();
                        for (const playerId in gamedatas.scoreTable) {
                            for (const scoreColumn in gamedatas.scoreTable[playerId]) {
                                let neg = 1;
                                if (scoreColumn == 'score_rats' || scoreColumn == 'score_unfilled_rooms') {
                                    neg = -1;
                                }
                                this.scoreTable[scoreColumn][playerId].setValue(neg * gamedatas.scoreTable[playerId][scoreColumn]);
                            }
                        }
                    }
                    if ('cardEndScore' in gamedatas) {
                        for (const score of gamedatas.cardEndScore) {
                            this.cardMgr.addScoreToCardId(score.cardId, score.playerId, score.score);
                        }
                    }

                    // Setup game notifications to handle (see "setupNotifications" method below)
                    this.setupNotifications();
                });
            },

            // [Undocumented] Override BGA framework functions to call onLoadingComplete when loading is done
            setLoader(value, max) {
                this.inherited(arguments);
                if (!this.isLoadingComplete && value >= 100) {
                    this.isLoadingComplete = true;
                    this.onLoadingComplete();
                }
            },
            onLoadingComplete() {
                window.tiocWrap('onLoadingComplete', () => {
                    this.playerPreferenceMgr.checkPreferencesConsistency();
                    this.cardMgr.updateCurrentPlayerCard();
                    this.showWelcomeMessage();
                    this.showLastDayMessage(this.gamedatas.dayCounter, false);
                });
            },

            // @Override: This is a built-in BGA method. Override this function to inject html into log items.
            format_string_recursive(log, args) {
                try {
                    if (log && args && !args.processed) {
                        args.processed = true;

                        const keys = ['shape_img', 'shapes_img', 'fish_img'];
                        for (const i in keys) {
                            const key = keys[i];
                            args[key] = this.getHtmlForLogArgs(key, args);
                        }
                    }
                } catch (e) {
                    console.error(log, args, "Exception thrown", e.stack);
                }
                return this.inherited(arguments);
            },

            getHtmlForLogArgs(key, args) {
                if (!(key in args)) {
                    return '';
                }
                switch (key) {
                    case 'shape_img':
                        const shape = args[key];
                        return this.formatShapeElementForLog(shape.shapeId, shape.shapeTypeId, shape.shapeDefId, shape.colorId);
                    case 'shapes_img':
                        const shapes = args[key];
                        let html = '';
                        for (const shape of shapes) {
                            html += this.formatShapeElementForLog(shape.shapeId, shape.shapeTypeId, shape.shapeDefId, shape.colorId);
                        }
                        return html;
                    case 'fish_img':
                        return '<div class="tioc-log-fish"></div>';
                }
                return '';
            },

            onEnteringState(stateName, args) {
                window.tiocWrap('onEnteringState', () => {
                    if (!this.tryShapesMgr.isTryingShapes()) {
                        this.removeAllClickable();
                    }
                    this.removeAllCardBuy();

                    this.commandMgr.onEnteringState(stateName, args);
                    this.titleMgr.onEnteringState(stateName, args);
                    this.phase2Mgr.onEnteringState(stateName, args);
                    this.phase45Mgr.onEnteringState(stateName, args);
                    this.tryShapesMgr.onEnteringState(stateName, args);
                    switch (stateName) {
                        case 'dummmy':
                            break;
                    }
                });
            },

            onLeavingState(stateName) {
                window.tiocWrap('onLeavingState', () => {
                    if (!this.tryShapesMgr.isTryingShapes()) {
                        this.removeAllClickable();
                    }
                    this.removeAllCardBuy();

                    this.commandMgr.onLeavingState(stateName);
                    this.titleMgr.onLeavingState(stateName);
                    this.phase2Mgr.onLeavingState(stateName);
                    this.phase45Mgr.onLeavingState(stateName);
                    this.tryShapesMgr.onLeavingState(stateName);
                });
            },

            onUpdateActionButtons(stateName, args) {
                window.tiocWrap('onUpdateActionButtons', () => {
                    if (this.isCurrentPlayerActive()) {
                        this.phase2Mgr.onUpdateActionButtons(stateName, args);
                        this.phase45Mgr.onUpdateActionButtons(stateName, args);
                        this.commandMgr.onUpdateActionButtons(stateName, args);
                    } else {
                        if (!this.tryShapesMgr.isTryingShapes()) {
                            this.removeAllClickable();
                        }
                    }
                    this.tryShapesMgr.onUpdateActionButtons(stateName, args);
                });
            },

            // Utility methods
            isReadOnly() {
                return this.isSpectator || typeof g_replayFrom != 'undefined' || g_archive_mode;
            },
            isFamilyMode() {
                return this.gamedatas.isFamilyMode;
            },
            isSoloMode() {
                return this.gamedatas.isSoloMode;
            },
            clickConnect(element, fct) {
                if (!this.clickConnectNbToElemMap) {
                    this.clickConnectNb = 0;
                    this.clickConnectNbToElemMap = {};
                    this.clickConnectIdToNbMap = {};
                }
                this.clickDisconnect(element);
                if (element.id && element.id.length > 0 && element.id in this.clickConnectIdToNbMap) {
                    const nb = this.clickConnectIdToNbMap[element.id];
                    if (nb in this.clickConnectNbToElemMap && this.clickConnectNbToElemMap[nb].element == element) {
                        if (this.clickConnectNbToElemMap[nb].link !== null) {
                            dojo.disconnect(this.clickConnectNbToElemMap[nb].link);
                        }
                        this.clickConnectNbToElemMap[nb].link = dojo.connect(element, 'onclick', fct);
                        return;
                    }
                }
                const newNb = this.clickConnectNb++;
                this.clickConnectNbToElemMap[newNb] = {
                    element: element,
                    link: dojo.connect(element, 'onclick', fct),
                };
                if (element.id && element.id.length > 0) {
                    this.clickConnectIdToNbMap[element.id] = newNb;
                }
            },
            clickDisconnect(element) {
                if (!this.clickConnectNbToElemMap) {
                    this.clickConnectNb = 0;
                    this.clickConnectNbToElemMap = {};
                    this.clickConnectIdToNbMap = {};
                }
                if (element.id && element.id.length > 0 && element.id in this.clickConnectIdToNbMap) {
                    const nb = this.clickConnectIdToNbMap[element.id];
                    if (nb in this.clickConnectNbToElemMap && this.clickConnectNbToElemMap[nb].element == element) {
                        if (this.clickConnectNbToElemMap[nb].link !== null) {
                            dojo.disconnect(this.clickConnectNbToElemMap[nb].link);
                            this.clickConnectNbToElemMap[nb].link = null;
                        }
                        return;
                    }
                }
                for (const nb in this.clickConnectNbToElemMap) {
                    if (this.clickConnectNbToElemMap[nb].element == element) {
                        dojo.disconnect(this.clickConnectNbToElemMap[nb].link);
                        delete this.clickConnectNbToElemMap[nb];
                        return;
                    }
                }
            },
            tiocClickCleanup() {
                if (!this.clickConnectNbToElemMap) {
                    this.clickConnectNb = 0;
                    this.clickConnectNbToElemMap = {};
                    this.clickConnectIdToNbMap = {};
                }
                for (const nb in this.clickConnectNbToElemMap) {
                    if (!document.body.contains(this.clickConnectNbToElemMap[nb].element)) {
                        dojo.disconnect(this.clickConnectNbToElemMap[nb].link);
                        delete this.clickConnectNbToElemMap[nb];
                        break;
                    }
                }
                for (const id in this.clickConnectIdToNbMap) {
                    const nb = this.clickConnectIdToNbMap[id];
                    if (!(nb in this.clickConnectNbToElemMap)) {
                        delete this.clickConnectIdToNbMap[id];
                    }
                }
            },
            removeAllClickable() {
                const elements = document.querySelectorAll('.tioc-clickable');
                for (const e of elements) {
                    this.clickDisconnect(e);
                    e.classList.remove('tioc-clickable');
                    e.classList.remove('tioc-clickable-no-border');
                }
                dojo.query('.tioc-selected').removeClass('tioc-selected');
                this.tiocClickCleanup();
            },
            removeClickableId(id, removeSelected = true) {
                this.removeClickable(document.getElementById(id), removeSelected);
            },
            removeClickable(element, removeSelected = true) {
                if (element === null) {
                    return;
                }
                this.clickDisconnect(element);
                element.classList.remove('tioc-clickable');
                element.classList.remove('tioc-clickable-no-border');
                if (removeSelected) {
                    element.classList.remove('tioc-selected');
                }
            },
            removeClickableClickOnlyId(id) {
                const element = document.getElementById(id);
                if (element === null) {
                    return;
                }
                this.clickDisconnect(element);
                element.classList.add('tioc-clickable-no-border');
            },
            removeAllCardBuy() {
                dojo.query('.tioc-card-buy').removeClass('tioc-card-buy');
            },
            allowSelect(element) {
                element.classList.add('tioc-clickable')
                this.clickConnect(element, (event) => {
                    window.tiocWrap('allowSelect', () => {
                        element.classList.toggle('tioc-selected');
                    });
                });
            },
            addOnClick(element, onClick) {
                element.classList.add('tioc-clickable')
                this.clickConnect(element, (event) => {
                    window.tiocWrap('addOnClick', () => {
                        onClick(event);
                    });
                });
            },
            removeAbsolutePosition(elementId) {
                const elem = document.getElementById(elementId);
                if (elem !== null) {
                    dojo.style(elem, {
                        left: null,
                        right: null,
                        top: null,
                        bottom: null,
                        position: null,
                    });
                    elem.classList.remove('tioc-moving');
                    // Try to force reflow...
                    if (elem.offsetHeight !== undefined) {
                        void(elem.offsetHeight);
                    }
                    const parentElem = elem.parentElement;
                    if (parentElem !== null) {
                        if (parentElem.offsetHeight !== undefined) {
                            void(parentElem.offsetHeight);
                        }
                    }
                }
            },
            addClass(elementId, className) {
                const elem = document.getElementById(elementId);
                if (elem != null) {
                    elem.classList.add(className);
                }
            },
            removeClass(elementId, className) {
                const elem = document.getElementById(elementId);
                if (elem != null) {
                    elem.classList.remove(className);
                }
            },
            tiocFadeOutAndDestroy(element, duration = 500, onEnd = null) {
                if (duration === undefined || duration === null) {
                    duration = 500;
                }
                if (this.instantaneousMode) {
                    duration = 1;
                }
                const anim = dojo.fadeOut({
                    node: element,
                    duration: duration,
                    delay: 0,
                });
                dojo.connect(anim, "onEnd", ((e) => {
                    window.tiocWrap('tiocFadeOutAndDestroy_onEnd', () => {
                        dojo.destroy(e);
                        if (onEnd !== null) {
                            onEnd(e);
                        }
                    });
                }));
                anim.play();
            },
            normalizeRotation(rotation) {
                while (rotation >= 360) {
                    rotation -= 360;
                }
                while (rotation < 0) {
                    rotation += 360;
                }
                return rotation;
            },
            applyTransformToElement(element, rotation, flipH, flipV) {
                const transform = [];
                const normalizedRot = this.normalizeRotation(rotation);
                if (normalizedRot == 90) {
                    transform.push('translate(-50%, -50%) rotate(' + rotation + 'deg) translate(50%, -50%)');
                } else if (normalizedRot == 180 || normalizedRot == 0) {
                    transform.push('rotate(' + rotation + 'deg)');
                } else if (normalizedRot == 270) {
                    transform.push('translate(-50%, -50%) rotate(' + rotation + 'deg) translate(-50%, 50%)');
                }
                if (flipH) {
                    transform.push('scaleX(-1)');
                }
                if (flipV) {
                    transform.push('scaleY(-1)');
                }

                element.style.transform = transform.join(' ');
            },
            updatePassPerPlayerId(passPerPlayerId) {
                for (const playerId in passPerPlayerId) {
                    const boardElem = document.getElementById('overall_player_board_' + playerId);
                    if (passPerPlayerId[playerId]) {
                        boardElem.classList.add('tioc-player-panel-pass');
                    } else {
                        boardElem.classList.remove('tioc-player-panel-pass');
                    }
                }
            },
            addKnownShape(shape) {
                this.shapesCreationInfo[shape.shapeId] = shape;
            },
            updateKnownShapeSoloOrder(shapeId, order) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                if (shapeId in this.shapesCreationInfo) {
                    this.shapesCreationInfo[shapeId].soloOrder = order;
                }
            },
            shapeIdNoTryShapes(shapeId) {
                if (('' + shapeId).endsWith('-try-shapes')) {
                    return shapeId.substring(0, shapeId.indexOf('-try-shapes'));
                }
                return shapeId;
            },
            getShapeSizeFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                if (!(shapeId in this.shapesCreationInfo)) {
                    return {
                        width: 0,
                        height: 0,
                    };
                }
                return {
                    width: this.shapesCreationInfo[shapeId].width,
                    height: this.shapesCreationInfo[shapeId].height,
                };
            },
            getShapeTypeIdFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                if (!(shapeId in this.shapesCreationInfo)) {
                    return this.SHAPE_TYPE_ID_CAT;
                }
                return this.shapesCreationInfo[shapeId].shapeTypeId;
            },
            getShapeTypeNameFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                switch (this.getShapeTypeIdFromShapeId(shapeId)) {
                    case this.SHAPE_TYPE_ID_CAT:
                        return _('Cat');
                    case this.SHAPE_TYPE_ID_OSHAX:
                        return _('Oshax');
                    case this.SHAPE_TYPE_ID_COMMON_TREASURE:
                        return _('Common Treasure');
                    case this.SHAPE_TYPE_ID_RARE_TREASURE:
                        return _('Rare Treasure');
                }
                return '';
            },
            getShapeArrayFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                if (!(shapeId in this.shapesCreationInfo)) {
                    return [
                        [1]
                    ];
                }
                return JSON.parse(JSON.stringify(this.shapesCreationInfo[shapeId].shapeArray));
            },
            getRareTreasureTypeFromShapeId(shapeId) {
                const size = this.getShapeSizeFromShapeId(shapeId);
                if (size.width == 4) {
                    return 5;
                }
                if (size.width == 2 && size.height == 2) {
                    return 4;
                }
                if (size.width == 3 && size.height == 2) {
                    return 1;
                }
                const array = this.getShapeArrayFromShapeId(shapeId);
                if (array[1][0]) {
                    return 3;
                }
                return 2;
            },
            getShapeColorIdFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                if (!(shapeId in this.shapesCreationInfo)) {
                    return '';
                }
                return this.shapesCreationInfo[shapeId].colorId;
            },
            getShapeColorFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                if (!(shapeId in this.shapesCreationInfo)) {
                    return '';
                }
                const colorId = this.shapesCreationInfo[shapeId].colorId;
                if (colorId === null) {
                    return '';
                }
                return this.CAT_COLOR_NAMES[colorId];
            },
            getCurrentColorFromShapeId(shapeId) {
                const shapeElemId = 'tioc-shape-id-' + shapeId;
                const meepleElem = document.querySelector('#' + shapeElemId + ' .tioc-meeple');
                if (meepleElem === null) {
                    return this.getShapeColorFromShapeId(shapeId);
                }
                for (let colorId = 0; colorId < this.CAT_COLOR_NAMES.length; ++colorId) {
                    if (meepleElem.classList.contains(this.CAT_COLOR_NAMES[colorId])) {
                        return this.CAT_COLOR_NAMES[colorId];
                    }
                }
                return this.getShapeColorFromShapeId(shapeId);
            },
            getShapeDefIdFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                if (!(shapeId in this.shapesCreationInfo)) {
                    return 100;
                }
                return this.shapesCreationInfo[shapeId].shapeDefId;
            },
            getIsSmallTreasureFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                if (!(shapeId in this.shapesCreationInfo)) {
                    return false;
                }
                return this.shapesCreationInfo[shapeId].isSmallTreasure;
            },
            getPlayedMoveNumberFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                if (!(shapeId in this.shapesCreationInfo)) {
                    return 0;
                }
                return this.shapesCreationInfo[shapeId].playedMoveNumber;
            },
            getShapeWidthFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                if (!(shapeId in this.shapesCreationInfo)) {
                    return 0;
                }
                return this.shapesCreationInfo[shapeId].width;
            },
            getShapeHeightFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                if (!(shapeId in this.shapesCreationInfo)) {
                    return 0;
                }
                return this.shapesCreationInfo[shapeId].height;
            },
            getShapeCoverageFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                const shapeArray = this.getShapeArrayFromShapeId(shapeId);
                const h = shapeArray.length;
                const w = shapeArray[0].length;
                let nb = 0;
                for (let i = 0; i < w; ++i) {
                    for (let j = 0; j < h; ++j) {
                        if (shapeArray[j][i] != 0) {
                            ++nb;
                        }
                    }
                }
                return nb;
            },
            getShapeSoloOrderFromShapeId(shapeId) {
                shapeId = this.shapeIdNoTryShapes(shapeId);
                if (!(shapeId in this.shapesCreationInfo)) {
                    return null;
                }
                return this.shapesCreationInfo[shapeId].soloOrder;
            },
            formatShapeElementForLog(shapeId, shapeTypeId, shapeDefId, colorId = null) {
                return this.format_block('jstpl_shape_for_log', {
                    shape_id: shapeId,
                    shape_type_id: shapeTypeId,
                    color_name: colorId === null ? '' : this.CAT_COLOR_NAMES[colorId],
                    shape_def_id: shapeDefId,
                });
            },
            formatShapeElement(shapeId, shapeTypeId, shapeDefId, colorId = null) {
                return this.format_block('jstpl_shape', {
                    shape_id: shapeId,
                    shape_type_id: shapeTypeId,
                    color_name: colorId === null ? '' : this.CAT_COLOR_NAMES[colorId],
                    shape_def_id: shapeDefId,
                });
            },
            createShapeElement(location, shapeId, shapeTypeId, shapeDefId, colorId = null) {
                const shape = dojo.place(
                    this.formatShapeElement(shapeId, shapeTypeId, shapeDefId, colorId),
                    location
                );
                this.updateTooltips();
                return shape;
            },
            forEachShapeGrid(shapeId, x, y, rotation, paramFlipH, paramFlipV, gridFunction) {
                let shapeArray = this.getShapeArrayFromShapeId(shapeId);
                const normalizedRot = this.normalizeRotation(rotation);
                for (let r = 0; r < normalizedRot; r += 90) {
                    shapeArray = this._rotateArray90(shapeArray);
                }
                const invertFlip = (normalizedRot == 90 || normalizedRot == 270);
                const flipH = (invertFlip ? paramFlipV : paramFlipH);
                const flipV = (invertFlip ? paramFlipH : paramFlipV);
                if (flipH) {
                    shapeArray = this._flipArrayH(shapeArray);
                }
                if (flipV) {
                    shapeArray = this._flipArrayV(shapeArray);
                }
                const h = shapeArray.length;
                const w = shapeArray[0].length;
                for (let i = 0; i < w; ++i) {
                    for (let j = 0; j < h; ++j) {
                        if (shapeArray[j][i] != 0) {
                            if (gridFunction(x + i, y + j) === false) {
                                return;
                            }
                        }
                    }
                }
            },
            _flipArrayH(shapeArray) {
                return shapeArray.map((a) => a.reverse());
            },
            _flipArrayV(shapeArray) {
                const newArray = JSON.parse(JSON.stringify(shapeArray));
                return newArray.reverse();
            },
            _rotateArray90(shapeArray) {
                return shapeArray[0].map((val, index) => shapeArray.map(row => row[index]).reverse())
            },
            updatePlayerScore(playerId, newScore, scoreColumn, scoreColumnScore) {
                if (playerId != this.SOLO_SISTER_PLAYER_ID) {
                    this.playerScoreCounter[playerId].toValue(newScore);
                }
                this.buildScoreTable();
                let neg = 1;
                if (scoreColumn == 'score_rats' || scoreColumn == 'score_unfilled_rooms') {
                    neg = -1;
                }
                this.scoreTable[scoreColumn][playerId].toValue(neg * scoreColumnScore);
                this.scoreTable['score_total'][playerId].toValue(newScore);
            },
            buildScoreTable() {
                const tableElem = document.getElementById('tioc-score-table');
                if (!tableElem.classList.contains('tioc-hidden')) {
                    return;
                }
                tableElem.classList.remove('tioc-hidden');

                // Header
                const headElem = tableElem.querySelector('thead');
                const firstRowElem = dojo.place("<tr><th></th></tr>", headElem);
                let nbPlayers = 0;
                for (const playerId in this.gamedatas.players) {
                    ++nbPlayers;
                    const player = this.gamedatas.players[playerId];
                    dojo.place('<td style="color: #' + player['player_color'] + ';">' + player['player_name'] + '</td>', firstRowElem);
                }

                const bodyElem = tableElem.querySelector('tbody');

                const dataArray = [
                    { title: _("Rats"), col: 'score_rats', cssClass: '' },
                    { title: _("Rooms") + '<sup>&dagger;</sup>', col: 'score_unfilled_rooms', cssClass: '' },
                    { title: _("Cat Families"), col: 'score_cat_familly', cssClass: '' },
                    { title: _("Rare Treasure"), col: 'score_rare_treasure', cssClass: 'tioc-family-hidden' },
                    { title: _("Private Lessons"), col: 'score_private_lessons', cssClass: '' },
                    { title: _("Public Lessons") + (this.isSoloMode() ? '<sup>&Dagger;</sup>' : ''), col: 'score_public_lessons', cssClass: 'tioc-family-hidden' },
                    { title: _("Total"), col: 'score_total' },
                ];
                this.scoreTable = {};
                for (const data of dataArray) {
                    const elem = dojo.place("<tr class='" + data.cssClass + "'><th>" + data.title + "</th></tr>", bodyElem);
                    if (!(data.col in this.scoreTable)) {
                        this.scoreTable[data.col] = {};
                    }
                    for (const playerId in this.gamedatas.players) {
                        dojo.place('<td id="tioc-' + data.col + '-' + playerId + '">0</td>', elem);
                        this.scoreTable[data.col][playerId] = new ebg.counter();
                        this.scoreTable[data.col][playerId].create('tioc-' + data.col + '-' + playerId);
                        this.scoreTable[data.col][playerId].setValue(0);
                    }
                }
                dojo.place("<tr><th colspan='" + (1 + nbPlayers) + "'>" + '<small>&dagger; <i>' + _('There are 7 rooms: the room with no icons still counts as a room') + "</i></small></th></tr>", bodyElem);

                if (this.isSoloMode()) {
                    dojo.place("<tr><th colspan='" + (1 + nbPlayers) + "'>" + '<small>&Dagger; <i>' + _('In solo, public lessons scores half the points (rounded up)') + "</i></small></th></tr>", bodyElem);
                    const soloTableElem = document.getElementById('tioc-score-table-solo');
                    soloTableElem.classList.remove('tioc-hidden');
                    const soloHeadElem = soloTableElem.querySelector('thead');
                    dojo.place("<tr><th></th><td style='color: white;'>" + _("Sister") + "</td></tr>", soloHeadElem);
                    const soloBodyElem = soloTableElem.querySelector('tbody');
                    const soloDataArray = [
                        { title: _("1st Color"), col: 'score_solo_color_1', cssClass: '' },
                        { title: _("2nd Color"), col: 'score_solo_color_2', cssClass: '' },
                        { title: _("3rd Color"), col: 'score_solo_color_3', cssClass: '' },
                        { title: _("4th Color"), col: 'score_solo_color_4', cssClass: '' },
                        { title: _("5th Color"), col: 'score_solo_color_5', cssClass: '' },
                        { title: _("Solo Lessons"), col: 'score_solo_lessons', cssClass: '' },
                        { title: _("Total"), col: 'score_total' },
                    ];
                    for (const data of soloDataArray) {
                        const elem = dojo.place("<tr class='" + data.cssClass + "'><th>" + data.title + "</th></tr>", soloBodyElem);
                        if (!(data.col in this.scoreTable)) {
                            this.scoreTable[data.col] = {};
                        }
                        const playerId = this.SOLO_SISTER_PLAYER_ID;
                        dojo.place('<td id="tioc-' + data.col + '-' + playerId + '">0</td>', elem);
                        this.scoreTable[data.col][playerId] = new ebg.counter();
                        this.scoreTable[data.col][playerId].create('tioc-' + data.col + '-' + playerId);
                        this.scoreTable[data.col][playerId].setValue(0);
                    }
                }
            },
            displayBigScore(parentElem, playerId, score, x = null, y = null) {
                this.displayScoring(
                    parentElem,
                    this.playerColor[playerId],
                    score,
                    1000,
                    x,
                    y
                );
            },
            closeAllTooltips() {
                for (const tooltipId in this.tooltips) {
                    if (this.tooltips[tooltipId] !== undefined && this.tooltips[tooltipId] !== null) {
                        this.tooltips[tooltipId].close();
                    }
                }
            },
            updateTooltips() {
                this.tooltipScheduler.schedule();
            },
            updateTooltipsNow() {
                const shapes = document.querySelectorAll('.tioc-shape');
                for (const shape of shapes) {
                    if (shape.closest('.tioc-player-boat') !== null) {
                        this.removeTooltip(shape.id);
                        continue;
                    }
                    this.updateShapeElementTooltip(shape);
                }
                const cards = document.querySelectorAll('.tioc-card');
                for (const card of cards) {
                    this.updateCardElementTooltip(card);
                }
                const buttons = document.querySelectorAll('.tioc-player-boat-hide-shapes');
                for (const button of buttons) {
                    if (this.boatMgr.isPlayerBoatEmpty(button.dataset.playerId)) {
                        button.classList.add('inactive');
                    } else {
                        button.classList.remove('inactive');
                    }
                }
            },
            getColorNameFromColorId(colorId) {
                switch (colorId) {
                    case this.CAT_COLOR_ID_BLUE:
                        return _('Blue');
                    case this.CAT_COLOR_ID_GREEN:
                        return _('Green');
                    case this.CAT_COLOR_ID_RED:
                        return _('Red');
                    case this.CAT_COLOR_ID_PURPLE:
                        return _('Purple');
                    case this.CAT_COLOR_ID_ORANGE:
                        return _('Orange');
                }
                return '';
            },
            getColorNameFromColorCode(colorCode) {
                switch (colorCode) {
                    case 'blue':
                        return _('Blue');
                    case 'green':
                        return _('Green');
                    case 'red':
                        return _('Red');
                    case 'purple':
                        return _('Purple');
                    case 'orange':
                        return _('Orange');
                }
                return '';
            },
            updateShapeElementTooltip(shape, elementId = null) {
                if (shape.dataset.shapeId === undefined || shape.dataset.shapeId === null) {
                    return;
                }
                if (elementId === null) {
                    elementId = shape.id;
                }
                this.removeTooltip(elementId);
                const shapeClone = shape.cloneNode();
                shapeClone.id = '';
                shapeClone.style = '';
                shapeClone.classList.remove('tioc-moving');
                shapeClone.classList.remove('tioc-clickable');
                shapeClone.classList.remove('tioc-selected');
                shapeClone.classList.add('tioc-tooltip-wiggle');
                let title = this.getShapeTypeNameFromShapeId(shape.dataset.shapeId);
                let color = this.getCurrentColorFromShapeId(shape.dataset.shapeId);
                color = this.getColorNameFromColorCode(color);
                if (color.length > 0) {
                    color = dojo.string.substitute(_('Color: ${color}'), { color: color });
                }
                const w = this.getShapeWidthFromShapeId(shape.dataset.shapeId);
                const h = this.getShapeHeightFromShapeId(shape.dataset.shapeId);
                const nb = this.getShapeCoverageFromShapeId(shape.dataset.shapeId);
                this.addTooltipHtml(
                    elementId,
                    this.format_block('jstpl_tooltip_shape', {
                        shape_html: shapeClone.outerHTML,
                        title: title,
                        description: dojo.string.substitute(_('This shape has a width of ${w} square(s) and a height of ${h} square(s). It covers ${nb} square(s).'), {
                            w: w,
                            h: h,
                            nb: nb,
                        }),
                        color: color,
                    }),
                    1500
                );
            },
            updateCardElementTooltip(card) {
                this.removeTooltip(card.id);
                const cardClone = card.cloneNode();
                cardClone.id = '';
                cardClone.style = '';
                cardClone.classList.remove('tioc-moving');
                cardClone.classList.remove('tioc-clickable');
                cardClone.classList.remove('tioc-selected');
                cardClone.classList.remove('tioc-card-buy');
                cardClone.classList.add('tioc-card-tooltip-id-' + card.dataset.cardId);
                cardClone.classList.add('tioc-tooltip-wiggle');
                const cardTypeName = this.cardMgr.getCardTypeNameFromCardId(card.dataset.cardId);
                let color = this.cardMgr.getCurrentColorIdFromCardId(card.dataset.cardId);
                color = this.getColorNameFromColorId(color);
                const descNote = this.cardMgr.getDescriptionAndNoteFromCardId(card.dataset.cardId);
                this.addTooltipHtml(
                    card.id,
                    this.format_block('jstpl_tooltip_card', {
                        card_html: cardClone.outerHTML,
                        card_type: cardTypeName,
                        card_id: card.dataset.cardId,
                        description: descNote.description,
                        note: descNote.note,
                        color: color,
                    }),
                    1000
                );
            },
            showInformationDialog(title, paragraphArray, params = {}) {
                this.closeAllTooltips();
                const dialog = new ebg.popindialog();
                dialog.create('tioc-information-dialog');
                dialog.setTitle(title);
                let html = '<div>';
                if ('before' in params) {
                    html += params['before'];
                }
                let nextIsHeader = false;
                for (const p of paragraphArray) {
                    if (nextIsHeader) {
                        nextIsHeader = false;
                        html += '<h3>' + dojo.string.substitute(p, params) + '</h3>'
                    } else if (p.length == 0) {
                        nextIsHeader = true;
                    } else {
                        html += '<p>' + dojo.string.substitute(p, params) + '</p>'
                    }
                }
                if ('after' in params) {
                    html += params['after'];
                }
                html += '</div>'
                dialog.setContent(html);
                dialog.show();
            },
            showWelcomeMessage() {
                if (!this.isReadOnly() && this.playerPreferenceMgr.getShowStartMessagePref() < 1) {
                    if (this.isFamilyMode()) {
                        this.showInformationDialog(_('Welcome to The Isle of Cats!'), [
                            _('${startb}If you do not want to see this message again, close it and click on the gear icon ${gear} in your player panel.${endb}'),
                            _('You can disable this message and also see other options for the game.'),
                            '',
                            _('Scrolling'),
                            _('There can be a lot of information to view at the same time. You can reduce the amount of scrolling you have to do by showing (above your player boat) small shapes that represents cats and treasures. Those small shapes are shown when you have to place a cat or a treasure but you can enable an option so that they are always shown.'),
                            '',
                            _('Scaling'),
                            _("If some parts of the game are too big for you, you can use the scaling options to reduce their size. One common use is to scale down the other player's boats to view them all at the same time."),
                            '',
                            _('Have fun!'),
                        ], {
                            before: '<div class="tioc-game-icon"></div>',
                            startb: '<b>',
                            endb: '</b>',
                            gear: '<span class="tioc-gear tioc-gear-inline"></span>'
                        });
                    } else {
                        this.showInformationDialog(_('Welcome to The Isle of Cats!'), [
                            _('${startb}If you do not want to see this message again, close it and click on the gear icon ${gear} in your player panel.${endb}'),
                            _('You can disable this message and also see other options for the game.'),
                            _('The implementation of The Isle of Cats tries to match the game in real life but there are a few differences.'),
                            '',
                            _('Anytime cards'),
                            _('Anytime cards cannot be played at any moment. They can always be played on your turn in the Rescue and Rare Finds phases. They can also be played before or after specific points in the game. You can change when the game will ask you to play Anytime cards by clicking on the "When to play" button. The button is only displayed on some Anytime cards that can impact other players. You can click on the gear icon in your player panel for more options related to this button.'),
                            '',
                            _('Passing'),
                            _('Like in the real game, you must tell other players that you pass. When passing, you can also play Anytime cards if you wish. If you do not want to be asked to pass, you can click on the gear icon in your player panel and enable the "Auto pass" option.'),
                            '',
                            _('Scrolling'),
                            _('There can be a lot of information to view at the same time. You can reduce the amount of scrolling you have to do by showing (above your player boat) small shapes that represents cats and treasures. Those small shapes are shown when you have to place a cat or a treasure but you can enable an option so that they are always shown.'),
                            '',
                            _('Scaling'),
                            _("If some parts of the game are too big for you, you can use the scaling options to reduce their size. One common use is to scale down the other player's boats to view them all at the same time."),
                            '',
                            _('Have fun!'),
                        ], {
                            before: '<div class="tioc-game-icon"></div>',
                            startb: '<b>',
                            endb: '</b>',
                            gear: '<span class="tioc-gear tioc-gear-inline"></span>'
                        });
                    }
                }
            },
            showLastDayMessage(day, addToLog) {
                if (day != 1) {
                    return;
                }
                const msg = _("It's the last day: last chance to rescue cats and take treasures!");
                this.showMessage(msg, 'info');
                if (addToLog) {
                    this.showMessage(msg, 'only_to_log');
                }
            },

            /** More convenient version of ajaxcall, do not to specify game name, and any of the handlers */
            ajaxAction(action, args, func, err) {
                if (!args) {
                    args = [];
                }
                delete args.action;
                if (!args.hasOwnProperty('lock') || args.lock) {
                    args.lock = true;
                } else {
                    delete args.lock;
                }
                if (func === undefined || func == null) {
                    func = () => {};
                }
                const errFunc = (iserr) => {
                    if (iserr && err !== undefined && err !== null) {
                        err();
                    }
                };
                const name = this.game_name;
                this.ajaxcall("/" + name + "/" + name + "/" + action + ".html", args, this, func, errFunc);
            },

            // Resize
            resizeAll: function() {
                this.islandMgr.resizeAll();
            },
            // Scale
            rescale(scaleIsland, scaleCards, scaleOtherBoats, scalePlayerBoat) {
                const cssClassList = [
                    'tioc-scale-card-',
                    'tioc-scale-shape-',
                    'tioc-scale-island-',
                    'tioc-scale-boat-',
                    'tioc-scale-basket-',
                ]
                for (const cssClass of cssClassList) {
                    for (let i = 0; i <= 100; i += 10) {
                        for (const elem of document.querySelectorAll('.' + cssClass + i)) {
                            elem.classList.remove(cssClass + i);
                        }
                    }
                }
                const islandElem = document.getElementById('tioc-island-and-field-container');
                islandElem.classList.add('tioc-scale-island-' + scaleIsland);
                islandElem.classList.add('tioc-scale-shape-' + scaleIsland);
                document.body.classList.add('tioc-scale-card-' + scaleCards);
                for (const playerId in this.gamedatas.players) {
                    let scale = scaleOtherBoats;
                    if (playerId == this.player_id) {
                        scale = scalePlayerBoat;
                    }
                    const boatElem = document.getElementById('tioc-player-board-' + playerId);
                    boatElem.classList.add('tioc-scale-boat-' + scale);
                    boatElem.classList.add('tioc-scale-shape-' + scale);
                    boatElem.classList.add('tioc-scale-basket-' + scale);
                }
                this.islandMgr.rescale(scaleIsland);
                this.boatMgr.rescale(scaleOtherBoats, scalePlayerBoat);
            },
            // From https://github.com/bga-devs/tisaac-boilerplate
            slide(mobileElt, targetElt, options = {}) {
                let config = Object.assign({
                        duration: 500,
                        delay: 0,
                        destroy: false,
                        attach: true,
                        changeParent: true, // Change parent during sliding to avoid zIndex issue
                        pos: null,
                        className: 'moving',
                        from: null,
                        clearPos: true,
                        beforeBrother: null,

                        phantom: false,
                    },
                    options,
                );
                config.phantomStart = config.phantomStart || config.phantom;
                config.phantomEnd = config.phantomEnd || config.phantom;

                // Mobile elt
                mobileElt = $(mobileElt);
                let mobile = mobileElt;
                // Target elt
                targetElt = $(targetElt);
                let targetId = targetElt;
                const newParent = config.attach ? targetId : $(mobile).parentNode;

                // Handle fast mode
                if (this.isFastMode() && (config.destroy || config.clearPos)) {
                    if (config.destroy) dojo.destroy(mobile);
                    else dojo.place(mobile, targetElt);

                    return new Promise((resolve, reject) => {
                        resolve();
                    });
                }

                // Handle phantom at start
                if (config.phantomStart) {
                    mobile = dojo.clone(mobileElt);
                    dojo.attr(mobile, 'id', mobileElt.id + '_animated');
                    dojo.place(mobile, 'game_play_area');
                    this.placeOnObject(mobile, mobileElt);
                    dojo.addClass(mobileElt, 'phantom');
                    config.from = mobileElt;
                }

                // Handle phantom at end
                if (config.phantomEnd) {
                    targetId = dojo.clone(mobileElt);
                    dojo.attr(targetId, 'id', mobileElt.id + '_afterSlide');
                    dojo.addClass(targetId, 'phantomm');
                    if (config.beforeBrother != null) {
                        dojo.place(targetId, config.beforeBrother, 'before');
                    } else {
                        dojo.place(targetId, targetElt);
                    }
                }

                dojo.style(mobile, 'zIndex', 5000);
                dojo.addClass(mobile, config.className);
                // Cannot use this since the game needs the element on the parent at the start of the movement
                // if (config.changeParent) this.changeParent(mobile, 'game_play_area');
                this.changeParent(mobile, newParent);
                if (config.from != null) this.placeOnObject(mobile, config.from);
                return new Promise((resolve, reject) => {
                    const animation =
                        config.pos == null ?
                        this.slideToObject(mobile, targetId, config.duration, config.delay) :
                        this.slideToObjectPos(mobile, targetId, config.pos.x, config.pos.y, config.duration, config.delay);

                    dojo.connect(animation, 'onEnd', () => {
                        dojo.style(mobile, 'zIndex', null);
                        dojo.removeClass(mobile, config.className);
                        if (config.phantomStart) {
                            dojo.place(mobileElt, mobile, 'replace');
                            dojo.removeClass(mobileElt, 'phantom');
                            mobile = mobileElt;
                        }
                        if (config.changeParent) {
                            if (config.phantomEnd) dojo.place(mobile, targetId, 'replace');
                            else this.changeParent(mobile, newParent);
                        }
                        if (config.destroy) dojo.destroy(mobile);
                        if (config.clearPos && !config.destroy) dojo.style(mobile, { top: null, left: null, position: null });
                        resolve();
                    });
                    animation.play();
                });
            },
            changeParent(mobile, new_parent, relation) {
                if (mobile === null) {
                    console.error('attachToNewParent: mobile obj is null');
                    return;
                }
                if (new_parent === null) {
                    console.error('attachToNewParent: new_parent is null');
                    return;
                }
                if (typeof mobile == 'string') {
                    mobile = $(mobile);
                }
                if (typeof new_parent == 'string') {
                    new_parent = $(new_parent);
                }
                if (typeof relation == 'undefined') {
                    relation = 'last';
                }
                var src = dojo.position(mobile);
                dojo.style(mobile, 'position', 'absolute');
                dojo.place(mobile, new_parent, relation);
                var tgt = dojo.position(mobile);
                var box = dojo.marginBox(mobile);
                var cbox = dojo.contentBox(mobile);
                var left = box.l + src.x - tgt.x;
                var top = box.t + src.y - tgt.y;
                this.positionObjectDirectly(mobile, left, top);
                box.l += box.w - cbox.w;
                box.t += box.h - cbox.h;
                return box;
            },
            positionObjectDirectly(mobileObj, x, y) {
                // do not remove this "dead" code some-how it makes difference
                dojo.style(mobileObj, 'left'); // bug? re-compute style
                // console.log("place " + x + "," + y);
                dojo.style(mobileObj, {
                    left: x + 'px',
                    top: y + 'px',
                });
                dojo.style(mobileObj, 'left'); // bug? re-compute style
            },
            isFastMode() {
                return this.instantaneousMode;
            },

            // Notifications
            setupNotifications() {
                const wrapNotif = (functionName) => {
                    return function() {
                        window.tiocWrap(functionName, () => {
                            return this[functionName](...arguments);
                        });
                    }
                };
                dojo.subscribe('NTF_UPDATE_FISH_COUNT', this, wrapNotif("notif_UpdateFishCount"));
                dojo.subscribe('NTF_UPDATE_FILL_FIELDS', this, wrapNotif("notif_UpdateFillFields"));
                dojo.subscribe('NTF_MOVE_CARDS', this, wrapNotif("notif_MoveCards"));
                dojo.subscribe('NTF_PASS_DRAFT_CARDS', this, wrapNotif("notif_PassDraftCards"));
                dojo.subscribe('NTF_CREATE_OR_MOVE_CARDS', this, wrapNotif("notif_CreateOrMoveCards"));
                dojo.subscribe('NTF_UPDATE_PRIVATE_LESSONS_COUNT', this, wrapNotif("notif_UpdatePrivateLessonsCount"));
                dojo.subscribe('NTF_UPDATE_HAND_COUNT', this, wrapNotif("notif_UpdateHandCount"));
                dojo.subscribe('NTF_ADJUST_CAT_ORDER', this, wrapNotif("notif_AdjustCatOrder"));
                dojo.subscribe('NTF_PLAY_AND_DISCARD_CARDS', this, wrapNotif("notif_PlayAndDiscardCards"));
                dojo.subscribe('NTF_DISCARD_SECRET_CARDS', this, wrapNotif("notif_DiscardSecretCards"));
                dojo.subscribe('NTF_MOVE_SHAPE_TO_BOAT', this, wrapNotif("notif_MoveShapeToBoat"));
                dojo.subscribe('NTF_USE_BASKET', this, wrapNotif("notif_UseBasket"));
                dojo.subscribe('NTF_PLAYER_PASS_UPDATE', this, wrapNotif("notif_PlayerPassUpdate"));
                dojo.subscribe('NTF_UPDATE_PLAYER_TURN_ACTION', this, wrapNotif("notif_UpdatePlayerTurnAction"));
                dojo.subscribe('NTF_DISCARD_SHAPES', this, wrapNotif("notif_DiscardShapes"));
                dojo.subscribe('NTF_RESET_BASKET', this, wrapNotif("notif_ResetBasket"));
                dojo.subscribe('NTF_UPDATE_DAY_COUNTER', this, wrapNotif("notif_UpdateDayCounter"));
                dojo.subscribe('NTF_MOVE_SHAPES', this, wrapNotif("notif_MoveShapes"));
                dojo.subscribe('NTF_UPDATE_DRAFT_ORDER', this, wrapNotif("notif_UpdateDraftOrder"));
                dojo.subscribe('NTF_DISCARD_BASKET', this, wrapNotif("notif_DiscardBasket"));
                dojo.subscribe('NTF_CREATE_BASKET', this, wrapNotif("notif_CreateBasket"));
                dojo.subscribe('NTF_UPDATE_BOAT_USED_GRID_COLOR', this, wrapNotif("notif_UpdateBoatUsedGridColor"));
                dojo.subscribe('NTF_SCORE_BOAT_POSITION', this, wrapNotif("notif_ScoreBoatPosition"));
                dojo.subscribe('NTF_SCORE_CARDS', this, wrapNotif("notif_ScoreCards"));
                dojo.subscribe('NTF_UPDATE_PLAYER_ANYTIME_PREF', this, wrapNotif("notif_UpdatePlayerAnytimePref"));
                dojo.subscribe('NTF_UPDATE_SOLO_ORDER', this, wrapNotif("notif_UpdateSoloOrder"));

                this.notifqueue.setSynchronous('NTF_DISCARD_SHAPES', 300);
                this.notifqueue.setSynchronous('NTF_SCORE_BOAT_POSITION', 1000);
                this.notifqueue.setSynchronous('NTF_SCORE_CARDS', 1000);
                this.notifqueue.setSynchronous('NTF_MOVE_SHAPE_TO_BOAT', 500);
            },
            notif_UpdateFishCount(notif) {
                this.fishMgr.setFishToPlayer(notif.args.player_id, notif.args.fishCountTotal);
            },
            notif_UpdateFillFields(notif) {
                for (const shape of notif.args.shapes) {
                    this.islandMgr.createAndPlaceShape(shape);
                }
            },
            notif_MoveShapes(notif) {
                for (const shape of notif.args.shapes) {
                    let price = this.islandMgr.CAT_PRICE_LEFT_FIELD;
                    if (shape.shapeLocationId == this.SHAPE_LOCATION_ID_FIELD_RIGHT) {
                        price = this.islandMgr.CAT_PRICE_RIGHT_FIELD;
                    }
                    this.addKnownShape(shape);
                    this.islandMgr.moveShapeToIsland(shape.shapeId, price);
                }
            },
            notif_MoveCards(notif) {
                this.cardMgr.moveToLocation(notif.args.player_id, notif.args.cardLocationId, notif.args.cardIds);
            },
            notif_PassDraftCards(notif) {
                this.cardMgr.moveDraftToPlayerId(notif.args.next_player_id);
                this.cardMgr.createDraftCardsFromPlayerId(notif.args.prev_player_id, notif.args.receivesCards);
            },
            notif_CreateOrMoveCards(notif) {
                this.cardMgr.createOrMoveCards(notif.args.cards);
            },
            notif_UpdatePrivateLessonsCount(notif) {
                for (const playerId in notif.args.privateLessonsCount) {
                    this.cardMgr.setPrivateLessonCountToPlayer(playerId, notif.args.privateLessonsCount[playerId]);
                }
            },
            notif_UpdateHandCount(notif) {
                for (const playerId in notif.args.handCount) {
                    this.cardMgr.setHandCountToPlayer(playerId, notif.args.handCount[playerId], notif.args.tableRescueCardsCount[playerId]);
                }
            },
            notif_AdjustCatOrder(notif) {
                this.islandMgr.adjustCatOrder(notif.args.playerIdArray);
            },
            notif_PlayAndDiscardCards(notif) {
                this.cardMgr.playAndDiscard(notif.args.player_id, notif.args.cards);
            },
            notif_DiscardSecretCards(notif) {
                this.cardMgr.discardSecretCardIds(notif.args.cardIds);
            },
            notif_MoveShapeToBoat(notif) {
                this.boatMgr.moveAndTransformShapeToBoat(notif.args.player_id, notif.args.shape);
            },
            notif_UseBasket(notif) {
                this.basketMgr.useBasket(notif.args.basketId);
            },
            notif_PlayerPassUpdate(notif) {
                this.updatePassPerPlayerId(notif.args.passPerPlayerId);
            },
            notif_UpdatePlayerTurnAction(notif) {
                this.phase45Mgr.updateTurnAction(notif.args.turnAction);
            },
            notif_DiscardShapes(notif) {
                for (const shape of notif.args.shapes) {
                    this.addKnownShape(shape);
                    this.islandMgr.discardShapeId(shape.shapeId);
                }
            },
            notif_ResetBasket(notif) {
                for (const basketId of notif.args.basketIds) {
                    this.basketMgr.unuseBasket(basketId);
                }
            },
            notif_UpdateDayCounter(notif) {
                this.islandMgr.updateDayCounter(notif.args.day);
                this.showLastDayMessage(notif.args.day, true);
            },
            notif_UpdateDraftOrder(notif) {
                for (const playerId in notif.args.prevPlayerToColor) {
                    const prevColor = notif.args.prevPlayerToColor[playerId];
                    const nextPlayerId = notif.args.nextColorToPlayer[prevColor];
                    const currentElemId = 'tioc-player-panel-next-player-cat-' + playerId;
                    const nextElemId = 'tioc-player-panel-next-player-cat-' + nextPlayerId;

                    this.removeClass(currentElemId, 'small');
                    this.removeClass(currentElemId, prevColor);
                    this.removeClass(nextElemId, 'small');
                    this.removeClass(nextElemId, prevColor);

                    const movingCatElemId = 'tioc-moving-cat-' + playerId;
                    const movingCat = dojo.place(this.format_block('jstpl_meeple_cat', {
                            color_name: prevColor,
                        }),
                        currentElemId
                    );
                    movingCat.id = movingCatElemId;
                    movingCat.classList.add('tioc-moving');
                    this.slide(movingCatElemId, nextElemId).then(() => {
                        window.tiocWrap('notif_UpdateDraftOrder_onEnd', () => {
                            document.getElementById(movingCatElemId).remove();
                            this.addClass(nextElemId, 'small');
                            this.addClass(nextElemId, prevColor);
                        });
                    });
                    this.addClass(movingCatElemId, 'small');
                    this.addClass(currentElemId, 'small');
                    this.addClass(nextElemId, 'small');
                }
            },
            notif_DiscardBasket(notif) {
                this.basketMgr.moveAndDiscardBasketId(notif.args.basketId);
            },
            notif_CreateBasket(notif) {
                this.basketMgr.createOrReplaceBasket(notif.args.player_id, notif.args.tmpBasketId, notif.args.realBasketId);
            },
            notif_UpdateBoatUsedGridColor(notif) {
                this.boatMgr.updatePlayerPanelBoat(notif.args.boatUsedGridColor);
            },
            notif_ScoreBoatPosition(notif) {
                this.updatePlayerScore(notif.args.player_id, notif.args.totalScore, notif.args.scoreColumn, notif.args.score);
                this.boatMgr.showScoreBoatPosition(notif.args.player_id, notif.args.scoreBoatPosition);
            },
            notif_ScoreCards(notif) {
                this.updatePlayerScore(notif.args.player_id, notif.args.totalScore, notif.args.scoreColumn, notif.args.score);
                this.cardMgr.showScoreCards(notif.args.player_id, notif.args.scoreCards);
            },
            notif_UpdatePlayerAnytimePref(notif) {
                this.cardMgr.updatePlayerAnytimePref(notif.args.playerAnytimePref);
            },
            notif_UpdateSoloOrder(notif) {
                this.islandMgr.updateSoloOrder(notif.args.soloOrder);
            },
        });
    });