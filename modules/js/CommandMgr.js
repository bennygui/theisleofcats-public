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
            'tioc.CommandMgr',
            null, {
                game: null,

                undoGroups: [],
                redoGroups: [],
                currentGroup: null,
                currentGroupDoIndex: null,
                observers: {},
                hideButtons: true,
                isButtonDisabled: false,
                lastSentActionLog: null,

                constructor(game) {
                    this.game = game;
                    this.lastSentActionLog = this._actionLogToSend();
                },
                setup(gamedatas) {},
                onEnteringState(stateName, args) {
                    this.hideButtons = true;
                    this.updateButtonVisibility();
                },
                onLeavingState(stateName) {
                    this.hideButtons = true;
                    this.updateButtonVisibility();
                },
                onUpdateActionButtons(stateName, args) {
                    this.game.addActionButton('button_undo', _('Undo'), () => this.undo());
                    this.game.addActionButton('button_redo', _('Redo'), () => this.redo());
                    this.updateButtonVisibility();
                },
                showButtons() {
                    this.hideButtons = false;
                    this.updateButtonVisibility();
                    this._notifyObservers();
                },
                disableButtons() {
                    this.isButtonDisabled = true;
                },
                enableButtons() {
                    this.isButtonDisabled = false;
                },
                updateButtonVisibility() {
                    if (document.getElementById('button_undo') !== null) {
                        if (this.hideButtons) {
                            dojo.addClass('button_undo', 'tioc-hidden');
                        } else {
                            dojo.removeClass('button_undo', 'tioc-hidden');
                            dojo.addClass('button_undo', 'disabled');
                            if (this.undoGroups.length != 0 || this.isInCommand()) {
                                dojo.removeClass('button_undo', 'tioc-hidden');
                                dojo.removeClass('button_undo', 'disabled');
                            }
                            if (this.isButtonDisabled) {
                                dojo.addClass('button_undo', 'disabled');
                            }
                        }
                    }
                    if (document.getElementById('button_redo') !== null) {
                        if (this.hideButtons) {
                            dojo.addClass('button_redo', 'tioc-hidden');
                        } else {
                            dojo.removeClass('button_redo', 'tioc-hidden');
                            dojo.addClass('button_redo', 'disabled');
                            if (this.redoGroups.length != 0 && !this.isInCommand()) {
                                dojo.removeClass('button_redo', 'tioc-hidden');
                                dojo.removeClass('button_redo', 'disabled');
                            }
                            if (this.isButtonDisabled) {
                                dojo.addClass('button_redo', 'disabled');
                            }
                        }
                    }
                },
                registerObserver(key, onChanged) {
                    this.observers[key] = onChanged;
                    onChanged(this);
                },
                unregisterObserver(key) {
                    delete this.observers[key];
                },
                _notifyObservers() {
                    this._sendActionLog();
                    for (const key in this.observers) {
                        this.observers[key](this);
                    }
                },
                isInCommand() {
                    return (this.currentGroup !== null);
                },
                hasCommandGroups() {
                    return (this.undoGroups.length > 0);
                },
                commandGroupsStateValues() {
                    return this.undoGroups.map((group) => group.stateValue);
                },
                currentCommandStateValue() {
                    if (this.currentGroup === null) {
                        return null;
                    }
                    return this.currentGroup.stateValue;
                },
                clearCommandGroup() {
                    this.undoGroups = [];
                    this.redoGroups = [];
                    this.currentGroup = null;
                    this.currentGroupDoIndex = null;
                    this.updateButtonVisibility();
                    this._notifyObservers();
                },
                commandGroupCommitedToServer() {
                    this.clearCommandGroup();
                },
                undo() {
                    if (this.isInCommand()) {
                        this._undoCurrentGroup(this.currentGroupDoIndex - 1);
                        this.updateButtonVisibility();
                        this._notifyObservers();
                    } else if (this.undoGroups.length > 0) {
                        let group = this.undoGroups.pop();
                        this._undoGroup(group);
                        this.redoGroups.push(group);
                        this.updateButtonVisibility();
                        this._notifyObservers();
                    }
                },
                redo() {
                    if (this.redoGroups.length == 0 || this.isInCommand()) {
                        return;
                    }
                    let group = this.redoGroups.pop();
                    this._redoGroup(group);
                    this.undoGroups.push(group);
                    this.updateButtonVisibility();
                    this._notifyObservers();
                },
                startCommand(initialStateValue = null) {
                    this.currentGroup = {
                        actions: [],
                        stateValue: initialStateValue,
                        description: null,
                        descriptionArgs: null,
                    };
                    this.updateButtonVisibility();
                    this._notifyObservers();
                },
                changeTitle(newTitle, newArgs = null) {
                    if (this.currentGroup === null) {
                        return;
                    }
                    if (this.currentGroup.description === null) {
                        this.currentGroup.description = this.game.gamedatas.gamestate.descriptionmyturn;
                        this.currentGroup.descriptionArgs = Object.assign({}, this.game.gamedatas.gamestate.args);
                    }
                    this.game.gamedatas.gamestate.descriptionmyturn = newTitle;
                    if (this.game.gamedatas.gamestate.args === null) {
                        this.game.gamedatas.gamestate.args = Object.assign({}, newArgs);
                    } else {
                        Object.assign(this.game.gamedatas.gamestate.args, newArgs);
                    }
                    this.game.updatePageTitle()
                },
                resetTitle() {
                    if (this.currentGroup === null || this.currentGroup.description === null) {
                        return;
                    }
                    this.game.gamedatas.gamestate.descriptionmyturn = this.currentGroup.description;
                    this.game.gamedatas.gamestate.args = this.currentGroup.descriptionArgs;
                    this.game.updatePageTitle()
                },
                addValidation(message, f) {
                    this.currentGroup.actions.push({
                        doFunction: (onContinue, onError) => {
                            if (f()) {
                                onContinue();
                            } else {
                                this.game.showMessage(message, 'error');
                                onError();
                            }
                        },
                    });
                },
                addSimple(doF, undoF) {
                    this.currentGroup.actions.push({
                        doFunction: (onContinue, onError) => {
                            doF();
                            onContinue();
                        },
                        redoFunction: doF,
                        undoFunction: undoF,
                    });
                },
                addSimple3(doF, redoF, undoF) {
                    this.currentGroup.actions.push({
                        doFunction: (onContinue, onError) => {
                            doF();
                            onContinue();
                        },
                        redoFunction: redoF,
                        undoFunction: undoF,
                    });
                },
                add(doF, redoF, undoF) {
                    this.currentGroup.actions.push({
                        doFunction: doF,
                        redoFunction: redoF,
                        undoFunction: undoF,
                    });
                },
                endCommand() {
                    this._endActionGroup(0);
                },
                _endActionGroup(i) {
                    if (i >= this.currentGroup.actions.length) {
                        this.undoGroups.push(this.currentGroup);
                        this.redoGroups = [];
                        this.resetTitle();
                        this.currentGroup = null;
                        this.currentGroupDoIndex = null;
                        this.updateButtonVisibility();
                        this._notifyObservers();
                        return;
                    }
                    this.currentGroupDoIndex = i;
                    this.currentGroup.actions[i].doFunction(
                        (value) => {
                            this.currentGroup.actions[i].doValue = value;
                            this._endActionGroup(i + 1);
                        },
                        () => this._undoCurrentGroup(i - 1),
                    );
                },
                _redoGroup(group) {
                    for (let i = 0; i < group.actions.length; ++i) {
                        if ('redoFunction' in group.actions[i] && group.actions[i].redoFunction !== null) {
                            group.actions[i].redoFunction(group.actions[i].doValue);
                        }
                    }
                },
                _undoGroup(group, startIndex = null) {
                    for (let i = startIndex !== null ? startIndex : group.actions.length - 1; i >= 0; --i) {
                        if ('undoFunction' in group.actions[i] && group.actions[i].undoFunction !== null) {
                            group.actions[i].undoFunction(group.actions[i].doValue);
                        }
                    }
                },
                _undoCurrentGroup(i) {
                    this._undoGroup(this.currentGroup, i);
                    this.resetTitle();
                    this.currentGroup = null;
                    this.currentGroupDoIndex = null;
                    this.updateButtonVisibility();
                    this._notifyObservers();
                },
                _actionLogToSend() {
                    return JSON.stringify({
                        undoStateValue: this.commandGroupsStateValues(),
                        currentStateValue: this.currentCommandStateValue(),
                    });
                },
                _sendActionLog() {
                    const actionLog = this._actionLogToSend();
                    if (this.lastSentActionLog == actionLog) {
                        return;
                    }
                    this.lastSentActionLog = actionLog;
                    if (window.tiocAddActionLog) {
                        window.tiocAddActionLog('cmd', actionLog);
                    }
                },
            }
        );
    }
);