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

trait TiocPhaseCommon
{
    private function actionBuyCards($actionArray)
    {
        $playerId = $this->getCurrentPlayerId();
        $cardIdsInHand = $this->cardMgr->getPlayerHandCardIdArray($playerId);
        $cardIdsToBuy = [];
        foreach ($actionArray as $action) {
            $actionTypeId = $action['actionTypeId'];
            switch ($actionTypeId) {
                case ACTION_TYPE_ID_BUY_CARD:
                    $cardId = value_req($action, 'cardId');
                    $cardIdsToBuy[$cardId] = $action;
                    break;
                case ACTION_TYPE_ID_UNBUY_CARD:
                    $cardId = value_req($action, 'cardId');
                    unset($cardIdsToBuy[$cardId]);
                    break;
            }
        }
        $buyCardIds = [];
        $totalPrice = 0;
        foreach ($actionArray as $action) {
            $actionTypeId = $action['actionTypeId'];
            switch ($actionTypeId) {
                case ACTION_TYPE_ID_BUY_CARD:
                    $cardId = value_req($action, 'cardId');
                    if (!array_key_exists($cardId, $cardIdsToBuy)) {
                        break;
                    }
                    if (array_key_exists($cardId, $buyCardIds)) {
                        break;
                    }
                    $colorId = value_req_null($cardIdsToBuy[$cardId], 'colorId');
                    $price = $this->cardMgr->buyPlayerCard($playerId, $cardId, $colorId);
                    $remainingFish = $this->fishMgr->removeFishFromPlayer($playerId, $price);
                    if ($remainingFish < 0)
                        throw new BgaUserException(self::_('You do not have enough fish to buy those cards'));
                    $totalPrice += $price;
                    $buyCardIds[$cardId] = true;
                    break;
                case ACTION_TYPE_ID_UNBUY_CARD:
                    break;
                case ACTION_TYPE_ID_ANYTIME_CARD:
                    $cardId = value_req($action, 'cardId');
                    if (array_search($cardId, $cardIdsInHand) === false)
                        throw new BgaVisibleSystemException("BUG! cardId $cardId was not in player hand at start of buy");
                    $this->actionAnytimeCard($action, CARD_ANYTIME_BUY_PHASE_IDS);
                    break;
                default:
                    throw new BgaVisibleSystemException("BUG! actionTypeId $actionTypeId is invalid");
            }
        }
        $buyCardIds = array_keys($buyCardIds);

        $this->tiocNotifyAllPlayers(
            NTF_UPDATE_FISH_COUNT,
            clienttranslate('${player_name} buys ${cardCount} cards for ${fishCount} ${fish_img} fish'),
            [
                'player_id' => $playerId,
                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                'cardCount' => count($buyCardIds),
                'fishCount' => $totalPrice,
                'fishCountTotal' => $this->fishMgr->getNbFishForPlayerId($playerId),
                'fish_img' => '',
            ]
        );

        $this->tiocNotifyPlayer(
            $playerId,
            NTF_MOVE_CARDS,
            '',
            [
                'player_id' => $playerId,
                'cardLocationId' => CARD_LOCATION_ID_PLAYER_HAND,
                'cardIds' => $buyCardIds,
            ]
        );

        $discardedCardIds = $this->cardMgr->discardUnbuyCards($playerId);
        $this->tiocNotifyPlayer(
            $playerId,
            NTF_MOVE_CARDS,
            '',
            [
                'player_id' => $playerId,
                'cardLocationId' => CARD_LOCATION_ID_DISCARD,
                'cardIds' => $discardedCardIds,
            ]
        );
        $this->notifyUpdateHandCount();
    }

    private function actionReadLessons($notifyNoLessons = false)
    {
        $publicLessonCards = $this->cardMgr->movePublicLessonsToTable();
        if ($notifyNoLessons || count($publicLessonCards) > 0) {
            $this->tiocNotifyAllPlayers(
                NTF_CREATE_OR_MOVE_CARDS,
                clienttranslate('${cardCount} public lessons cards are revealed'),
                [
                    'cardCount' => count($publicLessonCards),
                    'cards' => $publicLessonCards,
                ]
            );
        }

        $playerBasicInfo = $this->loadPlayersBasicInfos();
        foreach ($playerBasicInfo as $playerId => $playerInfo) {
            $privateLessonCards = $this->cardMgr->movePrivateLessonsToTable($playerId);
            $this->tiocNotifyPlayer(
                $playerId,
                NTF_MOVE_CARDS,
                '',
                [
                    'player_id' => $playerId,
                    'cardLocationId' => CARD_LOCATION_ID_TABLE,
                    'cardIds' => array_map(
                        function ($card) {
                            return $card->cardId;
                        },
                        $privateLessonCards
                    ),
                ]
            );
            if ($notifyNoLessons || count($privateLessonCards) > 0) {
                $this->tiocNotifyAllPlayers(
                    NTF_UPDATE_PRIVATE_LESSONS_COUNT,
                    clienttranslate('${player_name} adds ${cardCount} cards to their private lessons'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $playerInfo['player_name'],
                        'cardCount' => count($privateLessonCards),
                        'privateLessonsCount' => $this->cardMgr->getPrivateLessonsCount(array_keys($this->loadPlayersBasicInfos())),
                    ]
                );
            }
        }

        $this->notifyUpdateHandCount();
    }

    private function actionTypePlaceShape($playerId, $action, $shapeTypeId, $oshaxColorId = null)
    {
        $mustTouchOtherShapes = true;
        if ($this->turnActionMgr->canPutNextShapeAnywhere($playerId)) {
            $mustTouchOtherShapes = false;
            $this->turnActionMgr->takeNextShapeAnywhere($playerId);
        }
        $shapeId = value_req($action, 'shapeId');
        $x = value_req($action, 'x');
        $y = value_req($action, 'y');
        $rotation = value_req($action, 'rotation');
        $flipH = value_req($action, 'flipH');
        $flipV = value_req($action, 'flipV');
        return $this->shapeMgr->validateAndPlaceOnBoat(
            $playerId,
            $this->playerOrderMgr->getPlayerBoatColorName($playerId),
            $shapeTypeId,
            $shapeId,
            $x,
            $y,
            $rotation,
            $flipH,
            $flipV,
            $mustTouchOtherShapes,
            $oshaxColorId
        );
    }

    private function actionTypeCommonTreasure($playerId, $action, $checkTurnAction = true)
    {
        if ($checkTurnAction) {
            if (!$this->turnActionMgr->canTakeCommonTreasure($playerId))
                throw new BgaVisibleSystemException("BUG! Can't place common treasure at this point - actionTypeCommonTreasure");
        }

        $shapePlacement = $this->actionTypePlaceShape($playerId, $action, SHAPE_TYPE_ID_COMMON_TREASURE);

        if ($shapePlacement->previousShapeLocationId != SHAPE_LOCATION_ID_TABLE)
            throw new BgaVisibleSystemException("BUG! Shape is not on table");
        if ($shapePlacement->matchesMapColor)
            throw new BgaVisibleSystemException("BUG! Common treasure should not have color");

        $this->turnActionMgr->takeCommonTreasure($playerId);

        $this->tiocNotifyAllPlayers(
            NTF_MOVE_SHAPE_TO_BOAT,
            clienttranslate('${player_name} places a common treasure on their boat ${shape_img}'),
            [
                'player_id' => $playerId,
                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                'shape' => $shapePlacement->shape,
                'shape_img' => $shapePlacement->shape,
            ]
        );
    }

    public function phase45PassAnytimeCard($actionArray)
    {
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
        $playerId = $this->getCurrentPlayerId();
        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
    }

    private function actionAnytimeCard($action, $allowedAnytimeTypeIdArray = null)
    {
        $playerId = $this->getCurrentPlayerId();
        if ($action['actionTypeId'] != ACTION_TYPE_ID_ANYTIME_CARD)
            throw new BgaVisibleSystemException("BUG! Action type id is not an anytime card");

        $cardId = value_req($action, 'cardId');
        $card = $this->cardMgr->validatePlayAnytimeClientSideCard($cardId, $playerId, $allowedAnytimeTypeIdArray);

        switch ($card->cardAnytimeTypeId) {
            case CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_OSHAX:
                $this->actionAnytimeCardGainFish($card, $playerId, 2 * $this->shapeMgr->countOshax($playerId));
                break;
            case CARD_ANYTIME_TYPE_ID_NEXT_SHAPE_ANYWHERE:
                if ($this->turnActionMgr->canPutNextShapeAnywhere($playerId))
                    throw new BgaVisibleSystemException("BUG! Player can already put the next shape anywhere");
                $this->turnActionMgr->allowNextShapeAnywhere($playerId);
                $this->tiocNotifyAllPlayers(
                    NTF_PLAY_AND_DISCARD_CARDS,
                    clienttranslate('${player_name} plays an anytime card and can place their next shape anywhere on their boat'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'cards' => [$card],
                    ]
                );
                break;
            case CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET:
                $basketId = value_req($action, 'basketId');
                $basketId = $this->basketMgr->basketIdToDatabaseBasketId($basketId);
                $this->basketMgr->validateDiscardBasket($basketId, $playerId);

                $gainFish = 5;
                $totalFish = $this->fishMgr->addFishToPlayer($playerId, $gainFish);
                $this->tiocNotifyAllPlayers(
                    NTF_UPDATE_FISH_COUNT,
                    clienttranslate('${player_name} plays an anytime card, discards a basket and gains ${fishCount} ${fish_img} fish'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'fishCount' => $gainFish,
                        'fishCountTotal' => $totalFish,
                        'fish_img' => '',
                    ]
                );
                $this->tiocNotifyAllPlayers(
                    NTF_PLAY_AND_DISCARD_CARDS,
                    '',
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'cards' => [$card],
                    ]
                );
                $this->tiocNotifyAllPlayers(
                    NTF_DISCARD_BASKET,
                    '',
                    [
                        'player_id' => $playerId,
                        'basketId' => $basketId,
                    ]
                );
                break;
            case CARD_ANYTIME_TYPE_ID_MOVE_CATS_FROM_FIELDS:
                $shapeIds = [];
                for ($i = 1; $i <= 3; ++$i) {
                    $shapeId = value_req_null($action, 'shapeId' . $i);
                    if ($shapeId === null) {
                        continue;
                    }
                    if (array_search($shapeId, $shapeIds) !== false)
                        throw new BgaVisibleSystemException("BUG! Cannot move the same shapeId $shapeId twice");
                    $shapeIds[] = $shapeId;
                }
                $this->tiocNotifyAllPlayers(
                    NTF_PLAY_AND_DISCARD_CARDS,
                    clienttranslate('${player_name} plays an anytime card and moves ${shapeMovedCount} cats around the island'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'cards' => [$card],
                        'shapeMovedCount' => count($shapeIds),
                    ]
                );
                foreach ($shapeIds as $shapeId) {
                    $shape = $this->shapeMgr->moveCatToOtherField($shapeId);
                    $this->tiocNotifyAllPlayers(
                        NTF_MOVE_SHAPES,
                        $shape->isInLeftField()
                            ? clienttranslate('${player_name} moves a cat from the right field to the left field ${shapes_img}')
                            : clienttranslate('${player_name} moves a cat from the left field to the right field ${shapes_img}'),
                        [
                            'player_id' => $playerId,
                            'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                            'shapes' => [$shape],
                            'shapes_img' => [$shape],
                        ]
                    );
                }
                break;
            case CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_LESSONS:
                $this->actionAnytimeCardGainFish($card, $playerId, $this->cardMgr->countPrivateLessons($playerId));
                break;
            case CARD_ANYTIME_TYPE_ID_RESCUE_MORE_CATS:
                $this->turnActionMgr->allowExtraCat($playerId);
                $this->turnActionMgr->allowCatRescue($playerId);
                $this->tiocNotifyAllPlayers(
                    NTF_PLAY_AND_DISCARD_CARDS,
                    clienttranslate('${player_name} plays an anytime card and can rescue an extra cat'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'cards' => [$card],
                    ]
                );
                break;
            case CARD_ANYTIME_TYPE_ID_GAIN_BASKET:
                $tmpBasketId = value_req($action, 'newBasketId');
                $realBasketId = $this->basketMgr->createNewBasket($playerId, $tmpBasketId);

                $this->tiocNotifyAllPlayers(
                    NTF_CREATE_BASKET,
                    clienttranslate('${player_name} plays an anytime card and gains a new permanent basket'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'tmpBasketId' => $tmpBasketId,
                        'realBasketId' => $realBasketId,
                    ]
                );
                $this->tiocNotifyAllPlayers(
                    NTF_PLAY_AND_DISCARD_CARDS,
                    '',
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'cards' => [$card],
                    ]
                );
                break;
            case CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_LESSON:
                $firstLessonCardId = value_req($action, 'firstLessonCardId');
                $this->cardMgr->validateAndDiscardPrivateLesson($playerId, $firstLessonCardId);
                $secondLessonCardId = value_req($action, 'secondLessonCardId');
                $this->cardMgr->validateAndDiscardPrivateLesson($playerId, $secondLessonCardId);

                $tmpBasketId = value_req($action, 'newBasketId');
                $realBasketId = $this->basketMgr->createNewBasket($playerId, $tmpBasketId);
                $this->tiocNotifyAllPlayers(
                    NTF_CREATE_BASKET,
                    clienttranslate('${player_name} plays an anytime card, discards two lessons and gains a new permanent basket'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'tmpBasketId' => $tmpBasketId,
                        'realBasketId' => $realBasketId,
                    ]
                );
                $this->tiocNotifyAllPlayers(
                    NTF_PLAY_AND_DISCARD_CARDS,
                    '',
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'cards' => [$card],
                    ]
                );
                $this->tiocNotifyPlayer(
                    $playerId,
                    NTF_DISCARD_SECRET_CARDS,
                    '',
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'cardIds' => [$firstLessonCardId, $secondLessonCardId],
                    ]
                );
                $this->tiocNotifyAllPlayers(
                    NTF_UPDATE_PRIVATE_LESSONS_COUNT,
                    '',
                    [
                        'privateLessonsCount' => $this->cardMgr->getPrivateLessonsCount(array_keys($this->loadPlayersBasicInfos())),
                    ]
                );
                break;
            case CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_TREASURE:
                $firstShapeId = value_req($action, 'firstShapeId');
                $firstShape = $this->shapeMgr->validateAndDiscardTreasure($playerId, $firstShapeId);
                $secondShapeId = value_req($action, 'secondShapeId');
                $secondShape = $this->shapeMgr->validateAndDiscardTreasure($playerId, $secondShapeId);

                $tmpBasketId = value_req($action, 'newBasketId');
                $realBasketId = $this->basketMgr->createNewBasket($playerId, $tmpBasketId);
                $this->tiocNotifyAllPlayers(
                    NTF_CREATE_BASKET,
                    clienttranslate('${player_name} plays an anytime card, discards two treasures and gains a new permanent basket ${shapes_img}'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'tmpBasketId' => $tmpBasketId,
                        'realBasketId' => $realBasketId,
                        'shapes' => [$firstShape, $secondShape],
                        'shapes_img' => [$firstShape, $secondShape],
                    ]
                );
                $this->tiocNotifyAllPlayers(
                    NTF_PLAY_AND_DISCARD_CARDS,
                    '',
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'cards' => [$card],
                    ]
                );
                $this->tiocNotifyAllPlayers(
                    NTF_DISCARD_SHAPES,
                    '',
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'shapes' => [$firstShape, $secondShape],
                    ]
                );
                break;
            case CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COLOR:
                $this->actionAnytimeCardGainFish($card, $playerId, $this->shapeMgr->countUniqueColorNoOshax($playerId));
                break;
            case CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_RARE_TREASURE:
                $this->actionAnytimeCardGainFish($card, $playerId, 2 * $this->shapeMgr->countRareTreasure($playerId));
                break;
            case CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE:
                $this->actionAnytimeCardGainFish($card, $playerId, $this->shapeMgr->countCommonTreasure($playerId));
                break;
            case CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_CAT_OF_COLOR:
                $colorId = null;
                $fishGain = null;
                if (array_key_exists('colorId', $action)) {
                    $colorId = value_req_null($action, 'colorId');
                }
                if (array_key_exists('fishGain', $action)) {
                    $fishGain = value_req_null($action, 'fishGain');
                }
                if ($this->isSoloMode() && $colorId !== null && $fishGain !== null) {
                    $fishGainServerSide = count($this->shapeMgr->getColorShape($playerId, $colorId));
                    if ($fishGain != $fishGainServerSide)
                        throw new BgaVisibleSystemException("BUG! fishGain $fishGain != $fishGainServerSide in solo mode");
                    $this->actionAnytimeCardGainFish($card, $playerId, $fishGainServerSide);
                } else {
                    $this->actionAnytimeCardGainFish($card, $playerId, $this->shapeMgr->countMostCommonColor($playerId));
                }
                break;
            case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2:
            case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3:
            case CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE:
            case CARD_ANYTIME_TYPE_ID_DRAW_AND_FIELD_SHAPE:
                throw new BgaVisibleSystemException("BUG! cardId $cardId has a server side cardAnytimeTypeId");
            default:
                throw new BgaVisibleSystemException("BUG! cardId $cardId has an unknown cardAnytimeTypeId");
        }

        $this->notifyUpdateHandCount();
    }

    private function actionAnytimeCardGainFish($card, $playerId, $gainFish)
    {
        $totalFish = $this->fishMgr->addFishToPlayer($playerId, $gainFish);
        $this->tiocNotifyAllPlayers(
            NTF_UPDATE_FISH_COUNT,
            clienttranslate('${player_name} plays an anytime card and gains ${fishCount} ${fish_img} fish'),
            [
                'player_id' => $playerId,
                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                'fishCount' => $gainFish,
                'fishCountTotal' => $totalFish,
                'fish_img' => '',
            ]
        );
        $this->tiocNotifyAllPlayers(
            NTF_PLAY_AND_DISCARD_CARDS,
            '',
            [
                'player_id' => $playerId,
                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                'cards' => [$card],
            ]
        );

        $this->notifyUpdateHandCount();
    }

    private function notifyUpdateTurnActions()
    {
        $this->tiocNotifyAllPlayers(
            NTF_UPDATE_PLAYER_TURN_ACTION,
            '',
            [
                'turnAction' => $this->turnActionMgr->turnActionAsArray(),
            ]
        );
    }

    private function notifyUpdateSoloOrder()
    {
        if (!$this->isSoloMode()) {
            return;
        }
        $this->shapeMgr->soloReorderAll();
        $this->tiocNotifyAllPlayers(
            NTF_UPDATE_SOLO_ORDER,
            '',
            [
                'soloOrder' => $this->shapeMgr->getSoloOrder(),
            ]
        );
    }

    private function validateMustNotBeAbleToTakeTreasures($playerId)
    {
        if (
            $this->turnActionMgr->canTakeCommonTreasure($playerId)
            && $this->shapeMgr->hasCommonTreasureOnTable()
        ) {
            throw new BgaVisibleSystemException("BUG! Player must take a common treasure first");
        }
        if (
            $this->turnActionMgr->canTakeRareTreasure($playerId)
            && $this->shapeMgr->hasRareTreasureOnTable()
        ) {
            throw new BgaVisibleSystemException("BUG! Player must take a rare treasure first");
        }
        if (
            $this->turnActionMgr->canTakeSmallTreasure($playerId)
            && $this->shapeMgr->hasSmallTreasureOnTable()
        ) {
            throw new BgaVisibleSystemException("BUG! Player must take a small treasure first");
        }
    }

    private function notifyUpdateHandCount()
    {
        $this->tiocNotifyAllPlayers(
            NTF_UPDATE_HAND_COUNT,
            '',
            [
                'handCount' => $this->cardMgr->getHandCardCount(array_keys($this->loadPlayersBasicInfos())),
                'tableRescueCardsCount' => $this->cardMgr->getTableRescueCardsCardCount(array_keys($this->loadPlayersBasicInfos())),
            ]
        );
    }

    private function notifyUpdateBoatUsedGridColor()
    {
        $this->tiocNotifyAllPlayers(
            NTF_UPDATE_BOAT_USED_GRID_COLOR,
            '',
            [
                'boatUsedGridColor' => $this->shapeMgr->getBoatUsedGridColor(array_keys($this->loadPlayersBasicInfos())),
            ]
        );
    }

    private function getNextPlayerChooseRescueCards($currentPlayerId)
    {
        $playerIdsWithRescueCards = $this->cardMgr->getPlayerIdWithRecueCardsInHand();
        if ($this->isSoloMode()) {
            $soloPlayerId = array_keys($this->loadPlayersBasicInfos())[0];
            if (
                $currentPlayerId === null
                && (count($playerIdsWithRescueCards) > 0
                    || $this->considerPlayerForAnytimeRound($soloPlayerId, STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID, $soloPlayerId))
            ) {
                return $soloPlayerId;
            } else {
                return null;
            }
        }
        $firstPlayerId = $this->playerOrderMgr->getFirstPlayerIdInCatOrder();
        $nextPlayerId = null;
        if ($currentPlayerId === null) {
            $nextPlayerId = $firstPlayerId;
            if ($nextPlayerId === null) {
                return null;
            }
        } else {
            $nextPlayerId = $this->playerOrderMgr->getNextPlayerIdInCatOrder($currentPlayerId);
            if ($nextPlayerId === null || $nextPlayerId == $firstPlayerId) {
                return null;
            }
        }
        // Should be a while (true) but prevent infinite loop
        for ($i = 0; $i < 100; ++$i) {
            if (
                array_search($nextPlayerId, $playerIdsWithRescueCards) !== false
                || $this->considerPlayerForAnytimeRound($nextPlayerId, STATE_PHASE_4_CHOOSE_RESCUE_CARDS_SINGLE_ID, $nextPlayerId)
            ) {
                return $nextPlayerId;
            }
            $nextPlayerId = $this->playerOrderMgr->getNextPlayerIdInCatOrder($nextPlayerId);
            if ($nextPlayerId === null || $nextPlayerId == $firstPlayerId) {
                return null;
            }
        }
        return null;
    }

    public function stStateStackPop()
    {
        $this->stateStackMgr->popPlayerState();
    }

    private function pushState()
    {
        $playerId = $this->getActivePlayerId();
        $stateId = $this->gamestate->state_id();
        // When in anytime round, we must go to the next player after a server anytime card
        if ($stateId == STATE_PHASE_ANYTIME_ROUND_ID) {
            $stateId = STATE_PHASE_ANYTIME_ROUND_NEXT_PLAYER_ID;
        }
        $this->stateStackMgr->pushPlayerState($playerId, $stateId);
    }

    private function considerPlayerForAnytimeRound($playerId, $stateId, $statePlayerId)
    {
        // At the end of the game do the last anytime round
        // for players with anytime cards
        if ($this->getGlobal(STG_DAY_COUNTER) <= 0) {
            if ($this->cardMgr->playerHasAnytimeCardsInHand($playerId)) {
                return true;
            } else {
                return false;
            }
        }
        $cardIdSet = $this->cardMgr->playerAnytimeCardIdSet($playerId);
        if ($this->playerAnytimePrefMgr->mustAsk($cardIdSet, $playerId, $stateId, $statePlayerId)) {
            return true;
        } else {
            return false;
        }
    }

    private function jumpToAnytimeRound($returnPlayerId, $returnStateId, $nextIfSkip)
    {
        $mustJump = true;
        if ($this->cardMgr->hasNoCardsInHand()) {
            // Nothing to do in Anytime Round if no players has cards
            $mustJump = false;
        } else {
            // If no player ask to go to anytime round, don't go
            $mustJump = false;
            foreach (array_keys($this->loadPlayersBasicInfos()) as $playerId) {
                if ($this->considerPlayerForAnytimeRound($playerId, $returnStateId, $returnPlayerId)) {
                    $mustJump = true;
                    break;
                }
            }
        }
        if ($mustJump) {
            $this->stateStackMgr->pushPlayerState($returnPlayerId, $returnStateId);
            $this->gamestate->jumpToState(STATE_PHASE_ANYTIME_ROUND_ENTER_ID);
        } else {
            // In we have nothing to do in Anytime Round we make a normal transition to the next state
            if ($returnPlayerId !== null) {
                $this->gamestate->changeActivePlayer($returnPlayerId);
            }
            $this->gamestate->nextState($nextIfSkip);
        }
    }

    private function popState()
    {
        $this->stateStackMgr->jumpToPopState();
    }
}
