/* global Audio */

const regl = require('regl')()
const camera = require('regl-camera')(regl, {
  center: [0, 0, 0],
  damping: 0
})

const analyse = require('web-audio-analyser')

require('soundcloud-badge')({
  client_id: 'YOUR_SOUNDCLOUD_CLIENTID',
  song: 'https://soundcloud.com/khamsinmusic/maelstrom',
  dark: false,
  getFonts: false
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
      gl_FragColor = vec4(1,0,0.2156,1);
    }
  `,
    attributes: {
      xyz: () => Array.from(analyzer.frequencies()).map((freq, i) => {
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
      drawFrequency()
    })
  })
})
