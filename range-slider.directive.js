angular.module('app.directives.angularRangeSlider', [])
.directive('angularRangeSlider', function () {
  return {
    restrict: 'AE',
    template: '\
      <div class="angular-range-slider">\
        <div class="angular-range-slider-range">\
          <div class="angular-range-slider-track"></div>\
          <div class="angular-range-slider-handles"></div>\
        </div>\
        <div class="angular-range-slider-values">\
          {{handles | json}}\
        </div>\
      </div>\
    ',
    replace: true,
    scope: {
      handles: '=',
      formatter: '=',
      parser: '=',
      min: '@',
      max: '@',
      step: '@'
    },
    link: function(scope, element, attr) {
      var slider = element[0],handerContainer = slider.querySelector('.angular-range-slider-handles'),$track = angular.element(slider.querySelector('.angular-range-slider-track')),
          $doc = angular.element(document.documentElement),
          $handles;

      var totalWidth = slider.clientWidth,
          totalValue = scope.max - scope.min,
          stepNum = totalValue / scope.step,
          stepValue = scope.step,
          stepWidth = totalWidth / stepNum,
          currentHandler,
          currentPos = -1,
          prevHandler,
          nextHandler,
          startX,
          offset,
          left;

      scope.$watch('handles', function (nv) {
        scope.handles.sort(function (a, b) {
            return a > b ? 1 : -1;
        });
        initHandles();
        fixPosition();
      }, true);


      function bindEvent () {
        $handles.bind('mousedown', function (e) {
          offset = 0;
          left = this.offsetLeft;
          startX = e.screenX;
          currentHandler = this;

          // find current , prev & next handler
          for (var i = $handles.length - 1; i >= 0; i--) {
            if ($handles[i] == currentHandler) {
              prevHandler = $handles[i - 1];
              nextHandler = $handles[i + 1];
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

          // if (newLeft <= totalWidth && newLeft >= 0) {
          //   // not between prev & next
          //   if ((prevHandler && newLeft <= prevHandler.offsetLeft) ||
          //       (nextHandler && newLeft >= nextHandler.offsetLeft)) {
          //     return;     
          //   };

          //   currentHandler.style.left = Math.round(stepNum * newLeft / totalWidth) * stepWidth + 'px';
          //   console.log( Math.round(stepNum * newLeft / totalWidth) * stepWidth );
          // } else if (newLeft > totalWidth) {

          //   var max = (nextHandler && Math.round(stepNum * nextHandler.offsetLeft / totalWidth) * stepWidth) || totalWidth;

          //   currentHandler.style.left = max + 'px';
          // } else if (newLeft < 0) {

          //   var min = (prevHandler && Math.round(stepNum * prevHandler.offsetLeft / totalWidth) * stepWidth) || 0;

          //   currentHandler.style.left = min + 'px';
          // }

          if (newLeft <= totalWidth && newLeft >= 0) {
            // not between prev & next
            if (prevHandler && newLeft <= prevHandler.offsetLeft) {
              newLeft = prevHandler.offsetLeft;
            } else if (nextHandler && newLeft >= nextHandler.offsetLeft) {
              newLeft = nextHandler.offsetLeft;
            };

          } else if (newLeft > totalWidth) {
            newLeft = totalWidth;
          } else if (newLeft < 0) {
            newLeft = 0;
          }

          currentHandler.style.left = Math.round(stepNum * newLeft / totalWidth) * stepWidth + 'px';

          scope.handles[currentPos] = stepValue * Math.round(stepNum * newLeft / totalWidth);
          scope.$apply();
        }
      }
      

      // fix position
      function fixPosition() {
        angular.forEach(scope.handles, function (h, i) {
          $handles[i].style.left = Math.round( h / stepValue) * stepWidth + 'px';
        });  
      }

      function initHandles () {
        var num = slider.querySelectorAll('.angular-range-slider-handler').length;

        if (scope.handles.length !== num) {
          var count = 0,
              fragment = document.createDocumentFragment(),
              pgFragment = document.createDocumentFragment();

          handerContainer.innerHTML = '';

          angular.forEach(scope.handles, function (h, i) {
            var handler = document.createElement('span');
            handler.className = 'angular-range-slider-handler angular-range-slider-handler-' + (count++);
            fragment.appendChild(handler);
          });

          handerContainer.appendChild(fragment);
          $handles = angular.element(slider.querySelectorAll('.angular-range-slider-handler'));

          bindEvent();
        }
      }

    }
  }  
});