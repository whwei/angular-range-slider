angular.module('app.directives.angularRangeSlider', [])
.directive('angularRangeSlider', function () {
  return {
    restrict: 'AE',
    template: '\
      <div class="angular-range-slider">\
        <div class="angular-range-slider-range">\
          <div class="angular-range-slider-track"></div>\
          <div class="angular-range-slider-handlers"></div>\
        </div>\
        <div class="angular-range-slider-values">\
          {{handlers | json}}\
        </div>\
      </div>\
    ',
    replace: true,
    scope: {
      handlers: '=',
      formatter: '=',
      parser: '=',
      min: '@',
      max: '@'
    },
    link: function(scope, element, attr) {
      var handlerTpl = '<span class="angular-range-slider-handler"></span>',
          slider = element[0],handerContainer = slider.querySelector('.angular-range-slider-handlers'),$track = angular.element(slider.querySelector('.angular-range-slider-track')),
          $doc = angular.element(document.documentElement),
          $handlers;


      var totalWidth = slider.clientWidth,
          totalValue = scope.max - scope.min,
          currentHandler,
          currentPos = -1,
          prevHandler,
          nextHandler,
          startX,
          offset,
          left;

      scope.$watch('handlers', function (nv) {
        initHandlers();
        fixPosition();
      }, true);


      function bindEvent () {
        $handlers.bind('mousedown', function (e) {
          offset = 0;
          left = this.offsetLeft;
          startX = e.screenX;
          currentHandler = this;

          // find current , prev & next handler
          for (var i = $handlers.length - 1; i >= 0; i--) {
            if ($handlers[i] == currentHandler) {
              prevHandler = $handlers[i - 1];
              nextHandler = $handlers[i + 1];
              currentPos = i;
              break;
            }
          };

          $doc.bind('mousemove', mouseMoveHandler);
        });

        $doc.bind('mouseup', function (e) {
          if (currentHandler) {
            $doc.unbind('mousemove', mouseMoveHandler);
            currentHandler = null;
          }
        });

        function mouseMoveHandler (e) {
          if (!currentHandler)  return;

          offset = e.screenX - startX;

          var newLeft = left + offset;

          if (newLeft <= totalWidth && newLeft >= 0) {
            // between prev & next
            if ((prevHandler && newLeft <= prevHandler.offsetLeft) ||
                (nextHandler && newLeft >= nextHandler.offsetLeft)) {
              return;     
            };
            currentHandler.style.left = newLeft + 'px';
          } else if (newLeft > totalWidth) {
            var max = (nextHandler && nextHandler.offsetLeft) || totalWidth;
            currentHandler.style.left = max + 'px';
          } else if (newLeft < 0) {
            var min = (prevHandler && prevHandler.offsetLeft) || 0;
            currentHandler.style.left = min + 'px';
          }
          scope.handlers[currentPos] = totalValue * (currentHandler.offsetLeft / totalWidth);
          scope.$apply();
        }
      }
      

      // fix position
      function fixPosition() {
        angular.forEach(scope.handlers, function (h, i) {
          $handlers[i].style.left = totalWidth * (h / totalValue) + 'px';
        });  
      }

      function initHandlers () {
        var num = slider.querySelectorAll('.angular-range-slider-handler').length;

        if (scope.handlers.length !== num) {
          var count = 0,
              fragment = document.createDocumentFragment();

          handerContainer.innerHTML = '';

          angular.forEach(scope.handlers, function (h, i) {
            var handler = document.createElement('span');
            handler.className = 'angular-range-slider-handler angular-range-slider-handler-' + (count++);
            fragment.appendChild(handler);
          });

          handerContainer.appendChild(fragment);
          $handlers = angular.element(slider.querySelectorAll('.angular-range-slider-handler'));

          bindEvent();
        }
      }

    }
  }  
});