import './style.less'

var classname = 'pacebar'

var t = 0,
  b = 0,
  c = 100,
  d = 100

var requestcount = 0,
  timer

var bar, bar_progress, bar_progress_style

function expoeaseout(t, b, c, d, x) {
  x = 30
  return t == d ? b + c : c * (-Math.pow(2, (-x * t) / d) + 1) + b
}
function linear(t, b, c, d) {
  return (c * t) / d + b
}

function getnow() {
  return parseFloat(bar_progress_style.width || 0)
}

function init() {
  if (bar) return
  bar = document.createElement('div')
  bar.classList.add(classname)
  bar_progress = document.createElement('div')
  bar_progress.classList.add(`${classname}-progress`)
  bar.appendChild(bar_progress)
  document.body.appendChild(bar)
  bar_progress_style = bar_progress.style
}

async function start() {
  init()
  bar.classList.add('active')
  ++requestcount
  go()
}

function go() {
  var now = getnow(),
    z = 1 - now / 100
  clearIntervalInTime(timer)
  timer = setIntervalInTime(function (percent) {
    t = d * percent
    bar_progress_style.width = expoeaseout(t, now, c * z, d).toFixed(2) + '%'
  }, 30000 * requestcount * requestcount)
}

async function done() {
  init()
  --requestcount
  if (requestcount <= 0) {
    if (requestcount < 0) requestcount = 0
    var now = getnow(),
      z = 1 - now / 100
    var time = 100 - now
    clearIntervalInTime(timer)
    timer = setIntervalInTime(function (percent) {
      t = d * percent
      // let left = linear(t ,0 ,c ,d);
      // bar_progress_style.left = left.toFixed(2) + '%';
      bar_progress_style.width = linear(t, now, c * z, d).toFixed(2) + '%'
      if (percent === 1) {
        end()
      }
    }, time * 4)
  } else {
    go()
  }
}

function end() {
  bar.classList.remove('active')
  setTimeout(function () {
    bar_progress_style.left = 0 + '%'
    bar_progress_style.width = 0 + '%'
  }, 100)
}

// requestAnimationFrame 的兼容
// 来自  * by zhangxinxu 2013-09-30
void (function () {
  var lastTime = 0
  var vendors = ['webkit', 'moz']
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
    window.cancelAnimationFrame =
      window[vendors[x] + 'CancelAnimationFrame'] || // name has changed in Webkit
      window[vendors[x] + 'CancelRequestAnimationFrame']
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime()
      var timeToCall = Math.max(0, 16.7 - (currTime - lastTime))
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall)
      }, timeToCall)
      lastTime = currTime + timeToCall
      return id
    }
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id)
    }
  }
})()

// 在一定时间内执行回调
// @require  requestAnimationFrame
function setIntervalInTime(callback, time) {
  if (+time <= 0) time = 1000
  var now_time = Date.now(),
    _td,
    timer
  var stop = false
  function f() {
    _td = (Date.now() - now_time) / time
    if (stop) {
      cancelAnimationFrame(timer)
    } else if (_td > 1) {
      _td = 1
    } else {
      timer = requestAnimationFrame(f)
    }
    callback(_td)
  }
  f()
  return {
    stop: function () {
      stop = true
    },
  }
}

// 清除 setIntervalInTime
function clearIntervalInTime(o) {
  o && o.stop && o.stop()
}

export default { start, done }
