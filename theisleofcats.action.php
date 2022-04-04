<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * theisleofcats implementation : © Guillaume Benny bennygui@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * theisleofcats.action.php
 *
 * theisleofcats main action entry point
 *
 */


class action_theisleofcats extends APP_GameAction
{
  // Constructor: please do not modify
  public function __default()
  {
    if (self::isArg('notifwindow')) {
      $this->view = "common_notifwindow";
      $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
    } else {
      $this->view = "theisleofcats_theisleofcats";
      self::trace("Complete reinitialization of board game");
    }
  }

  public function addActionLog()
  {
    self::setAjaxMode();

    $type = self::getArg("type", AT_enum, true, null, ['js', 'cmd']);
    $action = self::getArg("action_log", AT_json, true);
    $actionString = substr(json_encode($action), 0, 1024);

    $this->game->addActionLog($type, $actionString);

    self::ajaxResponse();
  }

  public function changePlayerPreference()
  {
    self::setAjaxMode();

    $prefId = self::getArg("prefId", AT_posint, true);
    $prefValue = self::getArg("prefValue", AT_posint, true);
    $notify = self::getArg("notify", AT_bool, true);

    $this->game->changePlayerPreference($prefId, $prefValue, $notify);

    self::ajaxResponse();
  }

  public function changeAnytimeCardPlay()
  {
    self::setAjaxMode();

    $cardId = self::getArg("cardId", AT_posint, true);
    $actions = self::getArg("actions", AT_json, true);
    $this->validateJsonAction($actions);

    $this->game->changeAnytimeCardPlay($cardId, $actions);

    self::ajaxResponse();
  }

  public function phase2DraftKeepCards()
  {
    self::setAjaxMode();

    $cardIdsString = trim(self::getArg("card_ids", AT_numberlist, true));

    if (substr($cardIdsString, -1) == ',') {
      $cardIdsString = substr($cardIdsString, 0, -1);
    }

    if ($cardIdsString == '') {
      $cardIds = [];
    } else {
      $cardIds = explode(',', $cardIdsString);
    }

    $this->game->phase2DraftKeepCards($cardIds);
    self::ajaxResponse();
  }

  public function familyKeepLessonCards()
  {
    self::setAjaxMode();

    $cardIdsString = trim(self::getArg("card_ids", AT_numberlist, true));

    if (substr($cardIdsString, -1) == ',') {
      $cardIdsString = substr($cardIdsString, 0, -1);
    }

    if ($cardIdsString == '') {
      $cardIds = [];
    } else {
      $cardIds = explode(',', $cardIdsString);
    }

    $this->game->familyKeepLessonCards($cardIds);
    self::ajaxResponse();
  }

  public function phase2BuyCards()
  {
    self::setAjaxMode();

    $actionArray = self::getArg("actions", AT_json, true);
    $this->validateJsonAction($actionArray);

    $this->game->phase2BuyCards($actionArray);

    self::ajaxResponse();
  }

  public function phase4PlayRescueCards()
  {
    self::setAjaxMode();

    $cardIdsString = trim(self::getArg("card_ids", AT_numberlist, true));

    if (substr($cardIdsString, -1) == ',') {
      $cardIdsString = substr($cardIdsString, 0, -1);
    }

    if ($cardIdsString == '') {
      $cardIds = [];
    } else {
      $cardIds = explode(',', $cardIdsString);
    }

    $this->game->phase4PlayRescueCards($cardIds);
    self::ajaxResponse();
  }

  public function phase4Pass()
  {
    self::setAjaxMode();

    $actionArray = self::getArg("actions", AT_json, true);
    $this->validateJsonAction($actionArray);

    $this->game->phase45PassAnytimeCard($actionArray);
    $this->game->phase4Pass();

    self::ajaxResponse();
  }

  public function phase4ConfirmActions()
  {
    self::setAjaxMode();

    $actionArray = self::getArg("actions", AT_json, true);
    $this->validateJsonAction($actionArray);

    $this->game->phase4ConfirmActions($actionArray);
    $this->game->phase4EndTurn();

    self::ajaxResponse();
  }

  public function phase5Pass()
  {
    self::setAjaxMode();

    $actionArray = self::getArg("actions", AT_json, true);
    $this->validateJsonAction($actionArray);

    $this->game->phase45PassAnytimeCard($actionArray);
    $this->game->phase5Pass();

    self::ajaxResponse();
  }

  public function phase5ConfirmActions()
  {
    self::setAjaxMode();

    $actionArray = self::getArg("actions", AT_json, true);
    $this->validateJsonAction($actionArray);

    $this->game->phase5ConfirmActions($actionArray);
    $this->game->phase5EndTurn();

    self::ajaxResponse();
  }

  public function playAnytimeCard()
  {
    self::setAjaxMode();

    $cardId = self::getArg("cardId", AT_posint, true);
    $actionArray = self::getArg("actions", AT_json, true);
    $this->validateJsonAction($actionArray);

    $this->game->phaseAnytimeCardConfirmActions($actionArray);
    $this->game->playAnytimeCard($cardId);

    self::ajaxResponse();
  }

  public function phaseAnytimeBuyCards()
  {
    self::setAjaxMode();

    $actionArray = self::getArg("actions", AT_json, true);
    $this->validateJsonAction($actionArray);

    $this->game->phaseAnytimeBuyCards($actionArray);

    self::ajaxResponse();
  }

  public function phaseAnytimeDrawAndBoatShapeConfirmActions()
  {
    self::setAjaxMode();

    $actionArray = self::getArg("actions", AT_json, true);
    $this->validateJsonAction($actionArray);

    $this->game->phaseAnytimeDrawAndBoatShapeConfirmActions($actionArray);

    self::ajaxResponse();
  }

  public function phaseAnytimePlaceFieldShape()
  {
    self::setAjaxMode();

    $field = self::getArg("field", AT_enum, true, null, FIELD_LIST);

    $this->game->phaseAnytimePlaceFieldShape($field);

    self::ajaxResponse();
  }

  public function phaseAnytimeRoundConfirm()
  {
    self::setAjaxMode();

    $actionArray = self::getArg("actions", AT_json, true);
    $this->validateJsonAction($actionArray);

    $this->game->phaseAnytimeRoundConfirm($actionArray);

    self::ajaxResponse();
  }

  public function familyPass()
  {
    self::setAjaxMode();

    $this->game->familyPass();

    self::ajaxResponse();
  }

  public function familyConfirmActions()
  {
    self::setAjaxMode();

    $actionArray = self::getArg("actions", AT_json, true);
    $this->validateJsonAction($actionArray);

    $this->game->familyConfirmActions($actionArray);

    self::ajaxResponse();
  }

  private function validateJsonAction($actionArray)
  {
    if (!$this->isSequentialArray($actionArray))
      throw new BgaVisibleSystemException("BUG! actions is not an array");

    foreach ($actionArray as $action) {
      if (!$this->isAssociativelArray($action))
        throw new BgaVisibleSystemException("BUG! action is not an array");

      foreach ($action as $key => $value) {
        if (!is_string($key))
          throw new BgaVisibleSystemException("BUG! key is not a string");
        if (!is_null($value) && !is_numeric($value) && !is_bool($value))
          throw new BgaVisibleSystemException("BUG! value is not a int for key $key");
      }
      if (!array_key_exists('actionTypeId', $action))
        throw new BgaVisibleSystemException("BUG! action does not have actionTypeId");
    }
  }

  private function isSequentialArray($arr)
  {
    return (is_array($arr) && (count($arr) == 0 || array_keys($arr) === range(0, count($arr) - 1)));
  }

  private function isAssociativelArray($arr)
  {
    return (is_array($arr) && (count($arr) == 0 || array_keys($arr) !== range(0, count($arr) - 1)));
  }
}
