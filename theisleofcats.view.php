<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * theisleofcats implementation : © Guillaume Benny bennygui@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * theisleofcats.view.php
 *
 */

require_once(APP_BASE_PATH . "view/common/game.view.php");

class view_theisleofcats_theisleofcats extends game_view
{
  function getGameName()
  {
    return "theisleofcats";
  }

  function build_page($viewArgs)
  {
    $currentPlayerId = $this->game->currentPlayerId();
    $playerBasicInfo = $this->game->loadPlayersBasicInfos();
    $this->tpl['WARN_LAST_TURN_TEXT'] = self::_('The game has ended, this is your last chance to play Anytime cards');
    $this->tpl['PUBLIC_LESSONS'] = self::_('Public Lessons');
    $this->tpl['PLAYED_DISCARD'] = self::_('Played Cards');
    $this->tpl['SOLO_LESSONS'] = self::_('Solo Lessons');
    $this->tpl['SOLO_COLORS'] = self::_('Solo Colors');
    $this->tpl['SOLO_BASKETS'] = self::_('Solo Baskets');
    $this->tpl['COLOR_REF'] = self::_('Color reference');

    // Player private lessons
    $this->page->begin_block("theisleofcats_theisleofcats", "player-private-lessons");
    foreach ($playerBasicInfo as $playerId => $playerInfo) {
      if ($currentPlayerId != $playerId) {
        continue;
      }
      $this->page->insert_block(
        "player-private-lessons",
        [
          "PLAYER_ID" => $playerId,
          "PLAYER_NAME" => $playerInfo['player_name'],
          "PLAYER_COLOR" => $playerInfo['player_color'],
          "PRIVATE_LESSONS" => self::_('Private Lessons'),
        ]
      );
    }
    foreach ($playerBasicInfo as $playerId => $playerInfo) {
      if ($currentPlayerId == $playerId) {
        continue;
      }
      $this->page->insert_block(
        "player-private-lessons",
        [
          "PLAYER_ID" => $playerId,
          "PLAYER_NAME" => $playerInfo['player_name'],
          "PLAYER_COLOR" => $playerInfo['player_color'],
          "PRIVATE_LESSONS" => self::_('Private Lessons'),
        ]
      );
    }

    $titleDraft = self::_('Draft Two');
    if ($this->game->isFamilyMode()) {
      $titleDraft = self::_('Keep Two');
    }
    if ($this->game->isSoloMode()) {
      $titleDraft = self::_('Keep Three');
    }

    // Player board
    $this->page->begin_block("theisleofcats_theisleofcats", "player-board");
    foreach ($playerBasicInfo as $playerId => $playerInfo) {
      if ($currentPlayerId != $playerId) {
        continue;
      }
      $this->page->insert_block(
        "player-board",
        [
          "PLAYER_ID" => $playerId,
          "PLAYER_NAME" => $playerInfo['player_name'],
          "PLAYER_COLOR" => $playerInfo['player_color'],
          "BOAT_COLOR_NAME" => $this->game->playerOrderMgr->getPlayerBoatColorName($playerId),
          "DRAFT" => $titleDraft,
          "BUY" => self::_('Click to Buy (cards left here will be discarded)'),
          "HAND" => self::_('Current Hand'),
          "TABLE" => self::_('Rescue Cards'),
        ]
      );
    }
    foreach ($playerBasicInfo as $playerId => $playerInfo) {
      if ($currentPlayerId == $playerId) {
        continue;
      }
      $this->page->insert_block(
        "player-board",
        [
          "PLAYER_ID" => $playerId,
          "PLAYER_NAME" => $playerInfo['player_name'],
          "PLAYER_COLOR" => $playerInfo['player_color'],
          "BOAT_COLOR_NAME" => $this->game->playerOrderMgr->getPlayerBoatColorName($playerId),
          "DRAFT" => $titleDraft,
          "BUY" => self::_('Click to Buy (cards left here will be discarded)'),
          "HAND" => self::_('Current Hand'),
          "TABLE" => self::_('Rescue Cards'),
        ]
      );
    }
    /*********** Do not change anything below this line  ************/
  }
}
