(() => {
  const G=window.BIOLOGY_GAMES;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  // First option is the authored answer; options are shuffled for display.
  const questions={
    9:[
      ['С какого увеличения начинают работу с микроскопом?',['С малого','С самого большого','Увеличение не имеет значения'],'При малом увеличении видно больше пространства, поэтому легче найти объект.'],
      ['Куда помещают приготовленный микропрепарат?',['На предметный столик','На окуляр','Под основание микроскопа'],'Предметный столик удерживает стекло с препаратом.'],
      ['Окуляр увеличивает в 10 раз, объектив — в 4 раза. Каково общее увеличение?',['В 40 раз','В 14 раз','В 6 раз'],'Увеличения перемножают: 10 × 4 = 40.'],
      ['Зачем нужен тонкий препарат для проходящего света?',['Чтобы свет проходил через объект','Чтобы клеткам стало теснее','Чтобы увеличить размер окуляра'],'Слишком толстый образец задерживает свет: его внутренние детали трудно рассмотреть.'],
      ['Изображение размыто. Что помогает сделать его чётким?',['Осторожная настройка винтами фокусировки','Сильное нажатие на стекло','Резкое опускание объектива на препарат'],'Резкость настраивают плавно. Объектив не должен касаться препарата.']
    ],
    10:[
      ['Из чего состоят растения, животные и грибы?',['Из клеток','Только из воды','Из одинаковых органов'],'Клетка — основная единица строения и жизнедеятельности клеточных организмов.'],
      ['Что регулирует поступление веществ в клетку и выход из неё?',['Клеточная мембрана','Окуляр','Клеточный сок'],'Мембрана отделяет клетку от среды и избирательно пропускает вещества.'],
      ['Где находится основная часть наследственной информации в типичной клетке растения?',['В ядре','В клеточной стенке','Снаружи клетки'],'Ядро содержит основную часть ДНК и участвует в управлении работой клетки.'],
      ['В каких структурах зелёных клеток растения идёт фотосинтез?',['В хлоропластах','В окулярах','В клеточной стенке'],'Хлоропласты содержат хлорофилл. Они помогают создавать органические вещества на свету.'],
      ['В клетках кожицы луковицы не видно хлоропластов. Это возможно?',['Да: хлоропласты есть не во всех растительных клетках','Нет: все растительные клетки обязательно зелёные','Нет: у растения вообще нет клеток'],'Кожица луковицы обычно не содержит хлоропластов. Отсутствие зелёного цвета не делает клетку животной.']
    ],
    14:[
      ['Что отличает прокариотическую клетку?',['У неё нет ядра, окружённого ядерной оболочкой','У неё совсем нет наследственного материала','У неё нет клеточной мембраны'],'У прокариот есть ДНК, но она не заключена в оформленное ядро.'],
      ['К какой группе относятся бактерии?',['К прокариотам','К растениям','К животным'],'Бактерии — прокариотические организмы. К прокариотам также относят архей.'],
      ['Может ли одна бактериальная клетка быть целым организмом?',['Да','Нет: организм всегда состоит из органов','Нет: организм всегда многоклеточный'],'Бактерии одноклеточные: одна клетка выполняет основные функции организма.'],
      ['Все ли бактерии вызывают болезни?',['Нет: многие полезны или безвредны','Да: все бактерии опасны','Нет: бактерии вообще не влияют на природу'],'Бактерии разнообразны. Многие участвуют в разложении веществ, пищеварении и других процессах.'],
      ['Какое утверждение о вирусах верно?',['У них нет клеточного строения, для размножения нужна клетка-хозяин','Вирус — маленькая бактериальная клетка','У всех вирусов есть ядро'],'Вирусы имеют неклеточное строение. Их нельзя считать прокариотическими клетками.']
    ],
    21:[
      ['Две водоросли используют один ограниченный источник света. Что возможно между ними?',['Конкуренция','Опыление','Образование общего ядра'],'Конкуренция возникает, когда организмы используют общий ресурс, которого не хватает всем.'],
      ['За что могут конкурировать растения в одном водоёме?',['За свет и минеральные вещества','За школьные микроскопы','За готовые хлоропласты других растений'],'Свет и минеральные вещества нужны растениям. При их недостатке возникает конкуренция.'],
      ['Какие организмы могут быть конкурентами?',['Как одного, так и разных видов','Только разных видов','Только хищники'],'Конкуренция бывает внутри вида и между видами. Главное — использование ограниченного общего ресурса.'],
      ['Чем конкуренция отличается от поедания добычи?',['Конкуренты используют общий ресурс; один не обязательно ест другого','Конкуренты всегда поедают друг друга','Конкуренция возможна только у неживых тел'],'Конкуренция и хищничество — разные виды взаимоотношений.'],
      ['Что входит в экосистему пруда?',['Организмы, неживая среда и связи между ними','Только рыбы','Только вода'],'Экосистема объединяет сообщество живых организмов с водой, светом и другими условиями среды.']
    ],
    22:[
      ['Как называют организм, который сам образует органические вещества из неорганических?',['Продуцент — производитель','Консумент — потребитель','Редуцент — разлагатель'],'Зелёные растения и многие водоросли — продуценты. Они образуют органические вещества при фотосинтезе.'],
      ['Инфузория питается бактериями. Какова её роль в этой пищевой связи?',['Консумент — потребитель','Продуцент — производитель','Неживое условие среды'],'Инфузория использует готовые органические вещества других организмов, поэтому является потребителем.'],
      ['Гриб разлагает опавший лист. Какую роль он выполняет?',['Редуцента — разлагателя','Продуцента — производителя','Источника солнечного света'],'Многие грибы и бактерии разлагают органические остатки, возвращая вещества в круговорот.'],
      ['Куда направлена стрелка в пищевой цепи «водоросль → рачок»?',['От пищи к тому, кто её ест','От хищника к его пище','Всегда от большого организма к маленькому'],'Стрелка показывает, откуда к потребителю переходят вещество и энергия пищи.'],
      ['Консумент и конкурент — одно и то же?',['Нет: консумент питается готовыми веществами, конкурент соперничает за ресурс','Да: это одинаковые слова','Нет: конкурентом бывает только бактерия'],'Консумент — роль в питании. Конкурент — участник соперничества. Один организм может быть и тем, и другим.']
    ]
  };
  const stages=['Освещение','Препарат','Объектив','Поиск объекта','Резкость'];
  const samples={
    onion:{name:'Кожица луковицы',type:'plant',tag:'Растительная клетка',topic:10,about:'Ряды вытянутых клеток похожи на кирпичики. Их границы образованы клеточными стенками. В этой кожице обычно нет зелёных хлоропластов.',features:[['wall','Клеточная стенка','Прочная наружная оболочка помогает клетке сохранять форму.'],['nucleus','Ядро','Содержит основную часть наследственной информации. На схеме оно выделено фиолетовым; в реальном препарате его видимость зависит от подготовки.'],['vacuole','Вакуоль','В зрелой растительной клетке крупная вакуоль содержит клеточный сок.']]},
    leaf:{name:'Клетки зелёного листа',type:'leaf',tag:'Продуцент',topic:10,about:'В зелёных клетках видны хлоропласты. Зелёное растение использует энергию света для образования органических веществ. Поэтому оно является продуцентом.',features:[['wall','Клеточная стенка','Отделяет соседние клетки и поддерживает их форму.'],['chloroplast','Хлоропласты','Зелёные структуры, в которых происходит фотосинтез.'],['vacuole','Вакуоль','Содержит клеточный сок и занимает большую часть объёма многих зрелых растительных клеток.']]},
    animal:{name:'Типичная животная клетка',type:'animal',tag:'Клетка с ядром',topic:10,about:'У животной клетки есть мембрана, цитоплазма и обычно ядро. Клеточной стенки и хлоропластов нет. Цвета условные: они помогают различать части клетки.',features:[['membrane','Мембрана','Отделяет клетку от среды и регулирует обмен веществ.'],['nucleus','Ядро','Хранит основную часть наследственной информации.'],['cytoplasm','Цитоплазма','Внутреннее содержимое клетки, кроме ядра; здесь находятся её структуры.']]},
    bacteria:{name:'Бактерии: формы клеток',type:'bacteria',tag:'Прокариоты',topic:14,about:'Можно сравнить шаровидные и палочковидные клетки. У бактерий нет оформленного ядра, но есть ДНК. По одной форме клетки нельзя определить, полезна бактерия или опасна.',features:[['round','Шаровидные клетки','Такие формы бактерий называют кокками. Круг — это форма целой клетки, а не её ядро.'],['rod','Палочковидные клетки','Эти бактериальные клетки вытянуты. Бактерии могут иметь и другие формы.'],['group','Группа клеток','Несколько клеток могут располагаться рядом. Каждая из показанных клеток — отдельный одноклеточный организм.']]},
    algae:{name:'Зелёная водоросль',type:'algae',tag:'Продуцент',topic:22,about:'Эта зелёная водоросль образует органические вещества на свету. Она служит примером продуцента. Её роль определяется способом питания, а не просто маленьким размером.',features:[['cell','Клетки водоросли','В модели показаны отдельные клетки зелёной водоросли.'],['green','Зелёные структуры','Содержат хлорофилл, участвующий в фотосинтезе.']]},
    consumer:{name:'Инфузория',type:'consumer',tag:'Консумент',topic:22,about:'Инфузория — одноклеточный организм, который может питаться бактериями. В этой связи она является консументом. Пищевую роль определяют по питанию, а не только по внешнему виду.',features:[['cell','Одна клетка — организм','Весь изображённый организм состоит из одной клетки.'],['cilia','Реснички','Многочисленные короткие выросты помогают инфузории двигаться.'],['food','Пищеварительные вакуоли','Внутри них переваривается захваченная пища. Их положение и цвет на схеме условны.']]},
    fungi:{name:'Нити гриба на растительных остатках',type:'fungi',tag:'Редуцент',topic:22,about:'Этот гриб использует вещества отмерших растительных остатков и участвует в их разложении. Он выполняет роль редуцента. Не все грибы питаются одинаково.',features:[['hypha','Гифы','Тонкие ветвящиеся нити, из которых состоит грибница.'],['branch','Ветвление','Ветвящиеся нити помогают грибу осваивать субстрат — материал, на котором он растёт.']]},
    competition:{name:'Две водоросли в одном водоёме',type:'competition',tag:'Общий ограниченный ресурс',topic:21,about:'Оба вида используют свет и минеральные вещества. Если этих ресурсов мало, возможна конкуренция. Одного наблюдения через микроскоп недостаточно, чтобы доказать её: нужны данные об условиях.',features:[['a','Вид А','Один вид водоросли использует свет и растворённые минеральные вещества.'],['b','Вид Б','Другой вид использует те же ресурсы. Отличительный оттенок в модели условный.']]}
  };
  const sampleIds={9:['onion'],10:['onion','leaf','animal'],14:['bacteria'],21:['competition'],22:['algae','consumer','fungi']};
  function instrument(step){return `<svg viewBox="0 0 360 300" role="img" aria-label="Микроскоп: выполнено ${step} из 5 этапов"><path d="M235 61 Q310 78 278 195 L253 244" fill="none" stroke="#6c56c9" stroke-width="36"/><path d="M92 257 H279 Q297 260 301 276 H61 Q68 258 92 257" fill="#26366c"/><rect x="151" y="47" width="43" height="88" rx="9" transform="rotate(-24 172 90)" fill="#425b9f"/><rect x="132" y="32" width="55" height="25" rx="7" transform="rotate(-24 160 44)" fill="#202d54"/><path d="M182 127 L202 162" stroke="${step>=3?'#f2b638':'#617099'}" stroke-width="24"/><rect x="104" y="179" width="160" height="14" rx="6" fill="#26366c"/><rect x="140" y="169" width="85" height="8" rx="3" fill="${step>=2?'#59d4ce':'#b5bdd3'}"/><ellipse cx="194" cy="231" rx="32" ry="14" fill="${step>=1?'#ffe888':'#92a0c1'}"/>${step>=1?'<path d="M179 215 L188 195 M209 215 L200 195" stroke="#f0bb38" stroke-width="5"/>':''}<circle cx="258" cy="132" r="24" fill="${step>=5?'#25af99':'#364983'}"/><circle cx="258" cy="132" r="10" fill="#cad4ee"/><text x="180" y="294" text-anchor="middle" fill="#354773" font-size="14">${step===5?'Прибор готов к наблюдению':`Настройка: ${step} / 5`}</text></svg>`;}
  function specimenSvg(id){
    const type=samples[id].type;let shapes='';
    if(type==='plant'||type==='leaf'){
      for(let row=0;row<4;row++)for(let col=0;col<3;col++){
        const x=col*164-10+(row%2)*40,y=row*123-10;
        shapes+=`<rect data-part="wall" x="${x}" y="${y}" width="159" height="118" rx="15" fill="#faf2d9" stroke="#a37ab4" stroke-width="5"/><rect data-part="vacuole" x="${x+27}" y="${y+17}" width="109" height="83" rx="22" fill="#d7eff5" stroke="#96d2df" stroke-width="2"/>`;
        if(type==='plant')shapes+=`<ellipse data-part="nucleus" cx="${x+17}" cy="${y+66}" rx="9" ry="14" fill="#a869c5"/>`;
        else for(let n=0;n<10;n++)shapes+=`<ellipse data-part="chloroplast" cx="${x+14+(n%5)*31}" cy="${y+(n<5?12:106)}" rx="9" ry="5" fill="#42a64c" transform="rotate(${n*17} ${x+14+(n%5)*31} ${y+(n<5?12:106)})"/>`;
      }
    }else if(type==='animal'){
      for(const [x,y,r] of [[130,150,95],[330,145,100],[210,365,115],[465,360,80]])shapes+=`<ellipse data-part="cytoplasm" cx="${x}" cy="${y}" rx="${r}" ry="${r*.8}" fill="#f5d7e9"/><ellipse data-part="membrane" cx="${x}" cy="${y}" rx="${r}" ry="${r*.8}" fill="none" stroke="#a962b5" stroke-width="5"/><ellipse data-part="nucleus" cx="${x+12}" cy="${y-6}" rx="${r*.28}" ry="${r*.23}" fill="#8b63c0"/>`;
    }else if(type==='bacteria'){
      for(let i=0;i<32;i++){const x=38+(i*83)%420,y=32+(i*113)%436;shapes+=i%2?`<rect data-part="rod" x="${x}" y="${y}" width="34" height="13" rx="6" transform="rotate(${i*19} ${x} ${y})" fill="#8c62bb"/>`:`<circle data-part="round" cx="${x}" cy="${y}" r="9" fill="#da77a5"/>`;}
      shapes+='<g data-part="group" fill="#4975b8"><circle cx="220" cy="230" r="9"/><circle cx="238" cy="230" r="9"/><circle cx="256" cy="230" r="9"/><circle cx="274" cy="230" r="9"/></g>';
    }else if(type==='algae'||type==='competition'){
      for(let i=0;i<14;i++){const x=55+(i*97)%390,y=55+(i*121)%385;const part=type==='competition'?(i%2?'b':'a'):'cell';shapes+=`<ellipse data-part="${part}" cx="${x}" cy="${y}" rx="${i%2?23:32}" ry="32" fill="${type==='competition'&&i%2?'#89cdaa':'#a2d969'}" stroke="#458957" stroke-width="3"/>`;for(let j=0;j<4;j++)shapes+=`<ellipse data-part="${type==='competition'?part:'green'}" cx="${x-12+j*8}" cy="${y+(j%2?10:-10)}" rx="5" ry="11" fill="#378f43"/>`;}
    }else if(type==='consumer'){
      shapes='<ellipse data-part="cell" cx="250" cy="250" rx="105" ry="177" transform="rotate(27 250 250)" fill="#c6e4ec" stroke="#388997" stroke-width="5"/>';
      for(let i=0;i<44;i++){const a=i/44*Math.PI*2;shapes+=`<path data-part="cilia" d="M${250+111*Math.cos(a)} ${250+183*Math.sin(a)} l${18*Math.cos(a)} ${18*Math.sin(a)}" transform="rotate(27 250 250)" stroke="#4ca2ae" stroke-width="3"/>`;}
      for(const [x,y] of [[225,150],[280,235],[230,320],[285,335]])shapes+=`<circle data-part="food" cx="${x}" cy="${y}" r="18" fill="#efc790" stroke="#bb9357" stroke-width="3"/>`;
    }else if(type==='fungi'){
      shapes='<path data-part="hypha" d="M-10 420 Q190 250 300 100 T480 -20 M80 510 Q200 270 450 210 T530 90" fill="none" stroke="#ad7cad" stroke-width="13"/>';
      shapes+='<path data-part="branch" d="M162 295 Q100 180 25 145 M257 147 Q345 170 417 83 M304 251 Q355 327 465 352 M177 345 Q264 423 302 493" fill="none" stroke="#bd92b8" stroke-width="9"/>';
    }
    return `<svg class="lab-specimen" viewBox="0 0 500 500" role="img" aria-label="Учебная схема: ${esc(samples[id].name)}"><rect width="500" height="500" fill="#f8f4dd"/>${shapes}</svg>`;
  }
  function microscopeGame(topic,root,homework,onFinish){
    if(!questions[topic]){root.innerHTML='<p>Лаборатория есть в темах 9, 10, 14, 21 и 22.</p>';return;}
    const deck=questions[topic].map(([text,options,why])=>({text,why,options:shuffle(options.map((text,i)=>({text,correct:i===0})))}));
    let index=0,correct=0,missed=false,locked=false,passed=false,saved=false,chosen=sampleIds[topic][0];
    function progress(){return `<ol class="lab-steps">${stages.map((s,i)=>`<li class="${i<index?'done':i===index?'current':''}"><span>${i<index?'✓':i+1}</span>${s}</li>`).join('')}</ol>`;}
    function setup(){root.innerHTML=`<section class="microscope-lab"><p class="eyebrow">Лаборатория · § ${topic}</p><h2>Открой микромир</h2><p>Ответь на пять вопросов по теме — каждый верный ответ завершает этап настройки. Ошибку можно исправить. После настройки откроется образец: меняй резкость и масштаб, изучай его детали.</p><div class="lab-intro">${instrument(0)}<div><h3>Что будем рассматривать</h3><ul>${sampleIds[topic].map(id=>`<li>${esc(samples[id].name)}</li>`).join('')}</ul><p>В игре используются учебные схемы с условными цветами.</p><button class="account-primary" data-lab-start type="button">Настроить микроскоп →</button></div></div></section>`;root.querySelector('[data-lab-start]').onclick=draw;}
    function draw(){
      if(index===5){observe();return;}
      const q=deck[index];
      root.innerHTML=`<section class="microscope-lab">${progress()}<div class="lab-setup-grid"><aside class="lab-machine">${instrument(index)}<p>Чтобы открыть образец,<br>заверши все 5 этапов.</p></aside><section class="lab-question"><p class="eyebrow">Этап ${index+1}: ${stages[index]}</p><h3>${esc(q.text)}</h3><div class="lab-options">${q.options.map((o,i)=>`<button type="button" data-lab-answer="${i}" ${locked?'disabled':''}>${esc(o.text)}</button>`).join('')}</div><div class="lab-feedback" role="status"></div><p class="form-hint">В результат ДЗ входят первые ответы на 5 вопросов. Исправления помогают завершить настройку.</p></section></div></section>`;
      root.querySelectorAll('[data-lab-answer]').forEach(b=>b.onclick=()=>{
        if(locked)return;const ok=q.options[Number(b.dataset.labAnswer)].correct;
        if(ok){locked=true;passed=true;if(!missed)correct++;root.querySelectorAll('[data-lab-answer]').forEach(el=>el.disabled=true);b.classList.add('lab-answer-correct');}
        else{missed=true;b.disabled=true;b.classList.add('lab-answer-wrong');}
        const box=root.querySelector('.lab-feedback');box.className='lab-feedback '+(ok?'feedback-correct':'feedback-wrong');
        box.innerHTML=`<strong>${ok?'✓ Этап пройден!':'× Попробуй ещё раз'}</strong><p>${esc(q.why)}</p>${ok?`<button type="button" class="account-primary" data-lab-next>${index===4?'Посмотреть в микроскоп':'Завершить настройку этапа →'}</button>`:''}`;
        box.querySelector('[data-lab-next]')?.addEventListener('click',()=>{if(!passed)return;passed=false;index++;locked=false;missed=false;draw();});
      });
    }
    function observe(){
      const sample=samples[chosen],statusNode=root.querySelector('.game-save-status');
      root.innerHTML=`<section class="microscope-lab lab-observation">${progress()}<div class="lab-unlocked"><div><p class="eyebrow">Все 5 этапов завершены</p><h2>Микромир открыт!</h2></div><span>${correct} / 5<br><small>с первой попытки</small></span></div><div class="lab-sample-tabs" aria-label="Выбор образца">${sampleIds[topic].map(id=>`<button type="button" data-lab-sample="${id}" aria-pressed="${id===chosen}">${esc(samples[id].name)}</button>`).join('')}</div><div class="lab-observation-grid"><section class="lab-view-panel"><div class="lab-eyepiece"><div class="lab-optics">${specimenSvg(chosen)}</div></div><p class="lab-model-note">Учебная модель · цвета и размеры условные</p><div class="lab-controls"><label>Резкость<input type="range" min="0" max="100" value="35" data-lab-focus><output data-focus-status>Настрой резкость</output></label><label>Освещение<input type="range" min="20" max="100" value="70" data-lab-light></label><label>Масштаб схемы<input type="range" min="100" max="180" value="100" data-lab-zoom><output data-zoom-status>100%</output></label></div></section><section class="lab-notebook"><span class="lab-tag">${esc(sample.tag)}</span><h3>${esc(sample.name)}</h3><p>${esc(sample.about)}</p><h4>Что здесь можно изучить</h4><div class="lab-feature-buttons">${sample.features.map(([id,label],i)=>`<button type="button" data-lab-feature="${id}">${i+1}. ${esc(label)}</button>`).join('')}</div><div class="lab-detail" aria-live="polite">Нажми на название детали — она подсветится на схеме.</div>${chosen==='bacteria'?'<p class="form-hint">ДНК и отсутствие ядерной оболочки нельзя различить на такой схеме форм бактерий. Об устройстве прокариот рассказывает текст темы.</p>':''}<a class="lab-topic-link" target="_blank" rel="noopener noreferrer" href="#lesson-${sample.topic}/terms">Словарик темы § ${sample.topic} ↗</a></section></div><div class="lab-bottom"><p class="game-save-status" role="status"></p><button class="account-button" type="button" data-lab-restart>Настроить заново</button></div></section>`;
      if(statusNode)root.querySelector('.game-save-status').replaceWith(statusNode);
      const svg=root.querySelector('.lab-specimen'),optics=root.querySelector('.lab-optics');
      function adjust(){const focus=Number(root.querySelector('[data-lab-focus]').value),light=Number(root.querySelector('[data-lab-light]').value),zoom=Number(root.querySelector('[data-lab-zoom]').value);optics.style.filter=`blur(${Math.abs(focus-70)/9}px) brightness(${light/80+.15})`;svg.style.transform=`scale(${zoom/100})`;root.querySelector('[data-focus-status]').textContent=Math.abs(focus-70)<=4?'✓ Изображение чёткое':'Подбери положение, при котором детали чёткие';root.querySelector('[data-zoom-status]').textContent=zoom+'%';}
      root.querySelectorAll('.lab-controls input').forEach(input=>input.oninput=adjust);adjust();
      root.querySelectorAll('[data-lab-feature]').forEach(button=>button.onclick=()=>{
        const [id,label,description]=sample.features.find(f=>f[0]===button.dataset.labFeature);
        root.querySelectorAll('[data-lab-feature]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
        svg.querySelectorAll('[data-part]').forEach(part=>part.classList.toggle('lab-part-active',part.dataset.part===id));
        root.querySelector('.lab-detail').innerHTML=`<strong>${esc(label)}</strong><p>${esc(description)}</p>`;
      });
      root.querySelectorAll('[data-lab-sample]').forEach(button=>button.onclick=()=>{chosen=button.dataset.labSample;observe();});
      root.querySelector('[data-lab-restart]').onclick=()=>microscopeGame(topic,root,homework,onFinish);
      if(!saved){saved=true;onFinish?.({homeworkId:homework.id,game:'microscope',topicId:topic,score:correct*20,correct,wrong:5-correct});}

    }
    setup();
  }
  Object.assign(G,{microscopeGame,microscopeTopics:Object.keys(questions).map(Number)});
})();
