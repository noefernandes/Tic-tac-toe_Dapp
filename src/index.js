/* global BigInt */
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Web3 from 'web3';
import abi from './abi';

const contractAddress = "0xF89Ef68a0898EEA890FF64e96FF38DA60BCe4207";

function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
          {props.value}
        </button>
    );
}
  
class Board extends React.Component {
    renderSquare(i) {
        return <Square
            value = {this.props.squares[i]}
            onClick={() => this.props.onClick(i)} 
        />;
    }

    render() {
        //const status = 'Next player: Y';

        return (
        <div>
            <div className="board-row">
                {this.renderSquare(0)}
                {this.renderSquare(1)}
                {this.renderSquare(2)}
            </div>
            <div className="board-row">
                {this.renderSquare(3)}
                {this.renderSquare(4)}
                {this.renderSquare(5)}
            </div>
            <div className="board-row">
                {this.renderSquare(6)}
                {this.renderSquare(7)}
                {this.renderSquare(8)}
            </div>
        </div>
        );
    }
    
}
  
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
            web3: null,
            account: null,
            contracts: {},
            username: "",
            usernameDisplay: "",
            bet: "",
            betDisplay: ""
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount(){
        this.init();
    }

    async init() {
        if (typeof window.ethereum !== "undefined") {
            try {
              const accounts = await window.ethereum.request({ // Requisita primeiro acesso ao Metamask
                method: "eth_requestAccounts",
              });
              this.setState({ account: accounts[0] });
              window.ethereum.on('accountsChanged', this.updateAccount); // Atualiza se o usuário trcar de conta no Metamaslk
            } catch (error) {
              console.error("Usuário negou acesso ao web3!");
              return;
            }
            this.setState({ web3: new Web3(window.ethereum) });
        } else {
            console.error("Instalar MetaMask!");
            return;
        }

        //console.log("Entra");
        this.initContract();
        //console.log("Sai");
    }

    //Atualiza a conta ativa no metamax
    async updateAccount(){
        this.setState({ account: (await this.state.web3.eth.getAccounts())[0] });
    }

    // Associa ao endereço do seu contrato
    async initContract () {
        var newContracts = {...this.state.contracts};
        newContracts.Jogo = new this.state.web3.eth.Contract(abi, contractAddress);
        this.setState({ contracts: newContracts });
    }

    handleClick(i){
        //this.setState({ squares: Array(9).fill( Math.floor(Math.random() * (10 - 1 + 1)) + 1 ) });
        console.log(this.state.contracts.Jogo.methods.mostrarTabuleiro().call());
    }

    //Função que atualiza as informações no lado direito da tela
    updateInfo(){
        this.setState({ usernameDisplay: this.setState.username });
        this.setState({ betDisplay: this.setState.bet });
        console.log(this.state.usernameDisplay);
        console.log(this.state.betDisplay);
    }

    handleSubmit(e){
        e.preventDefault();
        const betValue = parseInt(this.state.bet)*100000000000000000;
        console.log(this.state.contracts.Jogo.methods.pagarJogo(this.state.username)
                        .send({from: this.state.account, value: betValue}).then(this.updateInfo));
    }
    
    render() {
        return (
        <div>
            <div className="header">Jogo da Velha</div>
            <div className="game">
                <div className="game-board">
                    <Board 
                        squares = {this.state.squares}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className='game-info'>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            Nome:
                        </label>
                        <input type="text" 
                               onChange={e => {this.setState({ username: e.target.value })}} />
                        
                        <input type="text" 
                               onChange={e => {this.setState({ bet: e.target.value })}} />
                    
                        <h2>Vez do jogador: {this.state.usernameDisplay}</h2>
                        <h2>Valor apostado por {this.state.usernameDisplay}: {this.state.betDisplay}</h2>
                        <h2>Prêmio total: x ether</h2>
                        <button type="submit" className="button">Iniciar Partida</button>
                    </form>
                </div>
            </div>
        </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
  