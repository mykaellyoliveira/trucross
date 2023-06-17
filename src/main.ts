import {append, create} from './utilities'
import './style.scss'
import './trailer'

const width = innerWidth
const height = innerHeight
const canvas = create('canvas', {width, height})
const contexto = canvas.getContext('2d')!
append(canvas)()

const tamanho = 50
const dunas = 750
const Tecla: Record<string, number> = {
  ArrowUp: 0,
  ArrowDown: 0,
  ArrowLeft: 0,
  ArrowRight: 0,
}

let tempo = 0
let velocidade = 0
let jogando = true
let vidas = 5
let pontos = 0
let acelerar = false


class Piloto {
  posicao = {
    x: width / 2,
    y: 0,
  }

  velocidade = {
    vertical: 0,
    rotacao: 0,
  }

  rotacao = 0

  imagem = new Image()

  constructor() {
    this.imagem.src = 'piloto.svg'
  }

  desenha() {
    const roda = {
      traseira: height - noise(tempo + this.posicao.x) * 0.25,
      dianteira: height - noise(tempo + 5 + this.posicao.x) * 0.25,
    }

    let deCastigo = 0

    if (roda.traseira - tamanho > this.posicao.y) {
      this.velocidade.vertical += 0.1
    } else {
      acelerar = true
      this.velocidade.vertical -= this.posicao.y - (roda.traseira - tamanho)
      this.posicao.y = roda.traseira - tamanho
      deCastigo = 1
    }

    if (!jogando || (deCastigo && Math.abs(this.rotacao) > Math.PI * 0.5)) {
      if (vidas !== 0) {
        vidas--
        this.posicao.y = 0
        this.velocidade.rotacao = 0
        this.rotacao = 0
        deCastigo = 0
        acelerar = false
      }
      if (vidas === 0) {
        jogando = false
        this.velocidade.rotacao = 0
        Tecla.ArrowUp = 1
        this.posicao.x -= velocidade * 2
      }
    }

    const angulo = Math.atan2(
      roda.dianteira - tamanho - this.posicao.y,
      this.posicao.x + 5 - this.posicao.x
    )

    this.posicao.y += this.velocidade.vertical

    if (deCastigo && jogando) {
      this.rotacao -= (this.rotacao - angulo) * 0.5
      this.velocidade.rotacao =
        this.velocidade.rotacao - (angulo - this.rotacao)
    }

    this.velocidade.rotacao += (Tecla.ArrowLeft - Tecla.ArrowRight) * 0.05
    this.rotacao -= this.velocidade.rotacao * 0.1

    if (this.rotacao > Math.PI) this.rotacao = -Math.PI
    if (this.rotacao < -Math.PI) this.rotacao = Math.PI

    contexto.save()
    contexto.translate(this.posicao.x, this.posicao.y)
    contexto.rotate(this.rotacao)
    contexto.drawImage(
      this.imagem,
      -tamanho,
      -tamanho,
      tamanho * 2,
      tamanho * 2
    )

    contexto.restore()
  }
}

const piloto = new Piloto()

/**
 * Define o mapa do jogo
 */
const perm: number[] = []
let value
while (perm.length < dunas) {
  while (perm.includes((value = Math.floor(Math.random() * dunas))));
  perm.push(value)
}

function lerp(start: number, end: number, t: number) {
  return start + ((end - start) * (1 - Math.cos(t * Math.PI))) / 2
}
function noise(x: number) {
  x = (x * 0.005) % dunas
  return lerp(perm[Math.floor(x)], perm[Math.ceil(x)], x - Math.floor(x))
}

function desenhaCenario() {
  if (Tecla.ArrowUp == 1 && jogando && acelerar) {
    velocidade -= (velocidade - (Tecla.ArrowUp - Tecla.ArrowDown)) * 0.1
    tempo += 10 * velocidade
    pontos++
  }

  if (!jogando) {
    velocidade -= (velocidade - (Tecla.ArrowUp - Tecla.ArrowDown)) * 0.1
    tempo += 10 * velocidade
  }

  contexto.fillStyle = 'cornflowerblue'
  contexto.fillRect(0, 0, width, height)
  contexto.beginPath()
  contexto.moveTo(0, height)

  contexto.fillStyle = 'burlywood'
  for (let i = 0; i < width; i++) {
    contexto.lineTo(i, height - noise(tempo + i) * 0.25)
  }
  contexto.lineTo(width, height)
  contexto.fill()

  contexto.fillStyle = 'black'
  contexto.fillText('TrucCross', 50, 50)
  contexto.fillText('Vidas: ' + vidas + '/5', 50, 90)
  contexto.fillText('Pontuação: ' + pontos, 50, 130)
  contexto.font = '20px Roboto'

  if (vidas === 0) {
    contexto.font = '25px Roboto'
    contexto.textBaseline = 'middle'
    contexto.fillStyle = 'red'
    contexto.fillText('Game Over', width / 2.0, height / 2.8)
    contexto.strokeText('Pressione Enter para jogar novamente', width / 2.5, height / 2.4)
  }

  piloto.desenha()
  requestAnimationFrame(desenhaCenario)
}

onkeydown = (event) => {
  const key = event.key

  if (key === 'ArrowUp') {
    if (acelerar) {
      Tecla[event.key] = 1
    }
  } else {
    Tecla[event.key] = 1
  }

  if (event.key === 'Enter') {
    pontos = 0
    jogando = true
    vidas = 5
    piloto.velocidade.rotacao = 0
    piloto.rotacao = 0
    piloto.posicao.x = width / 2
    piloto.posicao.y = 0
    Tecla.ArrowUp = 0
  }
}
onkeyup = (event) => {
  Tecla[event.key] = 0
}

desenhaCenario()
