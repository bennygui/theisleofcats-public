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
const DRAW_CARDS_PER_DAY_PER_PLAYERS = 7;
const DRAW_CARDS_PER_DAY_SOLO = 5;

trait TiocPhase2Explore
{
    public function stPhase2ExploreDealCards(bool $skipNotification = false, ?bool $skipGotoNextState = null)
    {
        if ($skipGotoNextState === null) {
            $skipGotoNextState = $skipNotification;
        }
        $nbCardsToDraw = $this->isSoloMode() ? DRAW_CARDS_PER_DAY_SOLO : DRAW_CARDS_PER_DAY_PER_PLAYERS;
        foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $drawnCards = $this->cardMgr->drawCardsForDraft($playerId, $nbCardsToDraw);
            if (!$skipNotification) {
                $this->tiocNotifyPlayer(
                    $playerId,
                    NTF_CREATE_OR_MOVE_CARDS,
                    clienttranslate('${player_name} draws ${cardCount} cards'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $playerInfo['player_name'],
                        'cardCount' => count($drawnCards),
                        'cards' => $drawnCards,
                    ]
                );
            }
        }
        if (!$skipGotoNextState) {
            $this->gamestate->nextState();
        }
    }

    public function argPhase2ExploreDraft()
    {
        $nbCards = NB_CARDS_KEEP_PER_DRAFT;
        if ($this->isSoloMode()) {
            $nbCards = NB_CARDS_KEEP_SOLO;
        }
        return [
            'nbCards' => $nbCards,
        ];
    }

    public function phase2DraftKeepCards($cardIds)
    {
        $this->checkAction("phase2DraftKeepCards");

        if ($this->isSoloMode()) {
            if (count($cardIds) != NB_CARDS_KEEP_SOLO)
                throw new BgaUserException($this->_('You must select exactly 3 draft cards to keep'));
        } else {
            if (count($cardIds) != NB_CARDS_KEEP_PER_DRAFT)
                throw new BgaUserException($this->_('You must select exactly 2 draft cards to keep'));
        }

        $playerId = $this->getCurrentPlayerId();
        if (!$this->cardMgr->moveDraftCardsToBuy($playerId, $cardIds))
            throw new BgaUserException($this->_('You must select your draft cards'));
        $this->tiocNotifyPlayer(
            $playerId,
            NTF_MOVE_CARDS,
            clienttranslate('${player_name} keeps ${nbCards} cards'),
            [
                'player_id' => $playerId,
                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                'cardLocationId' => CARD_LOCATION_ID_PLAYER_BUY,
                'cardIds' => $cardIds,
                'nbCards' => count($cardIds),
            ]
        );

        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();
        $this->giveExtraTime($playerId);
        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    public function stPhase2ExplorePassCards()
    {
        $isLastDraft = false;
        if ($this->isSoloMode()) {
            foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
                $discardCardIds = $this->cardMgr->draftDiscardAll($playerId);
                $this->tiocNotifyAllPlayers(
                    NTF_MOVE_CARDS,
                    clienttranslate('${player_name} discards ${nbCards} cards'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                        'cardLocationId' => CARD_LOCATION_ID_DISCARD,
                        'cardIds' => $discardCardIds,
                        'nbCards' => count($discardCardIds),
                    ]
                );
                if ($this->cardMgr->playerCountCardsToBuy($playerId) == DRAW_CARDS_PER_DAY_PER_PLAYERS - 1) {
                    $isLastDraft = true;
                    $drawnCards = $this->cardMgr->drawCardsForBuy($playerId, 1);
                    $this->tiocNotifyPlayer(
                        $playerId,
                        NTF_CREATE_OR_MOVE_CARDS,
                        clienttranslate('${player_name} draws ${cardCount} cards'),
                        [
                            'player_id' => $playerId,
                            'player_name' => $playerInfo['player_name'],
                            'cardCount' => count($drawnCards),
                            'cards' => $drawnCards,
                        ]
                    );
                }
            }

            if (!$isLastDraft) {
                $this->stPhase2ExploreDealCards(false, true);
            }
        } else {
            $nextPlayerIds = $this->playerOrderMgr->getDraftNextPlayerId();
            $prevPlayerIds = array_flip($nextPlayerIds);
            $this->cardMgr->passDraftCardsToNextPlayer($nextPlayerIds);
            foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
                $receivesCards = $this->cardMgr->getPlayerDraftCards($playerId);
                $this->tiocNotifyPlayer(
                    $playerId,
                    NTF_PASS_DRAFT_CARDS,
                    clienttranslate('${player_name} pass cards to ${next_player_name} and receives cards from ${prev_player_name}'),
                    [
                        'player_id' => $playerId,
                        'player_name' => $playerInfo['player_name'],
                        'next_player_name' => $this->loadPlayersBasicInfos()[$nextPlayerIds[$playerId]]['player_name'],
                        'prev_player_name' => $this->loadPlayersBasicInfos()[$prevPlayerIds[$playerId]]['player_name'],
                        'next_player_id' => $nextPlayerIds[$playerId],
                        'prev_player_id' => $prevPlayerIds[$playerId],
                        'receivesCards' => $receivesCards,
                    ]
                );
                if (count($receivesCards) == 1) {
                    $isLastDraft = true;
                    $cardIds = [$receivesCards[0]->cardId];
                    $this->cardMgr->moveDraftCardsToBuy($playerId, $cardIds);
                    $this->tiocNotifyPlayer(
                        $playerId,
                        NTF_MOVE_CARDS,
                        clienttranslate('${player_name} keeps the last card'),
                        [
                            'player_id' => $playerId,
                            'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                            'cardLocationId' => CARD_LOCATION_ID_PLAYER_BUY,
                            'cardIds' => $cardIds,
                        ]
                    );
                }
            }
        }

        if ($isLastDraft) {
            $this->jumpToAnytimeRound(null, STATE_PHASE_2_BUY_CARDS_ID, "nextSkipAnytimeRound");
        } else {
            $this->gamestate->nextState("continueDraft");
        }
    }

    public function phase2BuyCards($actionArray)
    {
        $this->checkAction("phase2BuyCards");
        $playerId = $this->getCurrentPlayerId();

        $this->actionBuyCards($actionArray);

        $this->turnActionMgr->updateLastSeenMoveNumber($playerId);
        $this->notifyUpdateTurnActions();

        $this->giveExtraTime($playerId);
        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    public function stPhase2AfterBuyCards()
    {
        $this->jumpToAnytimeRound(null, STATE_PHASE_3_READ_LESSONS_ID, "nextSkipAnytimeRound");
    }
}
