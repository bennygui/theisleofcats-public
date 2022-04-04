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
            'tioc.BasketMgr',
            null, {
                game: null,

                players: null,
                playerPanelPermanentCounter: {},
                playerPanelRemainCounter: {},
                playBasketsAllowed: false,
                nextNewBasketId: 10000,

                constructor(game) {
                    this.game = game;
                },
                setup(gamedatas) {
                    this.players = gamedatas.players;
                    for (const playerId in gamedatas.players) {
                        this.playerPanelPermanentCounter[playerId] = new ebg.counter();
                        this.playerPanelPermanentCounter[playerId].create('tioc-player-panel-basket-permanent-counter-' + playerId);

                        this.playerPanelRemainCounter[playerId] = new ebg.counter();
                        this.playerPanelRemainCounter[playerId].create('tioc-player-panel-basket-remain-counter-' + playerId);
                    }
                    for (let basket of gamedatas.baskets) {
                        this.createAndPlaceBasket(basket);
                    }
                    this.updatePlayerPanelBasketCount();
                },
                createAndPlaceBasket(basket) {
                    this.createBasketElement(basket.basketId, basket.used, '#tioc-player-board-' + basket.playerId + ' .tioc-player-permanent-basket-container');
                    this.updatePlayerPanelBasketCount();
                },
                createBasketElement(basketId, used, locationSelector, replace = false) {
                    let locationElem = document.querySelector(locationSelector);
                    return dojo.place(this.game.format_block('jstpl_basket', {
                        basket_id: basketId,
                        used_class: used ? 'used' : '',
                        used_bool: used,
                    }), locationElem, (replace ? 'replace' : 'last'));
                },
                allowPlayBaskets() {
                    this.playBasketsAllowed = true;
                    let baskets = document.querySelectorAll('#tioc-player-board-' + this.game.player_id + ' .tioc-player-permanent-basket-container .tioc-basket');
                    for (let basket of baskets) {
                        if (basket.dataset.basketUsed == 'true' || basket.classList.contains('used')) {
                            this.game.removeClickableId(basket.id);
                        } else {
                            this.game.addOnClick(basket, () => this.game.actionMgr.playBasket(basket.dataset.basketId));
                        }
                    }
                },
                disallowPlayBaskets() {
                    this.playBasketsAllowed = false;
                    let baskets = document.querySelectorAll('#tioc-player-board-' + this.game.player_id + ' .tioc-player-permanent-basket-container .tioc-basket');
                    for (let basket of baskets) {
                        this.game.removeClickableId(basket.id);
                    }
                },
                useBasket(basketId) {
                    const basketElemId = 'tioc-basket-id-' + basketId;
                    const basketElem = document.getElementById(basketElemId);
                    basketElem.classList.add('used');
                    basketElem.dataset.basketUsed = 'true';
                    this.updatePlayerPanelBasketCount();
                },
                unuseBasket(basketId) {
                    const basketElemId = 'tioc-basket-id-' + basketId;
                    const basketElem = document.getElementById(basketElemId);
                    basketElem.classList.remove('used');
                    basketElem.dataset.basketUsed = 'false';
                    this.updatePlayerPanelBasketCount();
                },
                isBasketUsed(basketId) {
                    const basketElemId = 'tioc-basket-id-' + basketId;
                    const basketElem = document.getElementById(basketElemId);
                    return (basketElem.dataset.basketUsed == 'true');
                },
                allowSelectAllBaskets(onSelectFct) {
                    const baskets = document.querySelectorAll('#tioc-player-board-' + this.game.player_id + ' .tioc-player-permanent-basket-container .tioc-basket');
                    for (const basket of baskets) {
                        this.game.addOnClick(basket, () => {
                            this.disallowSelectAllBaskets();
                            onSelectFct(basket.dataset.basketId);
                        });
                    }
                },
                disallowSelectAllBaskets() {
                    const baskets = document.querySelectorAll('#tioc-player-board-' + this.game.player_id + ' .tioc-player-permanent-basket-container .tioc-basket');
                    for (const basket of baskets) {
                        this.game.removeClickable(basket);
                    }
                    if (this.game.gamedatas.gamestate.name == 'STATE_PHASE_4_RESCUE_CAT') {
                        this.game.basketMgr.allowPlayBaskets();
                    }
                },
                discardBasket(basketId) {
                    const basketElemId = 'tioc-basket-id-' + basketId;
                    dojo.addClass(basketElemId, 'tioc-animate-to-hidden-start');
                    setTimeout(() => {
                        window.tiocWrap('discardBasket_setTimeout', () => {
                            dojo.addClass(basketElemId, 'tioc-animate-to-hidden-end');
                            this.updatePlayerPanelBasketCount();
                        });
                    }, 1);
                },
                undoDiscardBasket(basketId) {
                    const basketElemId = 'tioc-basket-id-' + basketId;
                    dojo.removeClass(basketElemId, 'tioc-animate-to-hidden-start');
                    dojo.removeClass(basketElemId, 'tioc-animate-to-hidden-end');
                    this.updatePlayerPanelBasketCount();
                },
                createNewBasket(newBasketId = null) {
                    if (newBasketId === null) {
                        newBasketId = this.nextNewBasketId++;
                    }
                    this.createBasketElement(newBasketId, false, '#tioc-player-board-' + this.game.player_id + ' .tioc-player-permanent-basket-container');
                    if (this.playBasketsAllowed) {
                        this.disallowPlayBaskets();
                        this.allowPlayBaskets();
                    }
                    this.updatePlayerPanelBasketCount();
                    return newBasketId;
                },
                destroyBasket(basketId) {
                    const basketElemId = 'tioc-basket-id-' + basketId;
                    this.game.tiocFadeOutAndDestroy(basketElemId, null, () => {
                        this.updatePlayerPanelBasketCount();
                    });
                },
                moveAndDiscardBasketId(basketId) {
                    const basketElemId = 'tioc-basket-id-' + basketId;
                    const basketElem = document.getElementById(basketElemId);
                    basketElem.classList.add('tioc-moving');
                    const destinationId = 'tioc-island-discard';
                    this.game.slide(basketElemId, destinationId).then(() => {
                        window.tiocWrap('moveAndDiscardBasketId_onEnd', () => {
                            this.game.tiocFadeOutAndDestroy(basketElemId, 1000);
                            this.updatePlayerPanelBasketCount();
                        });
                    });
                },
                createOrReplaceBasket(playerId, tmpBasketId, realBasketId) {
                    const tmpBasketElemId = 'tioc-basket-id-' + tmpBasketId;
                    let replace = false;
                    let insertElemId = '#tioc-player-board-' + playerId + ' .tioc-player-permanent-basket-container';
                    if (document.getElementById(tmpBasketElemId) !== null) {
                        replace = true;
                        insertElemId = '#' + tmpBasketElemId;
                    }
                    this.createBasketElement(realBasketId, false, insertElemId, replace);
                    if (this.playBasketsAllowed) {
                        this.disallowPlayBaskets();
                        this.allowPlayBaskets();
                    }
                    this.updatePlayerPanelBasketCount();
                },
                updatePlayerPanelBasketCount() {
                    for (const playerId in this.players) {
                        const baskets = document.querySelectorAll('#tioc-player-board-' + playerId + ' .tioc-player-permanent-basket-container .tioc-basket');

                        let nbPermanent = 0;
                        let nbRemain = Math.floor(this.game.cardMgr.countPlayerBasketFromCards(playerId));
                        for (const basket of baskets) {
                            if (!basket.classList.contains('tioc-hidden') &&
                                !basket.classList.contains('tioc-animate-to-hidden-end')) {
                                ++nbPermanent;
                                if (!this.isBasketUsed(basket.dataset.basketId)) {
                                    ++nbRemain;
                                }
                            }
                        }
                        this.playerPanelPermanentCounter[playerId].toValue(nbPermanent);
                        this.playerPanelRemainCounter[playerId].toValue(nbRemain);
                    }
                    this.game.addTooltipToClass(
                        'tioc-basket',
                        _('Permanent basket. Grayed out when used on this day.'),
                        ''
                    );
                },
                getCurrentPlayerRemainBasketCount() {
                    return (this.playerPanelRemainCounter[this.game.player_id].getValue());
                },
            }
        );
    }
);