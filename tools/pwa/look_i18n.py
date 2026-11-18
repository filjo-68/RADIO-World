import json, sys
L = ['bg','en','nb','de','es','fr','it','pt','ru','tr','ar','hi','zh','ja','ko']
T = {
 'appearance': ['Вид','Appearance','Utseende','Darstellung','Apariencia','Apparence','Aspetto','Aparência','Оформление','Görünüm','المظهر','रूप-रंग','外观','外観','화면 스타일'],
 'mode': ['Режим','Mode','Modus','Modus','Modo','Mode','Modalità','Modo','Режим','Mod','الوضع','मोड','模式','モード','모드'],
 'modeSystem': ['Системен','System','System','System','Sistema','Système','Sistema','Sistema','Системный','Sistem','النظام','सिस्टम','跟随系统','システム','시스템'],
 'modeLight': ['Светъл','Light','Lys','Hell','Claro','Clair','Chiaro','Claro','Светлый','Açık','فاتح','लाइट','浅色','ライト','라이트'],
 'modeDark': ['Тъмен','Dark','Mørk','Dunkel','Oscuro','Sombre','Scuro','Escuro','Тёмный','Koyu','داكن','डार्क','深色','ダーク','다크'],
 'palette': ['Палитра','Palette','Palett','Farbpalette','Paleta','Palette','Tavolozza','Paleta','Палитра','Palet','لوحة الألوان','रंग पैलेट','配色','カラーパレット','색상 팔레트'],
 'background': ['Фон','Background','Bakgrunn','Hintergrund','Fondo','Arrière-plan','Sfondo','Fundo','Фон','Arka plan','الخلفية','बैकग्राउंड','背景','背景','배경'],
 'effects': ['Ефекти','Effects','Effekter','Effekte','Efectos','Effets','Effetti','Efeitos','Эффекты','Efektler','المؤثرات','इफ़ेक्ट','效果','エフェクト','효과'],
 'presets': ['Готови схеми','Ready-made schemes','Ferdige temaer','Fertige Stile','Combinaciones listas','Ambiances prêtes','Stili pronti','Combinações prontas','Готовые схемы','Hazır temalar','أنماط جاهزة','तैयार थीम','精选组合','おすすめの組み合わせ','추천 조합'],
 'randomCombo': ['Случайна комбинация','Random combination','Tilfeldig kombinasjon','Zufällige Kombination','Combinación aleatoria','Combinaison aléatoire','Combinazione casuale','Combinação aleatória','Случайное сочетание','Rastgele kombinasyon','تركيبة عشوائية','रैंडम कॉम्बिनेशन','随机组合','ランダムな組み合わせ','무작위 조합'],
 'reset': ['Нулирай','Reset','Tilbakestill','Zurücksetzen','Restablecer','Réinitialiser','Ripristina','Redefinir','Сбросить','Sıfırla','إعادة الضبط','रीसेट करें','重置','リセット','초기화'],
 'schemeApplied': ['Схема: {name}','Scheme: {name}','Tema: {name}','Stil: {name}','Combinación: {name}','Ambiance : {name}','Stile: {name}','Combinação: {name}','Схема: {name}','Tema: {name}','النمط: {name}','थीम: {name}','配色：{name}','組み合わせ：{name}','조합: {name}'],
 'grain': ['Филмово зърно','Film grain','Filmkorn','Filmkorn','Grano de película','Grain argentique','Grana pellicola','Granulado de filme','Плёночное зерно','Film greni','حبيبات الفيلم','फ़िल्म ग्रेन','胶片颗粒','フィルムグレイン','필름 그레인'],
 'glow': ['Неоново сияние','Neon glow','Neonglød','Neonglühen','Brillo neón','Lueur néon','Bagliore neon','Brilho neon','Неоновое свечение','Neon parıltı','توهج نيون','नियॉन ग्लो','霓虹光晕','ネオングロー','네온 글로우'],
 'glass': ['Матово стъкло','Frosted glass','Frostet glass','Milchglas','Vidrio esmerilado','Verre dépoli','Vetro smerigliato','Vidro fosco','Матовое стекло','Buzlu cam','زجاج مصنفر','फ़्रॉस्टेड ग्लास','磨砂玻璃','すりガラス','반투명 유리'],
 'bgLights': ['Плаващи светлини','Floating lights','Svevende lys','Schwebende Lichter','Luces flotantes','Lumières flottantes','Luci fluttuanti','Luzes flutuantes','Плывущие огни','Süzülen ışıklar','أضواء عائمة','तैरती रोशनियाँ','流动光影','浮遊する光','떠다니는 빛'],
 'bgMesh': ['Мек градиент','Soft mesh','Myk gradient','Weicher Verlauf','Degradado suave','Dégradé doux','Sfumatura morbida','Gradiente suave','Мягкий градиент','Yumuşak geçiş','تدرّج ناعم','सॉफ़्ट ग्रेडिएंट','柔和渐变','ソフトグラデーション','부드러운 그라데이션'],
 'bgStars': ['Звездно небе','Starfield','Stjernehimmel','Sternenhimmel','Cielo estrellado','Ciel étoilé','Cielo stellato','Céu estrelado','Звёздное небо','Yıldızlı gökyüzü','سماء مرصّعة بالنجوم','तारों भरा आसमान','星空','星空','별이 빛나는 하늘'],
 'bgGrid': ['Ретро мрежа','Retro grid','Retrorutenett','Retro-Raster','Rejilla retro','Grille rétro','Griglia retrò','Grade retrô','Ретро-сетка','Retro ızgara','شبكة ريترو','रेट्रो ग्रिड','复古网格','レトログリッド','레트로 그리드'],
 'bgMinimal': ['Минимален','Minimal','Minimal','Minimal','Mínimo','Minimal','Minimale','Mínimo','Минимальный','Sade','بسيط','मिनिमल','极简','ミニマル','미니멀'],
 'palAurora': ['Сияние','Aurora','Aurora','Polarlicht','Aurora','Aurore','Aurora','Aurora','Сияние','Kutup ışığı','الشفق','ऑरोरा','极光','オーロラ','오로라'],
 'palSynthwave': ['Синтуейв','Synthwave','Synthwave','Synthwave','Synthwave','Synthwave','Synthwave','Synthwave','Синтвейв','Synthwave','سينثويف','सिंथवेव','合成波','シンセウェイブ','신스웨이브'],
 'palSunset': ['Залез','Sunset','Solnedgang','Sonnenuntergang','Atardecer','Coucher de soleil','Tramonto','Pôr do sol','Закат','Gün batımı','الغروب','सूर्यास्त','日落','夕焼け','노을'],
 'palOcean': ['Океан','Ocean','Hav','Ozean','Océano','Océan','Oceano','Oceano','Океан','Okyanus','المحيط','महासागर','海洋','オーシャン','바다'],
 'palForest': ['Гора','Forest','Skog','Wald','Bosque','Forêt','Foresta','Floresta','Лес','Orman','الغابة','जंगल','森林','フォレスト','숲'],
 'palMocha': ['Мока','Mocha','Mokka','Mokka','Moca','Moka','Moka','Mocha','Мокко','Moka','موكا','मोका','摩卡','モカ','모카'],
 'palLavender': ['Лавандула','Lavender','Lavendel','Lavendel','Lavanda','Lavande','Lavanda','Lavanda','Лаванда','Lavanta','الخزامى','लैवेंडर','薰衣草','ラベンダー','라벤더'],
 'palCitrus': ['Цитрус','Citrus','Sitrus','Zitrus','Cítrico','Agrumes','Agrumi','Cítrico','Цитрус','Narenciye','حمضيات','सिट्रस','柑橘','シトラス','시트러스'],
 'palSakura': ['Сакура','Sakura','Sakura','Kirschblüte','Sakura','Sakura','Sakura','Sakura','Сакура','Sakura','ساكورا','साकुरा','樱花','桜','벚꽃'],
 'palFjord': ['Фиорд','Fjord','Fjord','Fjord','Fiordo','Fjord','Fiordo','Fiorde','Фьорд','Fiyort','مضيق بحري','फ़्योर्ड','峡湾','フィヨルド','피오르'],
 'palLuxe': ['Злато','Gold','Gull','Gold','Oro','Or','Oro','Ouro','Золото','Altın','الذهب','सोना','金色','ゴールド','골드'],
 'palMono': ['Графит','Graphite','Grafitt','Graphit','Grafito','Graphite','Grafite','Grafite','Графит','Grafit','غرافيت','ग्रेफ़ाइट','石墨','グラファイト','그라파이트'],
 'palTropic': ['Тропик','Tropical','Tropisk','Tropisch','Tropical','Tropical','Tropicale','Tropical','Тропики','Tropikal','استوائي','ट्रॉपिकल','热带','トロピカル','트로피컬'],
 'palLava': ['Лава','Lava','Lava','Lava','Lava','Lave','Lava','Lava','Лава','Lav','الحمم','लावा','熔岩','溶岩','용암'],
 'prNorthern': ['Северно сияние','Northern Lights','Nordlys','Nordlicht','Aurora boreal','Aurore boréale','Aurora boreale','Aurora boreal','Северное сияние','Kuzey ışıkları','الشفق القطبي','नॉर्दर्न लाइट्स','北极光','ノーザンライツ','북극광'],
 'prSynth': ['Синтуейв ’84','Synthwave ’84','Synthwave ’84','Synthwave ’84','Synthwave ’84','Synthwave ’84','Synthwave ’84','Synthwave ’84','Синтвейв ’84','Synthwave ’84','سينثويف 84','सिंथवेव ’84','合成波 ’84','シンセウェイブ ’84','신스웨이브 ’84'],
 'prDeepsea': ['Дълбоко море','Deep Sea','Dyphav','Tiefsee','Mar profundo','Grands fonds','Abissi','Mar profundo','Глубокое море','Derin deniz','أعماق البحر','गहरा समुद्र','深海','深海','심해'],
 'prNightsky': ['Нощно небе','Night Sky','Nattehimmel','Nachthimmel','Cielo nocturno','Ciel nocturne','Cielo notturno','Céu noturno','Ночное небо','Gece göğü','سماء الليل','रात का आसमान','夜空','夜空','밤하늘'],
 'prGolden': ['Златен час','Golden Hour','Gyllen time','Goldene Stunde','Hora dorada','Heure dorée','Ora dorata','Hora dourada','Золотой час','Altın saat','الساعة الذهبية','गोल्डन आवर','黄金时刻','ゴールデンアワー','골든 아워'],
 'prTokyo': ['Токийска нощ','Tokyo Night','Tokyo-natt','Nacht in Tokio','Noche en Tokio','Nuit à Tokyo','Notte a Tokyo','Noite em Tóquio','Ночной Токио','Tokyo gecesi','ليل طوكيو','टोक्यो की रात','东京之夜','東京の夜','도쿄의 밤'],
 'prLuxe': ['Златна полунощ','Midnight Gold','Midnattsgull','Mitternachtsgold','Oro de medianoche','Or de minuit','Oro di mezzanotte','Ouro da meia-noite','Полуночное золото','Gece yarısı altını','ذهب منتصف الليل','आधी रात का सोना','午夜金','ミッドナイトゴールド','미드나잇 골드'],
 'prCafe': ['Кафене','Café','Kafé','Café','Café','Café','Caffè','Café','Кофейня','Kafe','مقهى','कैफ़े','咖啡馆','カフェ','카페'],
 'prJungle': ['Джунгла','Jungle','Jungel','Dschungel','Selva','Jungle','Giungla','Selva','Джунгли','Yağmur ormanı','الأدغال','घना जंगल','丛林','ジャングル','정글'],
 'prZen': ['Дзен','Zen','Zen','Zen','Zen','Zen','Zen','Zen','Дзен','Zen','زِن','ज़ेन','禅意','禅','젠'],
}
for k, v in T.items(): assert len(v) == len(L), k
out = ["\n/* Appearance (colour schemes) — added in 2.2 */"]
for i, code in enumerate(L):
    out.append(f"Object.assign(window.RW_I18N.{code}, " + json.dumps({k: v[i] for k, v in T.items()}, ensure_ascii=False) + ");")
open(sys.argv[1], 'a', encoding='utf-8').write("\n".join(out) + "\n")
print('added', len(T), 'keys x', len(L), 'languages')
