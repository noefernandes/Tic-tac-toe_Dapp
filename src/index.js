import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Web3 from 'web3';
import abi from './abi';


const { utils } = require('ethers');
const contractAddress = "0x142e307Ddcf94AB4DCd28c01cD7D8258f9Fa72aB";

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
            lastPlayer: "",
            bet: "",
            totalBet: "",
            gameState: "",
            disabled: true
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.payWinner = this.payWinner.bind(this);
    }

    componentDidMount(){
        this.init();

        this.lookupInterval = setInterval(() => {
        
            this.mostrarTabuleiro();
            this.verificarVitoria();
            this.atualizarQuadro();

         }, 500)
    }

    componentWillUnmount() {
        clearInterval(this.lookupInterval)
    }

    async init() {
        if (typeof window.ethereum !== "undefined") {
            try {
              const accounts = await window.ethereum.request({ // Requisita primeiro acesso ao Metamask
                method: "eth_requestAccounts",
              });
              
              this.setState({ account: accounts[0] });
              
              window.ethereum.on('accountsChanged', () => {
                this.setState({ account: (this.state.web3.eth.getAccounts())[0] });
                window.location.reload(false);
              });

            } catch (error) {
              console.error("Usuário negou acesso ao web3!");
              return;
            }
            this.setState({ web3: new Web3(window.ethereum) });
        } else {
            console.error("Instalar MetaMask!");
            return;
        }

        this.initContract();

        this.state.contracts.Jogo.getPastEvents("Pagamento", { fromBlock: 0, toBlock: 'latest' }).then((result) => {
            var name = "";
            var currentAddress = utils.getAddress(this.state.web3.currentProvider.selectedAddress);
            
            if(result.length > 1){

                if(result[result.length-2].returnValues.end === currentAddress){
                    //var address = result['0'].returnValues.end;
                    //var status = result['0'].returnValues.status;
                    name = result[result.length-2].returnValues.nome;
                }else if(result[result.length-1].returnValues.end === currentAddress){
                    //var address = result['1'].returnValues.end;
                    //var status = result['1'].returnValues.status;
                    name = result[result.length-1].returnValues.nome;
                }
            }
            
            this.setState({ username: name.toString(), usernameDisplay: name.toString() });
        });

        this.mostrarTabuleiro();
    }

    // Associa ao endereço do seu contrato
    async initContract () {
        var newContracts = {...this.state.contracts};
        newContracts.Jogo = new this.state.web3.eth.Contract(abi, contractAddress);
        this.setState({ contracts: newContracts });
    }

    //Atualizando tabuleiro
    mostrarTabuleiro(){
        this.state.contracts.Jogo.methods.mostrarTabuleiro().call().then( result => {
            var string_squares = [9];

            for(var i = 0; i < 9; i++){
                if(result[i] === '0'){
                    string_squares[i] = ' ';
                }else if(result[i] === '1'){
                    string_squares[i] = 'X';
                }else if(result[i] === '2'){
                    string_squares[i] = 'O';
                }else{
                    string_squares[i] = 'e';
                }
            }
            this.setState({ squares: string_squares })
        });
    }

    verificarVitoria(){
        this.state.contracts.Jogo.methods.verificarVitoria().call().then( result => {

            if(result === this.state.username){
                this.setState({ gameState: result, disabled: false });
                //console.log(this.state.disabled);
            }else if(result === "O jogo ainda nao acabou"){
                this.setState({ gameState: result });
            }else{
                this.setState({ gameState: result });
            }
        });
    }

    atualizarQuadro(){
        this.state.contracts.Jogo.methods.mostrarPremioTotal().call().then( result => {
            this.setState({ totalBet: result})
        });

        this.state.contracts.Jogo.methods.mostrarUltimoJogador().call().then( result => {
            this.setState({ lastPlayer: result})
        });
    }

    sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
          

    async handleClick(i) {        

        this.state.contracts.Jogo.methods.verifyPagamento().call().then( result => {
            if(result){
                this.state.contracts.Jogo.methods.fazerJogada(this.state.username, i)
                .send({ from: this.state.account }).then( result => {
            
                    this.state.contracts.Jogo.methods.mostrarTabuleiro().call().then(result => {
                    });
                });
            }
        });

        this.mostrarTabuleiro();

    }


    handleSubmit(e){
        e.preventDefault();
        const betValue = parseInt(this.state.bet)*100000000000000000;
        this.state.contracts.Jogo.methods.pagarJogo(this.state.username)
            .send({from: this.state.account, value: betValue}).then(result => {
            });
    }

    payWinner(e){
        e.preventDefault();

        this.state.contracts.Jogo.methods.verificarVitoria().call().then( result => {

            if(result === this.state.username){
                this.setState({ gameState: result, disabled: false });
                //console.log(this.state.disabled);
            }else if(result === "O jogo ainda nao acabou"){
                this.setState({ gameState: result });
            }else{
                this.setState({ gameState: result });
            }
        });
        


        if(this.state.username === this.state.gameState){

            this.state.contracts.Jogo.methods.pagarOVencedor(this.state.gameState)
                .send({from: this.state.account}).then(result => {
                });
        }
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
                            <strong>
                            Nome:
                            </strong>
                        </label>
                        <input type="text" 
                               onChange={e => {this.setState({ username: e.target.value })}} />
                        
                        <label>
                            <strong>
                            Valor de aposta:
                            </strong>
                        </label>
                        <input type="text" 
                               onChange={e => {this.setState({ bet: e.target.value })}} />

                        <button type="submit" className="button">Inscrever usuário</button>
                    </form>
                    <form onSubmit={this.payWinner}>
                        <h2>Jogador: {this.state.username}</h2>
                        <h2>Ultimo a jogar: {this.state.lastPlayer}</h2>
                        <h2>Prêmio total: {this.state.totalBet/1000000000000000000} ether</h2>
                        <h2>Resultado: {this.state.gameState} </h2>
                        <button type="submit" disabled={this.state.disabled} 
                                style={{backgroundColor: this.state.disabled ? '#CCC' : '#4CAF50' }} 
                                className="button">Resgatar prêmio</button>
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
  