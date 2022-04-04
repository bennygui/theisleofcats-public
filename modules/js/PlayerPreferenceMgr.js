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
            'tioc.PlayerPreferenceMgr',
            null, {

                USER_PREF_AUTO_PASS_ID: 102,
                USER_PREF_SHOW_ASK_WHEN_TO_PLAY_ID: 103,
                USER_PREF_SHOW_START_MESSAGE_ID: 104,
                USER_PREF_SHOW_SMALL_SHAPES_ID: 105,
                USER_PREF_BGA_TOOLTIPS_ID: 200,

                USER_PREF_SHOW_ASK_WHEN_TO_PLAY_VALUE_NO_CARDS: 0,
                USER_PREF_SHOW_ASK_WHEN_TO_PLAY_VALUE_IMPORTANT_CARDS: 1,
                USER_PREF_SHOW_ASK_WHEN_TO_PLAY_VALUE_ALL_CARDS: 2,

                USER_PREF_SHOW_SMALL_SHAPES_VALUE_ALWAYS_HIDE: 0,
                USER_PREF_SHOW_SMALL_SHAPES_VALUE_SHOW_WHEN_PLACING: 1,
                USER_PREF_SHOW_SMALL_SHAPES_VALUE_ALWAYS_SHOW: 2,
                SCALE_SELECT_ID_LIST: [
                    'tioc-player-panel-preference-scale-island',
                    'tioc-player-panel-preference-scale-cards',
                    'tioc-player-panel-preference-scale-other-boat',
                    'tioc-player-panel-preference-scale-player-boat',
                ],

                game: null,
                observers: {},

                constructor(game) {
                    this.game = game;
                },
                setup(gamedatas) {
                    if (this.game.isSpectator) {
                        return;
                    }
                    const insertPointElem = document.querySelector('#player_board_' + this.game.player_id + ' .tioc-player-panel-insert-point');
                    dojo.place(
                        this.game.format_block('jstpl_current_player_panel', {
                            preference_startmessage_title: _('Welcome message:'),
                            preference_startmessage_option_0: _('Show'),
                            preference_startmessage_option_1: _('Do not show'),

                            preference_auto_pass_title: _('Auto pass:'),
                            preference_auto_pass_option_0: _('Disabled'),
                            preference_auto_pass_option_1: _('Enabled'),

                            preference_small_shapes_title: _('Show small shapes:'),
                            preference_small_shapes_option_0: _('Always hide'),
                            preference_small_shapes_option_1: _('Show when placing'),
                            preference_small_shapes_option_2: _('Always show'),

                            preference_askwhentoplay_title: _('Show "When to play" buttons:'),
                            preference_askwhentoplay_option_0: _('Do not show'),
                            preference_askwhentoplay_option_1: _('Important cards only'),
                            preference_askwhentoplay_option_2: _('Show on all cards'),

                            preference_scale_island_title: _('Scale island and shapes:'),
                            preference_scale_cards_title: _('Scale cards:'),
                            preference_scale_other_boat_title: _('Scale other boats:'),
                            preference_scale_player_boat_title: _('Scale my boat:'),

                            preference_tooltips_title: _('Display tooltips:'),
                            preference_tooltips_option_0: _('Enabled'),
                            preference_tooltips_option_1: _('Disabled'),
                        }),
                        insertPointElem
                    );

                    // Setup preferences in player panel
                    const preferencesPanelElem = document.getElementById('tioc-player-panel-preferences');
                    const gearElem = document.getElementById('tioc-player-panel-gear');
                    this.game.connect(gearElem, 'onclick', (event) => {
                        window.tiocWrap('PlayerPreferenceMgr_setup_onclick', () => {
                            dojo.stopEvent(event);
                            preferencesPanelElem.classList.toggle('tioc-hidden');
                            this.game.adaptPlayersPanels();
                        });
                    });
                    dojo.query('#tioc-player-panel-preference-startmessage').on('change', (e) => {
                        this.setPreferenceValue(this.USER_PREF_SHOW_START_MESSAGE_ID, e.target.value);
                    });
                    dojo.query('#tioc-player-panel-preference-auto-pass').on('change', (e) => {
                        this.setPreferenceValue(this.USER_PREF_AUTO_PASS_ID, e.target.value);
                    });
                    dojo.query('#tioc-player-panel-preference-small-shapes').on('change', (e) => {
                        this.setPreferenceValue(this.USER_PREF_SHOW_SMALL_SHAPES_ID, e.target.value);
                    });
                    dojo.query('#tioc-player-panel-preference-askwhentoplay').on('change', (e) => {
                        this.setPreferenceValue(this.USER_PREF_SHOW_ASK_WHEN_TO_PLAY_ID, e.target.value);
                    });
                    dojo.query('#tioc-player-panel-preference-tooltips').on('change', (e) => {
                        this.setPreferenceValue(this.USER_PREF_BGA_TOOLTIPS_ID, e.target.value);
                    });
                    this.game.connect(document.getElementById('tioc-player-panel-preference-auto-pass-help'), 'onclick', (event) => {
                        window.tiocWrap('onclick_tioc_player_panel_preference_auto_pass_help', () => {
                            event.preventDefault();
                            this.game.showInformationDialog(
                                _('Automatically pass when no actions are possible'), [
                                    _("When this preference is enabled, the game will automatically pass if you have no possible actions."),
                                    '',
                                    _('Rescue phase'),
                                    _("In the Rescue phase, this means no unused permanent baskets, no playable rescue cards and no Anytime cards that could allow to Rescue another cat."),
                                    '',
                                    _('Rare Finds phase'),
                                    _("In the Rare Finds phase, this means no Treasure cards, no Oshax cards and no Anytime cards that could allow to play another Rare Finds."),
                                ]
                            );
                        });
                    });
                    this.game.connect(document.getElementById('tioc-player-panel-preference-small-shapes-help'), 'onclick', (event) => {
                        window.tiocWrap('onclick_tioc_player_panel_preference_small_shapes_help', () => {
                            event.preventDefault();
                            this.game.showInformationDialog(
                                _('Show small shapes above boat'), [
                                    _("This preference controls the small shapes that are displayed above the player boat to represent cats and treasures."),
                                    '',
                                    _('Show when placing'),
                                    _("The default is to show the small shapes above the player boat only when you have to choose shapes to place."),
                                    '',
                                    _('Always hide'),
                                    _("Never show the small shapes."),
                                    '',
                                    _('Always show'),
                                    _("You can show the small shapes above the player boat at all times. This can help reduce the scrolling since you do not have to scroll to the island at the top."),
                                ]
                            );
                        });
                    });
                    this.game.connect(document.getElementById('tioc-player-panel-preference-askwhentoplay-help'), 'onclick', (event) => {
                        window.tiocWrap('onclick_tioc_player_panel_preference_askwhentoplay_help', () => {
                            event.preventDefault();
                            this.game.showInformationDialog(
                                _('Show "When to play" buttons'), [
                                    _("Buttons are added to Anytime cards to select when the game will ask you to play those cards."),
                                    '',
                                    _('Important cards only'),
                                    _("The default is to ask at specific points only for some cards that can affect the gameplay when they are played between turns. You can always play Anytime cards on your turn in the Rescue and Rare Finds phases."),
                                    _("You should not have to change the default in almost all cases."),
                                    '',
                                    _('Do not show'),
                                    _("You can choose to hide those buttons if you never use them."),
                                    '',
                                    _('Show on all cards'),
                                    _("You can also choose to add those buttons on all Anytime cards if you want to control this for all Anytime cards, although there is not much value in this."),
                                ]
                            );
                        });
                    });

                    for (const id of this.SCALE_SELECT_ID_LIST) {
                        const select = document.getElementById(id);
                        select.addEventListener('change', () => this.onScaleChanged());
                        for (let i = 100; i >= 30; i -= 10) {
                            const option = document.createElement('option');
                            option.value = i;
                            option.innerText = i + '%';
                            select.add(option);
                        }
                        let scale = window.localStorage.getItem(id);
                        if (scale === undefined || scale === null) {
                            scale = 100;
                            window.localStorage.setItem(id, scale);
                        }
                        select.value = scale;
                    }
                    this.onScaleChanged();

                    this.initPreferencesObserver();
                },
                registerObserver(key, onChanged) {
                    this.observers[key] = onChanged;
                },
                unregisterObserver(key) {
                    delete this.observers[key];
                },
                _notifyObservers() {
                    for (const key in this.observers) {
                        this.observers[key](this);
                    }
                },
                onScaleChanged() {
                    for (const id of this.SCALE_SELECT_ID_LIST) {
                        const select = document.getElementById(id);
                        window.localStorage.setItem(id, parseInt(select.value));
                    }
                    this.game.rescale(
                        window.localStorage.getItem(this.SCALE_SELECT_ID_LIST[0]),
                        window.localStorage.getItem(this.SCALE_SELECT_ID_LIST[1]),
                        window.localStorage.getItem(this.SCALE_SELECT_ID_LIST[2]),
                        window.localStorage.getItem(this.SCALE_SELECT_ID_LIST[3])
                    );
                },
                setPreferenceValue(prefId, newValue) {
                    const optionSel = 'option[value="' + newValue + '"]';
                    dojo.query(
                        '#preference_control_' + prefId + ' > ' + optionSel + ', #preference_fontrol_' + prefId + ' > ' + optionSel,
                    ).attr('selected', true);
                    const select = $('preference_control_' + prefId);
                    if (dojo.isIE) {
                        select.fireEvent('onchange');
                    } else {
                        const event = document.createEvent('HTMLEvents');
                        event.initEvent('change', false, true);
                        select.dispatchEvent(event);
                    }
                },
                initPreferencesObserver() {
                    dojo.query('.preference_control').on('change', (e) => {
                        const match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
                        if (!match) {
                            return;
                        }
                        const pref = match[1];
                        const newValue = e.target.value;
                        this.game.prefs[pref].value = newValue;
                        this.onPreferenceChange(pref, newValue);
                    });
                },
                onPreferenceChange(prefId, prefValue, notify = true) {
                    prefId = parseInt(prefId);
                    switch (prefId) {
                        case this.USER_PREF_AUTO_PASS_ID:
                            this.game.ajaxAction('changePlayerPreference', {
                                prefId: prefId,
                                prefValue: prefValue,
                                notify: notify,
                                lock: false,
                            });
                            this.updateAutoPassPref(prefValue);
                            break;
                        case this.USER_PREF_SHOW_ASK_WHEN_TO_PLAY_ID:
                            this.updateShowAskWhenToPlayPref(prefValue);
                            break;
                        case this.USER_PREF_SHOW_START_MESSAGE_ID:
                            this.updateShowStartMessagePref(prefValue);
                            break;
                        case this.USER_PREF_SHOW_SMALL_SHAPES_ID:
                            this.updateShowSmallShapesPref(prefValue);
                            break;
                        case this.USER_PREF_BGA_TOOLTIPS_ID:
                            const selectElem = document.getElementById('tioc-player-panel-preference-tooltips');
                            selectElem.value = prefValue;
                            break;
                    }
                    this._notifyObservers();
                },
                checkPreferencesConsistency() {
                    if (this.game.isReadOnly()) {
                        return;
                    }
                    const serverPrefs = this.game.gamedatas.playerPreference;
                    for (const prefId in serverPrefs) {
                        if (prefId in this.game.prefs) {
                            if (this.game.prefs[prefId].value != serverPrefs[prefId]) {
                                this.onPreferenceChange(prefId, this.game.prefs[prefId].value, false);
                            } else if (prefId == this.USER_PREF_SHOW_START_MESSAGE_ID) {
                                this.updateShowStartMessagePref(this.game.prefs[prefId].value);
                            } else if (prefId == this.USER_PREF_SHOW_SMALL_SHAPES_ID) {
                                this.updateShowSmallShapesPref(this.game.prefs[prefId].value);
                            } else if (prefId == this.USER_PREF_AUTO_PASS_ID) {
                                this.updateAutoPassPref(this.game.prefs[prefId].value);
                            }
                        }
                    }
                    const prefIdArray = [
                        this.USER_PREF_BGA_TOOLTIPS_ID,
                        this.USER_PREF_SHOW_ASK_WHEN_TO_PLAY_ID,
                        this.USER_PREF_SHOW_START_MESSAGE_ID,
                        this.USER_PREF_SHOW_SMALL_SHAPES_ID
                    ];
                    for (const prefId of prefIdArray) {
                        let selectElem = document.getElementById('preference_control_' + prefId);
                        if (selectElem === null) {
                            selectElem = document.getElementById('preference_fontrol_' + prefId);
                        }
                        if (selectElem !== null) {
                            this.onPreferenceChange(prefId, selectElem.value);
                        }
                    }
                },
                updateAutoPassPref(prefValue) {
                    const selectElem = document.getElementById('tioc-player-panel-preference-auto-pass');
                    if (selectElem === null) {
                        return;
                    }
                    selectElem.value = prefValue;
                },
                updateShowAskWhenToPlayPref(prefValue) {
                    const selectElem = document.getElementById('tioc-player-panel-preference-askwhentoplay');
                    if (selectElem === null) {
                        return;
                    }
                    selectElem.value = prefValue;
                },
                getShowAskWhenToPlayPref() {
                    const selectElem = document.getElementById('tioc-player-panel-preference-askwhentoplay');
                    if (selectElem === null) {
                        return;
                    }
                    return parseInt(selectElem.value);
                },
                updateShowStartMessagePref(prefValue) {
                    const selectElem = document.getElementById('tioc-player-panel-preference-startmessage');
                    if (selectElem === null) {
                        return;
                    }
                    selectElem.value = prefValue;
                },
                getShowStartMessagePref() {
                    const selectElem = document.getElementById('tioc-player-panel-preference-startmessage');
                    if (selectElem === null) {
                        return;
                    }
                    return parseInt(selectElem.value);
                },
                updateShowSmallShapesPref(prefValue) {
                    const selectElem = document.getElementById('tioc-player-panel-preference-small-shapes');
                    if (selectElem === null) {
                        return;
                    }
                    selectElem.value = prefValue;
                },
                getShowSmallShapesPref() {
                    const selectElem = document.getElementById('tioc-player-panel-preference-small-shapes');
                    if (selectElem === null) {
                        return;
                    }
                    return parseInt(selectElem.value);
                },
            }
        );
    }
);