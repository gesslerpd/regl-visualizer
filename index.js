var regl = require('regl')()
var analyse = require('web-audio-analyser')
var soundcloudBadge = require('soundcloud-badge')
var camera = require('regl-camera')(regl, {
  center: [0, 0, 0],
  theta: 0.717,
  phi: 0.717,
  distance: 3,
  damping: 0
})

var audio = document.createElement('audio')
audio.crossOrigin = 'anonymous'
audio.controls = true
audio.loop = true

var analyzer = analyse(audio, { audible: true, stereo: false })

var drawWaveform = regl({
  vert: `
    precision mediump float;
    attribute vec3 xyz;
    uniform mat4 projection, view;
    void main () {
      gl_Position = projection * view * vec4(xyz,1);
    }
  `,
  frag: `
    void main () {
      gl_FragColor = vec4(0,0.3333,1,1);
    }
  `,
  attributes: {
    xyz: () => Array.from(analyzer.waveform()).map((freq, i) => {
      return [0, (freq - 128) / 128, i / 1023 * 2 - 1]
    })
  },
  primitive: 'line strip',
  count: 1024
})

var drawFrequency = regl({
  vert: `
    precision mediump float;
    attribute vec3 xyz;
    uniform mat4 projection, view;
    void main () {
      gl_Position = projection * view * vec4(xyz,1);
    }
  `,
  frag: `
    void main () {
      gl_FragColor = vec4(0,1,0,1);
    }
  `,
  attributes: {
    xyz: () => Array.from(analyzer.frequencies()).slice(0, 256).map((freq, i) => {
      return [(freq) / 512, 0, i / 256 * 2 - 1]
    })
  },
  primitive: 'line strip',
  count: 256
})

regl.frame(() => {
  regl.clear({ color: [0, 0, 0, 1] })
  camera(() => {
    drawWaveform()
    drawFrequency()
  })
})

var CLIENT_ID = 'your_client_id'
var html = require('choo/html')
var choo = require('choo')

var app = choo()
app.use(playStore)
app.route('*', mainView)

var el = app.start()
el.appendChild(audio)
document.body.appendChild(el)

function mainView (state, emit) {
  return html`
    <div class="controls" onload=${onLoad}>
      <form onsubmit=${onSubmit}>
        <input type="text" placeholder="SoundCloud URL">
      </form>
    </div>
  `

  function onSubmit (e) {
    const input = e.target.children[0]
    emit('play', input.value)
    input.value = ''
    e.preventDefault()
  }

  function onLoad () {
    emit('play', 'https://soundcloud.com/khamsinmusic/maelstrom')
  }
}

function playStore (state, emitter) {
  state.trackDiv = undefined
  emitter.on('play', function (uri) {
    soundcloudBadge({
      client_id: CLIENT_ID,
      song: uri,
      dark: false,
      getFonts: false
    },
      function (err, src, data, div) {
        if (err) throw err
        var wasPlaying = !audio.paused
        audio.src = src
        audio.load()
        if (state.trackDiv) {
          state.trackDiv.remove()
        }
        if (wasPlaying) {
          audio.play()
        }
        state.trackDiv = div
      })
  })
}
