// Все тексты интерфейса. Порядок значений в массивах совпадает с порядком KEYS.
export const KEYS = [
  "lobby", "play", "bot", "profile", "createGame", "bet", "time", "pot", "fee", "winnerGets",
  "create", "join", "cancel", "noGames", "yourTurn", "oppTurn", "resign", "offerDraw", "acceptDraw", "won",
  "lost", "drawn", "waiting", "newGame", "level", "color", "white", "black", "random", "stats",
  "history", "balance", "ageNote", "boardTheme", "backLobby", "signIn", "lowGas", "approving", "confirming", "rChk",
  "rTime", "rRes", "rDraw", "wins", "losses", "draws", "net", "thinking", "any", "min",
  "hr", "noActive",
] as const;
export const EXTRA_KEYS = [
  "congrats", "claim", "claimed", "payoutWait", "share", "copyLink", "linkCopied", "privateGame", "priv", "myGames",
  "inviteTitle", "inviteBad", "inviteText", "refund", "refundHint", "gameId", "unclaimed", "live", "claimNote", "noMyGames",
  "resume", "rTimeDraw", "rAbort",
] as const;
export type ExtraKey = (typeof EXTRA_KEYS)[number];
export type Key = (typeof KEYS)[number] | ExtraKey;

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

// Тексты функций приглашений, Мои игры, claim (по именам ключей — перепутать порядок нельзя)
const EXTRA: Record<Lang, Record<ExtraKey, string>> = {
  ru: { congrats: "Поздравляем!", claim: "Забрать", claimed: "Получено ✓", payoutWait: "Результат подтверждается в блокчейне…", share: "Поделиться", copyLink: "Копировать ссылку", linkCopied: "Ссылка скопирована", privateGame: "Приватная игра (только по ссылке)", priv: "Приватная", myGames: "Мои игры",
    inviteTitle: "Вас пригласили в игру", inviteBad: "Игра не найдена или уже началась", inviteText: "Сыграй со мной в шахматы в Chess Bet", refund: "Вернуть ставки", refundHint: "Если партия так и не завершилась, ставки можно вернуть через 2 × лимит времени + 3 дня. Введите номер игры.", gameId: "Номер игры", unclaimed: "Невостребованные выплаты", live: "Сейчас", claimNote: "Выигрыш отправляется на ваш кошелёк после нажатия «Забрать».", noMyGames: "У вас нет открытых игр", resume: "Продолжить",
    rTimeDraw: "Время вышло, но у соперника недостаточно материала для мата — ничья", rAbort: "Первый ход не был сделан — игра отменена, ставки возвращены" },
  en: { congrats: "Congratulations!", claim: "Claim", claimed: "Claimed ✓", payoutWait: "Confirming the result on-chain…", share: "Share", copyLink: "Copy link", linkCopied: "Link copied", privateGame: "Private game (join by link only)", priv: "Private", myGames: "My games",
    inviteTitle: "You are invited to a game", inviteBad: "Game not found or already started", inviteText: "Play chess with me on Chess Bet", refund: "Refund stakes", refundHint: "If a game never finished, stakes can be refunded after 2 × the time limit + 3 days. Enter the game ID.", gameId: "Game ID", unclaimed: "Unclaimed winnings", live: "Live", claimNote: "Winnings are sent to your wallet when you press Claim.", noMyGames: "You have no open games", resume: "Continue",
    rTimeDraw: "Time out, but the opponent cannot checkmate — draw", rAbort: "No first move was made — game aborted, stakes returned" },
  es: { congrats: "¡Felicidades!", claim: "Reclamar", claimed: "Reclamado ✓", payoutWait: "Confirmando el resultado en la cadena…", share: "Compartir", copyLink: "Copiar enlace", linkCopied: "Enlace copiado", privateGame: "Partida privada (solo por enlace)", priv: "Privada", myGames: "Mis partidas",
    inviteTitle: "Te han invitado a una partida", inviteBad: "Partida no encontrada o ya iniciada", inviteText: "Juega al ajedrez conmigo en Chess Bet", refund: "Devolver apuestas", refundHint: "Si una partida no terminó, las apuestas pueden devolverse tras 2 × el límite de tiempo + 3 días. Introduce el ID de la partida.", gameId: "ID de partida", unclaimed: "Pagos sin reclamar", live: "En vivo", claimNote: "Las ganancias se envían a tu billetera al pulsar «Reclamar».", noMyGames: "No tienes partidas abiertas", resume: "Continuar",
    rTimeDraw: "Se agotó el tiempo, pero el rival no puede dar mate: tablas", rAbort: "No se hizo el primer movimiento: partida anulada, apuestas devueltas" },
  de: { congrats: "Glückwunsch!", claim: "Abholen", claimed: "Abgeholt ✓", payoutWait: "Ergebnis wird on-chain bestätigt…", share: "Teilen", copyLink: "Link kopieren", linkCopied: "Link kopiert", privateGame: "Private Partie (nur per Link)", priv: "Privat", myGames: "Meine Spiele",
    inviteTitle: "Du wurdest zu einer Partie eingeladen", inviteBad: "Partie nicht gefunden oder bereits gestartet", inviteText: "Spiel Schach mit mir bei Chess Bet", refund: "Einsätze zurückfordern", refundHint: "Wurde eine Partie nie beendet, können die Einsätze nach 2 × Zeitlimit + 3 Tagen zurückgefordert werden. Gib die Partie-ID ein.", gameId: "Partie-ID", unclaimed: "Nicht abgeholte Auszahlungen", live: "Live", claimNote: "Der Gewinn wird nach Klick auf «Abholen» an deine Wallet gesendet.", noMyGames: "Du hast keine offenen Spiele", resume: "Fortsetzen",
    rTimeDraw: "Zeit abgelaufen, aber der Gegner kann nicht mehr mattsetzen — Remis", rAbort: "Kein erster Zug — Partie abgebrochen, Einsätze zurückerstattet" },
  fr: { congrats: "Félicitations !", claim: "Récupérer", claimed: "Récupéré ✓", payoutWait: "Confirmation du résultat sur la chaîne…", share: "Partager", copyLink: "Copier le lien", linkCopied: "Lien copié", privateGame: "Partie privée (uniquement par lien)", priv: "Privée", myGames: "Mes parties",
    inviteTitle: "Vous êtes invité à une partie", inviteBad: "Partie introuvable ou déjà commencée", inviteText: "Joue aux échecs avec moi sur Chess Bet", refund: "Rembourser les mises", refundHint: "Si une partie n'a jamais été terminée, les mises peuvent être remboursées après 2 × la limite de temps + 3 jours. Saisissez l'ID de la partie.", gameId: "ID de la partie", unclaimed: "Gains non récupérés", live: "En direct", claimNote: "Les gains sont envoyés sur votre portefeuille après avoir appuyé sur « Récupérer ».", noMyGames: "Vous n'avez aucune partie ouverte", resume: "Continuer",
    rTimeDraw: "Temps écoulé, mais l'adversaire ne peut pas mater — nulle", rAbort: "Aucun premier coup — partie annulée, mises remboursées" },
  pt: { congrats: "Parabéns!", claim: "Resgatar", claimed: "Resgatado ✓", payoutWait: "Confirmando o resultado na blockchain…", share: "Compartilhar", copyLink: "Copiar link", linkCopied: "Link copiado", privateGame: "Jogo privado (somente por link)", priv: "Privado", myGames: "Meus jogos",
    inviteTitle: "Você foi convidado para um jogo", inviteBad: "Jogo não encontrado ou já iniciado", inviteText: "Jogue xadrez comigo no Chess Bet", refund: "Devolver apostas", refundHint: "Se um jogo nunca terminou, as apostas podem ser devolvidas após 2 × o limite de tempo + 3 dias. Digite o ID do jogo.", gameId: "ID do jogo", unclaimed: "Pagamentos não resgatados", live: "Ao vivo", claimNote: "Os ganhos são enviados à sua carteira ao clicar em «Resgatar».", noMyGames: "Você não tem jogos abertos", resume: "Continuar",
    rTimeDraw: "Tempo esgotado, mas o adversário não pode dar xeque-mate — empate", rAbort: "O primeiro lance não foi feito — jogo cancelado, apostas devolvidas" },
  tr: { congrats: "Tebrikler!", claim: "Talep et", claimed: "Alındı ✓", payoutWait: "Sonuç zincirde onaylanıyor…", share: "Paylaş", copyLink: "Bağlantıyı kopyala", linkCopied: "Bağlantı kopyalandı", privateGame: "Özel oyun (yalnızca bağlantıyla)", priv: "Özel", myGames: "Oyunlarım",
    inviteTitle: "Bir oyuna davet edildiniz", inviteBad: "Oyun bulunamadı veya başladı", inviteText: "Chess Bet'te benimle satranç oyna", refund: "Bahisleri iade al", refundHint: "Oyun hiç bitmediyse, bahisler 2 × süre sınırı + 3 gün sonra iade edilebilir. Oyun kimliğini girin.", gameId: "Oyun kimliği", unclaimed: "Talep edilmemiş ödemeler", live: "Canlı", claimNote: "Kazanç, «Talep et» düğmesine bastığınızda cüzdanınıza gönderilir.", noMyGames: "Açık oyununuz yok", resume: "Devam et",
    rTimeDraw: "Süre doldu ancak rakip mat edemez — beraberlik", rAbort: "İlk hamle yapılmadı — oyun iptal edildi, bahisler iade edildi" },
  zh: { congrats: "恭喜！", claim: "领取", claimed: "已领取 ✓", payoutWait: "正在链上确认结果…", share: "分享", copyLink: "复制链接", linkCopied: "链接已复制", privateGame: "私人对局（仅限链接加入）", priv: "私人", myGames: "我的对局",
    inviteTitle: "你被邀请参加对局", inviteBad: "未找到对局或已开始", inviteText: "来 Chess Bet 和我下棋", refund: "退还赌注", refundHint: "如果对局一直未结束，在2 ×用时 + 3天之后可退还赌注。请输入对局编号。", gameId: "对局编号", unclaimed: "待领取款项", live: "实时", claimNote: "点击“领取”后，奖金将发送到你的钱包。", noMyGames: "你没有开放的对局", resume: "继续",
    rTimeDraw: "超时，但对手无法将死——判和", rAbort: "未走第一步——对局取消，赌注已退还" },
  ar: { congrats: "تهانينا!", claim: "استلام", claimed: "تم الاستلام ✓", payoutWait: "جارٍ تأكيد النتيجة على السلسلة…", share: "مشاركة", copyLink: "نسخ الرابط", linkCopied: "تم نسخ الرابط", privateGame: "لعبة خاصة (بالرابط فقط)", priv: "خاصة", myGames: "ألعابي",
    inviteTitle: "تمت دعوتك إلى لعبة", inviteBad: "اللعبة غير موجودة أو بدأت بالفعل", inviteText: "العب الشطرنج معي على Chess Bet", refund: "استرداد الرهانات", refundHint: "إذا لم تنتهِ اللعبة قط، يمكن استرداد الرهانات بعد 2 × المهلة + 3 أيام. أدخل رقم اللعبة.", gameId: "رقم اللعبة", unclaimed: "مبالغ غير مستلمة", live: "مباشر", claimNote: "تُرسل الأرباح إلى محفظتك عند الضغط على «استلام».", noMyGames: "ليس لديك ألعاب مفتوحة", resume: "متابعة",
    rTimeDraw: "انتهى الوقت لكن الخصم لا يستطيع التمات — تعادل", rAbort: "لم يتم أول نقلة — أُلغيت اللعبة وأُعيدت الرهانات" },
};

export const DICT = Object.fromEntries(
  (Object.keys(RAW) as Lang[]).map((l) => [
    l,
    { ...Object.fromEntries(KEYS.map((k, i) => [k, RAW[l][i]])), ...EXTRA[l] },
  ])
) as Record<Lang, Record<Key, string>>;

export const detectLang = (): Lang => {
  if (typeof navigator === "undefined") return "en";
  const c = navigator.language.slice(0, 2).toLowerCase();
  return (c in LANGS ? c : "en") as Lang;
};
export const isRtl = (l: Lang) => l === "ar";
