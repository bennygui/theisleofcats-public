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
 * stats.inc.php
 *
 * theisleofcats game statistics description
 *
 */

 require_once("modules/TiocGlobals.inc.php");

$stats_type = [

    // Statistics global to table
    "table" => [],

    // Statistics existing for each player
    "player" => [
        STATS_PLAYER_TOTAL_SCORE => ["id" => 10, "name" => totranslate("Player Score: Total"), "type" => "int"],
        STATS_PLAYER_SCORE_RATS => ["id" => 11, "name" => totranslate("Player Score: Rats"), "type" => "int"],
        STATS_PLAYER_SCORE_UNFILLED_ROOMS => ["id" => 12, "name" => totranslate("Player Score: Unfilled Rooms"), "type" => "int"],
        STATS_PLAYER_SCORE_CAT_FAMILLY => ["id" => 13, "name" => totranslate("Player Score: Cat Family"), "type" => "int"],
        STATS_PLAYER_SCORE_RARE_TREASURE => ["id" => 14, "name" => totranslate("Player Score: Rare Treasure"), "type" => "int"],
        STATS_PLAYER_SCORE_PRIVATE_LESSONS => ["id" => 15, "name" => totranslate("Player Score: Private Lessons"), "type" => "int"],
        STATS_PLAYER_SCORE_PUBLIC_LESSONS => ["id" => 16, "name" => totranslate("Player Score: Public Lessons"), "type" => "int"],
        STATS_PLAYER_TOTAL_END_FISH => ["id" => 17, "name" => totranslate("Nb Fish at end"), "type" => "int"],
        STATS_PLAYER_TOTAL_END_CATS => ["id" => 18, "name" => totranslate("Nb Cats on boat"), "type" => "int"],
        STATS_PLAYER_TOTAL_END_OSHAX => ["id" => 19, "name" => totranslate("Nb Oshax on boat"), "type" => "int"],
        STATS_PLAYER_TOTAL_COMMON_TREASURE => ["id" => 20, "name" => totranslate("Nb Common Treasure on boat"), "type" => "int"],
        STATS_PLAYER_TOTAL_RARE_TREASURE => ["id" => 21, "name" => totranslate("Nb Rare Treasure on boat"), "type" => "int"],
        STATS_PLAYER_SIZE_CAT_FAMILLY_1 => ["id" => 22, "name" => totranslate("Nb cats in 1st family"), "type" => "int"],
        STATS_PLAYER_SIZE_CAT_FAMILLY_2 => ["id" => 23, "name" => totranslate("Nb cats in 2nd family"), "type" => "int"],
        STATS_PLAYER_SIZE_CAT_FAMILLY_3 => ["id" => 24, "name" => totranslate("Nb cats in 3rd family"), "type" => "int"],
        STATS_PLAYER_SIZE_CAT_FAMILLY_4 => ["id" => 25, "name" => totranslate("Nb cats in 4th family"), "type" => "int"],
        STATS_PLAYER_SIZE_CAT_FAMILLY_5 => ["id" => 26, "name" => totranslate("Nb cats in 5th family"), "type" => "int"],
    ]
];
