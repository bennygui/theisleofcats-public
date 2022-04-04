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

class TiocPlayerPreference
{
    public $playerId;
    public $prefId;
    public $prefValue;

    public function __construct(int $playerId, int $prefId, int $prefValue)
    {
        $this->playerId = $playerId;
        $this->prefId = $prefId;
        $this->prefValue = $prefValue;
    }
}

class TiocPlayerPreferenceMgr extends APP_DbObject
{
    private $preferences;

    public function setup(array $playerIdArray, array $initialPreferences)
    {
        include dirname(__FILE__) . '/../gameoptions.inc.php';

        $this->preferences = [];
        foreach ($game_preferences as $prefId => $data) {
            $defaultValue = $data['default'] ?? array_keys($data['values'])[0];

            foreach ($playerIdArray as $playerId) {
                $initialPref = null;
                if (array_key_exists($playerId, $initialPreferences) && array_key_exists($prefId, $initialPreferences[$playerId])) {
                    $initialPref = $initialPreferences[$playerId][$prefId];
                }
                $this->preferences[] = new TiocPlayerPreference($playerId, $prefId, $initialPref ?? $defaultValue);
            }
        }
        $this->save();
    }

    public function load()
    {
        if ($this->preferences !== null) {
            return;
        }
        $this->preferences = [];
        $valueArray = self::getObjectListFromDB("SELECT player_id, pref_id, pref_value FROM player_preference");
        foreach ($valueArray as $value) {
            $this->preferences[] = new TiocPlayerPreference(
                $value['player_id'],
                $value['pref_id'],
                $value['pref_value']
            );
        }
    }

    public function save()
    {
        if ($this->preferences === null) {
            return;
        }
        self::DbQuery("DELETE FROM player_preference");
        if (count($this->preferences) == 0) {
            return;
        }
        $sql = "INSERT INTO player_preference (player_id, pref_id, pref_value) VALUES ";
        $sqlValues = [];
        foreach ($this->preferences as $pref) {
            $sqlValues[] = "({$pref->playerId}, {$pref->prefId}, {$pref->prefValue})";
        }
        $sql .= implode(',', $sqlValues);
        self::DbQuery($sql);
    }

    private function fillWithDefaultPreference($playerId)
    {
        $this->load();
        include dirname(__FILE__) . '/../gameoptions.inc.php';

        foreach ($game_preferences as $prefId => $data) {
            $found = false;
            foreach ($this->preferences as $pref) {
                if ($pref->playerId == $playerId && $pref->prefId == $prefId) {
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $defaultValue = $data['default'] ?? array_keys($data['values'])[0];
                $this->preferences[] = new TiocPlayerPreference($playerId, $prefId, $defaultValue);
            }
        }
    }

    public function getPlayerPreferenceArray($playerId)
    {
        $retPrefs = [];
        $this->fillWithDefaultPreference($playerId);
        foreach ($this->preferences as $pref) {
            if ($pref->playerId == $playerId) {
                $retPrefs[$pref->prefId] = $pref->prefValue;
            }
        }
        return $retPrefs;
    }

    public function getPreference($playerId, $prefId)
    {
        $this->fillWithDefaultPreference($playerId);
        foreach ($this->preferences as $pref) {
            if ($pref->playerId == $playerId && $pref->prefId == $prefId) {
                return $pref->prefValue;
            }
        }

        throw new BgaVisibleSystemException("BUG! Unknown prefId $prefId");
    }

    public function setPreference($playerId, $prefId, $prefValue)
    {
        $this->fillWithDefaultPreference($playerId);
        $prefToChange = null;
        foreach ($this->preferences as $pref) {
            if ($pref->playerId == $playerId && $pref->prefId == $prefId) {
                $prefToChange = $pref;
                break;
            }
        }
        if ($prefToChange === null) {
            $prefToChange = new TiocPlayerPreference($playerId, $prefId, $prefValue);
            $this->preferences[] = $prefToChange;
        }
        $prefToChange->prefValue = $prefValue;
        self::DbQuery("UPDATE player_preference SET pref_value = $prefValue WHERE player_id = $playerId AND pref_id = $prefId");
    }
}
