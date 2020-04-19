import { Component, OnInit } from '@angular/core';
import * as _ from 'underscore';
import { stringify } from 'querystring';
import Swal from 'sweetalert2';

let deck = [];

const tipos = ['C', 'D', 'H', 'S'];
const especiales = ['A', 'J', 'Q', 'K'];

@Component({
  selector: 'app-juego',
  templateUrl: './juego.component.html'})
export class JuegoComponent implements OnInit {

  puntosJugadores = [];
  manosJugadores = [];
  esTurnoComputadora = false;

  historial = {jugador: 0, computadora: 0, empate: 0};

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
    deck = this.crearDeck(4);

    this.manosJugadores = [];
    this.manosJugadores[0] = [];
    this.manosJugadores[1] = [];

    for (let i = 0; i < numJugadores; i++) {
      this.puntosJugadores.push(0);
      const divCartasJugadores = document.querySelectorAll('.divCartas');
      divCartasJugadores[i].innerHTML = ' ';
    }

    this.esTurnoComputadora = false;

    // Primeras dos cartas del jugador
    this.btnJugadorPideCarta();
    this.btnJugadorPideCarta();

    if (!this.esBlackJack(this.manosJugadores[0])) {
      // Primera carta de la computadora
      const carta = this.pedirCarta();
      this.acumularPuntos(carta, this.puntosJugadores.length - 1);
      this.crearCarta(carta, this.puntosJugadores.length - 1);
      this.manosJugadores[this.puntosJugadores.length - 1].push(this.valorCarta(carta));
    }

  }

  crearDeck(cantidadMazos) {
    deck = [];

    for (let j = 0; j < cantidadMazos; j++) {

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

    }

    // return ['4S', '10S', '3C', '10H', '8C', '4C', '10S', 'AS'];
    // return ['4S', '10S', '3C', '9H', '8C', '4C', '10S', 'AS'];
    // return ['4S', '10S', '3C', 'AH', 'AC', '10C', '10S', '10S'];
    // return ['4S', '10S', '3C', 'AH', 'AC', '10C', 'AS', '10S'];
    // return ['4S', '8S', '8C', '7H', '3C', '2C', '9S', '9S'];
    // return ['4S', '8S', '9C', 'KH', 'AC', '5C', '4S', 'QS'];
    // return ['9S', 'KS', 'AC', '8H', '8C', '3C', 'KS', '3S'];
    // return ['9S', 'KS', 'KC', 'AH', '5C', '9C', '10S', '9S'];
    // return ['9S', 'KS', 'KC', 'AH', '6C', '9C', 'AS', '5S'];
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

    const valCarta = this.valorCarta(carta);

    const ases = this.contarAses(this.manosJugadores[turno]);

    if (ases > 0 && this.puntosJugadores[turno] + valCarta > 21) {
      this.asValeUno(turno); // <-- Reemplazo el 11 por 1
      this.puntosJugadores[turno] = this.puntosJugadores[turno] - 10;
    }

    if (valCarta === 11 && this.puntosJugadores[turno] + 11 > 21) {
       this.puntosJugadores[turno] = this.puntosJugadores[turno] + 1;
    } else if (valCarta === 11 && this.puntosJugadores[turno] + 11 <= 21) {
       this.puntosJugadores[turno] = this.puntosJugadores[turno] + 11;
    } else {
      this.puntosJugadores[turno] = this.puntosJugadores[turno] + valCarta;
    }

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

    this.esTurnoComputadora = true;

    while ( this.puntosJugadores[this.puntosJugadores.length - 1] <= puntosMinimos &&
            this.puntosJugadores[this.puntosJugadores.length - 1] < 17 && puntosMinimos <= 21 ) {

        const carta = this.pedirCarta();

        this.manosJugadores[this.puntosJugadores.length - 1].push(this.valorCarta(carta));
        this.acumularPuntos(carta, this.puntosJugadores.length - 1);
        this.crearCarta(carta, this.puntosJugadores.length - 1);
    }

    this.mostrarResultadosJuego(puntosMinimos, this.puntosJugadores[this.puntosJugadores.length - 1]);
  }

  btnJugadorPideCarta() {
    const carta = this.pedirCarta();
    this.manosJugadores[0].push(this.valorCarta(carta));

    const puntosJugador = this.acumularPuntos(carta, 0);

    this.crearCarta(carta, 0);


    if (puntosJugador === 21) {
       this.turnoComputadora(puntosJugador);
    }

    if (puntosJugador > 21) {
      this.turnoComputadora(puntosJugador);
    }
  }

  mostrarResultadosJuego(ptsJugador: number, ptsComputadora: number) {

    let msg: string;

    if (ptsJugador > 21) {
      // Se pasa el jugador, gana la computadora
      this.historial.computadora++;
      this.guardarStorage();
      msg = 'Computadora Gana 😝';

    } else if (ptsComputadora > 21) {
      // Se pasa la computadora, gana el jugador
      this.historial.jugador++;
      this.guardarStorage();
      msg = 'Jugador Gana 😎';

    } else if (this.esBlackJack(this.manosJugadores[0]) && ptsComputadora === 21 && !this.esBlackJack(this.manosJugadores[1])) {
      // Blackjack jugador, computadora 21, gana jugador
      this.historial.computadora++;
      this.guardarStorage();
      msg = 'Blackjack! Jugador Gana 😎';

    } else if (this.esBlackJack(this.manosJugadores[1]) && ptsJugador === 21 && !this.esBlackJack(this.manosJugadores[0])) {
      // Blackjack computadora, jugador 21, gana computadora
      this.historial.computadora++;
      this.guardarStorage();
      msg = 'Blackjack! Computadora Gana 😝';

    } else if (this.esBlackJack(this.manosJugadores[0]) && this.esBlackJack(this.manosJugadores[1])) {
      // Blackjack computadora y jugador 21, empate
      this.historial.empate++;
      this.guardarStorage();
      msg = 'Empate 😐';

    } else if (ptsJugador > ptsComputadora) {
        this.historial.jugador++;
        this.guardarStorage();
        msg = 'Jugador Gana 😎';

    } else if (ptsJugador < ptsComputadora) {
        this.historial.computadora++;
        this.guardarStorage();
        msg = 'Computadora Gana 😝';

    } else if (ptsJugador === ptsComputadora) {
        this.historial.empate++;
        this.guardarStorage();
        msg =  'Empate 😐';
    }

    Swal.fire({
      title: msg,
      html:
        '<br>Historial<br><br> ' +
        `<p>Jugador: ${this.historial.jugador} <br>
            Computadora: ${this.historial.computadora} <br>
            Empate: ${this.historial.empate}
         </p>`,
      focusConfirm: false,
      allowOutsideClick: false
  });

  }

  btnNuevoJuego() {
    this.inicializarJuego();
  }

  guardarStorage() {
    localStorage.setItem('historial', JSON.stringify(this.historial));
  }

  contarAses(array) {

    let cant = 0;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < array.length; i++) {
      if (array[i] === 11) {
        cant++;
      }
    }

    return cant;
  }

  esBlackJack(array) {
    return (array.length === 2 && array.reduce((a, b) => a + b, 0) === 21);
  }

  asValeUno(turno) {
    const index = this.manosJugadores[turno].indexOf(11);
    if (index !== -1) {
      this.manosJugadores[turno][index] = 1;
    }
  }

}


