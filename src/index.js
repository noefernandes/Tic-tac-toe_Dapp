import React from 'react';
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
            contracts: {}
        };
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
              this.state.account = accounts[0];
              window.ethereum.on('accountsChanged', this.updateAccount); // Atualiza se o usuário trcar de conta no Metamaslk
            } catch (error) {
              console.error("Usuário negou acesso ao web3!");
              return;
            }
            this.state.web3 = new Web3(window.ethereum);
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
        this.state.account = (await this.state.web3.eth.getAccounts())[0];
    }

    // Associa ao endereço do seu contrato
    async initContract () {
        console.log(abi);
        this.state.contracts.Jogo = new this.state.web3.eth.Contract(abi, contractAddress);
    }

    handleClick(i){
        this.setState({ squares: Array(9).fill( Math.floor(Math.random() * (10 - 1 + 1)) + 1 ) });
    }

    handleChange(e){

    }

    handleSubmit(e){
        e.preventDefault();
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
                            <input type="text" value={this.state.value} onChange={this.handleChange} />
                        </label>
                        <input type="submit" value="Enviar" />
                    
                        <h2>Vez do jogador: rt4d9</h2>
                        <h2>Valor apostado por rt4d9: x ether</h2>
                        <h2>Prêmio total: x ether</h2>
                        <button className="button">Iniciar Partida</button>
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
  