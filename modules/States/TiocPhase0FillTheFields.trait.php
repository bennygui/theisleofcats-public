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

const NB_FIELDS = 2;
const DRAW_CATS_PER_FIELDS_PER_PLAYERS = [
    1 => 4,
    2 => 4,
    3 => 6,
    4 => 8,
];

trait TiocPhase0FillTheFields
{
    public function stPhase0ChooseInitialState()
    {
        if ($this->isFamilyMode()) {
            $this->gamestate->nextState('family');
        } else {
            $this->gamestate->nextState('normal');
        }
    }

    public function stPhase0FillTheFields(bool $skipNotification = false, ?bool $skipGotoNextState = null)
    {
        if ($skipGotoNextState === null) {
            $skipGotoNextState = $skipNotification;
        }
        $nbPlayers = count($this->loadPlayersBasicInfos());
        $nbCatsPerFields = DRAW_CATS_PER_FIELDS_PER_PLAYERS[$nbPlayers];
        $drawnShapes = $this->shapeMgr->drawFromBag($nbCatsPerFields * NB_FIELDS, $this->isSoloMode());
        if (!$skipNotification) {
            $this->tiocNotifyAllPlayers(
                NTF_UPDATE_FILL_FIELDS,
                clienttranslate('The island is filled with ${catCountPerFields} cats per fields and ${rareTreasureCount} rare treasures where found'),
                [
                    'catCountPerFields' => $nbCatsPerFields,
                    'rareTreasureCount' => count(array_filter($drawnShapes, function($shape) {
                        return ($shape->isRareTreasure());
                    })),
                    'shapes' => $drawnShapes,
                ]
            );
            $this->notifyUpdateSoloOrder();
        }
        if (!$skipGotoNextState) {
            $this->gamestate->nextState();
        }
    }
}
