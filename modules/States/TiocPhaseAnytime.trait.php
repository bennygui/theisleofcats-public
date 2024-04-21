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

trait TiocPhaseAnytime
{
    public function changeAnytimeCardPlay($cardId, $actions)
    {
        if (!$this->cardMgr->isCardIdAnytime($cardId))
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not valid");
        $playerId = $this->getCurrentPlayerId();
        $prefs  = [];
        foreach ($actions as $action) {
            $actionTypeId = $action['actionTypeId'];
            if ($actionTypeId != ACTION_TYPE_ID_ANYTIME_PREF)
                throw new BgaVisibleSystemException("BUG! actionTypeId $actionTypeId is invalid");

            $stateId = value_req($action, 'stateId');
            if (array_search($stateId, RETURN_STATE_VALID_IDS) === false)
                throw new BgaVisibleSystemException("BUG! stateId $stateId is not valid");

            $statePlayerId = value_req_null($action, 'statePlayerId');
            if ($statePlayerId !== null) {
                if (!array_key_exists($statePlayerId, $this->loadPlayersBasicInfos()))
                    throw new BgaVisibleSystemException("BUG! statePlayerId $statePlayerId is not valid");
                if ($statePlayerId == $playerId && $stateId != STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID)
                    throw new BgaVisibleSystemException("BUG! statePlayerId $statePlayerId must not be playerId");
            }

            $prefs[] = new TiocPlayerAnytimePref($playerId, $cardId, $stateId, $statePlayerId);
        }

        $this->playerAnytimePrefMgr->updatePlayerPref($playerId, $cardId, $prefs);

        $this->tiocNotifyPlayer(
            $playerId,
            NTF_UPDATE_PLAYER_ANYTIME_PREF,
            clienttranslate('When to ask to play card ${cardId} changed successfully'),
            [
                'cardId' => $cardId,
                'playerAnytimePref' => $this->playerAnytimePrefMgr->getPrefPerCardId($playerId),
            ]
        );
    }

    public function argPhaseAnytimeDrawAndBoatShape()
    {
        return $this->turnActionMgr->turnActionAsArray();
    }

    public function argPhaseAnytimeDrawAndFieldShape()
    {
        $arg = $this->turnActionMgr->turnActionAsArray();
        $arg['drawStep'] = $this->getGlobal(STG_DRAW_AND_FIELD_COUNT);
        return $arg;
    }

    public function argPhaseAnytimeRound()
    {
        $returnStateInfo = $this->stateStackMgr->returnStateInfo();
        if ($returnStateInfo === null)
            throw new BgaVisibleSystemException('BUG! no return state info');
        $comma = '';
        $nextPlayerName = '';
        if ($returnStateInfo->playerId !== null) {
            switch ($returnStateInfo->stateId) {
                case STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID:
                case STATE_PHASE_4_RESCUE_CAT_ID:
                case STATE_PHASE_4_BEFORE_RESCUE_CAT_ID:
                case STATE_PHASE_4_SOLO_RESCUE_CAT_ID:
                case STATE_PHASE_5_RARE_FINDS_ID:
                    $comma = ', ';
                    $basicInfo = $this->loadPlayersBasicInfos()[$returnStateInfo->playerId];
                    $name = $basicInfo['player_name'];
                    $color = $basicInfo['player_color'];
                    $nextPlayerName = "<span style='color:#$color;'>$name</span>";
                    break;
            }
        }
        return [
            'gameEnded' => ($this->getGlobal(STG_DAY_COUNTER) <= 0),
            'nextPhase' => $returnStateInfo->stateName,
            'comma' => $comma,
            'nextPlayerName' => $nextPlayerName,
            'i18n' => ['nextPhase'],
        ];
    }

    public function phaseAnytimeCardConfirmActions($actionArray)
    {
        switch ($this->gamestate->state_id()) {
            case STATE_PHASE_4_RESCUE_CAT_ID:
                $this->phase4ConfirmActions($actionArray);
                break;
            case STATE_PHASE_5_RARE_FINDS_ID:
                $this->phase5ConfirmActions($actionArray);
                break;
            default:
                if (count($actionArray) > 0) {
                    throw new BgaVisibleSystemException('BUG! No actions allowed in this phase');
                }
                break;
        }
    }

    public function playAnytimeCard($cardId)
    {
        $playerId = $this->getCurrentPlayerId();
        $this->validateMustNotBeAbleToTakeTreasures($playerId);

        if ($this->gamestate->state_id() == STATE_PHASE_ANYTIME_ROUND_ID) {
            $this->playerOrderMgr->markPlayerPlayedAnytimeRound($playerId);
        }
        $card = $this->cardMgr->validatePlayAnytimeServerSideCard($cardId, $playerId);
        $anytimeTypeId = $card->cardAnytimeTypeId;
        switch ($anytimeTypeId) {
            case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2:
            case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3:
                $hasCardsToBuy = $this->cardMgr->playerHasCardsToBuy($playerId);

                $nbCardsToDraw = 2;
                if ($anytimeTypeId == CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3) {
                    $nbCardsToDraw = 3;
                }
                $drawnCards = $this->cardMgr->drawCardsForBuy($playerId, $nbCardsToDraw);
                $this->tiocNotifyPlayer(
                    $playerId,
                    NTF_CREATE_OR_MOVE_CARDS,
                    '',
                    [
                        'cards' => $drawnCards,
                    ]
                );
                $this->tiocNotifyAllPlayers(
                    NTF_PLAY_AND_DISCARD_CARDS,
                    clienttranslate('${player_name} plays an "Anytime" card and draws ${cardCount} cards'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'cardCount' => count($drawnCards),
                        'cards' => [$card],
                    ]
                );

                // If the player already had cards to buy, just add them to their hand
                // and either stay in the current phase for the current player or
                // stay in the anytime round for the same player so he can play
                // another card if he wishes.
                if (!$hasCardsToBuy) {
                    // Set return state
                    $this->pushState();
                    $this->gamestate->nextState("nextAnytimeBuyCards");
                }
                break;
            case CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE:
                $drawnShape = $this->shapeMgr->drawToToPlaceLocation();
                $this->tiocNotifyAllPlayers(
                    NTF_UPDATE_FILL_FIELDS,
                    clienttranslate('${player_name} plays an "Anytime" card and draws a new shape ${shapes_img}'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'shapes' => [$drawnShape],
                        'shapes_img' => [$drawnShape],
                    ]
                );
                $this->tiocNotifyAllPlayers(
                    NTF_PLAY_AND_DISCARD_CARDS,
                    '',
                    [
                        'player_id' => $playerId,
                        'cards' => [$card],
                    ]
                );

                if (!$this->shapeMgr->canPlaceShapeAnywhereOnBoat($playerId, $drawnShape)) {
                    $this->shapeMgr->discardShapeId($drawnShape->shapeId);
                    $this->tiocNotifyAllPlayers(
                        NTF_DISCARD_SHAPES,
                        clienttranslate('The drawn shape cannot fit on the player boat and is discarded ${shapes_img}'),
                        [
                            'shapes' => [$drawnShape],
                            'shapes_img' => [$drawnShape],
                        ]
                    );
                    // Failed card, the game state has not really changed for the players
                    // so either stay in the current phase for the current player or
                    // stay in the anytime round for the same player so he can play
                    // another card if he wishes.
                } else {
                    // Set return state
                    $this->pushState();
                    $this->gamestate->nextState("nextAnytimeDrawAndBoatShape");
                }
                break;
            case CARD_ANYTIME_TYPE_ID_DRAW_AND_FIELD_SHAPE:
                $this->tiocNotifyAllPlayers(
                    NTF_PLAY_AND_DISCARD_CARDS,
                    clienttranslate('${player_name} plays an "Anytime" card to draw new shapes'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'cards' => [$card],
                    ]
                );

                $this->setGlobal(STG_DRAW_AND_FIELD_COUNT, 0);

                if ($this->actionDrawAndFieldShape()) {
                    // Set return state
                    $this->pushState();
                    $this->gamestate->nextState("nextAnytimeDrawAndFieldShape");
                }
                break;
            default:
                throw new BgaVisibleSystemException("BUG! anytimeTypeId $anytimeTypeId is invalid");
        }

        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
        $this->giveExtraTime($playerId);
        $this->notifyUpdateHandCount();
    }

    public function phaseAnytimeBuyCards($actionArray)
    {
        $this->checkAction("phaseAnytimeBuyCards");

        $this->actionBuyCards($actionArray);

        $playerId = $this->getCurrentPlayerId();
        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
        $this->giveExtraTime($playerId);
        $this->popState();
    }

    public function phaseAnytimeDrawAndBoatShapeConfirmActions($actionArray)
    {
        $this->checkAction("phaseAnytimeDrawAndBoatShapeConfirmActions");
        if (count($actionArray) == 0)
            throw new BgaUserException($this->_('You cannot confirm no actions'));

        $playerId = $this->getCurrentPlayerId();
        foreach ($actionArray as $action) {
            $actionTypeId = $action['actionTypeId'];
            switch ($actionTypeId) {
                case ACTION_TYPE_ID_ANYTIME_CARD:
                    $this->actionAnytimeCard($action, [CARD_ANYTIME_TYPE_ID_NEXT_SHAPE_ANYWHERE]);
                    break;
                case ACTION_TYPE_ID_TO_PLACE_SHAPE:
                    $shapeId = value_req($action, 'shapeId');
                    $shapeTypeId = $this->shapeMgr->getShapeTypeIdFromShapeId($shapeId);
                    if ($shapeTypeId == SHAPE_TYPE_ID_OSHAX)
                        throw new BgaVisibleSystemException("BUG! Shape cannot be oshax");
                    $shapePlacement = $this->actionTypePlaceShape($playerId, $action, $shapeTypeId);

                    if ($shapePlacement->previousShapeLocationId != SHAPE_LOCATION_ID_TO_PLACE)
                        throw new BgaVisibleSystemException("BUG! Shape is not to place");
                    if ($shapePlacement->matchesMapColor) {
                        if ($shapeTypeId != SHAPE_TYPE_ID_CAT)
                            throw new BgaVisibleSystemException("BUG! Treasure should not have color");
                        $this->turnActionMgr->allowTakeCommonTreasure($playerId);
                    }

                    $this->tiocNotifyAllPlayers(
                        NTF_MOVE_SHAPE_TO_BOAT,
                        $shapePlacement->matchesMapColor
                            ? clienttranslate('${player_name} places the drawn shape on their boat, covering a map of matching color ${shape_img}')
                            : clienttranslate('${player_name} places the drawn shape on their boat ${shape_img}'),
                        [
                            'player_id' => $playerId,
                            'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                            'shape' => $shapePlacement->shape,
                            'shape_img' => $shapePlacement->shape,
                        ]
                    );
                    break;
                case ACTION_TYPE_ID_COMMON_TREASURE:
                    $this->actionTypeCommonTreasure($playerId, $action);
                    break;
                default:
                    throw new BgaVisibleSystemException("BUG! actionTypeId $actionTypeId is invalid");
            }
        }

        $this->notifyUpdateHandCount();
        $this->notifyUpdateBoatUsedGridColor();
        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
        $this->giveExtraTime($playerId);
        $this->popState();
    }

    public function phaseAnytimePlaceFieldShape($field)
    {
        $this->checkAction("phaseAnytimePlaceFieldShape");

        $playerId = $this->getCurrentPlayerId();

        $shape = $this->shapeMgr->moveToPlaceToField($field, $this->isSoloMode());
        $this->tiocNotifyAllPlayers(
            NTF_MOVE_SHAPES,
            $field == FIELD_LEFT
                ? clienttranslate('${player_name} places the drawn shape in the left field ${shapes_img}')
                : clienttranslate('${player_name} places the drawn shape in the right field ${shapes_img}'),
            [
                'player_id' => $playerId,
                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                'shapes' => [$shape],
                'shapes_img' => [$shape],
            ]
        );

        if ($this->actionDrawAndFieldShape()) {
            $this->gamestate->nextState("nextAnytimeDrawAndFieldShape");
        } else {
            $this->popState();
        }
        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
        $this->notifyUpdateSoloOrder();
        $this->giveExtraTime($playerId);
    }

    public function stPhaseAnytimeRoundEnter()
    {
        $this->playerOrderMgr->resetPlayedAnytimeRound();
        $returnStateInfo = $this->stateStackMgr->returnStateInfo();
        $firstPlayerId = null;
        foreach ($this->playerOrderMgr->getPlayerIdInCatOrder() as $playerId) {
            if (!$this->considerPlayerForAnytimeRound($playerId, $returnStateInfo->stateId, $returnStateInfo->playerId)) {
                continue;
            }
            $firstPlayerId = $playerId;
            break;
        }
        if ($firstPlayerId === null)
            throw new BgaVisibleSystemException("BUG! Entering anytime round with no player with cards in hand!");

        $this->gamestate->changeActivePlayer($firstPlayerId);
        $this->gamestate->nextState();
    }

    public function phaseAnytimeRoundConfirm($actionArray)
    {
        $playerId = $this->getCurrentPlayerId();
        if (count($actionArray) == 1) {
            $this->playerOrderMgr->markPlayerPlayedAnytimeRound($playerId);
        } else if (count($actionArray) > 1) {
            throw new BgaVisibleSystemException("BUG! You can only play one anytime card");
        }

        foreach ($actionArray as $action) {
            $actionTypeId = $action['actionTypeId'];
            switch ($actionTypeId) {
                case ACTION_TYPE_ID_ANYTIME_CARD:
                    $this->actionAnytimeCard($action);
                    break;
                default:
                    throw new BgaVisibleSystemException("BUG! actionTypeId $actionTypeId is invalid");
            }
        }

        $this->notifyUpdateHandCount();
        $this->notifyUpdateBoatUsedGridColor();
        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
        $this->giveExtraTime($playerId);
        $this->gamestate->nextState("next");
    }

    public function stPhaseAnytimeRoundNextPlayer()
    {
        $activePlayerId = $this->getActivePlayerId();
        $foundActivePlayerId = false;
        $nextPlayerId = null;
        $returnStateInfo = $this->stateStackMgr->returnStateInfo();
        foreach ($this->playerOrderMgr->getPlayerIdInCatOrder() as $playerId) {
            if ($playerId == $activePlayerId) {
                $foundActivePlayerId = true;
                continue;
            }
            if (!$foundActivePlayerId) {
                continue;
            }
            if (!$this->considerPlayerForAnytimeRound($playerId, $returnStateInfo->stateId, $returnStateInfo->playerId)) {
                continue;
            }
            $nextPlayerId = $playerId;
            break;
        }

        if ($nextPlayerId === null) {
            $hasPlayerThatCanPlay = false;
            foreach ($this->playerOrderMgr->getPlayerIdInCatOrder() as $playerId) {
                if ($this->considerPlayerForAnytimeRound($playerId, $returnStateInfo->stateId, $returnStateInfo->playerId)) {
                    $hasPlayerThatCanPlay = true;
                    break;
                }
            }
            if ($hasPlayerThatCanPlay && $this->playerOrderMgr->hasAnyPlayerPlayedInAnytimeRound()) {
                $this->gamestate->nextState("nextRestartRound");
            } else {
                $this->popState();
            }
        } else {
            $this->gamestate->changeActivePlayer($nextPlayerId);
            $this->gamestate->nextState("nextPlayer");
        }
    }

    public function stPhaseAnytimeRoundExit()
    {
        $this->popState();
    }

    private function actionDrawAndFieldShape()
    {
        $playerId = $this->getCurrentPlayerId();

        // This loop should be a "while (true)" but just in case we put a maximum number of loop
        for ($i = 0; $i <= ANYTIME_DRAW_AND_FIELD_COUNT_MAX; ++$i) {
            $this->incGlobal(STG_DRAW_AND_FIELD_COUNT);
            if ($this->getGlobal(STG_DRAW_AND_FIELD_COUNT) > ANYTIME_DRAW_AND_FIELD_COUNT_MAX) {
                $this->setGlobal(STG_DRAW_AND_FIELD_COUNT, 0);

                return false;
            }

            $drawnShape = $this->shapeMgr->drawToToPlaceLocation();
            if ($drawnShape->isCat()) {
                $this->tiocNotifyAllPlayers(
                    NTF_UPDATE_FILL_FIELDS,
                    clienttranslate('${player_name} draws a new shape and must choose a field ${shapes_img}'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'shapes' => [$drawnShape],
                        'shapes_img' => [$drawnShape],
                    ]
                );
                break;
            } else {
                $drawnShape = $this->shapeMgr->moveShapeToTable($drawnShape->shapeId);
                $this->tiocNotifyAllPlayers(
                    NTF_UPDATE_FILL_FIELDS,
                    clienttranslate('${player_name} draws a new shape and it is placed on the table ${shapes_img}'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'shapes' => [$drawnShape],
                        'shapes_img' => [$drawnShape],
                    ]
                );
                $this->notifyUpdateSoloOrder();
            }
        }
        return true;
    }
}
