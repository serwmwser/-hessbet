"use client";
import { useApp } from "./ctx";
import type { Lang } from "./i18n";

const K = ["waitTitle", "waitSub", "startTitle", "startWhite", "startBlack", "winTitle", "winSub", "loseTitle", "loseSub", "howTitle", "how1", "how2", "how3", "how4", "how5"] as const;
export type TxKey = (typeof K)[number];

const D: Record<Lang, Record<TxKey, string>> = {
  ru: {
    waitTitle: "Ждём соперника", waitSub: "Игра создана. Как только соперник присоединится, партия начнётся сама. Можно закрыть страницу и вернуться позже.",
    startTitle: "Партия началась!", startWhite: "Вы играете белыми. Ваш ход!", startBlack: "Вы играете чёрными. Ждите ход соперника.",
    winTitle: "Победа!", winSub: "Блестящая партия! Нажмите «Забрать» ниже, и выигрыш придёт на ваш кошелёк.",
    loseTitle: "В этот раз не повезло", loseSub: "Это всего лишь партия. Каждое поражение учит, а реванш уже ждёт в лобби. Вы обязательно отыграетесь!",
    howTitle: "Как играть", how1: "Войдите в аккаунт или подключите кошелёк. Для игры на балансе должны быть USDC (для ставок) и немного POL (для комиссии сети). Если токенов нет, пополните баланс через покупку: кнопки в карточке «Пополнить баланс» ниже.",
    how2: "В лобби выберите ставку (0.05–5 USDC) и время, нажмите «Создать игру» и подтвердите два шага в кошельке. Или присоединитесь к чужой игре.",
    how3: "Когда соперник присоединится, партия начнётся сама. Время общее на партию и идёт только на вашем ходу.",
    how4: "Победили? Нажмите «Забрать выигрыш» на экране игры или в «Моих играх». Вы получите 94% банка, 6% комиссия.",
    how5: "Ничья, отмена или зависшая игра: ставки возвращаются полностью, без комиссии. Пригласить друга можно ссылкой ниже.",
  },
  en: {
    waitTitle: "Waiting for an opponent", waitSub: "Your game is created. As soon as someone joins, the match starts by itself. You can close the page and come back later.",
    startTitle: "The game has started!", startWhite: "You play White. Your move!", startBlack: "You play Black. Wait for your opponent's move.",
    winTitle: "Victory!", winSub: "Brilliant game! Press Claim below and your winnings go to your wallet.",
    loseTitle: "Not this time", loseSub: "It's only a game. Every loss teaches something, and a rematch is waiting in the lobby. You'll get them next time!",
    howTitle: "How to play", how1: "Sign in or connect a wallet. To play you need USDC (for stakes) and a little POL (for network fees) on your balance. If you have none, top up by buying them: the buttons are in the Top up card below.",
    how2: "In the lobby pick a stake (0.05–5 USDC) and time, press Create game and confirm two steps in your wallet. Or join someone else's game.",
    how3: "When an opponent joins, the match starts by itself. The time is shared for the whole game and runs only on your turn.",
    how4: "Won? Press Claim on the game screen or in My games. You get 94% of the pot, 6% is the fee.",
    how5: "Draw, cancel or a stuck game: stakes are refunded in full, no fee. Invite a friend with the link below.",
  },
  es: {
    waitTitle: "Esperando rival", waitSub: "La partida está creada. En cuanto alguien se una, empezará sola. Puedes cerrar la página y volver más tarde.",
    startTitle: "¡La partida ha empezado!", startWhite: "Juegas con blancas. ¡Te toca!", startBlack: "Juegas con negras. Espera la jugada del rival.",
    winTitle: "¡Victoria!", winSub: "¡Partidazo! Pulsa Reclamar abajo y tus ganancias llegarán a tu monedero.",
    loseTitle: "Esta vez no", loseSub: "Solo es una partida. Cada derrota enseña algo y la revancha te espera en el lobby. ¡La próxima será tuya!",
    howTitle: "Cómo jugar", how1: "Inicia sesión o conecta un monedero. Para jugar necesitas USDC (para apuestas) y un poco de POL (para comisiones de red) en tu saldo. Si no tienes, recarga comprándolos: los botones están en la tarjeta de recarga de abajo.",
    how2: "En el lobby elige apuesta (0.05–5 USDC) y tiempo, pulsa Crear partida y confirma dos pasos en el monedero. O únete a otra partida.",
    how3: "Cuando un rival se une, la partida empieza sola. El tiempo es común para toda la partida y corre solo en tu turno.",
    how4: "¿Ganaste? Pulsa Reclamar en la pantalla de juego o en Mis partidas. Recibes el 94% del bote, el 6% es la comisión.",
    how5: "Tablas, cancelación o partida atascada: las apuestas se devuelven íntegras, sin comisión. Invita a un amigo con el enlace de abajo.",
  },
  de: {
    waitTitle: "Warte auf Gegner", waitSub: "Dein Spiel ist erstellt. Sobald jemand beitritt, startet die Partie von selbst. Du kannst die Seite schließen und später zurückkommen.",
    startTitle: "Die Partie hat begonnen!", startWhite: "Du spielst Weiß. Du bist am Zug!", startBlack: "Du spielst Schwarz. Warte auf den Zug des Gegners.",
    winTitle: "Sieg!", winSub: "Starke Partie! Tippe unten auf Abholen und der Gewinn geht an dein Wallet.",
    loseTitle: "Diesmal nicht", loseSub: "Es ist nur ein Spiel. Jede Niederlage lehrt etwas, und die Revanche wartet in der Lobby. Beim nächsten Mal klappt es!",
    howTitle: "So spielst du", how1: "Melde dich an oder verbinde ein Wallet. Zum Spielen brauchst du USDC (für Einsätze) und etwas POL (für Netzwerkgebühren) auf dem Guthaben. Hast du keine, lade durch Kauf auf: die Buttons findest du unten in der Karte zum Aufladen.",
    how2: "Wähle in der Lobby Einsatz (0,05–5 USDC) und Zeit, tippe auf Spiel erstellen und bestätige zwei Schritte im Wallet. Oder tritt einem fremden Spiel bei.",
    how3: "Sobald ein Gegner beitritt, startet die Partie von selbst. Die Zeit gilt für die ganze Partie und läuft nur auf deinem Zug.",
    how4: "Gewonnen? Tippe auf Abholen im Spielbildschirm oder unter Meine Spiele. Du erhältst 94 % des Pots, 6 % sind die Gebühr.",
    how5: "Remis, Abbruch oder hängende Partie: Einsätze gibt es vollständig zurück, ohne Gebühr. Lade Freunde per Link unten ein.",
  },
  fr: {
    waitTitle: "En attente d’un adversaire", waitSub: "Votre partie est créée. Dès qu’un adversaire rejoint, elle démarre toute seule. Vous pouvez fermer la page et revenir plus tard.",
    startTitle: "La partie a commencé !", startWhite: "Vous jouez les blancs. À vous de jouer !", startBlack: "Vous jouez les noirs. Attendez le coup de l’adversaire.",
    winTitle: "Victoire !", winSub: "Superbe partie ! Appuyez sur Récupérer ci-dessous et vos gains arrivent dans votre portefeuille.",
    loseTitle: "Pas cette fois", loseSub: "Ce n’est qu’une partie. Chaque défaite apprend quelque chose, et la revanche vous attend dans le lobby. Ce sera pour la prochaine !",
    howTitle: "Comment jouer", how1: "Connectez-vous ou liez un portefeuille. Pour jouer, il faut des USDC (pour les mises) et un peu de POL (pour les frais de réseau) sur votre solde. Si vous n’en avez pas, rechargez par achat : les boutons sont dans la carte de recharge ci-dessous.",
    how2: "Dans le lobby, choisissez la mise (0,05–5 USDC) et le temps, appuyez sur Créer la partie et confirmez deux étapes dans le portefeuille. Ou rejoignez une autre partie.",
    how3: "Quand un adversaire rejoint, la partie démarre seule. Le temps est commun à toute la partie et ne court que pendant votre tour.",
    how4: "Gagné ? Appuyez sur Récupérer sur l’écran de jeu ou dans Mes parties. Vous recevez 94 % de la cagnotte, 6 % de frais.",
    how5: "Nulle, annulation ou partie bloquée : les mises sont remboursées en totalité, sans frais. Invitez un ami avec le lien ci-dessous.",
  },
  pt: {
    waitTitle: "Aguardando adversário", waitSub: "Seu jogo foi criado. Assim que alguém entrar, a partida começa sozinha. Você pode fechar a página e voltar depois.",
    startTitle: "A partida começou!", startWhite: "Você joga de brancas. Sua vez!", startBlack: "Você joga de pretas. Aguarde a jogada do adversário.",
    winTitle: "Vitória!", winSub: "Partida brilhante! Toque em Resgatar abaixo e o prêmio vai para sua carteira.",
    loseTitle: "Dessa vez não", loseSub: "É só uma partida. Cada derrota ensina algo, e a revanche espera no lobby. Na próxima você vence!",
    howTitle: "Como jogar", how1: "Entre ou conecte uma carteira. Para jogar você precisa de USDC (para apostas) e um pouco de POL (para taxas da rede) no saldo. Se não tiver, adicione saldo comprando: os botões estão no cartão de recarga abaixo.",
    how2: "No lobby escolha a aposta (0,05–5 USDC) e o tempo, toque em Criar jogo e confirme dois passos na carteira. Ou entre no jogo de outra pessoa.",
    how3: "Quando um adversário entra, a partida começa sozinha. O tempo é total da partida e corre só na sua vez.",
    how4: "Ganhou? Toque em Resgatar na tela do jogo ou em Meus jogos. Você recebe 94% do prêmio, 6% é a taxa.",
    how5: "Empate, cancelamento ou jogo travado: as apostas voltam integralmente, sem taxa. Convide um amigo pelo link abaixo.",
  },
  tr: {
    waitTitle: "Rakip bekleniyor", waitSub: "Oyununuz oluşturuldu. Biri katılır katılmaz maç kendiliğinden başlar. Sayfayı kapatıp sonra dönebilirsiniz.",
    startTitle: "Oyun başladı!", startWhite: "Beyazlarla oynuyorsunuz. Sıra sizde!", startBlack: "Siyahlarla oynuyorsunuz. Rakibin hamlesini bekleyin.",
    winTitle: "Zafer!", winSub: "Harika bir oyun! Aşağıdaki Al düğmesine basın, kazancınız cüzdanınıza gelsin.",
    loseTitle: "Bu sefer olmadı", loseSub: "Sadece bir oyun. Her yenilgi bir şey öğretir, rövanş lobide sizi bekliyor. Bir dahaki sefere kazanacaksınız!",
    howTitle: "Nasıl oynanır", how1: "Giriş yapın veya cüzdan bağlayın. Oynamak için bakiyenizde USDC (bahisler için) ve biraz POL (ağ ücretleri için) olmalı. Yoksa satın alarak yükleyin: düğmeler aşağıdaki yükleme kartındadır.",
    how2: "Lobide bahis (0,05–5 USDC) ve süre seçin, Oyun oluştur’a basın ve cüzdanda iki adımı onaylayın. Ya da başkasının oyununa katılın.",
    how3: "Rakip katılınca maç kendiliğinden başlar. Süre tüm oyun için ortaktır ve yalnızca sizin sıranızda işler.",
    how4: "Kazandınız mı? Oyun ekranında veya Oyunlarım’da Al’a basın. Havuzun %94’ünü alırsınız, %6 komisyondur.",
    how5: "Beraberlik, iptal veya takılan oyun: bahisler komisyonsuz tamamen iade edilir. Aşağıdaki bağlantıyla arkadaş davet edin.",
  },
  zh: {
    waitTitle: "等待对手", waitSub: "对局已创建。有人加入后将自动开始。你可以关闭页面，稍后再回来。",
    startTitle: "对局开始！", startWhite: "你执白棋，请走棋！", startBlack: "你执黑棋，请等待对手走棋。",
    winTitle: "胜利！", winSub: "精彩的一局！点击下方“领取”，奖金将发送到你的钱包。",
    loseTitle: "这次没赢", loseSub: "只是一盘棋而已。每次失败都是学习，大厅里已有复仇等着你。下次一定能赢！",
    howTitle: "玩法", how1: "登录或连接钱包。游戏需要你的余额中有 USDC（用于下注）和少量 POL（用于网络手续费）。如果没有，可通过购买充值：按钮在下方的充值卡片中。",
    how2: "在大厅选择赌注（0.05–5 USDC）和用时，点击“创建对局”并在钱包中确认两步。也可以加入他人的对局。",
    how3: "对手加入后对局自动开始。用时为整局共用，只在你走棋时计时。",
    how4: "赢了？在对局页面或“我的对局”点击“领取”。你将获得奖池的 94%，6% 为手续费。",
    how5: "和棋、取消或卡住的对局：赌注全额退还，不收手续费。可通过下方链接邀请好友。",
  },
  ar: {
    waitTitle: "بانتظار الخصم", waitSub: "تم إنشاء لعبتك. بمجرد انضمام أحدهم تبدأ المباراة تلقائيًا. يمكنك إغلاق الصفحة والعودة لاحقًا.",
    startTitle: "بدأت المباراة!", startWhite: "تلعب بالأبيض. دورك!", startBlack: "تلعب بالأسود. انتظر نقلة الخصم.",
    winTitle: "فوز!", winSub: "مباراة رائعة! اضغط «استلام» أدناه لتصل أرباحك إلى محفظتك.",
    loseTitle: "ليس هذه المرة", loseSub: "إنها مجرد مباراة. كل خسارة تعلّمك شيئًا، والعودة بانتظارك في الردهة. ستفوز في المرة القادمة!",
    howTitle: "كيف تلعب", how1: "سجّل الدخول أو اربط محفظة. للعب يجب أن يكون في رصيدك USDC (للرهانات) وقليل من POL (لرسوم الشبكة). إن لم تكن لديك، اشحن الرصيد بالشراء: الأزرار في بطاقة الشحن أدناه.",
    how2: "في الردهة اختر الرهان (0.05–5 USDC) والوقت، اضغط «إنشاء لعبة» وأكّد خطوتين في المحفظة. أو انضم إلى لعبة غيرك.",
    how3: "عند انضمام الخصم تبدأ المباراة تلقائيًا. الوقت مشترك للمباراة كلها ويحسب فقط في دورك.",
    how4: "فزت؟ اضغط «استلام» في شاشة اللعبة أو في «ألعابي». تحصل على 94% من الجائزة والرسوم 6%.",
    how5: "تعادل أو إلغاء أو لعبة عالقة: تُرد الرهانات كاملة دون رسوم. ادعُ صديقًا عبر الرابط أدناه.",
  },
};

export function useTx() {
  const { lang } = useApp();
  return (k: TxKey) => (D[lang] ?? D.en)[k] ?? D.en[k];
}
