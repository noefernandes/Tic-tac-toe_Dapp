import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Web3 from 'web3';
import abi from './abi';

const { utils } = require('ethers');
const contractAddress = "0xE35F211e96C6C22f6010CDF6167879F307AdC7fe";

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

        this.lookupInterval = setInterval(() => {
        
            this.mostrarTabuleiro();

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

            if(result['0'].returnValues.end === currentAddress){
                //var address = result['0'].returnValues.end;
                //var status = result['0'].returnValues.status;
                name = result['0'].returnValues.nome;
            }else if(result['1'].returnValues.end === currentAddress){
                //var address = result['1'].returnValues.end;
                //var status = result['1'].returnValues.status;
                name = result['1'].returnValues.nome;
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

    sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
          

    async handleClick(i) {        

        this.state.contracts.Jogo.methods.verifyPagamento().call().then( result => {
            if(result){
                this.state.contracts.Jogo.methods.fazerJogada(this.state.username, i)
                .send({ from: this.state.account }).then( result => {
            
                    // eslint-disable-next-line
                    this.state.contracts.Jogo.methods.mostrarTabuleiro().call().then(result => {
                    });
                });
            }
        });

        this.mostrarTabuleiro();
    }

    //Função que atualiza as informações no lado direito da tela
    updateInfo(){
        this.setState({ usernameDisplay: this.state.username });
        this.setState({ betDisplay: this.state.bet });
    }

    handleSubmit(e){
        e.preventDefault();
        const betValue = parseInt(this.state.bet)*100000000000000000;
        this.state.contracts.Jogo.methods.pagarJogo(this.state.username)
            .send({from: this.state.account, value: betValue}).then(result => {
                //console.log(result);
                this.updateInfo();
            });
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

                        <h2>Vez do jogador: {this.state.usernameDisplay}</h2>
                        <h2>Valor apostado por {this.state.usernameDisplay}: {this.state.betDisplay}</h2>
                        <h2>Prêmio total: x ether</h2>
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
  