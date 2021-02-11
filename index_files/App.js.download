(
    function() {
        $.fn.scrollView = function() {
            return this.each(function() {
                var element = $(this);
                if (element) {
                    var elementOffset = element.offset();

                    $('html, body').animate({
                        scrollTop: elementOffset.top - 5,
                        scrollLeft: elementOffset.left - 5,
                    }, 300);
                }
            });
        };
    }
)();
