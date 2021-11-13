/**
 * jQuery Draggable Touch v0.6
 * Jonatan Heyman | http://heyman.info 
 *
 * Make HTML elements draggable by using uses touch events.
 * The plugin also has a fallback that uses mouse events, 
 * in case the device doesn't support touch events.
 * 
 * Licenced under THE BEER-WARE LICENSE (Revision 42):
 * Jonatan Heyman (http://heyman.info) wrote this file. As long as you retain this 
 * notice you can do whatever you want with this stuff. If we meet some day, and 
 * you think this stuff is worth it, you can buy me a beer in return.
 */
;(function($){
    $.fn.draggableTouch = function(actionOrSettings) {
        // check if the device has touch support, and if not, fallback to use mouse
        // draggableMouse which uses mouse events
        if (window.ontouchstart === undefined) {
            return this.draggableMouse(actionOrSettings);
        }

        if (typeof(actionOrSettings) == "string") {
            // check if we shall make it not draggable
            if (actionOrSettings == "disable") {
                this.unbind("touchstart.draggableTouch");
                this.unbind("touchmove.draggableTouch");
                this.unbind("touchend.draggableTouch");
                this.unbind("touchcancel.draggableTouch");
                
                this.trigger("dragdisabled");

                return this;
            }
        } else {
            var useTransform = actionOrSettings && actionOrSettings.useTransform;
        }
        
        this.each(function() {
            var element = $(this);
            var offset = null;
            var draggingTouchId = null;
            var end = function(e) {
                e.preventDefault();
                var orig = e.originalEvent;
                for (var i=0; i<orig.changedTouches.length; i++) {
                    var touch = orig.changedTouches[i];
                    // the only touchend/touchcancel event we care about is the touch
                    // that started the dragging
                    if (touch.identifier != draggingTouchId) {
                        continue;
                    }
                    element.trigger("dragend", {
                        top: orig.changedTouches[0].pageY - offset.y,
                        left: orig.changedTouches[0].pageX - offset.x
                    });
                    draggingTouchId = null;
                }
            };
            
            element.bind("touchstart.draggableTouch", function(e) {
                e.preventDefault();
                var orig = e.originalEvent;
                // if this element is already being dragged, we can early exit, otherwise
                // we need to store which touch started dragging the element
                if (draggingTouchId) {
                    return;
                } else {
                    draggingTouchId = orig.changedTouches[0].identifier;
                }
                var pos = $(this).position();
                offset = {
                    x: orig.changedTouches[0].pageX - pos.left,
                    y: orig.changedTouches[0].pageY - pos.top
                };
                element.trigger("dragstart", pos);
            });
            element.bind("touchmove.draggableTouch", function(e) {
                e.preventDefault();
                var orig = e.originalEvent;
                
                for (var i=0; i<orig.changedTouches.length; i++) {
                    var touch = orig.changedTouches[i];
                    // the only touchend/touchcancel event we care about is the touch
                    // that started the dragging
                    if (touch.identifier != draggingTouchId) {
                        continue;
                    }
                    if (useTransform) {
                        $(this).css({
                            "transform": "translate3d(" + (touch.pageX - offset.x) + "px, " + (touch.pageY - offset.y) + "px, 0px)",
                        });
                    } else {
                        $(this).css({
                            top: touch.pageY - offset.y,
                            left: touch.pageX - offset.x
                        });
                    }
                }
            });
            element.bind("touchend.draggableTouch touchcancel.draggableTouch", end);
        });
        return this;
    };
    
    /**
     * Draggable fallback for when touch is not available
     */
    $.fn.draggableMouse = function (actionOrSettings) {
        if (typeof(actionOrSettings) == "string") {
            // check if we shall make it not draggable
            if (actionOrSettings == "disable") {
                this.unbind("mousedown.draggableTouch");
                this.unbind("mouseup.draggableTouch");
                $(document).unbind("mousemove.draggableTouch");

                this.trigger("dragdisabled");

                return this;
            }
        } else {
            var useTransform = actionOrSettings && actionOrSettings.useTransform;
        }
        
        this.each(function() {
            var element = $(this);
            var offset = null;
            
            var move = function(e) {
                if (useTransform) {
                    element.css({
                        "transform": "translate3d(" + (e.pageX - offset.x) + "px, " + (e.pageY - offset.y) + "px, 0px)",
                    });
                } else {
                    element.css({
                        top: e.pageY - offset.y,
                        left: e.pageX - offset.x,
                    });
                }
            };
            var up = function(e) {
                element.unbind("mouseup.draggableTouch", up);
                $(document).unbind("mousemove.draggableTouch", move);
                element.trigger("dragend", {
                    top: e.pageY - offset.y,
                    left: e.pageX - offset.x
                });
            };
            element.bind("mousedown.draggableTouch", function(e) {
                var pos = element.position();
                offset = {
                    x: e.pageX - pos.left,
                    y: e.pageY - pos.top
                };
                $(document).bind("mousemove.draggableTouch", move);
                element.bind("mouseup.draggableTouch", up);
                element.trigger("dragstart", pos);
                e.preventDefault();
            });
        });
        return this;
    };
})(jQuery);
