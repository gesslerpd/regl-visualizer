/* global Audio */

const regl = require('regl')()
const camera = require('regl-camera')(regl, {
  center: [0, 0, 0],
  damping: 0
})

const analyse = require('web-audio-analyser')

require('soundcloud-badge')({
  client_id: '4027e272825f07badf19f66d7827a79f',
  song: 'https://soundcloud.com/khamsinmusic/maelstrom',
  dark: false,
  getFonts: true
}, function (err, src) {
  if (err) throw err
  var audio = new Audio()
  audio.crossOrigin = 'anonymous'
  audio.src = src
  audio.loop = true
  var analyzer = analyse(audio, { audible: true, stereo: false })

  audio.play()

  var drawWaveform = regl({
    vert: `
    precision mediump float;
    attribute vec3 xy;
    uniform mat4 projection, view;
    void main () {
      gl_Position = projection * view * vec4(xy,1);
    }
  `,
    frag: `
    void main () {
      gl_FragColor = vec4(0,0.3333,1,1);
    }
  `,
    attributes: {
      xy: () => Array.from(analyzer.waveform()).map((freq, i) => {
        return [0, (freq - 128) / 128, i / 1023 * 2 - 1]
      })
    },
    primitive: 'line strip',
    count: 1024
  })

  var drawFreq = regl({
    vert: `
    precision mediump float;
    attribute vec3 xy;
    uniform mat4 projection, view;
    void main () {
      gl_Position = projection * view * vec4(xy,1);
    }
  `,
    frag: `
    void main () {
      gl_FragColor = vec4(1,0,0.2156,1);
    }
  `,
    attributes: {
      xy: () => Array.from(analyzer.frequencies()).map((freq, i) => {
        return [(freq) / 512, 0, i / 1023 * 2 - 1]
      })
    },
    primitive: 'line strip',
    count: 1024
  })

  regl.frame(() => {
    regl.clear({ color: [0, 0, 0, 1] })
    camera(() => {
      drawWaveform()
      drawFreq()
    })
  })
})
