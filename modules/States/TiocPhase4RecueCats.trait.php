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

trait TiocPhase4RecueCats
{
    public function stPhase4ActivatePlayersWithRescueCards()
    {
        $playerIdsWithRescueCards = $this->cardMgr->getPlayerIdWithRecueCardsInHand();
        $this->gamestate->setPlayersMultiactive($playerIdsWithRescueCards, "next", true /*Exclusive*/);
    }

    public function phase4PlayRescueCards($cardIds)
    {
        $this->checkAction("phase4PlayRescueCards");

        $playerId = $this->getCurrentPlayerId();
        $playedCards = $this->cardMgr->moveRecueCardFromHandToTablePrivate($playerId, $cardIds);
        if ($playedCards === null || count($playedCards) != count($cardIds))
            throw new BgaUserException($this->_('You can only play your cards'));

        if (!$this->isSoloMode()) {
            $this->tiocNotifyAllPlayers(
                'message',
                clienttranslate('${player_name} plays ${cardCount} rescue cards'),
                [
                    'player_id' => $playerId,
                    'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                    'cardCount' => count($cardIds),
                ]
            );
            $this->tiocNotifyPlayer(
                $playerId,
                NTF_MOVE_CARDS,
                '',
                [
                    'player_id' => $playerId,
                    'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                    'cardCount' => count($cardIds),
                    'cardLocationId' => CARD_LOCATION_ID_TABLE,
                    'cardIds' => $cardIds,
                    'speed' => $this->speedFromCards($playedCards),
                ]
            );
        }

        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
        $this->notifyUpdateHandCount();
        $this->giveExtraTime($playerId);
        if ($this->gamestate->state_id() == STATE_PHASE_4_CHOOSE_RESCUE_CARDS_ID) {
            // Old, incorrect, multiplayer state: must be removed
            $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
        } else {
            $this->gamestate->nextState('next');
        }
    }

    public function stPhase4RescueCardsSingleNextPlayer()
    {
        $playerId = $this->getActivePlayerId();
        $nextPlayerId = $this->getNextPlayerChooseRescueCards($playerId);
        if ($nextPlayerId === null) {
            $this->jumpToAnytimeRound(null, STATE_PHASE_4_REVEAL_RESCUE_CARDS_ID, "nextSkipAnytimeRoundRevealRescueCards");
        } else {
            $this->jumpToAnytimeRound($nextPlayerId, STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID, "nextSkipAnytimeRoundNextPlayer");
        }
    }

    public function stPhase4RevealRecueCards()
    {
        $playersBasicInfos = $this->loadPlayersBasicInfos();
        $revealedCardsPerPlayerId = $this->cardMgr->reavealTablePrivateCardsPerPlayerId();
        foreach (array_keys($playersBasicInfos) as $playerId) {
            $cards = [];
            if (array_key_exists($playerId, $revealedCardsPerPlayerId)) {
                $cards = $revealedCardsPerPlayerId[$playerId];
            }
            $this->tiocNotifyAllPlayers(
                NTF_CREATE_OR_MOVE_CARDS,
                clienttranslate('${player_name} plays ${cardCount} rescue cards with a speed of ${speed}'),
                [
                    'player_id' => $playerId,
                    'player_name' => $playersBasicInfos[$playerId]['player_name'],
                    'cardCount' => count($cards),
                    'cards' => $cards,
                    'speed' => $this->speedFromCards($cards),
                ]
            );
        }

        $sisterSpeed = null;
        if ($this->isSoloMode()) {
            $soloBasketCards = $this->cardMgr->soloDrawInitalBasketCards();
            $sisterSpeed = $soloBasketCards[0]->speed;
            $this->tiocNotifyAllPlayers(
                NTF_CREATE_OR_MOVE_CARDS,
                clienttranslate('Your sister plays ${cardCount} solo basket cards with a speed of ${speed}'),
                [
                    'cardCount' => count($soloBasketCards),
                    'cards' => [$soloBasketCards[0]],
                    'speed' => $sisterSpeed,
                ]
            );
        }

        $playersSpeed = [];
        foreach (array_keys($playersBasicInfos) as $playerId) {
            $playersSpeed[$playerId] = 0;
        }
        foreach ($revealedCardsPerPlayerId as $playerId => $cards) {
            $playersSpeed[$playerId] = $this->speedFromCards($cards);
        }
        if ($this->isSoloMode()) {
            $playersSpeed[SOLO_SISTER_PLAYER_ID] = $sisterSpeed;
        }
        $this->playerOrderMgr->adjustPlayerCatOrderFromSpeed($playersSpeed, $sisterSpeed);

        $this->playerOrderMgr->resetPlayerPass();

        $playerIdInCatOrder = $this->playerOrderMgr->getPlayerIdInCatOrder($this->isSoloMode());
        $this->tiocNotifyAllPlayers(
            NTF_ADJUST_CAT_ORDER,
            clienttranslate('Cat order on the island is adjusted based on speed'),
            [
                'playerIdArray' => $playerIdInCatOrder,
            ]
        );

        $this->notifyUpdateHandCount();
        $firstPlayerId = $this->playerOrderMgr->getFirstPlayerIdInCatOrder();
        $this->jumpToAnytimeRound($firstPlayerId, STATE_PHASE_4_BEFORE_RESCUE_CAT_ID, "nextSkipAnytimeRound");
    }

    public function stPhase4BeforeRescueCat()
    {
        $activePlayerId = $this->getActivePlayerId();
        if (!$this->phase4CanPlayerAutoPass($activePlayerId)) {
            $this->jumpToAnytimeRound($activePlayerId, STATE_PHASE_4_SOLO_RESCUE_CAT_ID, "nextSkipAnytimeRoundPhase4");
            return;
        }
        $this->phase4MarkPass($activePlayerId, true);
        $this->phase4NextPlayerStartingFromPlayerId($activePlayerId);
    }

    public function stPhase4SoloRescueCat()
    {
        if ($this->isSoloMode() && $this->playerOrderMgr->sisterCatOrder() == 1) {
            $this->soloPlaySisterBasketCard();
        }
        $this->gamestate->nextState('next');
    }

    public function argPhase4RescueCat()
    {
        return $this->turnActionMgr->turnActionAsArray();
    }

    public function phase4ConfirmActions($actionArray)
    {
        $this->checkAction("phase4ConfirmActions");

        $playerId = $this->getCurrentPlayerId();
        foreach ($actionArray as $action) {
            $actionTypeId = $action['actionTypeId'];
            switch ($actionTypeId) {
                case ACTION_TYPE_ID_RESCUE_CARD:
                    $this->validateMustNotBeAbleToTakeTreasures($playerId);

                    $firstCardId = value_req($action, 'firstCardId');
                    $secondCardId = value_req_null($action, 'secondCardId');
                    $playedCards = $this->cardMgr->validateAndUseRescueCards($playerId, $firstCardId, $secondCardId);
                    $this->tiocNotifyAllPlayers(
                        NTF_PLAY_AND_DISCARD_CARDS,
                        clienttranslate('${player_name} uses ${cardCount} card(s) as a temporary basket'),
                        [
                            'player_id' => $playerId,
                            'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                            'cardCount' => count($playedCards),
                            'cards' => $playedCards,
                        ]
                    );

                    $this->phase4ActionTypeRescue($playerId, $action);
                    break;
                case ACTION_TYPE_ID_RESCUE_BASKET:
                    $this->validateMustNotBeAbleToTakeTreasures($playerId);

                    $basketId = value_req($action, 'basketId');
                    $basketId = $this->basketMgr->basketIdToDatabaseBasketId($basketId);
                    $this->basketMgr->validateAndUseBasket($playerId, $basketId);
                    $this->tiocNotifyAllPlayers(
                        NTF_USE_BASKET,
                        clienttranslate('${player_name} uses a permanent basket'),
                        [
                            'player_id' => $playerId,
                            'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                            'basketId' => $basketId,
                        ]
                    );

                    $this->phase4ActionTypeRescue($playerId, $action);
                    break;
                case ACTION_TYPE_ID_COMMON_TREASURE:
                    $this->actionTypeCommonTreasure($playerId, $action);
                    break;
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
        $this->notifyUpdateSoloOrder();
    }

    public function phase4Pass()
    {
        $this->checkAction("phase4Pass");
        $playerId = $this->getCurrentPlayerId();
        if ($this->turnActionMgr->hasRescuedCat($playerId))
            throw new BgaUserException($this->_('You cannot pass, you have already rescued cats'));

        if ($this->playerOrderMgr->hasPlayerPass($playerId))
            throw new BgaUserException($this->_('You cannot pass, you have already passed'));

        $this->phase4MarkPass($playerId, false);
        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();

        $this->gamestate->nextState('next');
    }

    private function phase4MarkPass($playerId, $isAutomatic)
    {
        $this->turnActionMgr->resetTreasureCount($playerId);

        $this->playerOrderMgr->markPlayerPass($playerId);

        $this->tiocNotifyAllPlayers(
            NTF_PLAYER_PASS_UPDATE,
            $isAutomatic
                ? clienttranslate('${player_name} passes (automatic)')
                : clienttranslate('${player_name} passes'),
            [
                'player_id' => $playerId,
                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                'passPerPlayerId' => $this->playerOrderMgr->getPassPerPlayerId(),
            ]
        );

        $this->giveExtraTime($playerId);
    }

    private function phase4CanPlayerAutoPass($playerId)
    {
        if (!$this->isAutoPassPreference($playerId)) {
            return false;
        }
        if ($this->playerOrderMgr->hasPlayerPass($playerId)) {
            return false;
        }
        if ($this->basketMgr->hasUnusedBasket($playerId)) {
            return false;
        }
        if ($this->cardMgr->countRescueBasket($playerId) >= 1) {
            return false;
        }
        if ($this->cardMgr->playerHasAnytimeCardsForRescuePhaseInHand($playerId)) {
            return false;
        }
        return true;
    }

    public function phase4EndTurn()
    {
        $playerId = $this->getCurrentPlayerId();
        if (!$this->turnActionMgr->hasRescuedCat($playerId))
            throw new BgaUserException($this->_('You cannot end your turn, you have not rescued a cat'));
        $this->turnActionMgr->resetRescueCatCount($playerId);
        $this->turnActionMgr->resetTreasureCount($playerId);

        if ($this->playerOrderMgr->hasPlayerPass($playerId))
            throw new BgaUserException($this->_('You cannot end your turn, you have already passed'));

        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
        $this->giveExtraTime($playerId);
        $this->gamestate->nextState('next');
    }

    public function stPhase4NextPlayer()
    {
        $activePlayerId = $this->getActivePlayerId();
        $this->phase4NextPlayerStartingFromPlayerId($activePlayerId);
    }

    private function phase4NextPlayerStartingFromPlayerId($currentPlayerId)
    {
        $nextPlayerId = $this->playerOrderMgr->getNextPlayerIdInCatOrderNotPass($currentPlayerId);
        while ($nextPlayerId !== null) {
            if (!$this->phase4CanPlayerAutoPass($nextPlayerId)) {
                break;
            }
            $this->phase4MarkPass($nextPlayerId, true);
            $nextPlayerId = $this->playerOrderMgr->getNextPlayerIdInCatOrderNotPass($currentPlayerId);
        }
        if ($nextPlayerId === null || $this->shapeMgr->fieldsAreEmpty()) {
            // Loop 100 times to prevent infinite loop in case of bug
            for ($i = 0; $i < 100; ++$i) {
                if (!$this->soloPlaySisterBasketCard()) {
                    break;
                }
            }
            $this->playerOrderMgr->resetPlayerPass();

            $this->tiocNotifyAllPlayers(
                NTF_PLAYER_PASS_UPDATE,
                clienttranslate('Rescue cats phase is finished'),
                [
                    'passPerPlayerId' => $this->playerOrderMgr->getPassPerPlayerId(),
                ]
            );
            $discardedCardIds = $this->cardMgr->discardUnusedRecueCards();
            $this->tiocNotifyAllPlayers(
                NTF_MOVE_CARDS,
                '',
                [
                    'cardLocationId' => CARD_LOCATION_ID_DISCARD,
                    'cardIds' => $discardedCardIds,
                ]
            );
            $this->notifyUpdateHandCount();

            $firstPlayerId = $this->playerOrderMgr->getFirstPlayerIdInCatOrder();
            $this->jumpToAnytimeRound($firstPlayerId, STATE_PHASE_5_BEFORE_RARE_FINDS_ID, "nextSkipAnytimeRoundPhase5");
            return;
        }

        $this->soloPlaySisterBasketCard();
        $this->jumpToAnytimeRound($nextPlayerId, STATE_PHASE_4_RESCUE_CAT_ID, "nextSkipAnytimeRoundPhase4");
    }

    private function speedFromCards($cards)
    {
        $speed = 0;
        foreach ($cards as $card) {
            if ($card->speed !== null) {
                $speed += $card->speed;
            }
        }
        return $speed;
    }

    private function phase4ActionTypeRescue($playerId, $action)
    {
        if (!$this->turnActionMgr->canRescueCat($playerId))
            throw new BgaVisibleSystemException("BUG! Can't rescue cat at this point");

        $shapePlacement = $this->actionTypePlaceShape($playerId, $action, SHAPE_TYPE_ID_CAT);

        $shapePrice = null;
        if ($shapePlacement->previousShapeLocationId == SHAPE_LOCATION_ID_FIELD_LEFT) {
            $shapePrice = CAT_PRICE_LEFT_FIELD;
        } else if ($shapePlacement->previousShapeLocationId == SHAPE_LOCATION_ID_FIELD_RIGHT) {
            $shapePrice = CAT_PRICE_RIGHT_FIELD;
        } else {
            throw new BgaVisibleSystemException("BUG! Shape is not in fields");
        }
        $remainingFish = $this->fishMgr->removeFishFromPlayer($playerId, $shapePrice);
        if ($remainingFish < 0)
            throw new BgaVisibleSystemException("BUG! Not enough fish");
        $this->tiocNotifyAllPlayers(
            NTF_UPDATE_FISH_COUNT,
            clienttranslate('${player_name} gives ${fishCount} ${fish_img} fish to rescue a cat'),
            [
                'player_id' => $playerId,
                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                'fishCount' => $shapePrice,
                'fishCountTotal' => $remainingFish,
                'fish_img' => '',
            ]
        );

        $this->turnActionMgr->catRescued($playerId);
        if ($this->turnActionMgr->rescuedCatCount($playerId) > 1) {
            $this->turnActionMgr->useExtraCat($playerId);
        }

        if ($shapePlacement->matchesMapColor) {
            $this->turnActionMgr->allowTakeCommonTreasure($playerId);
        }
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

        $this->notifyUpdateHandCount();
    }

    private function soloPlaySisterBasketCard()
    {
        if (!$this->isSoloMode()) {
            return false;
        }
        $card = $this->cardMgr->soloPlayNextBasketCard();
        if ($card === null) {
            return false;
        }

        $this->tiocNotifyAllPlayers(
            NTF_CREATE_OR_MOVE_CARDS,
            clienttranslate('Your sister plays a solo basket card'),
            [
                'cards' => [$card],
            ]
        );

        foreach ($card->getSoloBasketType() as $basket) {
            switch ($basket[0]) {
                case CARD_SOLO_BASKET_TYPE_ID_CAT:
                    $discardNumber = $basket[1];
                    $shape = $this->shapeMgr->discardSoloCat($discardNumber);
                    if ($shape === null) {
                        $this->tiocNotifyAllPlayers(
                            'message',
                            clienttranslate('Your sister cannot take cat ${discardNumber}'),
                            [
                                'discardNumber' => $discardNumber,
                            ]
                        );
                    } else {
                        $this->tiocNotifyAllPlayers(
                            NTF_DISCARD_SHAPES,
                            clienttranslate('Your sister takes cat ${discardNumber} ${shapes_img}'),
                            [
                                'discardNumber' => $shape->soloOrder,
                                'shapes' => [$shape],
                                'shapes_img' => [$shape],
                            ]
                        );
                    }
                    break;
                case CARD_SOLO_BASKET_TYPE_ID_OSHAX:
                    $discardNumber = $basket[1];
                    $shape = $this->shapeMgr->discardSoloOshax($discardNumber);
                    if ($shape === null) {
                        $this->tiocNotifyAllPlayers(
                            'message',
                            clienttranslate('Your sister cannot take Oshax ${discardNumber}'),
                            [
                                'discardNumber' => $discardNumber,
                            ]
                        );
                    } else {
                        $this->tiocNotifyAllPlayers(
                            NTF_DISCARD_SHAPES,
                            clienttranslate('Your sister takes Oshax ${discardNumber} ${shapes_img}'),
                            [
                                'discardNumber' => $shape->soloOrder,
                                'shapes' => [$shape],
                                'shapes_img' => [$shape],
                            ]
                        );
                    }
                    break;
                case CARD_SOLO_BASKET_TYPE_ID_COMMON_TREASURE:
                    $shapeDefId = $basket[1];
                    $shape = $this->shapeMgr->discardSoloCommonTreasure($shapeDefId);
                    if ($shape === null) {
                        $this->tiocNotifyAllPlayers(
                            'message',
                            clienttranslate('Your sister cannot take a common treasure'),
                            []
                        );
                    } else {
                        $this->tiocNotifyAllPlayers(
                            NTF_DISCARD_SHAPES,
                            clienttranslate('Your sister takes a common treasure ${shapes_img}'),
                            [
                                'shapes' => [$shape],
                                'shapes_img' => [$shape],
                            ]
                        );
                    }
                    break;
                case CARD_SOLO_BASKET_TYPE_ID_RARE_TREASURE:
                    $discardNumber = $basket[1];
                    $shape = $this->shapeMgr->discardSoloRareTreasure($discardNumber);
                    if ($shape === null) {
                        $this->tiocNotifyAllPlayers(
                            'message',
                            clienttranslate('Your sister cannot take rare treasure ${discardNumber}'),
                            [
                                'discardNumber' => $discardNumber,
                            ]
                        );
                    } else {
                        $this->tiocNotifyAllPlayers(
                            NTF_DISCARD_SHAPES,
                            clienttranslate('Your sister takes rare treasure ${discardNumber} ${shapes_img}'),
                            [
                                'discardNumber' => $shape->soloOrder,
                                'shapes' => [$shape],
                                'shapes_img' => [$shape],
                            ]
                        );
                    }
                    break;
                case CARD_SOLO_BASKET_TYPE_ID_SWITCH:
                    $firstNumber = $basket[1];
                    $secondNumber = $basket[2];
                    $shapes = $this->shapeMgr->soloSwitch($firstNumber, $secondNumber);
                    if ($shapes === null) {
                        $this->tiocNotifyAllPlayers(
                            'message',
                            clienttranslate('Your sister cannot switch cat ${firstNumber} with cat ${secondNumber}'),
                            [
                                'firstNumber' => $firstNumber,
                                'secondNumber' => $secondNumber,
                            ]
                        );
                    } else {
                        $this->tiocNotifyAllPlayers(
                            NTF_MOVE_SHAPES,
                            clienttranslate('Your sister switches cat ${firstNumber} with cat ${secondNumber} ${shapes_img}'),
                            [
                                'firstNumber' => $firstNumber,
                                'secondNumber' => $secondNumber,
                                'shapes' => $shapes,
                                'shapes_img' => $shapes,
                            ]
                        );
                    }
                    break;
            }
        }

        $this->tiocNotifyAllPlayers(
            NTF_UPDATE_SOLO_ORDER,
            '',
            [
                'soloOrder' => $this->shapeMgr->getSoloOrder(),
            ]
        );
        return true;
    }
}
