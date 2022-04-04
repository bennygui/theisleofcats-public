<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * theisleofcats implementation : © Guillaume Benny bennygui@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * gameoptions.inc.php
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

require_once("modules/TiocGlobals.inc.php");

$game_options = [
    GAME_OPTION_FAMILY => [
        'name' => totranslate('Family Mode'),
        'values' => [
            GAME_OPTION_FAMILY_VALUE_OFF => [
                'name' => totranslate('Off'),
                'tmdisplay' => totranslate('Family mode off: Play the standard game'),
            ],
            GAME_OPTION_FAMILY_VALUE_ON => [
                'name' => totranslate('On'),
                'tmdisplay' => totranslate('Family mode on: Play the family game'),
                'description' => totranslate('Simpler game with no cards and resources management'),
            ],
        ],
        'startcondition' => [
            GAME_OPTION_FAMILY_VALUE_ON => [
                [
                    'type' => 'minplayers',
                    'value' => 2,
                    'message' => totranslate('The family mode cannot be played in solo'),
                ]
            ],
        ],
    ],
    GAME_OPTION_SOLO => [
        'name' => totranslate('Solo Mode'),
        'values' => [
            GAME_OPTION_SOLO_VALUE_OFF => [
                'name' => totranslate('Off'),
            ],
            GAME_OPTION_SOLO_VALUE_EASY => [
                'name' => totranslate('Easy'),
                'tmdisplay' => totranslate('Solo mode: Easy'),
                'description' => totranslate('Solo mode, Easy: 3 Solo Lessons'),
            ],
            GAME_OPTION_SOLO_VALUE_MEDIUM => [
                'name' => totranslate('Medium'),
                'tmdisplay' => totranslate('Solo mode: Medium'),
                'description' => totranslate('Solo mode, Medium: 3 Solo Lessons, 1 Advanced Solo Lesson'),
            ],
            GAME_OPTION_SOLO_VALUE_HARD => [
                'name' => totranslate('Hard'),
                'tmdisplay' => totranslate('Solo mode: Hard'),
                'description' => totranslate('Solo mode, Hard: 3 Solo Lessons, 2 Advanced Solo Lessons'),
            ],
            GAME_OPTION_SOLO_VALUE_VERY_HARD => [
                'name' => totranslate('Very Hard'),
                'tmdisplay' => totranslate('Solo mode: Very Hard'),
                'description' => totranslate('Solo mode, Very Hard: 3 Solo Lessons, 3 Advanced Solo Lessons'),
            ],
            GAME_OPTION_SOLO_VALUE_EXPERT => [
                'name' => totranslate('Expert'),
                'tmdisplay' => totranslate('Solo mode: Expert'),
                'description' => totranslate('Solo mode, Expert: 3 Solo Lessons, 4 Advanced Solo Lessons'),
            ],
        ],
        'startcondition' => [
            GAME_OPTION_SOLO_VALUE_OFF => [
                [
                    'type' => 'minplayers',
                    'value' => 2,
                    'message' => totranslate('Solo Mode requires to select only 1 player and a Solo Mode difficulty'),
                    'gamestartonly' => true,
                ]
            ],
            GAME_OPTION_SOLO_VALUE_EASY => [
                [
                    'type' => 'maxplayers',
                    'value' => 1,
                    'message' => totranslate('Solo Mode requires to select only 1 player and a Solo Mode difficulty'),
                    'gamestartonly' => true,
                ],
                [
                    'type' => 'otheroption',
                    'id' => GAME_OPTION_ELO,
                    'value' => GAME_OPTION_ELO_VALUE_OFF,
                    'message' => totranslate('Solo Mode requires to select Training mode'),
                    'gamestartonly' => true,
                ]
            ],
            GAME_OPTION_SOLO_VALUE_MEDIUM => [
                [
                    'type' => 'maxplayers',
                    'value' => 1,
                    'message' => totranslate('Solo Mode requires to select only 1 player and a Solo Mode difficulty'),
                    'gamestartonly' => true,
                ],
                [
                    'type' => 'otheroption',
                    'id' => GAME_OPTION_ELO,
                    'value' => GAME_OPTION_ELO_VALUE_OFF,
                    'message' => totranslate('Solo Mode requires to select Training mode'),
                    'gamestartonly' => true,
                ]
            ],
            GAME_OPTION_SOLO_VALUE_HARD => [
                [
                    'type' => 'maxplayers',
                    'value' => 1,
                    'message' => totranslate('Solo Mode requires to select only 1 player and a Solo Mode difficulty'),
                    'gamestartonly' => true,
                ],
                [
                    'type' => 'otheroption',
                    'id' => GAME_OPTION_ELO,
                    'value' => GAME_OPTION_ELO_VALUE_OFF,
                    'message' => totranslate('Solo Mode requires to select Training mode'),
                    'gamestartonly' => true,
                ]
            ],
            GAME_OPTION_SOLO_VALUE_VERY_HARD => [
                [
                    'type' => 'maxplayers',
                    'value' => 1,
                    'message' => totranslate('Solo Mode requires to select only 1 player and a Solo Mode difficulty'),
                    'gamestartonly' => true,
                ],
                [
                    'type' => 'otheroption',
                    'id' => GAME_OPTION_ELO,
                    'value' => GAME_OPTION_ELO_VALUE_OFF,
                    'message' => totranslate('Solo Mode requires to select Training mode'),
                    'gamestartonly' => true,
                ]
            ],
            GAME_OPTION_SOLO_VALUE_EXPERT => [
                [
                    'type' => 'maxplayers',
                    'value' => 1,
                    'message' => totranslate('Solo Mode requires to select only 1 player and a Solo Mode difficulty'),
                    'gamestartonly' => true,
                ],
                [
                    'type' => 'otheroption',
                    'id' => GAME_OPTION_ELO,
                    'value' => GAME_OPTION_ELO_VALUE_OFF,
                    'message' => totranslate('Solo Mode requires to select Training mode'),
                    'gamestartonly' => true,
                ]
            ],
        ],
    ],
];


$game_preferences = [
    USER_PREF_AUTO_PASS_ID => [
        'name' => totranslate('Automatically pass'),
        'values' => [
            USER_PREF_AUTO_PASS_VALUE_DISABLED => ['name' => totranslate('Disabled')],
            USER_PREF_AUTO_PASS_VALUE_ENABLED => ['name' => totranslate('Enabled')],
        ],
        'default' => USER_PREF_AUTO_PASS_VALUE_DISABLED,
    ],
    USER_PREF_SHOW_ASK_WHEN_TO_PLAY_ID => [
        'name' => totranslate('Show "When to play" buttons'),
        'values' => [
            USER_PREF_SHOW_ASK_WHEN_TO_PLAY_VALUE_NO_CARDS => ['name' => totranslate('Do not show')],
            USER_PREF_SHOW_ASK_WHEN_TO_PLAY_VALUE_IMPORTANT_CARDS => ['name' => totranslate('Important cards only')],
            USER_PREF_SHOW_ASK_WHEN_TO_PLAY_VALUE_ALL_CARDS => ['name' => totranslate('Show on all cards')],
        ],
        'default' => USER_PREF_SHOW_ASK_WHEN_TO_PLAY_VALUE_IMPORTANT_CARDS,
    ],
    USER_PREF_SHOW_START_MESSAGE_ID => [
        'name' => totranslate('Show Welcome message'),
        'values' => [
            USER_PREF_SHOW_START_MESSAGE_VALUE_SHOW => ['name' => totranslate('Show')],
            USER_PREF_SHOW_START_MESSAGE_VALUE_HIDE_V1 => ['name' => totranslate('Do not show')],
        ],
        'default' => USER_PREF_SHOW_START_MESSAGE_VALUE_SHOW,
    ],
    USER_PREF_SHOW_SMALL_SHAPES_ID => [
        'name' => totranslate('Show small shapes'),
        'values' => [
            USER_PREF_SHOW_SMALL_SHAPES_VALUE_ALWAYS_HIDE => ['name' => totranslate('Always hide')],
            USER_PREF_SHOW_SMALL_SHAPES_VALUE_SHOW_WHEN_PLACING => ['name' => totranslate('Show when placing')],
            USER_PREF_SHOW_SMALL_SHAPES_VALUE_ALWAYS_SHOW => ['name' => totranslate('Always show')],
        ],
        'default' => USER_PREF_SHOW_SMALL_SHAPES_VALUE_SHOW_WHEN_PLACING,
    ],
];
