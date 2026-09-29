(() => {
  const chapterTerms = [
    [['Биология','Наука, изучающая живую природу.'],['Организм','Живое существо, части которого работают согласованно.'],['Природа','Мир живых существ и неживых тел вокруг нас.'],['Клетка','Наименьшая структурная единица большинства организмов.'],['Рост','Увеличение размеров и массы организма.'],['Развитие','Изменение организма в течение жизни.'],['Обмен веществ','Поступление, превращение и выделение веществ.'],['Раздражимость','Способность отвечать на изменения среды.'],['Размножение','Образование организмом потомства.'],['Среда','Условия и объекты, окружающие организм.'],['Вещество','То, из чего состоят тела.'],['Энергия','То, что необходимо для процессов жизнедеятельности.'],['Живое','Организмы и их части.'],['Неживое','Тела и явления природы, не являющиеся организмами.'],['Признак','Особенность, по которой можно описать или сравнить объект.']],
    [['Наблюдение','Изучение объекта без намеренного изменения условий.'],['Эксперимент','Проверка предположения при целенаправленном изменении условия.'],['Гипотеза','Проверяемое предположение, объясняющее явление.'],['Измерение','Определение численного значения величины.'],['Величина','Свойство, которое можно выразить числом и единицей.'],['Единица','Принятая мера для записи значения величины.'],['Шкала','Последовательность отметок прибора для измерений.'],['Цена деления','Разность значений соседних отметок шкалы.'],['Результат','То, что получено в ходе исследования.'],['Вывод','Ответ на вопрос исследования по его результатам.'],['Модель','Упрощённое представление объекта или процесса.'],['Объект','То, что изучают в исследовании.'],['Метод','Способ получения ответа на вопрос.'],['Контроль','Сравнение, помогающее оценить действие фактора.'],['Данные','Записанные наблюдения и результаты измерений.']],
    [['Клетка','Наименьшая структурная единица организма.'],['Ткань','Группа сходных клеток, совместно выполняющих работу.'],['Орган','Часть организма с определённым строением и функцией.'],['Организм','Живое существо, состоящее из взаимосвязанных частей.'],['Мембрана','Граница клетки, регулирующая обмен со средой.'],['Цитоплазма','Внутренняя среда клетки, где расположены её структуры.'],['Ядро','Структура клетки с основной частью наследственной информации.'],['Хлоропласт','Структура растительной клетки, где идёт фотосинтез.'],['Вакуоль','Полость растительной клетки с клеточным соком.'],['Фотосинтез','Образование органических веществ на свету.'],['Грибница','Тело гриба из тонких ветвящихся нитей.'],['Спора','Клетка или структура, служащая для размножения и расселения.'],['Бактерия','Одноклеточный организм без оформленного ядра.'],['Вирус','Неклеточный объект, размножающийся внутри клетки-хозяина.'],['Вид','Основная единица классификации живых организмов.']],
    [['Среда обитания','Окружение организма, влияющее на его жизнь.'],['Фактор','Условие или воздействие, влияющее на организм.'],['Адаптация','Особенность, помогающая жить в определённых условиях.'],['Оптимум','Наиболее благоприятное значение фактора для организма.'],['Планктон','Организмы, переносимые главным образом течениями.'],['Нектон','Водные животные, активно плавающие против течения.'],['Бентос','Организмы, связанные с дном водоёма.'],['Жабры','Органы газообмена у многих водных животных.'],['Устьица','Отверстия в листе, через которые идут газообмен и испарение.'],['Испарение','Переход воды из жидкого состояния в пар.'],['Почва','Верхний слой суши, где живут многие организмы.'],['Гумус','Органические вещества почвы, образовавшиеся при разложении остатков.'],['Паразит','Организм, живущий за счёт хозяина и причиняющий ему вред.'],['Миграция','Закономерное перемещение организмов между территориями.'],['Фенология','Наука о сезонных явлениях и сроках их наступления.']],
    [['Сообщество','Популяции разных видов, живущие вместе и взаимодействующие.'],['Популяция','Группа особей одного вида на общей территории.'],['Экосистема','Сообщество организмов вместе с неживой средой и связями.'],['Конкуренция','Соперничество за ограниченный общий ресурс.'],['Ярусность','Расположение организмов на разных уровнях пространства.'],['Производитель','Организм, образующий органические вещества из неорганических.'],['Потребитель','Организм, использующий готовые органические вещества.'],['Разлагатель','Организм, разрушающий остатки до более простых веществ.'],['Пищевая цепь','Последовательность организмов, связанных питанием.'],['Пищевая сеть','Переплетение нескольких пищевых цепей.'],['Детрит','Мёртвые органические остатки и их частицы.'],['Подстилка','Слой отмерших растительных остатков на почве.'],['Севооборот','Плановое чередование культур на поле.'],['Сообщество','Совокупность взаимодействующих организмов разных видов.'],['Круговорот','Повторное перемещение вещества между организмами и средой.'],['Местообитание','Место и условия, в которых живёт организм.']],
    [['Биоразнообразие','Разнообразие живых организмов и экосистем.'],['Красная книга','Сведения о редких видах и угрозах их исчезновения.'],['Заповедник','Охраняемая территория для сохранения природных комплексов.'],['Охрана природы','Действия по сохранению видов, мест обитания и природных связей.'],['Загрязнение','Изменение среды веществами или воздействиями, вредящими организмам.'],['Фрагментация','Разделение местообитания на отдельные участки.'],['Эвтрофикация','Обогащение водоёма питательными веществами с чрезмерным ростом водорослей.'],['Инвазивный вид','Чужеродный вид, угрожающий местным экосистемам.'],['Восстановление','Возвращение нарушенных условий и связей экосистемы.'],['Биотехнология','Использование организмов или клеток для получения полезных продуктов.'],['Селекция','Создание и улучшение сортов, пород и штаммов.'],['Сорт','Группа культурных растений с общими наследственными признаками.'],['Заповедание','Охрана территории с ограничением вредной деятельности.'],['Местообитание','Место и условия, в которых живёт организм.'],['Экосистема','Организмы и неживая среда, связанные обменом веществ и энергии.']]
  ];
  const cleanAnswer = s => s.toLocaleUpperCase('ru-RU').replace(/Ё/g,'Е').replace(/[^А-Я]/g,'');
  const shuffle = values => { const a=[...values]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
  function poolFor(lesson) {
    const base = chapterTerms[lesson.chapter] || chapterTerms[0];
    const custom = (lesson.terms || []).map(([term, clue]) => [term, clue]);
    const related = LESSONS.filter(item => item.chapter === lesson.chapter && item.id !== lesson.id).flatMap(item => item.terms || []);
    const merged = [...custom, ...related, ...base];
    const unique = [], seen = new Set();
    for (const [answer, clue] of merged) { const key=cleanAnswer(answer); if(key.length<3||key.length>22||seen.has(key)) continue; seen.add(key); unique.push({answer, clue}); }
    return unique.slice(0,15);
  }
  const banks = Object.fromEntries(LESSONS.map(lesson => [lesson.id, poolFor(lesson)]));

  function truthQuestions(lessonId) {
    const bank=banks[lessonId], terms=shuffle(bank).slice(0,10);
    const offset=1+Math.floor(Math.random()*(bank.length-1));
    return shuffle(terms.flatMap(item=>[
      {text:`${item.answer}: ${item.clue}`,answer:true},
      {text:`${item.answer}: ${bank[(bank.indexOf(item)+offset)%bank.length].clue}`,answer:false}
    ]));
  }
  function crosswordVariant(lessonId) {
    const source=shuffle(banks[lessonId]);
    const variants=[source.slice(0,10),source.slice(5,15),[...source.slice(0,5),...source.slice(10,15)]];
    const variant=1+Math.floor(Math.random()*variants.length);
    return {variant,words:shuffle(variants[variant-1]).map(x=>({answer:cleanAnswer(x.answer),clue:x.clue}))};
  }
  function statementGame(lessonId, root, homework, onFinish) {
    const questions=truthQuestions(lessonId);
    let index=0,correct=0,answers=[];
    function draw(){
      if(index>=questions.length){
        const score=Math.round(correct/questions.length*100);
        root.innerHTML=`<div class="game-finish"><p class="eyebrow">Правда или ложь · § ${lessonId}</p><h3>${correct} из ${questions.length} · ${score}%</h3><p>${score>=80?'Отличная работа!':score>=50?'Хороший результат — посмотри разбор.':'Повтори тему и попробуй ещё раз.'}</p><div class="game-review">${answers.filter(a=>!a.ok).map(a=>`<p><strong>${a.ok===false?'Неверно':''}</strong> ${escapeHTML(a.text)}<br><small>Правильный ответ: ${a.truth?'Верно':'Неверно'}</small></p>`).join('')||'<p>Ошибок нет — всё верно!</p>'}</div><button class="account-primary" type="button" data-game-restart>Пройти ещё раз</button><p class="game-save-status" role="status">Результат готов к сохранению.</p></div>`;
        onFinish?.({homeworkId:homework.id,game:'truth',topicId:lessonId,score,correct,wrong:questions.length-correct});
        root.querySelector('[data-game-restart]').addEventListener('click',()=>statementGame(lessonId,root,homework,onFinish));
        return;
      }
      const q=questions[index];
      root.innerHTML=`<div class="game-play"><p class="eyebrow">Правда или ложь · вопрос ${index+1} из ${questions.length}</p><div class="game-progress"><span style="width:${index/questions.length*100}%"></span></div><h3>${escapeHTML(q.text)}</h3><div class="game-answers"><button type="button" data-answer="true">Правда</button><button type="button" data-answer="false">Ложь</button></div><p class="game-feedback" aria-live="polite"></p></div>`;
      root.querySelectorAll('[data-answer]').forEach(button=>button.addEventListener('click',()=>{
        const chosen=button.dataset.answer==='true',ok=chosen===q.answer;
        if(ok)correct++;answers.push({text:q.text,truth:q.answer,ok});
        index++;draw();
      }));
    }
    draw();
  }

  function makeGrid(words) {
    const placements=[];
    const grid=new Map();
    const key=(r,c)=>`${r},${c}`;
    function attempt(word,dir,r,c){
      const dr=dir==='down'?1:0,dc=dir==='across'?1:0;
      const cells=Array.from(word,(ch,i)=>({r:r+dr*i,c:c+dc*i,ch}));
      let crosses=0;
      for(const cell of cells){const old=grid.get(key(cell.r,cell.c));if(old){if(old.ch!==cell.ch||old[dir])return null;crosses++;}}
      if(placements.length&&crosses===0)return null;
      const before=grid.get(key(r-dr,c-dc)),after=grid.get(key(r+dr*word.length,c+dc*word.length));if(before||after)return null;
      for(const cell of cells){
        if(grid.has(key(cell.r,cell.c)))continue;
        const neighbors=dir==='across'?[[cell.r-1,cell.c],[cell.r+1,cell.c]]:[[cell.r,cell.c-1],[cell.r,cell.c+1]];
        if(neighbors.some(([nr,nc])=>grid.has(key(nr,nc))))return null;
      }
      return {word,dir,r,c,cells,crosses};
    }
    const first=words[0];placements.push({word:first.word,dir:'across',r:0,c:0,cells:Array.from(first.word,(ch,i)=>({r:0,c:i,ch})),crosses:0});
    for(const cell of placements[0].cells)grid.set(key(cell.r,cell.c),{ch:cell.ch,across:true,down:false});
    for(const item of words.slice(1)){
      const options=[];
      for(const placed of placements)for(const own of placed.cells)for(let i=0;i<item.word.length;i++){
        if(item.word[i]!==own.ch)continue;
        const dir=placed.dir==='across'?'down':'across';
        const r=dir==='down'?own.r-i:own.r,c=dir==='across'?own.c-i:own.c;
        const found=attempt(item.word,dir,r,c);if(found)options.push(found);
      }
      const placed=options.length?options[Math.floor(Math.random()*options.length)]:{word:item.word,dir:'across',r:Math.max(...[...grid.keys()].map(k=>Number(k.split(',')[0])))+3,c:0,cells:Array.from(item.word,(ch,i)=>({r:Math.max(...[...grid.keys()].map(k=>Number(k.split(',')[0])))+3,c:i,ch})),crosses:0};
      placements.push(placed);
      for(const cell of placed.cells){const old=grid.get(key(cell.r,cell.c))||{ch:cell.ch,across:false,down:false};old[placed.dir]=true;grid.set(key(cell.r,cell.c),old);}
    }
    const gridKeys=[...grid.keys()],minR=Math.min(...gridKeys.map(k=>Number(k.split(',')[0]))),maxR=Math.max(...gridKeys.map(k=>Number(k.split(',')[0]))),minC=Math.min(...gridKeys.map(k=>Number(k.split(',')[1]))),maxC=Math.max(...gridKeys.map(k=>Number(k.split(',')[1])));
    return {placements,grid,minR,maxR,minC,maxC};
  }

  function crosswordGame(lessonId,root,homework,onFinish){
    const selected=crosswordVariant(lessonId);
    const puzzle=makeGrid(selected.words.filter(x=>x.answer.length>=3));
    const number=new Map(puzzle.placements.map((p,i)=>[`${p.r},${p.c}`,i+1]));
    const cells=[];
    for(let r=puzzle.minR;r<=puzzle.maxR;r++)for(let c=puzzle.minC;c<=puzzle.maxC;c++){
      const cell=puzzle.grid.get(`${r},${c}`);cells.push(cell?`<label class="cross-cell" style="grid-row:${r-puzzle.minR+1};grid-column:${c-puzzle.minC+1}">${number.has(`${r},${c}`)?`<small>${number.get(`${r},${c}`)}</small>`:''}<input aria-label="Буква кроссворда, строка ${r+1}, столбец ${c+1}" maxlength="1" autocomplete="off" autocapitalize="characters" data-cell="${r},${c}"></label>`:`<span class="cross-cell-empty" style="grid-row:${r-puzzle.minR+1};grid-column:${c-puzzle.minC+1}"></span>`);
    }
    const clues=puzzle.placements.map((p,i)=>`<li><button type="button" data-focus-word="${i}"><b>${i+1}. ${p.dir==='across'?'По горизонтали':'По вертикали'}.</b> ${escapeHTML(p.clue)} <small>(${p.word.length} букв)</small></button></li>`).join('');
    root.innerHTML=`<div class="crossword-play"><p class="eyebrow">Кроссворд · вариант ${selected.variant} · § ${lessonId}</p><p>Впиши ответы в клетки. Можно пользоваться клавиатурой — после буквы курсор перейдёт дальше.</p><div class="crossword-scroll"><div class="crossword-grid" style="grid-template-columns:repeat(${puzzle.maxC-puzzle.minC+1},34px);grid-template-rows:repeat(${puzzle.maxR-puzzle.minR+1},34px)">${cells.join('')}</div></div><div class="crossword-clues"><ol>${clues}</ol></div><div class="game-answers"><button class="account-primary" type="button" data-check-crossword>Проверить</button><button type="button" data-new-crossword>Новый вариант</button><button type="button" data-reveal-crossword>Показать ответы</button></div><p class="crossword-feedback" role="status"></p><p class="game-save-status" role="status"></p></div>`;
    const inputs=[...root.querySelectorAll('[data-cell]')];
    let activePlacement=null;
    root.querySelectorAll('[data-focus-word]').forEach(button=>button.addEventListener('click',()=>{activePlacement=puzzle.placements[Number(button.dataset.focusWord)];const first=activePlacement.cells[0];root.querySelector(`[data-cell="${first.r},${first.c}"]`)?.focus();}));
    const readAnswer=p=>p.cells.map(cell=>root.querySelector(`[data-cell="${cell.r},${cell.c}"]`)?.value||'').join('').toLocaleUpperCase('ru-RU').replace(/Ё/g,'Е');
    let revealed=false;
    const check=()=>{
      if(revealed)return;
      let solved=0;
      puzzle.placements.forEach((p,i)=>{const ok=readAnswer(p)===p.word;if(ok)solved++;for(const cell of p.cells){const input=root.querySelector(`[data-cell="${cell.r},${cell.c}"]`);input?.classList.toggle('correct',ok);input?.classList.toggle('incorrect',!ok);}});
      const score=Math.round(solved/puzzle.placements.length*100);
      root.querySelector('.crossword-feedback').textContent=`Верно заполнено слов: ${solved} из ${puzzle.placements.length} (${score}%).`;
      if(solved===puzzle.placements.length){root.querySelector('.crossword-feedback').textContent+=' Отлично!';}
      root.querySelector('.game-save-status').textContent='Результат готов к сохранению.';
      onFinish?.({homeworkId:homework.id,game:'crossword',topicId:lessonId,score,correct:solved,wrong:puzzle.placements.length-solved});
    };
    root.querySelector('[data-check-crossword]').addEventListener('click',check);
    root.querySelector('[data-new-crossword]').addEventListener('click',()=>crosswordGame(lessonId,root,homework,onFinish));
    root.querySelector('[data-reveal-crossword]').addEventListener('click',()=>{revealed=true;for(const p of puzzle.placements)p.cells.forEach((cell,i)=>{const input=root.querySelector(`[data-cell="${cell.r},${cell.c}"]`);input.value=p.word[i];input.readOnly=true;});root.querySelector('[data-check-crossword]').disabled=true;root.querySelector('[data-reveal-crossword]').disabled=true;root.querySelector('.crossword-feedback').textContent='Ответы показаны. Это задание не будет засчитано.';});
    inputs.forEach(input=>input.addEventListener('input',()=>{input.value=cleanAnswer(input.value).slice(-1);if(input.value){const coordinate=input.dataset.cell;const path=activePlacement?.cells||[];const at=path.findIndex(cell=>`${cell.r},${cell.c}`===coordinate);if(at>=0&&path[at+1])root.querySelector(`[data-cell="${path[at+1].r},${path[at+1].c}"]`)?.focus();else{const idx=inputs.indexOf(input);inputs[idx+1]?.focus();}}}));
    puzzle.placements.forEach(p=>p.cells.forEach((cell,i)=>{const input=root.querySelector(`[data-cell="${cell.r},${cell.c}"]`);input.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!input.value&&i>0){e.preventDefault();root.querySelector(`[data-cell="${p.cells[i-1].r},${p.cells[i-1].c}"]`)?.focus();}});}));
  }

  window.BIOLOGY_GAMES={banks,statementGame,crosswordGame,makeGrid,truthQuestions,crosswordVariant};
})();
