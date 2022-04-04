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

trait TiocPhase3ReadLessons
{
    public function stPhase3ReadLessons()
    {
        $this->actionReadLessons(true);

        $nextPlayerId = $this->getNextPlayerChooseRescueCards(null);
        if ($nextPlayerId === null) {
            $this->jumpToAnytimeRound(null, STATE_PHASE_4_REVEAL_RESCUE_CARDS_ID, "nextSkipAnytimeRoundReveal");
        } else {
            $this->jumpToAnytimeRound($nextPlayerId, STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID, "nextSkipAnytimeRoundRescue");
        }
    }
}
