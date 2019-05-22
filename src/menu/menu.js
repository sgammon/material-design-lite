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

goog.provide('material.MaterialMenu');


/**
 * Transition duration, in seconds.
 *
 * @const
 * @private
 * @type {number}
 */
const TRANSITION_DURATION_SECONDS = 0.3;

/**
 * Transition duration fraction. Whatever tf that is.
 *
 * @const
 * @private
 * @type {number}
 */
const TRANSITION_DURATION_FRACTION = 0.8;

/**
 * Timeout, presumably in milliseconds, for closing some thing.
 *
 * @const
 * @private
 * @type {number}
 */
const CLOSE_TIMEOUT = 150;

/**
 * Keycodes, for code readability.
 *
 * @enum {number}
 * @private
 */
const MaterialMenuKeycodes_ = {
  ENTER: 13,
  ESCAPE: 27,
  SPACE: 32,
  UP_ARROW: 38,
  DOWN_ARROW: 40
};

/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
const MaterialMenuCssClasses_ = {
  CONTAINER: goog.getCssName('mdl-menu__container'),
  OUTLINE: goog.getCssName('mdl-menu__outline'),
  ITEM: goog.getCssName('mdl-menu__item'),
  ITEM_RIPPLE_CONTAINER: goog.getCssName('mdl-menu__item-ripple-container'),
  RIPPLE_EFFECT: goog.getCssName('mdl-js-ripple-effect'),
  RIPPLE_IGNORE_EVENTS: goog.getCssName('mdl-js-ripple-effect--ignore-events'),
  RIPPLE: goog.getCssName('mdl-ripple'),
  // Statuses
  IS_UPGRADED: goog.getCssName('is-upgraded'),
  IS_VISIBLE: goog.getCssName('is-visible'),
  IS_ANIMATING: goog.getCssName('is-animating'),
  // Alignment options
  BOTTOM_LEFT: goog.getCssName('mdl-menu--bottom-left'),  // This is the default.
  BOTTOM_RIGHT: goog.getCssName('mdl-menu--bottom-right'),
  TOP_LEFT: goog.getCssName('mdl-menu--top-left'),
  TOP_RIGHT: goog.getCssName('mdl-menu--top-right'),
  UNALIGNED: goog.getCssName('mdl-menu--unaligned')
};

/**
 * Class constructor for dropdown MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
material.MaterialMenu = function MaterialMenu(element) {
  const div = goog.dom.TagName.DIV.toString();
  /**
   * The element we should attach to, as the menu root.
   *
   * @const
   * @private
   * @type {!HTMLElement}
   */
  this.element_ = element;

  /**
   * Whether the menu is currently closing or not.
   *
   * @private
   * @type {boolean}
   */
  this.closing_ = true;

  // Initialize instance.
  // Create container for the menu.
  const container = /** @type {!HTMLElement} */ (document.createElement(div));
  container.classList.add(MaterialMenuCssClasses_.CONTAINER);
  this.element_.parentElement.insertBefore(container, this.element_);
  this.element_.parentElement.removeChild(this.element_);
  container.appendChild(this.element_);

  /**
   * Container element, created by us and attached to the root.
   *
   * @const
   * @private
   * @type {!HTMLElement}
   */
  this.container_ = container;

  // Create outline for the menu (shadow and background).
  const outline = /** @type {!HTMLElement} */ (document.createElement(div));
  outline.classList.add(MaterialMenuCssClasses_.OUTLINE);

  /**
   * Outline element, also a div created by us and attached to the container.
   *
   * @const
   * @private
   * @type {!HTMLElement}
   */
  this.outline_ = outline;
  container.insertBefore(outline, this.element_);

  // Find the "for" element and bind events to it.
  const forElId = (this.element_.getAttribute('for') ||
        this.element_.getAttribute('data-mdl-for'));
  let forEl = null;
  if (forElId) {
    forEl = /** @type {?HTMLElement} */ (document.getElementById(forElId));
    if (forEl) {
      forEl.addEventListener(goog.events.EventType.CLICK, this.handleForClick_.bind(this));
      forEl.addEventListener(goog.events.EventType.KEYDOWN,
        this.handleForKeyboardEvent_.bind(this));
    }
  }

  /**
   * "For" element, if one was found.
   *
   * @const
   * @private
   * @type {?HTMLElement}
   */
  this.forElement_ = forEl;

  const items = /** @type {!NodeList<!HTMLElement>} */ (
    this.element_.querySelectorAll('.' + MaterialMenuCssClasses_.ITEM));
  this.boundItemKeydown_ = this.handleItemKeyboardEvent_.bind(this);
  this.boundItemClick_ = this.handleItemClick_.bind(this);
  for (let i = 0; i < items.length; i++) {
    // Add a listener to each menu item.
    items[i].addEventListener(goog.events.EventType.CLICK, this.boundItemClick_);
    // Add a tab index to each menu item.
    items[i].setAttribute('tabIndex', '-1');
    // Add a keyboard listener to each menu item.
    items[i].addEventListener(goog.events.EventType.KEYDOWN, this.boundItemKeydown_);
  }

  // Add ripple classes to each item, if the user has enabled ripples.
  if (this.element_.classList.contains(MaterialMenuCssClasses_.RIPPLE_EFFECT)) {
    this.element_.classList.add(MaterialMenuCssClasses_.RIPPLE_IGNORE_EVENTS);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const rippleContainer = /** @type {!HTMLElement} */ (
        document.createElement(goog.dom.TagName.SPAN.toString()));
      rippleContainer.classList.add(MaterialMenuCssClasses_.ITEM_RIPPLE_CONTAINER);

      const ripple = /** @type {!HTMLElement} */ (
        document.createElement(goog.dom.TagName.SPAN.toString()));
      ripple.classList.add(MaterialMenuCssClasses_.RIPPLE);
      rippleContainer.appendChild(ripple);

      item.appendChild(rippleContainer);
      item.classList.add(MaterialMenuCssClasses_.RIPPLE_EFFECT);
    }
  }

  // Copy alignment classes to the container, so the outline can use them.
  if (this.element_.classList.contains(MaterialMenuCssClasses_.BOTTOM_LEFT)) {
    this.outline_.classList.add(MaterialMenuCssClasses_.BOTTOM_LEFT);
  }
  if (this.element_.classList.contains(MaterialMenuCssClasses_.BOTTOM_RIGHT)) {
    this.outline_.classList.add(MaterialMenuCssClasses_.BOTTOM_RIGHT);
  }
  if (this.element_.classList.contains(MaterialMenuCssClasses_.TOP_LEFT)) {
    this.outline_.classList.add(MaterialMenuCssClasses_.TOP_LEFT);
  }
  if (this.element_.classList.contains(MaterialMenuCssClasses_.TOP_RIGHT)) {
    this.outline_.classList.add(MaterialMenuCssClasses_.TOP_RIGHT);
  }
  if (this.element_.classList.contains(MaterialMenuCssClasses_.UNALIGNED)) {
    this.outline_.classList.add(MaterialMenuCssClasses_.UNALIGNED);
  }

  container.classList.add(MaterialMenuCssClasses_.IS_UPGRADED);
};

/**
 * Handles a click on the "for" element, by positioning the menu and then
 * toggling it.
 *
 * @param {!Event} evt The event that fired.
 * @private
 */
material.MaterialMenu.prototype.handleForClick_ = function(evt) {
  if (this.element_ && this.forElement_) {
    const rect = this.forElement_.getBoundingClientRect();
    const forRect = this.forElement_.parentElement.getBoundingClientRect();

    if (this.element_.classList.contains(MaterialMenuCssClasses_.UNALIGNED)) {
      // Do not position the menu automatically. Requires the developer to
      // manually specify position.
    } else if (this.element_.classList.contains(
        MaterialMenuCssClasses_.BOTTOM_RIGHT)) {
      // Position below the "for" element, aligned to its right.
      this.container_.style.right = (forRect.right - rect.right) + 'px';
      this.container_.style.top =
          this.forElement_.offsetTop + this.forElement_.offsetHeight + 'px';
    } else if (this.element_.classList.contains(MaterialMenuCssClasses_.TOP_LEFT)) {
      // Position above the "for" element, aligned to its left.
      this.container_.style.left = this.forElement_.offsetLeft + 'px';
      this.container_.style.bottom = (forRect.bottom - rect.top) + 'px';
    } else if (this.element_.classList.contains(MaterialMenuCssClasses_.TOP_RIGHT)) {
      // Position above the "for" element, aligned to its right.
      this.container_.style.right = (forRect.right - rect.right) + 'px';
      this.container_.style.bottom = (forRect.bottom - rect.top) + 'px';
    } else {
      // Default: position below the "for" element, aligned to its left.
      this.container_.style.left = this.forElement_.offsetLeft + 'px';
      this.container_.style.top =
          this.forElement_.offsetTop + this.forElement_.offsetHeight + 'px';
    }
  }

  this.toggle(evt);
};

/**
 * Handles a keyboard event on the "for" element.
 *
 * @param {!Event} evt The event that fired.
 * @private
 */
material.MaterialMenu.prototype.handleForKeyboardEvent_ = function(evt) {
  if (this.element_ && this.container_ && this.forElement_) {
    const items = this.element_.querySelectorAll('.' + MaterialMenuCssClasses_.ITEM +
      ':not([disabled])');

    if (items && items.length > 0 &&
        this.container_.classList.contains(MaterialMenuCssClasses_.IS_VISIBLE)) {
      if (evt.keyCode === MaterialMenuKeycodes_.UP_ARROW) {
        evt.preventDefault();
        items[items.length - 1].focus();
      } else if (evt.keyCode === MaterialMenuKeycodes_.DOWN_ARROW) {
        evt.preventDefault();
        items[0].focus();
      }
    }
  }
};

/**
 * Handles a keyboard event on an item.
 *
 * @param {!Event} evt The event that fired.
 * @private
 */
material.MaterialMenu.prototype.handleItemKeyboardEvent_ = function(evt) {
  if (this.element_ && this.container_) {
    const items = this.element_.querySelectorAll('.' + MaterialMenuCssClasses_.ITEM +
      ':not([disabled])');

    if (items && items.length > 0 &&
        this.container_.classList.contains(MaterialMenuCssClasses_.IS_VISIBLE)) {
      const currentIndex = Array.prototype.slice.call(items).indexOf(evt.target);

      if (evt.keyCode === MaterialMenuKeycodes_.UP_ARROW) {
        evt.preventDefault();
        if (currentIndex > 0) {
          items[currentIndex - 1].focus();
        } else {
          items[items.length - 1].focus();
        }
      } else if (evt.keyCode === MaterialMenuKeycodes_.DOWN_ARROW) {
        evt.preventDefault();
        if (items.length > currentIndex + 1) {
          items[currentIndex + 1].focus();
        } else {
          items[0].focus();
        }
      } else if (evt.keyCode === MaterialMenuKeycodes_.SPACE ||
            evt.keyCode === MaterialMenuKeycodes_.ENTER) {
        evt.preventDefault();
        // Send mousedown and mouseup to trigger ripple.
        const e1 = new MouseEvent(goog.events.EventType.MOUSEDOWN);
        evt.target.dispatchEvent(e1);
        const e2 = new MouseEvent(goog.events.EventType.MOUSEUP);
        evt.target.dispatchEvent(e2);
        // Send click.
        const e3 = new MouseEvent(goog.events.EventType.CLICK);
        evt.target.dispatchEvent(e3);
      } else if (evt.keyCode === MaterialMenuKeycodes_.ESCAPE) {
        evt.preventDefault();
        this.hide();
      }
    }
  }
};

/**
 * Handles a click event on an item.
 *
 * @param {!Event} evt The event that fired.
 * @private
 */
material.MaterialMenu.prototype.handleItemClick_ = function(evt) {
  const target = /** @type {!HTMLElement} */ (evt.target);
  if (target.hasAttribute('disabled')) {
    evt.stopPropagation();
  } else {
    // Wait some time before closing menu, so the user can see the ripple.
    this.closing_ = true;
    window.setTimeout(function() {
      this.hide();
      this.closing_ = false;
    }.bind(this), /** @type {number} */ (CLOSE_TIMEOUT));
  }
};

/**
 * Calculates the initial clip (for opening the menu) or final clip (for closing
 * it), and applies it. This allows us to animate from or to the correct point,
 * that is, the point it's aligned to in the "for" element.
 *
 * @param {number} height Height of the clip rectangle
 * @param {number} width Width of the clip rectangle
 * @private
 */
material.MaterialMenu.prototype.applyClip_ = function(height, width) {
  if (this.element_.classList.contains(MaterialMenuCssClasses_.UNALIGNED)) {
    // Do not clip.
    this.element_.style.clip = '';
  } else if (this.element_.classList.contains(MaterialMenuCssClasses_.BOTTOM_RIGHT)) {
    // Clip to the top right corner of the menu.
    this.element_.style.clip =
        'rect(0 ' + width + 'px ' + '0 ' + width + 'px)';
  } else if (this.element_.classList.contains(MaterialMenuCssClasses_.TOP_LEFT)) {
    // Clip to the bottom left corner of the menu.
    this.element_.style.clip =
        'rect(' + height + 'px 0 ' + height + 'px 0)';
  } else if (this.element_.classList.contains(MaterialMenuCssClasses_.TOP_RIGHT)) {
    // Clip to the bottom right corner of the menu.
    this.element_.style.clip = 'rect(' + height + 'px ' + width + 'px ' +
        height + 'px ' + width + 'px)';
  } else {
    // Default: do not clip (same as clipping to the top left corner).
    this.element_.style.clip = '';
  }
};

/**
 * Cleanup function to remove animation listeners.
 *
 * @param {!Event} evt
 * @private
 */

material.MaterialMenu.prototype.removeAnimationEndListener_ = function(evt) {
  const target = /** @type {!HTMLElement} */ (evt.target);
  target.classList.remove(MaterialMenuCssClasses_.IS_ANIMATING);
};

/**
 * Adds an event listener to clean up after the animation ends.
 *
 * @private
 */
material.MaterialMenu.prototype.addAnimationEndListener_ = function() {
  this.element_.addEventListener(goog.events.EventType.TRANSITIONEND, this.removeAnimationEndListener_);
};

/**
 * Displays the menu.
 *
 * @param {?Event=} evt Event from the browser.
 * @public
 */
material.MaterialMenu.prototype.show = function(evt) {
  if (this.element_ && this.container_ && this.outline_) {
    // Measure the inner element.
    const height = this.element_.getBoundingClientRect().height;
    const width = this.element_.getBoundingClientRect().width;

    // Apply the inner element's size to the container and outline.
    this.container_.style.width = width + 'px';
    this.container_.style.height = height + 'px';
    this.outline_.style.width = width + 'px';
    this.outline_.style.height = height + 'px';

    const transitionDuration = TRANSITION_DURATION_SECONDS * TRANSITION_DURATION_FRACTION;

    // Calculate transition delays for individual menu items, so that they fade
    // in one at a time.
    const items = /** @type {!NodeList<!HTMLElement>} */ (
      this.element_.querySelectorAll('.' + MaterialMenuCssClasses_.ITEM));
    for (let i = 0; i < items.length; i++) {
      let itemDelay = null;
      if (this.element_.classList.contains(MaterialMenuCssClasses_.TOP_LEFT) ||
          this.element_.classList.contains(MaterialMenuCssClasses_.TOP_RIGHT)) {
        itemDelay = ((height - items[i].offsetTop - items[i].offsetHeight) /
            height * transitionDuration) + 's';
      } else {
        itemDelay = (items[i].offsetTop / height * transitionDuration) + 's';
      }
      items[i].style.transitionDelay = itemDelay;
    }

    // Apply the initial clip to the text before we start animating.
    this.applyClip_(height, width);

    // Wait for the next frame, turn on animation, and apply the final clip.
    // Also make it visible. This triggers the transitions.
    window.requestAnimationFrame(function() {
      this.element_.classList.add(MaterialMenuCssClasses_.IS_ANIMATING);
      this.element_.style.clip = 'rect(0 ' + width + 'px ' + height + 'px 0)';
      this.container_.classList.add(MaterialMenuCssClasses_.IS_VISIBLE);
    }.bind(this));

    // Clean up after the animation is complete.
    this.addAnimationEndListener_();

    // Add a click listener to the document, to close the menu.
    /**
     * Handle click events outside the menu, to facilitate closing it.
     *
     * @param {!MouseEvent} e Click event.
     */
    const cbk = (e) => {
      // Check to see if the document is processing the same event that
      // displayed the menu in the first place. If so, do nothing.
      // Also check to see if the menu is in the process of closing itself, and
      // do nothing in that case.
      // Also check if the clicked element is a menu item
      // if so, do nothing.
      const target = /** @type {!HTMLElement} */ (e.target);
      if (e !== evt && !this.closing_ && target.parentNode !== this.element_) {
        document.removeEventListener(goog.events.EventType.CLICK, /** @type {function(!Event): void} */ (cbk));
        this.hide();
      }
    };
    document.addEventListener(goog.events.EventType.CLICK, /** @type {function(!Event): void} */ (cbk));
  }
};

/**
 * Hides the menu.
 *
 * @public
 */
material.MaterialMenu.prototype.hide = function() {
  if (this.element_ && this.container_ && this.outline_) {
    const items = this.element_.querySelectorAll('.' + MaterialMenuCssClasses_.ITEM);

    // Remove all transition delays; menu items fade out concurrently.
    for (let i = 0; i < items.length; i++) {
      items[i].style.removeProperty('transition-delay');
    }

    // Measure the inner element.
    const rect = this.element_.getBoundingClientRect();
    const height = rect.height;
    const width = rect.width;

    // Turn on animation, and apply the final clip. Also make invisible.
    // This triggers the transitions.
    this.element_.classList.add(MaterialMenuCssClasses_.IS_ANIMATING);
    this.applyClip_(height, width);
    this.container_.classList.remove(MaterialMenuCssClasses_.IS_VISIBLE);

    // Clean up after the animation is complete.
    this.addAnimationEndListener_();
  }
};

/**
 * Displays or hides the menu, depending on current state.
 *
 * @param {?Event=} evt Event from the browser to de-duplicate, if applicable.
 * @public
 */
material.MaterialMenu.prototype.toggle = function(evt) {
  if (this.container_.classList.contains(MaterialMenuCssClasses_.IS_VISIBLE)) {
    this.hide();
  } else {
    this.show(evt);
  }
};
