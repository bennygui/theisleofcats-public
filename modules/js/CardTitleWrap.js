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
            'tioc.CardTitleWrap',
            null, {
                SCHEDULE_TIMEOUT: 100,

                game: null,
                scheduler: null,

                constructor(game) {
                    this.game = game;
                    this.scheduler = new tioc.Scheduler(() => this._updateAll(), this.SCHEDULE_TIMEOUT);
                    const titles = document.querySelectorAll('.tioc-card-container-title');
                    for (const title of titles) {
                        const cardContainer = title.nextElementSibling;
                        const wrap = title.parentElement;
                        wrap.style.backgroundColor = getComputedStyle(cardContainer).backgroundColor;
                        cardContainer.style.backgroundColor = 'transparent';
                        this._updateCardTitle(title);
                    }
                },
                schedule() {
                    this.scheduler.schedule();
                },
                showCardContainer(cardContainerId) {
                    const cardContainer = document.getElementById(cardContainerId);
                    if (cardContainer === null) {
                        return;
                    }
                    const title = cardContainer.parentElement.querySelector('.tioc-card-container-title');
                    this._showCardContainer(title, cardContainer);
                },
                _updateAll() {
                    const titles = document.querySelectorAll('.tioc-card-container-title');
                    for (const title of titles) {
                        this._updateCardTitle(title);
                    }
                },
                _updateCardTitle(title) {
                    this.game.clickConnect(title, (event) => {
                        window.tiocWrap('_updateCardTitle_onclick', () => {
                            event.preventDefault();
                            this._toggleCardContainer(title);
                        });
                    });
                    const cardContainer = title.nextElementSibling;
                    const cardCount = this._cardCount(cardContainer);
                    const cardCountElem = title.querySelector('.tioc-card-container-count');
                    if (cardCountElem !== null) {
                        if (cardCountElem.innerText != cardCount && !title.classList.contains('tioc-card-container-title-no-auto-open')) {
                            this._showCardContainer(title, cardContainer);
                        }
                        cardCountElem.innerText = cardCount;
                    }
                    if (cardCount == 0) {
                        title.classList.add('tioc-hidden');
                    } else {
                        title.classList.remove('tioc-hidden');
                    }
                },
                _cardCount(cardContainer) {
                    if (cardContainer.childElementCount == 0) {
                        return 0;
                    }
                    let count = 0;
                    for (let i = 0; i < cardContainer.children.length; ++i) {
                        const classList = cardContainer.children[i].classList;
                        if (!classList.contains('tioc-hidden') && !classList.contains('tioc-animate-to-hidden-end')) {
                            ++count;
                        }
                    }
                    return count;
                },
                _toggleCardContainer(title) {
                    const cardContainer = title.nextElementSibling;
                    if (cardContainer.classList.contains('tioc-hidden')) {
                        this._showCardContainer(title, cardContainer);
                    } else {
                        this._hideCardContainer(title, cardContainer);
                    }
                },
                _showCardContainer(title, cardContainer) {
                    title.querySelector('.tioc-card-container-toggle').innerHTML = '&#x25bf;';
                    cardContainer.classList.remove('tioc-hidden');
                },
                _hideCardContainer(title, cardContainer) {
                    title.querySelector('.tioc-card-container-toggle').innerHTML = '&#x25b9;';
                    cardContainer.classList.add('tioc-hidden');
                },
            }
        );
    }
);