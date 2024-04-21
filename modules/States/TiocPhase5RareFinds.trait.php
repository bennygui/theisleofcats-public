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

trait TiocPhase5RareFinds
{
    public function argPhase5RareFinds()
    {
        return $this->turnActionMgr->turnActionAsArray();
    }

    public function stPhase5BeforeRareFinds()
    {
        $activePlayerId = $this->getActivePlayerId();
        if (!$this->phase5CanPlayerAutoPass($activePlayerId)) {
            $this->jumpToAnytimeRound($activePlayerId, STATE_PHASE_5_RARE_FINDS_ID, "nextSkipAnytimeRoundPhase5");
            return;
        }
        $this->phase5MarkPass($activePlayerId, true);
        $this->phase5NextPlayerStartingFromPlayerId($activePlayerId);
    }

    public function phase5ConfirmActions($actionArray)
    {
        $this->checkAction("phase5ConfirmActions");

        $hasPlayedTreasureCard = false;
        $hasPlacedAnyTreasure = false;
        $playerId = $this->getCurrentPlayerId();
        foreach ($actionArray as $action) {
            $actionTypeId = $action['actionTypeId'];
            switch ($actionTypeId) {
                case ACTION_TYPE_ID_TREASURE_CARD:
                    $this->validateMustNotBeAbleToTakeTreasures($playerId);

                    if ($this->turnActionMgr->hasRareFinds($playerId))
                        throw new BgaVisibleSystemException("BUG! You have already played a rare find on your turn");
                    $cardId = value_req($action, 'cardId');
                    $isSmallTreasure = value_req_null($action, 'isSmallTreasure');
                    $playedCard = $this->cardMgr->validateAndUseTreasureCard($playerId, $cardId);
                    $this->tiocNotifyAllPlayers(
                        NTF_PLAY_AND_DISCARD_CARDS,
                        clienttranslate('${player_name} plays a treasure card'),
                        [
                            'player_id' => $playerId,
                            'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                            'cards' => [$playedCard],
                        ]
                    );

                    $hasPlayedTreasureCard = true;
                    $this->turnActionMgr->playRareFinds($playerId);

                    if ($isSmallTreasure === null) {
                        $this->turnActionMgr->allowTakeRareTreasure($playerId);
                        $this->turnActionMgr->allowTakeCommonTreasure($playerId);
                        $this->turnActionMgr->allowTakeCommonTreasure($playerId);
                    } else if ($isSmallTreasure) {
                        $this->turnActionMgr->allowTakeSmallTreasure($playerId);
                        $this->turnActionMgr->allowTakeSmallTreasure($playerId);
                    } else {
                        $this->turnActionMgr->allowTakeCommonTreasure($playerId);
                        $this->turnActionMgr->allowTakeCommonTreasure($playerId);
                        $remainingFish = $this->fishMgr->removeFishFromPlayer($playerId, 1);
                        if ($remainingFish < 0)
                            throw new BgaVisibleSystemException("BUG! Not enough fish");
                        $this->tiocNotifyAllPlayers(
                            NTF_UPDATE_FISH_COUNT,
                            clienttranslate('${player_name} gives 1 ${fish_img} fish to take common treasure'),
                            [
                                'player_id' => $playerId,
                                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                                'fishCountTotal' => $remainingFish,
                                'fish_img' => '',
                            ]
                        );
                    }
                    break;
                case ACTION_TYPE_ID_COMMON_TREASURE:
                    if (!$this->turnActionMgr->canTakeCommonTreasure($playerId) && !$this->turnActionMgr->canTakeSmallTreasure($playerId))
                        throw new BgaVisibleSystemException("BUG! Can't place common treasure at this point count =" . count($actionArray));

                    $shapePlacement = $this->actionTypePlaceShape($playerId, $action, SHAPE_TYPE_ID_COMMON_TREASURE);

                    if ($shapePlacement->previousShapeLocationId != SHAPE_LOCATION_ID_TABLE)
                        throw new BgaVisibleSystemException("BUG! Shape is not on table");
                    if ($shapePlacement->matchesMapColor)
                        throw new BgaVisibleSystemException("BUG! Common treasure should not have color");

                    $hasPlacedAnyTreasure = true;

                    $isSmallTreasure = false;
                    if ($this->turnActionMgr->canTakeCommonTreasure($playerId) && $this->turnActionMgr->canTakeRareTreasure($playerId)) {
                        $this->turnActionMgr->undoAllowTakeRareTreasure($playerId);
                        $this->turnActionMgr->takeCommonTreasure($playerId);
                    } else if ($shapePlacement->shape->isSmallTreasure) {
                        if ($this->turnActionMgr->canTakeSmallTreasure($playerId)) {
                            $this->turnActionMgr->takeSmallTreasure($playerId);
                            $isSmallTreasure = true;
                        } else if ($this->turnActionMgr->canTakeCommonTreasure($playerId)) {
                            $this->turnActionMgr->takeCommonTreasure($playerId);
                        } else {
                            throw new BgaVisibleSystemException("BUG! Can't place common treasure at this point count =" . count($actionArray));
                        }
                    } else {
                        if (!$this->turnActionMgr->canTakeCommonTreasure($playerId))
                            throw new BgaVisibleSystemException("BUG! Can't place common treasure at this point count =" . count($actionArray));
                        $this->turnActionMgr->takeCommonTreasure($playerId);
                    }

                    $this->tiocNotifyAllPlayers(
                        NTF_MOVE_SHAPE_TO_BOAT,
                        $isSmallTreasure
                            ? clienttranslate('${player_name} places a small common treasure on their boat ${shape_img}')
                            : clienttranslate('${player_name} places a common treasure on their boat ${shape_img}'),
                        [
                            'player_id' => $playerId,
                            'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                            'shape' => $shapePlacement->shape,
                            'shape_img' => $shapePlacement->shape,
                        ]
                    );
                    break;
                case ACTION_TYPE_ID_OSHAX:
                    $this->validateMustNotBeAbleToTakeTreasures($playerId);

                    if ($this->turnActionMgr->hasRareFinds($playerId))
                        throw new BgaVisibleSystemException("BUG! You have already played a rare find on your turn");

                    $cardId = value_req($action, 'cardId');
                    $playedCard = $this->cardMgr->validateAndUseOshaxCard($playerId, $cardId);
                    $this->tiocNotifyAllPlayers(
                        NTF_PLAY_AND_DISCARD_CARDS,
                        clienttranslate('${player_name} plays an oshax card'),
                        [
                            'player_id' => $playerId,
                            'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                            'cards' => [$playedCard],
                        ]
                    );

                    $colorId = value_req($action, 'colorId');
                    $shapePlacement = $this->actionTypePlaceShape($playerId, $action, SHAPE_TYPE_ID_OSHAX, $colorId);

                    if ($shapePlacement->previousShapeLocationId != SHAPE_LOCATION_ID_TABLE)
                        throw new BgaVisibleSystemException("BUG! Shape is not on table");
                    if ($shapePlacement->matchesMapColor) {
                        $this->turnActionMgr->allowTakeCommonTreasure($playerId);
                    }

                    $this->turnActionMgr->playRareFinds($playerId);

                    $this->tiocNotifyAllPlayers(
                        NTF_MOVE_SHAPE_TO_BOAT,
                        $shapePlacement->matchesMapColor
                            ? clienttranslate('${player_name} places an oshax on their boat, covering a map of matching color ${shape_img}')
                            : clienttranslate('${player_name} places an oshax on their boat ${shape_img}'),
                        [
                            'player_id' => $playerId,
                            'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                            'shape' => $shapePlacement->shape,
                            'shape_img' => $shapePlacement->shape,
                        ]
                    );
                    break;
                case ACTION_TYPE_ID_RARE_TREASURE:
                    if (!$this->turnActionMgr->canTakeRareTreasure($playerId))
                        throw new BgaVisibleSystemException("BUG! Can't place rare treasure at this point count =" . count($actionArray));

                    $shapePlacement = $this->actionTypePlaceShape($playerId, $action, SHAPE_TYPE_ID_RARE_TREASURE);

                    if ($shapePlacement->previousShapeLocationId != SHAPE_LOCATION_ID_TABLE)
                        throw new BgaVisibleSystemException("BUG! Shape is not on table");
                    if ($shapePlacement->matchesMapColor)
                        throw new BgaVisibleSystemException("BUG! Rare treasure should not have color");

                    $this->turnActionMgr->takeRareTreasure($playerId);
                    $this->turnActionMgr->undoAllowTakeCommonTreasure($playerId);
                    $this->turnActionMgr->undoAllowTakeCommonTreasure($playerId);

                    $hasPlacedAnyTreasure = true;

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
                    break;
                case ACTION_TYPE_ID_ANYTIME_CARD:
                    $this->actionAnytimeCard($action);
                    break;
                default:
                    throw new BgaVisibleSystemException("BUG! actionTypeId $actionTypeId is invalid");
            }
        }

        if ($hasPlayedTreasureCard && !$hasPlacedAnyTreasure)
            throw new BgaUserException($this->_('You cannot play a treasure card and place no treasure'));

        $this->notifyUpdateHandCount();
        $this->notifyUpdateBoatUsedGridColor();
        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
        $this->notifyUpdateSoloOrder();
    }

    public function phase5Pass()
    {
        $this->checkAction("phase5Pass");
        $playerId = $this->getCurrentPlayerId();
        if ($this->turnActionMgr->hasRareFinds($playerId))
            throw new BgaUserException($this->_('You cannot pass, you have already played a rare find'));

        if ($this->playerOrderMgr->hasPlayerPass($playerId))
            throw new BgaUserException($this->_('You cannot pass, you have already passed'));

        $this->phase5MarkPass($playerId, false);
        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();

        $this->gamestate->nextState('next');
    }

    private function phase5MarkPass($playerId, $isAutomatic)
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

    private function phase5CanPlayerAutoPass($playerId)
    {
        if (!$this->isAutoPassPreference($playerId)) {
            return false;
        }
        if ($this->playerOrderMgr->hasPlayerPass($playerId)) {
            return false;
        }
        if ($this->cardMgr->countTreasureCards($playerId) >= 1) {
            return false;
        }
        if ($this->cardMgr->countOshaxCards($playerId) >= 1) {
            return false;
        }
        if ($this->cardMgr->playerHasAnytimeCardsForRareFindsPhaseInHand($playerId)) {
            return false;
        }
        return true;
    }

    public function phase5EndTurn()
    {
        $playerId = $this->getCurrentPlayerId();
        if (!$this->turnActionMgr->hasRareFinds($playerId))
            throw new BgaUserException($this->_('You cannot end your turn, you have not played a rare find'));
        $this->turnActionMgr->resetRareFindsCount($playerId);
        $this->turnActionMgr->resetTreasureCount($playerId);

        if ($this->playerOrderMgr->hasPlayerPass($playerId))
            throw new BgaUserException($this->_('You cannot end your turn, you have already passed'));

        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
        $this->giveExtraTime($playerId);
        $this->gamestate->nextState('next');
    }

    public function stPhase5NextPlayer()
    {
        $activePlayerId = $this->getActivePlayerId();
        $this->phase5NextPlayerStartingFromPlayerId($activePlayerId);
    }

    public function phase5NextPlayerStartingFromPlayerId($currentPlayerId)
    {
        $nextPlayerId = $this->playerOrderMgr->getNextPlayerIdInCatOrderNotPass($currentPlayerId);
        while ($nextPlayerId !== null) {
            if (!$this->phase5CanPlayerAutoPass($nextPlayerId)) {
                break;
            }
            $this->phase5MarkPass($nextPlayerId, true);
            $nextPlayerId = $this->playerOrderMgr->getNextPlayerIdInCatOrderNotPass($currentPlayerId);
        }
        if ($nextPlayerId === null) {
            $this->playerOrderMgr->resetPlayerPass();

            $this->tiocNotifyAllPlayers(
                NTF_PLAYER_PASS_UPDATE,
                clienttranslate('Rare find phase is finished'),
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

            $resetBasketIds = $this->basketMgr->resetAllBaskets();
            $this->tiocNotifyAllPlayers(
                NTF_RESET_BASKET,
                clienttranslate('All permanent baskets can be used again'),
                [
                    'basketIds' => $resetBasketIds,
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

            if ($this->isSoloMode()) {
                $discardedCardIds = $this->cardMgr->discardSoloBasketCards();
                $this->tiocNotifyAllPlayers(
                    NTF_MOVE_CARDS,
                    '',
                    [
                        'cardLocationId' => CARD_LOCATION_ID_DISCARD,
                        'cardIds' => $discardedCardIds,
                    ]
                );
                $soloColorCard = $this->cardMgr->soloDrawSoloColorCard();
                if ($soloColorCard !== null) {
                    $this->tiocNotifyAllPlayers(
                        NTF_CREATE_OR_MOVE_CARDS,
                        clienttranslate('The next Solo Color card is revealed'),
                        [
                            'cards' => [$soloColorCard],
                        ]
                    );
                }
            }

            if (count($this->loadPlayersBasicInfos()) > 2) {
                $prevDraftPlayerIds = $this->playerOrderMgr->getDraftNextPlayerId();
                $this->playerOrderMgr->updateDraftPlayerOrder($this->loadPlayersBasicInfos());
                $nextDraftPlayerIds = $this->playerOrderMgr->getDraftNextPlayerId();
                $this->tiocNotifyAllPlayers(
                    NTF_UPDATE_DRAFT_ORDER,
                    clienttranslate("Draft order changes direction"),
                    [
                        'prevPlayerToColor' => array_map(function ($nextPlayerId) {
                            return $this->playerOrderMgr->getPlayerColorName($nextPlayerId);
                        }, $prevDraftPlayerIds),
                        'nextColorToPlayer' => array_flip(array_map(function ($nextPlayerId) {
                            return $this->playerOrderMgr->getPlayerColorName($nextPlayerId);
                        }, $nextDraftPlayerIds)),
                    ]
                );
            }

            $this->turnActionMgr->resetForNewTurn();

            if ($this->getGlobal(STG_DAY_COUNTER) <= 0) {
                // Game is ending, send to last anytime round
                $this->jumpToAnytimeRound(null, STATE_END_GAME_SCORING_ID, "endGame");
            } else {
                $this->jumpToAnytimeRound(null, STATE_PHASE_0_FILL_THE_FIELDS_ID, "nextSkipAnytimeRoundPhase0");
            }
            return;
        }

        $this->jumpToAnytimeRound($nextPlayerId, STATE_PHASE_5_RARE_FINDS_ID, "nextSkipAnytimeRoundPhase5");
    }
}
