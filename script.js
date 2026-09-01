// সব কার্ডের মান
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let gameState = {
    playerBalance: 1000,
    pot: 0,
    round: 1,
    gameActive: false,
    playerCards: [],
    players: [
        { id: 1, name: 'খেলোয়াড় ১', balance: 500, bet: 0, cards: [], folded: false },
        { id: 2, name: 'খেলোয়াড় ২', balance: 500, bet: 0, cards: [], folded: false },
        { id: 3, name: 'খেলোয়াড় ৩', balance: 500, bet: 0, cards: [], folded: false }
    ],
    currentPlayerTurn: 0,
    minimumBet: 50
};

// কার্ড ডেক তৈরি করো
function createDeck() {
    const deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push(rank + suit);
        }
    }
    return deck.sort(() => Math.random() - 0.5);
}

// র‍্যান্ডম কার্ড ডিল করো
function dealCards() {
    const deck = createDeck();
    gameState.playerCards = [deck[0], deck[1], deck[2]];
    
    gameState.players.forEach((player, index) => {
        player.cards = [deck[3 + index * 3], deck[4 + index * 3], deck[5 + index * 3]];
        player.folded = false;
        player.bet = 0;
    });
}

// গেম শুরু করো
document.getElementById('startBtn').addEventListener('click', () => {
    if (gameState.playerBalance < gameState.minimumBet) {
        alert('💰 আপনার টাকা নেই! আরো টাকা যোগ করুন!');
        return;
    }

    gameState.gameActive = true;
    gameState.pot = 0;
    dealCards();
    
    // ইউজার বাজি ধরাতে বাধ্য করো
    const betAmount = parseInt(document.getElementById('betAmount').value) || 50;
    placeBet(betAmount);
    
    // AI খেলোয়াড়ের বাজি
    gameState.players.forEach(player => {
        const aiBet = Math.floor(Math.random() * 100) + 50;
        player.bet = aiBet;
        player.balance -= aiBet;
        gameState.pot += aiBet;
    });

    updateUI();
    enableActions();
    addLog('🎮 গেম শুরু হয়েছে!');
});

// বাজি ধরো
function placeBet(amount) {
    if (gameState.playerBalance < amount) {
        alert('💰 যথেষ্ট টাকা নেই!');
        return;
    }
    
    gameState.playerBalance -= amount;
    gameState.pot += amount;
    gameState.players[gameState.currentPlayerTurn].bet = amount;
    addLog(`💵 আপনি ${amount} টাকা বাজি ধরেছেন`);
}

// কল করো
document.getElementById('callBtn').addEventListener('click', () => {
    const maxBet = Math.max(...gameState.players.map(p => p.bet));
    const callAmount = maxBet - gameState.players[gameState.currentPlayerTurn].bet;
    
    if (callAmount > 0) {
        placeBet(callAmount);
    }
    
    nextTurn();
});

// বাড়ান
document.getElementById('raiseBtn').addEventListener('click', () => {
    const raiseAmount = parseInt(document.getElementById('betAmount').value) || 50;
    placeBet(raiseAmount);
    addLog(`📈 আপনি ${raiseAmount} টাকা বাড়িয়েছেন`);
    nextTurn();
});

// ফোল্ড করো
document.getElementById('foldBtn').addEventListener('click', () => {
    gameState.players[gameState.currentPlayerTurn].folded = true;
    addLog('❌ আপনি ফোল্ড করেছেন');
    
    const activePlayers = gameState.players.filter(p => !p.folded);
    
    if (activePlayers.length === 1) {
        endRound(activePlayers[0]);
    } else {
        nextTurn();
    }
});

// পরবর্তী খেলোয়াড়ের পালা
function nextTurn() {
    gameState.currentPlayerTurn = (gameState.currentPlayerTurn + 1) % gameState.players.length;
    
    if (gameState.players[gameState.currentPlayerTurn].folded) {
        nextTurn();
        return;
    }

    // র‍্যান্ডম AI সিদ্ধান্ত
    const decision = Math.random();
    
    if (decision < 0.3) {
        gameState.players[gameState.currentPlayerTurn].folded = true;
        addLog(`${gameState.players[gameState.currentPlayerTurn].name} ফোল্ড করেছে`);
        
        const activePlayers = gameState.players.filter(p => !p.folded);
        if (activePlayers.length === 1) {
            endRound(activePlayers[0]);
        }
    } else if (decision < 0.7) {
        const bet = Math.floor(Math.random() * 50) + 30;
        gameState.players[gameState.currentPlayerTurn].bet += bet;
        gameState.players[gameState.currentPlayerTurn].balance -= bet;
        gameState.pot += bet;
        addLog(`${gameState.players[gameState.currentPlayerTurn].name} ${bet} টাকা বাজি ধরেছে`);
    }
    
    updateUI();
}

// রাউন্ড শেষ করো
function endRound(winner) {
    gameState.gameActive = false;
    
    winner.balance += gameState.pot;
    
    if (winner.id === gameState.players[gameState.currentPlayerTurn].id) {
        gameState.playerBalance += gameState.pot;
        showResult('🎉 আপনি জিতেছেন!', `আপনি ${gameState.pot} টাকা জিতেছেন!`);
    } else {
        showResult('😢 আপনি হেরেছেন', `${winner.name} জিতেছে ${gameState.pot} টাকা!`);
    }

    gameState.round++;
    gameState.pot = 0;
    gameState.currentPlayerTurn = 0;
    disableActions();
    updateUI();
}

// ফলাফল দেখাও
function showResult(title, message) {
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultMsg').textContent = message;
    document.getElementById('resultModal').classList.add('show');
}

function closeResult() {
    document.getElementById('resultModal').classList.remove('show');
}

// অ্যাকশন বাটন সক্রিয় করো
function enableActions() {
    document.getElementById('callBtn').disabled = false;
    document.getElementById('raiseBtn').disabled = false;
    document.getElementById('foldBtn').disabled = false;
}

// অ্যাকশন বাটন নিষ্ক্রিয় করো
function disableActions() {
    document.getElementById('callBtn').disabled = true;
    document.getElementById('raiseBtn').disabled = true;
    document.getElementById('foldBtn').disabled = true;
}

// ইউআই আপডেট করো
function updateUI() {
    // ব্যালেন্স আপডেট করো
    document.getElementById('balance').textContent = '₹ ' + gameState.playerBalance;
    document.getElementById('pot').textContent = '₹ ' + gameState.pot;
    document.getElementById('round').textContent = gameState.round;

    // কার্ড দেখাও
    const playerCardsDiv = document.getElementById('playerCards');
    playerCardsDiv.innerHTML = gameState.playerCards.map(card => 
        `<div class="card">${card}</div>`
    ).join('');

    // খেলোয়াড়দের তালিকা আপডেট করো
    const playersDiv = document.getElementById('playersList');
    playersDiv.innerHTML = gameState.players.map(player => 
        `<div class="player-item ${player.folded ? 'folded' : ''} ${gameState.gameActive && gameState.players[gameState.currentPlayerTurn].id === player.id ? 'active' : ''}">
            <span class="player-name">${player.name}</span>
            <span class="player-bet">বাজি: ₹${player.bet} | ব্যালেন্স: ₹${player.balance}</span>
        </div>`
    ).join('');
}

// লগ যোগ করো
function addLog(message) {
    const logDiv = document.getElementById('gameLog');
    const messageEl = document.createElement('div');
    messageEl.className = 'log-message';
    messageEl.textContent = message;
    logDiv.appendChild(messageEl);
    logDiv.scrollTop = logDiv.scrollHeight;
}

// প্রথম আপডেট
updateUI();
addLog('🎮 তিন পাত্তি গেমে স্বাগতম!');
