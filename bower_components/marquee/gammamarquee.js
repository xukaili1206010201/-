(function() {
    $.fn.marquee = function(options) {

        options = $.extend({
            delay: 500,
            speed: 150,
            direction: 'left'
        }, options);

        options = $.extend(options, {
            'left': {
                remove: 'shift',
                append: 'push'
            },

            'right': {
                remove: 'pop',
                append: 'unshift'
            }
        }[options.direction]);

        this.each(function() {
            new Marquee($(this));
        });

        function Marquee(that) {
            var isOver = false,
                valueBackup;

            that.bind('mouseover', function() {
                isOver = true;
                valueBackup = that.val();

                that.val(that.val() + ' ');

                setTimeout(function() {
                    var interval = setInterval(function(){
                    if(isOver === true) {
                       var value = that.val().split(''),
                           letter = value[options.remove]();

                       value[options.append](letter);

                       that.val(value.join(''));
                    } else {
                        clearInterval(interval);
                    }

                    }, options.speed);
                }, options.delay);
            });

            that.bind('mouseout focus', function() {
                isOver = false;
                that.val(valueBackup);
            });
        }

        return this;
    };
})();