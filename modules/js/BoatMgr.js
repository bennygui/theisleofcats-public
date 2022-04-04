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
    ],
    (dojo, declare) => {
        return declare(
            'tioc.BoatMgr',
            null, {
                game: null,

                BOAT_TILE_BASE_LEFT: 32,
                BOAT_TILE_BASE_TOP: 55,
                BOAT_TILE_WIDTH: 22,
                BOAT_TILE_HEIGHT: 9,
                BOAT_TILE_HEIGHT_PER_COLUMN: [
                    3,
                    5, 5, 5,
                    7, 7, 7,
                    9, 9, 9, 9, 9, 9, 9, 9,
                    7, 7,
                    5, 5,
                    3, 3,
                    1
                ],
                BOAT_MAP_PLACEMENT: {
                    blue: {
                        blue: { x: 14, y: 1 },
                        green: { x: 7, y: 0 },
                        red: { x: 1, y: 3 },
                        purple: { x: 9, y: 7 },
                        orange: { x: 19, y: 5 },
                    },
                    green: {
                        blue: { x: 1, y: 3 },
                        green: { x: 14, y: 1 },
                        red: { x: 19, y: 5 },
                        purple: { x: 7, y: 0 },
                        orange: { x: 9, y: 7 },
                    },
                    red: {
                        blue: { x: 9, y: 7 },
                        green: { x: 1, y: 3 },
                        red: { x: 14, y: 1 },
                        purple: { x: 19, y: 5 },
                        orange: { x: 7, y: 0 },
                    },
                    purple: {
                        blue: { x: 7, y: 0 },
                        green: { x: 19, y: 5 },
                        red: { x: 9, y: 7 },
                        purple: { x: 1, y: 3 },
                        orange: { x: 14, y: 1 },
                    },
                },
                BOAT_ROOMS_ID_PARROT_BACK: 0,
                BOAT_ROOMS_ID_MOON_TOP: 1,
                BOAT_ROOMS_ID_MOON_BOTTOM: 2,
                BOAT_ROOMS_ID_APPLE_MIDDLE: 3,
                BOAT_ROOMS_ID_CORN_FRONT: 4,
                BOAT_ROOMS_ID_PARROT_FRONT: 5,
                BOAT_ROOMS_RECTANGLE: [
                    // Back - Parrot
                    { 'topX': 0, 'topY': 2, 'bottomX': 3, 'bottomY': 6 },
                    // Top - Moon
                    { 'topX': 4, 'topY': 0, 'bottomX': 10, 'bottomY': 1 },
                    // Bottom - Moon
                    { 'topX': 4, 'topY': 7, 'bottomX': 10, 'bottomY': 8 },
                    // Middle - Apple
                    { 'topX': 5, 'topY': 3, 'bottomX': 10, 'bottomY': 5 },
                    // Front (large) - Corn
                    { 'topX': 16, 'topY': 1, 'bottomX': 19, 'bottomY': 7 },
                    // Front (small) - Parrot
                    { 'topX': 20, 'topY': 3, 'bottomX': 21, 'bottomY': 5 },
                    // The rest: no icon (and not listed here)
                ],
                SHAPE_COLOR_COUNTERS: ['blue', 'green', 'orange', 'purple', 'red', 'common', 'rare', 'oshax'],

                // Try shapes
                clientTryShapeBoatGridUsed: [],
                clientTryShapeShapeGridUsed: {},
                // Current player
                clientPlayerBoatGridUsed: [],
                clientPlayerShapeGridUsed: {},
                // Server
                serverBoatGridUsed: {},
                serverPlayerShapeGridUsed: {},

                playerBoatColorName: {},
                shapesHiddenPerPlayerId: {},
                placementShowGridOverlay: false,
                overlayButtonPressedBeforePlacing: false,
                overlayButtonChangedWhilePlacementShowGridOverlay: false,
                overlayButtonPressedPerPlayerId: {},
                playerShapeColorCounter: {},

                constructor(game) {
                    this.game = game;
                },
                setup(gamedatas) {
                    if (this.game.isFamilyMode()) {
                        this.game.addTooltipHtmlToClass(
                            'tioc-player-boat-legend-score',
                            this.game.format_block('jstpl_tooltip_legend_score_family', {
                                rats: _('Rats'),
                                rooms: _('Rooms'),
                                cat_families: _('Cat Families'),
                                your_lessons: _('Your Lessons'),
                                families: _('Families'),
                                desc: _('In the family mode, there are no points for rare treasures, and there are no public lessons.'),
                            })
                        );
                        this.game.addTooltipHtmlToClass(
                            'tioc-player-boat-legend-round',
                            this.game.format_block('jstpl_tooltip_legend_round_family', {
                                title: _('Round Summary'),
                                add_cats: _('Place 4 cats per player around the island.'),
                                rescue_cats: _('Rescue cats until there are no more cat tiles, or all players have passed.'),
                                empty_fields: _('Place any remaining cat tiles back in the box.'),
                            })
                        );
                    } else {
                        this.game.addTooltipHtmlToClass(
                            'tioc-player-boat-legend-score',
                            this.game.format_block('jstpl_tooltip_legend_score', {
                                rats: _('Rats'),
                                rooms: _('Rooms'),
                                cat_families: _('Cat Families'),
                                rare_treasure: _('Rare Treasure'),
                                your_lessons: _('Your Lessons'),
                                public_lessons: _('Public Lessons'),
                                families: _('Families'),
                            })
                        );
                        this.game.addTooltipHtmlToClass(
                            'tioc-player-boat-legend-round',
                            this.game.format_block('jstpl_tooltip_legend_round', {
                                title: _('Round Summary'),
                                add_cats: _('Add 2 cats per player to each of the fields.'),
                                fishing: _('Fishing (20 fish)'),
                                explore: _('Explore (7 cards)'),
                                read_lessons: _('Read Lessons'),
                                rescue_cats: _('Rescue Cats'),
                                rare_finds: _('Rare Finds (Oshax and Treasure)'),
                                empty_fields: _('Empty the fields.'),
                            })
                        );
                    }
                    const preventEvent = (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    };
                    for (const playerId in gamedatas.players) {
                        this.playerBoatColorName[playerId] = gamedatas.players[playerId].boat_color_name;

                        this.shapesHiddenPerPlayerId[playerId] = false;
                        const hideShapesButtonElem = document.getElementById('tioc-player-boat-hide-shapes-' + playerId);
                        hideShapesButtonElem.innerText = _('Hide shapes');
                        this.game.connect(hideShapesButtonElem, 'touchstart', (event) => this.hideBoatPlayerShapes(hideShapesButtonElem, playerId));
                        this.game.connect(hideShapesButtonElem, 'mousedown', (event) => this.hideBoatPlayerShapes(hideShapesButtonElem, playerId));

                        this.game.connect(hideShapesButtonElem, 'touchend', (event) => this.showBoatPlayerShapes(hideShapesButtonElem, playerId));
                        this.game.connect(hideShapesButtonElem, 'mouseup', (event) => this.showBoatPlayerShapes(hideShapesButtonElem, playerId));
                        this.game.connect(hideShapesButtonElem, 'mouseleave', (event) => this.showBoatPlayerShapes(hideShapesButtonElem, playerId));

                        this.game.connect(hideShapesButtonElem, 'oncontextmenu', preventEvent);
                        this.game.addTooltip(
                            hideShapesButtonElem.id,
                            '',
                            _('Press to hide shapes that are on the boat and see the rooms hidden by the shapes')
                        );

                        this.overlayButtonPressedPerPlayerId[playerId] = false;
                        const hideOverlayButtonElem = document.getElementById('tioc-player-boat-hide-overlay-' + playerId);
                        hideOverlayButtonElem.innerText = _('Room overlay');
                        this.game.connect(hideOverlayButtonElem, 'onclick', (event) => this.overlayButtonClicked(hideOverlayButtonElem, playerId));
                        this.game.connect(hideOverlayButtonElem, 'oncontextmenu', preventEvent);
                        this.game.addTooltip(
                            hideOverlayButtonElem.id,
                            '',
                            _('Enable to show the overlay that shows empty squares and room icons')
                        );

                        this.playerShapeColorCounter[playerId] = {};
                        for (const colorCounter of this.SHAPE_COLOR_COUNTERS) {
                            const elemId = 'tioc-player-panel-shape-face-' + colorCounter + '-' + playerId;
                            this.playerShapeColorCounter[playerId][colorCounter] = new ebg.counter();
                            this.playerShapeColorCounter[playerId][colorCounter].create(elemId);
                            this.playerShapeColorCounter[playerId][colorCounter].setValue(0);
                        }
                    }
                    // Build grid for all boats
                    let gridId = 0;
                    for (let x = 0; x < this.BOAT_TILE_WIDTH; ++x) {
                        let baseY = (this.BOAT_TILE_HEIGHT - this.BOAT_TILE_HEIGHT_PER_COLUMN[x]) / 2;
                        for (let y = 0; y < this.BOAT_TILE_HEIGHT; ++y) {
                            const isValidGrid = (y >= baseY && y < baseY + this.BOAT_TILE_HEIGHT_PER_COLUMN[x]);
                            for (const boatElem of dojo.query('.tioc-player-boat')) {
                                dojo.place(this.game.format_block('jstpl_shape_grid', {
                                    x: x,
                                    y: y,
                                    x_px: this.BOAT_TILE_BASE_LEFT + x + x * this.game.TILE_SIZE,
                                    y_px: this.BOAT_TILE_BASE_TOP + y + y * this.game.TILE_SIZE,
                                    grid_id: gridId++,
                                    valid_grid: isValidGrid,
                                }), boatElem);
                            }
                            for (const boatElem of dojo.query('.tioc-player-panel-boat-container')) {
                                dojo.place(this.game.format_block('jstpl_shape_grid', {
                                    x: x,
                                    y: y,
                                    x_px: x * this.game.SMALL_TILE_SIZE,
                                    y_px: y * this.game.SMALL_TILE_SIZE,
                                    grid_id: gridId++,
                                    valid_grid: isValidGrid,
                                }), boatElem);
                            }
                        }
                    }
                    // Build array of used and unused boat grid for current player
                    this.clearBoatGridUsed(this.clientPlayerBoatGridUsed);
                    this.clearBoatGridUsed(this.clientTryShapeBoatGridUsed);
                    for (const playerId in gamedatas.players) {
                        this.serverBoatGridUsed[playerId] = [];
                        this.clearBoatGridUsed(this.serverBoatGridUsed[playerId]);
                        this.serverPlayerShapeGridUsed[playerId] = {};
                    }

                    // Place each shape on boat
                    for (const shape of gamedatas.shapes) {
                        this.game.addKnownShape(shape);
                        if (shape.shapeLocationId != this.game.SHAPE_LOCATION_ID_BOAT) {
                            continue;
                        }
                        const gridElem = document.querySelector('#tioc-player-boat-' + shape.playerId + ' .tioc-grid.x_' + shape.boatTopX + '_y_' + shape.boatTopY);
                        this.game.createShapeElement(
                            gridElem.id,
                            shape.shapeId,
                            shape.shapeTypeId,
                            shape.shapeDefId,
                            shape.colorId
                        );
                        this.applyTransformToShapeId(
                            shape.shapeId,
                            shape.boatRotation,
                            shape.boatHorizontalFlip,
                            shape.boatVerticalFlip
                        );
                        if (shape.shapeTypeId == this.game.SHAPE_TYPE_ID_OSHAX) {
                            this.placeColorIdOnShapeId(shape.shapeId, shape.colorId);
                        }
                    }

                    this.updatePlayerPanelBoat(gamedatas.boatUsedGridColor);
                },
                hideBoatPlayerShapes(hideShapesButtonElem, playerId) {
                    window.tiocWrap('hideBoatPlayerShapes', () => {
                        hideShapesButtonElem.classList.add('pressed');
                        dojo.query('#tioc-player-boat-' + playerId + ' .tioc-shape').addClass('tioc-shape-fade-out');
                        this.shapesHiddenPerPlayerId[playerId] = true;
                        this.updateGridOverlay();
                    });
                },
                rescale(scaleOtherBoats, scalePlayerBoat) {
                    for (const playerId in this.game.gamedatas.players) {
                        let scale = scaleOtherBoats;
                        if (playerId == this.game.player_id) {
                            scale = scalePlayerBoat;
                        }
                        const grids = document.querySelectorAll('#tioc-player-boat-' + playerId + ' .tioc-grid');
                        for (const grid of grids) {
                            const x = parseInt(grid.dataset.x);
                            const y = parseInt(grid.dataset.y);
                            const x_px = (this.BOAT_TILE_BASE_LEFT + x + x * this.game.TILE_SIZE) * scale / 100;
                            const y_px = (this.BOAT_TILE_BASE_TOP + y + y * this.game.TILE_SIZE) * scale / 100;
                            grid.style.left = x_px + 'px';
                            grid.style.top = y_px + 'px';

                            const overlay = document.getElementById('tioc-grid-overlay-' + playerId + '-' + x + '-' + y);
                            if (overlay !== null) {
                                overlay.style.left = x_px + 'px';
                                overlay.style.top = y_px + 'px';
                            }
                        }
                    }
                },
                clearBoatGridUsed(boatGridUsed) {
                    boatGridUsed.length = this.BOAT_TILE_WIDTH;
                    for (let x = 0; x < this.BOAT_TILE_WIDTH; ++x) {
                        boatGridUsed[x] = [];
                        boatGridUsed[x].length = this.BOAT_TILE_HEIGHT;
                        for (let y = 0; y < this.BOAT_TILE_HEIGHT; ++y) {
                            boatGridUsed[x][y] = false;
                        }
                    }
                },
                clearTryShapes() {
                    this.clearBoatGridUsed(this.clientTryShapeBoatGridUsed);
                    this.clientTryShapeShapeGridUsed = {};
                },
                showBoatPlayerShapes(hideShapesButtonElem, playerId) {
                    window.tiocWrap('showBoatPlayerShapes', () => {
                        hideShapesButtonElem.classList.remove('pressed');
                        dojo.query('#tioc-player-boat-' + playerId + ' .tioc-shape').removeClass('tioc-shape-fade-out');
                        this.shapesHiddenPerPlayerId[playerId] = false;
                        this.updateGridOverlay();
                    });
                },
                overlayButtonClicked(hideOverlayButtonElem, playerId) {
                    window.tiocWrap('overlayButtonPressed', () => {
                        hideOverlayButtonElem.classList.toggle('pressed');
                        this.overlayButtonPressedPerPlayerId[playerId] = !this.overlayButtonPressedPerPlayerId[playerId];
                        if (playerId == this.game.player_id && this.placementShowGridOverlay) {
                            this.overlayButtonChangedWhilePlacementShowGridOverlay = true;
                        }
                        this.updateGridOverlay();
                    });
                },
                showPlacementGridOverlay() {
                    this.placementShowGridOverlay = true;
                    this.overlayButtonChangedWhilePlacementShowGridOverlay = false;
                    this.overlayButtonPressedBeforePlacing = this.overlayButtonPressedPerPlayerId[this.game.player_id];
                    this.overlayButtonPressedPerPlayerId[this.game.player_id] = true;
                    const hideOverlayButtonElem = document.getElementById('tioc-player-boat-hide-overlay-' + this.game.player_id);
                    hideOverlayButtonElem.classList.add('pressed');
                    this.updateGridOverlay();
                },
                hidePlacementGridOverlay() {
                    if (this.placementShowGridOverlay) {
                        if (!this.overlayButtonChangedWhilePlacementShowGridOverlay) {
                            this.overlayButtonPressedPerPlayerId[this.game.player_id] = this.overlayButtonPressedBeforePlacing
                            const hideOverlayButtonElem = document.getElementById('tioc-player-boat-hide-overlay-' + this.game.player_id);
                            if (this.overlayButtonPressedPerPlayerId[this.game.player_id]) {
                                hideOverlayButtonElem.classList.add('pressed');
                            } else {
                                hideOverlayButtonElem.classList.remove('pressed');
                            }
                        }
                    }
                    this.placementShowGridOverlay = false;
                    this.overlayButtonChangedWhilePlacementShowGridOverlay = false;
                    this.updateGridOverlay();
                },
                updateGridOverlay() {
                    for (const playerId in this.game.gamedatas.players) {
                        const grids = document.querySelectorAll('#tioc-player-boat-' + playerId + ' .tioc-grid[data-valid-grid="true"]');
                        for (const grid of grids) {
                            const x = parseInt(grid.dataset.x);
                            const y = parseInt(grid.dataset.y);
                            let overlay = document.getElementById('tioc-grid-overlay-' + playerId + '-' + x + '-' + y);
                            if (overlay === null) {
                                overlay = dojo.place(
                                    this.game.format_block('jstpl_grid_overlay', {
                                        x: x,
                                        y: y,
                                        x_px: grid.offsetLeft,
                                        y_px: grid.offsetTop,
                                        player_id: playerId,
                                    }),
                                    'tioc-player-boat-' + playerId);
                                let hasMap = false;
                                for (const colorName in this.BOAT_MAP_PLACEMENT[this.playerBoatColorName[playerId]]) {
                                    const mapGrid = this.BOAT_MAP_PLACEMENT[this.playerBoatColorName[playerId]][colorName];
                                    if (mapGrid.x == x && mapGrid.y == y) {
                                        dojo.place('<div class="map-icon ' + colorName + '"></div>', overlay);
                                        hasMap = true;
                                        break;
                                    }
                                }
                                if (!hasMap) {
                                    for (const roomIndex in this.BOAT_ROOMS_RECTANGLE) {
                                        const rect = this.BOAT_ROOMS_RECTANGLE[roomIndex];
                                        if (
                                            x >= rect['topX'] && x <= rect['bottomX'] &&
                                            y >= rect['topY'] && y <= rect['bottomY']
                                        ) {
                                            switch (parseInt(roomIndex)) {
                                                case this.BOAT_ROOMS_ID_PARROT_BACK:
                                                    dojo.place('<div class="room-icon parrot-back"></div>', overlay);
                                                    break;
                                                case this.BOAT_ROOMS_ID_MOON_TOP:
                                                    dojo.place('<div class="room-icon moon-top"></div>', overlay);
                                                    break;
                                                case this.BOAT_ROOMS_ID_MOON_BOTTOM:
                                                    dojo.place('<div class="room-icon moon-bottom"></div>', overlay);
                                                    break;
                                                case this.BOAT_ROOMS_ID_APPLE_MIDDLE:
                                                    dojo.place('<div class="room-icon apple"></div>', overlay);
                                                    break;
                                                case this.BOAT_ROOMS_ID_CORN_FRONT:
                                                    dojo.place('<div class="room-icon corn"></div>', overlay);
                                                    break;
                                                case this.BOAT_ROOMS_ID_PARROT_FRONT:
                                                    dojo.place('<div class="room-icon parrot-front"></div>', overlay);
                                                    break;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                            if (this.overlayButtonPressedPerPlayerId[playerId]) {
                                overlay.classList.remove('tioc-hidden');
                            } else {
                                overlay.classList.add('tioc-hidden');
                            }
                            if (this.isPlayerGridEmpty(playerId, x, y) || this.shapesHiddenPerPlayerId[playerId]) {
                                overlay.classList.add('empty');
                                overlay.classList.remove('top');
                                overlay.classList.remove('bottom');
                                overlay.classList.remove('left');
                                overlay.classList.remove('right');
                            } else {
                                overlay.classList.remove('empty');
                                if (this.isPlayerGridEmpty(playerId, x, y - 1)) {
                                    overlay.classList.add('top');
                                } else {
                                    overlay.classList.remove('top');
                                }
                                if (this.isPlayerGridEmpty(playerId, x, y + 1)) {
                                    overlay.classList.add('bottom');
                                } else {
                                    overlay.classList.remove('bottom');
                                }
                                if (this.isPlayerGridEmpty(playerId, x - 1, y)) {
                                    overlay.classList.add('left');
                                } else {
                                    overlay.classList.remove('left');
                                }
                                if (this.isPlayerGridEmpty(playerId, x + 1, y)) {
                                    overlay.classList.add('right');
                                } else {
                                    overlay.classList.remove('right');
                                }
                            }
                        }
                    }
                },
                allowPlaceShape(placeShapeFunction) {
                    this.showPlacementGridOverlay();
                    const grids = document.querySelectorAll('#tioc-player-boat-' + this.game.player_id + ' .tioc-grid[data-valid-grid="true"]');
                    for (const grid of grids) {
                        grid.classList.add('tioc-clickable-no-border')
                        this.game.addOnClick(grid, () => {
                            this.removeAllBoatClickable();
                            placeShapeFunction(parseInt(grid.dataset.x), parseInt(grid.dataset.y));
                        });
                    }
                },
                removeAllBoatClickable() {
                    let clickable = document.querySelectorAll('.tioc-player-boat .tioc-clickable');
                    for (const c of clickable) {
                        this.game.removeClickableId(c.id);
                    }
                },
                moveShapeToBoat(playerId, shapeId, x, y, onEndAnim = null) {
                    this.game.islandMgr.unlockShapeId(shapeId);
                    const shapeElem = document.getElementById('tioc-shape-id-' + shapeId);
                    shapeElem.classList.add('tioc-moving');
                    shapeElem.classList.remove('tioc-clickable');
                    shapeElem.classList.remove('tioc-clickable-no-border');
                    shapeElem.classList.remove('tioc-selected');
                    const gridElem = document.querySelector('#tioc-player-boat-' + playerId + ' .tioc-grid.x_' + x + '_y_' + y);
                    this.game.slide(shapeElem.id, gridElem.id).then(() => {
                        window.tiocWrap('moveShapeToBoat_onEnd', () => {
                            this.game.removeAbsolutePosition(shapeElem.id);
                            this.game.phase45Mgr.updateShapesPlayedMove();
                            this.game.updateTooltips();
                            this.updatePlayerPanelShapeCount();
                            this.game.islandMgr.shapeSorter.schedule();
                            if (onEndAnim !== null) {
                                onEndAnim();
                            }
                        });
                    });
                },
                applyTransformToShapeId(shapeId, rotation, flipH, flipV) {
                    const shapeElem = document.getElementById('tioc-shape-id-' + shapeId);
                    this.game.applyTransformToElement(shapeElem, rotation, flipH, flipV);
                },
                moveAndTransformShapeToBoat(playerId, shape) {
                    this.game.addKnownShape(shape);
                    // Note: does not create the shape, there are no use case
                    const playerBoatElemId = 'tioc-player-boat-' + playerId;
                    const shapeElem = document.getElementById('tioc-shape-id-' + shape.shapeId);
                    // If the shape is already on the boat, the player placed it
                    // so don't move it
                    if (shapeElem.closest('#' + playerBoatElemId) !== null) {
                        return;
                    }
                    this.moveShapeToBoat(
                        playerId,
                        shape.shapeId,
                        shape.boatTopX,
                        shape.boatTopY,
                        () => {
                            this.applyTransformToShapeId(
                                shape.shapeId,
                                shape.boatRotation,
                                shape.boatHorizontalFlip,
                                shape.boatVerticalFlip
                            );
                            if (shape.shapeTypeId == this.game.SHAPE_TYPE_ID_OSHAX) {
                                this.placeColorIdOnShapeId(shape.shapeId, shape.colorId);
                            }
                        });
                },
                placeColorIdOnShapeId(shapeId, colorId) {
                    if (colorId === null) {
                        return;
                    }
                    const shapeElemId = 'tioc-shape-id-' + shapeId;
                    dojo.place(this.game.format_block('jstpl_meeple_cat', {
                            color_name: this.game.CAT_COLOR_NAMES[colorId],
                        }),
                        shapeElemId
                    );
                    this.updatePlayerPanelShapeCount();
                    this.game.updateTooltips();
                },
                markGridUsed(shapeId, x, y, tryShape = false) {
                    const boatGridUsed = tryShape ? this.clientTryShapeBoatGridUsed : this.clientPlayerBoatGridUsed;
                    const shapeGridUsed = tryShape ? this.clientTryShapeShapeGridUsed : this.clientPlayerShapeGridUsed;
                    boatGridUsed[x][y] = true;
                    if (!(shapeId in shapeGridUsed)) {
                        shapeGridUsed[shapeId] = [];
                    }
                    shapeGridUsed[shapeId].push({ x: x, y: y });
                    this.updateCurrentPlayerTooltips();
                },
                markGridUnused(shapeId, tryShape = false) {
                    let boatGridUsed = null;
                    let shapeGridUsed = null;
                    if (tryShape) {
                        boatGridUsed = this.clientTryShapeBoatGridUsed;
                        shapeGridUsed = this.clientTryShapeShapeGridUsed;
                    } else {
                        if (shapeId in this.clientPlayerShapeGridUsed) {
                            boatGridUsed = this.clientPlayerBoatGridUsed;
                            shapeGridUsed = this.clientPlayerShapeGridUsed;
                        } else {
                            boatGridUsed = this.serverBoatGridUsed[this.game.player_id];
                            shapeGridUsed = this.serverPlayerShapeGridUsed[this.game.player_id];
                        }
                    }
                    for (const grid of shapeGridUsed[shapeId]) {
                        boatGridUsed[grid.x][grid.y] = false;
                    }
                    const usedGrid = shapeGridUsed[shapeId];
                    delete shapeGridUsed[shapeId];
                    this.updateCurrentPlayerTooltips();
                    return usedGrid;
                },
                isGridValidAndEmpty(x, y) {
                    if (x < 0 || x >= this.BOAT_TILE_WIDTH) {
                        return false;
                    }
                    const minY = (this.BOAT_TILE_HEIGHT - this.BOAT_TILE_HEIGHT_PER_COLUMN[x]) / 2;
                    const maxY = minY + this.BOAT_TILE_HEIGHT_PER_COLUMN[x];
                    if (y < minY || y >= maxY) {
                        return false;
                    }
                    if (this.clientTryShapeBoatGridUsed[x][y]) {
                        return false;
                    }
                    if (this.clientPlayerBoatGridUsed[x][y]) {
                        return false;
                    }
                    if (this.serverBoatGridUsed[this.game.player_id][x][y]) {
                        return false;
                    }
                    return true;
                },
                isGridEmpty(x, y) {
                    if (x < 0 || x >= this.BOAT_TILE_WIDTH) {
                        return true;
                    }
                    const minY = (this.BOAT_TILE_HEIGHT - this.BOAT_TILE_HEIGHT_PER_COLUMN[x]) / 2;
                    const maxY = minY + this.BOAT_TILE_HEIGHT_PER_COLUMN[x];
                    if (y < minY || y >= maxY) {
                        return true;
                    }
                    if (this.clientTryShapeBoatGridUsed[x][y]) {
                        return false;
                    }
                    if (this.clientPlayerBoatGridUsed[x][y]) {
                        return false;
                    }
                    if (this.serverBoatGridUsed[this.game.player_id][x][y]) {
                        return false;
                    }
                    return true;
                },
                isPlayerGridEmpty(playerId, x, y) {
                    if (playerId == this.game.player_id) {
                        return this.isGridEmpty(x, y);
                    }
                    if (x < 0 || x >= this.BOAT_TILE_WIDTH) {
                        return true;
                    }
                    const minY = (this.BOAT_TILE_HEIGHT - this.BOAT_TILE_HEIGHT_PER_COLUMN[x]) / 2;
                    const maxY = minY + this.BOAT_TILE_HEIGHT_PER_COLUMN[x];
                    if (y < minY || y >= maxY) {
                        return true;
                    }
                    return !this.serverBoatGridUsed[playerId][x][y];
                },
                isBoatEmpty() {
                    return this.clientTryShapeBoatGridUsed.every((row) => row.every((cell) => !cell)) &&
                        this.clientPlayerBoatGridUsed.every((row) => row.every((cell) => !cell)) &&
                        this.serverBoatGridUsed[this.game.player_id].every((row) => row.every((cell) => !cell));
                },
                isPlayerBoatEmpty(playerId) {
                    const shapes = document.querySelectorAll('#tioc-player-boat-' + playerId + ' .tioc-shape');
                    for (const shape of shapes) {
                        if (shape.classList.contains('tioc-hidden') ||
                            shape.classList.contains('tioc-animate-to-hidden-end')) {
                            continue;
                        }
                        return false;
                    }
                    return true;
                },
                gridMapMatchesColor(x, y, colorName) {
                    if (colorName === null || colorName.length == 0) {
                        return false;
                    }
                    const grid = this.BOAT_MAP_PLACEMENT[this.playerBoatColorName[this.game.player_id]][colorName];
                    return (grid.x == x && grid.y == y);
                },
                countOshax() {
                    const shapes = document.querySelectorAll('#tioc-player-boat-' + this.game.player_id + ' .tioc-shape.shape-type-' + this.game.SHAPE_TYPE_ID_OSHAX);
                    return shapes.length;
                },
                countUniqueColorNoOshax() {
                    const shapes = document.querySelectorAll('#tioc-player-boat-' + this.game.player_id + ' .tioc-shape');
                    const countSet = new Set();
                    for (let shape of shapes) {
                        const shapeId = shape.dataset.shapeId;
                        const shapeTypeId = this.game.getShapeTypeIdFromShapeId(shapeId);
                        if (shapeTypeId == this.game.SHAPE_TYPE_ID_CAT || shapeTypeId == this.game.SHAPE_TYPE_ID_OSHAX) {
                            countSet.add(this.game.getCurrentColorFromShapeId(shapeId));
                        }
                    }
                    return countSet.size;
                },
                countRareTreasure() {
                    const shapes = document.querySelectorAll('#tioc-player-boat-' + this.game.player_id + ' .tioc-shape.shape-type-' + this.game.SHAPE_TYPE_ID_RARE_TREASURE);
                    return shapes.length;
                },
                countCommonTreasure() {
                    const shapes = document.querySelectorAll('#tioc-player-boat-' + this.game.player_id + ' .tioc-shape.shape-type-' + this.game.SHAPE_TYPE_ID_COMMON_TREASURE);
                    return shapes.length;
                },
                countMostCommonColor() {
                    const shapes = document.querySelectorAll('#tioc-player-boat-' + this.game.player_id + ' .tioc-shape');
                    const colorCount = {};
                    for (const colorName of this.game.CAT_COLOR_NAMES) {
                        colorCount[colorName] = 0;
                    }
                    for (let shape of shapes) {
                        const shapeId = shape.dataset.shapeId;
                        const shapeTypeId = this.game.getShapeTypeIdFromShapeId(shapeId);
                        let color = '';
                        if (shapeTypeId == this.game.SHAPE_TYPE_ID_CAT) {
                            color = this.game.getShapeColorFromShapeId(shapeId);
                        } else if (shapeTypeId == this.game.SHAPE_TYPE_ID_OSHAX) {
                            const meepleElem = shape.querySelector('.tioc-meeple.cat');
                            for (const colorName of this.game.CAT_COLOR_NAMES) {
                                if (meepleElem.classList.contains(colorName)) {
                                    color = colorName;
                                    break;
                                }
                            }
                        }
                        if (color.length > 0) {
                            colorCount[color] += 1;
                        }
                    }
                    return Math.max.apply(null, Object.values(colorCount));
                },
                allowSelectTreasure(onSelectFct) {
                    const addOnClick = (shape) => {
                        const shapeId = shape.dataset.shapeId;
                        let shapeGridUsed = null;
                        if (shapeId in this.clientPlayerShapeGridUsed) {
                            shapeGridUsed = this.clientPlayerShapeGridUsed;
                        } else if (shapeId in this.serverPlayerShapeGridUsed[this.game.player_id]) {
                            shapeGridUsed = this.serverPlayerShapeGridUsed[this.game.player_id];
                        }
                        if (shapeGridUsed === null) {
                            return;
                        }
                        shape.classList.add('tioc-clickable');
                        for (const grid of shapeGridUsed[shapeId]) {
                            const gridElem = document.querySelector('#tioc-player-boat-' + this.game.player_id + ' .tioc-grid.x_' + grid.x + '_y_' + grid.y);
                            this.game.addOnClick(gridElem, () => {
                                this.removeAllBoatClickable();
                                onSelectFct(shapeId)
                            });
                            gridElem.classList.add('tioc-clickable-no-border');
                        }
                    };
                    let shapes = document.querySelectorAll('#tioc-player-boat-' + this.game.player_id + ' .tioc-shape.shape-type-' + this.game.SHAPE_TYPE_ID_COMMON_TREASURE);
                    for (const shape of shapes) {
                        addOnClick(shape);
                    }
                    shapes = document.querySelectorAll('#tioc-player-boat-' + this.game.player_id + ' .tioc-shape.shape-type-' + this.game.SHAPE_TYPE_ID_RARE_TREASURE);
                    for (const shape of shapes) {
                        addOnClick(shape);
                    }
                },
                useShape(shapeId) {
                    const shapeElemId = 'tioc-shape-id-' + shapeId;
                    dojo.addClass(shapeElemId, 'tioc-animate-to-hidden-start');
                    setTimeout(() => {
                        window.tiocWrap('useShape_setTimeout', () => {
                            dojo.addClass(shapeElemId, 'tioc-animate-to-hidden-end');
                        });
                    }, 1);
                    return this.markGridUnused(shapeId);
                },
                unuseShape(shapeId, usedGrid) {
                    if (shapeId === null) {
                        return;
                    }
                    const shapeElemId = 'tioc-shape-id-' + shapeId;
                    dojo.removeClass(shapeElemId, 'tioc-animate-to-hidden-start');
                    dojo.removeClass(shapeElemId, 'tioc-animate-to-hidden-end');
                    for (const grid of usedGrid) {
                        this.markGridUsed(shapeId, grid.x, grid.y);
                    }
                },
                updatePlayerPanelBoat(boatUsedGridColor) {
                    const panelBoatGridElems = document.querySelectorAll('.tioc-player-panel-boat-container .tioc-grid');
                    for (const gridElem of panelBoatGridElems) {
                        gridElem.classList.remove('colorless');
                        for (const colorName of this.game.CAT_COLOR_NAMES) {
                            gridElem.classList.remove(colorName);
                        }
                    }
                    this.clearBoatGridUsed(this.clientPlayerBoatGridUsed);
                    this.clientPlayerShapeGridUsed = {};
                    for (const playerId in this.serverBoatGridUsed) {
                        this.clearBoatGridUsed(this.serverBoatGridUsed[playerId]);
                        this.serverPlayerShapeGridUsed[playerId] = {};
                    }
                    const boatGridElems = document.querySelectorAll('.tioc-player-boat .tioc-grid');
                    for (const gridElem of boatGridElems) {
                        this.game.removeTooltip(gridElem.id);
                    }
                    for (const playerId in boatUsedGridColor) {
                        for (const gridColor of boatUsedGridColor[playerId]) {
                            const x = gridColor.x;
                            const y = gridColor.y;
                            this.serverBoatGridUsed[playerId][x][y] = true;
                            if (!(gridColor.shapeId in this.serverPlayerShapeGridUsed[playerId])) {
                                this.serverPlayerShapeGridUsed[playerId][gridColor.shapeId] = [];
                            }
                            this.serverPlayerShapeGridUsed[playerId][gridColor.shapeId].push({ x: x, y: y });
                            const colorId = gridColor.colorId;
                            const gridElem = document.querySelector('#tioc-player-panel-boat-container-' + playerId + ' .tioc-grid.x_' + x + '_y_' + y);
                            const shape = document.getElementById('tioc-shape-id-' + gridColor.shapeId);
                            const boatGridElem = document.querySelector('#tioc-player-boat-' + playerId + ' .tioc-grid.x_' + x + '_y_' + y);
                            this.game.updateShapeElementTooltip(shape, boatGridElem.id);
                            if (colorId === null) {
                                gridElem.classList.add('colorless');
                            } else {
                                gridElem.classList.add(this.game.CAT_COLOR_NAMES[colorId]);
                            }
                        }
                    }
                    this.updatePlayerPanelShapeCount();
                    this.updateGridOverlay();
                },
                updatePlayerPanelShapeCount() {
                    for (const playerId in this.playerShapeColorCounter) {
                        const shapes = document.querySelectorAll('#tioc-player-boat-' + playerId + ' .tioc-shape');
                        for (const colorCounter of this.SHAPE_COLOR_COUNTERS) {
                            let count = 0;
                            for (const shape of shapes) {
                                if (shape.classList.contains('tioc-hidden') || shape.classList.contains('tioc-animate-to-hidden-start')) {
                                    continue;
                                }
                                if (this.game.getCurrentColorFromShapeId(shape.dataset.shapeId) == colorCounter) {
                                    ++count;
                                }
                                switch (colorCounter) {
                                    case 'common':
                                        if (this.game.getShapeTypeIdFromShapeId(shape.dataset.shapeId) == this.game.SHAPE_TYPE_ID_COMMON_TREASURE) {
                                            ++count;
                                        }
                                        break;
                                    case 'rare':
                                        if (this.game.getShapeTypeIdFromShapeId(shape.dataset.shapeId) == this.game.SHAPE_TYPE_ID_RARE_TREASURE) {
                                            ++count;
                                        }
                                        break;
                                    case 'oshax':
                                        if (this.game.getShapeTypeIdFromShapeId(shape.dataset.shapeId) == this.game.SHAPE_TYPE_ID_OSHAX) {
                                            ++count;
                                        }
                                        break;
                                }
                            }
                            this.playerShapeColorCounter[playerId][colorCounter].toValue(count);
                        }
                    }
                },
                updateCurrentPlayerTooltips() {
                    const boatGridElems = document.querySelectorAll('#tioc-player-boat-' + this.game.player_id + ' .tioc-grid');
                    for (const gridElem of boatGridElems) {
                        this.game.removeTooltip(gridElem.id);
                    }
                    if (document.getElementById('tioc-shape-controls') !== null) {
                        return;
                    }
                    const update = (shapeGridUsed) => {
                        for (const shapeId in shapeGridUsed) {
                            for (const grid of shapeGridUsed[shapeId]) {
                                const shape = document.getElementById('tioc-shape-id-' + shapeId);
                                if (shape === null) {
                                    continue;
                                }
                                const boatGridElem = document.querySelector('#tioc-player-boat-' + this.game.player_id + ' .tioc-grid.x_' + grid.x + '_y_' + grid.y);
                                this.game.updateShapeElementTooltip(shape, boatGridElem.id);
                            }
                        }
                    };
                    update(this.clientTryShapeShapeGridUsed);
                    update(this.clientPlayerShapeGridUsed);
                    update(this.serverPlayerShapeGridUsed[this.game.player_id]);
                },
                showScoreBoatPosition(playerId, scoreBoatPosition) {
                    for (const pos of scoreBoatPosition) {
                        const gridElem = document.querySelector('#tioc-player-boat-' + playerId + ' .tioc-grid.x_' + pos.x + '_y_' + pos.y);
                        this.game.displayBigScore(gridElem, playerId, pos.score);
                    }
                },
                updateShapesPlayedMove(lastSeenMoveNumber) {
                    const newClass = 'tioc-shape-new-to-player';
                    const shapes = document.querySelectorAll('.tioc-player-boat .tioc-shape');
                    for (const shape of shapes) {
                        const shapeMove = this.game.getPlayedMoveNumberFromShapeId(shape.dataset.shapeId);
                        if (!shapeMove || shapeMove <= lastSeenMoveNumber) {
                            shape.classList.remove(newClass);
                        } else {
                            shape.classList.add(newClass);
                        }
                    }
                },
            }
        );
    }
);