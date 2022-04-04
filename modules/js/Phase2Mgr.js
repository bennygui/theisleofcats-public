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
            'tioc.Phase2Mgr',
            null, {
                game: null,

                NB_CARDS_KEEP_PER_DRAFT: 2,
                NB_CARDS_KEEP_FAMILY: 2,
                NB_CARDS_KEEP_SOLO: 3,

                constructor(game) {
                    this.game = game;
                },
                setup(gamedatas) {},
                onEnteringState(stateName, args) {
                    switch (stateName) {
                        case 'STATE_PHASE_2_EXPLORE_DRAFT':
                        case 'STATE_FAMILY_CHOOSE_LESSONS':
                            if (this.game.isCurrentPlayerActive()) {
                                this.game.cardMgr.allowSelectDraftCards();
                            }
                            break;
                        case 'STATE_PHASE_2_BUY_CARDS':
                        case 'STATE_PHASE_ANYTIME_BUY_CARDS':
                            this.game.commandMgr.showButtons();
                            if (this.game.isCurrentPlayerActive()) {
                                this.game.cardMgr.allowBuyCards();
                                this.game.cardMgr.allowPlayGainFishAnytimeCards();
                            }
                            break;
                    }
                },
                onLeavingState(stateName) {},
                onUpdateActionButtons(stateName, args) {
                    switch (stateName) {
                        case 'STATE_PHASE_2_EXPLORE_DRAFT':
                            this.onEnteringState(stateName, args);
                            this.game.addActionButton(
                                'button_phase_2_explore_draft',
                                _('Keep selected cards'),
                                (event) => {
                                    this.onDraftKeepCardsClick(event);
                                },
                            );
                            break;
                        case 'STATE_FAMILY_CHOOSE_LESSONS':
                            this.onEnteringState(stateName, args);
                            this.game.addActionButton(
                                'button_family_keep_cards',
                                _('Keep selected cards'),
                                (event) => {
                                    this.onFamilyKeepCardsClick(event);
                                },
                            );
                            break;
                        case 'STATE_PHASE_2_BUY_CARDS':
                            this.onEnteringState(stateName, args);
                            this.game.addActionButton(
                                'button_phase_2_buy_cards',
                                _('Confirm card choice'),
                                (event) => {
                                    this.onBuyCardsClick(event, 'phase2BuyCards');
                                },
                            );
                            break;
                        case 'STATE_PHASE_ANYTIME_BUY_CARDS':
                            this.onEnteringState(stateName, args);
                            this.game.addActionButton(
                                'button_phase_anytime_buy_cards',
                                _('Confirm card choice'),
                                (event) => {
                                    this.onBuyCardsClick(event, 'phaseAnytimeBuyCards');
                                },
                            );
                            break;
                        case 'STATE_PHASE_ANYTIME_DRAW_AND_FIELD_SHAPE':
                            this.game.addActionButton(
                                'button_phase_anytime_place_field_left',
                                _('Place in Left field'),
                                (event) => {
                                    this.onAnytimePlaceField(event, this.game.FIELD_LEFT);
                                },
                            );
                            this.game.addActionButton(
                                'button_phase_anytime_place_field_right',
                                _('Place in Right field'),
                                (event) => {
                                    this.onAnytimePlaceField(event, this.game.FIELD_RIGHT);
                                },
                            );
                            break;
                    }
                },
                onDraftKeepCardsClick(event) {
                    dojo.stopEvent(event);
                    if (!this.game.checkAction('phase2DraftKeepCards')) {
                        return;
                    }
                    let cards = this.game.cardMgr.getSelectedDraftCards();
                    if (this.game.isSoloMode()) {
                        if (cards.length != this.NB_CARDS_KEEP_SOLO) {
                            this.game.showMessage(_('You must select exactly 3 draft cards to keep'), 'error');
                            return;
                        }
                    } else {
                        if (cards.length != this.NB_CARDS_KEEP_PER_DRAFT) {
                            this.game.showMessage(_('You must select exactly 2 draft cards to keep'), 'error');
                            return;
                        }
                    }
                    this.game.ajaxAction('phase2DraftKeepCards', {
                            card_ids: Array.from(cards).map((card) => card.dataset.cardId).join(','),
                        },
                        () => {
                            this.game.cardMgr.disallowSelectDraftCards();
                        }
                    );
                },
                onFamilyKeepCardsClick(event) {
                    dojo.stopEvent(event);
                    if (!this.game.checkAction('familyKeepLessonCards')) {
                        return;
                    }
                    let cards = this.game.cardMgr.getSelectedDraftCards();
                    if (cards.length != this.NB_CARDS_KEEP_FAMILY) {
                        this.game.showMessage(_('You must select exactly 2 lessons cards to keep'), 'error');
                        return;
                    }
                    this.game.ajaxAction('familyKeepLessonCards', {
                            card_ids: Array.from(cards).map((card) => card.dataset.cardId).join(','),
                        },
                        () => {
                            this.game.cardMgr.disallowSelectDraftCards();
                        }
                    );
                },
                onBuyCardsClick(event, serverActionName) {
                    dojo.stopEvent(event);
                    if (!this.game.checkAction(serverActionName)) {
                        return;
                    }
                    const cmd = this.game.commandMgr;
                    if (cmd.isInCommand()) {
                        this.game.showMessage(_('You must finish your current move before you can confirm'), 'error');
                        return;
                    }
                    const callServer = () => {
                        this.game.ajaxAction(serverActionName, {
                                actions: JSON.stringify(cmd.commandGroupsStateValues()),
                            },
                            () => {
                                cmd.commandGroupCommitedToServer();
                            },
                            () => {
                                while (cmd.hasCommandGroups()) {
                                    cmd.undo();
                                }
                            },
                        );
                    };
                    if (!cmd.hasCommandGroups()) {
                        this.game.confirmationDialog(_('Do you really want to buy no cards?'), () => {
                            callServer();
                        });
                        return;
                    } else {
                        callServer();
                    }

                },
                onAnytimePlaceField(event, field) {
                    dojo.stopEvent(event);
                    if (!this.game.checkAction('phaseAnytimePlaceFieldShape')) {
                        return;
                    }
                    this.game.ajaxAction('phaseAnytimePlaceFieldShape', {
                        field: field,
                    });
                },
            }
        );
    }
);