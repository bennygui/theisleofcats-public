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
require_once("TiocCard.class.php");

class TiocPlayerAnytimePref
{
    public $playerId;
    public $cardId;
    public $stateId;
    public $statePlayerId;

    public function __construct(int $playerId, int $cardId, int $stateId, ?int $statePlayerId = null)
    {
        $this->playerId = $playerId;
        $this->cardId = $cardId;
        $this->stateId = $stateId;
        $this->statePlayerId = $statePlayerId;
    }
}

class TiocPlayerAnytimePrefMgr extends APP_DbObject
{
    private $cardMgr;
    private $preferences;

    public function __construct($cardMgr)
    {
        $this->cardMgr = $cardMgr;
        $this->preferences = null;
    }

    public function setup($playerIdArray)
    {
        foreach ($playerIdArray as $playerId) {
            $defaults = $this->getDefaultPrefPerCardId($playerId);
            foreach ($defaults as $cardId => $prefs) {
                $this->updatePlayerPref($playerId, $cardId, $prefs);
            }
        }
    }

    public function getDefaultPrefPerCardId($playerId)
    {
        $prefsPerCardId = [];
        foreach ($this->cardMgr->load() as $card) {
            switch ($card->cardAnytimeTypeId) {
                case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2:
                case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3:
                    $prefsPerCardId[$card->cardId] = [];
                    $prefsPerCardId[$card->cardId][] = new TiocPlayerAnytimePref($playerId, $card->cardId, STATE_PHASE_2_EXPLORE_DEAL_CARDS_ID);
                    $prefsPerCardId[$card->cardId][] = new TiocPlayerAnytimePref($playerId, $card->cardId, STATE_PHASE_2_BUY_CARDS_ID);
                    $prefsPerCardId[$card->cardId][] = new TiocPlayerAnytimePref($playerId, $card->cardId, STATE_PHASE_3_READ_LESSONS_ID);
                    $prefsPerCardId[$card->cardId][] = new TiocPlayerAnytimePref($playerId, $card->cardId, STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID, $playerId);
                    break;
                case CARD_ANYTIME_TYPE_ID_MOVE_CATS_FROM_FIELDS:
                    $prefsPerCardId[$card->cardId] = [];
                    $prefsPerCardId[$card->cardId][] = new TiocPlayerAnytimePref($playerId, $card->cardId, STATE_PHASE_4_BEFORE_RESCUE_CAT_ID);
                    break;
            }
        }
        return $prefsPerCardId;
    }

    public function getPrefPerCardId($playerId)
    {
        $prefsPerCardId = [];
        $valueArray = self::getObjectListFromDB("SELECT card_id, state_id, state_player_id FROM player_anytime_pref WHERE player_id = $playerId");
        foreach ($valueArray as $value) {
            $cardId = $value['card_id'];
            if (!array_key_exists($cardId, $prefsPerCardId)) {
                $prefsPerCardId[$cardId] = [];
            }
            $prefsPerCardId[$cardId][] = new TiocPlayerAnytimePref(
                $playerId,
                $cardId,
                $value['state_id'],
                $value['state_player_id']
            );
        }
        return $prefsPerCardId;
    }

    public function mustAsk($cardIdSet, $playerId, $stateId, $statePlayerId)
    {
        $prefArray = $this->getPrefPerCardId($playerId);
        foreach (array_keys($cardIdSet) as $cardId) {
            if (!array_key_exists($cardId, $prefArray)) {
                continue;
            }
            foreach ($prefArray[$cardId] as $pref) {
                if ($pref->stateId == $stateId && ($pref->statePlayerId === null || $pref->statePlayerId == $statePlayerId)) {
                    return true;
                }
            }
        }
        return false;
    }

    public function updatePlayerPref($playerId, $cardId, $prefArray)
    {
        self::DbQuery("DELETE FROM player_anytime_pref WHERE player_id = $playerId AND card_id = $cardId");
        if (count($prefArray) <= 0) {
            return;
        }
        $sql = "INSERT INTO player_anytime_pref (player_id, card_id, state_id, state_player_id) VALUES ";
        $sqlValues = [];
        foreach ($prefArray as $pref) {
            if ($pref->playerId != $playerId)
                throw new BgaVisibleSystemException("BUG! Both playerId must be equal: {$pref->playerId} != $playerId");
            if ($pref->cardId != $cardId)
                throw new BgaVisibleSystemException("BUG! Both cardId must be equal: {$pref->cardId} != $cardId");
            $sqlValues[] = "({$pref->playerId}, {$pref->cardId}, {$pref->stateId}, " . sqlNullOrValue($pref->statePlayerId) . ")";
        }
        $sql .= implode(',', $sqlValues);
        self::DbQuery($sql);
    }
}
