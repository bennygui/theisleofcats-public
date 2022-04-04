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

class TiocTurnAction
{
    public $playerId;

    public $allowedCatCount;
    public $takeCatCount;

    public $allowedCommonTreasureCount;
    public $takeCommonTreasureCount;

    public $allowedRareTreasureCount;
    public $takeRareTreasureCount;

    public $allowedSmallTreasureCount;
    public $takeSmallTreasureCount;

    public $playedRareFindsCount;

    public $allowedNextShapeAnywhere;
    public $takeNextShapeAnywhere;

    public $allowedRescueExtraCat;

    public $lastSeenMoveNumber;

    public function __construct(array $array)
    {
        $this->playerId = $array['player_id'];

        $this->allowedCatCount = $array['allowed_cat_count'] ?? 0;
        $this->takeCatCount = $array['take_cat_count'] ?? 0;

        $this->allowedCommonTreasureCount = $array['allowed_common_treasure_count'] ?? 0;
        $this->takeCommonTreasureCount = $array['take_common_treasure_count'] ?? 0;

        $this->allowedRareTreasureCount = $array['allowed_rare_treasure_count'] ?? 0;
        $this->takeRareTreasureCount = $array['take_rare_treasure_count'] ?? 0;

        $this->allowedSmallTreasureCount = $array['allowed_small_treasure_count'] ?? 0;
        $this->takeSmallTreasureCount = $array['take_small_treasure_count'] ?? 0;

        $this->playedRareFindsCount = $array['played_rare_finds_count'] ?? 0;

        $this->allowedNextShapeAnywhere = $array['allowed_next_shape_anywhere'] ?? 0;
        $this->takeNextShapeAnywhere = $array['take_next_shape_anywhere'] ?? 0;

        $this->allowedRescueExtraCat = $array['allowed_rescue_extra_cat'] ?? 0;

        $this->lastSeenMoveNumber = $array['last_seen_move_number'] ?? 0;
    }

    public function resetForNewTurn()
    {
        $this->resetRescueCatCount();

        $this->allowedCommonTreasureCount = 0;
        $this->takeCommonTreasureCount = 0;

        $this->allowedRareTreasureCount = 0;
        $this->takeRareTreasureCount = 0;

        $this->allowedSmallTreasureCount = 0;
        $this->takeSmallTreasureCount = 0;

        $this->playedRareFindsCount = 0;

        $this->takeNextShapeAnywhere = 0;
    }

    public function resetRescueCatCount()
    {
        $this->allowedCatCount = 1;
        $this->allowedCatCount += $this->allowedRescueExtraCat;
        $this->takeCatCount = 0;
    }

    public function resetRareFindsCount()
    {
        $this->playedRareFindsCount = 0;
    }

    public function resetTreasureCount()
    {
        $this->allowedCommonTreasureCount = 0;
        $this->takeCommonTreasureCount = 0;
        $this->allowedRareTreasureCount = 0;
        $this->takeRareTreasureCount = 0;
        $this->allowedSmallTreasureCount = 0;
        $this->takeSmallTreasureCount = 0;
    }

    public function update()
    {
        if ($this->takeNextShapeAnywhere >= $this->allowedNextShapeAnywhere) {
            $this->allowedNextShapeAnywhere = 0;
            $this->takeNextShapeAnywhere = 0;
        }
    }
    
    public function updateLastSeenMoveNumber($moveNumber)
    {
        $this->lastSeenMoveNumber = $moveNumber;
    }
}

class TiocTurnActionMgr extends APP_DbObject
{
    private $game = null;
    private $turnActions = null;
    
    public function __construct($game)
    {
        $this->game = $game;
    }

    public function setup(array $playerIdArray)
    {
        $this->turnActions = [];
        foreach ($playerIdArray as $playerId) {
            $turnAction = new TiocTurnAction([
                'player_id' => $playerId,
            ]);
            $turnAction->resetForNewTurn();
            $this->turnActions[$playerId] = $turnAction;
        }
        $this->save();
    }

    public function save()
    {
        if ($this->turnActions === null) {
            return;
        }
        self::DbQuery("DELETE FROM turn_action");
        $sql = "INSERT INTO turn_action ("
            . "player_id,"
            . "allowed_cat_count,"
            . "take_cat_count,"
            . "allowed_common_treasure_count,"
            . "take_common_treasure_count,"
            . "allowed_rare_treasure_count,"
            . "take_rare_treasure_count,"
            . "allowed_small_treasure_count,"
            . "take_small_treasure_count,"
            . "played_rare_finds_count,"
            . "allowed_next_shape_anywhere,"
            . "take_next_shape_anywhere,"
            . "allowed_rescue_extra_cat,"
            . "last_seen_move_number"
            . ") VALUES ";
        $sqlValues = [];
        foreach ($this->turnActions as $turnAction) {
            $sqlValues[] = "("
                . "{$turnAction->playerId},"
                . "{$turnAction->allowedCatCount},"
                . "{$turnAction->takeCatCount},"
                . "{$turnAction->allowedCommonTreasureCount},"
                . "{$turnAction->takeCommonTreasureCount},"
                . "{$turnAction->allowedRareTreasureCount},"
                . "{$turnAction->takeRareTreasureCount},"
                . "{$turnAction->allowedSmallTreasureCount},"
                . "{$turnAction->takeSmallTreasureCount},"
                . "{$turnAction->playedRareFindsCount},"
                . "{$turnAction->allowedNextShapeAnywhere},"
                . "{$turnAction->takeNextShapeAnywhere},"
                . "{$turnAction->allowedRescueExtraCat},"
                . "{$turnAction->lastSeenMoveNumber}"
                . ")";
        }
        $sql .= implode(',', $sqlValues);
        self::DbQuery($sql);
    }

    public function load()
    {
        if ($this->turnActions !== null) {
            return;
        }

        $this->turnActions = [];
        $valueArray = self::getObjectListFromDB("SELECT * FROM turn_action");
        foreach ($valueArray as $value) {
            $turnAction = new TiocTurnAction($value);
            $this->turnActions[$turnAction->playerId] = $turnAction;
        }
    }

    public function updateLastSeenMoveNumber($playerId)
    {
        $this->load();
        $this->turnActions[$playerId]->updateLastSeenMoveNumber($this->game->getMoveNumber());
        $this->save();
    }

    public function resetForNewTurn()
    {
        $this->load();
        foreach ($this->turnActions as $turnAction) {
            $turnAction->resetForNewTurn();
        }
        $this->save();
    }

    public function resetRescueCatCount($playerId)
    {
        $this->load();
        $this->turnActions[$playerId]->resetRescueCatCount();
        $this->save();
    }

    public function resetRareFindsCount($playerId)
    {
        $this->load();
        $this->turnActions[$playerId]->resetRareFindsCount();
        $this->save();
    }

    public function resetTreasureCount($playerId)
    {
        $this->load();
        $this->turnActions[$playerId]->resetTreasureCount();
        $this->save();
    }

    public function turnActionAsArray()
    {
        $this->load();
        return (array)($this->turnActions);
    }


    public function isAllowedExtraCat($playerId)
    {
        $this->load();
        return ($this->turnActions[$playerId]->allowedRescueExtraCat > 0);
    }

    public function allowExtraCat($playerId)
    {
        $this->load();
        ++$this->turnActions[$playerId]->allowedRescueExtraCat;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function useExtraCat($playerId)
    {
        $this->load();
        --$this->turnActions[$playerId]->allowedRescueExtraCat;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function hasRescuedCat($playerId)
    {
        $this->load();
        return ($this->turnActions[$playerId]->takeCatCount > 0);
    }

    public function canRescueCat($playerId)
    {
        $this->load();
        return ($this->turnActions[$playerId]->takeCatCount < $this->turnActions[$playerId]->allowedCatCount);
    }

    public function rescuedCatCount($playerId)
    {
        $this->load();
        return $this->turnActions[$playerId]->takeCatCount;
    }

    public function catRescued($playerId)
    {
        $this->load();
        ++$this->turnActions[$playerId]->takeCatCount;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function allowCatRescue($playerId)
    {
        $this->load();
        ++$this->turnActions[$playerId]->allowedCatCount;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function canTakeCommonTreasure($playerId)
    {
        $this->load();
        return ($this->turnActions[$playerId]->takeCommonTreasureCount < $this->turnActions[$playerId]->allowedCommonTreasureCount);
    }

    public function allowTakeCommonTreasure($playerId)
    {
        $this->load();
        ++$this->turnActions[$playerId]->allowedCommonTreasureCount;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function undoAllowTakeCommonTreasure($playerId)
    {
        $this->load();
        --$this->turnActions[$playerId]->allowedCommonTreasureCount;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function takeCommonTreasure($playerId)
    {
        $this->load();
        ++$this->turnActions[$playerId]->takeCommonTreasureCount;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function hasRareFinds($playerId)
    {
        $this->load();
        return ($this->turnActions[$playerId]->playedRareFindsCount > 0);
    }

    public function playRareFinds($playerId)
    {
        $this->load();
        ++$this->turnActions[$playerId]->playedRareFindsCount;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function canTakeRareTreasure($playerId)
    {
        $this->load();
        return ($this->turnActions[$playerId]->takeRareTreasureCount < $this->turnActions[$playerId]->allowedRareTreasureCount);
    }

    public function allowTakeRareTreasure($playerId)
    {
        $this->load();
        ++$this->turnActions[$playerId]->allowedRareTreasureCount;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function undoAllowTakeRareTreasure($playerId)
    {
        $this->load();
        --$this->turnActions[$playerId]->allowedRareTreasureCount;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function takeRareTreasure($playerId)
    {
        $this->load();
        ++$this->turnActions[$playerId]->takeRareTreasureCount;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function canTakeSmallTreasure($playerId)
    {
        $this->load();
        return ($this->turnActions[$playerId]->takeSmallTreasureCount < $this->turnActions[$playerId]->allowedSmallTreasureCount);
    }

    public function allowTakeSmallTreasure($playerId)
    {
        $this->load();
        ++$this->turnActions[$playerId]->allowedSmallTreasureCount;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function takeSmallTreasure($playerId)
    {
        $this->load();
        ++$this->turnActions[$playerId]->takeSmallTreasureCount;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function canPutNextShapeAnywhere($playerId)
    {
        $this->load();
        return ($this->turnActions[$playerId]->takeNextShapeAnywhere < $this->turnActions[$playerId]->allowedNextShapeAnywhere);
    }

    public function allowNextShapeAnywhere($playerId)
    {
        $this->load();
        ++$this->turnActions[$playerId]->allowedNextShapeAnywhere;
        $this->turnActions[$playerId]->update();
        $this->save();
    }

    public function takeNextShapeAnywhere($playerId)
    {
        $this->load();
        ++$this->turnActions[$playerId]->takeNextShapeAnywhere;
        $this->turnActions[$playerId]->update();
        $this->save();
    }
}
