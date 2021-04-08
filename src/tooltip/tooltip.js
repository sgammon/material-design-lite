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

goog.require('componentHandler.register');
goog.require('componentHandler.xid');
goog.require('goog.events.EventType');

goog.provide('material.MaterialTooltip');


/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
const MaterialTooltipCssClasses_ = {
  IS_ACTIVE: goog.getCssName('is-active'),
  BOTTOM: goog.getCssName('mdl-tooltip--bottom'),
  LEFT: goog.getCssName('mdl-tooltip--left'),
  RIGHT: goog.getCssName('mdl-tooltip--right'),
  TOP: goog.getCssName('mdl-tooltip--top')
};

/**
 * Class constructor for Tooltip MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
material.MaterialTooltip = function MaterialTooltip(element) {
  /**
   * HTML element to root this tooltip to.
   *
   * @const
   * @private
   * @type {!HTMLElement}
   */
  this.element_ = element;

  /**
   * Whether the mouse is considered hovering over the target
   * element.
   *
   * @private
   * @type {!boolean}
   */
  this.hovering_ = false;

  const forElId = this.element_.getAttribute('for') ||
    this.element_.getAttribute('data-mdl-for');

  /**
   * Stores the element for which this tooltip is providing UI.
   *
   * @const
   * @private
   * @type {?HTMLElement}
   */
  this.forElement_ = forElId ?
    /** @type {?HTMLElement} */ (document.getElementById(forElId))
    : null;

  if (this.forElement_) {
    // It's left here because it prevents accidental text selection on Android
    if (!this.forElement_.hasAttribute('tabindex')) {
      this.forElement_.setAttribute('tabindex', '0');
    }

    this.boundMouseEnterHandler = this.handleMouseEnter_.bind(this);
    this.boundMouseLeaveAndScrollHandler = this.hideTooltip_.bind(this);
    this.forElement_.addEventListener(goog.events.EventType.MOUSEENTER,
      /** @type {!function(!Event): void} */ (this.boundMouseEnterHandler), false);
    this.forElement_.addEventListener(goog.events.EventType.TOUCHEND,
      /** @type {!function(!Event): void} */ (this.boundMouseEnterHandler), false);
    this.forElement_.addEventListener(goog.events.EventType.MOUSELEAVE,
      /** @type {!function(!Event): void} */ (this.boundMouseLeaveAndScrollHandler), false);
    window.addEventListener(goog.events.EventType.SCROLL,
      /** @type {!function(!Event): void} */ (this.boundMouseLeaveAndScrollHandler), true);
    window.addEventListener(goog.events.EventType.TOUCHSTART,
      /** @type {!function(!Event): void} */ (this.boundMouseLeaveAndScrollHandler));
  }
};

/**
 * Handle mouseenter for tooltip.
 *
 * @param {!MouseEvent} event The event that fired.
 * @private
 */
material.MaterialTooltip.prototype.handleMouseEnter_ = function(event) {
  const targetEl = /** @type {!HTMLElement} */ (event.target);
  const props = targetEl.getBoundingClientRect();
  const left = props.left + (props.width / 2);
  const top = props.top + (props.height / 2);
  const marginLeft = -1 * (this.element_.offsetWidth / 2);
  const marginTop = -1 * (this.element_.offsetHeight / 2);
  this.hovering_ = true;

  if (this.element_.classList.contains(MaterialTooltipCssClasses_.LEFT) ||
      this.element_.classList.contains(MaterialTooltipCssClasses_.RIGHT)) {
    if (top + marginTop < 0) {
      this.element_.style.top = '0';
      this.element_.style.marginTop = '0';
    } else {
      this.element_.style.top = top + 'px';
      this.element_.style.marginTop = marginTop + 'px';
    }
  } else {
    if (left + marginLeft < 0) {
      this.element_.style.left = '0';
      this.element_.style.marginLeft = '0';
    } else {
      this.element_.style.left = left + 'px';
      this.element_.style.marginLeft = marginLeft + 'px';
    }
  }

  if (this.element_.classList.contains(MaterialTooltipCssClasses_.TOP)) {
    this.element_.style.top = props.top - this.element_.offsetHeight - 10 + 'px';
  } else if (this.element_.classList.contains(MaterialTooltipCssClasses_.RIGHT)) {
    this.element_.style.left = props.left + props.width + 10 + 'px';
  } else if (this.element_.classList.contains(MaterialTooltipCssClasses_.LEFT)) {
    this.element_.style.left = props.left - this.element_.offsetWidth - 10 + 'px';
  } else {
    this.element_.style.top = props.top + props.height + 10 + 'px';
  }

  let delay = 200;
  if (this.element_.hasAttribute('data-tooltip-delay')) {
    delay = parseInt(this.element_.getAttribute('data-tooltip-delay'), 10);
  }

  setTimeout((function() {
    if (this.hovering_ === true) {
      window.requestAnimationFrame((function() {
        this.element_.classList.add(MaterialTooltipCssClasses_.IS_ACTIVE);
      }).bind(this));
    }
  }).bind(this), delay);
};

/**
 * Hide tooltip on mouseleave or scroll
 *
 * @private
 */
material.MaterialTooltip.prototype.hideTooltip_ = function() {
  this.hovering_ = false;
  window.requestAnimationFrame((function() {
    this.element_.classList.remove(MaterialTooltipCssClasses_.IS_ACTIVE);
  }).bind(this));
};


componentHandler.register({
  constructor: material.MaterialTooltip,
  classAsString: componentHandler.xid('MaterialTooltip'),
  cssClass: goog.getCssName('mdl-tooltip')
});
