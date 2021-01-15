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

goog.provide('material.MaterialRipple');


/**
 * Store constants in one place so they can be updated easily.
 *
 * @enum {string}
 * @private
 */
const MaterialRippleConstant_ = {
  INITIAL_SCALE: 'scale(0.0001, 0.0001)',
  INITIAL_SIZE: '1px',
  INITIAL_OPACITY: '0.4',
  FINAL_OPACITY: '0',
  FINAL_SCALE: ''
};

/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
const MaterialRippleClasses_ = {
  RIPPLE_CENTER: goog.getCssName('mdl-ripple--center'),
  RIPPLE_EFFECT_IGNORE_EVENTS: goog.getCssName('mdl-js-ripple-effect--ignore-events'),
  RIPPLE: goog.getCssName('mdl-ripple'),
  IS_ANIMATING: goog.getCssName('is-animating'),
  IS_VISIBLE: goog.getCssName('is-visible')
};

/**
 * Class constructor for Ripple MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
material.MaterialRipple = function MaterialRipple(element) {
  /**
   * Element to attach this ripple effect to.
   *
   * @const
   * @private
   * @type {!HTMLElement}
   */
  this.element_ = element;

  const rect = this.element_.getBoundingClientRect();
  const recentering =
      this.element_.classList.contains(MaterialRippleClasses_.RIPPLE_CENTER);

  /**
   * Defines the ripple element, which will constitute the inner ripple.
   *
   * @const
   * @private
   * @type {?HTMLElement}
   */
  this.rippleElement_ = this.element_.classList.contains(
      MaterialRippleClasses_.RIPPLE_EFFECT_IGNORE_EVENTS) ? null : /** @type {!HTMLElement} */ (
        this.element_.querySelector('.' + MaterialRippleClasses_.RIPPLE));
  if (this.rippleElement_ === null && !this.element_.classList.contains(
    MaterialRippleClasses_.RIPPLE_EFFECT_IGNORE_EVENTS)) {
    console.error('[MDL]: Ripple inner element not found.', this.element_);
  }

  /**
   * @private
   * @type {number}
   */
  this.frameCount_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.rippleSize_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.boundHeight = rect.height;

  /**
   * @private
   * @type {number}
   */
  this.boundWidth = rect.width;


  /**
   * @private
   * @type {number}
   */
  this.x_ = 0;
  this.y_ = 0;

  /**
   * Touch start produces a compat mouse down event, which would cause a
   * second ripples. To avoid that, we use this property to ignore the first
   * mouse down after a touch start.
   *
   * @private
   * @type {!boolean}
   */
  this.ignoringMouseDown_ = false;

  this.boundDownHandler = this.downHandler_.bind(this);
  this.element_.addEventListener(goog.events.EventType.MOUSEDOWN,
    /** @type {function(!Event): void} */ (this.boundDownHandler));
  this.element_.addEventListener(goog.events.EventType.TOUCHSTART,
    /** @type {function(!Event): void} */ (this.boundDownHandler));

  this.boundUpHandler = this.upHandler_.bind(this);
  this.element_.addEventListener(goog.events.EventType.MOUSEUP,
    /** @type {function(!Event): void} */ (this.boundUpHandler));
  this.element_.addEventListener(goog.events.EventType.MOUSELEAVE,
    /** @type {function(!Event): void} */ ((this.boundUpHandler)));
  this.element_.addEventListener(goog.events.EventType.TOUCHEND,
    /** @type {function(!Event): void} */ (this.boundUpHandler));
  this.element_.addEventListener(goog.events.EventType.BLUR,
    /** @type {function(!Event): void} */ (this.boundUpHandler));

  /**
   * Getter for frameCount_.
   * @return {number} the frame count.
   */
  this.getFrameCount = function() {
    return this.frameCount_;
  };

  /**
   * Setter for frameCount_.
   *
   * @param {number} fC the frame count.
   */
  this.setFrameCount = function(fC) {
    this.frameCount_ = fC;
  };

  /**
   * Getter for rippleElement_.
   *
   * @return {?HTMLElement} the ripple element.
   */
  this.getRippleElement = function() {
    return this.rippleElement_;
  };

  /**
   * Sets the ripple X and Y coordinates.
   *
   * @param  {number} newX the new X coordinate
   * @param  {number} newY the new Y coordinate
   */
  this.setRippleXY = function(newX, newY) {
    this.x_ = newX;
    this.y_ = newY;
  };

  /**
   * Sets the ripple styles.
   *
   * @param  {boolean} start whether or not this is the start frame.
   */
  this.setRippleStyles = function(start) {
    if (!!this.rippleElement_) {
      var transformString;
      var scale;
      var offset = 'translate(' + this.x_ + 'px, ' + this.y_ + 'px)';

      if (start) {
        scale = MaterialRippleConstant_.INITIAL_SCALE;
      } else {
        scale = MaterialRippleConstant_.FINAL_SCALE;
        if (recentering) {
          offset = 'translate(' + this.boundWidth / 2 + 'px, ' +
            this.boundHeight / 2 + 'px)';
        }
      }

      transformString = 'translate(-50%, -50%) ' + offset + scale;

      this.rippleElement_.style.webkitTransform = transformString;
      this.rippleElement_.style.msTransform = transformString;
      this.rippleElement_.style.transform = transformString;

      if (start) {
        this.rippleElement_.classList.remove(MaterialRippleClasses_.IS_ANIMATING);
      } else {
        this.rippleElement_.classList.add(MaterialRippleClasses_.IS_ANIMATING);
      }
    }
  };

  /**
   * Handles an animation frame.
   */
  this.animFrameHandler = function() {
    if (this.frameCount_-- > 0) {
      window.requestAnimationFrame(this.animFrameHandler.bind(this));
    } else {
      this.setRippleStyles(false);
    }
  };
};

/**
 * Handle mouse / finger down on element.
 *
 * @private
 * @param {!MouseEvent|!TouchEvent} event The event that fired.
 */
material.MaterialRipple.prototype.downHandler_ = function(event) {
  if (!this.rippleElement_.style.width && !this.rippleElement_.style.height) {
    const rect = this.element_.getBoundingClientRect();
    this.boundHeight = rect.height;
    this.boundWidth = rect.width;
    this.rippleSize_ = Math.sqrt(rect.width * rect.width +
        rect.height * rect.height) * 2 + 2;
    this.rippleElement_.style.width = this.rippleSize_ + 'px';
    this.rippleElement_.style.height = this.rippleSize_ + 'px';
  }

  this.rippleElement_.classList.add(MaterialRippleClasses_.IS_VISIBLE);

  if (event.type === goog.events.EventType.MOUSEDOWN && this.ignoringMouseDown_) {
    this.ignoringMouseDown_ = false;
  } else {
    if (event.type === goog.events.EventType.TOUCHSTART) {
      this.ignoringMouseDown_ = true;
    }
    const frameCount = this.getFrameCount();
    if (frameCount > 0) {
      return;
    }
    this.setFrameCount(1);
    const target = /** @type {!HTMLElement} */ (event.currentTarget);
    if (target) {
      const bound = /** @type {!DOMRect} */ (target.getBoundingClientRect());
      let x;
      let y;
      // Check if we are handling a keyboard click.
      if (event.clientX === 0 && event.clientY === 0) {
        x = Math.round(bound.width / 2);
        y = Math.round(bound.height / 2);
      } else {
        const clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
        const clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
        x = Math.round(clientX - bound.left);
        y = Math.round(clientY - bound.top);
      }
      this.setRippleXY(x, y);
      this.setRippleStyles(true);
      window.requestAnimationFrame(this.animFrameHandler.bind(this));
    }
  }
};

/**
 * Handle mouse / finger up on element.
 *
 * @private
 * @param {!MouseEvent|!TouchEvent} event The event that fired.
 */
material.MaterialRipple.prototype.upHandler_ = function(event) {
  // Don't fire for the artificial "mouseup" generated by a double-click.
  if (event && event.detail !== 2) {
    // Allow a repaint to occur before removing this class, so the animation
    // shows for tap events, which seem to trigger a mouseup too soon after
    // mousedown.
    setTimeout(function() {
      if (!!this.rippleElement_) {
        this.rippleElement_.classList.remove(MaterialRippleClasses_.IS_VISIBLE);
      }
    }.bind(this), 0);
  }
};

componentHandler.register({
  constructor: material.MaterialRipple,
  classAsString: componentHandler.xid('MaterialRipple'),
  cssClass: goog.getCssName('mdl-js-ripple-effect'),
  widget: true
});
