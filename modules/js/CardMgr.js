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
        g_gamethemeurl + "modules/js/ElementSorter.js",
    ],
    (dojo, declare) => {
        return declare(
            'tioc.CardMgr',
            null, {
                game: null,

                CARD_WIDTH: 150,
                CARD_HEIGHT: 210,

                CARD_LOCATION_ID_DECK: 0,
                CARD_LOCATION_ID_PLAYER_DRAFT: 1,
                CARD_LOCATION_ID_PLAYER_BUY: 2,
                CARD_LOCATION_ID_PLAYER_HAND: 3,
                CARD_LOCATION_ID_TABLE: 4,
                CARD_LOCATION_ID_DISCARD: 5,
                CARD_LOCATION_ID_DISCARD_PLAYED: 6,

                CARD_TYPE_ID_OSHAX: 0,
                CARD_TYPE_ID_RESCUE: 1,
                CARD_TYPE_ID_ANYTIME: 2,
                CARD_TYPE_ID_TREASURE: 3,
                CARD_TYPE_ID_PRIVATE_LESSON: 4,
                CARD_TYPE_ID_PUBLIC_LESSON: 5,
                CARD_TYPE_ID_SOLO_COLOR: 6,
                CARD_TYPE_ID_SOLO_BASKET: 7,
                CARD_TYPE_ID_SOLO_LESSON: 8,

                CARD_BASKET_TYPE_ID_HALF: 0,
                CARD_BASKET_TYPE_ID_FULL: 1,

                CARD_TREASURE_TYPE_ID_ONE_RARE_TWO_COMMON: 0,
                CARD_TREASURE_TYPE_ID_TWO_SMALL_TWO_COMMON: 1,

                ACTION_TYPE_ID_ANYTIME_PREF: 10,

                CARD_ID_BACK_SOLO_BASKET: 999,
                CARD_ID_BACK_REGULAR: 998,

                playerPanelPrivateLessonCounter: {},
                playerHandCardCounter: {},
                tableRescueCardsCounter: {},
                cardsCreationInfo: {},
                usedCardIds: new Set(),
                playerDefaultAnytimePref: null,
                playerAnytimePref: null,
                backNextId: 0,

                constructor(game) {
                    this.game = game;
                },
                setup(gamedatas) {
                    this.cardsCreationInfo[this.CARD_ID_BACK_SOLO_BASKET] = {
                        cardId: this.CARD_ID_BACK_SOLO_BASKET,
                        cardLocationId: null,
                        deckOrder: null,
                        playerId: null,
                        colorId: null,
                        playerPrivate: null,
                        cardTypeId: null,
                        price: null,
                        needsBuyColor: null,
                        speed: null,
                        cardBasketTypeId: null,
                        cardTreasureTypeId: null,
                        cardAnytimeTypeId: null,
                        isCardAnytimeServerSide: null,
                        isCardAnytimeBuyPhase: null,
                        playedMoveNumber: null,
                        soloBasketCount: null,
                    };
                    this.cardsCreationInfo[this.CARD_ID_BACK_REGULAR] = {
                        cardId: this.CARD_ID_BACK_REGULAR,
                        cardLocationId: null,
                        deckOrder: null,
                        playerId: null,
                        colorId: null,
                        playerPrivate: null,
                        cardTypeId: null,
                        price: null,
                        needsBuyColor: null,
                        speed: null,
                        cardBasketTypeId: null,
                        cardTreasureTypeId: null,
                        cardAnytimeTypeId: null,
                        isCardAnytimeServerSide: null,
                        isCardAnytimeBuyPhase: null,
                        playedMoveNumber: null,
                        soloBasketCount: null,
                    };
                    this.playerDefaultAnytimePref = gamedatas.playerDefaultAnytimePref;
                    this.playerAnytimePref = gamedatas.playerAnytimePref;

                    for (let playerId in gamedatas.players) {
                        this.playerPanelPrivateLessonCounter[playerId] = new ebg.counter();
                        this.playerPanelPrivateLessonCounter[playerId].create('tioc-player-panel-private-lesson-counter-' + playerId);
                        this.playerPanelPrivateLessonCounter[playerId].setValue(gamedatas.privateLessonsCount[playerId]);

                        this.playerHandCardCounter[playerId] = new ebg.counter();
                        this.playerHandCardCounter[playerId].create('tioc-player-panel-card-counter-' + playerId);
                        this.playerHandCardCounter[playerId].setValue(gamedatas.handCardCount[playerId]);

                        this.tableRescueCardsCounter[playerId] = new ebg.counter();
                        this.tableRescueCardsCounter[playerId].create('tioc-player-panel-table-card-counter-' + playerId);
                        this.tableRescueCardsCounter[playerId].setValue(gamedatas.tableRescueCardsCount[playerId]);
                        this.setHandCountToPlayer(playerId, gamedatas.handCardCount[playerId], gamedatas.tableRescueCardsCount[playerId]);
                    }
                    gamedatas.cards.sort((c1, c2) => {
                        let p1 = c1.playedMoveNumber;
                        if (!p1) {
                            p1 = 0;
                        }
                        let p2 = c2.playedMoveNumber;
                        if (!p2) {
                            p2 = 0;
                        }
                        let p = (p1 - p2);
                        if (p != 0) {
                            return p;
                        }
                        return c1.cardId - c2.cardId;
                    });
                    for (let card of gamedatas.cards) {
                        if (card.cardLocationId == this.CARD_LOCATION_ID_DISCARD_PLAYED) {
                            this.addDiscardPlayedCard(card);
                        } else {
                            this.createAndPlaceCard(card);
                        }
                    }
                    this.game.playerPreferenceMgr.registerObserver('CardMgr', () => {
                        this.updateCurrentPlayerCard();
                    })
                },
                schedule() {
                    this.game.cardTitleWrap.schedule();
                },
                updatePlayerAnytimePref(playerAnytimePref) {
                    this.playerAnytimePref = playerAnytimePref;
                },
                setPrivateLessonCountToPlayer(playerId, privateLessonCount) {
                    this.playerPanelPrivateLessonCounter[playerId].toValue(privateLessonCount);
                },
                setHandCountToPlayer(playerId, handCount, tableRescueCardsCount) {
                    this.playerHandCardCounter[playerId].toValue(handCount);
                    this.tableRescueCardsCounter[playerId].toValue(tableRescueCardsCount);
                    const locationId = 'tioc-player-card-table-container-' + playerId;
                    const cards = document.querySelectorAll('#tioc-player-card-table-container-' + playerId + ' .tioc-card');
                    if (cards.length == 0 && tableRescueCardsCount > 0) {
                        for (let i = 0; i < tableRescueCardsCount; ++i) {
                            this.createCardElement(this.CARD_ID_BACK_REGULAR, locationId);
                        }
                    } else {
                        for (const card of cards) {
                            if (card.dataset.cardId == this.CARD_ID_BACK_REGULAR) {
                                card.remove();
                            }
                        }
                    }
                },
                createAndPlaceCard(card, locationElementId = null) {
                    this.cardsCreationInfo[card.cardId] = card;
                    this.createCardElement(
                        card.cardId,
                        locationElementId != null ?
                        locationElementId :
                        this.getElemIdForCardLocationId(card.playerId, card.cardLocationId, card.cardId)
                    );
                    this.addColorToCardId(card.cardId, card.colorId);
                    this.game.basketMgr.updatePlayerPanelBasketCount();
                    this.updateCurrentPlayerCard();
                    this.schedule();
                },
                createOrMoveCards(cards) {
                    for (let card of cards) {
                        if (document.getElementById('tioc-card-id-' + card.cardId) === null) {
                            this.createAndPlaceCard(card);
                        } else {
                            this.moveToLocation(card.playerId, card.cardLocationId, [card.cardId]);
                        }
                    }
                },
                playAndDiscard(playerId, cards) {
                    const destinationElemId = 'tioc-island-discard';
                    for (const card of cards) {
                        const cardElemId = 'tioc-card-id-' + card.cardId;
                        let cardElem = document.getElementById(cardElemId);
                        // Card already hidden for player, destroy it
                        if (cardElem !== null && cardElem.classList.contains('tioc-animate-to-hidden-start')) {
                            dojo.destroy(cardElem);
                            this.addDiscardPlayedCard(card);
                            continue;
                        }
                        if (cardElem === null) {
                            // Create the card if not know to player
                            this.createAndPlaceCard(card, 'player_board_' + playerId);
                        }
                        cardElem = document.getElementById(cardElemId);
                        cardElem.id += '-discard';
                        cardElem.classList.add('tioc-moving');
                        this.game.slide(cardElem.id, destinationElemId).then(() => {
                            window.tiocWrap('playAndDiscard_onEnd', () => {
                                this.game.tiocFadeOutAndDestroy(cardElem.id, 2000);
                                this.schedule();
                            });
                        });
                        this.game.basketMgr.updatePlayerPanelBasketCount();
                        this.updateCurrentPlayerCard();
                        this.addDiscardPlayedCard(card);
                    }
                    this.schedule();
                },
                addDiscardPlayedCard(card) {
                    this.createAndPlaceCard(card);
                    const cardElemId = 'tioc-card-id-' + card.cardId;
                    const cardElem = document.getElementById(cardElemId);
                    const cardParentElem = cardElem.parentElement;
                    cardElem.remove();
                    const lastDiscardPlayedText = cardParentElem.querySelector('.tioc-discard-played-text');
                    const cardContainer = dojo.place(this.game.format_block('jstpl_discard_played_card', {
                        card_html: cardElem.outerHTML,
                        player_color: this.game.playerColor[card.playerId],
                        player_name: this.game.playerName[card.playerId],
                        move_number: card.playedMoveNumber,
                    }), cardParentElem, 'first');
                    if (lastDiscardPlayedText !== null && lastDiscardPlayedText.dataset.moveNumber == card.playedMoveNumber) {
                        const newDiscardPlayedText = cardParentElem.querySelector('.tioc-discard-played-text');
                        newDiscardPlayedText.style.borderTopRightRadius = 0;
                        newDiscardPlayedText.style.borderBottomRightRadius = 0;
                        newDiscardPlayedText.style.marginRight = 0;
                        lastDiscardPlayedText.style.borderTopLeftRadius = 0;
                        lastDiscardPlayedText.style.borderBottomLeftRadius = 0;
                        lastDiscardPlayedText.style.marginLeft = 0;
                    }
                    this.game.updateTooltips();
                },
                discardSecretCardIds(cardIds) {
                    for (const cardId of cardIds) {
                        const cardElemId = 'tioc-card-id-' + cardId;
                        const cardElem = document.getElementById(cardElemId);
                        if (cardElem === null) {
                            continue;
                        }
                        // Card already hidden for player, destroy it
                        if (cardElem.classList.contains('tioc-animate-to-hidden-start')) {
                            dojo.destroy(cardElem);
                            continue;
                        }
                        cardElem.id += '-discard';
                        this.game.tiocFadeOutAndDestroy(cardElem.id, 1000, () => {
                            this.game.basketMgr.updatePlayerPanelBasketCount();
                            this.updateCurrentPlayerCard();
                            this.schedule();
                        });
                    }
                    this.schedule();
                },
                createCardElement(cardId, locationElementId) {
                    const locationElem = document.getElementById(locationElementId);
                    const card = dojo.place(this.game.format_block('jstpl_card', {
                        card_id: cardId,
                    }), locationElem);
                    if (cardId == this.CARD_ID_BACK_SOLO_BASKET || cardId == this.CARD_ID_BACK_REGULAR) {
                        ++this.backNextId;
                        card.id = 'card-id-solo-back-' + this.backNextId;
                    }
                    this.schedule();
                    this.game.updateTooltips();
                    return card;
                },
                allowSelectDraftCards() {
                    const cards = document.querySelectorAll('#tioc-player-card-draft-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        this.game.allowSelect(card);
                    }
                },
                disallowSelectDraftCards() {
                    const cards = document.querySelectorAll('#tioc-player-card-draft-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        this.game.removeClickableId(card);
                    }
                },
                allowSelectHandRescueCards() {
                    const cards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) == this.CARD_TYPE_ID_RESCUE) {
                            this.game.allowSelect(card);
                        }
                    }
                },
                allowBuyCards() {
                    const cards = document.querySelectorAll('#tioc-player-card-buy-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        this.game.addOnClick(card, () => this.game.actionMgr.buyCard(card.dataset.cardId));
                    }
                },
                allowUnbuyCards() {
                    const cards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card.tioc-card-buy');
                    for (const card of cards) {
                        this.game.addOnClick(card, () => this.game.actionMgr.unbuyCard(card.dataset.cardId));
                    }
                },
                allowPlayRescueCards() {
                    const tableRescueCards = document.querySelectorAll('#tioc-player-card-table-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of tableRescueCards) {
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) != this.CARD_TYPE_ID_RESCUE) {
                            continue;
                        }
                        this.game.addOnClick(card, () => this.game.actionMgr.playRescueCard(card.dataset.cardId));
                    }
                    const handRescueCards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of handRescueCards) {
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) != this.CARD_TYPE_ID_RESCUE) {
                            continue;
                        }
                        this.game.addOnClick(card, () => {
                            this.game.showMessage(_('You cannot play rescue cards from your hand'), 'error');
                        });
                        card.classList.remove('tioc-clickable');
                    }
                },
                disallowPlayRescueCards() {
                    const tableRescueCards = document.querySelectorAll('#tioc-player-card-table-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of tableRescueCards) {
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) != this.CARD_TYPE_ID_RESCUE) {
                            continue;
                        }
                        this.game.removeClickable(card);
                    }
                    const handRescueCards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of handRescueCards) {
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) != this.CARD_TYPE_ID_RESCUE) {
                            continue;
                        }
                        this.game.removeClickable(card);
                    }
                },
                allowPlayRareFindsCards() {
                    const cards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) == this.CARD_TYPE_ID_OSHAX) {
                            this.game.addOnClick(card, () => this.game.actionMgr.playOshaxCard(card.dataset.cardId));
                        } else if (this.getCardTypeIdFromCardId(card.dataset.cardId) == this.CARD_TYPE_ID_TREASURE) {
                            this.game.addOnClick(card, () => this.game.actionMgr.playTreasureCard(card.dataset.cardId));
                        }
                    }
                },
                allowPlayAllAnytimeCards(canPlayCardFct = null) {
                    const cards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) != this.CARD_TYPE_ID_ANYTIME) {
                            continue;
                        }
                        this.game.addOnClick(card, () => this.game.anytimeActionMgr.playAnytimeCard(card.dataset.cardId, canPlayCardFct));
                    }
                },
                hasAnytimeCardsInHand() {
                    const cards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) == this.CARD_TYPE_ID_ANYTIME) {
                            return true;
                        }
                    }
                    return false;
                },
                allowPlayGainFishAnytimeCards() {
                    const cards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        if (card.classList.contains('tioc-card-buy')) {
                            continue;
                        }
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) != this.CARD_TYPE_ID_ANYTIME) {
                            continue;
                        }
                        if (this.game.anytimeActionMgr.isGainFishCard(card.dataset.cardId)) {
                            this.game.addOnClick(card, () => this.game.anytimeActionMgr.playAnytimeCard(card.dataset.cardId));
                        }
                    }
                },
                allowPlayNextShapeAnywhereAnytimeCards() {
                    const cards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) != this.CARD_TYPE_ID_ANYTIME) {
                            continue;
                        }
                        if (this.game.anytimeActionMgr.isNextShapeAnywhereCard(card.dataset.cardId)) {
                            this.game.addOnClick(card, () => this.game.anytimeActionMgr.playAnytimeCard(card.dataset.cardId));
                        }
                    }
                },
                allowSelectPrivateLesson(onSelectFct) {
                    const cards = document.querySelectorAll('#tioc-player-card-private-lesson-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        this.game.addOnClick(card, () => onSelectFct(card.dataset.cardId));
                    }
                },
                disallowSelectPrivateLesson() {
                    const cards = document.querySelectorAll('#tioc-player-card-private-lesson-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        this.game.removeClickableId(card.id);
                    }
                },
                getSelectedDraftCards() {
                    const cards = document.querySelectorAll('#tioc-player-card-draft-container-' + this.game.player_id + ' .tioc-card.tioc-selected');
                    return cards;
                },
                getSelectedHandRescueCards() {
                    const cards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card.tioc-selected');
                    return cards;
                },
                getAllHandRescueCards() {
                    const cards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card');
                    return Array.from(cards).filter((c) => this.getCardTypeIdFromCardId(c.dataset.cardId) == this.CARD_TYPE_ID_RESCUE);
                },
                getCardTypeIdFromCardId(cardId) {
                    return this.cardsCreationInfo[cardId].cardTypeId;
                },
                getCardPriceFromCardId(cardId) {
                    return this.cardsCreationInfo[cardId].price;
                },
                cardNeedsBuyColorFromCardId(cardId) {
                    return this.cardsCreationInfo[cardId].needsBuyColor;
                },
                getCardTypeIdFromCardId(cardId) {
                    return this.cardsCreationInfo[cardId].cardTypeId;
                },
                getCardTypeNameFromCardId(cardId) {
                    switch (this.getCardTypeIdFromCardId(cardId)) {
                        case this.CARD_TYPE_ID_OSHAX:
                            return _('Oshax');
                        case this.CARD_TYPE_ID_RESCUE:
                            return _('Rescue');
                        case this.CARD_TYPE_ID_ANYTIME:
                            return _('Anytime');
                        case this.CARD_TYPE_ID_TREASURE:
                            return _('Treasure');
                        case this.CARD_TYPE_ID_PRIVATE_LESSON:
                            return _('Private Lesson');
                        case this.CARD_TYPE_ID_PUBLIC_LESSON:
                            return _('Public Lesson');
                    }
                    return '';
                },
                getCardBasketTypeIdFromCardId(cardId) {
                    return this.cardsCreationInfo[cardId].cardBasketTypeId;
                },
                getCardTreasureTypeIdFromCardId(cardId) {
                    return this.cardsCreationInfo[cardId].cardTreasureTypeId;
                },
                getCardAnytimeTypeIdFromCardId(cardId) {
                    return this.cardsCreationInfo[cardId].cardAnytimeTypeId;
                },
                isCardAnytimeServerSideFromCardId(cardId) {
                    return this.cardsCreationInfo[cardId].isCardAnytimeServerSide;
                },
                isCardAnytimeBuyPhaseFromCardId(cardId) {
                    return this.cardsCreationInfo[cardId].isCardAnytimeBuyPhase;
                },
                getCardDeckOrderFromCardId(cardId) {
                    return this.cardsCreationInfo[cardId].deckOrder;
                },
                getCardSoloBasketCountFromCardId(cardId) {
                    return this.cardsCreationInfo[cardId].soloBasketCount;
                },
                getElemIdForCardLocationId(playerId, cardLocationId, cardId) {
                    switch (cardLocationId) {
                        case this.CARD_LOCATION_ID_PLAYER_DRAFT:
                            return 'tioc-player-card-draft-container-' + playerId;
                        case this.CARD_LOCATION_ID_PLAYER_BUY:
                            return 'tioc-player-card-buy-container-' + playerId;
                        case this.CARD_LOCATION_ID_PLAYER_HAND:
                            return 'tioc-player-card-hand-container-' + playerId;
                        case this.CARD_LOCATION_ID_TABLE:
                            if (playerId === null) {
                                switch (this.getCardTypeIdFromCardId(cardId)) {
                                    case this.CARD_TYPE_ID_SOLO_LESSON:
                                        return 'tioc-solo-lesson-container';
                                    case this.CARD_TYPE_ID_SOLO_COLOR:
                                        return 'tioc-solo-color-container';
                                    case this.CARD_TYPE_ID_SOLO_BASKET:
                                        return 'tioc-solo-basket-container';
                                    default:
                                        return 'tioc-public-lesson-container';
                                }
                            } else {
                                if (this.getCardTypeIdFromCardId(cardId) === this.CARD_TYPE_ID_PRIVATE_LESSON) {
                                    return 'tioc-player-card-private-lesson-container-' + playerId
                                } else {
                                    return 'tioc-player-card-table-container-' + playerId;
                                }
                            }
                        case this.CARD_LOCATION_ID_DISCARD_PLAYED:
                            return 'tioc-played-discard-container';
                    }
                    return null;
                },
                moveCurrentPlayerCardToHand(cardId) {
                    this.moveToLocation(this.game.player_id, this.CARD_LOCATION_ID_PLAYER_HAND, [cardId]);
                    const cardElemId = 'tioc-card-id-' + cardId;
                    this.game.addClass(cardElemId, 'tioc-card-buy');
                },
                moveCurrentPlayerCardToBuy(cardId) {
                    this.moveToLocation(this.game.player_id, this.CARD_LOCATION_ID_PLAYER_BUY, [cardId]);
                    const cardElemId = 'tioc-card-id-' + cardId;
                    this.game.removeClass(cardElemId, 'tioc-card-buy');
                },
                moveToLocation(playerId, cardLocationId, cardIds) {
                    for (const cardId of cardIds) {
                        const cardElemId = 'tioc-card-id-' + cardId;
                        const cardElem = document.getElementById(cardElemId);
                        if (cardElem === null) {
                            continue;
                        }
                        this.game.removeClickableId(cardElemId);
                        if (cardLocationId == this.CARD_LOCATION_ID_DISCARD || cardLocationId == this.CARD_LOCATION_ID_DISCARD_PLAYED) {
                            cardElem.id += '-destroy';
                            this.game.tiocFadeOutAndDestroy(cardElem.id, null, () => {
                                this.schedule();
                            });
                            continue;
                        }
                        const destinationElemId = this.getElemIdForCardLocationId(playerId, cardLocationId, cardId);
                        if (cardElem.parentElement.id == destinationElemId) {
                            continue;
                        }
                        cardElem.classList.add('tioc-moving');
                        this.game.slide(cardElemId, destinationElemId).then(() => {
                            window.tiocWrap('moveToLocation_onEnd', () => {
                                this.game.removeAbsolutePosition(cardElemId);
                                this.game.basketMgr.updatePlayerPanelBasketCount();
                                this.updateCurrentPlayerCard();
                                this.game.updateTooltips();
                                this.schedule();
                            });
                        });
                    }
                    this.schedule();
                },
                moveDraftToPlayerId(nextPlayerId) {
                    const cards = document.querySelectorAll('#tioc-player-card-draft-container-' + this.game.player_id + ' .tioc-card');
                    const destinationElemId = 'player_board_' + nextPlayerId;
                    for (let card of cards) {
                        card.id = card.id + '-draft-destroy';
                        card.classList.add('tioc-moving');
                        this.game.slide(card.id, destinationElemId, { destroy: true });
                    }
                    this.schedule();
                },
                createDraftCardsFromPlayerId(prevPlayerId, cardsToCreate) {
                    const destinationElemId = 'tioc-player-card-draft-container-' + this.game.player_id;
                    for (const card of cardsToCreate) {
                        this.createAndPlaceCard(card, 'player_board_' + prevPlayerId);
                        const cardElemId = 'tioc-card-id-' + card.cardId;
                        const cardElem = document.getElementById(cardElemId);
                        cardElem.classList.add('tioc-moving')
                        this.game.slide(cardElemId, destinationElemId).then(() => {
                            window.tiocWrap('createDraftCardsFromPlayerId_onEnd', () => {
                                this.game.removeAbsolutePosition(cardElemId);
                                this.game.updateTooltips();
                                this.game.cardTitleWrap.showCardContainer(destinationElemId);
                                this.schedule();
                            });
                        });
                    }
                    this.schedule();
                },
                addColorToCardId(cardId, colorId) {
                    if (colorId === null) {
                        return;
                    }
                    const cardElemId = 'tioc-card-id-' + cardId;
                    dojo.place(this.game.format_block('jstpl_meeple_cat', {
                            color_name: this.game.CAT_COLOR_NAMES[colorId],
                        }),
                        cardElemId
                    );
                    this.game.updateTooltips();
                },
                removeColorFromCardId(cardId) {
                    const cardElemId = 'tioc-card-id-' + cardId;
                    dojo.query('#' + cardElemId + ' .tioc-meeple').forEach(dojo.destroy);
                    this.game.updateTooltips();
                },
                getCurrentColorIdFromCardId(cardId) {
                    const cardElemId = 'tioc-card-id-' + cardId;
                    const meepleElem = document.querySelector('#' + cardElemId + ' .tioc-meeple');
                    if (meepleElem === null) {
                        return null;
                    }
                    for (let colorId = 0; colorId < this.game.CAT_COLOR_NAMES.length; ++colorId) {
                        if (meepleElem.classList.contains(this.game.CAT_COLOR_NAMES[colorId])) {
                            return colorId;
                        }
                    }
                    return null;
                },
                isCardUsed(cardId) {
                    return this.usedCardIds.has(cardId);
                },
                useCard(cardId) {
                    this.usedCardIds.add(cardId);
                    const cardElemId = 'tioc-card-id-' + cardId;
                    dojo.addClass(cardElemId, 'tioc-animate-to-hidden-start');
                    setTimeout(() => {
                        window.tiocWrap('useCard_setTimeout', () => {
                            dojo.addClass(cardElemId, 'tioc-animate-to-hidden-end');
                            this.game.basketMgr.updatePlayerPanelBasketCount();
                            this.updateCurrentPlayerCard();
                            this.schedule();
                        });
                    }, 1);
                    this.schedule();
                },
                unuseCard(cardId) {
                    if (cardId === null) {
                        return;
                    }
                    this.usedCardIds.delete(cardId);
                    const cardElemId = 'tioc-card-id-' + cardId;
                    dojo.removeClass(cardElemId, 'tioc-animate-to-hidden-start');
                    dojo.removeClass(cardElemId, 'tioc-animate-to-hidden-end');
                    this.game.basketMgr.updatePlayerPanelBasketCount();
                    this.updateCurrentPlayerCard();
                    this.schedule();
                },
                updateCurrentPlayerCard() {
                    if (this.game.isSoloMode()) {
                        let soloCardCount = 0;
                        let minDeckOrder = 999;
                        let minSoloBasketCount = 0;
                        const soloBasketCards = document.querySelectorAll('#tioc-solo-basket-container .tioc-card');
                        for (const card of soloBasketCards) {
                            const cardId = card.dataset.cardId;
                            if (cardId == this.CARD_ID_BACK_SOLO_BASKET) {
                                card.remove();
                                continue;
                            }
                            ++soloCardCount;
                            const cardDeckOrder = this.getCardDeckOrderFromCardId(cardId);
                            card.style.order = cardDeckOrder;
                            if (cardDeckOrder < minDeckOrder) {
                                minDeckOrder = cardDeckOrder;
                                minSoloBasketCount = this.getCardSoloBasketCountFromCardId(cardId);
                            }
                        }
                        for (let i = 0; i < minSoloBasketCount - soloCardCount; ++i) {
                            const card = this.createCardElement(this.CARD_ID_BACK_SOLO_BASKET, 'tioc-solo-basket-container');
                        }
                        const soloColorCards = document.querySelectorAll('#tioc-solo-color-container .tioc-card');
                        for (const card of soloColorCards) {
                            card.style.order = this.getCardDeckOrderFromCardId(card.dataset.cardId);
                        }
                    }
                    for (const playerId in this.game.gamedatas.players) {
                        const tableCards = document.querySelectorAll('#tioc-player-card-table-container-' + playerId + ' .tioc-card');
                        let backCardCount = 0;
                        for (const card of tableCards) {
                            if (card.dataset.cardId == this.CARD_ID_BACK_REGULAR) {
                                ++backCardCount;
                            }
                        }
                        if (tableCards.length != backCardCount) {
                            for (const card of tableCards) {
                                if (card.dataset.cardId == this.CARD_ID_BACK_REGULAR) {
                                    card.remove();
                                }
                            }
                        }
                    }
                    if (this.game.isSpectator) {
                        return;
                    }
                    dojo.query('.tioc-card .tioc-card-button').forEach(dojo.destroy);
                    const handCards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card');
                    let handCardCount = 0;
                    for (const card of handCards) {
                        if (card.classList.contains('tioc-animate-to-hidden-end') || card.classList.contains('tioc-hidden')) {
                            continue;
                        }
                        this.updateCardButton(card);
                        ++handCardCount;
                    }
                    const tableCards = document.querySelectorAll('#tioc-player-card-table-container-' + this.game.player_id + ' .tioc-card');
                    let tableRescueCardsCount = 0;
                    for (const card of tableCards) {
                        if (card.classList.contains('tioc-animate-to-hidden-end') || card.classList.contains('tioc-hidden')) {
                            continue;
                        }
                        ++tableRescueCardsCount;
                    }
                    this.playerHandCardCounter[this.game.player_id].setValue(handCardCount);
                    this.tableRescueCardsCounter[this.game.player_id].setValue(tableRescueCardsCount);
                    this.playerPanelPrivateLessonCounter[this.game.player_id].setValue(this.countPrivateLessons());
                },
                updateCardButton(card) {
                    const showPref = this.game.playerPreferenceMgr.getShowAskWhenToPlayPref();
                    if (showPref == this.game.playerPreferenceMgr.USER_PREF_SHOW_ASK_WHEN_TO_PLAY_VALUE_NO_CARDS) {
                        return;
                    }
                    const cardId = parseInt(card.dataset.cardId);
                    if (this.getCardTypeIdFromCardId(cardId) != this.CARD_TYPE_ID_ANYTIME) {
                        return;
                    }
                    const typeId = this.getCardAnytimeTypeIdFromCardId(cardId);
                    if (showPref == this.game.playerPreferenceMgr.USER_PREF_SHOW_ASK_WHEN_TO_PLAY_VALUE_IMPORTANT_CARDS) {
                        switch (typeId) {
                            case this.game.anytimeActionMgr.CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2:
                            case this.game.anytimeActionMgr.CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3:
                            case this.game.anytimeActionMgr.CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE:
                            case this.game.anytimeActionMgr.CARD_ANYTIME_TYPE_ID_MOVE_CATS_FROM_FIELDS:
                            case this.game.anytimeActionMgr.CARD_ANYTIME_TYPE_ID_DRAW_AND_FIELD_SHAPE:
                                break;
                            default:
                                return;
                        }
                    }
                    const button = dojo.place(this.game.format_block('jstpl_button', { id: 'tioc-card-button-' + cardId }), card);
                    button.innerText = _('When to play');
                    button.classList.add('tioc-card-button');
                    dojo.connect(button, 'onclick', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (this.game.isInterfaceLocked()) {
                            return;
                        }
                        this.showWhenToPlayDialog(cardId);
                    });
                },
                setWhenToPlayeDialogCheckbox(value) {
                    const checkboxes = document.querySelectorAll('#popin_tioc-card-play-dialog input[type=checkbox]');
                    for (const checkbox of checkboxes) {
                        checkbox.checked = value;
                    }
                },
                updateWhenToPlayeDialogCheckbox(cardId, anytimePref) {
                    this.setWhenToPlayeDialogCheckbox(false);
                    if (!(cardId in anytimePref)) {
                        return;
                    }
                    for (const pref of anytimePref[cardId]) {
                        const checkboxes = document.querySelectorAll('#popin_tioc-card-play-dialog input[type=checkbox]');
                        for (const checkbox of checkboxes) {
                            if (checkbox.dataset.stateId != pref.stateId) {
                                continue;
                            }
                            let checkPlayerId = null;
                            if (checkbox.dataset.playerId) {
                                checkPlayerId = checkbox.dataset.playerId;
                            }
                            if (checkPlayerId != pref.statePlayerId) {
                                continue;
                            }
                            checkbox.checked = true;
                            break;
                        }
                    }
                },
                showWhenToPlayDialog(cardId) {
                    this.game.closeAllTooltips();
                    const dialog = new ebg.popindialog();
                    dialog.create('tioc-card-play-dialog');
                    dialog.setTitle(_('Ask when to play'));
                    const line = '<li><label><input type="checkbox" data-state-id=${state_id} data-player-id="${player_id}">&nbsp;${text}</label></li>';
                    let html = '';
                    html += '<p>';
                    html += _("Choose when the game will ask you if you want to play this card. You can always play Anytime cards on your turn in the Rescue and Rare Finds phases. You should not have to change the default in almost all cases.");
                    html += '</p>';
                    html += '<ul>';
                    html += dojo.string.substitute(line, {
                        text: _('Before Fill the fields'),
                        state_id: this.game.STATE_PHASE_0_FILL_THE_FIELDS_ID,
                        player_id: '',
                    });
                    html += dojo.string.substitute(line, {
                        text: _('Before Deal cards'),
                        state_id: this.game.STATE_PHASE_2_EXPLORE_DEAL_CARDS_ID,
                        player_id: '',
                    });
                    html += dojo.string.substitute(line, {
                        text: _('Before Buy cards'),
                        state_id: this.game.STATE_PHASE_2_BUY_CARDS_ID,
                        player_id: '',
                    });
                    html += dojo.string.substitute(line, {
                        text: _('Before Read lessons'),
                        state_id: this.game.STATE_PHASE_3_READ_LESSONS_ID,
                        player_id: '',
                    });
                    for (const playerId in this.game.playerName) {
                        html += dojo.string.substitute(line, {
                            text: _('Before Choose rescue cards') +
                                dojo.string.substitute(', <span style="font-weight:bold;color:#${color};">${name}</span>', {
                                    color: this.game.playerColor[playerId],
                                    name: this.game.playerName[playerId]
                                }),
                            state_id: this.game.STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID,
                            player_id: playerId,
                        });
                    }
                    html += dojo.string.substitute(line, {
                        text: _('After Choose rescue cards'),
                        state_id: this.game.STATE_PHASE_4_BEFORE_RESCUE_CAT_ID,
                        player_id: '',
                    });
                    for (const playerId in this.game.playerName) {
                        if (playerId == this.game.player_id) {
                            continue;
                        }
                        html += dojo.string.substitute(line, {
                            text: _('Before Rescue cats') +
                                dojo.string.substitute(', <span style="font-weight:bold;color:#${color};">${name}</span>', {
                                    color: this.game.playerColor[playerId],
                                    name: this.game.playerName[playerId]
                                }),
                            state_id: this.game.STATE_PHASE_4_RESCUE_CAT_ID,
                            player_id: playerId,
                        });
                    }
                    for (const playerId in this.game.playerName) {
                        if (playerId == this.game.player_id) {
                            continue;
                        }
                        html += dojo.string.substitute(line, {
                            text: _('Before Rare finds') +
                                dojo.string.substitute(', <span style="font-weight:bold;color:#${color};">${name}</span>', {
                                    color: this.game.playerColor[playerId],
                                    name: this.game.playerName[playerId]
                                }),
                            state_id: this.game.STATE_PHASE_5_RARE_FINDS_ID,
                            player_id: playerId,
                        });
                    }
                    html += '</ul>';
                    html += '<div>';
                    html += '<a class="bgabutton bgabutton_blue" id="tioc-card-play-dialog-button-ok" href="#">' + _('OK') + '</a>';
                    html += '<a class="bgabutton bgabutton_gray" id="tioc-card-play-dialog-button-default" href="#">' + _('Default') + '</a>';
                    html += '<a class="bgabutton bgabutton_gray" id="tioc-card-play-dialog-button-all" href="#">' + _('All') + '</a>';
                    html += '<a class="bgabutton bgabutton_gray" id="tioc-card-play-dialog-button-none" href="#">' + _('None') + '</a>';
                    html += '<a class="bgabutton bgabutton_gray" id="tioc-card-play-dialog-button-cancel" href="#">' + _('Cancel') + '</a>';
                    html += '</div>';
                    dialog.setContent(html);
                    this.game.clickConnect(document.getElementById('tioc-card-play-dialog-button-ok'), (event) => {
                        window.tiocWrap('play_dialog_ok_click', () => {
                            event.preventDefault();
                            const checkboxes = document.querySelectorAll('#popin_tioc-card-play-dialog input[type=checkbox]');
                            const actions = [];
                            for (const checkbox of checkboxes) {
                                if (checkbox.checked) {
                                    actions.push({
                                        actionTypeId: this.ACTION_TYPE_ID_ANYTIME_PREF,
                                        stateId: parseInt(checkbox.dataset.stateId),
                                        statePlayerId: checkbox.dataset.playerId.length == 0 ? null : parseInt(checkbox.dataset.playerId),
                                    });
                                }
                            }
                            this.game.ajaxAction('changeAnytimeCardPlay', {
                                cardId: cardId,
                                actions: JSON.stringify(actions),
                            });
                            dialog.destroy();
                        });
                    });
                    this.game.clickConnect(document.getElementById('tioc-card-play-dialog-button-default'), (event) => {
                        window.tiocWrap('play_dialog_default_click', () => {
                            event.preventDefault();
                            this.updateWhenToPlayeDialogCheckbox(cardId, this.playerDefaultAnytimePref);
                        });
                    });
                    this.game.clickConnect(document.getElementById('tioc-card-play-dialog-button-all'), (event) => {
                        window.tiocWrap('play_dialog_all_click', () => {
                            event.preventDefault();
                            this.setWhenToPlayeDialogCheckbox(true);
                        });
                    });
                    this.game.clickConnect(document.getElementById('tioc-card-play-dialog-button-none'), (event) => {
                        window.tiocWrap('play_dialog_none_click', () => {
                            event.preventDefault();
                            this.setWhenToPlayeDialogCheckbox(false);
                        });
                    });
                    this.game.clickConnect(document.getElementById('tioc-card-play-dialog-button-cancel'), (event) => {
                        window.tiocWrap('play_dialog_cancel_click', () => {
                            event.preventDefault();
                            dialog.destroy();
                        });
                    });
                    this.updateWhenToPlayeDialogCheckbox(cardId, this.playerAnytimePref);
                    dialog.show();
                },
                countPrivateLessons() {
                    let cardCount = 0;
                    const cards = document.querySelectorAll('#tioc-player-card-private-lesson-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        if (card.classList.contains('tioc-hidden') ||
                            card.classList.contains('tioc-animate-to-hidden-end')) {
                            continue;
                        }
                        ++cardCount;
                    }
                    return cardCount;
                },
                countOshaxCards() {
                    let cardCount = 0;
                    const cards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        if (card.classList.contains('tioc-hidden') ||
                            card.classList.contains('tioc-animate-to-hidden-end')) {
                            continue;
                        }
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) != this.CARD_TYPE_ID_OSHAX) {
                            continue;
                        }
                        ++cardCount;
                    }
                    return cardCount;
                },
                countTreasureCards() {
                    let cardCount = 0;
                    const cards = document.querySelectorAll('#tioc-player-card-hand-container-' + this.game.player_id + ' .tioc-card');
                    for (const card of cards) {
                        if (card.classList.contains('tioc-hidden') ||
                            card.classList.contains('tioc-animate-to-hidden-end')) {
                            continue;
                        }
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) != this.CARD_TYPE_ID_TREASURE) {
                            continue;
                        }
                        ++cardCount;
                    }
                    return cardCount;
                },
                countPlayerBasketFromCards(playerId) {
                    let cardCount = 0.0;
                    const cards = document.querySelectorAll('#tioc-player-card-table-container-' + playerId + ' .tioc-card');
                    for (const card of cards) {
                        if (card.classList.contains('tioc-hidden') ||
                            card.classList.contains('tioc-animate-to-hidden-end')) {
                            continue;
                        }
                        if (this.getCardTypeIdFromCardId(card.dataset.cardId) != this.CARD_TYPE_ID_RESCUE) {
                            continue;
                        }
                        const cardBasketTypeId = this.getCardBasketTypeIdFromCardId(card.dataset.cardId);
                        if (cardBasketTypeId == this.CARD_BASKET_TYPE_ID_HALF) {
                            cardCount += 0.5;
                        } else if (cardBasketTypeId == this.CARD_BASKET_TYPE_ID_FULL) {
                            cardCount += 1.0;
                        }
                    }
                    return cardCount;
                },
                showScoreCards(playerId, scoreCards) {
                    const delay = 200
                    let currentDelay = 0;
                    scoreCards.sort((a, b) => a.cardId - b.cardId);
                    for (const scoreCard of scoreCards) {
                        const cardElemId = 'tioc-card-id-' + scoreCard.cardId;
                        const cardElem = document.getElementById(cardElemId);
                        setTimeout(
                            () => {
                                window.tiocWrap('showScoreCards_setTimeout', () => {
                                    this.game.displayBigScore(cardElem, playerId, scoreCard.score)
                                    this.addScoreToCardId(scoreCard.cardId, playerId, scoreCard.score);
                                });
                            },
                            currentDelay
                        )
                        currentDelay += delay;
                    }
                },
                addScoreToCardId(cardId, playerId, score) {
                    if (score === null) {
                        return;
                    }
                    let style = '';
                    if (playerId !== null && playerId != this.game.SOLO_SISTER_PLAYER_ID) {
                        style = 'color: #' + this.game.playerColor[playerId];
                    }
                    const cardElemId = 'tioc-card-id-' + cardId;
                    dojo.place(this.game.format_block('jstpl_card_end_score', {
                            score: score,
                            style: style,
                        }),
                        cardElemId
                    );
                },
                getDescriptionAndNoteFromCardId(cardId) {
                    switch (parseInt(cardId)) {
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                            return {
                                description: _('Take any Oshax and place it on your boat.'),
                                note: '',
                            };
                        case 7:
                        case 8:
                        case 9:
                        case 10:
                        case 11:
                        case 12:
                        case 13:
                        case 14:
                            return {
                                description: _('Gain 4 speed'),
                                note: '',
                            };
                        case 15:
                        case 16:
                        case 17:
                        case 18:
                        case 19:
                        case 20:
                        case 21:
                        case 22:
                            return {
                                description: _('Gain a half basket'),
                                note: '',
                            };
                        case 23:
                        case 24:
                        case 25:
                        case 26:
                        case 27:
                        case 28:
                        case 29:
                        case 30:
                        case 31:
                        case 32:
                        case 33:
                        case 34:
                            return {
                                description: _('Gain a half basket and 1 speed'),
                                note: '',
                            };
                        case 35:
                        case 36:
                        case 37:
                        case 38:
                        case 39:
                        case 40:
                        case 41:
                        case 42:
                            return {
                                description: _('Gain a half basket and 3 speed'),
                                note: '',
                            };
                        case 43:
                        case 44:
                        case 45:
                        case 46:
                        case 47:
                        case 48:
                        case 49:
                        case 50:
                        case 51:
                        case 52:
                        case 53:
                        case 54:
                            return {
                                description: _('Gain a basket and 1 speed'),
                                note: '',
                            };
                        case 55:
                        case 56:
                        case 57:
                        case 58:
                        case 59:
                        case 60:
                        case 61:
                        case 62:
                        case 63:
                        case 64:
                        case 65:
                        case 66:
                            return {
                                description: _('Gain a basket and 3 speed'),
                                note: '',
                            };
                        case 67:
                        case 68:
                            return {
                                description: _('Gain 2 fish for each Oshax on your boat'),
                                note: '',
                            };
                        case 69:
                        case 70:
                            return {
                                description: _('Place your next Cat, Oshax or Treasure anywhere on your boat'),
                                note: '',
                            };
                        case 71:
                        case 72:
                            return {
                                description: _('Draw 2 cards. You must pay usual cost for any cards you keep.'),
                                note: _('This card reveals hidden information and cannot be undone.'),
                            };
                        case 73:
                        case 74:
                            return {
                                description: _('Draw 3 cards. You must pay usual cost for any cards you keep.'),
                                note: _('This card reveals hidden information and cannot be undone.'),
                            };
                        case 75:
                            return {
                                description: _('Take 1 tile from the bag at random and immediately place it on your boat'),
                                note: _('This card reveals hidden information and cannot be undone.'),
                            };
                        case 76:
                            return {
                                description: _('Discard 1 permanent basket. Gain 5 fish.'),
                                note: '',
                            };
                        case 77:
                            return {
                                description: _('Move up to 3 Cats to different fields'),
                                note: '',
                            };
                        case 78:
                        case 79:
                            return {
                                description: _('Gain 1 fish for each private lesson in front of you'),
                                note: '',
                            };
                        case 80:
                        case 81:
                        case 82:
                            return {
                                description: _('When you next rescue 1 Cat, you may rescue 2 Cats instead. For each cat you rescue, you must use a basket and pay the fish cost.'),
                                note: '',
                            };
                        case 83:
                            return {
                                description: _('Take 4 tiles from the bag at random and immediately place them in the fields. For each Cat, you may choose which field to put it in.'),
                                note: _('This card reveals hidden information and cannot be undone.'),
                            };
                        case 84:
                        case 85:
                            return {
                                description: _('Gain 1 permanent basket'),
                                note: '',
                            };
                        case 86:
                        case 87:
                            return {
                                description: _('Discard any 2 played private lesson cards, gain 1 permanent basket'),
                                note: '',
                            };
                        case 88:
                        case 89:
                            return {
                                description: _('Discard any 2 treasures on your boat, gain 1 permanent basket'),
                                note: '',
                            };
                        case 90:
                        case 91:
                            return {
                                description: _('Gain 1 for each unique coloured Cat on your boat. Oshax do not count as colours, the maximum number of colours you can have is 5.'),
                                note: '',
                            };
                        case 92:
                        case 93:
                            return {
                                description: _('Gain 2 for each Rare Treasure on your boat.'),
                                note: '',
                            };
                        case 94:
                        case 95:
                            return {
                                description: _('Gain 1 for each Common Treasure on your boat.'),
                                note: '',
                            };
                        case 96:
                        case 97:
                            return {
                                description: _('Pick a colour. Gain 1 for each Cat and Oshax of the chosen colour on your boat.'),
                                note: _('The game will choose the color for the player and give the most fish possible.'),
                            };
                        case 98:
                        case 99:
                        case 100:
                        case 101:
                        case 102:
                        case 103:
                        case 104:
                        case 105:
                        case 106:
                            return {
                                description: _('Take any 1 Rare Treasure or take any 2 Common Treasures.'),
                                note: '',
                            };
                        case 107:
                        case 108:
                        case 109:
                        case 110:
                        case 111:
                        case 112:
                            return {
                                description: _('Take any 2 Small Treasures or pay 1 fish to take any 2 Common Treasures.'),
                                note: '',
                            };
                        case 113:
                        case 156:
                            return {
                                description: _('12 points if there are no empty spaces at the edge of your boat'),
                                note: '',
                            };
                        case 114:
                            return {
                                description: _('10 points if you have exactly 15 Cats and Oshax on your boat'),
                                note: '',
                            };
                        case 115:
                            return {
                                description: _('15 points if you have 3 or more Cats, including Oshax, of each colour on your boat'),
                                note: '',
                            };
                        case 116:
                            return {
                                description: _('7 points if you have 1 or more of each colour Cat touching the edge of your boat'),
                                note: '',
                            };
                        case 117:
                        case 151:
                            return {
                                description: _('Pick a colour. 1 point per Cat of the chosen colour touching the edge of your boat'),
                                note: _('The color is choosen at the end of the game. The game will choose the color giving the most points.'),
                            };
                        case 118:
                            return {
                                description: _('7 points if you have exactly 3 permanent baskets'),
                                note: '',
                            };
                        case 119:
                            return {
                                description: _('7 points if you are first in turn order at the end of the game'),
                                note: '',
                            };
                        case 120:
                            return {
                                description: _('1 point per lonely Cat or Oxshax on your boat. A lonely cat is a cat not touching any other cats of the same colour.'),
                                note: '',
                            };
                        case 121:
                        case 165:
                            return {
                                description: _('10 points if you have the largest family of cats. In the case of a tie, you get the points. In solo, you need a family of 7 or more.'),
                                note: '',
                            };
                        case 122:
                            return {
                                description: _('2 points per Rare Treasure on your boat'),
                                note: '',
                            };
                        case 123:
                            return {
                                description: _('1 point per Common Treasure on your boat'),
                                note: '',
                            };
                        case 124:
                        case 154:
                            return {
                                description: _('10 points if you have no visible rats on your boat'),
                                note: '',
                            };
                        case 125:
                        case 166:
                            return {
                                description: _('2 points per visible rat on your boat. You still lose 1 point per visible rat as per the normal scoring rules, so this results in you gaining 1 point per rat overall.'),
                                note: '',
                            };
                        case 126:
                            return {
                                description: _('1 point per Private Lesson card in front of you.'),
                                note: '',
                            };
                        case 127:
                            return {
                                description: _('9 points if you have exactly 5 blue Cats and Oshax on your boat'),
                                note: '',
                            };
                        case 128:
                            return {
                                description: _('9 points if you have exactly 5 green Cats and Oshax on your boat'),
                                note: '',
                            };
                        case 129:
                            return {
                                description: _('9 points if you have exactly 5 purple Cats and Oshax on your boat'),
                                note: '',
                            };
                        case 130:
                            return {
                                description: _('9 points if you have exactly 5 red Cats and Oshax on your boat'),
                                note: '',
                            };
                        case 131:
                            return {
                                description: _('9 points if you have exactly 5 orange Cats and Oshax on your boat'),
                                note: '',
                            };
                        case 132:
                            return {
                                description: _('10 points if you have exactly 5 visible rats on your boat. You still lose 1 point per visible rat as per the normal scoring rules, so this results in you gaining 5 points overall.'),
                                note: '',
                            };
                        case 133:
                            return {
                                description: _('7 points if you have exactly 6 Private Lesson cards'),
                                note: '',
                            };
                        case 134:
                            return {
                                description: _('9 points if you have exactly 5 Treasures on your boat. This is the total of both Common and Rare Treasures.'),
                                note: '',
                            };
                        case 135:
                            return {
                                description: _('1 point per 2 Cats and Oshax touching the edge of your boat'),
                                note: '',
                            };
                        case 136:
                            return {
                                description: _("12 points if both Parrot Rooms (Captain's Rooms) are full. The captain's rooms can be found on the far left and right side of your boat, they contain the small parrot icons as shown on this lesson card."),
                                note: '',
                            };
                        case 137:
                            return {
                                description: _("18 points if both Moon Rooms (Bedrooms) are empty. The bedrooms can be found at the top and bottom of your boat towards the left side, they contain the small moon icon as shown on this lesson card. You still lose 5 points per unfilled rooms so this results in you gaining 8 points overall."),
                                note: '',
                            };
                        case 138:
                            return {
                                description: _('4 points per family of 4 or more cats on your boat. For every family containing 4 or more cats, you will gain 4 points. If you have 2 families of the same colour, both will count towards this lesson.'),
                                note: '',
                            };
                        case 139:
                            return {
                                description: _('3 points per Oshax cat on your boat'),
                                note: '',
                            };
                        case 140:
                            return {
                                description: _('15 points if the Apple Room (Dining Room) is empty. The dining room can be found in the middle of your boat, towards the left, it contains the small half eaten apple icon as shown on this lesson card. You still lose 5 points per unfilled rooms so this results in you gaining 10 points overall.'),
                                note: '',
                            };
                        case 141:
                        case 168:
                            return {
                                description: _('Score your third largest family twice. In case of equal sized families, your third largest family may be the same size as your largest or second largest families. You must have at least 3 families on your boat for this to score.'),
                                note: '',
                            };
                        case 142:
                            return {
                                description: _('7 points if you have at least 5 fish'),
                                note: '',
                            };
                        case 143:
                            return {
                                description: _('Pick a colour, all players get 2 points per Cat or Oshax of the chosen colour touching the edge of their boat'),
                                note: '',
                            };
                        case 144:
                            return {
                                description: _('Pick a colour, all players get 1 point per Cat or Oshax of the chosen colour on their boat.'),
                                note: '',
                            };
                        case 145:
                            return {
                                description: _('Pick a colour, all players get 5 points if they have 3 or more Cats or Oshax of the chosen colour on their boat.'),
                                note: '',
                            };
                        case 146:
                            return {
                                description: _('Pick a colour, all players get 3 points per lonely Cat or Oshax of the chosen colour on their boat. A lonely cat is a cat not touching any other cats of the same colour.'),
                                note: '',
                            };
                        case 147:
                            return {
                                description: _('All players get 2 points per Private Lesson card in front of them.'),
                                note: '',
                            };
                        case 148:
                            return {
                                description: _('All players get 2 points per Common Treasure on their boat.'),
                                note: '',
                            };
                        case 149:
                            return {
                                description: _('Pick a colour, all players get 1 point per Treasure touching the chosen colour Cat or Oshax on their boat. Each Treasure can score a maximum of 1 point. If a Treasure is touching multiple Cats or Oshax of the chosen colour, it will still only score 1 point. Both Common and Rate Treasures count towards this lesson.'),
                                note: '',
                            };
                        case 150:
                            return {
                                description: _('All players get 5 points per treasure map they have NOT covered. If during the game a player has covered a treasure map, and then revealed it by discarding a tile, then it is visible at the end of the game and still scores 5 points.'),
                                note: '',
                            };
                        case 152:
                            return {
                                description: _('9 points if you have 1 or more of each colour cat touching the edge of your boat.'),
                                note: '',
                            };
                        case 153:
                            return {
                                description: _('1 point per 2 cats touching the edge of your boat.'),
                                note: '',
                            };
                        case 155:
                            return {
                                description: _('10 points if the middle row of your boat is full.'),
                                note: '',
                            };
                        case 157:
                            return {
                                description: _('10 points if you have exactly 20 cats on your boat.'),
                                note: '',
                            };
                        case 158:
                            return {
                                description: _('15 points if you have 3 or more cats of each colour on your boat.'),
                                note: '',
                            };
                        case 159:
                            return {
                                description: _('9 points if you have exactly 5 blue cats on your boat.'),
                                note: '',
                            };
                        case 160:
                            return {
                                description: _('9 points if you have exactly 5 green cats on your boat.'),
                                note: '',
                            };
                        case 161:
                            return {
                                description: _('9 points if you have exactly 5 purple cats on your boat.'),
                                note: '',
                            };
                        case 162:
                            return {
                                description: _('9 points if you have exactly 5 red cats on your boat.'),
                                note: '',
                            };
                        case 163:
                            return {
                                description: _('9 points if you have exactly 5 orange cats on your boat.'),
                                note: '',
                            };
                        case 164:
                            return {
                                description: _('2 points per treasure on your boat.'),
                                note: '',
                            };
                        case 167:
                            return {
                                description: _('2 points per filled room on your boat. There are 7 rooms.'),
                                note: '',
                            };
                        case 169:
                            return {
                                description: _('Solo color: Blue'),
                                note: '',
                            };
                        case 170:
                            return {
                                description: _('Solo color: Green'),
                                note: '',
                            };
                        case 171:
                            return {
                                description: _('Solo color: Purple'),
                                note: '',
                            };
                        case 172:
                            return {
                                description: _('Solo color: Red'),
                                note: '',
                            };
                        case 173:
                            return {
                                description: _('Solo color: Orange'),
                                note: '',
                            };
                        case 174:
                            return {
                                description: _('Solo Rescue: Cat 5, Cat 4. Basket: 1.'),
                                note: '',
                            };
                        case 175:
                            return {
                                description: _('Solo Rescue: Cat 6, Common Treasure. Basket: 4.'),
                                note: '',
                            };
                        case 176:
                            return {
                                description: _('Solo Rescue: Cat 3, Oshax 3. Basket: 3.'),
                                note: '',
                            };
                        case 177:
                            return {
                                description: _('Solo Rescue: Cat 4, Cat 3. Basket: 2. Speed: 1.'),
                                note: '',
                            };
                        case 178:
                            return {
                                description: _('Solo Rescue: Cat 2, Common Treasure. Basket: 4. Speed: 1.'),
                                note: '',
                            };
                        case 179:
                            return {
                                description: _('Solo Rescue: Cat 5, Rare Treasure 4. Basket: 3. Speed: 1.'),
                                note: '',
                            };
                        case 180:
                            return {
                                description: _('Solo Rescue: Cat 2, Rare Treasure 2. Basket: 3. Speed: 2.'),
                                note: '',
                            };
                        case 181:
                            return {
                                description: _('Solo Rescue: Cat 7, Oshax 2. Basket: 2. Speed: 2.'),
                                note: '',
                            };
                        case 182:
                            return {
                                description: _('Solo Rescue: Cat 4, Rare Treasure 1. Basket: 1. Speed: 2.'),
                                note: '',
                            };
                        case 183:
                            return {
                                description: _('Solo Rescue: Cat 1, Common Treasure. Basket: 4. Speed: 3.'),
                                note: '',
                            };
                        case 184:
                            return {
                                description: _('Solo Rescue: Cat 6, Rare Treasure 5. Basket: 3. Speed: 3.'),
                                note: '',
                            };
                        case 185:
                            return {
                                description: _('Solo Rescue: Cat 2, Common Treasure. Basket: 2. Speed: 3.'),
                                note: '',
                            };
                        case 186:
                            return {
                                description: _('Solo Rescue: Cat 1, Oshax 5. Basket: 4. Speed: 4.'),
                                note: '',
                            };
                        case 187:
                            return {
                                description: _('Solo Rescue: Cat 1, Cat 5. Basket: 1. Speed: 4.'),
                                note: '',
                            };
                        case 188:
                            return {
                                description: _('Solo Rescue: Cat 3, Common Treasure. Basket: 4. Speed: 4.'),
                                note: '',
                            };
                        case 189:
                            return {
                                description: _('Solo Rescue: Cat 6, Cat 1. Basket: 1. Speed: 5.'),
                                note: '',
                            };
                        case 190:
                            return {
                                description: _('Solo Rescue: Cat 7, Common Treasure. Basket: 2. Speed 5.'),
                                note: '',
                            };
                        case 191:
                            return {
                                description: _('Solo Rescue: Cat 5, Cat 2. Basket: 2. Speed: 6.'),
                                note: '',
                            };
                        case 192:
                            return {
                                description: _('Solo Rescue: Switch Cat 1 and Cat 6, Cat 2. Basket: 4. Speed: 6.'),
                                note: '',
                            };
                        case 193:
                            return {
                                description: _('Solo Rescue: Cat 6, Rare Treasure 3. Basket: 3. Speed: 7.'),
                                note: '',
                            };
                        case 194:
                            return {
                                description: _('Solo Rescue: Switch Cat 2 and Cat 5, Cat 1. Basket: 4. Speed: 9.'),
                                note: '',
                            };
                        case 195:
                            return {
                                description: _('Solo Rescue: Cat 8, Oshax 1. Basket 3. Speed: 9.'),
                                note: '',
                            };
                        case 196:
                            return {
                                description: _('Solo Rescue: Cat 4, Common Treasure. Basket 3. Speed: 9.'),
                                note: '',
                            };
                        case 197:
                            return {
                                description: _('5 points for each colour cat where you do not have at least 1 cat of that colour touching any treasure.'),
                                note: '',
                            };
                        case 198:
                            return {
                                description: _('2 points per cat in the largest family.'),
                                note: '',
                            };
                        case 199:
                            return {
                                description: _('10 points if you have less than 9 treasures.'),
                                note: '',
                            };
                        case 200:
                            return {
                                description: _('4 points per unspent fish.'),
                                note: '',
                            };
                        case 201:
                            return {
                                description: _('5 points per visible rat.'),
                                note: '',
                            };
                        case 202:
                            return {
                                description: _('5 points for every cat over 15.'),
                                note: '',
                            };
                        case 203:
                            return {
                                description: _('5 points for each colour cat where you do not have at least 1 cat of that colour touching the edge of your boat.'),
                                note: '',
                            };
                        case 204:
                            return {
                                description: _('The highest scoring lesson scores twice.'),
                                note: '',
                            };
                        case 205:
                            return {
                                description: _('3 points per filled room.'),
                                note: '',
                            };
                        case 206:
                            return {
                                description: _('5 point per lonely Cat or Oxshax. A lonely cat is a cat not touching any other cats of the same colour.'),
                                note: '',
                            };
                        case 207:
                            return {
                                description: _('3 points per lesson card you have.'),
                                note: '',
                            };
                        case 208:
                            return {
                                description: _('Score the largest family.'),
                                note: '',
                            };
                        case 209:
                            return {
                                description: _('Score the second largest family.'),
                                note: '',
                            };
                        case 210:
                            return {
                                description: _('3 points per common treasure.'),
                                note: '',
                            };
                        case 211:
                            return {
                                description: _('3 points per cat not touching any treasure.'),
                                note: '',
                            };
                        case 212:
                            return {
                                description: _('4 points per covered treasure map.'),
                                note: '',
                            };
                        case 213:
                            return {
                                description: _('5 points per family of cats.'),
                                note: '',
                            };
                        case 214:
                            return {
                                description: _('1 point per cat touching the edge of your boat.'),
                                note: '',
                            };
                        case 215:
                            return {
                                description: _('5 points for each colour cat where you do not have at least 1 cat of that colour touching any visible rat.'),
                                note: '',
                            };
                        case this.CARD_ID_BACK_SOLO_BASKET:
                            return {
                                description: _('Back of a Solo Rescue card.'),
                                note: '',
                            };
                        case this.CARD_ID_BACK_REGULAR:
                            return {
                                description: _('Back of a card.'),
                                note: '',
                            };
                    }
                    return {
                        description: '',
                        note: '',
                    };
                },
            }
        );
    }
);