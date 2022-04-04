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
            'tioc.Phase45Mgr',
            null, {
                game: null,

                PHASE_STR_ID_4: '4',
                PHASE_STR_ID_5: '5',
                PHASE_STR_ID_ANYTIME_DRAW_AND_BOAT_SHAPE: 'AnytimeDrawAndBoatShape',
                turnActionCounts: null,

                constructor(game) {
                    this.game = game;
                },
                setup(gamedatas) {
                    this.updateTurnAction(gamedatas.turnAction);
                },
                onEnteringState(stateName, args) {
                    this.updateTurnAction(args ? args.args : null);
                    this.updateShapesPlayedMove();
                    switch (stateName) {
                        case 'STATE_PHASE_4_CHOOSE_RESCUE_CARDS':
                        case 'STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE':
                            if (this.game.isCurrentPlayerActive()) {
                                this.game.cardMgr.allowSelectHandRescueCards();
                            }
                            break;
                        case 'STATE_PHASE_4_RESCUE_CAT':
                            if (this.game.isCurrentPlayerActive()) {
                                this.game.commandMgr.showButtons();
                                this.game.cardMgr.allowPlayRescueCards();
                                this.game.cardMgr.allowPlayAllAnytimeCards();
                                this.game.basketMgr.allowPlayBaskets();
                                if (this.canTakeCommonTreasure()) {
                                    this.game.islandMgr.allowTakeCommonTreasure();
                                }
                            }
                            break;
                        case 'STATE_PHASE_5_RARE_FINDS':
                            if (this.game.isCurrentPlayerActive()) {
                                this.game.commandMgr.showButtons();
                                this.game.cardMgr.allowPlayRareFindsCards();
                                this.game.cardMgr.allowPlayAllAnytimeCards();
                            }
                            break;
                        case 'STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE':
                            if (this.game.isCurrentPlayerActive()) {
                                this.game.commandMgr.showButtons();
                                this.game.islandMgr.allowTakeToPlaceShape();
                                this.game.cardMgr.allowPlayNextShapeAnywhereAnytimeCards();
                            }
                            break;
                        case 'STATE_PHASE_ANYTIME_ROUND':
                            if (args.args.gameEnded) {
                                this.game.removeClass('tioc-warn-last-turn', 'tioc-hidden');
                            }
                            if (this.game.isCurrentPlayerActive()) {
                                this.game.commandMgr.showButtons();
                                this.game.cardMgr.allowPlayAllAnytimeCards(() => {
                                    if (this.game.commandMgr.hasCommandGroups()) {
                                        this.game.showMessage(_('You can only play one anytime card'), 'error');
                                        return false;
                                    }
                                    return true;
                                });
                            }
                            break;
                        case 'STATE_FAMILY_RESCUE_CAT':
                            if (this.game.isCurrentPlayerActive()) {
                                this.game.commandMgr.showButtons();
                                this.game.islandMgr.allowFamilyRescueCat();
                            }
                            break;
                    }
                },
                onLeavingState(stateName) {
                    dojo.destroy('tioc-help-skip-anytime');
                    this.game.cardMgr.disallowPlayRescueCards();
                    this.game.basketMgr.disallowPlayBaskets();
                    this.game.commandMgr.unregisterObserver('tioc.Phase45Mgr');
                    this.game.islandMgr.updateTopShapes();
                    this.game.addClass('tioc-warn-last-turn', 'tioc-hidden');
                    this.updateShapesPlayedMove();
                },
                updateShapesPlayedMove() {
                    if (this.turnActionCounts && 'lastSeenMoveNumber' in this.turnActionCounts) {
                        this.game.boatMgr.updateShapesPlayedMove(this.turnActionCounts.lastSeenMoveNumber);
                        this.game.islandMgr.updateShapesPlayedMove(this.turnActionCounts.lastSeenMoveNumber);
                    }
                },
                onUpdateActionButtons(stateName, args) {
                    dojo.destroy('tioc-help-skip-anytime');
                    switch (stateName) {
                        case 'STATE_PHASE_4_CHOOSE_RESCUE_CARDS':
                        case 'STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE':
                            this.onEnteringState(stateName, args);
                            this.game.addActionButton(
                                'button_phase_4_play_rescue_cards',
                                _('Play selected rescue cards'),
                                (event) => {
                                    this.onPlayRescueCards(event);
                                },
                            );
                            break;
                        case 'STATE_PHASE_4_RESCUE_CAT':
                        case 'STATE_PHASE_5_RARE_FINDS':
                            let phaseStrId = null;
                            if (stateName == 'STATE_PHASE_5_RARE_FINDS') {
                                phaseStrId = this.PHASE_STR_ID_5;
                                dojo.place(this.game.format_block('jstpl_phase_5_icon', {}), 'generalactions');
                            } else {
                                phaseStrId = this.PHASE_STR_ID_4;
                                dojo.place(this.game.format_block('jstpl_phase_4_icon', {}), 'generalactions');
                            }
                            this.game.addActionButton(
                                'button_confirm_actions',
                                _('Confirm'),
                                (event) => {
                                    this.onConfirmActions(event, phaseStrId);
                                },
                            );
                            this.game.addActionButton(
                                'button_phase_45_pass',
                                _('Pass'),
                                (event) => {
                                    this.onPass(event, phaseStrId);
                                },
                                null, // unused
                                false, // blinking
                                'red'
                            );
                            this.game.commandMgr.registerObserver('tioc.Phase45Mgr', (cmd) => {
                                this.updateButtons(cmd);
                                this._updateAvailableActions();
                            });
                            break;
                        case 'STATE_FAMILY_RESCUE_CAT':
                            this.game.addActionButton(
                                'button_confirm_actions',
                                _('Confirm'),
                                (event) => {
                                    this.onFamilyConfirmActions(event);
                                },
                            );
                            this.game.addActionButton(
                                'button_phase_45_pass',
                                _('Pass'),
                                (event) => {
                                    this.onFamilyPass(event);
                                },
                                null, // unused
                                false, // blinking
                                'red'
                            );
                            this.game.commandMgr.registerObserver('tioc.Phase45Mgr', (cmd) => {
                                this.updateButtons(cmd);
                                this._updateAvailableActions();
                            });
                            break;
                        case 'STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE':
                            this.game.addActionButton(
                                'button_confirm_actions',
                                _('Confirm'),
                                (event) => {
                                    this.onConfirmActions(event, this.PHASE_STR_ID_ANYTIME_DRAW_AND_BOAT_SHAPE);
                                },
                            );
                            this.game.commandMgr.registerObserver('tioc.Phase45Mgr', (cmd) => {
                                this.updateButtons(cmd);
                                this._updateAvailableActions();
                            });
                            break;
                        case 'STATE_PHASE_ANYTIME_ROUND':
                            dojo.place(this.game.format_block('jstpl_phase_anytime_icon', {}), 'generalactions');
                            this.game.addActionButton(
                                'button_confirm_actions',
                                _('Confirm Anytime Card'),
                                (event) => {
                                    this.onConfirmAnytimeRound(event);
                                },
                            );
                            this.game.addActionButton(
                                'button_anytime_round_play_nothing',
                                _('Play nothing'),
                                (event) => {
                                    this.onConfirmAnytimeRound(event);
                                },
                            );
                            this.game.commandMgr.registerObserver('tioc.Phase45Mgr', (cmd) => {
                                this.updateButtons(cmd);
                                this._updateAvailableActions();
                            });
                            const skipElem = dojo.place('<a href="#" id="tioc-help-skip-anytime"></a>', 'maintitlebar_content', 'after');
                            skipElem.innerText = _('Want to skip this question?');
                            this.game.clickConnect(skipElem, (event) => {
                                window.tiocWrap('onclick_help_skip_anytime', () => {
                                    event.preventDefault();
                                    this.game.showInformationDialog(
                                        _('Tired of being asked to play an Anytime card?'), [
                                            _("You can play Anytime cards on your regular turn and there are very few cards that have an impact on other players."),
                                            _("So if you don't want to be asked to play Anytime cards, you can change the Anytime cards settings: click on the gear icon in your player panel (where you can see your username and your score) and choose the settings you prefer.")
                                        ]
                                    );
                                });
                            });
                            break;
                    }
                },
                updateTurnAction(turnActionAllPlayers) {
                    if (!turnActionAllPlayers) {
                        return;
                    }
                    //console.log('=== turnAction START ===');
                    this.turnActionCounts = {};
                    for (const playerId in turnActionAllPlayers) {
                        if (playerId != this.game.player_id) {
                            continue;
                        }
                        const turnAction = turnActionAllPlayers[playerId];
                        for (const key in turnAction) {
                            this.turnActionCounts[key] = parseInt(turnAction[key]);
                            //if (this.turnActionCounts[key] != 0) {
                            //    console.log(key + ': ' + this.turnActionCounts[key]);
                            //}
                        }
                    }
                    //console.log(this.turnActionCounts);
                    //console.log('=== turnAction END ===');
                    this._updateAvailableActions();
                },
                updateButtons(cmd) {
                    this.game.addClass('button_confirm_actions', 'disabled');
                    this.game.addClass('button_phase_45_pass', 'disabled');
                    this.game.addClass('button_anytime_round_play_nothing', 'disabled');
                    if (!cmd.isInCommand() && !cmd.hasCommandGroups()) {
                        this.game.removeClass('button_anytime_round_play_nothing', 'disabled');
                    }
                    if (!cmd.isInCommand() && (this.turnActionCounts === null || cmd.hasCommandGroups() || this.hasRescuedCat() || this.hasRareFinds())) {
                        this.game.removeClass('button_confirm_actions', 'disabled');
                    }
                    if (this.turnActionCounts !== null && !this.hasRescuedCat() && !this.hasRareFinds() && !cmd.isInCommand() && this.cmdOnlyHasAnytimeCards()) {
                        this.game.removeClass('button_phase_45_pass', 'disabled');
                    }
                },
                cmdOnlyHasAnytimeCards() {
                    return this.game.anytimeActionMgr.cmdOnlyHasAnytimeCards();
                },
                hasRescuedCat() {
                    return (this.turnActionCounts.takeCatCount > 0);
                },
                canRescueCat() {
                    return (this.turnActionCounts.takeCatCount < this.turnActionCounts.allowedCatCount);
                },
                rescuedCatCount() {
                    if (this.turnActionCounts.takeCatCount === undefined || this.turnActionCounts.takeCatCount === null) {
                        return 0;
                    }
                    return this.turnActionCounts.takeCatCount;
                },
                catRescued() {
                    ++this.turnActionCounts.takeCatCount;
                    this._updateAvailableActions();
                },
                undoCatRescued() {
                    --this.turnActionCounts.takeCatCount;
                    this._updateAvailableActions();
                },
                allowRescueExtraCat() {
                    ++this.turnActionCounts.allowedCatCount;
                    this._updateAvailableActions();
                },
                undoAllowRescueExtraCat() {
                    --this.turnActionCounts.allowedCatCount;
                    this._updateAvailableActions();
                },
                canTakeCommonTreasure() {
                    if (!this.game.islandMgr.hasCommonTreasure()) {
                        return false;
                    }
                    return (this.turnActionCounts.takeCommonTreasureCount < this.turnActionCounts.allowedCommonTreasureCount);
                },
                allowTakeCommonTreasure() {
                    ++this.turnActionCounts.allowedCommonTreasureCount;
                    this._updateAvailableActions();
                },
                undoAllowTakeCommonTreasure() {
                    --this.turnActionCounts.allowedCommonTreasureCount;
                    this._updateAvailableActions();
                },
                takeCommonTreasure() {
                    ++this.turnActionCounts.takeCommonTreasureCount;
                    this._updateAvailableActions();
                },
                undoTakeCommonTreasure() {
                    --this.turnActionCounts.takeCommonTreasureCount;
                    this._updateAvailableActions();
                },
                hasRareFinds() {
                    return (this.turnActionCounts.playedRareFindsCount > 0);
                },
                playRareFinds() {
                    ++this.turnActionCounts.playedRareFindsCount;
                    this._updateAvailableActions();
                },
                undoPlayRareFinds() {
                    --this.turnActionCounts.playedRareFindsCount;
                    this._updateAvailableActions();
                },
                canTakeRareTreasure() {
                    if (!this.game.islandMgr.hasRareTreasure()) {
                        return false;
                    }
                    return (this.turnActionCounts.takeRareTreasureCount < this.turnActionCounts.allowedRareTreasureCount);
                },
                allowTakeRareTreasure() {
                    ++this.turnActionCounts.allowedRareTreasureCount;
                    this._updateAvailableActions();
                },
                undoAllowTakeRareTreasure() {
                    --this.turnActionCounts.allowedRareTreasureCount;
                    this._updateAvailableActions();
                },
                takeRareTreasure() {
                    ++this.turnActionCounts.takeRareTreasureCount;
                    this._updateAvailableActions();
                },
                undoTakeRareTreasure() {
                    --this.turnActionCounts.takeRareTreasureCount;
                    this._updateAvailableActions();
                },
                canTakeSmallTreasure() {
                    if (!this.game.islandMgr.hasSmallTreasure()) {
                        return false;
                    }
                    return (this.turnActionCounts.takeSmallTreasureCount < this.turnActionCounts.allowedSmallTreasureCount);
                },
                allowTakeSmallTreasure() {
                    ++this.turnActionCounts.allowedSmallTreasureCount;
                    this._updateAvailableActions();
                },
                undoAllowTakeSmallTreasure() {
                    --this.turnActionCounts.allowedSmallTreasureCount;
                    this._updateAvailableActions();
                },
                takeSmallTreasure() {
                    ++this.turnActionCounts.takeSmallTreasureCount;
                    this._updateAvailableActions();
                },
                undoTakeSmallTreasure() {
                    --this.turnActionCounts.takeSmallTreasureCount;
                    this._updateAvailableActions();
                },
                allowNextShapeAnywhere() {
                    ++this.turnActionCounts.allowedNextShapeAnywhere;
                    this._updateAvailableActions();
                },
                undoAllowNextShapeAnywhere() {
                    --this.turnActionCounts.allowedNextShapeAnywhere;
                    this._updateAvailableActions();
                },
                takeNextShapeAnywhere() {
                    ++this.turnActionCounts.takeNextShapeAnywhere;
                    this._updateAvailableActions();
                },
                undoTakeNextShapeAnywhere() {
                    --this.turnActionCounts.takeNextShapeAnywhere;
                    this._updateAvailableActions();
                },
                canPutNextShapeAnywhere() {
                    return (this.turnActionCounts.takeNextShapeAnywhere < this.turnActionCounts.allowedNextShapeAnywhere);
                },
                _updateAvailableActions() {
                    if (this.game.isSpectator) {
                        return;
                    }
                    this.game.titleMgr.titleChanger(() => {
                        this.game.islandMgr.disallowTakeTreasure();
                        if (this.turnActionCounts === null) {
                            return null;
                        }
                        let newTitle = null;
                        if (this.canTakeCommonTreasure() && this.canTakeRareTreasure()) {
                            newTitle = _('${you} must choose a common or a rare treasure');
                            this.game.islandMgr.allowTakeCommonTreasure(
                                () => {
                                    this.undoAllowTakeRareTreasure();
                                    this.takeCommonTreasure();
                                },
                                () => {
                                    this.allowTakeRareTreasure();
                                    this.undoTakeCommonTreasure();
                                }
                            );
                            this.game.islandMgr.allowTakeRareTreasure();
                        } else if (this.canTakeSmallTreasure()) {
                            newTitle = _('${you} must choose a small common treasure');
                            this.game.islandMgr.allowTakeSmallTreasure();
                        } else if (this.canTakeCommonTreasure()) {
                            newTitle = _('${you} must choose a common treasure');
                            this.game.islandMgr.allowTakeCommonTreasure();
                        } else if (this.canTakeRareTreasure()) {
                            newTitle = _('${you} must choose a rare treasure');
                            this.game.islandMgr.allowTakeRareTreasure();
                        } else {
                            if ((this.game.gamedatas.gamestate.name == 'STATE_PHASE_4_RESCUE_CAT' && this.hasRescuedCat() && !this.canRescueCat()) ||
                                (this.game.gamedatas.gamestate.name == 'STATE_PHASE_5_RARE_FINDS' && this.hasRareFinds()) ||
                                (this.game.gamedatas.gamestate.name == 'STATE_FAMILY_RESCUE_CAT' && this.hasRescuedCat())
                            ) {
                                if (this.game.cardMgr.hasAnytimeCardsInHand()) {
                                    newTitle = _('${you} must confirm or play an Anytime card');
                                } else {
                                    newTitle = _('${you} must confirm');
                                }
                            }
                        }
                        return newTitle;
                    });
                },
                onPlayRescueCards(event) {
                    dojo.stopEvent(event);
                    if (!this.game.checkAction('phase4PlayRescueCards')) {
                        return;
                    }
                    const selectedCards = this.game.cardMgr.getSelectedHandRescueCards();
                    const allRescueCards = this.game.cardMgr.getAllHandRescueCards();
                    const callServer = () => {
                        this.game.ajaxAction(
                            'phase4PlayRescueCards', {
                                card_ids: Array.from(selectedCards).map((card) => card.dataset.cardId).join(','),
                            }
                        );
                    };
                    if (selectedCards.length == 0 && allRescueCards.length > 0) {
                        this.game.confirmationDialog(_('Do you really want to play no rescue cards? Rescue cards in your hand will not be available to rescue cats this day (but will be kept in your hand for the next day). Are you sure?'), () => {
                            callServer();
                        });
                        return;
                    } else if (selectedCards.length != allRescueCards.length) {
                        this.game.confirmationDialog(_('You have not selected all rescue cards. Those not selected will not be available to rescue cats this day (but will be kept in your hand for the next day). Are you sure?'), () => {
                            callServer();
                        });
                        return;
                    } else {
                        callServer();
                    }
                },
                onPass(event, phaseStrId) {
                    dojo.stopEvent(event);
                    if (!this.game.checkAction('phase' + phaseStrId + 'Pass')) {
                        return;
                    }
                    const cmd = this.game.commandMgr;
                    const callServer = () => {
                        this.confirmPass(() => {
                            this.game.ajaxAction('phase' + phaseStrId + 'Pass', {
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
                        });
                    };
                    if (!this.cmdOnlyHasAnytimeCards()) {
                        this.game.showMessage(_('You can only play Anytime cards before passing'), 'error');
                        return;
                    } else if (this.canTakeCommonTreasure() || this.canTakeRareTreasure() || this.canTakeSmallTreasure()) {
                        this.game.confirmationDialog(_('You can still place some shapes, are you sure you want to pass?'), () => {
                            callServer();
                        });
                        return;
                    } else {
                        callServer();
                    }
                },
                confirmPass(onConfirm) {
                    let message = null;
                    switch (this.game.gamedatas.gamestate.name) {
                        case 'STATE_PHASE_4_RESCUE_CAT':
                            if (this.game.basketMgr.getCurrentPlayerRemainBasketCount() > 0) {
                                message = _('You can still play baskets, are you sure you want to pass?');
                            }
                            break;
                        case 'STATE_PHASE_5_RARE_FINDS':
                            if ((this.game.cardMgr.countOshaxCards() + this.game.cardMgr.countTreasureCards()) > 0) {
                                message = _('You still have Oshax or Treasure cards, are you sure you want to pass?');
                            }
                            break;
                    }
                    if (message === null) {
                        onConfirm();
                    } else {
                        this.game.confirmationDialog(message, () => {
                            onConfirm();
                        });
                    }
                },
                onConfirmActions(event, phaseStrId) {
                    dojo.stopEvent(event);
                    if (!this.game.checkAction('phase' + phaseStrId + 'ConfirmActions')) {
                        return;
                    }
                    const cmd = this.game.commandMgr;
                    const callServer = () => {
                        this.game.ajaxAction('phase' + phaseStrId + 'ConfirmActions', {
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
                    if (phaseStrId == this.PHASE_STR_ID_ANYTIME_DRAW_AND_BOAT_SHAPE && this.canTakeCommonTreasure()) {
                        this.game.confirmationDialog(_('You can still place some treasures, are you sure you want to confirm, you will lose your treasures?'), () => {
                            callServer();
                        });
                        return;
                    } else if ((phaseStrId == this.PHASE_STR_ID_4 && this.canRescueCat()) || this.canTakeCommonTreasure() || this.canTakeRareTreasure() || this.canTakeSmallTreasure()) {
                        this.game.confirmationDialog(_('You can still place some shapes, are you sure you want to end your turn?'), () => {
                            callServer();
                        });
                        return;
                    } else {
                        callServer();
                    }
                },
                onConfirmAnytimeRound(event) {
                    dojo.stopEvent(event);
                    if (!this.game.checkAction('phaseAnytimeRoundConfirm')) {
                        return;
                    }
                    const cmd = this.game.commandMgr;
                    this.game.ajaxAction('phaseAnytimeRoundConfirm', {
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
                },
                onFamilyConfirmActions(event) {
                    dojo.stopEvent(event);
                    if (!this.game.checkAction('familyConfirmActions')) {
                        return;
                    }
                    const cmd = this.game.commandMgr;
                    const callServer = () => {
                        this.game.ajaxAction('familyConfirmActions', {
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
                    if (this.canTakeCommonTreasure() || this.canTakeRareTreasure()) {
                        this.game.confirmationDialog(_('You can still place some treasures, are you sure you want to confirm, you will lose your treasures?'), () => {
                            callServer();
                        });
                        return;
                    } else {
                        callServer();
                        return;
                    }
                },
                onFamilyPass(event, phaseStrId) {
                    dojo.stopEvent(event);
                    if (!this.game.checkAction('familyPass')) {
                        return;
                    }
                    const cmd = this.game.commandMgr;
                    if (cmd.isInCommand() || cmd.hasCommandGroups()) {
                        this.game.showMessage(_('You cannot pass once you have done actions'), 'error');
                        return;
                    }
                    this.game.confirmationDialog(_('Are you sure you want to pass, you will not be able to rescue other cats for this day?'), () => {
                        this.game.ajaxAction('familyPass', {});
                    });
                },
            }
        );
    }
);