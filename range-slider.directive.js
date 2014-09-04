angular.module('app.directives.angularRangeSlider', [])
.directive('angularRangeSlider', ['$compile', function ($compile) {
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
      var slider = element[0],
          handleContainer = slider.querySelector('.angular-range-slider-handles'),
          $track = angular.element(slider.querySelector('.angular-range-slider-track')),
          $doc = angular.element(document.documentElement),
          $handles;

      var totalWidth = slider.clientWidth,
          totalValue = scope.max - scope.min,
          stepNum = totalValue / scope.step,
          stepValue = scope.step,
          stepWidth = totalWidth / stepNum,
          currentHandle,
          currentPos = -1,
          prevHandle,
          nextHandle,
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
          currentHandle = this;

          // find current , prev & next handle
          for (var i = $handles.length - 1; i >= 0; i--) {
            if ($handles[i] == currentHandle) {
              prevHandle = $handles[i - 1];
              nextHandle = $handles[i + 1];
              currentPos = i;
              break;
            }
          };

          // show value
          currentHandle.querySelector('i').style.display = 'inline-block';

          $doc.bind('mousemove', mouseMoveHandler);
        });

        $doc.bind('mouseup', function (e) {
          if (currentHandle) {
            $doc.unbind('mousemove', mouseMoveHandler);
            currentHandle.querySelector('i').style.display = 'none';
            currentHandle = null;
          }
        });

        function mouseMoveHandler (e) {
          if (!currentHandle)  return;

          offset = e.screenX - startX;

          var newLeft = left + offset;

          if (newLeft <= totalWidth && newLeft >= 0) {
            // not between prev & next
            if (prevHandle && newLeft <= prevHandle.offsetLeft) {
              newLeft = prevHandle.offsetLeft;
            } else if (nextHandle && newLeft >= nextHandle.offsetLeft) {
              newLeft = nextHandle.offsetLeft;
            };

          } else if (newLeft > totalWidth) {
            newLeft = totalWidth;
          } else if (newLeft < 0) {
            newLeft = 0;
          }

          currentHandle.style.left = Math.round(stepNum * newLeft / totalWidth) * stepWidth + 'px';

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
        var num = slider.querySelectorAll('.angular-range-slider-handle').length;

        if (scope.handles.length !== num) {
          var count = 0,
              fragment = document.createDocumentFragment(),
              pgFragment = document.createDocumentFragment();

          handleContainer.innerHTML = '';

          angular.forEach(scope.handles, function (h, i) {
            var handle = document.createElement('span'),
                tip = document.createElement('i');

            tip.setAttribute('ng-bind', 'handles[' + i + ']');

            handle.appendChild(tip);
            handle.className = 'angular-range-slider-handle angular-range-slider-handle-' + (count++);
            fragment.appendChild(handle);
          });
          $compile(fragment)(scope);
          handleContainer.appendChild(fragment);
          $handles = angular.element(slider.querySelectorAll('.angular-range-slider-handle'));

          bindEvent();
        }
      }

    }
  }  
}]);