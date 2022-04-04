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

class TiocPlayerOrderMgr extends APP_DbObject
{
    private $game;

    public function __construct($game)
    {
        $this->game = $game;
    }

    public function setup(array $playersBasicInfos)
    {
        $playerIdArray = array_keys($playersBasicInfos);
        usort($playerIdArray, function ($id1, $id2) use (&$playersBasicInfos) {
            return $playersBasicInfos[$id1]['player_no'] <=> $playersBasicInfos[$id2]['player_no'];
        });
        foreach ($playerIdArray as $i => $playerId) {
            self::DbQuery("UPDATE player SET player_cat_order = $i + 1 WHERE player_id = $playerId");
        }
        $this->updateDraftPlayerOrder($playersBasicInfos);
    }

    public function getDraftNextPlayerId()
    {
        $playerIdSet = [];
        $ret = [];
        $valueArray = self::getObjectListFromDB("SELECT player_id, next_draft_player_id FROM player");
        foreach ($valueArray as $value) {
            $ret[$value['player_id']] = $value['next_draft_player_id'];
            $playerIdSet[$value['player_id']] = true;
        }
        // When there are zombie players, skip them in the draft (pass to themselves)
        foreach (array_keys($playerIdSet) as $zombiePlayerId) {
            if (!$this->game->isPlayerZombie($zombiePlayerId)) {
                continue;
            }
            $zombiePlayerIdTo = $ret[$zombiePlayerId];
            $ret[$zombiePlayerId] = $zombiePlayerId;
            foreach ($ret as $playerIdFrom => $playerIdTo) {
                if ($playerIdTo == $zombiePlayerId) {
                    $ret[$playerIdFrom] = $zombiePlayerIdTo;
                    break;
                }
            }
        }
        return $ret;
    }

    public function updateDraftPlayerOrder(array $playersBasicInfos)
    {
        $playerIdArray = array_keys($playersBasicInfos);
        usort($playerIdArray, function ($id1, $id2) use (&$playersBasicInfos) {
            return $playersBasicInfos[$id1]['player_no'] <=> $playersBasicInfos[$id2]['player_no'];
        });
        $dayCounter = $this->game->getGlobal(STG_DAY_COUNTER);
        if (($dayCounter % 2) == 0) {
            $playerIdArray = array_reverse($playerIdArray);
        }
        foreach ($playerIdArray as $i => $playerId) {
            $nextPlayerId = ($i + 1 == count($playerIdArray) ? $playerIdArray[0] : $playerIdArray[$i + 1]);
            self::DbQuery("UPDATE player SET next_draft_player_id = $nextPlayerId WHERE player_id = $playerId");
        }
    }

    public function adjustPlayerCatOrderFromSpeed(array $playersSpeed, ?int $sisterSpeed)
    {
        if ($sisterSpeed !== null) {
            $playerId = array_keys($playersSpeed)[0];
            $speed = $playersSpeed[$playerId];
            if ($sisterSpeed > $speed) {
                self::DbQuery("UPDATE player SET player_cat_order = 2 WHERE player_id = $playerId");
            } else if ($sisterSpeed < $speed) {
                self::DbQuery("UPDATE player SET player_cat_order = 1 WHERE player_id = $playerId");
            }
            return;
        }
        $prevPlayersCatOrder = [];
        $valueArray = self::getObjectListFromDB("SELECT player_id, player_cat_order FROM player");
        foreach ($valueArray as $value) {
            $prevPlayersCatOrder[$value['player_id']] = $value['player_cat_order'];
        }

        $playerIdArray = array_keys($playersSpeed);
        usort($playerIdArray, function ($id1, $id2) use (&$prevPlayersCatOrder, &$playersSpeed) {
            $speed = ($playersSpeed[$id1] <=> $playersSpeed[$id2]);
            if ($speed != 0) {
                // Sort by reverse speed
                return (-1 * $speed);
            }
            return ($prevPlayersCatOrder[$id1] <=> $prevPlayersCatOrder[$id2]);
        });

        foreach ($playerIdArray as $i => $playerId) {
            self::DbQuery("UPDATE player SET player_cat_order = $i + 1 WHERE player_id = $playerId");
        }
    }

    public function rotatePlayerCatOrderFamily()
    {
        $playerIdArray = $this->getPlayerIdInCatOrder();
        array_push($playerIdArray, array_shift($playerIdArray));
        foreach ($playerIdArray as $i => $playerId) {
            self::DbQuery("UPDATE player SET player_cat_order = $i + 1 WHERE player_id = $playerId");
        }
    }

    public function getFirstPlayerIdInCatOrder()
    {
        return self::getUniqueValueFromDB("SELECT player_id FROM player WHERE player_cat_order = 1");
    }


    public function getPlayerIdInCatOrder($includeSister = false)
    {
        $playerIdArray = [];
        $valueArray = self::getObjectListFromDB("SELECT player_id, player_cat_order FROM player ORDER BY player_cat_order ASC");
        foreach ($valueArray as $value) {
            if ($includeSister && $value['player_cat_order'] == 2) {
                $playerIdArray[] = SOLO_SISTER_PLAYER_ID;
            }
            $playerIdArray[] = $value['player_id'];
            if ($includeSister && $value['player_cat_order'] == 1) {
                $playerIdArray[] = SOLO_SISTER_PLAYER_ID;
            }
        }
        return $playerIdArray;
    }

    public function getNextPlayerIdInCatOrder(int $playerId)
    {
        $playerIdArray = $this->getPlayerIdInCatOrder();
        $i = array_search($playerId, $playerIdArray);
        $i += 1;
        if ($i >= count($playerIdArray)) {
            $i = 0;
        }
        return $playerIdArray[$i];
    }

    public function resetPlayerPass()
    {
        self::DbQuery("UPDATE player SET player_pass = 0");
    }

    public function markPlayerPass($playerId)
    {
        self::DbQuery("UPDATE player SET player_pass = 1 WHERE player_id = $playerId");
    }

    public function hasPlayerPass($playerId)
    {
        $passFlag = self::getUniqueValueFromDB("SELECT player_pass FROM player WHERE player_id = $playerId");
        return ($passFlag != 0);
    }

    public function getPassPerPlayerId()
    {
        $passPerPlayerId = [];
        foreach ($this->game->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $passPerPlayerId[$playerId] = false;
        }
        $valueArray = self::getObjectListFromDB("SELECT player_id FROM player WHERE player_pass = 1");
        foreach ($valueArray as $value) {
            $passPerPlayerId[$value['player_id']] = true;
        }
        return $passPerPlayerId;
    }

    public function getNextPlayerIdInCatOrderNotPass($currentPlayerId)
    {
        // Find next player that did not pass. If we loop around, all player have passed.
        $nextPlayerId = $this->getNextPlayerIdInCatOrder($currentPlayerId);
        $originalNextPlayerId = $nextPlayerId;
        while ($this->hasPlayerPass($nextPlayerId)) {
            $nextPlayerId = $this->getNextPlayerIdInCatOrder($nextPlayerId);
            if ($nextPlayerId == $originalNextPlayerId) {
                return null;
            }
        }
        return $nextPlayerId;
    }

    public function getPlayerColorName($playerId)
    {
        return self::getUniqueValueFromDB("SELECT player_color_name FROM player WHERE player_id = $playerId");
    }

    public function getPlayerBoatColorName($playerId)
    {
        return self::getUniqueValueFromDB("SELECT boat_color_name FROM player WHERE player_id = $playerId");
    }

    public function resetPlayedAnytimeRound()
    {
        self::DbQuery("UPDATE player SET player_played_anytime_round = 0");
    }

    public function hasAnyPlayerPlayedInAnytimeRound()
    {
        return (self::getUniqueValueFromDB("SELECT COUNT(*) FROM player WHERE player_played_anytime_round = 1") > 0);
    }

    public function markPlayerPlayedAnytimeRound($playerId)
    {
        self::DbQuery("UPDATE player SET player_played_anytime_round = 1 WHERE player_id = $playerId");
    }
    
    public function sisterColorName()
    {
        $valueArray = self::getObjectListFromDB("SELECT player_color_name FROM player");
        $colors = CAT_COLOR_NAMES;
        foreach ($valueArray as $value) {
            $i = array_search($value['player_color_name'], $colors);
            if ($i !== false) {
                unset($colors[$i]);
            }
        }
        return array_shift($colors);
    }

    public function sisterCatOrder()
    {
        $playerIdArray = $this->getPlayerIdInCatOrder(true);
        if ($playerIdArray[0] == SOLO_SISTER_PLAYER_ID) {
            return 1;
        } else {
            return 2;
        }
    }
}
