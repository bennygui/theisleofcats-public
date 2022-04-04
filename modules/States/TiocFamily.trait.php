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

const DRAW_CARDS_FAMILY_PER_PLAYERS = 3;

trait TiocFamily
{
    public function familySetupDealCards()
    {
        foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $this->cardMgr->drawCardsForDraft($playerId, DRAW_CARDS_FAMILY_PER_PLAYERS);
        }
    }

    public function familyKeepLessonCards($cardIds)
    {
        $this->checkAction("familyKeepLessonCards");

        if (count($cardIds) != NB_CARDS_KEEP_FAMILY)
            throw new BgaUserException(self::_('You must select exactly 2 lesson cards to keep'));

        $playerId = $this->getCurrentPlayerId();
        $discardCardId = $this->cardMgr->draftKeepOnlyCardList($playerId, $cardIds);
        if ($discardCardId === null)
            throw new BgaUserException(self::_('You must select your cards'));
        $this->tiocNotifyPlayer(
            $playerId,
            NTF_DISCARD_SECRET_CARDS,
            '',
            [
                'player_id' => $playerId,
                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                'cardIds' => [$discardCardId],
            ]
        );

        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
        $this->giveExtraTime($playerId);
        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    public function stFamilyReadLessons()
    {
        $this->cardMgr->moveFamilyDraftCardsToHand();
        $this->actionReadLessons(false);

        $this->gamestate->nextState('next');
    }

    public function argFamilyRescueCat()
    {
        return $this->turnActionMgr->turnActionAsArray();
    }

    public function familyConfirmActions($actionArray)
    {
        $this->checkAction("familyConfirmActions");
        $playerId = $this->getCurrentPlayerId();
        $actionArrayCount = count($actionArray);
        if ($actionArrayCount != 1 && $actionArrayCount != 2)
            throw new BgaVisibleSystemException("BUG! actionArrayCount $actionArrayCount is invalid");

        $actionTypeId = $actionArray[0]['actionTypeId'];
        if ($actionTypeId != ACTION_TYPE_ID_RESCUE_FAMILY)
            throw new BgaVisibleSystemException("BUG! actionTypeId $actionTypeId is invalid");

        $shapePlacement = $this->actionTypePlaceShape($playerId, $actionArray[0], SHAPE_TYPE_ID_CAT);

        if (
            $shapePlacement->previousShapeLocationId != SHAPE_LOCATION_ID_FIELD_LEFT
            && $shapePlacement->previousShapeLocationId != SHAPE_LOCATION_ID_FIELD_RIGHT
        ) {
            throw new BgaVisibleSystemException("BUG! Shape is not in fields");
        }

        $canTakeTreasure = $shapePlacement->matchesMapColor;
        $this->tiocNotifyAllPlayers(
            NTF_MOVE_SHAPE_TO_BOAT,
            $shapePlacement->matchesMapColor
                ? clienttranslate('${player_name} places a cat on their boat, covering a map of matching color ${shape_img}')
                : clienttranslate('${player_name} places a cat on their boat ${shape_img}'),
            [
                'player_id' => $playerId,
                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                'shape' => $shapePlacement->shape,
                'shape_img' => $shapePlacement->shape,
            ]
        );

        if ($actionArrayCount > 1) {
            $actionTypeId = $actionArray[1]['actionTypeId'];
            if (!$canTakeTreasure)
                throw new BgaVisibleSystemException("BUG! It's not possible to take a treasure");
            if ($actionTypeId == ACTION_TYPE_ID_COMMON_TREASURE) {
                $this->actionTypeCommonTreasure($playerId, $actionArray[1], false);
            } else if ($actionTypeId == ACTION_TYPE_ID_RARE_TREASURE) {
                $shapePlacement = $this->actionTypePlaceShape($playerId, $actionArray[1], SHAPE_TYPE_ID_RARE_TREASURE);

                if ($shapePlacement->previousShapeLocationId != SHAPE_LOCATION_ID_TABLE)
                    throw new BgaVisibleSystemException("BUG! Shape is not on table");
                if ($shapePlacement->matchesMapColor)
                    throw new BgaVisibleSystemException("BUG! Rare treasure should not have color");

                $this->tiocNotifyAllPlayers(
                    NTF_MOVE_SHAPE_TO_BOAT,
                    clienttranslate('${player_name} places a rare treasure on their boat ${shape_img}'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'shape' => $shapePlacement->shape,
                        'shape_img' => $shapePlacement->shape,
                    ]
                );
            } else {
                throw new BgaVisibleSystemException("BUG! actionTypeId $actionTypeId is invalid");
            }
        }

        if ($this->playerOrderMgr->hasPlayerPass($playerId))
            throw new BgaUserException(self::_('You cannot end your turn, you have already passed'));
        $this->notifyUpdateBoatUsedGridColor();
        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
        $this->giveExtraTime($playerId);
        $this->gamestate->nextState('next');
    }

    public function familyPass()
    {
        $this->checkAction("familyPass");
        $playerId = $this->getCurrentPlayerId();

        if ($this->playerOrderMgr->hasPlayerPass($playerId))
            throw new BgaUserException(self::_('You cannot pass, you have already passed'));

        $this->familyMarkPass($playerId);

        $this->gamestate->nextState('next');
    }

    private function familyMarkPass($playerId)
    {
        $this->playerOrderMgr->markPlayerPass($playerId);

        $this->tiocNotifyAllPlayers(
            NTF_PLAYER_PASS_UPDATE,
            clienttranslate('${player_name} passes'),
            [
                'player_id' => $playerId,
                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                'passPerPlayerId' => $this->playerOrderMgr->getPassPerPlayerId(),
            ]
        );

        $this->giveExtraTime($playerId);
        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
    }

    public function stFamilyNextPlayer()
    {
        $this->turnActionMgr->resetForNewTurn();
        $activePlayerId = $this->getActivePlayerId();
        $nextPlayerId = $this->playerOrderMgr->getNextPlayerIdInCatOrderNotPass($activePlayerId);
        if ($nextPlayerId === null || $this->shapeMgr->fieldsAreEmpty()) {
            $this->playerOrderMgr->resetPlayerPass();

            $this->tiocNotifyAllPlayers(
                NTF_PLAYER_PASS_UPDATE,
                clienttranslate('Rescue phase is finished'),
                [
                    'passPerPlayerId' => $this->playerOrderMgr->getPassPerPlayerId(),
                ]
            );

            $discardedShapes = $this->shapeMgr->emptyTheFields();
            $this->tiocNotifyAllPlayers(
                NTF_DISCARD_SHAPES,
                clienttranslate('Remaining cats flee the fields'),
                [
                    'shapes' => $discardedShapes,
                ]
            );

            $this->incGlobal(STG_DAY_COUNTER, -1);
            $this->tiocNotifyAllPlayers(
                NTF_UPDATE_DAY_COUNTER,
                clienttranslate("Vesh's boat advances!"),
                [
                    'day' => $this->getGlobal(STG_DAY_COUNTER),
                ]
            );

            if ($this->getGlobal(STG_DAY_COUNTER) <= 0) {
                // Game is ending
                $this->gamestate->nextState('endGame');
            } else {
                $this->playerOrderMgr->rotatePlayerCatOrderFamily();
                $playerIdInCatOrder = $this->playerOrderMgr->getPlayerIdInCatOrder();
                $this->tiocNotifyAllPlayers(
                    NTF_ADJUST_CAT_ORDER,
                    clienttranslate('Cat order on the island is adjusted: starting player is now the last player'),
                    [
                        'playerIdArray' => $playerIdInCatOrder,
                    ]
                );
                $this->gamestate->changeActivePlayer($playerIdInCatOrder[0]);

                $this->stPhase0FillTheFields(false, true);

                $this->gamestate->nextState('nextPlayer');
            }
            return;
        }

        $this->gamestate->changeActivePlayer($nextPlayerId);
        $this->gamestate->nextState('nextPlayer');
    }
}
