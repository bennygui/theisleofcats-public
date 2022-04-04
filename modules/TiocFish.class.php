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

class TiocFishMgr extends APP_DbObject
{
    public function addFishToPlayer(int $playerId, int $nbFish)
    {
        self::DbQuery("UPDATE player SET fish_count = fish_count + $nbFish WHERE player_id = $playerId");
        return $this->getNbFishForPlayerId($playerId);
    }

    public function removeFishFromPlayer(int $playerId, int $nbFish)
    {
        return $this->addFishToPlayer($playerId, -1 * $nbFish);
    }

    public function getNbFishForPlayerId(int $playerId)
    {
        return self::getUniqueValueFromDB("SELECT fish_count FROM player WHERE player_id = $playerId");
    }

    public function getNbFishForAllPlayers()
    {
        $ret = [];
        $valueArray = self::getObjectListFromDB("SELECT player_id, fish_count FROM player");
        foreach ($valueArray as $value) {
            $ret[$value['player_id']] = $value['fish_count'];
        }
        return $ret;
    }
}
