/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global goog */

goog.require('goog.dom.TagName');
goog.require('goog.events.EventType');

goog.provide('material.MaterialTab');
goog.provide('material.MaterialTabs');


/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
const MaterialTabsCssClasses_ = {
  TAB_CLASS: goog.getCssName('mdl-tabs__tab'),
  PANEL_CLASS: goog.getCssName('mdl-tabs__panel'),
  ACTIVE_CLASS: goog.getCssName('is-active'),
  UPGRADED_CLASS: goog.getCssName('is-upgraded'),

  MDL_JS_RIPPLE_EFFECT: goog.getCssName('mdl-js-ripple-effect'),
  MDL_RIPPLE_CONTAINER: goog.getCssName('mdl-tabs__ripple-container'),
  MDL_RIPPLE: goog.getCssName('mdl-ripple'),
  MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS: goog.getCssName('mdl-js-ripple-effect--ignore-events')
};

/**
 * Class constructor for Tabs MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 * @param {number=} opt_selected Optional. Tab to select, by default.
 * @param {boolean=} opt_allow_unselected Optional. Allow un-selected state. Defaults to false.
 */
material.MaterialTabs = function MaterialTabs(element, opt_selected, opt_allow_unselected) {
  /**
   * Root element for this set of tabs.
   *
   * @const
   * @private
   * @type {!HTMLElement}
   */
  this.element_ = element;

  // Initialize instance.
  if (this.element_.classList.contains(MaterialTabsCssClasses_.MDL_JS_RIPPLE_EFFECT))
    this.element_.classList.add(MaterialTabsCssClasses_.MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS);

  // Select element tabs, document panels
  /**
   * Selects tab elements enclosed by the root element.
   *
   * @const
   * @private
   * @type {!NodeList<!HTMLAnchorElement>}
   */
  this.tabs_ = /** @type {!NodeList<!HTMLAnchorElement>} */ (
    this.element_.querySelectorAll('.' + MaterialTabsCssClasses_.TAB_CLASS));

  /**
   * Selects tab pane elements enclosed by the root element.
   *
   * @const
   * @private
   * @type {!NodeList<!HTMLElement>}
   */
  this.panels_ = /** @type {!NodeList<!HTMLElement>} */ (
    this.element_.querySelectorAll('.' + MaterialTabsCssClasses_.PANEL_CLASS));

  // Create new tabs for each tab element
  for (let i = 0; i < this.tabs_.length; i++) {
    new material.MaterialTab(this.tabs_[i], this, element);
  }

  this.element_.classList.add(MaterialTabsCssClasses_.UPGRADED_CLASS);

  if (opt_selected !== undefined && typeof opt_selected === 'number')
    this.setTab(opt_selected);
  else if (!opt_allow_unselected)
    this.setTab(0);
};

/**
 * Reset tab state, dropping active classes
 *
 * @private
 */
material.MaterialTabs.prototype.resetTabState_ = function() {
  for (let k = 0; k < this.tabs_.length; k++) {
    this.tabs_[k].classList.remove(MaterialTabsCssClasses_.ACTIVE_CLASS);
  }
};

/**
 * Reset panel state, dropping active classes
 *
 * @private
 */
material.MaterialTabs.prototype.resetPanelState_ = function() {
  for (let j = 0; j < this.panels_.length; j++) {
    this.panels_[j].classList.remove(MaterialTabsCssClasses_.ACTIVE_CLASS);
  }
};

/**
 * Set the active tab.
 *
 * @public
 * @param {!HTMLAnchorElement|number} tab The tab element or index to set active.
 */
material.MaterialTabs.prototype.setTab = function(tab) {
  const resolved = /** @type {!HTMLAnchorElement} */ (
    (typeof tab === 'number') ? /** @type {!HTMLAnchorElement} */ (this.tabs_[tab]) : tab);
  if (resolved && resolved.getAttribute('href').charAt(0) === '#') {
    const hrefValue = /** @type {?string} */ (resolved.href);
    if (!!hrefValue === true) {
      const href = /** @type {!string} */ (hrefValue.split('#')[1]);
      const panel = this.element_.querySelector('#' + href);

      if (panel) {
        this.resetTabState_();
        this.resetPanelState_();
        resolved.classList.add(MaterialTabsCssClasses_.ACTIVE_CLASS);
        panel.classList.add(MaterialTabsCssClasses_.ACTIVE_CLASS);
      }
    }
  }
};

/**
 * Constructor for an individual tab.
 *
 * @constructor
 * @param {!HTMLAnchorElement} tab The HTML element for the tab.
 * @param {!material.MaterialTabs} ctx The MaterialTabs object that owns the tab.
 * @param {!HTMLElement} container Element backing the MaterialTabs that contain this tab.
 */
material.MaterialTab = function MaterialTab(tab, ctx, container) {
  if (container.classList.contains(MaterialTabsCssClasses_.MDL_JS_RIPPLE_EFFECT)) {
    const spanTag = goog.dom.TagName.SPAN.toString();

    const rippleContainer = document.createElement(spanTag);
    rippleContainer.classList.add(MaterialTabsCssClasses_.MDL_RIPPLE_CONTAINER);
    rippleContainer.classList.add(MaterialTabsCssClasses_.MDL_JS_RIPPLE_EFFECT);
    const ripple = document.createElement(spanTag);
    ripple.classList.add(MaterialTabsCssClasses_.MDL_RIPPLE);
    rippleContainer.appendChild(ripple);
    tab.appendChild(rippleContainer);
  }

  tab.addEventListener(goog.events.EventType.CLICK, function(e) {
    if (tab.getAttribute('href').charAt(0) === '#') {
      e.preventDefault();
      ctx.setTab(tab);
    }
  });
};
