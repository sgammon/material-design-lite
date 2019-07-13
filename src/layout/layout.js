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

goog.require('componentHandler.register');
goog.require('componentHandler.xid');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventType');

goog.provide('material.MaterialLayout');
goog.provide('material.MaterialLayoutMode');
goog.provide('material.MaterialLayoutTab');


/**
 * Max width value.
 *
 * @const
 * @type {string}
 * @private
 */
const MAX_WIDTH_ = '(max-width: 1024px)';


/**
 * Tab scroll pixels.
 *
 * @const
 * @type {number}
 * @private
 */
const TAB_SCROLL_PIXELS_ = 100;


/**
 * Resize timeout.
 *
 * @const
 * @type {number}
 * @private
 */
const RESIZE_TIMEOUT_ = 100;


/**
 * Menu icon.
 *
 * @const
 * @type {string}
 * @private
 */
const MENU_ICON_ = '&#xE5D2;';


/**
 * Left-facing chevron.
 *
 * @const
 * @type {string}
 * @private
 */
const CHEVRON_LEFT_ = 'chevron_left';


/**
 * Right-facing chevron.
 *
 * @const
 * @type {string}
 * @private
 */
const CHEVRON_RIGHT_ = 'chevron_right';


/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
const LayoutCssClasses_ = {
  CONTAINER: goog.getCssName('mdl-layout__container'),
  HEADER: goog.getCssName('mdl-layout__header'),
  DRAWER: goog.getCssName('mdl-layout__drawer'),
  CONTENT: goog.getCssName('mdl-layout__content'),
  DRAWER_BTN: goog.getCssName('mdl-layout__drawer-button'),

  ICON: goog.getCssName('material-icons'),

  JS_RIPPLE_EFFECT: goog.getCssName('mdl-js-ripple-effect'),
  RIPPLE_CONTAINER: goog.getCssName('mdl-layout__tab-ripple-container'),
  RIPPLE: goog.getCssName('mdl-ripple'),
  RIPPLE_IGNORE_EVENTS: goog.getCssName('mdl-js-ripple-effect--ignore-events'),

  HEADER_SEAMED: goog.getCssName('mdl-layout__header--seamed'),
  HEADER_WATERFALL: goog.getCssName('mdl-layout__header--waterfall'),
  HEADER_SCROLL: goog.getCssName('mdl-layout__header--scroll'),

  FIXED_HEADER: goog.getCssName('mdl-layout--fixed-header'),
  FIXED_DRAWER: goog.getCssName('mdl-layout--fixed-drawer'),
  OBFUSCATOR: goog.getCssName('mdl-layout__obfuscator'),

  TAB_BAR: goog.getCssName('mdl-layout__tab-bar'),
  TAB_CONTAINER: goog.getCssName('mdl-layout__tab-bar-container'),
  TAB: goog.getCssName('mdl-layout__tab'),
  TAB_BAR_BUTTON: goog.getCssName('mdl-layout__tab-bar-button'),
  TAB_BAR_LEFT_BUTTON: goog.getCssName('mdl-layout__tab-bar-left-button'),
  TAB_BAR_RIGHT_BUTTON: goog.getCssName('mdl-layout__tab-bar-right-button'),
  TAB_MANUAL_SWITCH: goog.getCssName('mdl-layout__tab-manual-switch'),
  PANEL: goog.getCssName('mdl-layout__tab-panel'),

  HAS_DRAWER: goog.getCssName('has-drawer'),
  HAS_TABS: goog.getCssName('has-tabs'),
  HAS_SCROLLING_HEADER: goog.getCssName('has-scrolling-header'),
  CASTING_SHADOW: goog.getCssName('is-casting-shadow'),
  IS_COMPACT: goog.getCssName('is-compact'),
  IS_SMALL_SCREEN: goog.getCssName('is-small-screen'),
  IS_DRAWER_OPEN: goog.getCssName('is-visible'),
  IS_ACTIVE: goog.getCssName('is-active'),
  IS_UPGRADED: goog.getCssName('is-upgraded'),
  IS_ANIMATING: goog.getCssName('is-animating'),

  ON_LARGE_SCREEN: goog.getCssName('mdl-layout--large-screen-only'),
  ON_SMALL_SCREEN: goog.getCssName('mdl-layout--small-screen-only')
};


/**
 * Keycodes, for code readability.
 *
 * @enum {number}
 * @private
 */
const Keycodes_ = {
  ENTER: 13,
  ESCAPE: 27,
  SPACE: 32
};

/**
 * Modes.
 *
 * @enum {number}
 * @public
 */
material.MaterialLayoutMode = {
  STANDARD: 0,
  SEAMED: 1,
  WATERFALL: 2,
  SCROLL: 3
};


/**
 * Class constructor for Layout MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
material.MaterialLayout = function MaterialLayout(element) {
  /**
   * Main element.
   *
   * @const
   * @type {!HTMLElement}
   * @private
   */
  this.element_ = element;

  const container = document.createElement(goog.dom.TagName.DIV.toString());
  container.classList.add(LayoutCssClasses_.CONTAINER);

  const focusedElement = this.element_.querySelector(':focus');

  this.element_.parentElement.insertBefore(container, this.element_);
  this.element_.parentElement.removeChild(this.element_);
  container.appendChild(this.element_);

  if (focusedElement) {
    focusedElement.focus();
  }

  const directChildren = this.element_.childNodes;
  const numChildren = directChildren.length;

  let headerEl = /** @type {?HTMLElement} */ (null);
  let drawerEl = /** @type {?HTMLElement} */ (null);
  let contentEl = /** @type {?HTMLElement} */ (null);

  for (let c = 0; c < numChildren; c++) {
    const child = /** @type {!HTMLElement} */ (directChildren[c]);
    if (child.classList.contains(LayoutCssClasses_.HEADER)) {
      headerEl = child;
      continue;
    }

    if (child.classList.contains(LayoutCssClasses_.DRAWER)) {
      drawerEl = child;
      continue;
    }

    if (child.classList.contains(LayoutCssClasses_.CONTENT)) {
      contentEl = child;
    }
  }

  /**
   * Header element, if one was specified.
   *
   * @const
   * @type {?HTMLElement}
   * @private
   */
  this.header_ = /** @type {?HTMLElement} */ (headerEl);

  /**
   * Drawer element, if one was specified.
   *
   * @const
   * @type {?HTMLElement}
   * @private
   */
  this.drawer_ = /** @type {?HTMLElement} */ (drawerEl);

  /**
   * Content element, if one was specified.
   *
   * @const
   * @type {?HTMLElement}
   * @private
   */
  this.content_ = /** @type {?HTMLElement} */ (contentEl);

  window.addEventListener('pageshow', function(e) {
    if (e.persisted) { // when page is loaded from back/forward cache
      // trigger repaint to let layout scroll in safari
      this.element_.style.overflowY = 'hidden';
      requestAnimationFrame(function() {
        this.element_.style.overflowY = '';
      }.bind(this));
    }
  }.bind(this), false);

  /**
   * Tab bar element, if one was specified.
   *
   * @const
   * @type {?HTMLElement}
   * @private
   */
  this.tabBar_ = !!this.header_ ?
    /** @type {!HTMLElement} */ (this.header_.querySelector('.' + LayoutCssClasses_.TAB_BAR))
    : null;


  let mode = material.MaterialLayoutMode.STANDARD;

  if (!!this.header_) {
    if (this.header_.classList.contains(LayoutCssClasses_.HEADER_SEAMED)) {
      mode = material.MaterialLayoutMode.SEAMED;
    } else if (this.header_.classList.contains(
      LayoutCssClasses_.HEADER_WATERFALL)) {
      mode = material.MaterialLayoutMode.WATERFALL;
      this.header_.addEventListener(goog.events.EventType.TRANSITIONEND,
        this.headerTransitionEndHandler_.bind(this));
      this.header_.addEventListener(goog.events.EventType.CLICK,
        this.headerClickHandler_.bind(this));
    } else if (this.header_.classList.contains(
      LayoutCssClasses_.HEADER_SCROLL)) {
      mode = material.MaterialLayoutMode.SCROLL;
      container.classList.add(LayoutCssClasses_.HAS_SCROLLING_HEADER);
    }

    if (mode === material.MaterialLayoutMode.STANDARD) {
      this.header_.classList.add(LayoutCssClasses_.CASTING_SHADOW);
      if (this.tabBar_) {
        this.tabBar_.classList.add(LayoutCssClasses_.CASTING_SHADOW);
      }
    } else if (mode === material.MaterialLayoutMode.SEAMED || mode === material.MaterialLayoutMode.SCROLL) {
      this.header_.classList.remove(LayoutCssClasses_.CASTING_SHADOW);
      if (this.tabBar_) {
        this.tabBar_.classList.remove(LayoutCssClasses_.CASTING_SHADOW);
      }
    } else if (mode === material.MaterialLayoutMode.WATERFALL) {
      // Add and remove shadows depending on scroll position.
      // Also add/remove auxiliary class for styling of the compact version of
      // the header.
      this.content_.addEventListener(goog.events.EventType.SCROLL,
        this.contentScrollHandler_.bind(this));
      this.contentScrollHandler_();
    }
  }

  // Add drawer toggling button to our layout, if we have an openable drawer.
  if (!!this.drawer_) {
    let drawerButton = this.element_.querySelector('.' + LayoutCssClasses_.DRAWER_BTN);
    if (!drawerButton) {
      drawerButton = document.createElement(goog.dom.TagName.DIV.toString());
      drawerButton.setAttribute('aria-expanded', 'false');
      drawerButton.setAttribute('role', 'button');
      drawerButton.setAttribute('tabindex', '0');
      drawerButton.classList.add(LayoutCssClasses_.DRAWER_BTN);

      const drawerButtonIcon = document.createElement(goog.dom.TagName.I.toString());
      drawerButtonIcon.classList.add(LayoutCssClasses_.ICON);
      drawerButtonIcon.innerHTML = MENU_ICON_;
      drawerButton.appendChild(drawerButtonIcon);
    }

    if (this.drawer_.classList.contains(LayoutCssClasses_.ON_LARGE_SCREEN)) {
      //If drawer has ON_LARGE_SCREEN class then add it to the drawer toggle button as well.
      drawerButton.classList.add(LayoutCssClasses_.ON_LARGE_SCREEN);
    } else if (this.drawer_.classList.contains(LayoutCssClasses_.ON_SMALL_SCREEN)) {
      //If drawer has ON_SMALL_SCREEN class then add it to the drawer toggle button as well.
      drawerButton.classList.add(LayoutCssClasses_.ON_SMALL_SCREEN);
    }

    drawerButton.addEventListener(goog.events.EventType.CLICK,
      /** @type {!function(!Event): void} */ (this.drawerToggleHandler_.bind(this)));

    drawerButton.addEventListener(goog.events.EventType.KEYDOWN,
      /** @type {!function(!Event): void} */ (this.drawerToggleHandler_.bind(this)));

    // Add a class if the layout has a drawer, for altering the left padding.
    // Adds the HAS_DRAWER to the elements since this.header_ may or may
    // not be present.
    this.element_.classList.add(LayoutCssClasses_.HAS_DRAWER);

    // If we have a fixed header, add the button to the header rather than
    // the layout.
    if (this.element_.classList.contains(LayoutCssClasses_.FIXED_HEADER)) {
      this.header_.insertBefore(drawerButton, this.header_.firstChild);
    } else {
      this.element_.insertBefore(drawerButton, this.content_);
    }

    const obfuscator = document.createElement(goog.dom.TagName.DIV.toString());
    obfuscator.classList.add(LayoutCssClasses_.OBFUSCATOR);
    this.element_.appendChild(obfuscator);
    obfuscator.addEventListener(goog.events.EventType.CLICK,
      /** @type {!function(!Event): void} */ (this.drawerToggleHandler_.bind(this)));
    this.obfuscator_ = obfuscator;

    this.drawer_.addEventListener(goog.events.EventType.KEYDOWN,
      /** @type {!function(!Event): void} */ (this.keyboardEventHandler_.bind(this)));
    this.drawer_.setAttribute('aria-hidden', 'true');
  }

  // Keep an eye on screen size, and add/remove auxiliary class for styling
  // of small screens.
  this.screenSizeMediaQuery_ = this.matchMedia_(
    /** @type {string} */ (MAX_WIDTH_));
  this.screenSizeMediaQuery_.addListener(this.screenSizeHandler_.bind(this));
  this.screenSizeHandler_();

  // Initialize tabs, if any.
  if (this.header_ && this.tabBar_) {
    this.element_.classList.add(LayoutCssClasses_.HAS_TABS);

    const tabContainer = document.createElement(goog.dom.TagName.DIV.toString());
    tabContainer.classList.add(LayoutCssClasses_.TAB_CONTAINER);
    this.header_.insertBefore(tabContainer, this.tabBar_);
    this.header_.removeChild(this.tabBar_);

    const leftButton = document.createElement(goog.dom.TagName.DIV.toString());
    leftButton.classList.add(LayoutCssClasses_.TAB_BAR_BUTTON);
    leftButton.classList.add(LayoutCssClasses_.TAB_BAR_LEFT_BUTTON);
    const leftButtonIcon = document.createElement('i');
    leftButtonIcon.classList.add(LayoutCssClasses_.ICON);
    leftButtonIcon.textContent = CHEVRON_LEFT_;
    leftButton.appendChild(leftButtonIcon);
    leftButton.addEventListener(goog.events.EventType.CLICK, function() {
      this.tabBar_.scrollLeft -= TAB_SCROLL_PIXELS_;
    }.bind(this));

    const rightButton = document.createElement(goog.dom.TagName.DIV.toString());
    rightButton.classList.add(LayoutCssClasses_.TAB_BAR_BUTTON);
    rightButton.classList.add(LayoutCssClasses_.TAB_BAR_RIGHT_BUTTON);
    const rightButtonIcon = document.createElement('i');
    rightButtonIcon.classList.add(LayoutCssClasses_.ICON);
    rightButtonIcon.textContent = CHEVRON_RIGHT_;
    rightButton.appendChild(rightButtonIcon);
    rightButton.addEventListener(goog.events.EventType.CLICK, function() {
      this.tabBar_.scrollLeft += TAB_SCROLL_PIXELS_;
    }.bind(this));

    tabContainer.appendChild(leftButton);
    tabContainer.appendChild(this.tabBar_);
    tabContainer.appendChild(rightButton);

    // Add and remove tab buttons depending on scroll position and total
    // window size.
    const tabUpdateHandler = function() {
      if (this.tabBar_.scrollLeft > 0) {
        leftButton.classList.add(LayoutCssClasses_.IS_ACTIVE);
      } else {
        leftButton.classList.remove(LayoutCssClasses_.IS_ACTIVE);
      }

      if (this.tabBar_.scrollLeft <
        this.tabBar_.scrollWidth - this.tabBar_.offsetWidth) {
        rightButton.classList.add(LayoutCssClasses_.IS_ACTIVE);
      } else {
        rightButton.classList.remove(LayoutCssClasses_.IS_ACTIVE);
      }
    }.bind(this);

    this.tabBar_.addEventListener(goog.events.EventType.SCROLL, tabUpdateHandler);
    tabUpdateHandler();

    /**
     * Resize timeout ID.
     *
     * @type {?number}
     * @private
     */
    this.resizeTimeoutId_ = null;

    // Update tabs when the window changes size.
    const windowResizeHandler = () => {
      // Use timeouts to make sure it doesn't happen too often.
      if (!!this.resizeTimeoutId_) {
        clearTimeout(this.resizeTimeoutId_);
      }
      this.resizeTimeoutId_ = setTimeout(() => {
        tabUpdateHandler();
        this.resizeTimeoutId_ = null;
      }, /** @type {number} */ (RESIZE_TIMEOUT_));
    };

    window.addEventListener(goog.events.EventType.RESIZE, windowResizeHandler);

    if (this.tabBar_.classList.contains(LayoutCssClasses_.JS_RIPPLE_EFFECT)) {
      this.tabBar_.classList.add(LayoutCssClasses_.RIPPLE_IGNORE_EVENTS);
    }

    // Select element tabs, document panels
    const tabs = this.tabBar_.querySelectorAll('.' + LayoutCssClasses_.TAB);
    const panels = this.content_.querySelectorAll('.' + LayoutCssClasses_.PANEL);

    // Create new tabs for each tab element
    for (let i = 0; i < tabs.length; i++) {
      new material.MaterialLayoutTab(
        /** @type {!HTMLAnchorElement} */ (tabs[i]),
        tabs,
        panels,
        this);
    }
  }

  this.element_.classList.add(LayoutCssClasses_.IS_UPGRADED);
};


/**
 * Provide local version of matchMedia. This is needed in order to support
 * monkey-patching of matchMedia in the unit tests. Due to peculiarities in
 * PhantomJS, it doesn't work to monkey patch window.matchMedia directly.
 *
 * @private
 * @param {!string} query Media query to match.
 * @return {!MediaQueryList} Media query match result.
 */
material.MaterialLayout.prototype.matchMedia_ = function(query) {
  return window.matchMedia(query);
};


/**
 * Handles scrolling on the content.
 *
 * @private
 */
material.MaterialLayout.prototype.contentScrollHandler_ = function() {
  if (this.header_.classList.contains(LayoutCssClasses_.IS_ANIMATING)) {
    return;
  }

  const headerVisible =
      !this.element_.classList.contains(LayoutCssClasses_.IS_SMALL_SCREEN) ||
      this.element_.classList.contains(LayoutCssClasses_.FIXED_HEADER);

  if (this.content_.scrollTop > 0 &&
      !this.header_.classList.contains(LayoutCssClasses_.IS_COMPACT)) {
    this.header_.classList.add(LayoutCssClasses_.CASTING_SHADOW);
    this.header_.classList.add(LayoutCssClasses_.IS_COMPACT);
    if (headerVisible) {
      this.header_.classList.add(LayoutCssClasses_.IS_ANIMATING);
    }
  } else if (this.content_.scrollTop <= 0 &&
      this.header_.classList.contains(LayoutCssClasses_.IS_COMPACT)) {
    this.header_.classList.remove(LayoutCssClasses_.CASTING_SHADOW);
    this.header_.classList.remove(LayoutCssClasses_.IS_COMPACT);
    if (headerVisible) {
      this.header_.classList.add(LayoutCssClasses_.IS_ANIMATING);
    }
  }
};


/**
 * Handles a keyboard event on the drawer.
 *
 * @param {!KeyboardEvent} evt The event that fired.
 * @private
 */
material.MaterialLayout.prototype.keyboardEventHandler_ = function(evt) {
  // Only react when the drawer is open.
  if (evt.keyCode === Keycodes_.ESCAPE &&
      this.drawer_.classList.contains(LayoutCssClasses_.IS_DRAWER_OPEN)) {
    this.toggleDrawer();
  }
};


/**
 * Handles changes in screen size.
 *
 * @private
 */
material.MaterialLayout.prototype.screenSizeHandler_ = function() {
  if (this.screenSizeMediaQuery_.matches) {
    this.element_.classList.add(LayoutCssClasses_.IS_SMALL_SCREEN);

    if (this.drawer_) {
      this.drawer_.setAttribute('aria-hidden', 'true');
    }
  } else {
    this.element_.classList.remove(LayoutCssClasses_.IS_SMALL_SCREEN);
    // Collapse drawer (if any) when moving to a large screen size.
    if (this.drawer_) {
      this.drawer_.classList.remove(LayoutCssClasses_.IS_DRAWER_OPEN);
      this.obfuscator_.classList.remove(LayoutCssClasses_.IS_DRAWER_OPEN);

      if (this.element_.classList.contains(LayoutCssClasses_.FIXED_DRAWER)) {
        this.drawer_.setAttribute('aria-hidden', 'false');
      }
    }
  }
};


/**
 * Handles events of drawer button.
 *
 * @param {!KeyboardEvent} evt The event that fired.
 * @private
 */
material.MaterialLayout.prototype.drawerToggleHandler_ = function(evt) {
  if (evt && (evt.type === goog.events.EventType.KEYDOWN)) {
    if (evt.keyCode === Keycodes_.SPACE || evt.keyCode === Keycodes_.ENTER) {
      // prevent scrolling in drawer nav
      evt.preventDefault();
    } else {
      // prevent other keys
      return;
    }
  }

  this.toggleDrawer();
};


/**
 * Handles (un)setting the `is-animating` class
 *
 * @private
 */
material.MaterialLayout.prototype.headerTransitionEndHandler_ = function() {
  this.header_.classList.remove(LayoutCssClasses_.IS_ANIMATING);
};


/**
 * Handles expanding the header on click
 *
 * @private
 */
material.MaterialLayout.prototype.headerClickHandler_ = function() {
  if (this.header_.classList.contains(LayoutCssClasses_.IS_COMPACT)) {
    this.header_.classList.remove(LayoutCssClasses_.IS_COMPACT);
    this.header_.classList.add(LayoutCssClasses_.IS_ANIMATING);
  }
};


/**
 * Reset tab state, dropping active classes
 *
 * @param {!NodeList<!Element>} tabBar Tab bar elements.
 * @private
 */
material.MaterialLayout.prototype.resetTabState_ = function(tabBar) {
  for (let k = 0; k < tabBar.length; k++) {
    tabBar[k].classList.remove(LayoutCssClasses_.IS_ACTIVE);
  }
};


/**
 * Reset panel state, dropping active classes
 *
 * @param {!NodeList<!Element>} panels Panel elements.
 * @private
 */
material.MaterialLayout.prototype.resetPanelState_ = function(panels) {
  for (let j = 0; j < panels.length; j++) {
    panels[j].classList.remove(LayoutCssClasses_.IS_ACTIVE);
  }
};


/**
* Toggle drawer state
*
* @public
*/
material.MaterialLayout.prototype.toggleDrawer = function() {
  const drawerButton = this.element_.querySelector('.' + LayoutCssClasses_.DRAWER_BTN);
  this.drawer_.classList.toggle(LayoutCssClasses_.IS_DRAWER_OPEN);
  this.obfuscator_.classList.toggle(LayoutCssClasses_.IS_DRAWER_OPEN);

  // Set accessibility properties.
  if (this.drawer_.classList.contains(LayoutCssClasses_.IS_DRAWER_OPEN)) {
    this.drawer_.setAttribute('aria-hidden', 'false');
    drawerButton.setAttribute('aria-expanded', 'true');
  } else {
    this.drawer_.setAttribute('aria-hidden', 'true');
    drawerButton.setAttribute('aria-expanded', 'false');
  }
};


/**
 * Constructor for an individual tab.
 *
 * @constructor
 * @param {!HTMLAnchorElement} tab The HTML element for the tab.
 * @param {!NodeList<!Element>} tabs Array with HTML elements for all tabs.
 * @param {!NodeList<!Element>} panels Array with HTML elements for all panels.
 * @param {!material.MaterialLayout} layout The MaterialLayout object that owns the tab.
 */
material.MaterialLayoutTab = function MaterialLayoutTab(tab, tabs, panels, layout) {
  /**
   * Auxiliary method to programmatically select a tab in the UI.
   */
  function selectTab() {
    const href = tab.href.split('#')[1];
    const panel = layout.content_.querySelector('#' + href);
    layout.resetTabState_(tabs);
    layout.resetPanelState_(panels);
    tab.classList.add(LayoutCssClasses_.IS_ACTIVE);
    panel.classList.add(LayoutCssClasses_.IS_ACTIVE);
  }

  if (layout.tabBar_.classList.contains(
      LayoutCssClasses_.JS_RIPPLE_EFFECT)) {
    const rippleContainer = document.createElement(goog.dom.TagName.SPAN.toString());
    rippleContainer.classList.add(LayoutCssClasses_.RIPPLE_CONTAINER);
    rippleContainer.classList.add(LayoutCssClasses_.JS_RIPPLE_EFFECT);
    const ripple = document.createElement(goog.dom.TagName.SPAN.toString());
    ripple.classList.add(LayoutCssClasses_.RIPPLE);
    rippleContainer.appendChild(ripple);
    tab.appendChild(rippleContainer);
  }

  if (!layout.tabBar_.classList.contains(
    LayoutCssClasses_.TAB_MANUAL_SWITCH)) {
    tab.addEventListener(goog.events.EventType.CLICK, function(e) {
      if (tab.getAttribute('href').charAt(0) === '#') {
        e.preventDefault();
        selectTab();
      }
    });
  }

  tab['show'] = selectTab;
};


// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
  constructor: material.MaterialLayout,
  classAsString: componentHandler.xid('MaterialLayout'),
  cssClass: goog.getCssName('mdl-js-layout')
});
