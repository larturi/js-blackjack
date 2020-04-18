import { Component, OnInit } from '@angular/core';
import * as _ from 'underscore';
import { stringify } from 'querystring';
import Swal from 'sweetalert2';

// 2C = Two Of Clubs (Treboles)
// 2D = Two Of Diamonds (Diamantes)
// 2H = Two Of Hearts (Corazones)
// 2S = Two Of Spades (Espadas)

let deck = [];

const tipos = ['C', 'D', 'H', 'S'];
const especiales = ['A', 'J', 'Q', 'K'];

@Component({
  selector: 'app-juego',
  templateUrl: './juego.component.html'})
export class JuegoComponent implements OnInit {

  puntosJugadores = [];
  esTurnoComputadora = false;

  historial = {jugador: 0, computadora: 0};

  constructor() {
    if (localStorage.getItem('historial')) {
      this.historial = JSON.parse(localStorage.getItem('historial'));
    }
  }

  ngOnInit(): void {
    this.inicializarJuego();
  }

  inicializarJuego(numJugadores = 2) {
    this.puntosJugadores = [];
    deck = this.crearDeck();
    for (let i = 0; i < numJugadores; i++) {
      this.puntosJugadores.push(0);
    }
  }

  crearDeck() {
    deck = [];
    for (let i = 2; i <= 10; i++) {
      for (const tipo of tipos) {
        deck.push(i + tipo);
        // Cargo las cartas la primera vez para que queden en memoria y no haya lag
        const imgCarta = document.createElement('img');
        imgCarta.src = `assets/cartas-min/${ i + tipo }-min.png`;
      }
    }

    for (const tipo of tipos) {
      for (const esp of especiales) {
        deck.push(esp + tipo);
      }
    }
    return _.shuffle(deck);
  }

  pedirCarta() {
    if (deck.length === 0) {
      return 'No hay cartas en el deck';
    }
    return deck.pop();
  }

  valorCarta(carta) {
    const valor = carta.substring(0, carta.length - 1);
    let puntos;

    if (isNaN(valor)) {
      puntos = (valor === 'A') ? 11 : 10;
    } else {
      puntos = valor * 1;
    }
    return puntos;
  }

  // Turno: 0 = primer jugador ... n: computadora
  acumularPuntos(carta, turno: number) {
    this.puntosJugadores[turno] = this.puntosJugadores[turno] + this.valorCarta(carta);
    return this.puntosJugadores[turno];
  }

  crearCarta(carta, turno) {
    const imgCarta = document.createElement('img');
    imgCarta.src = `assets/cartas-min/${ carta }-min.png`;
    imgCarta.classList.add('carta');
    const divCartasJugadores = document.querySelectorAll('.divCartas');
    divCartasJugadores[turno].append(imgCarta);
  }

  turnoComputadora( puntosMinimos: number ) {
      do {

        this.esTurnoComputadora = true;
        const carta = this.pedirCarta();
        this.acumularPuntos(carta, this.puntosJugadores.length - 1);

        this.crearCarta(carta, this.puntosJugadores.length - 1);

        if (puntosMinimos > 21) {
          break;
        }

      } while ( (this.puntosJugadores[this.puntosJugadores.length - 1] <= puntosMinimos) && (puntosMinimos <= 21) );

      const msg = this.mostrarResultadosJuego(puntosMinimos, this.puntosJugadores[this.puntosJugadores.length - 1]);

      Swal.fire({
        title: msg,
        html:
          '<br>Historial<br><br> ' +
          `<p>Jugador: ${this.historial.jugador} <br> Computadora: ${this.historial.computadora}</p>`,
        focusConfirm: false,
        allowOutsideClick: false
      });
  }

  btnJugadorPideCarta() {
    const carta = this.pedirCarta();
    const puntosJugador = this.acumularPuntos(carta, 0);

    this.crearCarta(carta, 0);

    if (puntosJugador === 21) {
       this.turnoComputadora(puntosJugador);
    }

    if (puntosJugador > 21) {
      this.turnoComputadora(puntosJugador);
    }
  }

  determinarGanador(ptsJugador: number, ptsComputadora: number) {

  }

  mostrarResultadosJuego(ptsJugador: number, ptsComputadora: number) {
    let msg: string;

    if (ptsJugador > 21) {
       msg = 'Computadora Gana 😝';
       this.historial.computadora++;
       this.guardarStorage();
       return msg;
    }

    if (ptsComputadora > 21) {
      msg = 'Jugador Gana 😎';
      this.historial.jugador++;
      this.guardarStorage();
      return msg;
    }

    if (ptsJugador > ptsComputadora) {
        msg = 'Jugador Gana 😎';
        this.historial.jugador++;
        this.guardarStorage();
    } else if (ptsJugador < ptsComputadora) {
        msg = 'Computadora Gana 😝';
        this.historial.computadora++;
        this.guardarStorage();
    } else if (ptsJugador === ptsComputadora) {
      msg = 'EMPATE';
    }

    return msg;
  }

  btnNuevoJuego() {
    this.inicializarJuego();

    this.esTurnoComputadora = false;

    const divCartasJugadores = document.querySelector('#jugador-cartas');
    divCartasJugadores.innerHTML = ' ';

    const divCartasComputadora = document.querySelector('#computadora-cartas');
    divCartasComputadora.innerHTML = ' ';

    const parrafoMensajeResultado = document.querySelector('#resultado');
    parrafoMensajeResultado.innerHTML = ' ';
  }

  guardarStorage() {
    localStorage.setItem('historial', JSON.stringify(this.historial));
  }

}


