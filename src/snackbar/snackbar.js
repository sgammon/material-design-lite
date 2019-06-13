/**
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
goog.require('goog.events.EventType');

goog.provide('material.MaterialSnackbar');
goog.provide('material.MaterialSnackbarConfig');


/**
 * Configuration structure for snackbar elements. Specifies a message, and, potentially, an action to prompt the user
 * with some follow-up routine. The configuration payload is usable via `showSnackbar`.
 *
 * @typedef {{
 *   message: !string,
 *   actionHandler: (function(!Event): void|null),
 *   actionText: (!string|null),
 *   timeout: (number|undefined)}}
 */
material.MaterialSnackbarConfig;


/**
 * Animation length for the snackbar, in milliseconds.
 *
 * @const
 * @type {number}
 * @private
 */
const ANIMATION_LENGTH = 250;


/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {!string}
 * @private
 */
const MaterialSnackbarClasses_ = {
  SNACKBAR: goog.getCssName('mdl-snackbar'),
  MESSAGE: goog.getCssName('mdl-snackbar__text'),
  ACTION: goog.getCssName('mdl-snackbar__action'),
  ACTIVE: goog.getCssName('mdl-snackbar--active')
};


/**
 * Class constructor for Snackbar MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 * @throws {Error} If required DOM elements aren't present.
 */
material.MaterialSnackbar = function MaterialSnackbar(element) {
  /**
   * Root DOM element upon which to attach the snackbar.
   *
   * @const
   * @type {!HTMLElement}
   * @private
   */
  this.element_ = element;

  /**
   * Text element for the snackbar.
   *
   * @const
   * @type {!HTMLElement}
   * @private
   */
  this.textElement_ = /** @type {!HTMLElement} */ (
    this.element_.querySelector('.' + MaterialSnackbarClasses_.MESSAGE));

  /**
   * Action element for the snackbar.
   *
   * @const
   * @type {!HTMLElement}
   * @private
   */
  this.actionElement_ = /** @type {!HTMLElement} */ (
    this.element_.querySelector('.' + MaterialSnackbarClasses_.ACTION));

  if (!this.textElement_)
    throw new Error('There must be a message element for a snackbar.');
  if (!this.actionElement_)
    throw new Error('There must be an action element for a snackbar.');

  /**
   * Whether the current snackbar is active or not.
   *
   * @private
   * @type {boolean}
   */
  this.active_ = false;

  /**
   * Event handler for any specified action.
   *
   * @type {function(!Event): void|null}
   * @private
   */
  this.actionHandler_ = null;

  /**
   * Message to display in the snackbar.
   *
   * @type {?string}
   * @private
   */
  this.message_ = null;

  /**
   * Action text to display in the snackbar.
   *
   * @type {?string}
   * @private
   */
  this.actionText_ = null;

  /**
   * ID number of the timeout handler for this snackbar.
   *
   * @type {?number}
   * @private
   */
  this.timeoutID_ = null;

  /**
   * Timeout value for this snackbar.
   *
   * @type {number}
   * @private
   */
  this.timeout_ = (ANIMATION_LENGTH * 2) * 4;

  /**
   * Queued notification payload objects.
   *
   * @const
   * @type {!Array<!material.MaterialSnackbarConfig>}
   * @private
   */
  this.queuedNotifications_ = [];

  this.setActionHidden_(true);
};

/**
 * Display the snackbar.
 *
 * @private
 */
material.MaterialSnackbar.prototype.displaySnackbar_ = function() {
  this.element_.setAttribute('aria-hidden', 'true');

  if (this.actionHandler_) {
    this.actionElement_.textContent = this.actionText_;
    this.actionElement_.addEventListener(goog.events.EventType.CLICK, this.actionHandler_);
    this.setActionHidden_(false);
  }

  this.textElement_.textContent = this.message_;
  this.element_.classList.add(MaterialSnackbarClasses_.ACTIVE);
  this.element_.setAttribute('aria-hidden', 'false');
  this.timeoutID_ = setTimeout(this.cleanup_.bind(this), this.timeout_);

};

/**
 * Show the snackbar.
 *
 * @param {!material.MaterialSnackbarConfig} data The data for the notification.
 * @public
 */
material.MaterialSnackbar.prototype.showSnackbar = function(data) {
  if (data === undefined)
    throw new Error('Please provide a data object with at least a message to display.');
  if (!data.message)
    throw new Error('Please provide a message to be displayed.');
  if (data.actionHandler && !data.actionText)
    throw new Error('Please provide action text with the handler.');

  if (this.active_) {
    this.queuedNotifications_.push(data);
  } else {
    this.active_ = true;
    this.message_ = data.message;
    if (data.timeout) {
      this.timeout_ = data.timeout;
    } else {
      this.timeout_ = 2750;
    }
    if (data.actionHandler)
      this.actionHandler_ = data.actionHandler;
    if (data.actionText)
      this.actionText_ = data.actionText;
    this.displaySnackbar_();
  }
};

/**
 * Hide the snackbar.
 *
 * @public
 */
material.MaterialSnackbar.prototype.hideSnackbar = function() {
  if (!this.active_)
    return;
  if (typeof this.timeoutID_ === 'number') {
    clearTimeout(this.timeoutID_);
    this.cleanup_();
  }
};

/**
 * Check if the queue has items within it.
 * If it does, display the next entry.
 *
 * @private
 */
material.MaterialSnackbar.prototype.checkQueue_ = function() {
  if (this.queuedNotifications_.length > 0) {
    this.showSnackbar(this.queuedNotifications_.shift());
  }
};

/**
 * Cleanup the snackbar event listeners and accessiblity attributes.
 *
 * @private
 */
material.MaterialSnackbar.prototype.cleanup_ = function() {
  this.element_.classList.remove(MaterialSnackbarClasses_.ACTIVE);
  setTimeout(function() {
    this.element_.setAttribute('aria-hidden', 'true');
    this.textElement_.textContent = '';
    if (!Boolean(this.actionElement_.getAttribute('aria-hidden'))) {
      this.setActionHidden_(true);
      this.actionElement_.textContent = '';
      this.actionElement_.removeEventListener('click', this.actionHandler_);
    }
    this.actionHandler_ = null;
    this.message_ = null;
    this.actionText_ = null;
    this.timeoutID_ = null;
    this.active_ = false;
    this.checkQueue_();
  }.bind(this), /** @type {number} */ (ANIMATION_LENGTH));
};

/**
 * Set the action handler hidden state.
 *
 * @param {boolean} value
 * @private
 */
material.MaterialSnackbar.prototype.setActionHidden_ = function(value) {
  if (value) {
    this.actionElement_.setAttribute('aria-hidden', 'true');
  } else {
    this.actionElement_.removeAttribute('aria-hidden');
  }
};


componentHandler.register({
  constructor: material.MaterialSnackbar,
  classAsString: 'MaterialSnackbar',
  cssClass: goog.getCssName('mdl-js-snackbar'),
  widget: true
});
