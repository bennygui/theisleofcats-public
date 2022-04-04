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
            'tioc.TitleMgr',
            null, {
                game: null,

                savedTitle: null,
                titleChanged: false,

                constructor(game) {
                    this.game = game;
                },
                setup(gamedatas) {},
                onEnteringState(stateName, args) {
                    this.savedTitle = {};
                    this.savedTitle.description = this.game.gamedatas.gamestate.descriptionmyturn;
                    this.savedTitle.descriptionArgs = Object.assign({}, this.game.gamedatas.gamestate.args);
                },
                onLeavingState(stateName) {
                    this.savedTitle = null;
                    this.titleChanged = false;
                },
                _changeTitle(newTitle, newArgs = null) {
                    if (this.savedTitle === null || newTitle == this.game.gamedatas.gamestate.descriptionmyturn) {
                        return;
                    }
                    this.titleChanged = true;
                    this.game.gamedatas.gamestate.descriptionmyturn = newTitle;
                    if (this.game.gamedatas.gamestate.args === null) {
                        this.game.gamedatas.gamestate.args = Object.assign({}, newArgs);
                    } else {
                        Object.assign(this.game.gamedatas.gamestate.args, newArgs);
                    }
                    this.game.updatePageTitle();
                },
                _resetTitle() {
                    if (!this.titleChanged || this.savedTitle === null || this.savedTitle.description === null) {
                        return;
                    }
                    this.game.gamedatas.gamestate.descriptionmyturn = this.savedTitle.description;
                    this.game.gamedatas.gamestate.args = this.savedTitle.descriptionArgs;
                    this.titleChanged = false;
                    this.game.updatePageTitle();
                },
                titleChanger(titleChangeFct) {
                    const newObj = titleChangeFct();
                    let newTitle = null;
                    let newArgs = null;
                    if (newObj !== null) {
                        if (typeof newObj == "string") {
                            newTitle = newObj;
                        } else {
                            newTitle = newObj.title;
                            newArgs = newObj.args;
                        }
                    }
                    if (this.game.commandMgr.isInCommand()) {
                        return;
                    }
                    if (newTitle === null) {
                        this._resetTitle();
                    } else {
                        this._changeTitle(newTitle, newArgs);
                    }
                },
            }
        );
    }
);