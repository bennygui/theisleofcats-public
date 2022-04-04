<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * theisleofcats implementation : © Guillaume Benny bennygui@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

require_once("TiocGlobals.inc.php");

const CARD_NORMAL_RANGE_START = 1;
const CARD_NORMAL_RANGE_END = 150;
const CARD_FAMILY_RANGE_START = 151;
const CARD_FAMILY_RANGE_END = 168;

const CARD_SOLO_COLOR_RANGE_START = 169;
const CARD_SOLO_COLOR_RANGE_END = 173;
const CARD_SOLO_BASKET_RANGE_START = 174;
const CARD_SOLO_BASKET_RANGE_END = 196;
const CARD_SOLO_LESSON_BASIC_RANGE_START = 197;
const CARD_SOLO_LESSON_BASIC_RANGE_END = 206;
const CARD_SOLO_LESSON_ADVANCED_RANGE_START = 207;
const CARD_SOLO_LESSON_ADVANCED_RANGE_END = 215;

const CARD_LOCATION_ID_DECK = 0;
const CARD_LOCATION_ID_PLAYER_DRAFT = 1;
const CARD_LOCATION_ID_PLAYER_BUY = 2;
const CARD_LOCATION_ID_PLAYER_HAND = 3;
const CARD_LOCATION_ID_TABLE = 4;
const CARD_LOCATION_ID_DISCARD = 5;
const CARD_LOCATION_ID_DISCARD_PLAYED = 6;

const CARD_TYPE_ID_OSHAX = 0;
const CARD_TYPE_ID_RESCUE = 1;
const CARD_TYPE_ID_ANYTIME = 2;
const CARD_TYPE_ID_TREASURE = 3;
const CARD_TYPE_ID_PRIVATE_LESSON = 4;
const CARD_TYPE_ID_PUBLIC_LESSON = 5;
const CARD_TYPE_ID_SOLO_COLOR = 6;
const CARD_TYPE_ID_SOLO_BASKET = 7;
const CARD_TYPE_ID_SOLO_LESSON = 8;

const SOME_CARD_PRICE_PER_ID = [
    67 => 2,
    68 => 2,
    69 => 1,
    70 => 1,
    71 => 0,
    72 => 0,
    73 => 1,
    74 => 1,
    75 => 3,
    76 => 2,
    77 => 1,
    78 => 2,
    79 => 2,
    80 => 2,
    81 => 2,
    82 => 2,
    83 => 1,
    84 => 6,
    85 => 6,
    86 => 2,
    87 => 2,
    88 => 3,
    89 => 3,
    90 => 2,
    91 => 2,
    92 => 2,
    93 => 2,
    94 => 2,
    95 => 2,
    96 => 2,
    97 => 2,
];

const CARD_NEEDS_BUY_COLOR = [
    143 => true,
    144 => true,
    145 => true,
    146 => true,
    149 => true,
];

const CARD_BASKET_TYPE_ID_HALF = 0;
const CARD_BASKET_TYPE_ID_FULL = 1;

const CARD_TREASURE_TYPE_ID_ONE_RARE_TWO_COMMON = 0;
const CARD_TREASURE_TYPE_ID_TWO_SMALL_TWO_COMMON = 1;

const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_OSHAX = 0;
const CARD_ANYTIME_TYPE_ID_NEXT_SHAPE_ANYWHERE = 1;
const CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2 = 2;
const CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3 = 3;
const CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE = 4;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET = 5;
const CARD_ANYTIME_TYPE_ID_MOVE_CATS_FROM_FIELDS = 6;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_LESSONS = 7;
const CARD_ANYTIME_TYPE_ID_RESCUE_MORE_CATS = 8;
const CARD_ANYTIME_TYPE_ID_DRAW_AND_FIELD_SHAPE = 9;
const CARD_ANYTIME_TYPE_ID_GAIN_BASKET = 10;
const CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_LESSON = 11;
const CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_TREASURE = 12;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COLOR = 13;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_RARE_TREASURE = 14;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE = 15;
const CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_CAT_OF_COLOR = 16;

// Cards that can only be played as a unique action (no undo) since they reveal new information
const CARD_ANYTIME_SERVER_SIDE_IDS = [
    CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2,
    CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3,
    CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE,
    CARD_ANYTIME_TYPE_ID_DRAW_AND_FIELD_SHAPE,
];
// Cards that can be played in the buy phase
const CARD_ANYTIME_BUY_PHASE_IDS = [
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_OSHAX,
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET,
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_LESSONS,
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COLOR,
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_RARE_TREASURE,
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE,
    CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_CAT_OF_COLOR,
];

const CARD_SOLO_NB_LESSON_BASIC = 3;

const CARD_SOLO_BASKET_COUNT = [
    174 => 1,
    175 => 4,
    176 => 3,
    177 => 2,
    178 => 4,
    179 => 3,
    180 => 3,
    181 => 2,
    182 => 1,
    183 => 4,
    184 => 3,
    185 => 2,
    186 => 4,
    187 => 1,
    188 => 4,
    189 => 1,
    190 => 2,
    191 => 2,
    192 => 4,
    193 => 3,
    194 => 4,
    195 => 3,
    196 => 3,
];

const CARD_SOLO_BASKET_SPEED = [
    174 => 0,
    175 => 0,
    176 => 0,
    177 => 1,
    178 => 1,
    179 => 1,
    180 => 2,
    181 => 2,
    182 => 2,
    183 => 3,
    184 => 3,
    185 => 3,
    186 => 4,
    187 => 4,
    188 => 4,
    189 => 5,
    190 => 5,
    191 => 6,
    192 => 6,
    193 => 7,
    194 => 9,
    195 => 9,
    196 => 9,
];

const CARD_SOLO_BASKET_TYPE_ID_CAT = 0;
const CARD_SOLO_BASKET_TYPE_ID_OSHAX = 1;
const CARD_SOLO_BASKET_TYPE_ID_COMMON_TREASURE = 2;
const CARD_SOLO_BASKET_TYPE_ID_RARE_TREASURE = 3;
const CARD_SOLO_BASKET_TYPE_ID_SWITCH = 4;

class TiocCard
{
    public $cardId;
    public $cardLocationId;
    public $deckOrder;
    public $playerId;
    public $colorId;
    public $playerPrivate;
    public $cardTypeId;
    public $price;
    public $needsBuyColor;
    public $speed;
    public $cardBasketTypeId;
    public $cardTreasureTypeId;
    public $cardAnytimeTypeId;
    public $isCardAnytimeServerSide;
    public $isCardAnytimeBuyPhase;
    public $playedMoveNumber;
    public $soloBasketCount;

    public function __construct(int $cardId, int $cardLocationId, int $deckOrder = 1, ?int $playerId = null, ?int $colorId = null, $playerPrivate = false, ?int $playedMoveNumber = null)
    {
        $this->cardId = $cardId;
        $this->cardLocationId = $cardLocationId;
        $this->deckOrder = $deckOrder;
        $this->playerId = $playerId;
        $this->colorId = $colorId;
        $this->colorId = $colorId;
        $this->playerPrivate = $playerPrivate;
        $this->playedMoveNumber = $playedMoveNumber;
        $this->cardTypeId = null;
        if ($this->cardId >= 1 && $this->cardId <= 6) {
            $this->cardTypeId = CARD_TYPE_ID_OSHAX;
        } else if ($this->cardId >= 7 && $this->cardId <= 66) {
            $this->cardTypeId = CARD_TYPE_ID_RESCUE;
        } else if ($this->cardId >= 67 && $this->cardId <= 97) {
            $this->cardTypeId = CARD_TYPE_ID_ANYTIME;
        } else if ($this->cardId >= 98 && $this->cardId <= 112) {
            $this->cardTypeId = CARD_TYPE_ID_TREASURE;
        } else if ($this->cardId >= 113 && $this->cardId <= 142) {
            $this->cardTypeId = CARD_TYPE_ID_PRIVATE_LESSON;
        } else if ($this->cardId >= 143 && $this->cardId <= 150) {
            $this->cardTypeId = CARD_TYPE_ID_PUBLIC_LESSON;
        } else if ($this->cardId >= CARD_FAMILY_RANGE_START && $this->cardId <= CARD_FAMILY_RANGE_END) {
            $this->cardTypeId = CARD_TYPE_ID_PRIVATE_LESSON;
        } else if ($this->cardId >= CARD_SOLO_COLOR_RANGE_START && $this->cardId <= CARD_SOLO_COLOR_RANGE_END) {
            $this->cardTypeId = CARD_TYPE_ID_SOLO_COLOR;
        } else if ($this->cardId >= CARD_SOLO_BASKET_RANGE_START && $this->cardId <= CARD_SOLO_BASKET_RANGE_END) {
            $this->cardTypeId = CARD_TYPE_ID_SOLO_BASKET;
        } else if ($this->cardId >= CARD_SOLO_LESSON_BASIC_RANGE_START && $this->cardId <= CARD_SOLO_LESSON_BASIC_RANGE_END) {
            $this->cardTypeId = CARD_TYPE_ID_SOLO_LESSON;
        } else if ($this->cardId >= CARD_SOLO_LESSON_ADVANCED_RANGE_START && $this->cardId <= CARD_SOLO_LESSON_ADVANCED_RANGE_END) {
            $this->cardTypeId = CARD_TYPE_ID_SOLO_LESSON;
        }
        $this->price = null;
        if ($this->cardId >= 1 && $this->cardId <= 6) {
            $this->price = 5;
        } else if ($this->cardId >= 7 && $this->cardId <= 14) {
            $this->price = 1;
        } else if ($this->cardId >= 15 && $this->cardId <= 22) {
            $this->price = 0;
        } else if ($this->cardId >= 23 && $this->cardId <= 34) {
            $this->price = 1;
        } else if ($this->cardId >= 35 && $this->cardId <= 54) {
            $this->price = 2;
        } else if ($this->cardId >= 55 && $this->cardId <= 66) {
            $this->price = 3;
        } else if ($this->cardId >= 67 && $this->cardId <= 97) {
            $this->price = SOME_CARD_PRICE_PER_ID[$this->cardId];
        } else if ($this->cardId >= 98 && $this->cardId <= 106) {
            $this->price = 2;
        } else if ($this->cardId >= 107 && $this->cardId <= 112) {
            $this->price = 1;
        } else if ($this->cardId >= 113 && $this->cardId <= 142) {
            $this->price = 2;
        } else if ($this->cardId >= 143 && $this->cardId <= 150) {
            $this->price = 1;
        }
        $this->needsBuyColor = array_key_exists($this->cardId, CARD_NEEDS_BUY_COLOR);
        $this->speed = null;
        if ($this->cardId >= 7 && $this->cardId <= 14) {
            $this->speed = 4;
        } else if ($this->cardId >= 15 && $this->cardId <= 22) {
            $this->speed = 0;
        } else if ($this->cardId >= 23 && $this->cardId <= 34) {
            $this->speed = 1;
        } else if ($this->cardId >= 35 && $this->cardId <= 42) {
            $this->speed = 3;
        } else if ($this->cardId >= 43 && $this->cardId <= 54) {
            $this->speed = 1;
        } else if ($this->cardId >= 55 && $this->cardId <= 66) {
            $this->speed = 3;
        }
        if (array_key_exists($this->cardId, CARD_SOLO_BASKET_SPEED)) {
            $this->speed = CARD_SOLO_BASKET_SPEED[$this->cardId];
        }
        $this->cardBasketTypeId = null;
        if ($this->cardId >= 15 && $this->cardId <= 42) {
            $this->cardBasketTypeId = CARD_BASKET_TYPE_ID_HALF;
        } else if ($this->cardId >= 43 && $this->cardId <= 66) {
            $this->cardBasketTypeId = CARD_BASKET_TYPE_ID_FULL;
        }
        $this->cardTreasureTypeId = null;
        if ($this->cardId >= 98 && $this->cardId <= 106) {
            $this->cardTreasureTypeId = CARD_TREASURE_TYPE_ID_ONE_RARE_TWO_COMMON;
        } else if ($this->cardId >= 107 && $this->cardId <= 112) {
            $this->cardTreasureTypeId = CARD_TREASURE_TYPE_ID_TWO_SMALL_TWO_COMMON;
        }
        $this->cardAnytimeTypeId = null;
        if ($this->cardId >= 67 && $this->cardId <= 68) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_OSHAX;
        } else if ($this->cardId >= 69 && $this->cardId <= 70) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_NEXT_SHAPE_ANYWHERE;
        } else if ($this->cardId >= 71 && $this->cardId <= 72) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2;
        } else if ($this->cardId >= 73 && $this->cardId <= 74) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3;
        } else if ($this->cardId == 75) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE;
        } else if ($this->cardId == 76) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET;
        } else if ($this->cardId == 77) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_MOVE_CATS_FROM_FIELDS;
        } else if ($this->cardId >= 78 && $this->cardId <= 79) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_LESSONS;
        } else if ($this->cardId >= 80 && $this->cardId <= 82) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_RESCUE_MORE_CATS;
        } else if ($this->cardId == 83) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_DRAW_AND_FIELD_SHAPE;
        } else if ($this->cardId >= 84 && $this->cardId <= 85) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_BASKET;
        } else if ($this->cardId >= 86 && $this->cardId <= 87) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_LESSON;
        } else if ($this->cardId >= 88 && $this->cardId <= 89) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_TREASURE;
        } else if ($this->cardId >= 90 && $this->cardId <= 91) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COLOR;
        } else if ($this->cardId >= 92 && $this->cardId <= 93) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_RARE_TREASURE;
        } else if ($this->cardId >= 94 && $this->cardId <= 95) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_COMMON_TREASURE;
        } else if ($this->cardId >= 96 && $this->cardId <= 97) {
            $this->cardAnytimeTypeId = CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_CAT_OF_COLOR;
        }
        $this->isCardAnytimeServerSide = (array_search($this->cardAnytimeTypeId, CARD_ANYTIME_SERVER_SIDE_IDS) !== false);
        $this->isCardAnytimeBuyPhase = (array_search($this->cardAnytimeTypeId, CARD_ANYTIME_BUY_PHASE_IDS) !== false);
        $this->soloBasketCount = null;
        if (array_key_exists($this->cardId, CARD_SOLO_BASKET_COUNT)) {
            $this->soloBasketCount = CARD_SOLO_BASKET_COUNT[$this->cardId];
        }
    }

    public function isTreasure()
    {
        return ($this->cardTypeId == CARD_TYPE_ID_TREASURE);
    }

    public function isOshax()
    {
        return ($this->cardTypeId == CARD_TYPE_ID_OSHAX);
    }

    public function isPrivateLesson()
    {
        return ($this->cardTypeId == CARD_TYPE_ID_PRIVATE_LESSON);
    }

    public function isRescueFullBasket()
    {
        return ($this->cardTypeId == CARD_TYPE_ID_RESCUE && $this->cardBasketTypeId !== null && $this->cardBasketTypeId == CARD_BASKET_TYPE_ID_FULL);
    }

    public function isRescueHalfBasket()
    {
        return ($this->cardTypeId == CARD_TYPE_ID_RESCUE && $this->cardBasketTypeId !== null && $this->cardBasketTypeId == CARD_BASKET_TYPE_ID_HALF);
    }

    public function isSoloBasket()
    {
        return ($this->cardTypeId == CARD_TYPE_ID_SOLO_BASKET);
    }

    public function soloBasketCount()
    {
        return $this->soloBasketCount;
    }

    public function isInDeck()
    {
        return ($this->cardLocationId == CARD_LOCATION_ID_DECK);
    }

    public function isOnPlayerTable($playerId)
    {
        return ($this->cardLocationId == CARD_LOCATION_ID_TABLE && !$this->playerPrivate && $this->playerId == $playerId);
    }

    public function isOnTable()
    {
        return ($this->cardLocationId == CARD_LOCATION_ID_TABLE);
    }

    public function isInPlayerHand($playerId)
    {
        return ($this->cardLocationId == CARD_LOCATION_ID_PLAYER_HAND && $this->playerId == $playerId);
    }

    public function isInPlayerBuy($playerId)
    {
        return ($this->cardLocationId == CARD_LOCATION_ID_PLAYER_BUY && $this->playerId == $playerId);
    }

    public function moveToPlayerDraft($playerId)
    {
        $this->cardLocationId = CARD_LOCATION_ID_PLAYER_DRAFT;
        $this->playerId = $playerId;
    }

    public function moveToPlayerBuy($playerId)
    {
        $this->cardLocationId = CARD_LOCATION_ID_PLAYER_BUY;
        $this->playerId = $playerId;
    }

    public function moveToPlayerHand($playerId, $colorId = null)
    {
        $this->cardLocationId = CARD_LOCATION_ID_PLAYER_HAND;
        $this->playerId = $playerId;
        $this->colorId = $colorId;
    }

    public function moveToTable($playerId)
    {
        $this->cardLocationId = CARD_LOCATION_ID_TABLE;
        $this->playerId = $playerId;
        $this->playerPrivate = false;
    }

    public function moveToTablePrivate($playerId)
    {
        $this->cardLocationId = CARD_LOCATION_ID_TABLE;
        $this->playerId = $playerId;
        $this->playerPrivate = true;
    }

    public function moveToDiscard()
    {
        $this->cardLocationId = CARD_LOCATION_ID_DISCARD;
        $this->playerId = null;
    }

    public function moveToDiscardPlayed($moveNumber)
    {
        $this->cardLocationId = CARD_LOCATION_ID_DISCARD_PLAYED;
        $this->playedMoveNumber = $moveNumber - 1;
    }

    public function isVisibleForPlayerId($playerId, $privateVisible)
    {
        if ($playerId == $this->playerId || $this->cardLocationId == CARD_LOCATION_ID_DISCARD_PLAYED) {
            return true;
        }
        if ($this->cardLocationId == CARD_LOCATION_ID_TABLE) {
            if ($privateVisible) {
                return true;
            }
            if ($this->cardTypeId == CARD_TYPE_ID_PRIVATE_LESSON) {
                return false;
            }
            if ($this->playerPrivate) {
                return false;
            }
            return true;
        }
        return false;
    }

    public function getSoloBasketType()
    {
        switch ($this->cardId) {
            case 174:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 5],
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 4],
                ];
            case 175:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 6],
                    [CARD_SOLO_BASKET_TYPE_ID_COMMON_TREASURE, TiocShapeDefMgr::COMMON_TREASURE_IDS[0]],
                ];
            case 176:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 3],
                    [CARD_SOLO_BASKET_TYPE_ID_OSHAX, 3],
                ];
            case 177:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 4],
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 3],
                ];
            case 178:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 2],
                    [CARD_SOLO_BASKET_TYPE_ID_COMMON_TREASURE, TiocShapeDefMgr::COMMON_TREASURE_IDS[2]],
                ];
            case 179:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 5],
                    [CARD_SOLO_BASKET_TYPE_ID_RARE_TREASURE, 4],
                ];
            case 180:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 2],
                    [CARD_SOLO_BASKET_TYPE_ID_RARE_TREASURE, 2],
                ];
            case 181:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 7],
                    [CARD_SOLO_BASKET_TYPE_ID_OSHAX, 2],
                ];
            case 182:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 4],
                    [CARD_SOLO_BASKET_TYPE_ID_RARE_TREASURE, 1],
                ];
            case 183:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 1],
                    [CARD_SOLO_BASKET_TYPE_ID_COMMON_TREASURE, TiocShapeDefMgr::COMMON_TREASURE_IDS[1]],
                ];
            case 184:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 6],
                    [CARD_SOLO_BASKET_TYPE_ID_RARE_TREASURE, 5],
                ];
            case 185:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 2],
                    [CARD_SOLO_BASKET_TYPE_ID_COMMON_TREASURE, TiocShapeDefMgr::COMMON_TREASURE_IDS[3]],
                ];
            case 186:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 1],
                    [CARD_SOLO_BASKET_TYPE_ID_OSHAX, 5],
                ];
            case 187:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 1],
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 5],
                ];
            case 188:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 3],
                    [CARD_SOLO_BASKET_TYPE_ID_COMMON_TREASURE, TiocShapeDefMgr::COMMON_TREASURE_IDS[2]],
                ];
            case 189:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 6],
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 1],
                ];
            case 190:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 7],
                    [CARD_SOLO_BASKET_TYPE_ID_COMMON_TREASURE, TiocShapeDefMgr::COMMON_TREASURE_IDS[1]],
                ];
            case 191:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 5],
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 2],
                ];
            case 192:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_SWITCH, 1, 6],
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 2],
                ];
            case 193:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 6],
                    [CARD_SOLO_BASKET_TYPE_ID_RARE_TREASURE, 3],
                ];
            case 194:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_SWITCH, 2, 5],
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 1],
                ];
            case 195:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 8],
                    [CARD_SOLO_BASKET_TYPE_ID_OSHAX, 1],
                ];
            case 196:
                return [
                    [CARD_SOLO_BASKET_TYPE_ID_CAT, 4],
                    [CARD_SOLO_BASKET_TYPE_ID_COMMON_TREASURE, TiocShapeDefMgr::COMMON_TREASURE_IDS[3]],
                ];
        }
        throw new BgaVisibleSystemException("BUG! cardId {$this->cardId} is not a solo basket");
    }

    public function getSoloColorId()
    {
        switch ($this->cardId) {
            case 169:
                return CAT_COLOR_ID_BLUE;
            case 170:
                return CAT_COLOR_ID_GREEN;
            case 171:
                return CAT_COLOR_ID_PURPLE;
            case 172:
                return CAT_COLOR_ID_RED;
            case 173:
                return CAT_COLOR_ID_ORANGE;
        }
        throw new BgaVisibleSystemException("BUG! cardId {$this->cardId} is not a solo color");
    }
}

class TiocCardMgr extends APP_DbObject
{
    private $game = null;
    private $cards = null;

    public function __construct($game)
    {
        $this->game = $game;
    }

    public function setup($isFamilyMode, $soloMode)
    {
        $this->cards = [];
        $cardIdRange = range(CARD_NORMAL_RANGE_START, CARD_NORMAL_RANGE_END);
        if ($isFamilyMode) {
            $cardIdRange = range(CARD_FAMILY_RANGE_START, CARD_FAMILY_RANGE_END);
        }
        foreach ($cardIdRange as $cardId) {
            $card = new TiocCard(
                $cardId,
                CARD_LOCATION_ID_DECK
            );
            $this->cards[] = $card;
        }
        shuffle($this->cards);
        if ($soloMode != GAME_OPTION_SOLO_VALUE_OFF) {
            $this->mergeSoloColorCards();
            $this->mergeSoloBasketCards();
            $this->mergeSoloLessonBasicCards();
            $this->mergeSoloLessonAdvancedCards($soloMode);
        }
        $deckOrder = 1;
        foreach ($this->cards as $card) {
            $card->deckOrder = $deckOrder;
            ++$deckOrder;
        }
        $this->save();
    }

    private function mergeSoloColorCards()
    {
        $newCards = [];
        foreach (range(CARD_SOLO_COLOR_RANGE_START, CARD_SOLO_COLOR_RANGE_END) as $cardId) {
            $card = new TiocCard(
                $cardId,
                CARD_LOCATION_ID_DECK
            );
            $newCards[] = $card;
        }
        shuffle($newCards);
        $newCards[0]->cardLocationId = CARD_LOCATION_ID_TABLE;
        $this->cards = array_merge($this->cards, $newCards);
    }

    private function mergeSoloBasketCards()
    {
        $newCards = [];
        foreach (range(CARD_SOLO_BASKET_RANGE_START, CARD_SOLO_BASKET_RANGE_END) as $cardId) {
            $card = new TiocCard(
                $cardId,
                CARD_LOCATION_ID_DECK
            );
            $newCards[] = $card;
        }
        shuffle($newCards);
        $this->cards = array_merge($this->cards, $newCards);
    }

    private function mergeSoloLessonBasicCards()
    {
        $newCards = [];
        foreach (range(CARD_SOLO_LESSON_BASIC_RANGE_START, CARD_SOLO_LESSON_BASIC_RANGE_END) as $cardId) {
            $card = new TiocCard(
                $cardId,
                CARD_LOCATION_ID_TABLE
            );
            $newCards[] = $card;
        }
        shuffle($newCards);
        for ($i = 0; $i < CARD_SOLO_NB_LESSON_BASIC; ++$i) {
            $this->cards[] = array_shift($newCards);
        }
    }
    private function mergeSoloLessonAdvancedCards($soloMode)
    {
        $newCards = [];
        foreach (range(CARD_SOLO_LESSON_ADVANCED_RANGE_START, CARD_SOLO_LESSON_ADVANCED_RANGE_END) as $cardId) {
            $card = new TiocCard(
                $cardId,
                CARD_LOCATION_ID_TABLE
            );
            $newCards[] = $card;
        }
        shuffle($newCards);
        switch ($soloMode) {
            case GAME_OPTION_SOLO_VALUE_OFF:
            case GAME_OPTION_SOLO_VALUE_EASY:
                return;
            case GAME_OPTION_SOLO_VALUE_EXPERT:
                $this->cards[] = array_shift($newCards);
            case GAME_OPTION_SOLO_VALUE_VERY_HARD:
                $this->cards[] = array_shift($newCards);
            case GAME_OPTION_SOLO_VALUE_HARD:
                $this->cards[] = array_shift($newCards);
            case GAME_OPTION_SOLO_VALUE_MEDIUM:
                $this->cards[] = array_shift($newCards);
        }
    }

    public function load()
    {
        if ($this->cards !== null) {
            return $this->cards;
        }
        $this->cards = [];
        $valueArray = self::getObjectListFromDB("SELECT card_id, card_location_id, deck_order, player_id, color_id, player_private, played_move_number FROM card");
        foreach ($valueArray as $value) {
            $card = new TiocCard(
                $value['card_id'],
                $value['card_location_id'],
                $value['deck_order'],
                $value['player_id'],
                $value['color_id'],
                $value['player_private'] == 1,
                $value['played_move_number']
            );
            $this->cards[] = $card;
        }
        usort($this->cards, function ($c1, $c2) {
            return $c1->deckOrder <=> $c2->deckOrder;
        });
        return $this->cards;
    }

    public function save()
    {
        if ($this->cards === null) {
            return;
        }
        self::DbQuery("DELETE FROM card");
        $sql = "INSERT INTO card (card_id, card_location_id, deck_order, player_id, color_id, player_private, played_move_number) VALUES ";
        $sqlValues = [];
        foreach ($this->cards as $card) {
            $playerPrivate = $card->playerPrivate ? 1 : 0;
            $sqlValues[] = "({$card->cardId}, {$card->cardLocationId}, {$card->deckOrder}, " . sqlNullOrValue($card->playerId) . ", " . sqlNullOrValue($card->colorId) . ", {$playerPrivate}, " . sqlNullOrValue($card->playedMoveNumber) . ")";
        }
        $sql .= implode(',', $sqlValues);
        self::DbQuery($sql);
    }

    public function findByCardId($cardId)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardId == $cardId) {
                return $card;
            }
        }
        return null;
    }

    public function isCardIdAnytime($cardId)
    {
        $card = $this->findByCardId($cardId);
        if ($card === null) {
            return false;
        }
        return ($card->cardTypeId == CARD_TYPE_ID_ANYTIME);
    }

    public function drawCardsForDraft($playerId, $nbCardToDraw)
    {
        $this->load();
        $drawnCards = [];
        foreach ($this->cards as $card) {
            if (!$card->isInDeck()) {
                continue;
            }
            $card->moveToPlayerDraft($playerId);
            $drawnCards[] = $card;
            if (count($drawnCards) >= $nbCardToDraw) {
                break;
            }
        }
        $this->save();
        return $drawnCards;
    }

    public function drawCardsForBuy($playerId, $nbCardToDraw)
    {
        $this->load();
        $drawnCards = [];
        foreach ($this->cards as $card) {
            if (!$card->isInDeck()) {
                continue;
            }
            $card->moveToPlayerBuy($playerId);
            $drawnCards[] = $card;
            if (count($drawnCards) >= $nbCardToDraw) {
                break;
            }
        }
        $this->save();
        return $drawnCards;
    }

    public function soloDrawSoloColorCard()
    {
        $this->load();
        $drawnCard = null;
        foreach ($this->cards as $card) {
            if ($card->isInDeck() && $card->cardTypeId == CARD_TYPE_ID_SOLO_COLOR) {
                $card->moveToTable(null);
                $drawnCard = $card;
                break;
            }
        }
        $this->save();
        return $drawnCard;
    }

    public function getVisibleCardsForPlayerId($playerId, $privateVisible)
    {
        $this->load();
        $visibleCards = [];
        foreach ($this->cards as $card) {
            if (!$card->isVisibleForPlayerId($playerId, $privateVisible)) {
                continue;
            }
            $visibleCards[] = $card;
        }
        return $visibleCards;
    }

    public function getPrivateLessonsCount($playerIdArray)
    {
        $this->load();
        $privateLessonsCount = [];
        foreach ($playerIdArray as $playerId) {
            $privateLessonsCount[$playerId] = 0;
        }
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_PRIVATE_LESSON) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_TABLE) {
                continue;
            }
            if ($card->playerId === null) {
                continue;
            }
            $privateLessonsCount[$card->playerId] += 1;
        }
        return $privateLessonsCount;
    }

    public function getPublicLessonCards()
    {
        $this->load();
        $cards = [];
        foreach ($this->cards as $card) {
            if ($card->cardLocationId != CARD_LOCATION_ID_TABLE) {
                continue;
            }
            if ($card->cardTypeId == CARD_TYPE_ID_PUBLIC_LESSON) {
                $cards[] = $card;
            }
        }
        return $cards;
    }
    public function getPrivateLessonCards($playerId)
    {
        $this->load();
        $cards = [];
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_PRIVATE_LESSON) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_TABLE) {
                continue;
            }
            if ($card->playerId === null || $card->playerId != $playerId) {
                continue;
            }
            $cards[] = $card;
        }
        return $cards;
    }

    public function getHandCardCount($playerIdArray)
    {
        $this->load();
        $cardCount = [];
        foreach ($playerIdArray as $playerId) {
            $cardCount[$playerId] = 0;
        }
        foreach ($this->cards as $card) {
            if ($card->playerId === null) {
                continue;
            }
            if ($card->cardLocationId == CARD_LOCATION_ID_PLAYER_HAND) {
                $cardCount[$card->playerId] += 1;
            }
        }
        return $cardCount;
    }
    
    public function getTableRescueCardsCardCount($playerIdArray)
    {
        $this->load();
        $cardCount = [];
        foreach ($playerIdArray as $playerId) {
            $cardCount[$playerId] = 0;
        }
        foreach ($this->cards as $card) {
            if ($card->playerId === null) {
                continue;
            }
            if ($card->cardLocationId == CARD_LOCATION_ID_TABLE && $card->cardTypeId == CARD_TYPE_ID_RESCUE) {
                $cardCount[$card->playerId] += 1;
            }
        }
        return $cardCount;
    }

    public function moveDraftCardsToBuy($playerId, $cardIds)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if (count($cardIds) == 0) {
                break;
            }
            $i = array_search($card->cardId, $cardIds);
            if ($i === false) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_DRAFT || $card->playerId != $playerId) {
                return false;
            }
            array_splice($cardIds, $i, 1);
            $card->moveToPlayerBuy($playerId);
        }
        if (count($cardIds) > 0) {
            return false;
        }
        $this->save();
        return true;
    }

    public function draftKeepOnlyCardList($playerId, $cardIds)
    {
        $this->load();
        $discardCardId = null;
        $keepCardCount = 0;
        foreach ($this->cards as $card) {
            $i = array_search($card->cardId, $cardIds);
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_DRAFT || $card->playerId != $playerId) {
                if ($i !== false) {
                    return null;
                }
                continue;
            }
            if ($i === false) {
                if ($discardCardId !== null) {
                    return null;
                } else {
                    $discardCardId = $card->cardId;
                    $card->moveToDiscard();
                }
            } else {
                ++$keepCardCount;
            }
        }
        if ($discardCardId === null || count($cardIds) != $keepCardCount) {
            return null;
        }
        $this->save();
        return $discardCardId;
    }

    public function draftDiscardAll($playerId)
    {
        $cardIds = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_PLAYER_DRAFT && $card->playerId == $playerId) {
                $card->moveToDiscard();
                $cardIds[] = $card->cardId;
            }
        }
        $this->save();
        return $cardIds;
    }

    public function moveFamilyDraftCardsToHand()
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_PLAYER_DRAFT && $card->playerId !== null) {
                $card->moveToPlayerHand($card->playerId);
            }
        }

        $this->save();
    }

    public function moveRecueCardFromHandToTablePrivate($playerId, $cardIds)
    {
        $rescueCards = [];
        $this->load();
        foreach ($this->cards as $card) {
            if (count($cardIds) == 0) {
                break;
            }
            $i = array_search($card->cardId, $cardIds);
            if ($i === false) {
                continue;
            }
            if (
                $card->cardLocationId != CARD_LOCATION_ID_PLAYER_HAND
                || $card->cardTypeId != CARD_TYPE_ID_RESCUE
                || $card->playerId != $playerId
            ) {
                return null;
            }
            array_splice($cardIds, $i, 1);
            $card->moveToTablePrivate($playerId);
            $rescueCards[] = $card;
        }
        if (count($cardIds) > 0) {
            return null;
        }
        $this->save();
        return $rescueCards;
    }

    public function passDraftCardsToNextPlayer($nextPlayerIds)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_PLAYER_DRAFT) {
                $card->playerId = $nextPlayerIds[$card->playerId];
            }
        }
        $this->save();
    }

    public function getPlayerDraftCards($playerId)
    {
        $cards = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_DRAFT || $card->playerId != $playerId) {
                continue;
            }
            $cards[] = $card;
        }
        return $cards;
    }

    public function playerCountCardsToBuy($playerId)
    {
        $count = 0;
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerBuy($playerId)) {
                ++$count;
            }
        }
        return $count;
    }

    public function playerHasCardsToBuy($playerId)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerBuy($playerId)) {
                return true;
            }
        }
        return false;
    }

    public function buyPlayerCard($playerId, $cardId, $colorId)
    {
        $this->load();
        $card = $this->findByCardId($cardId);
        if ($card === null || !$card->isInPlayerBuy($playerId))
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if ($colorId === null && $card->needsBuyColor)
            throw new BgaVisibleSystemException("BUG! cardId $cardId needs buy color");

        if ($colorId !== null && !$card->needsBuyColor)
            throw new BgaVisibleSystemException("BUG! cardId $cardId does not need buy color");

        if ($colorId !== null && array_search($colorId, CAT_COLOR_IDS) === false)
            throw new BgaVisibleSystemException("BUG! colorId $colorId is not valid");

        $card->moveToPlayerHand($playerId, $colorId);

        $this->save();
        return $card->price;
    }

    public function movePublicLessonsToTable()
    {
        $cards = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_PUBLIC_LESSON) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_HAND) {
                continue;
            }
            $card->moveToTable(null);
            $cards[] = $card;
        }
        $this->save();
        return $cards;
    }

    public function movePrivateLessonsToTable($playerId)
    {
        $cards = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_PRIVATE_LESSON) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_HAND) {
                continue;
            }
            if ($card->playerId != $playerId) {
                continue;
            }
            $card->moveToTable($playerId);
            $cards[] = $card;
        }
        $this->save();
        return $cards;
    }

    public function getPlayerIdWithRecueCardsInHand()
    {
        $playerIds = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_RESCUE) {
                continue;
            }
            if ($card->cardLocationId != CARD_LOCATION_ID_PLAYER_HAND) {
                continue;
            }
            if ($card->playerId === null) {
                continue;
            }
            $playerIds[$card->playerId] = true;
        }
        return array_keys($playerIds);
    }

    public function reavealTablePrivateCardsPerPlayerId()
    {
        $playedCards = [];
        $this->load();
        foreach ($this->cards as $card) {
            if (
                $card->cardLocationId != CARD_LOCATION_ID_TABLE
                || $card->playerId === null
                || !$card->playerPrivate
            ) {
                continue;
            }
            $card->moveToTable($card->playerId);
            if (!array_key_exists($card->playerId, $playedCards)) {
                $playedCards[$card->playerId] = [];
            }
            $playedCards[$card->playerId][] = $card;
        }
        $this->save();
        return $playedCards;
    }

    public function validateAndUseRescueCards($playerId, $firstCardId, $secondCardId)
    {
        $returnCards = [];
        $this->load();
        $firstCard = $this->findByCardId($firstCardId);
        if ($firstCard === null || !$firstCard->isOnPlayerTable($playerId))
            throw new BgaVisibleSystemException("BUG! Invalid firstCardId $firstCardId");

        if ($firstCard->isRescueFullBasket() && $secondCardId === null) {
            $firstCard->moveToDiscardPlayed($this->game->getMoveNumber());
            $returnCards[] = $firstCard;
        } else if ($firstCard->isRescueHalfBasket() && $secondCardId !== null) {
            $secondCard = $this->findByCardId($secondCardId);
            if ($secondCard === null || !$secondCard->isOnPlayerTable($playerId) || !$secondCard->isRescueHalfBasket())
                throw new BgaVisibleSystemException("BUG! Invalid secondCardId $secondCardId");
            $firstCard->moveToDiscardPlayed($this->game->getMoveNumber());
            $secondCard->moveToDiscardPlayed($this->game->getMoveNumber());
            $returnCards[] = $firstCard;
            $returnCards[] = $secondCard;
        } else {
            throw new BgaVisibleSystemException("BUG! Invalid first and second card");
        }

        $this->save();
        return $returnCards;
    }

    public function validateAndUseTreasureCard($playerId, $cardId)
    {
        $this->load();
        $playedCard = $this->findByCardId($cardId);
        if ($playedCard === null || !$playedCard->isInPlayerHand($playerId))
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if (!$playedCard->isTreasure())
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not a treasure");

        $playedCard->moveToDiscardPlayed($this->game->getMoveNumber());

        $this->save();
        return $playedCard;
    }

    public function validateAndUseOshaxCard($playerId, $cardId)
    {
        $this->load();
        $playedCard = $this->findByCardId($cardId);
        if ($playedCard === null || !$playedCard->isInPlayerHand($playerId))
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if (!$playedCard->isOshax())
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not an oshax");

        $playedCard->moveToDiscardPlayed($this->game->getMoveNumber());

        $this->save();
        return $playedCard;
    }

    public function discardUnusedRecueCards()
    {
        $cardIds = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_TABLE && $card->playerId !== null && $card->cardTypeId == CARD_TYPE_ID_RESCUE) {
                $card->moveToDiscard();
                $cardIds[] = $card->cardId;
            }
        }
        $this->save();
        return $cardIds;
    }

    public function discardSoloBasketCards()
    {
        $cardIds = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_TABLE && $card->cardTypeId == CARD_TYPE_ID_SOLO_BASKET) {
                $card->moveToDiscard();
                $cardIds[] = $card->cardId;
            }
        }
        $this->save();
        return $cardIds;
    }

    public function discardUnbuyCards($playerId)
    {
        $cardIds = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerBuy($playerId)) {
                $card->moveToDiscard();
                $cardIds[] = $card->cardId;
            }
        }
        $this->save();
        return $cardIds;
    }

    public function validatePlayAnytimeServerSideCard($cardId, $playerId)
    {
        $this->load();
        $card = $this->findByCardId($cardId);
        if ($card === null)
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if (!$card->isCardAnytimeServerSide)
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not a server side card");

        if (!$card->isInPlayerHand($playerId))
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not in player hand");

        $card->moveToDiscardPlayed($this->game->getMoveNumber());

        $this->save();
        return $card;
    }

    public function validatePlayAnytimeClientSideCard($cardId, $playerId, $allowedAnytimeTypeIdArray = null)
    {
        $this->load();
        $card = $this->findByCardId($cardId);
        if ($card === null)
            throw new BgaVisibleSystemException("BUG! cardId $cardId dot not exists");
        if ($card->cardAnytimeTypeId === null)
            throw new BgaVisibleSystemException("BUG! cardId $cardId has no anytime type id");
        if ($allowedAnytimeTypeIdArray !== null && array_search($card->cardAnytimeTypeId, $allowedAnytimeTypeIdArray) === false)
            throw new BgaVisibleSystemException("BUG! cardId $cardId has cardAnytimeTypeId which is not allowed");
        if ($card->isCardAnytimeServerSide)
            throw new BgaVisibleSystemException("BUG! cardId $cardId is a server side card");

        if (!$card->isInPlayerHand($playerId))
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not in player hand");

        $card->moveToDiscardPlayed($this->game->getMoveNumber());

        $this->save();
        return $card;
    }

    public function validateAndDiscardPrivateLesson($playerId, $cardId)
    {

        $this->load();
        $card = $this->findByCardId($cardId);
        if ($card === null)
            throw new BgaVisibleSystemException("BUG! Invalid cardId $cardId");

        if (!$card->isPrivateLesson())
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not a private lesson");
        if (!$card->isOnPlayerTable($playerId))
            throw new BgaVisibleSystemException("BUG! cardId $cardId is not on player table");

        $card->moveToDiscard();

        $this->save();
        return $card;
    }

    public function hasNoCardsInHand()
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardLocationId == CARD_LOCATION_ID_PLAYER_HAND) {
                return false;
            }
        }
        return true;
    }

    public function playerHasNoCardsInHand($playerId)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerHand($playerId)) {
                return false;
            }
        }
        return true;
    }

    public function getPlayerHandCardIdArray($playerId)
    {
        $cardIdArray = [];
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->isInPlayerHand($playerId)) {
                $cardIdArray[] = $card->cardId;
            }
        }
        return $cardIdArray;
    }

    public function countRescueBasket($playerId)
    {
        $this->load();
        $count = 0;
        foreach ($this->cards as $card) {
            if ($card->isOnPlayerTable($playerId)) {
                if ($card->isRescueFullBasket()) {
                    $count += 1;
                } else if ($card->isRescueHalfBasket()) {
                    $count += 0.5;
                }
            }
        }
        return $count;
    }

    public function countTreasureCards($playerId)
    {
        $this->load();
        return count(array_filter($this->cards, function ($card) use (&$playerId) {
            return $card->isTreasure() && $card->isInPlayerHand($playerId);
        }));
    }

    public function countOshaxCards($playerId)
    {
        $this->load();
        return count(array_filter($this->cards, function ($card) use (&$playerId) {
            return $card->isOshax() && $card->isInPlayerHand($playerId);
        }));
    }

    public function playerHasAnytimeCardsInHand($playerId)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId == CARD_TYPE_ID_ANYTIME && $card->isInPlayerHand($playerId)) {
                return true;
            }
        }
        return false;
    }

    public function playerHasAnytimeCardsForRescuePhaseInHand($playerId)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_ANYTIME || !$card->isInPlayerHand($playerId)) {
                continue;
            }
            switch ($card->cardAnytimeTypeId) {
                case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2:
                case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3:
                case CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE:
                case CARD_ANYTIME_TYPE_ID_GAIN_FISH_FOR_BASKET:
                case CARD_ANYTIME_TYPE_ID_GAIN_BASKET:
                case CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_LESSON:
                case CARD_ANYTIME_TYPE_ID_GAIN_BASKET_FOR_TREASURE:
                    return true;
            }
        }
        return false;
    }

    public function playerHasAnytimeCardsForRareFindsPhaseInHand($playerId)
    {
        $this->load();
        foreach ($this->cards as $card) {
            if ($card->cardTypeId != CARD_TYPE_ID_ANYTIME || !$card->isInPlayerHand($playerId)) {
                continue;
            }
            switch ($card->cardAnytimeTypeId) {
                case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_2:
                case CARD_ANYTIME_TYPE_ID_DRAW_CARDS_3:
                case CARD_ANYTIME_TYPE_ID_DRAW_AND_BOAT_SHAPE:
                    return true;
            }
        }
        return false;
    }

    public function playerAnytimeCardIdSet($playerId)
    {
        $this->load();
        $cardIdSet = [];
        foreach ($this->cards as $card) {
            if ($card->cardTypeId == CARD_TYPE_ID_ANYTIME && $card->isInPlayerHand($playerId)) {
                $cardIdSet[$card->cardId] = true;
            }
        }
        return $cardIdSet;
    }

    public function countPrivateLessons($playerId)
    {
        $this->load();
        return count(array_filter($this->cards, function ($card) use (&$playerId) {
            return $card->cardTypeId == CARD_TYPE_ID_PRIVATE_LESSON && $card->isOnPlayerTable($playerId);
        }));
    }

    public function soloDrawInitalBasketCards()
    {
        $this->load();
        $drawnCards = [];
        foreach ($this->cards as $card) {
            if (!$card->isInDeck() || !$card->isSoloBasket()) {
                continue;
            }
            if (count($drawnCards) == 0) {
                $card->moveToTable(null);
            } else {
                $card->moveToTablePrivate(null);
            }
            $drawnCards[] = $card;
            if (count($drawnCards) >= $drawnCards[0]->soloBasketCount()) {
                break;
            }
        }
        $this->save();
        return $drawnCards;
    }

    public function soloPlayNextBasketCard()
    {
        $this->load();
        foreach ($this->cards as $card) {
            if (!$card->isOnTable() || !$card->isSoloBasket() || $card->playedMoveNumber !== null) {
                continue;
            }
            $card->moveToTable(null);
            $card->playedMoveNumber = $this->game->getMoveNumber();
            $this->save();
            return $card;
        }
        return null;
    }

    public function getSoloColorCards()
    {
        $this->load();
        $cards = [];
        foreach ($this->cards as $card) {
            if ($card->isOnTable() && $card->cardTypeId == CARD_TYPE_ID_SOLO_COLOR) {
                $cards[] = $card;
            }
        }
        return $cards;
    }

    public function getSoloLessonCards()
    {
        $this->load();
        $cards = [];
        foreach ($this->cards as $card) {
            if ($card->isOnTable() && $card->cardTypeId == CARD_TYPE_ID_SOLO_LESSON) {
                $cards[] = $card;
            }
        }
        return $cards;
    }

    public function debugDistributeCards($playerIdArray)
    {
        $this->load();
        foreach ($this->cards as $card) {
            switch ($card->cardTypeId) {
                case CARD_TYPE_ID_SOLO_COLOR:
                    $card->moveToTable(null);
                    break;
                case CARD_TYPE_ID_SOLO_LESSON:
                    $card->moveToTable(null);
                    break;
                case CARD_TYPE_ID_SOLO_BASKET:
                    $card->moveToDiscard();
                    break;
                default:
                    $colorId = null;
                    if ($card->needsBuyColor) {
                        $colorId = CAT_COLOR_IDS[array_rand(CAT_COLOR_IDS)];
                    }
                    $playerId = $playerIdArray[array_rand($playerIdArray)];
                    $card->moveToPlayerHand($playerId, $colorId);
                    break;
            }
        }
        $this->save();
        $this->movePublicLessonsToTable();
        foreach ($playerIdArray as $playerId) {
            $this->movePrivateLessonsToTable($playerId);
        }
    }
}
