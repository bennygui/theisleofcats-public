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
            'tioc.FishMgr',
            null, {
                game: null,
                playerPanelFishCounter: {},
                playerFishCounter: {},
                constructor(game) {
                    this.game = game;
                },
                setup(gamedatas) {
                    for (let playerId in gamedatas.players) {
                        this.playerPanelFishCounter[playerId] = new ebg.counter();
                        this.playerPanelFishCounter[playerId].create('tioc-player-panel-fish-counter-' + playerId);
                        this.playerPanelFishCounter[playerId].setValue(gamedatas.players[playerId].fish_count);

                        this.playerFishCounter[playerId] = new ebg.counter();
                        this.playerFishCounter[playerId].create('tioc-player-fish-counter-' + playerId);
                        this.playerFishCounter[playerId].setValue(gamedatas.players[playerId].fish_count);
                    }
                },
                setFishToPlayer(playerId, nbFish) {
                    this.playerPanelFishCounter[playerId].toValue(nbFish);
                    this.playerFishCounter[playerId].toValue(nbFish);
                },
                currentPlayerFishCount() {
                    return this.playerPanelFishCounter[this.game.player_id].getValue();
                },
                useCurrentPlayerFish(nbFish, showOnElemId = null) {
                    this.playerPanelFishCounter[this.game.player_id].incValue(-1 * nbFish);
                    this.playerFishCounter[this.game.player_id].incValue(-1 * nbFish);
                    this._displayFishUse(showOnElemId, -1 * nbFish);
                },
                gainCurrentPlayerFish(nbFish, showOnElemId = null) {
                    this.playerPanelFishCounter[this.game.player_id].incValue(nbFish);
                    this.playerFishCounter[this.game.player_id].incValue(nbFish);
                    this._displayFishUse(showOnElemId, nbFish);
                },
                _displayFishUse(elemId, nbFish) {
                    if (elemId === null) {
                        return;
                    }
                    const elem = document.getElementById(elemId);
                    if (elem === null) {
                        return;
                    }
                    this.game.displayScoring(
                        elem,
                        '0000ff',
                        nbFish,
                        1
                    );
                },
            }
        );
    }
);