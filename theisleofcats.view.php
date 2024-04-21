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
    $this->tpl['WARN_LAST_TURN_TEXT'] = $this->_('The game has ended, this is your last chance to play Anytime cards');
    $this->tpl['PUBLIC_LESSONS'] = $this->_('Public Lessons');
    $this->tpl['PLAYED_DISCARD'] = $this->_('Played Cards');
    $this->tpl['SOLO_LESSONS'] = $this->_('Solo Lessons');
    $this->tpl['SOLO_COLORS'] = $this->_('Solo Colors');
    $this->tpl['SOLO_BASKETS'] = $this->_('Solo Baskets');
    $this->tpl['COLOR_REF'] = $this->_('Color reference');

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
          "PRIVATE_LESSONS" => $this->_('Private Lessons'),
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
          "PRIVATE_LESSONS" => $this->_('Private Lessons'),
        ]
      );
    }

    $titleDraft = $this->_('Draft Two');
    if ($this->game->isFamilyMode()) {
      $titleDraft = $this->_('Keep Two');
    }
    if ($this->game->isSoloMode()) {
      $titleDraft = $this->_('Keep Three');
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
          "BUY" => $this->_('Click to Buy (cards left here will be discarded)'),
          "HAND" => $this->_('Current Hand'),
          "TABLE" => $this->_('Rescue Cards'),
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
          "BUY" => $this->_('Click to Buy (cards left here will be discarded)'),
          "HAND" => $this->_('Current Hand'),
          "TABLE" => $this->_('Rescue Cards'),
        ]
      );
    }
    /*********** Do not change anything below this line  ************/
  }
}
