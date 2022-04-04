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

class TiocShapeDef
{
    private $shapeDefId;
    private $shapeArray;

    public function __construct(int $shapeDefId, array $shapeArray)
    {
        $this->shapeDefId = $shapeDefId;
        $this->shapeArray = $shapeArray;
    }

    public function shapeDefId()
    {
        return $this->shapeDefId;
    }

    public function shapeArray()
    {
        return $this->shapeArray;
    }
}

class TiocShapeDefMgr
{
    public const COMMON_TREASURE_IDS = [100, 101, 102, 103];
    public const SMALL_TREASURE_IDS = [100, 101];
    public const RARE_TREASURE_IDS = [200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224];
    public const OSHAX_IDS = [300, 301, 302, 303, 304, 305];
    public const CAT_IDS = [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416];
    private $shapes;
    private $shapesById;

    public function __construct()
    {
        $this->fillShapes();
        $this->fillShapesById();
    }

    function shapeFromId(int $id)
    {
        return $this->shapesById[$id];
    }

    private function fillShapesById()
    {
        $this->shapesById = [];
        foreach ($this->shapes as $shape) {
            $this->shapesById[$shape->shapeDefId()] = $shape;
        }
    }

    private function fillShapes()
    {
        $this->shapes = [];
        // Common treasures - 1xx
        // x
        $this->shapes[] = new TiocShapeDef(100, [
            [1],
        ]);
        // xx
        $this->shapes[] = new TiocShapeDef(101, [
            [1, 1],
        ]);
        // xxx
        $this->shapes[] = new TiocShapeDef(102, [
            [0, 1],
            [1, 1],
        ]);
        //  x
        // xx
        $this->shapes[] = new TiocShapeDef(103, [
            [1, 1, 1],
        ]);
        // Rare treasures - 2xx
        foreach (self::RARE_TREASURE_IDS as $id) {
            $shape = [[1, 1, 1, 1]];
            if (array_search($id, [200, 221, 222, 223, 224]) !== false) {
                $shape = [
                    [0, 1],
                    [0, 1],
                    [1, 1],
                ];
            } else if (array_search($id, [201, 202, 203, 204, 205]) !== false) {
                $shape = [
                    [0, 1],
                    [1, 1],
                    [0, 1],
                ];
            } else if (array_search($id, [206, 207, 208, 209, 211]) !== false) {
                $shape = [
                    [1, 1],
                    [1, 1],
                ];
            } else if (array_search($id, [210, 217, 218, 219, 220]) !== false) {
                $shape = [
                    [0, 1, 1],
                    [1, 1, 0],
                ];
            }
            $this->shapes[] = new TiocShapeDef($id, $shape);
        }
        // Oshax - 3xx
        $this->shapes[] = new TiocShapeDef(300, [
            [0, 0, 1, 1],
            [0, 1, 1, 0],
            [1, 1, 0, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(301, [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 1],
            [0, 1, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(302, [
            [0, 1, 1],
            [1, 1, 0],
            [1, 0, 0],
            [1, 0, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(303, [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 1],
            [1, 0, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(304, [
            [0, 0, 1, 0],
            [1, 1, 1, 1],
            [1, 0, 0, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(305, [
            [0, 0, 1, 0],
            [0, 1, 1, 1],
            [1, 1, 0, 0],
        ]);
        // Cats - 4xx
        $this->shapes[] = new TiocShapeDef(400, [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(401, [
            [0, 1, 1],
            [1, 1, 0],
            [1, 0, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(402, [
            [0, 1],
            [1, 1],
            [1, 1],
            [1, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(403, [
            [0, 1],
            [1, 1],
            [0, 1],
            [0, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(404, [
            [0, 1],
            [1, 1],
            [1, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(405, [
            [1, 0, 0],
            [1, 1, 1],
            [1, 0, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(406, [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 1, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(407, [
            [0, 0, 1],
            [0, 0, 1],
            [1, 1, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(408, [
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(409, [
            [1, 1],
            [1, 0],
            [1, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(410, [
            [1, 1, 1, 0],
            [1, 0, 1, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(411, [
            [0, 1, 1],
            [1, 1, 1],
            [0, 0, 1],
        ]);
        $this->shapes[] = new TiocShapeDef(412, [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(413, [
            [0, 0, 1, 1],
            [1, 1, 1, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(414, [
            [0, 1, 1],
            [1, 1, 0],
        ]);
        $this->shapes[] = new TiocShapeDef(415, [
            [1],
            [1],
            [1],
            [1],
            [1],
        ]);
        $this->shapes[] = new TiocShapeDef(416, [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0],
        ]);
    }
}
