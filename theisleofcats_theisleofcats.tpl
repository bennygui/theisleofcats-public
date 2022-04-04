{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- theisleofcats implementation : © Guillaume Benny bennygui@gmail.com
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------
-->

<div id="tioc-warn-last-turn" class="tioc-top-warning tioc-hidden">
    <div>{WARN_LAST_TURN_TEXT}</div>
</div>

<div id="tioc-score-table-wrap">
    <table id="tioc-score-table" class="tioc-hidden">
        <thead>
        </thead>
        <tbody>
        </tbody>
    </table>
    <table id="tioc-score-table-solo" class="tioc-hidden">
        <thead>
        </thead>
        <tbody>
        </tbody>
    </table>
</div>
<div id="tioc-island-and-field-container">
    <div id="tioc-island-row">
        <div id="tioc-left-field"></div>
        <div id="tioc-island-container">
            <div id="tioc-island">
                <div class="tioc-grid" id="tioc-island-player-order-1"></div>
                <div class="tioc-grid" id="tioc-island-player-order-2"></div>
                <div class="tioc-grid" id="tioc-island-player-order-3"></div>
                <div class="tioc-grid" id="tioc-island-player-order-4"></div>
                <div class="tioc-grid" id="tioc-island-day-5"></div>
                <div class="tioc-grid" id="tioc-island-day-4"></div>
                <div class="tioc-grid" id="tioc-island-day-3"></div>
                <div class="tioc-grid" id="tioc-island-day-2"></div>
                <div class="tioc-grid" id="tioc-island-day-1"></div>
                <div class="tioc-grid" id="tioc-island-day-0"></div>
                <div class="tioc-grid" id="tioc-island-discard"></div>
            </div>
            <div id="tioc-common-treasure-container">
                <div id="tioc-common-treasure-zone-100"></div>
                <div id="tioc-common-treasure-zone-101"></div>
                <div id="tioc-common-treasure-zone-102"></div>
                <div id="tioc-common-treasure-zone-103"></div>
            </div>
        </div>
        <div id="tioc-right-field"></div>
    </div>
    <div id="tioc-island-row-bottom">
        <div id="tioc-left-field-bottom"></div>
        <div id="tioc-field-bottom-middle"></div>
        <div id="tioc-right-field-bottom"></div>
    </div>
    <div id="tioc-rare-treasure-container"></div>
    <div id="tioc-oshax-container"></div>
    <div class="tioc-card-container-wrap">
        <div class="tioc-card-container-title tioc-card-container-title-no-auto-open">{PLAYED_DISCARD} (<span class="tioc-card-container-count">0</span>) <span class="tioc-card-container-toggle">&#x25bf;</span></div>
        <div class="tioc-hidden" id="tioc-played-discard-container"></div>
    </div>
    <div class="tioc-card-container-wrap">
        <div class="tioc-card-container-title">{SOLO_LESSONS} (<span class="tioc-card-container-count">0</span>) <span class="tioc-card-container-toggle">&#x25bf;</span></div>
        <div id="tioc-solo-lesson-container"></div>
    </div>
    <div class="tioc-card-container-wrap">
        <div class="tioc-card-container-title">{SOLO_COLORS} (<span class="tioc-card-container-count">0</span>) <span class="tioc-card-container-toggle">&#x25bf;</span></div>
        <div id="tioc-solo-color-container"></div>
    </div>
    <div class="tioc-card-container-wrap">
        <div class="tioc-card-container-title">{SOLO_BASKETS} (<span class="tioc-card-container-count">0</span>) <span class="tioc-card-container-toggle">&#x25bf;</span></div>
        <div id="tioc-solo-basket-container"></div>
    </div>
    <div class="tioc-card-container-wrap">
        <!--  Down: &#x25bf; Right: &#x25b9; -->
        <div class="tioc-card-container-title">{PUBLIC_LESSONS} (<span class="tioc-card-container-count">0</span>) <span class="tioc-card-container-toggle">&#x25bf;</span></div>
        <div id="tioc-public-lesson-container"></div>
    </div>
    <!-- BEGIN player-private-lessons -->
    <div class="tioc-card-container-wrap">
        <div class="tioc-card-container-title">{PRIVATE_LESSONS}: <span class="tioc-player-name" style='color: #{PLAYER_COLOR};'>{PLAYER_NAME}</span> (<span class="tioc-card-container-count">0</span>) <span class="tioc-card-container-toggle">&#x25bf;</span></div>
        <div id="tioc-player-card-private-lesson-container-{PLAYER_ID}" class="tioc-player-card-private-lesson-container"></div>
    </div>
    <!-- END player-private-lessons -->
</div>
<div id="slider"></div>
<div id="tioc-all-player-boat-row">
    <!-- BEGIN player-board -->
    <div id="tioc-player-board-{PLAYER_ID}" class="whiteblock">
        <div class="tioc-player-name-row">
            <h3 class="tioc-player-name" style='color: #{PLAYER_COLOR};'>{PLAYER_NAME}</h3>
            <div class="tioc-family-hidden tioc-player-panel-pill">
                <div class="tioc-player-panel-fish"></div>
                <div class="tioc-player-panel-pill-counter" id="tioc-player-fish-counter-{PLAYER_ID}">0</div>
            </div>
        </div>
        <div class="tioc-card-container-wrap">
            <div class="tioc-card-container-title">{DRAFT} (<span class="tioc-card-container-count">0</span>) <span class="tioc-card-container-toggle">&#x25bf;</span></div>
            <div id="tioc-player-card-draft-container-{PLAYER_ID}" class="tioc-player-card-draft-container"></div>
        </div>
        <div class="tioc-card-container-wrap">
            <div class="tioc-card-container-title">{BUY} (<span class="tioc-card-container-count">0</span>) <span class="tioc-card-container-toggle">&#x25bf;</span></div>
            <div id="tioc-player-card-buy-container-{PLAYER_ID}" class="tioc-player-card-buy-container"></div>
        </div>
        <div class="tioc-card-container-wrap">
            <div class="tioc-card-container-title">{HAND} (<span class="tioc-card-container-count">0</span>) <span class="tioc-card-container-toggle">&#x25bf;</span></div>
            <div id="tioc-player-card-hand-container-{PLAYER_ID}" class="tioc-player-card-hand-container"></div>
        </div>
        <div class="tioc-card-container-wrap">
            <div class="tioc-card-container-title">{TABLE} (<span class="tioc-card-container-count">0</span>) <span class="tioc-card-container-toggle">&#x25bf;</span></div>
            <div id="tioc-player-card-table-container-{PLAYER_ID}" class="tioc-player-card-table-container"></div>
        </div>
        <div class="tioc-basket-private-lesson-boat-wrap">
            <div id="tioc-player-permanent-basket-container-{PLAYER_ID}" class="tioc-player-permanent-basket-container"></div>
            <div class="tioc-private-lesson-boat-wrap">
                <div class="tioc-player-top-shapes-boat-wrap">
                    <div class="tioc-player-boat-wrap-wrap">
                        <div class="tioc-player-boat-wrap">
                            <div id="tioc-top-shapes-{PLAYER_ID}" class="tioc-top-shapes tioc-hidden">
                                <div id="tioc-top-shapes-left-{PLAYER_ID}"></div>
                                <div id="tioc-top-shapes-middle-{PLAYER_ID}" class="tioc-top-shapes-middle"></div>
                                <div id="tioc-top-shapes-right-{PLAYER_ID}"></div>
                            </div>
                            <div id="tioc-player-boat-{PLAYER_ID}" class="tioc-player-boat {BOAT_COLOR_NAME}">
                                <a href="#" class="action-button bgabutton bgabutton_blue tioc-player-boat-hide-overlay" onclick="return false;" id="tioc-player-boat-hide-overlay-{PLAYER_ID}" data-player-id="{PLAYER_ID}"></a>
                                <a href="#" class="action-button bgabutton bgabutton_blue tioc-player-boat-hide-shapes" onclick="return false;" id="tioc-player-boat-hide-shapes-{PLAYER_ID}" data-player-id="{PLAYER_ID}"></a>
                                <div class="tioc-player-boat-legend-score" id="tioc-player-boat-legend-score-{PLAYER_ID}"></div>
                                <div class="tioc-player-boat-legend-round" id="tioc-player-boat-legend-round-{PLAYER_ID}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- END player-board -->
</div>

<div class="tioc-card-container-wrap">
    <div class="tioc-card-container-title">{COLOR_REF} <span class="tioc-card-container-toggle">&#x25b9;</span></div>
    <div class="tioc-hidden" id="tioc-color-ref-container">
        <div id="tioc-color-ref-cat"></div>
        <div id="tioc-color-ref-map"></div>
    </div>
</div>

<pre id="tioc-onerror-text" class="tioc-hidden"></pre>

<script type="text/javascript">
    // Javascript HTML templates

    /*
    // Example:
    var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}"></div>';

    */
    var jstpl_shape_grid = '<div class="tioc-grid x_${x}_y_${y}" id="tioc-grid-id-${grid_id}" data-x="${x}" data-y="${y}" data-valid-grid="${valid_grid}" style="left: ${x_px}px; top: ${y_px}px;"></div>';
    var jstpl_grid_overlay = '<div class="tioc-grid-overlay" id="tioc-grid-overlay-${player_id}-${x}-${y}" data-x="${x}" data-y="${y}" style="left: ${x_px}px; top: ${y_px}px;"></div>';
    var jstpl_meeple_cat = '<div class="tioc-meeple cat ${color_name}"></div>';
    var jstpl_card_end_score = '<div class="tioc-card-end-score" style="${style}">+${score}</div>';
    var jstpl_meeple_cat_order = '<div class="tioc-meeple cat ${color_name}" id="tioc-meeple-cat-order-${player_id}"></div>';
    var jstpl_meeple_boat = '<div class="tioc-meeple boat small" id="tioc-vesh-boat"></div>';
    var jstpl_shape = '<div class="tioc-shape shape-type-${shape_type_id} ${color_name} shape-def-${shape_def_id}" id="tioc-shape-id-${shape_id}" data-shape-id="${shape_id}"></div>';
    var jstpl_shape_for_log = '<div class="tioc-shape shape-type-${shape_type_id} ${color_name} shape-def-${shape_def_id}" data-shape-id="${shape_id}"></div>';
    var jstpl_card = '<div class="tioc-card tioc-card-id-${card_id}" id="tioc-card-id-${card_id}" data-card-id="${card_id}"></div>';
    var jstpl_basket = '<div class="tioc-basket ${used_class}" id="tioc-basket-id-${basket_id}" data-basket-id="${basket_id}" data-basket-used="${used_bool}"></div>';
    var jstpl_button = '<a href="#" class="action-button bgabutton bgabutton_blue" onclick="return false;" id="${id}"></a>';
    var jstpl_phase_4_icon = '<div class="tioc-phase-4-icon"></div>';
    var jstpl_phase_5_icon = '<div class="tioc-phase-5-icon"></div>';
    var jstpl_phase_anytime_icon = '<div class="tioc-phase-anytime-icon"></div>';
    var jstpl_shape_controls =
        '<div id="tioc-shape-controls">' +
        '   <div id="tioc-shape-controls-shape">' +
        '   </div>' +
        '   <div id="tioc-shape-controls-container">' +
        '      <div class="tioc-shape-control-arrow-container" id="tioc-shape-control-arrow-container-left">' +
        '         <div class="tioc-shape-control-arrow" id="tioc-shape-control-arrow-left"></div>' +
        '      </div>' +
        '      <div class="tioc-shape-control-arrow-container" id="tioc-shape-control-arrow-container-right">' +
        '         <div class="tioc-shape-control-arrow" id="tioc-shape-control-arrow-right"></div>' +
        '      </div>' +
        '      <div class="tioc-shape-control-arrow-container" id="tioc-shape-control-arrow-container-up">' +
        '         <div class="bgabutton bgabutton_blue" id="tioc-shape-control-button-confirm"></div>' +
        '         <div class="tioc-shape-control-arrow" id="tioc-shape-control-arrow-up"></div>' +
        '      </div>' +
        '      <div class="tioc-shape-control-arrow-container" id="tioc-shape-control-arrow-container-down">' +
        '         <div class="tioc-shape-control-arrow" id="tioc-shape-control-arrow-down"></div>' +
        '      </div>' +
        '      <div class="tioc-shape-control-arrow-container" id="tioc-shape-control-arrow-container-flip-h">' +
        '         <div class="tioc-shape-control-arrow" id="tioc-shape-control-arrow-flip-h"></div>' +
        '      </div>' +
        '      <div class="tioc-shape-control-arrow-container" id="tioc-shape-control-arrow-container-flip-v">' +
        '         <div class="tioc-shape-control-arrow" id="tioc-shape-control-arrow-flip-v"></div>' +
        '      </div>' +
        '      <div class="tioc-shape-control-arrow-container" id="tioc-shape-control-arrow-container-rotate-cw">' +
        '         <div class="tioc-shape-control-arrow" id="tioc-shape-control-arrow-rotate-cw"></div>' +
        '      </div>' +
        '      <div class="tioc-shape-control-arrow-container" id="tioc-shape-control-arrow-container-rotate-ccw">' +
        '         <div class="tioc-shape-control-arrow" id="tioc-shape-control-arrow-rotate-ccw"></div>' +
        '      </div>' +
        '   </div>' +
        '</div>';
    var jstpl_top_shapes_grid_parent = '<div class="tioc-top-shapes-parent" id="tioc-top-shapes-shape-id-${shape_id}" style="grid-template-columns: repeat(${nb_columns}, 1fr);">${html}</div>';
    var jstpl_top_shapes_grid_filled = '<div class="tioc-top-shapes-grid tioc-filled ${color}"></div>';
    var jstpl_top_shapes_grid_empty = '<div class="tioc-top-shapes-grid"></div>';
    var jstpl_player_panel =
        '<div class="tioc-player-panel-row">' +
        '   <div class="tioc-player-panel-pill-counter big" id="tioc-player-panel-order-${player_id}">0</div>' +
        '   <div class="tioc-family-hidden tioc-meeple cat ${color_name}" id="tioc-player-panel-cat-${player_id}"></div>' +
        '   <div class="tioc-family-hidden tioc-player-panel-draft"></div>' +
        '   <div class="tioc-family-hidden tioc-meeple cat small ${next_player_color_name}" id="tioc-player-panel-next-player-cat-${player_id}"></div>' +
        '</div>' +
        '<div class="tioc-family-hidden tioc-player-panel-row tioc-break">' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-fish"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-fish-counter-${player_id}">0</div>' +
        '   </div>' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-card"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-card-counter-${player_id}">0</div>' +
        '   </div>' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-card-table"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-table-card-counter-${player_id}">0</div>' +
        '   </div>' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-basket-remain"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-basket-remain-counter-${player_id}">0</div>' +
        '   </div>' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-basket-permanent"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-basket-permanent-counter-${player_id}">0</div>' +
        '   </div>' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-private-lesson"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-private-lesson-counter-${player_id}">0</div>' +
        '   </div>' +
        '</div>' +
        '<div class="tioc-player-panel-row tioc-compact">' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-shape-face-blue"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-shape-face-blue-${player_id}">0</div>' +
        '   </div>' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-shape-face-green"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-shape-face-green-${player_id}">0</div>' +
        '   </div>' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-shape-face-orange"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-shape-face-orange-${player_id}">0</div>' +
        '   </div>' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-shape-face-purple"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-shape-face-purple-${player_id}">0</div>' +
        '   </div>' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-shape-face-red"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-shape-face-red-${player_id}">0</div>' +
        '   </div>' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-shape-face-common"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-shape-face-common-${player_id}">0</div>' +
        '   </div>' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-shape-face-rare"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-shape-face-rare-${player_id}">0</div>' +
        '   </div>' +
        '   <div class="tioc-player-panel-pill">' +
        '      <div class="tioc-player-panel-shape-face-oshax"></div>' +
        '      <div class="tioc-player-panel-pill-counter" id="tioc-player-panel-shape-face-oshax-${player_id}">0</div>' +
        '   </div>' +
        '</div>' +
        '<div class="tioc-player-panel-row">' +
        '   <div id="tioc-player-panel-boat-container-${player_id}" class="tioc-player-panel-boat-container">' +
        '   </div>' +
        '</div>' +
        '<div class="tioc-player-panel-insert-point">' +
        '</div>' +
        '';
    var jstpl_current_player_panel =
        '<div class="tioc-player-panel-row tioc-player-panel-align-end">' +
        '   <div id="tioc-player-panel-gear" class="tioc-gear"></div>' +
        '</div>' +
        '<div id="tioc-player-panel-preferences" class="tioc-player-panel-row tioc-player-panel-wrap tioc-hidden">' +
        '   <div class="tioc-player-panel-preference">${preference_startmessage_title}</div>' +
        '   <div>' +
        '      <select id="tioc-player-panel-preference-startmessage" class="tioc-player-panel-preference">' +
        '         <option value="0">${preference_startmessage_option_0}</option>' +
        '         <option value="1">${preference_startmessage_option_1}</option>' +
        '      </select>' +
        '   </div>' +
        '' +
        '   <div class="tioc-family-hidden tioc-player-panel-preference">${preference_auto_pass_title}</div>' +
        '   <div class="tioc-family-hidden">' +
        '      <select id="tioc-player-panel-preference-auto-pass" class="tioc-player-panel-preference">' +
        '         <option value="0">${preference_auto_pass_option_0}</option>' +
        '         <option value="1">${preference_auto_pass_option_1}</option>' +
        '      </select>' +
        '      <div id="tioc-player-panel-preference-auto-pass-help" class="tioc-player-panel-preference-help"></div>' +
        '   </div>' +
        '' +
        '   <div class="tioc-player-panel-preference">${preference_small_shapes_title}</div>' +
        '   <div>' +
        '      <select id="tioc-player-panel-preference-small-shapes" class="tioc-player-panel-preference">' +
        '         <option value="0">${preference_small_shapes_option_0}</option>' +
        '         <option value="1">${preference_small_shapes_option_1}</option>' +
        '         <option value="2">${preference_small_shapes_option_2}</option>' +
        '      </select>' +
        '      <div id="tioc-player-panel-preference-small-shapes-help" class="tioc-player-panel-preference-help"></div>' +
        '   </div>' +
        '' +
        '   <div class="tioc-family-hidden tioc-player-panel-preference">${preference_askwhentoplay_title}</div>' +
        '   <div class="tioc-family-hidden">' +
        '      <select id="tioc-player-panel-preference-askwhentoplay" class="tioc-player-panel-preference">' +
        '         <option value="0">${preference_askwhentoplay_option_0}</option>' +
        '         <option value="1">${preference_askwhentoplay_option_1}</option>' +
        '         <option value="2">${preference_askwhentoplay_option_2}</option>' +
        '      </select>' +
        '      <div id="tioc-player-panel-preference-askwhentoplay-help" class="tioc-player-panel-preference-help"></div>' +
        '   </div>' +
        '' +
        '   <div class="tioc-player-panel-preference">${preference_scale_island_title}</div>' +
        '   <div>' +
        '      <select id="tioc-player-panel-preference-scale-island" class="tioc-player-panel-preference">' +
        '      </select>' +
        '   </div>' +
        '' +
        '   <div class="tioc-player-panel-preference">${preference_scale_cards_title}</div>' +
        '   <div>' +
        '      <select id="tioc-player-panel-preference-scale-cards" class="tioc-player-panel-preference">' +
        '      </select>' +
        '   </div>' +
        '' +
        '   <div class="tioc-player-panel-preference">${preference_scale_other_boat_title}</div>' +
        '   <div>' +
        '      <select id="tioc-player-panel-preference-scale-other-boat" class="tioc-player-panel-preference">' +
        '      </select>' +
        '   </div>' +
        '' +
        '   <div class="tioc-player-panel-preference">${preference_scale_player_boat_title}</div>' +
        '   <div>' +
        '      <select id="tioc-player-panel-preference-scale-player-boat" class="tioc-player-panel-preference">' +
        '      </select>' +
        '   </div>' +
        '' +
        '   <div class="tioc-player-panel-preference">${preference_tooltips_title}</div>' +
        '   <div>' +
        '      <select id="tioc-player-panel-preference-tooltips" class="tioc-player-panel-preference">' +
        '         <option value="0">${preference_tooltips_option_0}</option>' +
        '         <option value="1">${preference_tooltips_option_1}</option>' +
        '      </select>' +
        '   </div>' +
        '</div>' +
        '';
    var jstpl_discard_played_card =
        '<div>' +
        '   <div>${card_html}</div>' +
        '   <div class="tioc-discard-played-text" data-move-number="${move_number}" style="color: #${player_color}">${player_name} #${move_number}</div>' +
        '</div>' +
        '';
    var jstpl_tooltip_shape =
        '${shape_html}' +
        '<h3>${title}</h3>' +
        '<p>${description}</p>' +
        '<p>${color}</p>' +
        '';
    var jstpl_tooltip_card =
        '${card_html}' +
        '<h3>${card_type} <small>(${card_id})</small></h3>' +
        '<p>${description}</p>' +
        '<p><i>${note}</i></p>' +
        '<p>${color}</p>' +
        '';
    var jstpl_tooltip_legend_score =
        '<div class="tioc-legend-score">' +
        '   <ol>' +
        '      <li>1. ${rats} (-1)</li>' +
        '      <li>2. ${rooms} (-5)</li>' +
        '      <li>3. ${cat_families}</li>' +
        '      <li>4. ${rare_treasure} (3)</li>' +
        '      <li>5. ${your_lessons}</li>' +
        '      <li>6. ${public_lessons}</li>' +
        '   </ol>' +
        '   <ol>' +
        '      <li>${families}</li>' +
        '      <li>3 = 8</li>' +
        '      <li>4 = 11</li>' +
        '      <li>5 = 15</li>' +
        '      <li>6 = 20</li>' +
        '      <li>7 = 25</li>' +
        '      <li>8 = 30</li>' +
        '      <li>9 = 35</li>' +
        '      <li>10 = 40</li>' +
        '   </ol>' +
        '</div>' +
        '';
    var jstpl_tooltip_legend_round =
        '<ol>' +
        '   <li>${title}</li>' +
        '   <li>${add_cats}</li>' +
        '   <li>1. ${fishing}</li>' +
        '   <li>2. ${explore}</li>' +
        '   <li>3. ${read_lessons}</li>' +
        '   <li>4. ${rescue_cats}</li>' +
        '   <li>5. ${rare_finds}</li>' +
        '   <li>${empty_fields}</li>' +
        '</ol>' +
        '';
    var jstpl_tooltip_legend_score_family =
        '<div class="tioc-legend-score">' +
        '   <ol>' +
        '      <li>1. ${rats} (-1)</li>' +
        '      <li>2. ${rooms} (-5)</li>' +
        '      <li>3. ${cat_families}</li>' +
        '      <li>4. ${your_lessons}</li>' +
        '   </ol>' +
        '   <ol>' +
        '      <li>${families}</li>' +
        '      <li>3 = 8</li>' +
        '      <li>4 = 11</li>' +
        '      <li>5 = 15</li>' +
        '      <li>6 = 20</li>' +
        '      <li>7 = 25</li>' +
        '      <li>8 = 30</li>' +
        '      <li>9 = 35</li>' +
        '      <li>10 = 40</li>' +
        '   </ol>' +
        '</div>' +
        '<p>${desc}</p>' +
        '';
    var jstpl_tooltip_legend_round_family =
        '<ol>' +
        '   <li>${title}</li>' +
        '   <li>${add_cats}</li>' +
        '   <li>${rescue_cats}</li>' +
        '   <li>${empty_fields}</li>' +
        '</ol>' +
        '';
</script>

{OVERALL_GAME_FOOTER}