<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * theisleofcats implementation : © Guillaume Benny bennygui@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

const MAX_NUMBER_OF_PLAYERS = 4;

const CAT_COLOR_ID_BLUE = 0;
const CAT_COLOR_ID_GREEN = 1;
const CAT_COLOR_ID_RED = 2;
const CAT_COLOR_ID_PURPLE = 3;
const CAT_COLOR_ID_ORANGE = 4;

const CAT_COLORS = ['67bed0', '29b35a', 'd45965', '9866ab', 'dcb039'];
const CAT_COLOR_NAMES = ['blue', 'green', 'red', 'purple', 'orange'];
const CAT_COLOR_IDS = [
    CAT_COLOR_ID_BLUE,
    CAT_COLOR_ID_GREEN,
    CAT_COLOR_ID_RED,
    CAT_COLOR_ID_PURPLE,
    CAT_COLOR_ID_ORANGE,
];

const BOAT_COLOR_NAMES = ['blue', 'green', 'red', 'purple'];

const START_DAY_NUMBER = 5;
const PLAYER_NB_START_BASKET = 1;
const NB_CARDS_KEEP_PER_DRAFT = 2;
const NB_CARDS_KEEP_SOLO = 3;
const NB_CARDS_KEEP_FAMILY = 2;
const CAT_PRICE_LEFT_FIELD = 3;
const CAT_PRICE_RIGHT_FIELD = 5;
const ANYTIME_DRAW_AND_FIELD_COUNT_MAX = 4;
const NB_BOAT_ROOMS_TOTAL = 7;
const FIELD_LEFT = 'FIELD_LEFT';
const FIELD_RIGHT = 'FIELD_RIGHT';
const FIELD_LIST = [FIELD_LEFT, FIELD_RIGHT];
const SOLO_SISTER_PLAYER_ID = 1;

function array_from_indexes(array $array_values, array $array_indexes)
{
    $ret = [];
    foreach ($array_indexes as $index) {
        $ret[] = $array_values[$index];
    }
    return $ret;
}

function sqlNullOrValue($value)
{
    if ($value === null) {
        return "NULL";
    }
    if (is_string($value)) {
        return "'" . addslashes($value) . "'";
    } else if (is_bool($value)) {
        return ($value ? "1" : "0");
    } else {
        return "$value";
    }
}

function value_req(array $array, string $key)
{
    if (!array_key_exists($key, $array))
        throw new BgaVisibleSystemException("BUG! key $key does not exist");
    if ($array[$key] === null)
        throw new BgaVisibleSystemException("BUG! key $key is null");
    return $array[$key];
}

function value_req_null(array $array, string $key)
{
    if (!array_key_exists($key, $array))
        throw new BgaVisibleSystemException("BUG! key $key does not exist");
    return $array[$key];
}

function toNotifArray($array_or_value)
{
    if (is_array($array_or_value)) {
        return array_map(function ($v) {
            return toNotifArray($v);
        }, $array_or_value);
    }
    if (is_object($array_or_value)) {
        return toNotifArray((array)$array_or_value);
    }
    return $array_or_value;
}

// Actions type
const ACTION_TYPE_ID_RESCUE_CARD = 0;
const ACTION_TYPE_ID_RESCUE_BASKET = 1;
const ACTION_TYPE_ID_COMMON_TREASURE = 2;
const ACTION_TYPE_ID_OSHAX = 3;
const ACTION_TYPE_ID_TREASURE_CARD = 4;
const ACTION_TYPE_ID_RARE_TREASURE = 5;
const ACTION_TYPE_ID_ANYTIME_CARD = 6;
const ACTION_TYPE_ID_BUY_CARD = 7;
const ACTION_TYPE_ID_TO_PLACE_SHAPE = 8;
const ACTION_TYPE_ID_UNBUY_CARD = 9;
const ACTION_TYPE_ID_ANYTIME_PREF = 10;
const ACTION_TYPE_ID_RESCUE_FAMILY = 11;

// State Globals

const STG_DAY_COUNTER = 'STG_DAY_COUNTER';
const STG_DRAW_AND_FIELD_COUNT = 'STG_DRAW_AND_FIELD_COUNT';
const STG_MOVE_NUMBER = 'STG_MOVE_NUMBER';

// User preferences
// Do not user 101
const USER_PREF_AUTO_PASS_ID = 102;
const USER_PREF_AUTO_PASS_VALUE_DISABLED = 0;
const USER_PREF_AUTO_PASS_VALUE_ENABLED = 1;
const USER_PREF_AUTO_PASS_VALUES = [
    USER_PREF_AUTO_PASS_VALUE_DISABLED,
    USER_PREF_AUTO_PASS_VALUE_ENABLED,
];

const USER_PREF_SHOW_ASK_WHEN_TO_PLAY_ID = 103;
const USER_PREF_SHOW_ASK_WHEN_TO_PLAY_VALUE_NO_CARDS = 0;
const USER_PREF_SHOW_ASK_WHEN_TO_PLAY_VALUE_IMPORTANT_CARDS = 1;
const USER_PREF_SHOW_ASK_WHEN_TO_PLAY_VALUE_ALL_CARDS = 2;

const USER_PREF_SHOW_START_MESSAGE_ID = 104;
const USER_PREF_SHOW_START_MESSAGE_VALUE_SHOW = 0;
const USER_PREF_SHOW_START_MESSAGE_VALUE_HIDE_V1 = 1;

const USER_PREF_SHOW_SMALL_SHAPES_ID = 105;
const USER_PREF_SHOW_SMALL_SHAPES_VALUE_ALWAYS_HIDE = 0;
const USER_PREF_SHOW_SMALL_SHAPES_VALUE_SHOW_WHEN_PLACING = 1;
const USER_PREF_SHOW_SMALL_SHAPES_VALUE_ALWAYS_SHOW = 2;

// Notifications

const NTF_UPDATE_FISH_COUNT = 'NTF_UPDATE_FISH_COUNT';
const NTF_UPDATE_FILL_FIELDS = 'NTF_UPDATE_FILL_FIELDS';
const NTF_MOVE_CARDS = 'NTF_MOVE_CARDS';
const NTF_PASS_DRAFT_CARDS = 'NTF_PASS_DRAFT_CARDS';
const NTF_CREATE_OR_MOVE_CARDS = 'NTF_CREATE_OR_MOVE_CARDS';
const NTF_UPDATE_PRIVATE_LESSONS_COUNT = 'NTF_UPDATE_PRIVATE_LESSONS_COUNT';
const NTF_UPDATE_HAND_COUNT = 'NTF_UPDATE_HAND_COUNT';
const NTF_ADJUST_CAT_ORDER = 'NTF_ADJUST_CAT_ORDER';
const NTF_PLAY_AND_DISCARD_CARDS = 'NTF_PLAY_AND_DISCARD_CARDS';
const NTF_MOVE_SHAPE_TO_BOAT = 'NTF_MOVE_SHAPE_TO_BOAT';
const NTF_USE_BASKET = 'NTF_USE_BASKET';
const NTF_PLAYER_PASS_UPDATE = 'NTF_PLAYER_PASS_UPDATE';
const NTF_UPDATE_PLAYER_TURN_ACTION = 'NTF_UPDATE_PLAYER_TURN_ACTION';
const NTF_DISCARD_SHAPES = 'NTF_DISCARD_SHAPES';
const NTF_RESET_BASKET = 'NTF_RESET_BASKET';
const NTF_UPDATE_DAY_COUNTER = 'NTF_UPDATE_DAY_COUNTER';
const NTF_MOVE_SHAPES = 'NTF_MOVE_SHAPES';
const NTF_UPDATE_DRAFT_ORDER = 'NTF_UPDATE_DRAFT_ORDER';
const NTF_DISCARD_BASKET = 'NTF_DISCARD_BASKET';
const NTF_CREATE_BASKET = 'NTF_CREATE_BASKET';
const NTF_DISCARD_SECRET_CARDS = 'NTF_DISCARD_SECRET_CARDS';
const NTF_UPDATE_BOAT_USED_GRID_COLOR = 'NTF_UPDATE_BOAT_USED_GRID_COLOR';
const NTF_SCORE_BOAT_POSITION = 'NTF_SCORE_BOAT_POSITION';
const NTF_SCORE_CARDS = 'NTF_SCORE_CARDS';
const NTF_UPDATE_PLAYER_ANYTIME_PREF = 'NTF_UPDATE_PLAYER_ANYTIME_PREF';
const NTF_UPDATE_SOLO_ORDER = 'NTF_UPDATE_SOLO_ORDER';

// States
const STATE_GAME_END = "gameEnd";
const STATE_GAME_END_ID = 99;

const STATE_PHASE_0_FILL_THE_FIELDS = "STATE_PHASE_0_FILL_THE_FIELDS";
const STATE_PHASE_0_FILL_THE_FIELDS_ID = 100;

const STATE_PHASE_1_FISHING = "STATE_PHASE_1_FISHING";
const STATE_PHASE_1_FISHING_ID = 101;

const STATE_PHASE_2_EXPLORE_DEAL_CARDS = "STATE_PHASE_2_EXPLORE_DEAL_CARDS";
const STATE_PHASE_2_EXPLORE_DEAL_CARDS_ID = 102;

const STATE_PHASE_2_EXPLORE_DRAFT = "STATE_PHASE_2_EXPLORE_DRAFT";
const STATE_PHASE_2_EXPLORE_DRAFT_ID = 103;

const STATE_PHASE_2_BUY_CARDS = "STATE_PHASE_2_BUY_CARDS";
const STATE_PHASE_2_BUY_CARDS_ID = 104;

const STATE_PHASE_2_EXPLORE_DRAFT_PASS_CARDS = "STATE_PHASE_2_EXPLORE_DRAFT_PASS_CARDS";
const STATE_PHASE_2_EXPLORE_DRAFT_PASS_CARDS_ID = 105;

const STATE_PHASE_3_READ_LESSONS = "STATE_PHASE_3_READ_LESSONS";
const STATE_PHASE_3_READ_LESSONS_ID = 106;

const STATE_PHASE_4_CHOOSE_RESCUE_CARDS = "STATE_PHASE_4_CHOOSE_RESCUE_CARDS";
const STATE_PHASE_4_CHOOSE_RESCUE_CARDS_ID = 107;

const STATE_PHASE_4_REVEAL_RESCUE_CARDS = "STATE_PHASE_4_REVEAL_RESCUE_CARDS";
const STATE_PHASE_4_REVEAL_RESCUE_CARDS_ID = 108;

const STATE_PHASE_4_RESCUE_CAT = "STATE_PHASE_4_RESCUE_CAT";
const STATE_PHASE_4_RESCUE_CAT_ID = 109;

const STATE_PHASE_4_NEXT_PLAYER = "STATE_PHASE_4_NEXT_PLAYER";
const STATE_PHASE_4_NEXT_PLAYER_ID = 110;

const STATE_PHASE_5_RARE_FINDS = "STATE_PHASE_5_RARE_FINDS";
const STATE_PHASE_5_RARE_FINDS_ID = 111;

const STATE_PHASE_5_NEXT_PLAYER = "STATE_PHASE_5_NEXT_PLAYER";
const STATE_PHASE_5_NEXT_PLAYER_ID = 112;

const STATE_PHASE_ANYTIME_BUY_CARDS = "STATE_PHASE_ANYTIME_BUY_CARDS";
const STATE_PHASE_ANYTIME_BUY_CARDS_ID = 113;

const STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE = "STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE";
const STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE_ID = 114;

const STATE_PHASE_ANYTIME_DRAW_AND_FIELD_SHAPE = "STATE_PHASE_ANYTIME_DRAW_AND_FIELD_SHAPE";
const STATE_PHASE_ANYTIME_DRAW_AND_FIELD_SHAPE_ID = 115;

const STATE_STACK_STATE_POP = "STATE_STACK_STATE_POP";
const STATE_STACK_STATE_POP_ID = 116;

const STATE_PHASE_ANYTIME_ROUND = "STATE_PHASE_ANYTIME_ROUND";
const STATE_PHASE_ANYTIME_ROUND_ID = 117;

const STATE_PHASE_ANYTIME_ROUND_NEXT_PLAYER = "STATE_PHASE_ANYTIME_ROUND_NEXT_PLAYER";
const STATE_PHASE_ANYTIME_ROUND_NEXT_PLAYER_ID = 118;

const STATE_PHASE_ANYTIME_ROUND_ENTER = "STATE_PHASE_ANYTIME_ROUND_ENTER";
const STATE_PHASE_ANYTIME_ROUND_ENTER_ID = 119;

const STATE_END_GAME_SCORING = "STATE_END_GAME_SCORING";
const STATE_END_GAME_SCORING_ID = 120;

const STATE_PHASE_4_BEFORE_RESCUE_CAT = "STATE_PHASE_4_BEFORE_RESCUE_CAT";
const STATE_PHASE_4_BEFORE_RESCUE_CAT_ID = 121;

const STATE_PHASE_2_AFTER_BUY_CARDS = "STATE_PHASE_2_AFTER_BUY_CARDS";
const STATE_PHASE_2_AFTER_BUY_CARDS_ID = 122;

const STATE_PHASE_5_BEFORE_RARE_FINDS = "STATE_PHASE_5_BEFORE_RARE_FINDS";
const STATE_PHASE_5_BEFORE_RARE_FINDS_ID = 123;

const STATE_CHOOSE_INITIAL_STATE = "STATE_START_CHOOSE_INITIAL_STATE";
const STATE_CHOOSE_INITIAL_STATE_ID = 124;

const STATE_FAMILY_CHOOSE_LESSONS = "STATE_FAMILY_CHOOSE_LESSONS";
const STATE_FAMILY_CHOOSE_LESSONS_ID = 125;

const STATE_FAMILY_READ_LESSONS = "STATE_FAMILY_READ_LESSONS";
const STATE_FAMILY_READ_LESSONS_ID = 126;

const STATE_FAMILY_RESCUE_CAT = "STATE_FAMILY_RESCUE_CAT";
const STATE_FAMILY_RESCUE_CAT_ID = 127;

const STATE_FAMILY_NEXT_PLAYER = "STATE_FAMILY_NEXT_PLAYER";
const STATE_FAMILY_NEXT_PLAYER_ID = 128;

const STATE_PHASE_2_EXPLORE_DRAFT_SOLO = "STATE_PHASE_2_EXPLORE_DRAFT_SOLO";
const STATE_PHASE_2_EXPLORE_DRAFT_SOLO_ID = 129;

const STATE_PHASE_4_SOLO_RESCUE_CAT = "STATE_PHASE_4_SOLO_RESCUE_CAT";
const STATE_PHASE_4_SOLO_RESCUE_CAT_ID = 130;

const STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE = "STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE";
const STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID = 131;

const STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_NEXT_PLAYER = "STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_NEXT_PLAYER";
const STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_NEXT_PLAYER_ID = 132;

// Game Statistics
const STATS_PLAYER_TOTAL_SCORE = 'STATS_TOTAL_SCORE';
const STATS_PLAYER_SCORE_RATS = 'STATS_PLAYER_SCORE_RATS';
const STATS_PLAYER_SCORE_UNFILLED_ROOMS = 'STATS_PLAYER_SCORE_UNFILLED_ROOMS';
const STATS_PLAYER_SCORE_CAT_FAMILLY = 'STATS_PLAYER_SCORE_CAT_FAMILLY';
const STATS_PLAYER_SCORE_RARE_TREASURE = 'STATS_PLAYER_SCORE_RARE_TREASURE';
const STATS_PLAYER_SCORE_PRIVATE_LESSONS = 'STATS_PLAYER_SCORE_PRIVATE_LESSONS';
const STATS_PLAYER_SCORE_PUBLIC_LESSONS = 'STATS_PLAYER_SCORE_PUBLIC_LESSONS';
const STATS_PLAYER_TOTAL_END_FISH = 'STATS_PLAYER_TOTAL_END_FISH';
const STATS_PLAYER_TOTAL_END_CATS = 'STATS_PLAYER_TOTAL_END_CATS';
const STATS_PLAYER_TOTAL_END_OSHAX = 'STATS_PLAYER_TOTAL_END_OSHAX';
const STATS_PLAYER_TOTAL_COMMON_TREASURE = 'STATS_PLAYER_TOTAL_COMMON_TREASURE';
const STATS_PLAYER_TOTAL_RARE_TREASURE = 'STATS_PLAYER_TOTAL_RARE_TREASURE';
const STATS_PLAYER_SIZE_CAT_FAMILLY_1 = 'STATS_PLAYER_SIZE_CAT_FAMILLY_1';
const STATS_PLAYER_SIZE_CAT_FAMILLY_2 = 'STATS_PLAYER_SIZE_CAT_FAMILLY_2';
const STATS_PLAYER_SIZE_CAT_FAMILLY_3 = 'STATS_PLAYER_SIZE_CAT_FAMILLY_3';
const STATS_PLAYER_SIZE_CAT_FAMILLY_4 = 'STATS_PLAYER_SIZE_CAT_FAMILLY_4';
const STATS_PLAYER_SIZE_CAT_FAMILLY_5 = 'STATS_PLAYER_SIZE_CAT_FAMILLY_5';

// Game Options

const GAME_OPTION_ELO = 201;
const GAME_OPTION_ELO_VALUE_OFF = 1;

const STG_GAME_OPTION_FAMILY = 'STG_GAME_OPTION_FAMILY';
const GAME_OPTION_FAMILY = 100;
const GAME_OPTION_FAMILY_VALUE_OFF = 0;
const GAME_OPTION_FAMILY_VALUE_ON = 1;

const STG_GAME_OPTION_SOLO = 'STG_GAME_OPTION_SOLO';
const GAME_OPTION_SOLO = 101;
const GAME_OPTION_SOLO_VALUE_OFF = 0;
const GAME_OPTION_SOLO_VALUE_EASY = 1;
const GAME_OPTION_SOLO_VALUE_MEDIUM = 2;
const GAME_OPTION_SOLO_VALUE_HARD = 3;
const GAME_OPTION_SOLO_VALUE_VERY_HARD = 4;
const GAME_OPTION_SOLO_VALUE_EXPERT = 5;
