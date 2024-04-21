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
 * theisleofcats.game.php
 *
 */


require_once(APP_GAMEMODULE_PATH . 'module/table/table.game.php');
require_once("modules/TiocGlobals.inc.php");
require_once("modules/TiocBasket.class.php");
require_once("modules/TiocCard.class.php");
require_once("modules/TiocShape.class.php");
require_once("modules/TiocFish.class.php");
require_once("modules/TiocPlayerOrder.class.php");
require_once("modules/TiocTurnAction.class.php");
require_once("modules/TiocStateStack.class.php");
require_once("modules/TiocPlayerPreference.class.php");
require_once("modules/TiocPlayerAnytimePref.class.php");

require_once("modules/States/TiocPhaseCommon.trait.php");
require_once("modules/States/TiocPhaseAnytime.trait.php");
require_once("modules/States/TiocPhase0FillTheFields.trait.php");
require_once("modules/States/TiocPhase1Fishing.trait.php");
require_once("modules/States/TiocPhase2Explore.trait.php");
require_once("modules/States/TiocPhase3ReadLessons.trait.php");
require_once("modules/States/TiocPhase4RecueCats.trait.php");
require_once("modules/States/TiocPhase5RareFinds.trait.php");
require_once("modules/States/TiocEndGameScoring.trait.php");

require_once("modules/States/TiocFamily.trait.php");

class theisleofcats extends Table
{
    use TiocPhaseCommon;
    use TiocPhaseAnytime;
    use TiocPhase0FillTheFields;
    use TiocPhase1Fishing;
    use TiocPhase2Explore;
    use TiocPhase3ReadLessons;
    use TiocPhase4RecueCats;
    use TiocPhase5RareFinds;
    use TiocEndGameScoring;
    use TiocFamily;

    public $basketMgr;
    public $cardMgr;
    public $shapeMgr;
    public $fishMgr;
    public $playerOrderMgr;
    public $turnActionMgr;
    public $playerPreferenceMgr;
    public $playerAnytimePrefMgr;

    function __construct()
    {
        parent::__construct();

        self::initGameStateLabels([
            STG_MOVE_NUMBER => 3,
            STG_DAY_COUNTER => 10,
            STG_DRAW_AND_FIELD_COUNT => 11,
            // Do not use 12
            STG_GAME_OPTION_FAMILY => GAME_OPTION_FAMILY,
            STG_GAME_OPTION_SOLO => GAME_OPTION_SOLO,
        ]);

        $this->basketMgr = new TiocBasketMgr();
        $this->cardMgr = new TiocCardMgr($this);
        $this->shapeMgr = new TiocShapeMgr($this);
        $this->fishMgr = new TiocFishMgr();
        $this->playerOrderMgr = new TiocPlayerOrderMgr($this);
        $this->turnActionMgr = new TiocTurnActionMgr($this);
        $this->stateStackMgr = new TiocStateStackMgr($this);
        $this->playerPreferenceMgr = new TiocPlayerPreferenceMgr();
        $this->playerAnytimePrefMgr = new TiocPlayerAnytimePrefMgr($this->cardMgr);
    }

    protected function getGameName()
    {
        // Used for translations and stuff. Please do not modify.
        return "theisleofcats";
    }

    // setupNewGame
    protected function setupNewGame($players, $options = array())
    {
        // Set the colors of the players with HTML color code
        $choosenColorIndex = array_rand(range(0, count(CAT_COLORS) - 1), MAX_NUMBER_OF_PLAYERS);
        $tiocColors = array_from_indexes(CAT_COLORS, $choosenColorIndex);
        $tiocColorNames = array_from_indexes(CAT_COLOR_NAMES, $choosenColorIndex);

        $tiocBoatColorNames = BOAT_COLOR_NAMES;
        shuffle($tiocBoatColorNames);

        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, player_color_name, boat_color_name) VALUES ";
        $values = array();
        foreach ($players as $player_id => $player) {
            $color = array_shift($tiocColors);
            $colorName = array_shift($tiocColorNames);
            $boatColorName = array_shift($tiocBoatColorNames);
            $values[] = "('" . $player_id . "','$color','" . $player['player_canal'] . "','" . addslashes($player['player_name']) . "','" . addslashes($player['player_avatar']) . "', '$colorName', '$boatColorName')";
        }
        $sql .= implode(',', $values);
        self::DbQuery($sql);
        self::reattributeColorsBasedOnPreferences($players, CAT_COLORS);
        self::reloadPlayersBasicInfos();
        // If player colors changed, we need to change the color name to match
        foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $pos = array_search($playerInfo['player_color'], CAT_COLORS);
            if ($pos !== false) {
                $color_name = CAT_COLOR_NAMES[$pos];
                self::DbQuery("UPDATE player SET player_color_name = '${color_name}' WHERE player_id = $playerId");
            }
        }
        self::reloadPlayersBasicInfos();

        /************ Start the game initialization *****/

        // Init global values with their initial values
        self::setGameStateInitialValue(STG_DAY_COUNTER, START_DAY_NUMBER);
        self::setGameStateInitialValue(STG_DRAW_AND_FIELD_COUNT, 0);

        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        self::initStat('player', STATS_PLAYER_TOTAL_SCORE, 0);
        self::initStat('player', STATS_PLAYER_SCORE_RATS, 0);
        self::initStat('player', STATS_PLAYER_SCORE_UNFILLED_ROOMS, 0);
        self::initStat('player', STATS_PLAYER_SCORE_CAT_FAMILLY, 0);
        self::initStat('player', STATS_PLAYER_SCORE_RARE_TREASURE, 0);
        self::initStat('player', STATS_PLAYER_SCORE_PRIVATE_LESSONS, 0);
        self::initStat('player', STATS_PLAYER_SCORE_PUBLIC_LESSONS, 0);
        self::initStat('player', STATS_PLAYER_TOTAL_END_FISH, 0);
        self::initStat('player', STATS_PLAYER_TOTAL_END_CATS, 0);
        self::initStat('player', STATS_PLAYER_TOTAL_END_OSHAX, 0);
        self::initStat('player', STATS_PLAYER_TOTAL_COMMON_TREASURE, 0);
        self::initStat('player', STATS_PLAYER_TOTAL_RARE_TREASURE, 0);
        self::initStat('player', STATS_PLAYER_SIZE_CAT_FAMILLY_1, 0);
        self::initStat('player', STATS_PLAYER_SIZE_CAT_FAMILLY_2, 0);
        self::initStat('player', STATS_PLAYER_SIZE_CAT_FAMILLY_3, 0);
        self::initStat('player', STATS_PLAYER_SIZE_CAT_FAMILLY_4, 0);
        self::initStat('player', STATS_PLAYER_SIZE_CAT_FAMILLY_5, 0);

        $this->basketMgr->setup($this->isFamilyMode(), array_keys($this->loadPlayersBasicInfos()));
        $this->cardMgr->setup($this->isFamilyMode(), $this->getSoloMode());
        $this->shapeMgr->setup($this->isFamilyMode(), $this->isSoloMode(), count($this->loadPlayersBasicInfos()));
        $this->playerOrderMgr->setup($this->loadPlayersBasicInfos());
        $this->turnActionMgr->setup(array_keys($this->loadPlayersBasicInfos()));
        $this->playerPreferenceMgr->setup(array_keys($this->loadPlayersBasicInfos()), $this->player_preferences);
        $this->playerAnytimePrefMgr->setup(array_keys($this->loadPlayersBasicInfos()));

        $this->stPhase0FillTheFields(true);
        if ($this->isFamilyMode()) {
            $this->familySetupDealCards();
        } else {
            $this->stPhase1Fishing(true);
            $this->stPhase2ExploreDealCards(true);
        }

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        /************ End of the game initialization *****/
    }

    // getAllDatas
    protected function getAllDatas()
    {
        $result = array();

        $currentPlayerId = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!

        $stateId = $this->gamestate->state_id();
        $privateVisible = false;
        if ($stateId == STATE_END_GAME_SCORING_ID || $stateId == STATE_GAME_END_ID) {
            $privateVisible = true;
            $result['scoreTable'] = [];
            $sql = "SELECT player_id, score_rats, score_unfilled_rooms, score_cat_familly, score_rare_treasure, score_private_lessons, score_public_lessons, player_score score_total, score_solo_player FROM player";
            foreach (self::getObjectListFromDB($sql) as $values) {
                $playerId = $values['player_id'];
                unset($values['player_id']);
                $result['scoreTable'][$playerId] = [];
                foreach ($values as $col => $value) {
                    $result['scoreTable'][$playerId][$col] = $value;
                }
                if ($this->isSoloMode()) {
                    $result['scoreTable'][$playerId]['score_total'] = $result['scoreTable'][$playerId]['score_solo_player'];
                }
                unset($result['scoreTable'][$playerId]['score_solo_player']);
            }
            if ($this->isSoloMode()) {
                $sql = "SELECT score_solo_color_1, score_solo_color_2, score_solo_color_3, score_solo_color_4, score_solo_color_5, score_solo_lessons, (score_solo_color_1 + score_solo_color_2 + score_solo_color_3 + score_solo_color_4 + score_solo_color_5 + score_solo_lessons) score_total FROM player";
                foreach (self::getObjectListFromDB($sql) as $values) {
                    $result['scoreTable'][SOLO_SISTER_PLAYER_ID] = [];
                    foreach ($values as $col => $value) {
                        $result['scoreTable'][SOLO_SISTER_PLAYER_ID][$col] = $value;
                    }
                }
            }
            $result['cardEndScore'] = [];
            $sql = "SELECT card_id, player_id, score FROM card_end_score ORDER BY card_id, player_id";
            foreach (self::getObjectListFromDB($sql) as $values) {
                $result['cardEndScore'][] = [
                    'cardId' => $values['card_id'],
                    'playerId' => $values['player_id'],
                    'score' => $values['score'],
                ];
            }
        }

        // Get information about players
        $sql = "SELECT player_id id, player_score score, player_color, player_color_name, boat_color_name, player_cat_order, fish_count, next_draft_player_id, player_name FROM player ";
        $result['isFamilyMode'] = $this->isFamilyMode();
        $result['isSoloMode'] = $this->isSoloMode();
        $result['soloSister'] = [
            'player_color_name' => $this->playerOrderMgr->sisterColorName(),
            'player_cat_order' => $this->playerOrderMgr->sisterCatOrder(),
        ];
        $result['players'] = self::getCollectionFromDb($sql);
        $result['dayCounter'] = $this->getGlobal(STG_DAY_COUNTER);
        $result['shapes'] = $this->shapeMgr->getShapesAsArray();
        $result['boatUsedGridColor'] = $this->shapeMgr->getBoatUsedGridColor(array_keys($this->loadPlayersBasicInfos()));
        $result['cards'] = $this->cardMgr->getVisibleCardsForPlayerId($currentPlayerId, $privateVisible);
        $result['privateLessonsCount'] = $this->cardMgr->getPrivateLessonsCount(array_keys($this->loadPlayersBasicInfos()));
        $result['handCardCount'] = $this->cardMgr->getHandCardCount(array_keys($this->loadPlayersBasicInfos()));
        $result['tableRescueCardsCount'] = $this->cardMgr->getTableRescueCardsCardCount(array_keys($this->loadPlayersBasicInfos()));
        $result['baskets'] = $this->basketMgr->getAllBaskets();
        $result['passPerPlayerId'] = $this->playerOrderMgr->getPassPerPlayerId();
        $result['playerPreference'] = $this->playerPreferenceMgr->getPlayerPreferenceArray($currentPlayerId);
        $result['turnAction'] = $this->turnActionMgr->turnActionAsArray();
        $result['playerDefaultAnytimePref'] = $this->playerAnytimePrefMgr->getDefaultPrefPerCardId($currentPlayerId);
        $result['playerAnytimePref'] = $this->playerAnytimePrefMgr->getPrefPerCardId($currentPlayerId);

        return $result;
    }

    // getGameProgression: Compute and return the current game progression.
    // This method is called each time we are in a game state with the "updateGameProgression" property set to true 
    function getGameProgression()
    {
        return 20 * (START_DAY_NUMBER - $this->getGlobal(STG_DAY_COUNTER));
    }

    /**
     * Returns an array of user preference colors to game colors.
     * Game colors must be among those which are passed to reattributeColorsBasedOnPreferences()
     * Each game color can be an array of suitable colors, or a single color:
     * [
     *    // The first available color chosen:
     *    'ff0000' => ['990000', 'aa1122'],
     *    // This color is chosen, if available
     *    '0000ff' => '000099',
     * ]
     * If no color can be matched from this array, then the default implementation is used.
     */
    function getSpecificColorPairings(): array
    {
        return array(
            "ff0000" /* Red */         => 'd45965',
            "008000" /* Green */       => '29b35a',
            "0000ff" /* Blue */        => '67bed0',
            "ffa500" /* Yellow */      => null,
            "000000" /* Black */       => null,
            "ffffff" /* White */       => null,
            "e94190" /* Pink */        => null,
            "982fff" /* Purple */      => '9866ab',
            "72c3b1" /* Cyan */        => null,
            "f07f16" /* Orange */      => 'dcb039',
            "bdd002" /* Khaki green */ => null,
            "7b7b7b" /* Gray */        => null,
        );
    }

    // Utility functions

    public function currentPlayerId()
    {
        return $this->getCurrentPlayerId();
    }

    public function getGlobal($name)
    {
        return self::getGameStateValue($name);
    }

    public function setGlobal($name, $value)
    {
        return self::setGameStateValue($name, $value);
    }

    public function incGlobal($name, $value = 1)
    {
        return self::incGameStateValue($name, $value);
    }

    public function getColorNameFromColorId($colorId)
    {
        switch ($colorId) {
            case CAT_COLOR_ID_BLUE:
                return clienttranslate('Blue');
            case CAT_COLOR_ID_GREEN:
                return clienttranslate('Green');
            case CAT_COLOR_ID_RED:
                return clienttranslate('Red');
            case CAT_COLOR_ID_PURPLE:
                return clienttranslate('Purple');
            case CAT_COLOR_ID_ORANGE:
                return clienttranslate('Orange');
        }
        return '';
    }

    public function tiocNotifyAllPlayers($notifType, $notifLog, $notifArgs)
    {
        $this->notifyAllPlayers($notifType, $notifLog, toNotifArray($notifArgs));
    }

    public function tiocNotifyPlayer($playerId, $notifType, $notifLog, $notifArgs)
    {
        $this->notifyPlayer($playerId, $notifType, $notifLog, toNotifArray($notifArgs));
    }

    //  Player actions

    public function changePlayerPreference($prefId, $prefValue, $notify)
    {
        $playerId = $this->getCurrentPlayerId();
        $changed = false;
        switch ($prefId) {
            case USER_PREF_AUTO_PASS_ID:
                if (array_search($prefValue, USER_PREF_AUTO_PASS_VALUES) !== false) {
                    $this->playerPreferenceMgr->setPreference($playerId, $prefId, $prefValue);
                    $changed = true;
                }
                break;
        }
        if ($changed && $notify) {
            $this->tiocNotifyPlayer($playerId, 'message', clienttranslate('Preference updated successfully'), []);
        }
    }

    public function addActionLog($type, $action)
    {
        $playerId = $this->getCurrentPlayerId();
        $move = $this->getMoveNumber();
        $currentMoveCount = self::getUniqueValueFromDB("SELECT count(*) FROM action_log WHERE player_id = $playerId AND move_number = $move");
        if ($currentMoveCount > 50) {
            return;
        }
        $stateId = $this->gamestate->state_id();
        $id = self::getUniqueValueFromDB("SELECT count(*) + 1 FROM action_log");
        $safeAction = self::escapeStringForDB($action);
        self::DbQuery("INSERT INTO action_log (id, player_id, move_number, state, type, action) VALUES ($id, $playerId, $move, $stateId, '$type', '$safeAction')");
    }

    public function isAutoPassPreference($playerId)
    {
        return ($this->playerPreferenceMgr->getPreference($playerId, USER_PREF_AUTO_PASS_ID) == USER_PREF_AUTO_PASS_VALUE_ENABLED);
    }

    public function getMoveNumber()
    {
        return $this->getGlobal(STG_MOVE_NUMBER);
    }

    public function isFamilyMode()
    {
        return ($this->getGlobal(STG_GAME_OPTION_FAMILY) == GAME_OPTION_FAMILY_VALUE_ON);
    }

    public function getSoloMode()
    {
        $mode = $this->getGlobal(STG_GAME_OPTION_SOLO);
        if ($mode === null) {
            $mode = GAME_OPTION_SOLO_VALUE_OFF;
        }
        switch ($mode) {
            case GAME_OPTION_SOLO_VALUE_OFF:
            case GAME_OPTION_SOLO_VALUE_EASY:
            case GAME_OPTION_SOLO_VALUE_MEDIUM:
            case GAME_OPTION_SOLO_VALUE_HARD:
            case GAME_OPTION_SOLO_VALUE_VERY_HARD:
            case GAME_OPTION_SOLO_VALUE_EXPERT:
                return $mode;
        }
        return GAME_OPTION_SOLO_VALUE_OFF;
    }

    public function isSoloMode()
    {
        return ($this->getSoloMode() != GAME_OPTION_SOLO_VALUE_OFF);
    }

    // DEBUG!
    public function debugGotoRescue()
    {
        $draft = CARD_LOCATION_ID_PLAYER_DRAFT;
        $buy = CARD_LOCATION_ID_PLAYER_BUY;
        $hand = CARD_LOCATION_ID_PLAYER_HAND;
        self::DbQuery("UPDATE card SET card_location_id = $hand, player_private = 0 WHERE card_location_id IN ($draft, $buy) and player_id IS NOT NULL");
        $this->gamestate->jumpToState(STATE_PHASE_3_READ_LESSONS_ID);
    }

    // DEBUG!
    public function debugGotoRareFinds()
    {
        $draft = CARD_LOCATION_ID_PLAYER_DRAFT;
        $buy = CARD_LOCATION_ID_PLAYER_BUY;
        $hand = CARD_LOCATION_ID_PLAYER_HAND;
        self::DbQuery("UPDATE card SET card_location_id = $hand, player_private = 0 WHERE card_location_id IN ($draft, $buy) and player_id IS NOT NULL");
        $this->gamestate->jumpToState(STATE_PHASE_5_RARE_FINDS_ID);
    }
    // DEBUG!
    public function debugGetAllCards()
    {
        $hand = CARD_LOCATION_ID_PLAYER_HAND;
        $playerId = $this->getCurrentPlayerId();
        self::DbQuery("UPDATE card SET card_location_id = $hand, player_private = 0, player_id = $playerId");
        $this->tiocNotifyAllPlayers('debug', '', []);
    }
    // DEBUG!
    public function debugGetAllAnytimeCards()
    {
        $hand = CARD_LOCATION_ID_PLAYER_HAND;
        $playerId = $this->getCurrentPlayerId();
        self::DbQuery("UPDATE card SET card_location_id = $hand, player_private = 0, player_id = $playerId WHERE card_id BETWEEN 67 AND 97");
        $this->tiocNotifyAllPlayers('debug', '', []);
    }
    public function debugGet70AnytimeCards()
    {
        $hand = CARD_LOCATION_ID_PLAYER_HAND;
        $playerId = $this->getCurrentPlayerId();
        self::DbQuery("UPDATE card SET card_location_id = $hand, player_private = 0, player_id = $playerId WHERE card_id BETWEEN 70 AND 77");
        $this->tiocNotifyAllPlayers('debug', '', []);
    }
    // DEBUG!
    public function debugDrawAllShapes()
    {
        $cat = SHAPE_TYPE_ID_CAT;
        $catField = SHAPE_LOCATION_ID_FIELD_LEFT;
        $table = SHAPE_LOCATION_ID_TABLE;
        self::DbQuery("UPDATE shape SET shape_location_id = $catField WHERE shape_type_id = $cat");
        self::DbQuery("UPDATE shape SET shape_location_id = $table WHERE shape_type_id <> $cat");
        $this->tiocNotifyAllPlayers('debug', '', []);
    }
    // DEBUG!
    public function debugBuy()
    {
        $basketId = 10000;
        foreach (array_keys($this->loadPlayersBasicInfos()) as $playerId) {
            $this->fishMgr->addFishToPlayer($playerId, 1000);
            for ($i = 0; $i < 5; ++$i) {
                $this->basketMgr->createNewBasket($playerId, $basketId++);
            }
        }
        $this->tiocNotifyAllPlayers('debug', '', []);
    }
    // DEBUG!
    public function debugPopState()
    {
        $this->popState();
    }
    // DEBUG!
    public function debugGotoEnd()
    {
        $this->cardMgr->debugDistributeCards(array_keys($this->loadPlayersBasicInfos()));
        $this->shapeMgr->debugDistributeShapes(array_keys($this->loadPlayersBasicInfos()), $this->playerOrderMgr);
        $this->debugGotoRareFinds();
        $this->setGlobal(STG_DAY_COUNTER, 1);
    }
    // DEBUG!
    public function loadDebug()
    {
        $studioPlayer = self::getCurrentPlayerId();
        $players = self::getObjectListFromDb("SELECT player_id FROM player", true);

        // Change for your game
        // We are setting the current state to match the start of a player's turn if it's already game over
        $sql = [
            "UPDATE global SET global_value=" . STATE_PHASE_4_RESCUE_CAT_ID . " WHERE global_id=1 AND global_value=99"
        ];
        foreach ($players as $pId) {
            // All games can keep this SQL
            $sql[] = "UPDATE player SET player_id=$studioPlayer WHERE player_id=$pId";
            $sql[] = "UPDATE global SET global_value=$studioPlayer WHERE global_value=$pId";
            $sql[] = "UPDATE stats SET stats_player_id=$studioPlayer WHERE stats_player_id=$pId";

            // Add game-specific SQL update the tables for your game
            $sql[] = "UPDATE player SET next_draft_player_id=$studioPlayer WHERE next_draft_player_id=$pId";
            $sql[] = "UPDATE shape SET player_id=$studioPlayer WHERE player_id=$pId";
            $sql[] = "UPDATE basket SET player_id=$studioPlayer WHERE player_id=$pId";
            $sql[] = "UPDATE card SET player_id=$studioPlayer WHERE player_id=$pId";
            $sql[] = "UPDATE turn_action SET player_id=$studioPlayer WHERE player_id=$pId";
            $sql[] = "UPDATE state_stack SET player_id=$studioPlayer WHERE player_id=$pId";
            $sql[] = "UPDATE player_preference SET player_id=$studioPlayer WHERE player_id=$pId";
            $sql[] = "UPDATE player_anytime_pref SET player_id=$studioPlayer WHERE player_id=$pId";
            $sql[] = "UPDATE player_anytime_pref SET state_player_id=$studioPlayer WHERE state_player_id=$pId";

            // This could be improved, it assumes you had sequential studio accounts before loading
            // e.g., quietmint0, quietmint1, quietmint2, etc. are at the table
            $studioPlayer++;
        }
        $this->tiocNotifyAllPlayers('message', 'DONE', []);

        foreach ($sql as $q) {
            self::DbQuery($q);
        }
        self::reloadPlayersBasicInfos();
    }

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */
    public function isPlayerZombie($playerId)
    {
        $players = self::loadPlayersBasicInfos();
        if (!isset($players[$playerId]))
            throw new BgaVisibleSystemException("BUG! Player $playerId is not playing here");

        return ($players[$playerId]['player_zombie'] == 1);
    }
    function zombieTurn($state, $playerId)
    {
        $statename = $state['name'];
        switch ($statename) {
            case STATE_PHASE_4_RESCUE_CAT:
                $this->phase4MarkPass($playerId, true);
                $this->gamestate->nextState('next');
                return;
            case STATE_PHASE_5_RARE_FINDS:
                $this->phase5MarkPass($playerId, true);
                $this->gamestate->nextState('next');
                return;
            case STATE_PHASE_ANYTIME_BUY_CARDS:
                $this->popState();
                return;
            case STATE_PHASE_ANYTIME_DRAW_AND_FIELD_SHAPE:
            case STATE_PHASE_ANYTIME_DRAW_AND_BOAT_SHAPE:
                $drawnShape = $this->shapeMgr->getToPlaceShape();
                $this->shapeMgr->discardShapeId($drawnShape->shapeId);
                $this->tiocNotifyAllPlayers(
                    NTF_DISCARD_SHAPES,
                    clienttranslate('The drawn shape is discarded ${shapes_img}'),
                    [
                        'shapes' => [$drawnShape],
                        'shapes_img' => [$drawnShape],
                    ]
                );
                $this->popState();
                return;
            case STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE:
            case STATE_PHASE_ANYTIME_ROUND:
                $this->gamestate->nextState('next');
                return;
            case STATE_PHASE_2_EXPLORE_DRAFT:
                $cardIds = [];
                $cards = $this->cardMgr->getPlayerDraftCards($playerId);
                shuffle($cards);
                foreach ($cards as $card) {
                    $cardIds[] = $card->cardId;
                    if (count($cardIds) >= NB_CARDS_KEEP_PER_DRAFT) {
                        break;
                    }
                }
                $this->cardMgr->moveDraftCardsToBuy($playerId, $cardIds);
                $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
                return;
            case STATE_PHASE_2_BUY_CARDS:
            case STATE_PHASE_4_CHOOSE_RESCUE_CARDS:
                $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
                return;
            case STATE_FAMILY_CHOOSE_LESSONS:
                $this->cardMgr->draftDiscardAll($playerId);
                $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
                return;
            case STATE_FAMILY_RESCUE_CAT:
                $this->familyMarkPass($playerId);
                $this->gamestate->nextState('next');
                return;
        }

        throw new BgaVisibleSystemException("BUG! Zombie mode not supported at this game state: " . $statename);
    }

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    function upgradeTableDb($from_version)
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345

        // Example:
        //        if( $from_version <= 1404301345 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        if( $from_version <= 1405061421 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        // Please add your future database scheme changes here
        //
        //
        if ($from_version <= 2109241920) {
            $sql = ""
                . "CREATE TABLE IF NOT EXISTS `DBPREFIX_action_log` ("
                . "  `id` int(10) unsigned NOT NULL,"
                . "  `player_id` int(10) unsigned NOT NULL,"
                . "  `move_number` int(10) unsigned NOT NULL,"
                . "  `state` int(10) unsigned NOT NULL,"
                . "  `type` varchar(20) NOT NULL,"
                . "  `action` varchar(1024) NOT NULL,"
                . "  PRIMARY KEY (`id`)"
                . ") ENGINE=InnoDB DEFAULT CHARSET=utf8;";
            self::applyDbUpgradeToAllDB($sql);
        }
        if ($from_version <= 2109301334) {
            $sql = "ALTER TABLE `DBPREFIX_player` ADD `boat_color_name` varchar(10) NOT NULL DEFAULT '';";
            self::applyDbUpgradeToAllDB($sql);
            $sql = "UPDATE `DBPREFIX_player` SET `boat_color_name` = `player_color_name`;";
            self::applyDbUpgradeToAllDB($sql);
        }
        if ($from_version <= 2110051328) {
            $sql = "ALTER TABLE `DBPREFIX_card` ADD `played_move_number` int(10) unsigned NULL;";
            self::applyDbUpgradeToAllDB($sql);
        }
        if ($from_version <= 2110121322) {
            $sql = ""
                . "CREATE TABLE IF NOT EXISTS `DBPREFIX_player_anytime_pref` ("
                . "   `player_id` int(10) unsigned NOT NULL,"
                . "   `card_id` smallint(10) unsigned NOT NULL,"
                . "   `state_id` smallint(10) unsigned NOT NULL,"
                . "   `state_player_id` int(10) unsigned NULL,"
                . "   UNIQUE (`player_id`, `card_id`, `state_id`, `state_player_id`)"
                . ") ENGINE=InnoDB DEFAULT CHARSET=utf8;"
                . "";
            self::applyDbUpgradeToAllDB($sql);
            $sql = "INSERT INTO DBPREFIX_player_anytime_pref (player_id, card_id, state_id, state_player_id) VALUES ";
            $sqlValues = [];
            foreach (array_keys($this->loadPlayersBasicInfos()) as $playerId) {
                foreach ([71, 72, 73, 74] as $cardId) {
                    $sqlValues[] = "($playerId, $cardId, 102, NULL)";
                    $sqlValues[] = "($playerId, $cardId, 104, NULL)";
                    $sqlValues[] = "($playerId, $cardId, 106, NULL)";
                    $sqlValues[] = "($playerId, $cardId, 107, NULL)";
                }
                $sqlValues[] = "($playerId, 77, 121, NULL)";
            }
            $sql .= implode(',', $sqlValues);
            self::applyDbUpgradeToAllDB($sql);
        }
        if ($from_version <= 2110291407) {
            self::applyDbUpgradeToAllDB("ALTER TABLE `DBPREFIX_player` ADD `score_solo_color_1` smallint(5) NOT NULL DEFAULT 0;");
            self::applyDbUpgradeToAllDB("ALTER TABLE `DBPREFIX_player` ADD `score_solo_color_2` smallint(5) NOT NULL DEFAULT 0;");
            self::applyDbUpgradeToAllDB("ALTER TABLE `DBPREFIX_player` ADD `score_solo_color_3` smallint(5) NOT NULL DEFAULT 0;");
            self::applyDbUpgradeToAllDB("ALTER TABLE `DBPREFIX_player` ADD `score_solo_color_4` smallint(5) NOT NULL DEFAULT 0;");
            self::applyDbUpgradeToAllDB("ALTER TABLE `DBPREFIX_player` ADD `score_solo_color_5` smallint(5) NOT NULL DEFAULT 0;");
            self::applyDbUpgradeToAllDB("ALTER TABLE `DBPREFIX_player` ADD `score_solo_lessons` smallint(5) NOT NULL DEFAULT 0;");
            self::applyDbUpgradeToAllDB("ALTER TABLE `DBPREFIX_player` ADD `score_solo_player` smallint(5) NOT NULL DEFAULT 0;");
            self::applyDbUpgradeToAllDB("ALTER TABLE `DBPREFIX_shape` ADD `solo_order` int(10) unsigned NULL;");
        }
        if ($from_version <= 2111282327) {
            $sql = "" .
                "CREATE TABLE IF NOT EXISTS `card_end_score` (" .
                "  `card_id` smallint(5) unsigned NOT NULL," .
                "  `player_id` int(10) unsigned NOT NULL," .
                "  `score` int(10) NOT NULL," .
                "  PRIMARY KEY (`card_id`, `player_id`)" .
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8;" .
                "";
            self::applyDbUpgradeToAllDB($sql);
        }
    }
}
