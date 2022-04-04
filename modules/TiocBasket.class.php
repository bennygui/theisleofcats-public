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

class TiocBasket
{
    public $basketId;
    public $playerId;
    public $used;
    public $discarded;

    public function __construct(int $basketId, int $playerId, bool $used = false, bool $discarded = false)
    {
        $this->basketId = $basketId;
        $this->playerId = $playerId;
        $this->used = $used;
        $this->discarded = $discarded;
    }

    public function isUsed()
    {
        return $this->used;
    }

    public function setUsed()
    {
        $this->used = true;
    }

    public function setUnused()
    {
        $this->used = false;
    }

    public function isDiscarded()
    {
        return $this->discarded;
    }

    public function setDiscarded()
    {
        $this->discarded = true;
    }
}

class TiocBasketMgr extends APP_DbObject
{
    private $baskets = null;
    private $basketIdToDatabaseBasketId = [];

    public function setup($isFamilyMode, $playerIdArray)
    {
        if ($isFamilyMode) {
            return;
        }
        $this->baskets = [];
        $basketId = 0;
        for ($i = 1; $i <= PLAYER_NB_START_BASKET; ++$i) {
            foreach ($playerIdArray as $playerId) {
                $basket = new TiocBasket(
                    $basketId,
                    $playerId
                );
                $this->baskets[] = $basket;
                ++$basketId;
            }
        }
        $this->save();
    }

    public function load()
    {
        if ($this->baskets !== null) {
            return;
        }
        $this->baskets = [];
        $valueArray = self::getObjectListFromDB("SELECT basket_id, player_id, used, discarded FROM basket");
        foreach ($valueArray as $value) {
            $basket = new TiocBasket(
                $value['basket_id'],
                $value['player_id'],
                $value['used'] == 1,
                $value['discarded'] == 1
            );
            $this->baskets[] = $basket;
        }
    }

    public function save()
    {
        if ($this->baskets === null) {
            return;
        }
        self::DbQuery("DELETE FROM basket");
        if (count($this->baskets) <= 0) {
            return;
        }
        $sql = "INSERT INTO basket (basket_id, player_id, used, discarded) VALUES ";
        $sqlValues = [];
        foreach ($this->baskets as $basket) {
            $used = $basket->used ? 1 : 0;
            $discarded = $basket->discarded ? 1 : 0;
            $sqlValues[] = "({$basket->basketId}, {$basket->playerId}, {$used}, {$discarded})";
        }
        $sql .= implode(',', $sqlValues);
        self::DbQuery($sql);
    }

    public function getAllBaskets()
    {
        $this->load();
        return array_values(array_filter($this->baskets, function ($basket) {
            return !$basket->isDiscarded();
        }));
    }

    public function findBasket($playerId, $basketId)
    {
        $this->load();
        foreach ($this->baskets as $basket) {
            if ($basket->basketId == $basketId && $basket->playerId == $playerId) {
                return $basket;
            }
        }
        return null;
    }

    public function hasUnusedBasket($playerId)
    {
        $this->load();
        foreach ($this->baskets as $basket) {
            if ($basket->playerId == $playerId && !$basket->isDiscarded() && !$basket->isUsed()) {
                return true;
            }
        }
        return false;
    }

    public function validateAndUseBasket($playerId, $basketId)
    {
        $basket = $this->findBasket($playerId, $basketId);
        if ($basket === null)
            throw new BgaVisibleSystemException("BUG! basketId $basketId does not exist or is for another player");
        if ($basket->isUsed())
            throw new BgaVisibleSystemException("BUG! basketId $basketId is already used");
        if ($basket->isDiscarded())
            throw new BgaVisibleSystemException("BUG! basketId $basketId is discarded");
        $basket->setUsed();
        $this->save();
    }

    public function resetAllBaskets()
    {
        $resetBasketIds = [];
        $this->load();
        foreach ($this->baskets as $basket) {
            if ($basket->isDiscarded()) {
                continue;
            }
            $basket->setUnused();
            $resetBasketIds[] = $basket->basketId;
        }
        $this->save();
        return $resetBasketIds;
    }

    public function basketIdToDatabaseBasketId($basketId)
    {
        if (array_key_exists($basketId, $this->basketIdToDatabaseBasketId)) {
            return $this->basketIdToDatabaseBasketId[$basketId];
        }
        return $basketId;
    }

    public function validateDiscardBasket($basketId, $playerId)
    {
        $basket = $this->findBasket($playerId, $basketId);
        if ($basket === null)
            throw new BgaVisibleSystemException("BUG! basketId $basketId does not exist or is for another player");
        if ($basket->isDiscarded())
            throw new BgaVisibleSystemException("BUG! basketId $basketId is already discarded");

        $basket->setDiscarded();

        $this->save();
    }

    public function createNewBasket($playerId, $tmpBasketId)
    {
        $this->load();
        foreach ($this->baskets as $basket) {
            if ($basket->basketId == $tmpBasketId)
                throw new BgaVisibleSystemException("BUG! tmpBasketId $tmpBasketId already exists in database");
        }
        if (array_key_exists($tmpBasketId, $this->basketIdToDatabaseBasketId))
            throw new BgaVisibleSystemException("BUG! tmpBasketId $tmpBasketId already exists in memory");

        $realBasketId = self::getUniqueValueFromDB("SELECT MAX(basket_id) + 1 FROM basket");
        $basket = new TiocBasket(
            $realBasketId,
            $playerId
        );
        $this->baskets[] = $basket;
        $this->basketIdToDatabaseBasketId[$tmpBasketId] = $realBasketId;
        $this->save();
        return $realBasketId;
    }

    public function countBaskets($playerId)
    {
        $basketCount = 0;
        $this->load();
        foreach ($this->baskets as $basket) {
            if ($basket->isDiscarded()) {
                continue;
            }
            if ($basket->playerId === null || $basket->playerId != $playerId) {
                continue;
            }
            ++$basketCount;
        }
        return $basketCount;
    }
}
