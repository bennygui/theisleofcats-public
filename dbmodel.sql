-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- theisleofcats implementation : © Guillaume Benny bennygui@gmail.com
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

ALTER TABLE `player` ADD `player_color_name` varchar(10) NOT NULL DEFAULT '';
ALTER TABLE `player` ADD `boat_color_name` varchar(10) NOT NULL DEFAULT '';
ALTER TABLE `player` ADD `player_cat_order` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `fish_count` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `next_draft_player_id` int(10) unsigned NULL;
ALTER TABLE `player` ADD `player_pass` boolean NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `player_played_anytime_round` boolean NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_rats` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_unfilled_rooms` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_cat_familly` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_rare_treasure` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_private_lessons` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_public_lessons` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_solo_color_1` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_solo_color_2` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_solo_color_3` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_solo_color_4` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_solo_color_5` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_solo_lessons` smallint(5) NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `score_solo_player` smallint(5) NOT NULL DEFAULT 0;

-- Shapes are all common treasures, rare treasures, oshax and cats
CREATE TABLE IF NOT EXISTS `shape` (
  -- unique id with no meaning 
  `shape_id` smallint(5) unsigned NOT NULL,
  -- common treasures, rare treasures, oshax and cats
  `shape_type_id` smallint(5) unsigned NOT NULL,
  -- color (for cats only, for oshax once in boat, null otherwise)
  `color_id` smallint(5) unsigned NULL,
  -- shape from static shape definition
  `shape_def_id` smallint(5) unsigned NOT NULL,
  -- bag, table, boat, discard
  `shape_location_id` smallint(5) unsigned NOT NULL,
  -- order of the shapes in the bag, null if location is not bag
  `bag_order` smallint(5) unsigned NULL,
  -- player that has this shape, null if location is not boat
  `player_id` int(10) unsigned NULL,
  -- top corner in the boat, null if location is not boat
  `boat_top_x` smallint(5) unsigned NULL,
  -- top corner in the boat, null if location is not boat
  `boat_top_y` smallint(5) unsigned NULL,
  -- rotation (0, 90, 180, 270) in the boat, null if location is not boat
  `boat_rotation` smallint(5) unsigned NULL,
  -- flipped horizontal if true, null if location is not boat
  `boat_horizontal_flip` boolean NULL,
  -- flipped vertical if true, null if location is not boat
  `boat_vertical_flip` boolean NULL,
  -- Number to know what shape was played since last turn
  `played_move_number` int(10) unsigned NULL,
  -- Number to know the order of the shapes in solo mode
  `solo_order` int(10) unsigned NULL,
  PRIMARY KEY (`shape_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Baskets are permanent baskets owned by players
CREATE TABLE IF NOT EXISTS `basket` (
  -- unique id with no meaning 
  `basket_id` smallint(5) unsigned NOT NULL,
  -- player that has this basket
  `player_id` int(10) unsigned NOT NULL,
  -- true if the basket was used in the day
  `used` boolean NOT NULL,
  -- true if the basket was discarded
  `discarded` boolean NOT NULL,
  PRIMARY KEY (`basket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Cards are the cards that are in the deck, drafted and played
CREATE TABLE IF NOT EXISTS `card` (
  -- unique id, this is the card number
  `card_id` smallint(5) unsigned NOT NULL,
  -- location of the card: deck, player_draft, player_hand, player_table, discard
  `card_location_id` smallint(5) unsigned NOT NULL,
  -- order of the card in the deck
  `deck_order` smallint(5) unsigned NOT NULL,
  -- player that has this card, if location is not deck
  `player_id` int(10) unsigned NULL,
  -- color (for some public lesson cards only, null otherwise)
  `color_id` smallint(5) unsigned NULL,
  -- true if the card is to go on the table but is not visible to other players yet
  `player_private` boolean NOT NULL,
  -- move where the card was played
  `played_move_number` int(10) unsigned NULL,
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Actions are the state of the actions of the player
CREATE TABLE IF NOT EXISTS `turn_action` (
  -- This row is for this player
  `player_id` int(10) unsigned NOT NULL,

  -- Number of cats allowed to rescue this turn
  `allowed_cat_count` smallint(5) unsigned NOT NULL,
  -- Number of cats rescued this turn
  `take_cat_count` smallint(5) unsigned NOT NULL,

  -- Number of common treasure allowed to take
  `allowed_common_treasure_count` smallint(5) unsigned NOT NULL,
  -- Number of common treasure allowed to take
  `take_common_treasure_count` smallint(5) unsigned NOT NULL,

  -- Number of rare treasure allowed to take (can be converted to 2 common)
  `allowed_rare_treasure_count` smallint(5) unsigned NOT NULL,
  -- Number of rare common treasure allowed to take (can be converted to 2 common)
  `take_rare_treasure_count` smallint(5) unsigned NOT NULL,

  -- Number of small treasure allowed to take (can be converted to 2 common with 1 fish)
  `allowed_small_treasure_count` smallint(5) unsigned NOT NULL,
  -- Number of small common treasure allowed to take (can be converted to 2 common with 1 fish)
  `take_small_treasure_count` smallint(5) unsigned NOT NULL,

  -- Number of played rare finds card
  `played_rare_finds_count` smallint(5) unsigned NOT NULL,

  -- Number of allowed to put next shape anywhere
  `allowed_next_shape_anywhere` smallint(5) unsigned NOT NULL,
  -- Number of taken shape when 'allowed_next_shape_anywhere' was 1
  `take_next_shape_anywhere` smallint(5) unsigned NOT NULL,

  -- Number of allowed extra cats to rescue
  `allowed_rescue_extra_cat` smallint(5) unsigned NOT NULL,

  -- Last seen move number to know what shape was played since last turn
  `last_seen_move_number` int(10) unsigned DEFAULT 0,

  PRIMARY KEY (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Stack of state and player to jump to when the current state is over
CREATE TABLE IF NOT EXISTS `state_stack` (
  -- The order in the stack: the lower, the older
  `stack_no` smallint(5) unsigned NOT NULL,
  -- player to switch to if required
  `player_id` int(10) unsigned NULL,
  -- state to switch to
  `state_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`stack_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Player preferences
CREATE TABLE IF NOT EXISTS `player_preference` (
  `player_id` int(10) NOT NULL,
  `pref_id` int(10) NOT NULL,
  `pref_value` int(10) NOT NULL,
  PRIMARY KEY (`player_id`, `pref_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Action log
CREATE TABLE IF NOT EXISTS `action_log` (
  `id` int(10) unsigned NOT NULL,
  `player_id` int(10) unsigned NOT NULL,
  `move_number` int(10) unsigned NOT NULL,
  `state` int(10) unsigned NOT NULL,
  `type` varchar(20) NOT NULL,
  `action` varchar(1024) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Anytime card play preference
CREATE TABLE IF NOT EXISTS `player_anytime_pref` (
  -- The preference is for this player
  `player_id` int(10) unsigned NOT NULL,
  -- The preference is for this card
  `card_id` smallint(10) unsigned NOT NULL,
  -- Which state to ask to play
  `state_id` smallint(10) unsigned NOT NULL,
  -- For states that are not multiplayer, we must know which player
  `state_player_id` int(10) unsigned NULL,
  UNIQUE (`player_id`, `card_id`, `state_id`, `state_player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Cards end score
CREATE TABLE IF NOT EXISTS `card_end_score` (
  -- unique id, this is the card number
  `card_id` smallint(5) unsigned NOT NULL,
  -- player that has this card
  `player_id` int(10) unsigned NOT NULL,
  -- move where the card was played
  `score` int(10) NOT NULL,
  PRIMARY KEY (`card_id`, `player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;