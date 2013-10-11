/* =============================================================
 * bootstrap-typeahead.js v2.3.2
 * http://twitter.github.com/bootstrap/javascript.html#typeahead
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function($){

  "use strict"; // jshint ;_;


 /* TYPEAHEAD PUBLIC CLASS DEFINITION
  * ================================= */

  var Typeahead = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeahead.defaults, options)
    this.tokenizer = this.options.tokenizer || this.tokenizer
    this.scorer = this.options.scorer || this.scorer
    this.matcher = this.options.matcher || this.matcher
    this.sorter = this.options.sorter || this.sorter
    this.highlighter = this.options.highlighter || this.highlighter
    this.updater = this.options.updater || this.updater
    this.source = this.options.source
    this.$menu = $(this.options.menu)
    this.shown = false
    this.listen()
  }

  Typeahead.prototype = {

    constructor: Typeahead

  , select: function () {
      var val = this.$menu.find('.active').attr('data-value')
      this.$element
        .val(this.updater(val))
        .change()
      return this.hide()
    }

  , updater: function (item) {
      return item
    }

  , show: function () {
      var pos = $.extend({}, this.$element.position(), {
        height: this.$element[0].offsetHeight
      })

      this.$menu
        .insertAfter(this.$element)
        .css({
          top: pos.top + pos.height
        , left: pos.left
        })
        .show()

      this.shown = true
      return this
    }

  , hide: function () {
      this.$menu.hide()
      this.shown = false
      return this
    }

  , lookup: function (event) {
      var items

      this.query = this.$element.val() || ''

      if (this.query.length < this.options.minLength) {
        return this.shown ? this.hide() : this
      }

      items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source
      return items ? this.process(items) : this
    }

  , process: function (items) {
      var that = this

      items = $.grep(items, function (item) {
        return that.matcher(item)
      })

      items = this.sorter(items)

      if (!items.length) {
        return this.shown ? this.hide() : this
      }
      
      return this.render(items.slice(0, this.options.items)).show()
    }
  
  , words: function() {
    var query;
    query = this.query.toLowerCase();
    return query.trim().split(/\s+|,|;/);
  }
  , tokenizer: function() {
      var max_gram, min_gram, query, tokens, words;
      query = this.query.toLowerCase();
      words = this.words();
      tokens = {};
      min_gram = this.options.min_gram;
      max_gram = this.options.max_gram;
      // if query words length < max_gram specified
      if (words.length <= max_gram) {
        max_gram = words.length;
      }
      else {
        // add query itself as one of the token
        tokens[words.length] = [words.join(" ")];
      }
      // find n-gram consecutive tokens
      $.each(words, function(i, w) {
        var gram, token
        gram = min_gram;
        // for each gram find tokens 
        while (gram <= max_gram) {
          if (tokens[gram] === undefined) {
            tokens[gram] = [];
          }
          token = words.slice(i, i + gram);
          if (token.length === gram) {
            tokens[gram].push(token.join(" "));
          }
          gram++;
        }
      })
      return tokens
    }

  , matcher: function (item) {
      var item, regex, tokens;
      // get clean item
      item = item.trim().split(/\s|,|;/).join(' ').toLowerCase();
      // flatten tokens
      tokens = $.map(this.tokenizer(), function(v, k) {
          return v;
      });
      regex = new RegExp(tokens.reverse().join('|'), 'i');
      return regex.test(item); //match yes? No?
    }
  , scorer: function (item, skip_stopwords) {
      var score, current_score, gram, min_gram, tag, tokens, _tokens, stopwords, stop_regex;
      
      //get n gram tokens
      tokens = this.tokenizer();
      gram = this.words().length;
      min_gram = this.options.min_gram;
      //clean item
      tag = item.trim().split(/\s|,|;/).join(' ');
      //iterate over n-gram tokens
      while (gram >= min_gram) {
        score = 0;
        _tokens = tokens[gram];
        if (skip_stopwords && gram === 1) { //exclude stopword
          stopwords = this.options.stopwords
          _tokens = _tokens.filter(function(i){ return !(stopwords.indexOf(i) > -1); });
        }
        if (_tokens) {
          $.each(_tokens, function(i, token) {
            var regex;
            regex = new RegExp(token, 'i');
            if (regex.test(tag)) { //match occured
              // calculate weightage
              current_score = 100 * token.length /item.length;
              // get higesh score in this gram
              if(current_score > score) {
                score = current_score;
              }
            }
          });
        }
        if (score > 0) {
          //need not search next gram
          //in sorting higher gram takes precedance over score
          break; 
        }
        gram--;
      }
      return [item, gram, score];
  }
  , sorter: function (items) {
      var result, that;
      that = this;
      // get gram and score based on match token and input item
      result = $.map(items, function(item) {
        return [that.scorer(item, true)]; //exclude stopwords clean search :)
      });
      // reject items having score zero
      result = $.grep(result, function(item) {
        return item[2] > 0;
      });
      // ohh..we can't show empty list, have stopwords included
      // note: isEmptyObject function doesn't work when we include timelinejs
      if (!result.length) {
        result = $.map(items, function(item) {
          return [that.scorer(item, false)]; //include stopwords too :(
        });
      }
      // brand new tag? and result is not empty?
      // allow brand new tag as a part of autocomplete
      // note: isEmptyObject function doesn't work when we include timelinejs
      if (result.length) {
        if (!result.some(function(item) {
          return item[0].toLowerCase() === that.query.toLowerCase();
        })) {
          if(that.query != ""){
            result.push([that.query, that.words().length, 100]);
          }
        }
      }
      // double sort results
      // based on gram and score
      result = result.sort(function(a, b) {
        if (a[1] === b[1]) {
          return b[2] - a[2];
        } else {
          return b[1] - a[1];
        }
      });
      // map items only
      return $.map(result, function(i) {
        return i[0]; //extract keys
      });
    }

  , highlighter: function (item) {

    var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
    var tokens = $.map(this.tokenizer(), function(v, k) {
      return v;
    });
    return item.replace(new RegExp('(' + tokens.reverse().join('|') + ')', 'ig'), function ($1, match) {
      return '<strong>' + match + '</strong>'
    })
  }

  , render: function (items) {
    var that = this

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item)
        i.find('a').html(that.highlighter(item))
        return i[0]
      })

    items.first().addClass('active')
      this.$menu.html(items)
      return this
  }

  , next: function (event) {
    var active = this.$menu.find('.active').removeClass('active')
      , next = active.next()

      if (!next.length) {
        next = $(this.$menu.find('li')[0])
      }

    next.addClass('active')
  }

  , prev: function (event) {
    var active = this.$menu.find('.active').removeClass('active')
      , prev = active.prev()

      if (!prev.length) {
        prev = this.$menu.find('li').last()
      }

    prev.addClass('active')
  }

  , listen: function () {
    this.$element
      .on('focus',    $.proxy(this.focus, this))
      .on('blur',     $.proxy(this.blur, this))
      .on('keypress', $.proxy(this.keypress, this))
      .on('keyup',    $.proxy(this.keyup, this))

      if (this.eventSupported('keydown')) {
        this.$element.on('keydown', $.proxy(this.keydown, this))
      }

    this.$menu
      .on('click', $.proxy(this.click, this))
      .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
      .on('mouseleave', 'li', $.proxy(this.mouseleave, this))
  }

  , eventSupported: function(eventName) {
    var isSupported = eventName in this.$element
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;')
          isSupported = typeof this.$element[eventName] === 'function'
      }
    return isSupported
  }

  , move: function (e) {
    if (!this.shown) return

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault()
            break

        case 38: // up arrow
            e.preventDefault()
              this.prev()
              break

        case 40: // down arrow
          e.preventDefault()
          this.next()
          break
      }

      e.stopPropagation()
    }

  , keydown: function (e) {
      this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40,38,9,13,27])
      if (e.keyCode === 9) { // tab
        if (!this.shown) return;
          this.select();
        } else {
          this.move(e);
        }
    }

  , keypress: function (e) {
      if (this.suppressKeyPressRepeat) return
      this.move(e)
    }

  , keyup: function (e) {
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
        case 16: // shift
        case 17: // ctrl
        case 18: // alt
          break

        case 9: // tab
        case 13: // enter
          if (!this.shown) return
          this.select()
          break

        case 27: // escape
          if (!this.shown) return
          this.hide()
          break

        default:
          this.lookup()
      }

      e.stopPropagation()
      e.preventDefault()
  }

  , focus: function (e) {
      this.focused = true
      if (!this.mouseover) {
        this.lookup(e);
      }
    }

  , blur: function (e) {
      this.focused = false
      if (!this.mousedover && this.shown) this.hide()
    }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      
      this.select()
      this.$element.focus()
    }

  , mouseenter: function (e) {
      this.mousedover = true
      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
    }

  , mouseleave: function (e) {
      this.mousedover = false
      if (!this.focused && this.shown) this.hide()
    }

  }


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  var old = $.fn.typeahead

  $.fn.typeahead = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeahead.defaults = {
    source: []
  , items: 8
  , min_gram: 1
  , max_gram: 4
  , stopwords: []
  , menu: '<ul class="typeahead dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  , minLength: 1
  }

  $.fn.typeahead.Constructor = Typeahead


 /* TYPEAHEAD NO CONFLICT
  * =================== */

  $.fn.typeahead.noConflict = function () {
    $.fn.typeahead = old
    return this
  }


 /* TYPEAHEAD DATA-API
  * ================== */

  $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
    var $this = $(this)
    if ($this.data('typeahead')) return
    $this.typeahead($this.data())
  })

}(window.jQuery);
