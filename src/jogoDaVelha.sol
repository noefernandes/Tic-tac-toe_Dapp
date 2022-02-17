// Nome: <Noé Fernandes>
// Nome: <Kevin Wallacy>
// Conta do contrato: <0x142e307Ddcf94AB4DCd28c01cD7D8258f9Fa72aB>

// Seu contrato começa aqui!

pragma  solidity  ^0.8.0; // Fique a vontade caso queira utilizar outra versão.

contract JogoDaVelha {

    struct jogador{
        string nomeJogador;
        address enderecoPagamento;
        bool statusPagamento;
        uint marca;
    }

    uint[9] tabuleiro;

    string ultimoJogador;

    jogador j1;
    jogador j2;

    address owner;

	constructor() {
		owner =  msg.sender;
        j1 = jogador("Default", address(0), false, 1);
        j2 = jogador("Default", address(0), false, 2);
        ultimoJogador = "Inicializando";
        tabuleiro = [0,0,0,0,0,0,0,0,0];
	}

    event Pagamento(string nome, address end, bool status);

	modifier onlyOwner {
		require(msg.sender == owner, "Somente o dono do contrato pode invocar essa funcao!");
		_;
	}

    function destroy() public onlyOwner
    {
        selfdestruct(payable(owner));
    }
	
    function mostrarTabuleiro () public view returns (uint[9] memory)
    {
        return tabuleiro;
    }

    function mostrarUltimoJogador () public view returns (string memory)
    {
        return ultimoJogador;
    }

    function mostrarPremioTotal () public view returns (uint)
    {
        return address(this).balance;
    }

    function verificarVitoria () public view returns (string memory)
    {
        if(tabuleiro[0] == 1 && tabuleiro[1] == 1 && tabuleiro[2] == 1)
        {
            return j1.nomeJogador;
        }
        else if(tabuleiro[0] == 2 && tabuleiro[1] == 2 && tabuleiro[2] == 2)
        {
            return j2.nomeJogador;
        }
        else if(tabuleiro[3] == 1 && tabuleiro[4] == 1 && tabuleiro[5] == 1)
        {
            return j1.nomeJogador;
        }
        else if(tabuleiro[3] == 2 && tabuleiro[4] == 2 && tabuleiro[5] == 2)
        {
            return j2.nomeJogador;
        }
        else if(tabuleiro[6] == 1 && tabuleiro[7] == 1 && tabuleiro[8] == 1)
        {
            return j1.nomeJogador;
        }
        else if(tabuleiro[6] == 2 && tabuleiro[7] == 2 && tabuleiro[8] == 2)
        {
            return j2.nomeJogador;
        }
        else if(tabuleiro[0] == 1 && tabuleiro[3] == 1 && tabuleiro[6] == 1)
        {
            return j1.nomeJogador;
        }
        else if(tabuleiro[0] == 2 && tabuleiro[3] == 2 && tabuleiro[6] == 2)
        {
            return j2.nomeJogador;
        }
        else if(tabuleiro[1] == 1 && tabuleiro[4] == 1 && tabuleiro[7] == 1)
        {
            return j1.nomeJogador;
        }
        else if(tabuleiro[1] == 2 && tabuleiro[4] == 2 && tabuleiro[7] == 2)
        {
            return j2.nomeJogador;
        }
        else if(tabuleiro[2] == 1 && tabuleiro[5] == 1 && tabuleiro[8] == 1)
        {
            return j1.nomeJogador;
        }
        else if(tabuleiro[2] == 2 && tabuleiro[5] == 2 && tabuleiro[8] == 2)
        {
            return j2.nomeJogador;
        }
        else if(tabuleiro[0] == 1 && tabuleiro[4] == 1 && tabuleiro[8] == 1)
        {
            return j1.nomeJogador;
        }
        else if(tabuleiro[0] == 2 && tabuleiro[4] == 2 && tabuleiro[8] == 2)
        {
            return j2.nomeJogador;
        }
        else if(tabuleiro[2] == 1 && tabuleiro[4] == 1 && tabuleiro[6] == 1)
        {
            return j1.nomeJogador;
        }
        else if(tabuleiro[2] == 2 && tabuleiro[4] == 2 && tabuleiro[6] == 2)
        {
            return j2.nomeJogador;
        }
        else
        {
            return verificarEmpate();
        }
    }

    function verificarEmpate () private view returns (string memory)
    {
        uint i;
        for (i = 0; i < 9; i = i + 1)
        {
            if(tabuleiro[i] == 0)
            {
                return "O jogo ainda nao acabou";
            }
        }

        return "Empate";
    }

    function fazerJogada (string memory _nomeJogador, uint pos) public returns (string memory)
    {
        if(keccak256(abi.encodePacked((ultimoJogador))) == keccak256(abi.encodePacked((_nomeJogador))))
        {
            return "Um jogador nao pode jogar duas vezes seguidas";   
        }
        else if(keccak256(abi.encodePacked((ultimoJogador))) == keccak256(abi.encodePacked(("Inicializando"))))
        {
            ultimoJogador = _nomeJogador;

            if(tabuleiro[pos] != 0)
            {
                return "Selecione uma posicao valida";
            }
            else
            {
                if(keccak256(abi.encodePacked((j1.nomeJogador))) == keccak256(abi.encodePacked((_nomeJogador))))
                {
                    tabuleiro[pos] = j1.marca;
                    return "Jogada realizada com sucesso";
                }
                else if(keccak256(abi.encodePacked((j2.nomeJogador))) == keccak256(abi.encodePacked((_nomeJogador))))
                {
                    tabuleiro[pos] = j2.marca;
                    return "Jogada realizada com sucesso";
                }
            }
        }
        else if(keccak256(abi.encodePacked((j1.nomeJogador))) == keccak256(abi.encodePacked((_nomeJogador))) || keccak256(abi.encodePacked((j2.nomeJogador))) == keccak256(abi.encodePacked((_nomeJogador))))
        {
            ultimoJogador = _nomeJogador;

            if(tabuleiro[pos] != 0)
            {
                return "Selecione uma posicao valida";
            }
            else
            {
                if(keccak256(abi.encodePacked((j1.nomeJogador))) == keccak256(abi.encodePacked((_nomeJogador))))
                {
                    tabuleiro[pos] = j1.marca;
                    return "Jogada realizada com sucesso";
                }
                else if(keccak256(abi.encodePacked((j2.nomeJogador))) == keccak256(abi.encodePacked((_nomeJogador))))
                {
                    tabuleiro[pos] = j2.marca;
                    return "Jogada realizada com sucesso";
                }
            }
        }
    }

    function pagarJogo (string memory _nomeJogador) external payable returns (string memory)
    {
        if(j1.statusPagamento == false)
        {
            j1.nomeJogador = _nomeJogador;
            j1.enderecoPagamento = msg.sender;
            j1.statusPagamento = true;

            emit Pagamento(j1.nomeJogador, j1.enderecoPagamento, j1.statusPagamento);
            return "Jogador 1 cadastrado com sucesso";
        }
        else if(j2.statusPagamento == false &&  j2.enderecoPagamento != j1.enderecoPagamento)
        {
            j2.nomeJogador = _nomeJogador;
            j2.enderecoPagamento = msg.sender;
            j2.statusPagamento = true;

            emit Pagamento(j2.nomeJogador, j2.enderecoPagamento, j2.statusPagamento);
            return "Jogador 2 cadastrado com sucesso";
        }
        else
        {
            emit Pagamento(_nomeJogador, msg.sender, false);
            return "Pagamento redundante, ambos jogadores ja pagaram!!!";
        }
    }

    function verifyPagamento () public view returns (bool)
    {
        if(j1.statusPagamento == false && j2.statusPagamento == false)
        {
            // Aqui deveria ser um evento
            return false;
        }
        else if(j1.statusPagamento == false)
        {
            // Aqui também
            return false;
        }
        else if(j2.statusPagamento == false)
        {
            // Me 3
            return false;
        }
        else
        {
            // Me 4
            return true;
        }
    }

    function pagarOVencedor (string memory _nomeJogador) public payable returns(string memory)
    {
        if(keccak256(abi.encodePacked((_nomeJogador))) == keccak256(abi.encodePacked((j1.nomeJogador))))
        {
            address payable dummy = payable(j1.enderecoPagamento);

            dummy.transfer(address(this).balance);

            j1.nomeJogador = "Default";
            j1.enderecoPagamento = address(0);
            j1.statusPagamento = false;
        

            j2.nomeJogador = "Default";
            j2.enderecoPagamento = address(0);
            j2.statusPagamento = false;

            ultimoJogador = "Inicializando";
            tabuleiro = [0,0,0,0,0,0,0,0,0];

            return "Pagamento efetuado ao jogador 1";
        }
        else if(keccak256(abi.encodePacked((_nomeJogador))) == keccak256(abi.encodePacked((j2.nomeJogador))))
        {
            address payable dummy = payable(j2.enderecoPagamento);

            dummy.transfer(address(this).balance);

            j1.nomeJogador = "Default";
            j1.enderecoPagamento = address(0);
            j1.statusPagamento = false;
        

            j2.nomeJogador = "Default";
            j2.enderecoPagamento = address(0);
            j2.statusPagamento = false;

            ultimoJogador = "Inicializando";
            tabuleiro = [0,0,0,0,0,0,0,0,0];

            return "Pagamento efetuado ao jogador 2";
        }
        else
        {
            return "Nao existe jogador com esse nome!!!";
        }
    }
}