define([
  'core/js/adapt',
  'core/js/views/adaptView'
], function(Adapt, AdaptView) {

  class ContentObjectView extends AdaptView {

    attributes() {
      return AdaptView.resultExtend('attributes', {
        'role': 'main',
        'aria-labelledby': `${this.model.get('_id')}-heading`
      }, this);
    }

    className() {
      return _.filter([
        this.constructor.type,
        'contentobject',
        this.constructor.className,
        this.model.get('_id'),
        this.model.get('_classes'),
        this.setVisibility(),
        (this.model.get('_isComplete') ? 'is-complete' : ''),
        (this.model.get('_isOptional') ? 'is-optional' : '')
      ], Boolean).join(' ');
    }

    preRender() {
      $.inview.lock(this.constructor.type + 'View');
      this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
      this.$el.css('opacity', 0);
      this.listenTo(this.model, 'change:_isReady', this.isReady);
    }

    render() {
      const type = this.constructor.type;
      Adapt.trigger(`${type}View:preRender contentObjectView:preRender view:preRender`, this);

      const data = this.model.toJSON();
      data.view = this;
      const template = Handlebars.templates[this.constructor.template];
      this.$el.html(template(data));

      Adapt.trigger(`${type}View:render contentObjectView:render view:render`, this);

      _.defer(() => {
        // don't call postRender after remove
        if (this._isRemoved) return;

        this.postRender();
        Adapt.trigger(`${type}View:postRender contentObjectView:postRender view:postRender`, this);
      });

      return this;
    }

    async isReady() {
      if (!this.model.get('_isReady')) return;

      const type = this.constructor.type;
      const performIsReady = () => {
        $('.js-loading').hide();
        $(window).scrollTop(0);
        Adapt.trigger(`${type}View:ready contentObjectView:ready view:ready`, this);
        $.inview.unlock(`${type}View`);
        const styleOptions = { opacity: 1 };
        if (this.disableAnimation) {
          this.$el.css(styleOptions);
          $.inview();
          _.defer(() => {
            Adapt.trigger(`${type}View:postReady contentObjectView:postReady view:postReady`, this);
          });
        } else {
          this.$el.velocity(styleOptions, {
            duration: 'fast',
            complete: () => {
              $.inview();
              Adapt.trigger(`${type}View:postReady contentObjectView:postReady view:postReady`, this);
            }
          });
        }
        $(window).scroll();
      };

      Adapt.trigger(`${type}View:preReady contentObjectView:preReady view:preReady`, this);
      await Adapt.wait.queue();
      _.defer(performIsReady);
    }

    preRemove() {
      const type = this.constructor.type;
      Adapt.trigger(`${type}View:preRemove contentObjectView:preRemove view:preRemove`, this);
    }

    remove() {
      const type = this.constructor.type;
      this.preRemove();
      Adapt.trigger(`${type}View:remove contentObjectView:preRemove view:preRemove`, this);
      this._isRemoved = true;

      Adapt.wait.for(end => {
        this.$el.off('onscreen.adaptView');
        this.model.setOnChildren('_isReady', false);
        this.model.set('_isReady', false);
        super.remove();
        _.defer(() => {
          Adapt.trigger(`${type}View:postRemove contentObjectView:preRemove view:preRemove`, this);
        });
        end();
      });

      return this;
    }

    destroy() {
      this.findDescendantViews().reverse().forEach(view => {
        view.remove();
      });
      this.childViews = [];
      this.remove();
      if (Adapt.parentView === this) {
        Adapt.parentView = null;
      }
    }

  }

  return ContentObjectView;

});