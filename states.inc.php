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
 * states.inc.php
 *
 * theisleofcats game states description
 *
 */

//    !! It is not a good idea to modify this file when a game is running !!

require_once("modules/TiocGlobals.inc.php");

$machinestates = [
    // The initial state. Please do not modify.
    1 => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => ["" => STATE_CHOOSE_INITIAL_STATE_ID]
    ),

    // Start the game
    STATE_CHOOSE_INITIAL_STATE_ID => [
        "name" => STATE_CHOOSE_INITIAL_STATE,
        "description" => '',
        "type" => "game",
        "action" => "stPhase0ChooseInitialState",
        "transitions" => [
            "normal" => STATE_PHASE_2_EXPLORE_DRAFT_ID,
            "family" => STATE_FAMILY_CHOOSE_LESSONS_ID,
        ],
    ],

    // Phase 0 states
    STATE_PHASE_0_FILL_THE_FIELDS_ID => [
        "name" => STATE_PHASE_0_FILL_THE_FIELDS,
        "description" => clienttranslate('The fields are filled with cats'),
        "updateGameProgression" => true,
        "type" => "game",
        "action" => "stPhase0FillTheFields",
        "transitions" => [
            "" => STATE_PHASE_1_FISHING_ID
        ],
    ],

    // Phase 1 states
    STATE_PHASE_1_FISHING_ID => [
        "name" => STATE_PHASE_1_FISHING,
        "description" => clienttranslate('All players go fishing'),
        "updateGameProgression" => true,
        "type" => "game",
        "action" => "stPhase1Fishing",
        "transitions" => [
            // Jumps to Anytime round and then to STATE_PHASE_2_EXPLORE_DEAL_CARDS_ID
            "nextSkipAnytimeRound" => STATE_PHASE_2_EXPLORE_DEAL_CARDS_ID,
        ],
    ],

    // Phase 2 states
    STATE_PHASE_2_EXPLORE_DEAL_CARDS_ID => [
        "name" => STATE_PHASE_2_EXPLORE_DEAL_CARDS,
        "description" => clienttranslate('All players are dealt new cards'),
        "updateGameProgression" => true,
        "type" => "game",
        "action" => "stPhase2ExploreDealCards",
        "transitions" => [
            "" => STATE_PHASE_2_EXPLORE_DRAFT_ID
        ],
    ],

    // Phase 2 states
    STATE_PHASE_2_EXPLORE_DRAFT_ID => [
        "name" => STATE_PHASE_2_EXPLORE_DRAFT,
        "description" => clienttranslate('All players must choose ${nbCards} cards to keep'),
        "descriptionmyturn" => clienttranslate('${you} must choose ${nbCards} cards to keep'),
        "type" => "multipleactiveplayer",
        "action" => "stMakeEveryoneActive",
        "args" => "argPhase2ExploreDraft",
        "possibleactions" => [
            "phase2DraftKeepCards"
        ],
        "transitions" => [
            "next" => STATE_PHASE_2_EXPLORE_DRAFT_PASS_CARDS_ID,
        ],
    ],
    STATE_PHASE_2_EXPLORE_DRAFT_PASS_CARDS_ID => [
        "name" => STATE_PHASE_2_EXPLORE_DRAFT_PASS_CARDS,
        "description" => clienttranslate('Passing remaning cards'),
        "type" => "game",
        "action" => "stPhase2ExplorePassCards",
        "transitions" => [
            "continueDraft" => STATE_PHASE_2_EXPLORE_DRAFT_ID,
            // Also jumps to Anytime round and then to STATE_PHASE_2_BUY_CARDS_ID
            "nextSkipAnytimeRound" => STATE_PHASE_2_BUY_CARDS_ID,
        ],
    ],
    STATE_PHASE_2_BUY_CARDS_ID => [
        "name" => STATE_PHASE_2_BUY_CARDS,
        "description" => clienttranslate('All players must choose which cards to buy'),
        "descriptionmyturn" => clienttranslate('${you} must choose which cards to buy'),
        "type" => "multipleactiveplayer",
        "action" => "stMakeEveryoneActive",
        "possibleactions" => [
            "phase2BuyCards"
        ],
        "transitions" => [
            "next" => STATE_PHASE_2_AFTER_BUY_CARDS_ID,
        ],
    ],
    STATE_PHASE_2_AFTER_BUY_CARDS_ID => [
        "name" => STATE_PHASE_2_AFTER_BUY_CARDS,
        "description" => clienttranslate('After buying cards'),
        "type" => "game",
        "action" => "stPhase2AfterBuyCards",
        "transitions" => [
            // Jumps to Anytime round and then to STATE_PHASE_3_READ_LESSONS_ID
            "nextSkipAnytimeRound" => STATE_PHASE_3_READ_LESSONS_ID,
        ],
    ],

    // Phase 3 states
    STATE_PHASE_3_READ_LESSONS_ID => [
        "name" => STATE_PHASE_3_READ_LESSONS,
        "description" => clienttranslate('Reading lessons'),
        "updateGameProgression" => true,
        "type" => "game",
        "action" => "stPhase3ReadLessons",
        "transitions" => [
            // Jumps to Anytime round and then to STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID or STATE_PHASE_4_REVEAL_RESCUE_CARDS_ID
            "nextSkipAnytimeRoundRescue" => STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID,
            "nextSkipAnytimeRoundReveal" => STATE_PHASE_4_REVEAL_RESCUE_CARDS_ID,
        ],
    ],

    // Phase 4 states
    // Old, incorrect, multiplayer state: must be removed
    STATE_PHASE_4_CHOOSE_RESCUE_CARDS_ID => [
        "name" => STATE_PHASE_4_CHOOSE_RESCUE_CARDS,
        "description" => clienttranslate('All players must choose which rescue cards will be available for the Rescue phase'),
        "descriptionmyturn" => clienttranslate('${you} must choose which rescue cards will be available for the Rescue phase'),
        "type" => "multipleactiveplayer",
        "action" => "stPhase4ActivatePlayersWithRescueCards",
        "possibleactions" => [
            "phase4PlayRescueCards"
        ],
        "transitions" => [
            "next" => STATE_PHASE_4_REVEAL_RESCUE_CARDS_ID,
        ],
    ],
    STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID => [
        "name" => STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE,
        "description" => clienttranslate('${actplayer} must choose which rescue cards will be available for the Rescue phase'),
        "descriptionmyturn" => clienttranslate('${you} must choose which rescue cards will be available for the Rescue phase'),
        "type" => "activeplayer",
        "possibleactions" => [
            "phase4PlayRescueCards"
        ],
        "transitions" => [
            "next" => STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_NEXT_PLAYER_ID,
        ],
    ],
    STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_NEXT_PLAYER_ID => [
        "name" => STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_NEXT_PLAYER,
        "description" => clienttranslate('Ending player turn'),
        "type" => "game",
        "action" => "stPhase4RescueCardsSingleNextPlayer",
        "transitions" => [
            // Jumps to Anytime round and then to STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID or STATE_PHASE_4_REVEAL_RESCUE_CARDS_ID
            "nextSkipAnytimeRoundNextPlayer" => STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID,
            "nextSkipAnytimeRoundRevealRescueCards" => STATE_PHASE_4_REVEAL_RESCUE_CARDS_ID,
        ],
    ],
    STATE_PHASE_4_REVEAL_RESCUE_CARDS_ID => [
        "name" => STATE_PHASE_4_REVEAL_RESCUE_CARDS,
        "description" => clienttranslate('Revealing rescue cards and adjusting turn order'),
        "type" => "game",
        "action" => "stPhase4RevealRecueCards",
        "transitions" => [
            // Jumps to Anytime round and then to STATE_PHASE_4_BEFORE_RESCUE_CAT_ID
            "nextSkipAnytimeRound" => STATE_PHASE_4_BEFORE_RESCUE_CAT_ID,
        ],
    ],
    STATE_PHASE_4_BEFORE_RESCUE_CAT_ID => [
        "name" => STATE_PHASE_4_BEFORE_RESCUE_CAT,
        "description" => '',
        "updateGameProgression" => true,
        "type" => "game",
        "action" => "stPhase4BeforeRescueCat",
        "transitions" => [
            // Jumps to Anytime round and then to STATE_PHASE_4_SOLO_RESCUE_CAT_ID or STATE_PHASE_5_BEFORE_RARE_FINDS_ID
            "nextSkipAnytimeRoundPhase4" => STATE_PHASE_4_SOLO_RESCUE_CAT_ID,
            "nextSkipAnytimeRoundPhase5" => STATE_PHASE_5_BEFORE_RARE_FINDS_ID,
        ],
    ],
    STATE_PHASE_4_SOLO_RESCUE_CAT_ID => [
        "name" => STATE_PHASE_4_SOLO_RESCUE_CAT,
        "description" => '',
        "updateGameProgression" => true,
        "type" => "game",
        "action" => "stPhase4SoloRescueCat",
        "transitions" => [
            "next" => STATE_PHASE_4_RESCUE_CAT_ID,
        ],
    ],
    STATE_PHASE_4_RESCUE_CAT_ID => [
        "name" => STATE_PHASE_4_RESCUE_CAT,
        "description" => clienttranslate('${actplayer} must rescue a cat or pass'),
        "descriptionmyturn" => clienttranslate('${you} must rescue a cat or pass'),
        "type" => "activeplayer",
        "args" => "argPhase4RescueCat",
        "possibleactions" => [
            "phase4ConfirmActions",
            "phase4Pass",
            "playAnytimeCard",
        ],
        "transitions" => [
            "next" => STATE_PHASE_4_NEXT_PLAYER_ID,
            "nextAnytimeBuyCards" => STATE_PHASE_ANYTIME_BUY_CARDS_ID,
            "nextAnytimeDrawAndBoatShape" => STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE_ID,
            "nextAnytimeDrawAndFieldShape" => STATE_PHASE_ANYTIME_DRAW_AND_FIELD_SHAPE_ID,
        ],
    ],
    STATE_PHASE_4_NEXT_PLAYER_ID => [
        "name" => STATE_PHASE_4_NEXT_PLAYER,
        "description" => clienttranslate('Ending player turn'),
        "type" => "game",
        "action" => "stPhase4NextPlayer",
        "transitions" => [
            // Jumps to Anytime round and then to STATE_PHASE_4_RESCUE_CAT_ID or STATE_PHASE_5_BEFORE_RARE_FINDS_ID
            "nextSkipAnytimeRoundPhase4" => STATE_PHASE_4_RESCUE_CAT_ID,
            "nextSkipAnytimeRoundPhase5" => STATE_PHASE_5_BEFORE_RARE_FINDS_ID,
        ],
    ],

    // Phase 5 states
    STATE_PHASE_5_BEFORE_RARE_FINDS_ID => [
        "name" => STATE_PHASE_5_BEFORE_RARE_FINDS,
        "description" => '',
        "updateGameProgression" => true,
        "type" => "game",
        "action" => "stPhase5BeforeRareFinds",
        "transitions" => [
            // Jumps to Anytime round and then to STATE_PHASE_5_RARE_FINDS_ID, STATE_PHASE_0_FILL_THE_FIELDS_ID, or STATE_END_GAME_SCORING_ID
            "nextSkipAnytimeRoundPhase5" => STATE_PHASE_5_RARE_FINDS_ID,
            "nextSkipAnytimeRoundPhase0" => STATE_PHASE_0_FILL_THE_FIELDS_ID,
            "endGame" => STATE_END_GAME_SCORING_ID,
        ],
    ],
    STATE_PHASE_5_RARE_FINDS_ID => [
        "name" => STATE_PHASE_5_RARE_FINDS,
        "description" => clienttranslate('${actplayer} must take a rare find or pass'),
        "descriptionmyturn" => clienttranslate('${you} must take a rare find or pass'),
        "type" => "activeplayer",
        "args" => "argPhase5RareFinds",
        "possibleactions" => [
            "phase5ConfirmActions",
            "phase5Pass",
            "playAnytimeCard",
        ],
        "transitions" => [
            "next" => STATE_PHASE_5_NEXT_PLAYER_ID,
            "nextAnytimeBuyCards" => STATE_PHASE_ANYTIME_BUY_CARDS_ID,
            "nextAnytimeDrawAndBoatShape" => STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE_ID,
            "nextAnytimeDrawAndFieldShape" => STATE_PHASE_ANYTIME_DRAW_AND_FIELD_SHAPE_ID,
        ],
    ],
    STATE_PHASE_5_NEXT_PLAYER_ID => [
        "name" => STATE_PHASE_5_NEXT_PLAYER,
        "description" => clienttranslate('Ending player turn'),
        "type" => "game",
        "action" => "stPhase5NextPlayer",
        "transitions" => [
            // Jumps to Anytime round and then to STATE_PHASE_5_RARE_FINDS_ID, STATE_PHASE_0_FILL_THE_FIELDS_ID, or STATE_END_GAME_SCORING_ID
            "nextSkipAnytimeRoundPhase5" => STATE_PHASE_5_RARE_FINDS_ID,
            "nextSkipAnytimeRoundPhase0" => STATE_PHASE_0_FILL_THE_FIELDS_ID,
            "endGame" => STATE_END_GAME_SCORING_ID,
        ],
    ],

    // States for server side "Anytime" actions
    STATE_PHASE_ANYTIME_BUY_CARDS_ID => [
        "name" => STATE_PHASE_ANYTIME_BUY_CARDS,
        "description" => clienttranslate('${actplayer} must choose which cards to buy'),
        "descriptionmyturn" => clienttranslate('${you} must choose which cards to buy'),
        "type" => "activeplayer",
        "possibleactions" => [
            "phaseAnytimeBuyCards",
        ],
        "transitions" => [
            // Uses state stack
        ],
    ],
    STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE_ID => [
        "name" => STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE,
        "description" => clienttranslate('${actplayer} must place the drawn shape'),
        "descriptionmyturn" => clienttranslate('${you} must place the drawn shape'),
        "type" => "activeplayer",
        "args" => "argPhaseAnytimeDrawAndBoatShape",
        "possibleactions" => [
            "phaseAnytimeDrawAndBoatShapeConfirmActions",
        ],
        "transitions" => [
            // Uses state stack
        ],
    ],
    STATE_PHASE_ANYTIME_DRAW_AND_FIELD_SHAPE_ID => [
        "name" => STATE_PHASE_ANYTIME_DRAW_AND_FIELD_SHAPE,
        "description" => clienttranslate('${actplayer} must choose a field for the drawn shape (${drawStep} of 4)'),
        "descriptionmyturn" => clienttranslate('${you} must choose a field for the drawn shape (${drawStep} of 4)'),
        "type" => "activeplayer",
        "args" => "argPhaseAnytimeDrawAndFieldShape",
        "possibleactions" => [
            "phaseAnytimePlaceFieldShape",
        ],
        "transitions" => [
            "nextAnytimeDrawAndFieldShape" => STATE_PHASE_ANYTIME_DRAW_AND_FIELD_SHAPE_ID,
            // Also uses state stack
        ],
    ],

    // Phase "Anytime" states
    STATE_PHASE_ANYTIME_ROUND_ENTER_ID => [
        "name" => STATE_PHASE_ANYTIME_ROUND_ENTER,
        "description" => clienttranslate('Entering Anytime card phase'),
        "type" => "game",
        "action" => "stPhaseAnytimeRoundEnter",
        "transitions" => [
            "next" => STATE_PHASE_ANYTIME_ROUND_ID,
        ],
    ],
    STATE_PHASE_ANYTIME_ROUND_ID => [
        "name" => STATE_PHASE_ANYTIME_ROUND,
        "description" => clienttranslate('${actplayer} can play an Anytime card (Next: ${nextPhase}${comma}${nextPlayerName})'),
        "descriptionmyturn" => clienttranslate('${you} can play an Anytime card (Next: ${nextPhase}${comma}${nextPlayerName})'),
        "type" => "activeplayer",
        "args" => "argPhaseAnytimeRound",
        "possibleactions" => [
            "phaseAnytimeRoundConfirm",
            "playAnytimeCard",
        ],
        "transitions" => [
            "next" => STATE_PHASE_ANYTIME_ROUND_NEXT_PLAYER_ID,
            "nextAnytimeBuyCards" => STATE_PHASE_ANYTIME_BUY_CARDS_ID,
            "nextAnytimeDrawAndBoatShape" => STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE_ID,
            "nextAnytimeDrawAndFieldShape" => STATE_PHASE_ANYTIME_DRAW_AND_FIELD_SHAPE_ID,
        ],
    ],
    STATE_PHASE_ANYTIME_ROUND_NEXT_PLAYER_ID => [
        "name" => STATE_PHASE_ANYTIME_ROUND_NEXT_PLAYER,
        "description" => clienttranslate('Ending player turn'),
        "type" => "game",
        "action" => "stPhaseAnytimeRoundNextPlayer",
        "transitions" => [
            "nextPlayer" => STATE_PHASE_ANYTIME_ROUND_ID,
            "nextRestartRound" => STATE_PHASE_ANYTIME_ROUND_ENTER_ID,
            // Also uses state stack
        ],
    ],

    // State for state stack to change current player
    STATE_STACK_STATE_POP_ID => [
        "name" => STATE_STACK_STATE_POP,
        "description" => '',
        "type" => "game",
        "action" => "stStateStackPop",
        "transitions" => [
            // Uses state stack
        ],
    ],

    // Family states
    STATE_FAMILY_CHOOSE_LESSONS_ID => [
        "name" => STATE_FAMILY_CHOOSE_LESSONS,
        "description" => clienttranslate('All players must choose 2 lesson cards to keep'),
        "descriptionmyturn" => clienttranslate('${you} must choose 2 lesson cards to keep'),
        "type" => "multipleactiveplayer",
        "action" => "stMakeEveryoneActive",
        "possibleactions" => [
            "familyKeepLessonCards"
        ],
        "transitions" => [
            "next" => STATE_FAMILY_READ_LESSONS_ID,
        ],
    ],
    STATE_FAMILY_READ_LESSONS_ID => [
        "name" => STATE_FAMILY_READ_LESSONS,
        "description" => clienttranslate('Reading lessons'),
        "type" => "game",
        "action" => "stFamilyReadLessons",
        "transitions" => [
            "next" => STATE_FAMILY_RESCUE_CAT_ID,
        ],
    ],
    STATE_FAMILY_RESCUE_CAT_ID => [
        "name" => STATE_FAMILY_RESCUE_CAT,
        "description" => clienttranslate('${actplayer} must rescue a cat or pass'),
        "descriptionmyturn" => clienttranslate('${you} must rescue a cat or pass'),
        "updateGameProgression" => true,
        "type" => "activeplayer",
        "args" => "argFamilyRescueCat",
        "possibleactions" => [
            "familyConfirmActions",
            "familyPass",
        ],
        "transitions" => [
            "next" => STATE_FAMILY_NEXT_PLAYER_ID,
        ],
    ],
    STATE_FAMILY_NEXT_PLAYER_ID => [
        "name" => STATE_FAMILY_NEXT_PLAYER,
        "description" => clienttranslate('Ending player turn'),
        "updateGameProgression" => true,
        "type" => "game",
        "action" => "stFamilyNextPlayer",
        "transitions" => [
            "nextPlayer" => STATE_FAMILY_RESCUE_CAT_ID,
            "endGame" => STATE_END_GAME_SCORING_ID,
        ],
    ],

    // End game scoring
    STATE_END_GAME_SCORING_ID => [
        "name" => STATE_END_GAME_SCORING,
        "description" => clienttranslate('End game scoring'),
        "updateGameProgression" => true,
        "type" => "game",
        "action" => "stEndGameScoring",
        "transitions" => [
            "" => STATE_GAME_END_ID,
        ],
    ],

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    STATE_GAME_END_ID => array(
        "name" => STATE_GAME_END,
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )
];
