<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * theisleofcatsbennygui implementation : © Guillaume Benny bennygui@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

const FISH_GAIN_PER_DAY = 20;

trait TiocPhase1Fishing
{
    public function stPhase1Fishing(bool $initialSetup = false)
    {
        foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $fishCountTotal = $this->fishMgr->addFishToPlayer($playerId, FISH_GAIN_PER_DAY);
            if (!$initialSetup) {
                $this->tiocNotifyAllPlayers(
                    NTF_UPDATE_FISH_COUNT,
                    clienttranslate('${player_name} gains ${fishCount} ${fish_img} fish for a total of ${fishCountTotal} fish'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $playerInfo['player_name'],
                        'fishCount' => FISH_GAIN_PER_DAY,
                        'fishCountTotal' => $fishCountTotal,
                        'fish_img' => '',
                    ]
                );
            }
        }
        if (!$initialSetup) {
            $this->jumpToAnytimeRound(null, STATE_PHASE_2_EXPLORE_DEAL_CARDS_ID, "nextSkipAnytimeRound");
        }
    }
}
