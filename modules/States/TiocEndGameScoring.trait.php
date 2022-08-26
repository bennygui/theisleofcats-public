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

const SCORE_GAIN_PER_RARE_TREASURE = 3;
const SCORE_LOSE_PER_RATS = 1;
const SCORE_LOSE_PER_UNFILLED_ROOMS = 5;
const SCORE_SOLO_COLOR = 5;

class TiocScoreBoatPosition
{
    public $x;
    public $y;
    public $score;

    public function __construct($x, $y, $score)
    {
        $this->x = $x;
        $this->y = $y;
        $this->score = $score;
    }
}

class TiocScoreCard
{
    public $cardId;
    public $score;

    public function __construct($cardId, $score)
    {
        $this->cardId = $cardId;
        $this->score = $score;
    }
}

trait TiocEndGameScoring
{
    public function stEndGameScoring()
    {
        $this->scoreRats();

        $nbFilledRoomsPerPlayerId = $this->scoreUnfilledRooms();

        $this->scoreCatFamilly();

        if (!$this->isFamilyMode()) {
            $this->scoreRareTreasure();
        }

        $privateScoreCards = $this->scorePrivateLessons();

        $publicScoreCards = [];
        if (!$this->isFamilyMode()) {
            $publicScoreCards = $this->scorePublicLessons();
        }

        if ($this->isSoloMode()) {
            for ($i = 1; $i <= 5; ++$i) {
                $this->scoreSoloColor($i);
            }
            $this->scoreSoloLessons($nbFilledRoomsPerPlayerId);
            $this->scoreSoloPlayer();
        } else {
            if ($this->isFamilyMode()) {
                $this->scoreTieBreakerFamily($nbFilledRoomsPerPlayerId);
            } else {
                $this->scoreTieBreaker();
            }
        }

        $playerScoreColumn = 'player_score';
        if ($this->isSoloMode()) {
            $playerScoreColumn = 'score_solo_player';
        }
        $sql = "SELECT player_id, score_rats, score_unfilled_rooms, score_cat_familly, score_rare_treasure, score_private_lessons, score_public_lessons, $playerScoreColumn score_total FROM player";
        foreach (self::getObjectListFromDB($sql) as $values) {
            $playerId = $values['player_id'];
            if (!array_key_exists($playerId, $this->loadPlayersBasicInfos())) {
                continue;
            }
            self::setStat($values['score_total'], STATS_PLAYER_TOTAL_SCORE, $playerId);
            self::setStat(-1 * $values['score_rats'], STATS_PLAYER_SCORE_RATS, $playerId);
            self::setStat(-1 * $values['score_unfilled_rooms'], STATS_PLAYER_SCORE_UNFILLED_ROOMS, $playerId);
            self::setStat($values['score_cat_familly'], STATS_PLAYER_SCORE_CAT_FAMILLY, $playerId);
            if (!$this->isFamilyMode()) {
                self::setStat($values['score_rare_treasure'], STATS_PLAYER_SCORE_RARE_TREASURE, $playerId);
            }
            self::setStat($values['score_private_lessons'], STATS_PLAYER_SCORE_PRIVATE_LESSONS, $playerId);
            if (!$this->isFamilyMode()) {
                self::setStat($values['score_public_lessons'], STATS_PLAYER_SCORE_PUBLIC_LESSONS, $playerId);
            }

            if (!$this->isFamilyMode()) {
                self::setStat($this->fishMgr->getNbFishForPlayerId($playerId), STATS_PLAYER_TOTAL_END_FISH, $playerId);
            }
            self::setStat($this->shapeMgr->countCat($playerId), STATS_PLAYER_TOTAL_END_CATS, $playerId);
            self::setStat($this->shapeMgr->countOshax($playerId), STATS_PLAYER_TOTAL_END_OSHAX, $playerId);
            self::setStat($this->shapeMgr->countCommonTreasure($playerId), STATS_PLAYER_TOTAL_COMMON_TREASURE, $playerId);
            self::setStat($this->shapeMgr->countRareTreasure($playerId), STATS_PLAYER_TOTAL_RARE_TREASURE, $playerId);

            $famillies = $this->shapeMgr->getPlayerCatFamilly($playerId);
            usort($famillies, function ($familly1, $familly2) {
                return (count($familly2) <=> count($familly1));
            });
            if (count($famillies) > 0 && count($famillies[0]) >= 3) {
                self::setStat(count($famillies[0]), STATS_PLAYER_SIZE_CAT_FAMILLY_1, $playerId);
            }
            if (count($famillies) > 1 && count($famillies[1]) >= 3) {
                self::setStat(count($famillies[1]), STATS_PLAYER_SIZE_CAT_FAMILLY_2, $playerId);
            }
            if (count($famillies) > 2 && count($famillies[2]) >= 3) {
                self::setStat(count($famillies[2]), STATS_PLAYER_SIZE_CAT_FAMILLY_3, $playerId);
            }
            if (count($famillies) > 3 && count($famillies[3]) >= 3) {
                self::setStat(count($famillies[3]), STATS_PLAYER_SIZE_CAT_FAMILLY_4, $playerId);
            }
            if (count($famillies) > 4 && count($famillies[4]) >= 3) {
                self::setStat(count($famillies[4]), STATS_PLAYER_SIZE_CAT_FAMILLY_5, $playerId);
            }
        }

        $this->gamestate->nextState();
    }

    private function scoreTieBreaker()
    {
        // Tie breaker: Having the most fish
        foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $nbFish = $this->fishMgr->getNbFishForPlayerId($playerId);
            self::DbQuery("UPDATE player SET player_score_aux = $nbFish WHERE player_id = $playerId");
        }
    }

    private function scoreTieBreakerFamily($nbFilledRoomsPerPlayerId)
    {
        // Tie breaker: Having the most filled rooms
        foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $nbFilledRooms = $nbFilledRoomsPerPlayerId[$playerId];
            self::DbQuery("UPDATE player SET player_score_aux = $nbFilledRooms WHERE player_id = $playerId");
        }
    }

    private function scorePublicLessons()
    {
        $retScoreCards = [];
        foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $cards = $this->cardMgr->getPublicLessonCards();
            $allCardsScore = 0;
            $scoreCards = [];
            foreach ($cards as $card) {
                $score = $this->getPublicLessonCardScore($playerId, $card);
                if ($this->isSoloMode()) {
                    $score = ceil($score / 2);
                }
                $allCardsScore += $score;
                $scoreCard = new TiocScoreCard($card->cardId, $score);
                $this->saveCardEndScore($card->cardId, $playerId, $score);
                $scoreCards[] = $scoreCard;
                $retScoreCards[] = $scoreCard;
            }
            $totalScore = $this->addToPlayerScore($playerId, 'score_public_lessons', $allCardsScore);
            $this->notifyScoreCards(
                clienttranslate('${player_name} scores ${score} points with the public lessons ${cardDetail}'),
                $playerId,
                $allCardsScore,
                $totalScore,
                $scoreCards,
                'score_public_lessons'
            );
        }
        return $retScoreCards;
    }

    private function getPublicLessonCardScore($playerId, $card)
    {
        $score = 0;
        switch ($card->cardId) {
            case 143:
                $shapes = $this->shapeMgr->getColorShapeTouchingEdges($playerId, $card->colorId);
                $score = 2 * count($shapes);
                break;
            case 144:
                $shapes = $this->shapeMgr->getColorShape($playerId, $card->colorId);
                $score = count($shapes);
                break;
            case 145:
                $shapes = $this->shapeMgr->getColorShape($playerId, $card->colorId);
                if (count($shapes) >= 3) {
                    $score = 5;
                }
                break;
            case 146:
                $famillies = $this->shapeMgr->getPlayerCatFamilly($playerId);
                foreach ($famillies as $familly) {
                    if (count($familly) == 1 && $familly[0]->colorId == $card->colorId) {
                        $score += 3;
                    }
                }
                break;
            case 147:
                $cardCount = $this->cardMgr->getPrivateLessonsCount(array_keys($this->loadPlayersBasicInfos()))[$playerId];
                $score = 2 * $cardCount;
                break;
            case 148:
                $shapeCount = $this->shapeMgr->countCommonTreasure($playerId);
                $score = 2 * $shapeCount;
                break;
            case 149:
                $shapeCount = $this->shapeMgr->countTreasureTouchingColor($playerId, $card->colorId);
                $score = $shapeCount;
                break;
            case 150:
                $playerColorName = $this->playerOrderMgr->getPlayerBoatColorName($playerId);
                $mapCount = $this->shapeMgr->countUncoveredMap($playerId, $playerColorName);
                $score = 5 * $mapCount;
                break;
            default:
                throw new BgaVisibleSystemException("BUG! Invalid cardId {$card->cardId}");
        }
        return $score;
    }

    private function scorePrivateLessons()
    {
        $retScoreCards = [];
        foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $cards = $this->cardMgr->getPrivateLessonCards($playerId);
            $this->tiocNotifyAllPlayers(
                NTF_CREATE_OR_MOVE_CARDS,
                '',
                [
                    'player_id' => $playerId,
                    'player_name' => $playerInfo['player_name'],
                    'cards' => $cards,
                ]
            );
            $allCardsScore = 0;
            $scoreCards = [];
            foreach ($cards as $card) {
                $score = $this->getPrivateLessonCardScore($playerId, $card);
                $allCardsScore += $score;
                $scoreCard = new TiocScoreCard($card->cardId, $score);
                $this->saveCardEndScore($card->cardId, $playerId, $score);
                $scoreCards[] = $scoreCard;
                $retScoreCards[] = $scoreCard;
            }
            $totalScore = $this->addToPlayerScore($playerId, 'score_private_lessons', $allCardsScore);
            $this->notifyScoreCards(
                clienttranslate('${player_name} scores ${score} points with their private lessons ${cardDetail}'),
                $playerId,
                $allCardsScore,
                $totalScore,
                $scoreCards,
                'score_private_lessons'
            );
        }
        return $retScoreCards;
    }

    private function getPrivateLessonCardScore($playerId, $card)
    {
        $score = 0;
        switch ($card->cardId) {
            case 113:
            case 156:
                if (!$this->shapeMgr->hasEmptyOnEdge($playerId)) {
                    $score = 12;
                }
                break;
            case 114:
                if ($this->shapeMgr->countCat($playerId) + $this->shapeMgr->countOshax($playerId) == 15) {
                    $score = 10;
                }
                break;
            case 115:
            case 158:
                $colorCount = $this->shapeMgr->countPerColor($playerId);
                if (count($colorCount) == count(array_filter($colorCount, function ($c) {
                    return $c >= 3;
                }))) {
                    $score = 15;
                }
                break;
            case 116:
            case 152:
                $allColors = true;
                foreach (CAT_COLOR_IDS as $colorId) {
                    if (count($this->shapeMgr->getColorShapeTouchingEdges($playerId, $colorId)) == 0) {
                        $allColors = false;
                        break;
                    }
                }
                if ($allColors) {
                    if ($card->cardId == 116) {
                        $score = 7;
                    } else {
                        $score = 9;
                    }
                }
                break;
            case 117:
            case 151:
                $colorCount = [];
                foreach (CAT_COLOR_IDS as $colorId) {
                    $colorCount[$colorId] = count($this->shapeMgr->getColorShapeTouchingEdges($playerId, $colorId));
                }
                $score = max($colorCount);
                break;
            case 118:
                if ($this->basketMgr->countBaskets($playerId) == 3) {
                    $score = 7;
                }
                break;
            case 119:
                $firstPlayerId = $this->playerOrderMgr->getFirstPlayerIdInCatOrder();
                if ($firstPlayerId == $playerId) {
                    $score = 7;
                }
                break;
            case 120:
                $famillies = $this->shapeMgr->getPlayerCatFamilly($playerId);
                foreach ($famillies as $familly) {
                    if (count($familly) == 1) {
                        $score += 1;
                    }
                }
                break;
            case 121:
            case 165:
                $bigFamillyCount = 0;
                $famillies = $this->shapeMgr->getPlayerCatFamilly($playerId);
                foreach ($famillies as $familly) {
                    $bigFamillyCount = max([$bigFamillyCount, count($familly)]);
                }
                if ($this->isSoloMode()) {
                    if ($bigFamillyCount >= 7) {
                        $score = 10;
                    }
                } else {
                    if ($bigFamillyCount > 0) {
                        $foundBigger = false;
                        foreach ($this->loadPlayersBasicInfos() as $otherPlayerId => $playerInfo) {
                            if ($otherPlayerId == $playerId) {
                                continue;
                            }
                            $famillies = $this->shapeMgr->getPlayerCatFamilly($otherPlayerId);
                            foreach ($famillies as $familly) {
                                if (count($familly) > $bigFamillyCount) {
                                    $foundBigger = true;
                                    break;
                                }
                            }
                            if ($foundBigger) {
                                break;
                            }
                        }
                        if (!$foundBigger) {
                            $score = 10;
                        }
                    }
                }
                break;
            case 122:
                $score = 2 * $this->shapeMgr->countRareTreasure($playerId);
                break;
            case 123:
                $score = $this->shapeMgr->countCommonTreasure($playerId);
                break;
            case 124:
            case 154:
                $playerColorName = $this->playerOrderMgr->getPlayerBoatColorName($playerId);
                if (count($this->shapeMgr->getPlayerVisibleRatPositions($playerId, $playerColorName)) == 0) {
                    $score = 10;
                }
                break;
            case 125:
            case 166:
                $playerColorName = $this->playerOrderMgr->getPlayerBoatColorName($playerId);
                $score = 2 * count($this->shapeMgr->getPlayerVisibleRatPositions($playerId, $playerColorName));
                break;
            case 126:
                $cardCount = $this->cardMgr->getPrivateLessonsCount(array_keys($this->loadPlayersBasicInfos()))[$playerId];
                $score = $cardCount;
                break;
            case 127:
            case 159:
                $shapes = $this->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_BLUE);
                if (count($shapes) == 5) {
                    $score = 9;
                }
                break;
            case 128:
            case 160:
                $shapes = $this->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_GREEN);
                if (count($shapes) == 5) {
                    $score = 9;
                }
                break;
            case 129:
            case 161:
                $shapes = $this->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_PURPLE);
                if (count($shapes) == 5) {
                    $score = 9;
                }
                break;
            case 130:
            case 162:
                $shapes = $this->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_RED);
                if (count($shapes) == 5) {
                    $score = 9;
                }
                break;
            case 131:
            case 163:
                $shapes = $this->shapeMgr->getColorShape($playerId, CAT_COLOR_ID_ORANGE);
                if (count($shapes) == 5) {
                    $score = 9;
                }
                break;
            case 132:
                $playerColorName = $this->playerOrderMgr->getPlayerBoatColorName($playerId);
                if (count($this->shapeMgr->getPlayerVisibleRatPositions($playerId, $playerColorName)) == 5) {
                    $score = 10;
                }
                break;
            case 133:
                $cardCount = $this->cardMgr->getPrivateLessonsCount(array_keys($this->loadPlayersBasicInfos()))[$playerId];
                if ($cardCount == 6) {
                    $score = 7;
                }
                break;
            case 134:
                if ($this->shapeMgr->countRareTreasure($playerId) + $this->shapeMgr->countCommonTreasure($playerId) == 5) {
                    $score = 9;
                }
                break;
            case 135:
            case 153:
                $catCount = 0;
                foreach (CAT_COLOR_IDS as $colorId) {
                    $catCount += count($this->shapeMgr->getColorShapeTouchingEdges($playerId, $colorId));
                }
                $score = intval($catCount / 2);
                break;
            case 136:
                $roomIds = $this->shapeMgr->getPlayerUnfilledRoomIds($playerId);
                if (array_search(BOAT_ROOMS_ID_PARROT_BACK, $roomIds) === false && array_search(BOAT_ROOMS_ID_PARROT_FRONT, $roomIds) === false) {
                    $score = 12;
                }
                break;
            case 137:
                $roomIds = $this->shapeMgr->getPlayerEmptyRoomIds($playerId);
                if (array_search(BOAT_ROOMS_ID_MOON_TOP, $roomIds) !== false && array_search(BOAT_ROOMS_ID_MOON_BOTTOM, $roomIds) !== false) {
                    $score = 18;
                }
                break;
            case 138:
                $famillies = $this->shapeMgr->getPlayerCatFamilly($playerId);
                foreach ($famillies as $familly) {
                    if (count($familly) >= 4) {
                        $score += 4;
                    }
                }
                break;
            case 139:
                $score = 3 * $this->shapeMgr->countOshax($playerId);
                break;
            case 140:
                $roomIds = $this->shapeMgr->getPlayerEmptyRoomIds($playerId);
                if (array_search(BOAT_ROOMS_ID_APPLE_MIDDLE, $roomIds) !== false) {
                    $score = 15;
                }
                break;
            case 141:
            case 168:
                $famillies = $this->shapeMgr->getPlayerCatFamilly($playerId);
                if (count($famillies) >= 3) {
                    usort($famillies, function ($familly1, $familly2) {
                        return (count($familly2) <=> count($familly1));
                    });
                    $score = $this->getFamillySizeScore(count($famillies[2]));
                }
                break;
            case 142:
                if ($this->fishMgr->getNbFishForPlayerId($playerId) >= 5) {
                    $score = 7;
                }
                break;
            case 155:
                if (!$this->shapeMgr->hasEmptyOnMiddleRow($playerId)) {
                    $score = 10;
                }
                break;
            case 157:
                if ($this->shapeMgr->countCat($playerId) == 20) {
                    $score = 10;
                }
                break;
            case 164:
                $shapeCount = $this->shapeMgr->countCommonTreasure($playerId) + $this->shapeMgr->countRareTreasure($playerId);
                $score = 2 * $shapeCount;
                break;
            case 167:
                $roomIds = $this->shapeMgr->getPlayerUnfilledRoomIds($playerId);
                $nbFilledRooms = NB_BOAT_ROOMS_TOTAL - count($roomIds);
                if ($nbFilledRooms > 0) {
                    $score = 2 * $nbFilledRooms;
                }
                break;
            default:
                throw new BgaVisibleSystemException("BUG! Invalid cardId {$card->cardId}");
        }
        return $score;
    }

    private function scoreRareTreasure()
    {
        foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $shapes = $this->shapeMgr->getPlayerRareTreasure($playerId);
            $score = count($shapes) * SCORE_GAIN_PER_RARE_TREASURE;
            $totalScore = $this->addToPlayerScore($playerId, 'score_rare_treasure', $score);
            $this->notifyScoreBoatPosition(
                clienttranslate('${player_name} scores ${score} points with their rare treasures'),
                $playerId,
                $score,
                $totalScore,
                array_map(function ($shape) {
                    return $this->averagePositionScore([$shape], SCORE_GAIN_PER_RARE_TREASURE);
                }, $shapes),
                'score_rare_treasure'
            );
        }
    }

    private function scoreRats()
    {
        foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $playerColorName = $this->playerOrderMgr->getPlayerBoatColorName($playerId);
            $positions = $this->shapeMgr->getPlayerVisibleRatPositions($playerId, $playerColorName);
            $score = count($positions) * SCORE_LOSE_PER_RATS;
            $totalScore = $this->substractFromPlayerScore($playerId, 'score_rats', $score);
            $this->notifyScoreBoatPosition(
                clienttranslate('${player_name} loses ${score} points with their visible rats on their boats'),
                $playerId,
                $score,
                $totalScore,
                array_map(function ($pos) {
                    return new TiocScoreBoatPosition($pos->x, $pos->y, -1 * SCORE_LOSE_PER_RATS);
                }, $positions),
                'score_rats'
            );
        }
    }

    private function scoreUnfilledRooms()
    {
        $nbFilledRoomsPerPlayerId = [];
        foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $roomsPositions = $this->shapeMgr->getPlayerUnfilledRoomPositions($playerId);
            $score = count($roomsPositions) * SCORE_LOSE_PER_UNFILLED_ROOMS;
            $nbFilledRoomsPerPlayerId[$playerId] = NB_BOAT_ROOMS_TOTAL - count($roomsPositions);
            $totalScore = $this->substractFromPlayerScore($playerId, 'score_unfilled_rooms', $score);
            $this->notifyScoreBoatPosition(
                clienttranslate('${player_name} loses ${score} points with their unfilled rooms'),
                $playerId,
                $score,
                $totalScore,
                array_map(function ($pos) {
                    return new TiocScoreBoatPosition($pos->x, $pos->y, -1 * SCORE_LOSE_PER_UNFILLED_ROOMS);
                }, $roomsPositions),
                'score_unfilled_rooms'
            );
        }
        return $nbFilledRoomsPerPlayerId;
    }

    private function scoreCatFamilly()
    {
        foreach ($this->loadPlayersBasicInfos() as $playerId => $playerInfo) {
            $famillies = $this->shapeMgr->getPlayerCatFamilly($playerId);
            $score = 0;
            $scorePosition = [];
            foreach ($famillies as $familly) {
                $famillyScore = $this->getFamillySizeScore(count($familly));
                if ($famillyScore > 0) {
                    $scorePosition[] = $this->averagePositionScore($familly, $famillyScore);
                    $score += $famillyScore;
                }
            }
            $totalScore = $this->addToPlayerScore($playerId, 'score_cat_familly', $score);
            $this->notifyScoreBoatPosition(
                clienttranslate('${player_name} scores ${score} points with their cat famillies ${detail}'),
                $playerId,
                $score,
                $totalScore,
                $scorePosition,
                'score_cat_familly',
                true
            );
        }
    }

    private function averagePositionScore($shapes, $score)
    {
        $x = 0;
        $y = 0;
        foreach ($shapes as $shape) {
            $x += ($shape->boatTopX + $shape->boatTopX + $shape->width) / 2;
            $y += ($shape->boatTopY + $shape->boatTopY + $shape->height) / 2;
        }
        $x /= count($shapes);
        $y /= count($shapes);
        if ($x >= BOAT_TILE_WIDTH) {
            $x = BOAT_TILE_WIDTH - 1;
        }
        if ($y >= BOAT_TILE_HEIGHT) {
            $y = BOAT_TILE_HEIGHT - 1;
        }
        return new TiocScoreBoatPosition(intval($x), intval($y), $score);
    }

    private function getFamillySizeScore($famillyCount)
    {
        if ($famillyCount < 3) {
            return 0;
        }
        if ($famillyCount == 3) {
            return 8;
        }
        if ($famillyCount == 4) {
            return 11;
        }
        return 5 * ($famillyCount - 2);
    }

    private function notifyScoreCards($msg, $playerId, $score, $totalScore, $scoreCards, $scoreColumn, $moreArgs = [])
    {
        usort($scoreCards, function ($sc1, $sc2) {
            return ($sc1->cardId <=> $sc2->cardId);
        });
        $cardDetail = implode(", ", array_map(function ($sc) {
            return "{$sc->cardId}: {$sc->score}";
        }, array_filter($scoreCards, function ($sc) {
            return $sc->score > 0;
        })));
        if (strlen($cardDetail) > 0) {
            $cardDetail = "($cardDetail)";
        }
        $playerName = '';
        if ($playerId != SOLO_SISTER_PLAYER_ID) {
            $playerName = $this->loadPlayersBasicInfos()[$playerId]['player_name'];
        }
        $this->tiocNotifyAllPlayers(
            NTF_SCORE_CARDS,
            $msg,
            array_merge([
                'player_id' => $playerId,
                'player_name' => $playerName,
                'score' => $score,
                'totalScore' => $totalScore,
                'scoreCards' => $scoreCards,
                'cardDetail' => $cardDetail,
                'scoreColumn' => $scoreColumn,
            ], $moreArgs)
        );
    }

    private function notifyScoreBoatPosition($msg, $playerId, $score, $totalScore, $scoreBoatPosition, $scoreColumn, $showDetail = false)
    {
        $detail = '';
        if ($showDetail && count($scoreBoatPosition) > 1) {
            usort($scoreBoatPosition, function ($sbp1, $sbp2) {
                return ($sbp1->score <=> $sbp2->score);
            });
            $detail = implode(", ", array_map(function ($sbp) {
                return "{$sbp->score}";
            }, array_filter($scoreBoatPosition, function ($sbp) {
                return $sbp->score > 0;
            })));
            if (strlen($detail) > 0) {
                $detail = "($detail)";
            }
        }
        $this->tiocNotifyAllPlayers(
            NTF_SCORE_BOAT_POSITION,
            $msg,
            [
                'player_id' => $playerId,
                'player_name' => $this->loadPlayersBasicInfos()[$playerId]['player_name'],
                'score' => $score,
                'totalScore' => $totalScore,
                'scoreBoatPosition' => $scoreBoatPosition,
                'detail' => $detail,
                'scoreColumn' => $scoreColumn,
            ]
        );
    }

    private function addToPlayerScore($playerId, $scoreColumn, $score)
    {
        self::DbQuery("UPDATE player SET player_score = player_score + $score, $scoreColumn = $score WHERE player_id = $playerId");
        return self::getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id = $playerId");
    }

    private function substractFromPlayerScore($playerId, $scoreColumn, $score)
    {
        self::DbQuery("UPDATE player SET player_score = player_score - $score, $scoreColumn = $score WHERE player_id = $playerId");
        return self::getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id = $playerId");
    }

    private function addToSoloScore($playerId, $scoreColumn, $score)
    {
        self::DbQuery("UPDATE player SET $scoreColumn = $score WHERE player_id = $playerId");
        return self::getUniqueValueFromDB("SELECT score_solo_color_1 + score_solo_color_2 + score_solo_color_3 + score_solo_color_4 + score_solo_color_5 + score_solo_lessons FROM player WHERE player_id = $playerId");
    }

    private function scoreSoloColor($cardNumber)
    {
        $playerId = array_keys($this->loadPlayersBasicInfos())[0];
        $cards = $this->cardMgr->getSoloColorCards();
        $card = $cards[$cardNumber - 1];
        $shapes = $this->shapeMgr->getColorShape($playerId, $card->getSoloColorId());

        $score = (SCORE_SOLO_COLOR - $cardNumber + 1) * count($shapes);
        $columnName = "score_solo_color_$cardNumber";
        $totalScore = $this->addToSoloScore($playerId, $columnName, $score);
        $this->saveCardEndScore($card->cardId, SOLO_SISTER_PLAYER_ID, $score);
        $this->notifyScoreCards(
            clienttranslate('Your sister scores ${score} points with color card: ${cardColorName}'),
            SOLO_SISTER_PLAYER_ID,
            $score,
            $totalScore,
            [new TiocScoreCard($card->cardId, $score)],
            $columnName,
            [
                'cardColorName' => $this->getColorNameFromColorId($card->getSoloColorId()),
                'i18n' => ['cardColorName']
            ]
        );
    }

    private function scoreSoloLessons($nbFilledRoomsPerPlayerId)
    {
        $playerId = array_keys($this->loadPlayersBasicInfos())[0];
        $cards = $this->cardMgr->getSoloLessonCards();
        $allCardsScore = 0;
        $scoreCards = [];
        $maxScore = 0;
        $addMaxScore = false;
        foreach ($cards as $card) {
            // Special case for card 204: Maximum score of all solo lesson cards
            if ($card->cardId == 204) {
                $addMaxScore = true;
                continue;
            }
            $score = $this->getSoloLessonCardScore($playerId, $card, $nbFilledRoomsPerPlayerId);
            $maxScore = max([$maxScore, $score]);
            $allCardsScore += $score;
            $scoreCards[] = new TiocScoreCard($card->cardId, $score);
            $this->saveCardEndScore($card->cardId, SOLO_SISTER_PLAYER_ID, $score);
        }
        if ($addMaxScore) {
            $allCardsScore += $maxScore;
            $scoreCards[] = new TiocScoreCard(204, $maxScore);
            $this->saveCardEndScore(204, SOLO_SISTER_PLAYER_ID, $maxScore);
        }
        $totalScore = $this->addToSoloScore($playerId, 'score_solo_lessons', $allCardsScore);
        $this->notifyScoreCards(
            clienttranslate('Your sister scores ${score} points with the solo lessons ${cardDetail}'),
            SOLO_SISTER_PLAYER_ID,
            $allCardsScore,
            $totalScore,
            $scoreCards,
            'score_solo_lessons'
        );
    }

    private function scoreSoloPlayer()
    {
        self::DbQuery("UPDATE player SET score_solo_player = player_score");
        self::DbQuery("UPDATE player SET player_score = score_solo_player - (score_solo_color_1 + score_solo_color_2 + score_solo_color_3 + score_solo_color_4 + score_solo_color_5 + score_solo_lessons)");
    }

    private function getSoloLessonCardScore($playerId, $card, $nbFilledRoomsPerPlayerId)
    {
        $score = 0;
        switch ($card->cardId) {
            case 197:
                foreach (CAT_COLOR_IDS as $colorId) {
                    if (
                        count($this->shapeMgr->getColorShape($playerId, $colorId)) <= 0
                        || $this->shapeMgr->countTreasureTouchingColor($playerId, $colorId) <= 0
                    ) {
                        $score += 5;
                    }
                }
                break;
            case 198:
                $famillies = $this->shapeMgr->getPlayerCatFamilly($playerId);
                $bigFamillyCount = 0;
                foreach ($famillies as $familly) {
                    if ($this->getFamillySizeScore(count($familly)) > 0) {
                        $bigFamillyCount = max([$bigFamillyCount, count($familly)]);
                    }
                }
                $score = 2 * $bigFamillyCount;
                break;
            case 199:
                $shapeCount = $this->shapeMgr->countCommonTreasure($playerId) + $this->shapeMgr->countRareTreasure($playerId);
                if ($shapeCount < 9) {
                    $score = 10;
                }
                break;
            case 200:
                $score = 4 * $this->fishMgr->getNbFishForPlayerId($playerId);
                break;
            case 201:
                $playerColorName = $this->playerOrderMgr->getPlayerBoatColorName($playerId);
                $score = 5 * count($this->shapeMgr->getPlayerVisibleRatPositions($playerId, $playerColorName));
                break;
            case 202:
                $catCount = $this->shapeMgr->countCat($playerId) + $this->shapeMgr->countOshax($playerId);
                if ($catCount > 15) {
                    $score = 5 * ($catCount - 15);
                }
                break;
            case 203:
                foreach (CAT_COLOR_IDS as $colorId) {
                    $shapes = $this->shapeMgr->getColorShapeTouchingEdges($playerId, $colorId);
                    if (count($shapes) <= 0) {
                        $score += 5;
                    }
                }
                break;
            case 204:
                // Special case for card 204: Maximum score of all solo lesson cards
                break;
            case 205:
                $score = 3 * $nbFilledRoomsPerPlayerId[$playerId];
                break;
            case 206:
                $famillies = $this->shapeMgr->getPlayerCatFamilly($playerId);
                foreach ($famillies as $familly) {
                    if (count($familly) == 1) {
                        $score += 5;
                    }
                }
                break;
            case 207:
                $cardCount = $this->cardMgr->getPrivateLessonsCount([$playerId])[$playerId];
                $score = 3 * $cardCount;
                break;
            case 208:
                $famillies = $this->shapeMgr->getPlayerCatFamilly($playerId);
                $scores = array_map(function ($familly) {
                    return $this->getFamillySizeScore(count($familly));
                }, $famillies);
                if (count($scores) >= 1) {
                    sort($scores);
                    $score = $scores[count($scores) - 1];
                }
                break;
            case 209:
                $famillies = $this->shapeMgr->getPlayerCatFamilly($playerId);
                $scores = array_map(function ($familly) {
                    return $this->getFamillySizeScore(count($familly));
                }, $famillies);
                if (count($scores) >= 2) {
                    sort($scores);
                    $score = $scores[count($scores) - 2];
                }
                break;
            case 210:
                $shapeCount = $this->shapeMgr->countCommonTreasure($playerId);
                $score = 3 * $shapeCount;
                break;
            case 211:
                $shapeCount = $this->shapeMgr->countCatAndOshaxNotTouchingTreasure($playerId);
                $score = 3 * $shapeCount;
                break;
            case 212:
                $playerColorName = $this->playerOrderMgr->getPlayerBoatColorName($playerId);
                $mapCount = $this->shapeMgr->countUncoveredMap($playerId, $playerColorName);
                $score = 4 * (BOAT_NB_MAP - $mapCount);
                break;
            case 213:
                $famillies = $this->shapeMgr->getPlayerCatFamilly($playerId);
                foreach ($famillies as $familly) {
                    if ($this->getFamillySizeScore(count($familly)) > 0) {
                        $score += 5;
                    }
                }
                break;
            case 214:
                foreach (CAT_COLOR_IDS as $colorId) {
                    $score += count($this->shapeMgr->getColorShapeTouchingEdges($playerId, $colorId));
                }
                break;
            case 215:
                $playerColorName = $this->playerOrderMgr->getPlayerBoatColorName($playerId);
                $colorCount = $this->shapeMgr->countColorShapeNotTouchingRats($playerId, $playerColorName);
                $score = 5 * $colorCount;
                break;
            default:
                throw new BgaVisibleSystemException("BUG! Invalid cardId {$card->cardId}");
        }
        return $score;
    }

    private function saveCardEndScore($cardId, $playerId, $score)
    {
        self::DbQuery("INSERT INTO card_end_score (card_id, player_id, score) VALUES ($cardId, $playerId, $score)");
    }
}
