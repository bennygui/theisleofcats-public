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

require_once("TiocGlobals.inc.php");

const RETURN_STATE_VALID_IDS = [
    STATE_PHASE_0_FILL_THE_FIELDS_ID,
    STATE_PHASE_2_BUY_CARDS_ID,
    STATE_PHASE_2_EXPLORE_DEAL_CARDS_ID,
    STATE_PHASE_3_READ_LESSONS_ID,
    STATE_PHASE_4_RESCUE_CAT_ID,
    STATE_PHASE_4_BEFORE_RESCUE_CAT_ID,
    STATE_PHASE_4_CHOOSE_RESCUE_CARDS_ID,
    STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID,
    STATE_PHASE_5_RARE_FINDS_ID,
    STATE_END_GAME_SCORING_ID,
    STATE_PHASE_4_SOLO_RESCUE_CAT_ID,
];

class TiocReturnStateInfo
{
    public $stateId;
    public $stateName;
    public $playerId;

    public function __construct($stateId, $playerId)
    {
        $this->stateId = $stateId;
        $this->playerId = $playerId;
        $this->stateName = $this->getStateName();
    }

    private function getStateName()
    {
        switch ($this->stateId) {
            case STATE_PHASE_0_FILL_THE_FIELDS_ID:
                return clienttranslate('Fill the fields');
            case STATE_PHASE_2_BUY_CARDS_ID:
                return clienttranslate('Buy cards');
            case STATE_PHASE_2_EXPLORE_DEAL_CARDS_ID:
                return clienttranslate('Deal cards');
            case STATE_PHASE_3_READ_LESSONS_ID:
                return clienttranslate('Read lessons');
            case STATE_PHASE_4_RESCUE_CAT_ID:
            case STATE_PHASE_4_BEFORE_RESCUE_CAT_ID:
            case STATE_PHASE_4_SOLO_RESCUE_CAT_ID:
                return clienttranslate('Rescue cats');
            case STATE_PHASE_4_CHOOSE_RESCUE_CARDS_ID:
            case STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID:
                return clienttranslate('Choose rescue cards');
            case STATE_PHASE_5_RARE_FINDS_ID:
                return clienttranslate('Rare finds');
            case STATE_END_GAME_SCORING_ID:
                return clienttranslate('End game');
        }
        return '';
    }
}

class TiocStateStackMgr extends APP_DbObject
{
    private $game;

    public function __construct($game)
    {
        $this->game = $game;
    }

    public function pushPlayerState($playerId, $stateId)
    {
        $newStackNo = self::getUniqueValueFromDB("SELECT COALESCE(MAX(stack_no), 0) + 1 FROM state_stack");
        $sqlPlayerId = sqlNullOrValue($playerId);
        self::DbQuery("INSERT INTO state_stack (stack_no, player_id, state_id) VALUES ($newStackNo, $sqlPlayerId, $stateId)");
    }

    public function jumpToPopState()
    {
        if ($this->isEmpty())
            throw new BgaVisibleSystemException('BUG! State stack is empty!');
        $this->game->gamestate->jumpToState(STATE_STACK_STATE_POP_ID);
    }

    public function popPlayerState()
    {
        $valueArray = self::getObjectListFromDB("SELECT stack_no, player_id, state_id FROM state_stack ORDER BY stack_no DESC LIMIT 1");
        $firstValue = null;
        foreach ($valueArray as $value) {
            $firstValue = $value;
            break;
        }
        if ($firstValue === null)
            throw new BgaVisibleSystemException('BUG! State stack is empty!');
        $playerId = $firstValue['player_id'];
        $stateId = $firstValue['state_id'];
        $stackNo = $firstValue['stack_no'];
        if ($playerId !== null) {
            $this->game->gamestate->changeActivePlayer($playerId);
        }
        self::DbQuery("DELETE FROM state_stack WHERE stack_no = {$stackNo}");
        $this->game->gamestate->jumpToState($stateId);
    }

    public function isEmpty()
    {
        return (self::getUniqueValueFromDB("SELECT COUNT(*) FROM state_stack") == 0);
    }

    public function returnStateInfo()
    {
        $valueArray = self::getObjectListFromDB("SELECT player_id, state_id FROM state_stack ORDER BY stack_no ASC LIMIT 1");
        $firstValue = null;
        foreach ($valueArray as $value) {
            $firstValue = $value;
            break;
        }
        if ($firstValue === null)
            return null;
        return new TiocReturnStateInfo($firstValue['state_id'], $firstValue['player_id']);
    }
}
