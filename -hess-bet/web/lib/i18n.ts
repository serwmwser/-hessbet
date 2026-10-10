// Все тексты интерфейса. Порядок значений в массивах совпадает с порядком KEYS.
export const KEYS = [
  "lobby", "play", "bot", "profile", "createGame", "bet", "time", "pot", "fee", "winnerGets",
  "create", "join", "cancel", "noGames", "yourTurn", "oppTurn", "resign", "offerDraw", "acceptDraw", "won",
  "lost", "drawn", "waiting", "newGame", "level", "color", "white", "black", "random", "stats",
  "history", "balance", "ageNote", "boardTheme", "backLobby", "signIn", "lowGas", "approving", "confirming", "rChk",
  "rTime", "rRes", "rDraw", "wins", "losses", "draws", "net", "thinking", "any", "min",
  "hr", "noActive",
] as const;
export type Key = (typeof KEYS)[number];

export const LANGS = {
  ru: "Русский", en: "English", es: "Español", de: "Deutsch", fr: "Français",
  pt: "Português", tr: "Türkçe", zh: "中文", ar: "العربية",
} as const;
export type Lang = keyof typeof LANGS;

const RAW: Record<Lang, string[]> = {
  ru: ["Лобби", "Игра", "С ботом", "Профиль", "Создать игру", "Ставка", "Время на игрока", "Банк", "Комиссия", "Победитель получает",
    "Создать", "Принять", "Отменить", "Пока нет открытых игр — создайте первую", "Ваш ход", "Ход соперника", "Сдаться", "Предложить ничью", "Принять ничью", "Вы победили",
    "Вы проиграли", "Ничья — ставки возвращены", "Ожидание соперника…", "Новая игра", "Уровень", "Цвет", "Белые", "Чёрные", "Случайно", "Статистика",
    "История партий", "Баланс", "Мне есть 18 лет, я понимаю риск потери ставки", "Тема доски", "В лобби", "Войдите через кошелёк, чтобы играть на USDC", "Нужно немного POL для комиссии сети", "Подтверждение USDC…", "Подтверждение транзакции…", "Мат",
    "Время вышло", "Сдача", "Ничья", "Победы", "Поражения", "Ничьи", "Итог", "Бот думает…", "Любой", "мин",
    "ч", "Нет активной игры"],
  en: ["Lobby", "Game", "Vs bot", "Profile", "Create a game", "Stake", "Time per player", "Pot", "Fee", "Winner gets",
    "Create", "Join", "Cancel", "No open games yet — create the first one", "Your move", "Opponent's move", "Resign", "Offer draw", "Accept draw", "You won",
    "You lost", "Draw — stakes returned", "Waiting for opponent…", "New game", "Level", "Color", "White", "Black", "Random", "Statistics",
    "Game history", "Balance", "I am 18+ and understand I may lose my stake", "Board theme", "Back to lobby", "Sign in with a wallet to play for USDC", "You need a little POL for network fees", "Approving USDC…", "Confirming transaction…", "Checkmate",
    "Time out", "Resignation", "Draw", "Wins", "Losses", "Draws", "Net result", "Bot is thinking…", "Any", "min",
    "h", "No active game"],
  es: ["Sala", "Partida", "Vs bot", "Perfil", "Crear partida", "Apuesta", "Tiempo por jugador", "Bote", "Comisión", "El ganador recibe",
    "Crear", "Unirse", "Cancelar", "Aún no hay partidas abiertas: crea la primera", "Tu turno", "Turno del rival", "Abandonar", "Ofrecer tablas", "Aceptar tablas", "Has ganado",
    "Has perdido", "Tablas: apuestas devueltas", "Esperando rival…", "Nueva partida", "Nivel", "Color", "Blancas", "Negras", "Aleatorio", "Estadísticas",
    "Historial", "Saldo", "Soy mayor de 18 años y entiendo que puedo perder mi apuesta", "Tema del tablero", "Volver a la sala", "Conecta una billetera para jugar con USDC", "Necesitas un poco de POL para las comisiones de red", "Aprobando USDC…", "Confirmando transacción…", "Jaque mate",
    "Tiempo agotado", "Abandono", "Tablas", "Victorias", "Derrotas", "Tablas", "Resultado neto", "El bot está pensando…", "Cualquiera", "min",
    "h", "No hay partida activa"],
  de: ["Lobby", "Partie", "Gegen Bot", "Profil", "Spiel erstellen", "Einsatz", "Zeit pro Spieler", "Pot", "Gebühr", "Gewinner erhält",
    "Erstellen", "Beitreten", "Abbrechen", "Noch keine offenen Spiele – erstelle das erste", "Du bist am Zug", "Gegner am Zug", "Aufgeben", "Remis anbieten", "Remis annehmen", "Du hast gewonnen",
    "Du hast verloren", "Remis – Einsätze zurückerstattet", "Warte auf Gegner…", "Neues Spiel", "Stufe", "Farbe", "Weiß", "Schwarz", "Zufällig", "Statistik",
    "Spielverlauf", "Guthaben", "Ich bin 18+ und weiß, dass ich meinen Einsatz verlieren kann", "Brettdesign", "Zurück zur Lobby", "Melde dich mit einer Wallet an, um um USDC zu spielen", "Du brauchst etwas POL für Netzwerkgebühren", "USDC wird freigegeben…", "Transaktion wird bestätigt…", "Schachmatt",
    "Zeitüberschreitung", "Aufgabe", "Remis", "Siege", "Niederlagen", "Remis", "Nettoergebnis", "Bot denkt nach…", "Beliebig", "Min.",
    "Std.", "Keine aktive Partie"],
  fr: ["Salon", "Partie", "Contre le bot", "Profil", "Créer une partie", "Mise", "Temps par joueur", "Cagnotte", "Frais", "Le gagnant reçoit",
    "Créer", "Rejoindre", "Annuler", "Aucune partie ouverte — créez la première", "À vous de jouer", "Au tour de l'adversaire", "Abandonner", "Proposer nulle", "Accepter la nulle", "Vous avez gagné",
    "Vous avez perdu", "Nulle — mises remboursées", "En attente d'un adversaire…", "Nouvelle partie", "Niveau", "Couleur", "Blancs", "Noirs", "Aléatoire", "Statistiques",
    "Historique", "Solde", "J'ai 18 ans ou plus et je sais que je peux perdre ma mise", "Thème de l'échiquier", "Retour au salon", "Connectez un portefeuille pour jouer en USDC", "Il vous faut un peu de POL pour les frais de réseau", "Approbation USDC…", "Confirmation de la transaction…", "Échec et mat",
    "Temps écoulé", "Abandon", "Nulle", "Victoires", "Défaites", "Nulles", "Résultat net", "Le bot réfléchit…", "Indifférent", "min",
    "h", "Aucune partie en cours"],
  pt: ["Lobby", "Jogo", "Contra o bot", "Perfil", "Criar jogo", "Aposta", "Tempo por jogador", "Prêmio", "Taxa", "O vencedor recebe",
    "Criar", "Entrar", "Cancelar", "Ainda não há jogos abertos — crie o primeiro", "Sua vez", "Vez do adversário", "Desistir", "Propor empate", "Aceitar empate", "Você venceu",
    "Você perdeu", "Empate — apostas devolvidas", "Aguardando adversário…", "Novo jogo", "Nível", "Cor", "Brancas", "Pretas", "Aleatória", "Estatísticas",
    "Histórico", "Saldo", "Tenho 18+ anos e sei que posso perder minha aposta", "Tema do tabuleiro", "Voltar ao lobby", "Conecte uma carteira para jogar com USDC", "Você precisa de um pouco de POL para as taxas de rede", "Aprovando USDC…", "Confirmando transação…", "Xeque-mate",
    "Tempo esgotado", "Desistência", "Empate", "Vitórias", "Derrotas", "Empates", "Resultado líquido", "O bot está pensando…", "Qualquer", "min",
    "h", "Nenhum jogo ativo"],
  tr: ["Lobi", "Oyun", "Bota karşı", "Profil", "Oyun oluştur", "Bahis", "Oyuncu başına süre", "Havuz", "Komisyon", "Kazanan alır",
    "Oluştur", "Katıl", "İptal", "Henüz açık oyun yok — ilkini oluşturun", "Sıra sende", "Rakibin sırası", "Çekil", "Beraberlik teklif et", "Beraberliği kabul et", "Kazandın",
    "Kaybettin", "Beraberlik — bahisler iade edildi", "Rakip bekleniyor…", "Yeni oyun", "Seviye", "Renk", "Beyaz", "Siyah", "Rastgele", "İstatistikler",
    "Oyun geçmişi", "Bakiye", "18 yaşından büyüğüm ve bahsimi kaybedebileceğimi biliyorum", "Tahta teması", "Lobiye dön", "USDC ile oynamak için cüzdanla giriş yapın", "Ağ ücretleri için biraz POL gerekir", "USDC onaylanıyor…", "İşlem onaylanıyor…", "Şah mat",
    "Süre doldu", "Çekilme", "Beraberlik", "Galibiyet", "Mağlubiyet", "Beraberlik", "Net sonuç", "Bot düşünüyor…", "Herhangi", "dk",
    "sa", "Aktif oyun yok"],
  zh: ["大厅", "对局", "人机", "个人", "创建对局", "赌注", "每位玩家用时", "奖池", "手续费", "获胜者得到",
    "创建", "加入", "取消", "暂无开放对局，创建第一局吧", "轮到你了", "轮到对手", "认输", "提议和棋", "接受和棋", "你赢了",
    "你输了", "和棋——赌注已退还", "等待对手…", "新对局", "难度", "执棋颜色", "白方", "黑方", "随机", "统计",
    "对局记录", "余额", "我已年满18岁，并知晓可能损失赌注", "棋盘主题", "返回大厅", "请连接钱包以使用 USDC 对弈", "需要少量 POL 支付网络费用", "正在授权 USDC…", "正在确认交易…", "将死",
    "超时", "认输", "和棋", "胜", "负", "和", "净收益", "机器人思考中…", "不限", "分钟",
    "小时", "没有进行中的对局"],
  ar: ["الردهة", "اللعبة", "ضد الروبوت", "الملف الشخصي", "إنشاء لعبة", "الرهان", "الوقت لكل لاعب", "الجائزة", "العمولة", "يحصل الفائز على",
    "إنشاء", "انضمام", "إلغاء", "لا توجد ألعاب مفتوحة بعد — أنشئ أول لعبة", "دورك", "دور الخصم", "استسلام", "عرض التعادل", "قبول التعادل", "لقد فزت",
    "لقد خسرت", "تعادل — أُعيدت الرهانات", "بانتظار الخصم…", "لعبة جديدة", "المستوى", "اللون", "أبيض", "أسود", "عشوائي", "الإحصاءات",
    "سجل المباريات", "الرصيد", "عمري 18 عامًا أو أكثر وأعلم أنني قد أخسر رهاني", "سمة اللوحة", "العودة إلى الردهة", "سجّل الدخول بمحفظة للعب بعملة USDC", "تحتاج قليلًا من POL لرسوم الشبكة", "جارٍ اعتماد USDC…", "جارٍ تأكيد المعاملة…", "كش مات",
    "انتهى الوقت", "استسلام", "تعادل", "انتصارات", "هزائم", "تعادلات", "صافي النتيجة", "الروبوت يفكر…", "أي", "د",
    "س", "لا توجد لعبة نشطة"],
};

export const DICT = Object.fromEntries(
  (Object.keys(RAW) as Lang[]).map((l) => [l, Object.fromEntries(KEYS.map((k, i) => [k, RAW[l][i]]))])
) as Record<Lang, Record<Key, string>>;

export const detectLang = (): Lang => {
  if (typeof navigator === "undefined") return "en";
  const c = navigator.language.slice(0, 2).toLowerCase();
  return (c in LANGS ? c : "en") as Lang;
};
export const isRtl = (l: Lang) => l === "ar";
